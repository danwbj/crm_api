import * as Boom from 'boom'
import * as Sequelize from 'sequelize'
import * as moment from 'moment'
import * as mt from 'moment-timezone'

declare let models: any;

import config from '../../../config/config'

let getActPoint = function (t: any, act_id: number) {
    return models.act.findOne({
        where: {
            id: act_id
        },
        transaction: t
    })
}

let createCheckIn = function (t: any, user_id: number, _actId: number) {
    return new Promise((resolve, reject) => {
        models.act_user_checkin.findOrCreate({
            where: {
                user_id: user_id,
                act_id: _actId,
                date: mt.tz(new Date(), "Asia/Shanghai").format('YYYY-MM-DD'),
            },
            defaults: {
                user_id: user_id,
                act_id: _actId,
                date: mt.tz(new Date(), "Asia/Shanghai").format('YYYY-MM-DD'),
            }
        }).then(check => {
            if (!check[1]) return reject(new Error('当日已签到'))
            return resolve(check)
        }).catch(err => {
            console.log('err: ', err);
            reject(err)
        });
    })
}

let addUserPoint = function (t: any, user_id: number, _actId: number, _point: number) {
    return models.act_user_point.create(
        {
            user_id: user_id,
            act_id: _actId,
            type: 'checkin',
            point: _point
        },
        {
            transaction: t
        }
    )
}

let addUserRank = function (t: any, user_id: number, _actId: number, _point: number) {
    return new Promise((resolve, reject) => {
        models.act_user_rank.findOrCreate({
            where: {
                user_id: user_id
            },
            defaults: {
                user_id: user_id,
                act_id: _actId,
                point: _point
            },
            transaction: t
        }).then(user => {
            if (user[1]) return resolve(user)
            user[0].increment('point', {
                by: _point,
                transaction: t
             })
        }).then(result => {
            return resolve(result)
        }).catch(err => {
            reject(err)
        })
    })
}

let addPlantPoint = function (t: any,request, _actId: number, _point: number) {
    return new Promise((resolve, reject) => {
        models.act_plant.findOne({
            where: {act_id: _actId},
            transaction: t
            }).then(point => {
            point.increment('point', {
                by: _point,
                transaction: t
             }).then(console.log('+++'))
        }).then(result => {
            return resolve(result)
        }).catch(err => {
            reject(err)
        })
    });
}

module.exports.user_checkin = {
    handler: async function (request, reply) {
        const db = request.getDb();
        let _actId = request.payload.act_id;
        if (!request.session.uid) return reply(Boom.unauthorized('未认证'))
        let _userId = request.session.uid
        db.sequelize.transaction(async t => {
            let point = await getActPoint(t, _actId)
            let _point = point.dataValues.config.checkin
            let checkin = await createCheckIn(t, _userId, _actId)
            let userPoint = await addUserPoint(t, _userId, _actId, _point)
            let userRank = await addUserRank(t, _userId, _actId, _point)
            let plant = await addPlantPoint(t, request,_actId, _point)
            return { result: true }
        }).then(result => {
            return reply(result)
        }).catch(err => {
            return reply(Boom.badRequest(err.message))
        })
    }
}
module.exports.checkin_status = {
    handler: async function (request, reply) {
        if (!request.session.uid) return reply(Boom.unauthorized('未认证'))
        let user_id = request.session.uid
        let act_id = request.params.id
        models.act_user_checkin.findOne({
            where: {
                date: mt.tz(new Date(), "Asia/Shanghai").format('YYYY-MM-DD'),
                user_id: user_id,
                act_id: act_id
            },
        }).then(checkin => {
            reply({ isCheckin: checkin ? true : false })
        }).catch(err => {
            reply(Boom.badRequest('查询签到状态失败'))
        })

    }
}
