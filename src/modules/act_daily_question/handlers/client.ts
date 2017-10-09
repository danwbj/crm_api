import * as Boom from 'boom'
import * as Sequelize from 'sequelize'
var moment = require('moment');

import config from '../../../config/config'

declare let models: any;

let getActPoint = function (t: any, act_id: number) {
    return models.act.findOne({
        where: {
            id: act_id
        }
    })
}

let getQiestion = function (q: any) {

    return new Promise((resolve, reject) => {
        let options = {
            where: {},
            attributes: ['q', 'id']
        }
        if (q.act_id && q.act_id != '') options.where['act_id'] = q.act_id
        models.act_daily_question.findAll(options).then(questions => {
            let random = Math.floor(Math.random() * questions.length)
            return resolve(questions[random])
        }).catch(err => {
            reject(err)
        })
    })
}

/**
 * 检查答题的正确性
 * @param p post参数
 *
 */
let chkQuestion = function (t, p: any) {
    return new Promise((resolve, reject) => {
        models.act_daily_question.findOne({
            where: {
                id: p._id,
                act_id: p.act_id
            },
            transaction: t
        }).then(question => {
            if (!question) return reject(Boom.badRequest('当前活动下找不到这个题目'))
            // let q = JSON.parse(question.q)
            return resolve(question.q.answer.indexOf(p.answer.trim()) == -1 ? false : true)
        }).catch(err => {
            reject(err)
        })
    })
}
/**
 * 答题增加历史纪录(act_user_point)
 * @param t
 * @param p 参数
 */
let createActUserPoint = function (t, p) {
    return models.act_user_point.create({ type: 'answer', point: p.point, user_id: p.user_id, act_id: p.act_id }, {
        transaction: t
    })
}
/**
 * 答题用户排行表增加point
 * @param t
 * @param p 参数
 */
let upsertActUserPoint = function (t, request, p) {
    return models.act_user_rank.findOne({
        where: { user_id: p.user_id, act_id: p.act_id },
        transaction: t
    }).then(actUserRank => {
        if (actUserRank) {
            return request.getDb().sequelize.query(
                `UPDATE act_user_rank SET point=point +${p.point} WHERE user_id = ? and act_id = ?`,
                {
                    replacements: [p.user_id, p.act_id],
                    type: request.getDb().sequelize.QueryTypes.SELECT,
                    transaction: t
                }
            )
        } else {
            return models.act_user_rank.create({ point: p.point, user_id: p.user_id, act_id: p.act_id }, {
                transaction: t
            })
        }
    })
}
/**
 * 增加树的总point
 * @param t
 * @param p
 */
let updateActPlan = function (t, request, p) {
    return request.getDb().sequelize.query(
        `UPDATE act_plant SET point=point +${p.point} WHERE act_id = ? `,
        {
            replacements: [p.act_id],
            type: request.getDb().sequelize.QueryTypes.SELECT,
            transaction: t
        }
    )
}
/**
 * 检查是否允许答题
 * @param user_id 
 * @param act_id 
 */
let checkQuestion = function (user_id, act_id) {
    return new Promise((resolve, reject) => {
        models.act_user_point.findOne({
            where: {
                type: 'answer',
                user_id: user_id,
                act_id: act_id
            },
            order: [['createdAt', 'desc']],
            limit: 1
        }).then(answer => {
            if (!answer) {
                resolve(true)
            } else {
                if (moment(answer.createdAt).format("YYYY-MM-DD HH:mm:ss") > moment().format("YYYY-MM-DD")) {
                    resolve(false)
                } else {
                    resolve(true)
                }
            }
        }).catch(err => {
            reject(Boom.badRequest('查询答题状态失败'));
        });
    })
}
module.exports.get_qusetion = {
    handler: async function (request, reply) {
        let act_id = request.query.act_id;
        if (!act_id) return reply(Boom.badRequest('无可用题目'))
        try {
            let qusetion: any = await getQiestion(request.query)
            console.log(qusetion.q)
            return reply(qusetion)
        }
        catch (err) {
            return reply(Boom.badRequest(err.message))
        }
    }
}

module.exports.answer_question = {
    handler: function (request, reply) {
        let _id = request.params.id;
        if (!request.session.uid) return reply(Boom.unauthorized('未认证'))
        let user_id = request.session.uid
        let { act_id, answer } = request.payload
        request.getDb().sequelize.transaction(async t => {
            let _point = await getActPoint(t, act_id)
            //检查是否允许答题
            let result = await checkQuestion(user_id, act_id)
            if (result === false) return Boom.badRequest('今天已经答过题了')
            //检查答案是否正确
            let isRight = await chkQuestion(t, { _id, act_id, answer })
            let point = isRight === true ? _point.dataValues.config.correct_answer : _point.dataValues.config.inaccuracy_answer
            let actUserPoint = await createActUserPoint(t, { point, user_id, act_id })
            let actUserRank = await upsertActUserPoint(t, request, { point, user_id, act_id })
            let actPlant = await updateActPlan(t, request, { point, act_id })
            return { isRight: isRight, point: actUserPoint.point }
        }).then(result => {
            return reply(result)
        }).catch(err => {
            console.log('err: ', err);
            return reply(Boom.badRequest(err.message))
        })
    }
}
module.exports.question_status = {
    handler: async function (request, reply) {
        try {
            if (!request.session.uid) return reply(Boom.unauthorized('未认证'))
            let user_id = request.session.uid
            let act_id = request.params.id;
            let result = await checkQuestion(user_id, act_id)
            if (result === false) return reply({ isAnswer: true })
            return reply({ isAnswer: false })
        }
        catch (err) {
            reply(Boom.badRequest('查询答题状态失败'))
        }
    }
}
