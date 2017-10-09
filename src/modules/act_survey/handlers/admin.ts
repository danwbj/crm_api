import * as Boom from 'boom'
import * as _ from 'lodash'
import * as nodeExcel from 'excel-export'
import * as moment from 'moment-timezone';

import config from '../../../config/config'

declare let models: any;

let getSurvey = function (t: any, act_id: number) {
    let options = {
        where: {
            act_id: act_id
        },
    }
    if (t) options['transaction'] = t
    return models.act_survey.findOne(options)
}
let getAnswers = (act_id) => {
    return models.act_survey_answer.findAll({
        where: {
            act_id
        },
        include: [{
            model: models.user,
            attributes: ['openid', 'nickname']
        }]

    })
}
let getAnswersPage = (request) => {
    let query = request.query
    let options = {
        where: {
            act_id: request.params.act_id,
            createdAt: {
                $gte: new Date('1970-01-01 01:00:00').toISOString(),
                $lte: new Date('3000-01-01 01:00:00').toISOString()
            }
        },
        limit: 10,
        offset: 0,
        order: [['createdAt', 'desc']]
    }
    if (query.filter_start_time && query.filter_start_time != '') {
        options.where.createdAt['$gte'] = new Date(query.filter_start_time).toISOString()
    }
    if (query.filter_end_time && query.filter_end_time != '') {
        options.where.createdAt['$lte'] = new Date(query.filter_end_time).toISOString()
    }
    if (query.sort && query.sort != '') {
        options.order[0] = _.split(query.sort, ' ');
    }
    if (query.page_size && query.page_size != '') {
        options.limit = query.page_size;
    }
    if (query.page_num && query.page_num != '') {
        options.offset = query.page_num * options.limit;
    }
    return models.act_survey_answer.findAndCount(options)
}
let getAnswersInfo = (id) => {

    let options = {
        where: {
            id: id
        },
    }
    return models.act_survey_answer.findOne(options)
}
let calculateAverageTime = (answers) => {
    let times = 0
    answers.forEach(item => {
        times = times + (item.time_end - item.time_start)
    })
    let t = (times / answers.length)
    //计算出相差天数
    var days = Math.floor(t / (24 * 3600 * 1000))

    //计算出小时数

    var leave1 = t % (24 * 3600 * 1000)    //计算天数后剩余的毫秒数
    var hours = Math.floor(leave1 / (3600 * 1000))
    //计算相差分钟数
    var leave2 = leave1 % (3600 * 1000)        //计算小时数后剩余的毫秒数
    var minutes = Math.floor(leave2 / (60 * 1000))


    //计算相差秒数
    var leave3 = leave2 % (60 * 1000)      //计算分钟数后剩余的毫秒数
    var seconds = Math.round(leave3 / 1000)
    let s = {
        days,
        hours,
        minutes,
        seconds
    }
    return s
}
let getRecycleStatisticsByCreatedAt = (request, act_id) => {
    return request.getDb().sequelize.query(
        `select to_char("createdAt", 'yyyy-mm-dd') as time,count(*) as counts from act_survey_answer where act_id = ? group by to_char("createdAt", 'yyyy-mm-dd')`,
        {
            replacements: [act_id],
            type: request.getDb().sequelize.QueryTypes.SELECT,
        }
    )
}

let updateSurvey = function (t: any, act_id: number, title, prefix) {
    return models.act_survey.update({ title, prefix }, {
        where: { act_id: act_id },
        transaction: t,
        returning: true
    })
}

let removeSurveyQuestions = function (act_id: number) {
    return models.act_survey_question.destroy({ where: { act_id } })
}

let removeSurveyAnswers = function (act_id: number) {
    return models.act_survey_answer.destroy({ where: { act_id } })
}

let createSurveyQuestions = function (t: any, act_id: number, act_survey_id: number, questions: Array<Object>) {
    let records: any = questions.map((item: any) => {
        item.act_id = act_id
        item.act_survey_id = act_survey_id
        return item
    })
    return models.act_survey_question.bulkCreate(records, {
        transaction: t
    })
}

let getSurveyQuestion = function (t: any, act_id: number) {
    let options = {
        where: {
            act_id: act_id
        },
    }
    if (t) options['transaction'] = t
    return models.act_survey_question.findAll(options)
}
let update_survey = function (act_id, obj) {
    return models.act_survey.update(obj, { where: { act_id }, returning: true })
}
let exportAnswers = (request, list, ks) => {
    var conf: any = {};
    // conf.stylesXmlFile = "styles.xml";
    conf.name = "mysheet";
    conf.cols = [
        {
            caption: "开始答题时间"
        },
        {
            caption: "结束答题时间"
        },
        {
            caption: "答题人昵称"
        },
        {
            caption: "答题人openid"
        }

    ]
    ks.forEach(item => {
        conf.cols.push({
            caption: item.title,
        })
    })
    conf.rows = []
    list.forEach(item => {
        let arr = [moment.tz(item.time_start, "Asia/Shanghai").format('YYYY-MM-DD HH:mm:ss'), moment.tz(item.time_end, "Asia/Shanghai").format('YYYY-MM-DD HH:mm:ss'), item.nickname, item.openid]
        ks.forEach(k => {
            let obj = _.find(item.questions, { id: k.id });
            if (obj) {
                let option
                switch (obj.type) {
                    case 'radio':
                    case 'select':
                        option = _.find(obj.options, { checked: 1 });
                        arr.push(option ? option.text.toString() : '')
                        break;
                    case 'checkbox':
                        option = _.filter(obj.options, { checked: 1 });
                        let text = ''
                        option.map(item => {
                            text = text + '|' + item.text
                        })
                        arr.push(text)
                        break;
                    case 'textarea':
                    case 'text':
                    case 'star':
                        arr.push(obj.text.toString())
                        break;
                    default:
                        arr.push("不支持的数据类型")
                }
            } else {
                arr.push('')
            }
        })
        conf.rows.push(arr)
    })

    var result = nodeExcel.execute(conf);
    request.raw.res.setHeader('Content-Type', 'application/vnd.openxmlformats');
    request.raw.res.setHeader("Content-Disposition", "attachment; filename=" + "report.xlsx");
    request.raw.res.end(result, 'binary');

}
module.exports.survey_info = {
    handler: async function (request, reply) {
        let act_id = request.params.act_id
        let answers = await getAnswers(act_id)
        request.getDb().sequelize.transaction(async t => {
            let actSurvey = await getSurvey(t, act_id)
            actSurvey = JSON.parse(JSON.stringify(actSurvey));
            let actSurveyQuestions = await getSurveyQuestion(t, act_id)
            actSurveyQuestions = JSON.parse(JSON.stringify(actSurveyQuestions));
            actSurveyQuestions = _.groupBy(actSurveyQuestions, 'page');
            let pages = []
            let index = 0
            _.map(actSurveyQuestions, (value, key) => {
                let page = { id: key, questions: value, index: index }
                pages.push(page)
                index++
            })
            actSurvey.pages = pages
            //回收量
            actSurvey.recycle = answers.length
            return actSurvey
        }).then(result => {
            return reply(result)
        }).catch(err => {
            return reply(Boom.badRequest(err.message))
        })

    }
}

module.exports.create_survey = {
    handler: async function (request, reply) {
        let act_id = request.params.act_id
        let questions = []
        _.map(request.payload.pages, (page) => {
            _.map(page.questions, (question) => {
                question.page = page.id
                questions.push(question)
            })
        })
        let { title, prefix } = request.payload
        let rm = await removeSurveyQuestions(act_id)
        let ra = await removeSurveyAnswers(act_id)
        request.getDb().sequelize.transaction(async t => {
            let actSurvey = await updateSurvey(t, act_id, title, prefix)
            let act_survey_id = actSurvey[1][0].id
            let survey_questions = await createSurveyQuestions(t, act_id, act_survey_id, questions)
            // actSurvey = actSurvey[1][0]
            // actSurvey = JSON.parse(JSON.stringify(actSurvey));
            // survey_questions = _.groupBy(survey_questions, 'page');
            // let pages = []
            // let index = 0
            // _.map(survey_questions, (value, key) => {
            //     let page = { id: key, questions: value, index: index }
            //     pages.push(page)
            //     index++
            // })
            // actSurvey.pages = pages
            return actSurvey
        }).then(result => {
            return reply(result)
        }).catch(err => {
            return reply(Boom.badRequest(err.message))
        })
    }
}

module.exports.survey_statistics = {
    handler: async function (request, reply) {
        try {
            let act_id = request.params.act_id
            let data: any = {}
            //浏览量
            let _survey = await getSurvey(null, act_id)
            if (!_survey) return Boom.badRequest('找不到问卷活动')
            data.scan_count = _survey.scan_count

            //回收量
            let answers = await getAnswers(act_id)
            data.recycle = answers.length

            //回收率
            data.recycle_rate = ((data.recycle / data.scan_count) * 100).toFixed(2) + '%'

            //平均答题时间
            let average_time = calculateAverageTime(answers)
            data.average_time = average_time

            //问卷回收量按时间轴统计图表
            let list = await getRecycleStatisticsByCreatedAt(request, act_id)
            data.recycle_time_list = list
            return reply(data)
        }
        catch (err) {
            return reply(Boom.badRequest(err.message))
        }
    }
}

module.exports.answers_list = {
    handler: async function (request, reply) {
        try {
            let data: any = {}
            let act_id = request.params.act_id
            let actSurveyQuestions = await getSurveyQuestion(null, act_id)
            data.q = actSurveyQuestions
            let answers = await getAnswersPage(request)
            data.a = answers
            return reply(data)
        }
        catch (err) {
            console.log('err: ', err);
            return reply(Boom.badRequest('获取样本数据失败'))
        }
    }
}

module.exports.answers_info = {
    handler: async function (request, reply) {
        try {
            let data: any = {}
            let act_id = request.params.act_id
            let id = request.params.id
            let actSurveyInfo = await getSurvey(null, act_id)
            data.i = actSurveyInfo
            let actSurveyQuestions = await getSurveyQuestion(null, act_id)
            data.q = actSurveyQuestions
            let answer = await getAnswersInfo(id)
            data.a = answer
            return reply(data)
        }
        catch (err) {
            console.log('err: ', err);
            return reply(Boom.badRequest('获取样本数据失败'))
        }
    }
}
module.exports.survey_style_update = {
    handler: async function (request, reply) {
        try {
            let result = await update_survey(request.params.act_id, { style: request.payload.style })
            if (!result || result[0] === 0) return reply(Boom.badRequest('找不到活动记录'))
            return reply(result[1][0])
        }
        catch (err) {
            return reply(Boom.badRequest('编辑样式信息失败'))
        }
    }
}
module.exports.survey_status_update = {
    handler: async function (request, reply) {
        try {
            let result = await update_survey(request.params.act_id, { status: request.payload.status })
            if (!result || result[0] === 0) return reply(Boom.badRequest('找不到活动记录'))
            return reply(result[1][0])
        } catch (err) {
            return reply(Boom.badRequest('编辑样式信息失败'))
        }
    }
}
module.exports.answer_export = {
    handler: async function (request, reply) {
        try {
            let actSurveyQuestions = await getSurveyQuestion(null, request.params.act_id)
            let answers = await getAnswers(request.params.act_id)
            let list = []
            answers.forEach(item => {
                let obj: any = {}
                obj.id = item.id
                obj.time_start = item.time_start
                obj.time_end = item.time_end
                obj.channel = item.channel
                obj.questions = []
                obj.nickname = item.user ? item.user.nickname : ''
                obj.openid = item.user ? item.user.openid : ''
                item.answer.forEach(item_a => {
                    item_a.questions.forEach(q => {
                        q.page_id = item_a.id
                        obj.questions.push(q)
                    })
                })
                list.push(obj)
            })
            let result = await exportAnswers(request, list, actSurveyQuestions)
        }
        catch (err) {
            console.log('err: ', err);
            return reply(Boom.badRequest('导出失败'))
        }
    }
}
