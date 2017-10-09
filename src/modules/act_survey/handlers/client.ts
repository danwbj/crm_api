import * as Boom from 'boom'
import * as _ from 'lodash'

declare let models: any;
let getSurvey = function (t: any, act_id: number) {
    return models.act_survey.findOne({
        where: {
            act_id: act_id
        },
        transaction:t
    })
}
let getSurveyQuestion = function (t: any, act_id: number) {
    return models.act_survey_question.findAll({
        where: {
            act_id: act_id
        },
        transaction:t
    })
}
// let getAnswerByUserIdAndActId = function (t, user_id, act_id) {
//     return models.act_survey_answer.findOne({
//         where: {
//             act_id,
//             user_id
//         },
//         transaction:t
//     })
// }
let updateSurveyScanCount = (request, t, act_id) => {
    return request.getDb().sequelize.query(
        `UPDATE act_survey SET scan_count=scan_count +1 WHERE act_id = ?`,
        {
            replacements: [act_id],
            transaction: t,
        }
    )
}
let create_answer = function (t, obj) {
    return models.act_survey_answer.create(obj, {
        transaction:t
    })
    
}
let getSurveyByActId = (t, act_id) => {
    return models.act_survey.findOne({
        where: { act_id },
        transaction:t
    })
}
// let getAnswerBySurveyAndUserId = (t, act_survey_id, user_id) => {
//     return models.act_survey_answer.findOne({
//         where: {
//             act_survey_id,
//             user_id
//         },
//         transaction:t
//     })
// }
module.exports.survey_info = {
    handler: function (request, reply) {
        if (!request.session.uid) return reply(Boom.unauthorized('未认证'))
        let act_id = request.params.act_id
        request.getDb().sequelize.transaction(async t => {
            //浏览数+1
            let u_survey = await updateSurveyScanCount(request, t, act_id)
            let actSurvey:any = await getSurvey(t,act_id)
            let actSurveyQuestions = await getSurveyQuestion(t, act_id)
            actSurveyQuestions = _.groupBy(actSurveyQuestions, 'page');
            let pages = []
            let index = 0
            _.map(actSurveyQuestions, (value, key) => {
                let page = { id: key, questions: value, index: index }
                pages.push(page)
                index++
            })
            actSurvey.dataValues.pages = pages
            actSurvey.scan_count++
            // let isExistAnswer = await getAnswerBySurveyAndUserId(t, actSurvey.id, request.session.uid)
            // actSurvey.dataValues.isAnswer = isExistAnswer?true:false
            return actSurvey
        }).then(result => {
            //开始答题时间存储到session
            request.session.time_start = new Date()
            return reply(result)
        }).catch(err => {
            return reply(Boom.badRequest(err.message))
        })
    }
}
module.exports.answers_create = {
    handler: async function (request, reply) {
        try {
            if (!request.session.uid) return reply(Boom.unauthorized('未认证'))
            if(!request.session.time_start) return reply(Boom.badRequest('提交问卷失败'))
            let act_id = request.params.act_id
            request.getDb().sequelize.transaction(async t => {
                let survey = await getSurveyByActId(t, act_id)
                if (!survey) return Boom.badRequest('找不到活动')
                // let isExistSurvey = await getAnswerBySurveyAndUserId(t, survey.id, request.session.uid)
                // if(isExistSurvey) return Boom.badRequest('不可以重复提交')
                let obj = {
                    ...request.payload,
                    user_id: request.session.uid,
                    act_id: act_id,
                    act_survey_id: survey.id,
                    time_end: new Date(),
                    time_start:request.session.time_start
                }
                let result = await create_answer(t,obj)
                return result
            }).then(result => {
                return reply(result)
            }).catch(err => {
                return reply(Boom.badRequest(err.message))
            })
        }
        catch (err) {
            return reply(Boom.badRequest('提交问卷失败'))
        }
    }
}
