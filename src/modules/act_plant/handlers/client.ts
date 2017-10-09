import * as Boom from 'boom'
import * as Sequelize from 'sequelize'
import * as moment from 'moment'
import * as mt from 'moment-timezone'

import config from '../../../config/config'

declare let models: any;

let getActPoint = function (t: any, act_id: number) {
    return models.act.findOne({
        where: {
            id: act_id
        }
    })
}
let getPlantInfo = (request, act_id) => {
    return request.getDb().sequelize.query(
        `select * from act a inner join act_plant ap on ap.act_id = a.id where a.id = ?`,
        {
            replacements: [act_id],
            type: request.getDb().sequelize.QueryTypes.SELECT
        }
    )
}

/**
 * 分享增加历史纪录(act_user_point)
 * @param t
 * @param p 参数
 */
let createActUserPoint = function (t, p) {
    return models.act_user_point.create({ type: p.type, point: p.point, user_id: p.user_id, act_id: p.act_id, ext1: p.help_user }, {
        transaction: t
    })  
}
/**
 * 分享用户排行表增加point
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
 * 检查user_id是否可以助力to_user_id
 * @param act_id 活动id
 * @param user_id 登录用户ID
 * @param to_user_id 被助力用户id 
 */
let checkHelp = function (t, act_id, user_id, to_user_id) {
    return new Promise((resolve, reject) => {
        models.act_user_help.findOne({
            where: {
                user_id: user_id,
                to_user_id: to_user_id,
                act_id: act_id,
                date: mt.tz(new Date(), "Asia/Shanghai").format('YYYY-MM-DD'),
            },
            transaction: t
        }).then(result => {
            resolve(result ? false : true)
        }).catch(err => {
            reject(err)
        })
    })
}
/**
 * 保存助力历史
 * @param t 
 * @param p 参数 
 */
let createActUserHelp = function (t, p) {
    return models.act_user_help.create({
        point: p.point,
        user_id: p.user_id,
        to_user_id: p.to_user_id,
        act_id: p.act_id,
        date: mt.tz(new Date(), "Asia/Shanghai").format('YYYY-MM-DD'),
    }, { transaction: t })
}
/**
 * 检查是否允许分享
 * @param t 
 * @param act_id 
 * @param user_id 
 */
let checkShare = function (t, act_id, user_id) {
    return new Promise((resolve, reject) => {
        models.act_user_point.findOne({
            where: {
                // createdAt: {
                //     $gt:Sequelize.literal('current_date')
                // },
                type: 'share',
                user_id: user_id,
                act_id: act_id
            },
            order: [['createdAt', 'desc']],
            limit: 1
        }).then(result => {
            if (!result) {
                return resolve(true)
            } else {
                if (moment(result.createdAt).format("YYYY-MM-DD HH:mm:ss") > moment().format("YYYY-MM-DD")) {
                    return resolve(false)
                } else {
                    return resolve(true)
                }
            }
        }).catch(err => {
            reject(err)
        })
    })
}
module.exports.plant_info = {
    handler: async function (request, reply) {
        let act_id = request.params.act_id
        try {
            let act = await getPlantInfo(request, act_id)
            reply(act[0])
        }
        catch (err) {
            reply(Boom.badRequest('获取活动详情失败'))
        }
    }
}
module.exports.share = {
    handler: async function (request, reply) {
        let act_id = request.params.id
        if (!request.session.uid) return reply(Boom.unauthorized('未认证'))
        let user_id = request.session.uid
        let type = 'share'
        request.getDb().sequelize.transaction(async t => {
            let isAllow = await checkShare(t, act_id, user_id)
            if (isAllow === false) return (Boom.badRequest('今天已经分享过了'))
            let _point = await getActPoint(t, act_id)
            let point = _point.dataValues.config[type]
            let actUserPoint = await createActUserPoint(t, { point, type, user_id, act_id })
            let actUserRank = await upsertActUserPoint(t, request, { point, user_id, act_id })
            let actPlant = await updateActPlan(t, request, { point, act_id })
            return actUserPoint
        }).then(result => {
            return reply(result)
        }).catch(err => {
            console.log('err: ', err);
            return reply(Boom.badRequest(err.message))
        })
    }
}

module.exports.help = {
    handler: async function (request, reply) {
        try {
            let act_id = request.params.act_id
            let to_user_id = request.params.to_user_id
            let help_user = request.payload.help_user
            // request.session.uid = 2030
            if (!request.session.uid) return reply(Boom.unauthorized('未认证'))
            let user_id = request.session.uid
            let type = 'help'
            if (!help_user) return reply(Boom.badRequest('未传递助力人信息'))
            console.log('help_user: ', help_user);
            let result = request.getDb().sequelize.transaction(async t => {
                let isAllow = await checkHelp(t, act_id, user_id, to_user_id)
                if (isAllow === false) return (Boom.badRequest('今天已经为好友助力一次了，不允许再次助力了'))
                let _point = await getActPoint(t, act_id)
                let point = _point.dataValues.config[type]
                //保存助力历史
                let help = await createActUserHelp(t, { point, user_id, to_user_id, act_id })
                let actUserPoint = await createActUserPoint(t, { point: point, type: type, user_id: to_user_id, act_id: act_id, help_user: help_user })
                let actUserRank = await upsertActUserPoint(t, request, { point: point, user_id: to_user_id, act_id: act_id })
                let actPlant = await updateActPlan(t, request, { point, act_id })
                return help
            })
            return reply(result)
        }
        catch (err) {
            console.log('err: ', err);
            return reply(Boom.badRequest('助力失败'))
        }

    }
}
