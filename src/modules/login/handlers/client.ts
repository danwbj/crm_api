import * as Boom from 'boom'
import * as superagent from 'superagent'
import config from '../../../config/config'
declare var models: any;

let vhome_uri = config.vhome_uri
module.exports.corp = {
    handler: function (request, reply) {
        let SESSIONID = request.query.SESSIONID
        let channel = request.query.channel
        let saveOrUpdateUser = ((obj, cb) => {
            models.user.upsert(obj).then(result => {
                models.user.findOne({ where: { openid: obj.openid } }).then(user => {
                    cb(null, user)
                }).catch(err => {
                    cb('findOne userinfo fail', null)
                })
            }).catch(err => {
                cb('upsert userinfo fail', null)
            })

        })
        superagent.get(vhome_uri + '/api/v1/userinfo').set("cookie", "SESSIONID=" + SESSIONID).end((error, user) => {
            if (error || !user.body || user.body.error) {
                // return callback(error, false, null)
                reply(Boom.badRequest('登录失败'))
            } else {
                let openid = user.body.wechat_openid
                // // redisClient.set(state.SESSIONID, JSON.stringify(user.body));
                // // redisClient.expire(state.SESSIONID, 60 * 10);// 保存10分钟
                // // return callback(null, true, user.body)
                let _user = {
                    headimgurl: user.body.portrait,
                    openid: openid,
                    client: user.body.tenant,
                    channel: [channel],
                    nickname: user.body.screen_name,
                    sex: user.body.gender
                }
                saveOrUpdateUser(_user, (err, user) => {
                    if (!err) {
                        request.session.uid = user.id
                        console.log('request.session.uid------------',request.session.uid)
                        reply(user)
                    } else {
                        reply(Boom.badRequest('登录失败'))
                    }
                })
            }
        });
    }
}

module.exports.weixin = {
    handler: function (request, reply) {
        let openid = request.query.openid
        models.user.findOne({ where: { openid: openid } }).then(user => {
            request.session.uid = user.id
            reply(user)
        }).catch(err => {
            reply(Boom.badRequest('登录失败'))
        })
    }
}
