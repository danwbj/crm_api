import * as Boom from 'boom'
import * as async from 'async'
import * as superagent from 'superagent'
import * as _ from 'lodash'
import config from '../../../config/config'
const clients = config.clients
// const redis = config.redis
declare var models: any;

module.exports.auth = {
    handler: function (request, reply) {
        let callback = request.query.callback
        let client = request.query.client
        let channel = request.query.channel
        if (!callback || !client || (client && !clients[client])) {
            return reply(Boom.badRequest('invalid query'))
        }
        request.session.callback = decodeURIComponent(callback)
        request.session.client = client
        request.session.channel = channel
        var url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${clients[client].appid}&redirect_uri=${encodeURIComponent(clients[client].wx_redirect_uri)}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`
        reply.redirect(url)
    }
}
module.exports.oauthResponse = {
    handler: function (request, reply) {
        let callback = request.session.callback
        let client = request.session.client
        let channel = request.session.channel
        let code = request.query.code

        // var redisClient = request.server.plugins['hapi-redis'].client
        // let dataFromRedis = (cb) => {
        //     let redisdata = {}
        //     redisClient.get(`${client}:access_token`, (err, access_token) => {
        //         if (!err && access_token) {
        //             (<any>redisdata).access_token = access_token
        //         }
        //         // redisClient.get('openid', (err, openid) => {
        //         //     if (!err && openid) {
        //         //         (<any>redisdata).openid = openid
        //         //     }
        //         //     cb(redisdata)
        //         // })
        //     })
        // }
        let getAccessTokenByCode = ((cb) => {
            // let redisdata = dataFromRedis(redisdata => {
            // if (redisdata.access_token && redisdata.openid) {
            //     cb(null, { access_token: redisdata.access_token, openid: redisdata.openid })
            // } else {
            if (!code) {
                return cb('get access_token fail , no code parameter', null)
            }
            let url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${clients[client].appid}&secret=${clients[client].secret}&code=${code}&grant_type=authorization_code`
            let req = superagent.get(url)
            req.timeout(10000)
            req.end((err, res) => {
                if (err) {
                    cb('get access_token fail', null)
                } else if (JSON.parse(res.text).errcode) {
                    cb(JSON.parse(res.text).errmsg, null)
                } else {
                    let access_token = JSON.parse(res.text).access_token
                    let expires_in = JSON.parse(res.text).expires_in
                    let openid = JSON.parse(res.text).openid
                    // redisClient.set(`${client}:access_token`, access_token) //将access_token存储到redis
                    // redisClient.expire(`${client}:access_token`, expires_in) //将access_token存储到redis
                    // redisClient.set('openid', openid) //将openid存储到redis
                    cb(null, { access_token: access_token, openid: openid })
                }
            })
            // }
            // })


        })
        
        let getUserFromWX = ((obj, cb) => {
            if (!obj.access_token || !obj.openid) {
                return cb('get userinfo fail from wx , parameter error', null)
            }
            let url = `https://api.weixin.qq.com/sns/userinfo?access_token=${obj.access_token}&openid=${obj.openid}&lang=zh_CN `
            let req = superagent.get(url)
            req.timeout(10000)
            req.end((err, res) => {
                if (err) {
                    cb('get userinfo fail', null)
                } else if (JSON.parse(res.text).errcode) {
                    cb(JSON.parse(res.text).errmsg, null)
                } else {
                    let client = request.session.client
                    let channel = request.session.channel
                    if (!client) {
                        return cb('get userinfo fail,parameter error')
                    }
                    let userinfo = JSON.parse(res.text)
                    let data = {
                        ...userinfo,
                        client: client,
                    }
                    data.channel = channel ? [channel] : []
                    data.access_token = obj.access_token
                    cb(null, data)
                }
            })

        })
        //fix channel
        let fixdata = ((obj, cb) => {
            models.user.findOne({ where: { openid: obj.openid } }).then(user => {
                if (user) {
                    obj.channel = _.uniq(_.concat(user.channel,obj.channel))
                } 
                cb(null,obj)
            })
        })
        //根据openid创建或者更新user表
        let saveOrUpdateUser = ((obj, cb) => {
            models.user.upsert(obj).then(result => {
                models.user.findOne({ where: { openid: obj.openid } }).then(user => {
                    user.access_token = obj.access_token
                    cb(null, user)
                }).catch(err => {
                    cb('findOne userinfo fail', null)
                })
            }).catch(err => {
                cb('upsert userinfo fail', null)
            })

        })
        let fixcallback = (data, callbackstr) => {
            let gourl_arr = callbackstr.split('#')
            let gourl = callbackstr
            if (gourl_arr.length == 2) {
                if (gourl.indexOf('?') > 0) {
                    gourl = `${gourl_arr[0]}&openid=${data.openid}&access_token=${data.access_token}&nickname=${data.nickname}&headimgurl=${data.headimgurl}#${gourl_arr[1]}`
                } else {
                    gourl = `${gourl_arr[0]}?openid=${data.openid}&access_token=${data.access_token}&nickname=${data.nickname}&headimgurl=${data.headimgurl}#${gourl_arr[1]}`
                }
            } else {
                if (gourl.indexOf('?') > 0) {
                    gourl = `${gourl}&openid=${data.openid}&access_token=${data.access_token}&nickname=${data.nickname}&headimgurl=${data.headimgurl}`
                } else {
                    gourl = `${gourl}?openid=${data.openid}&access_token=${data.access_token}&nickname=${data.nickname}&headimgurl=${data.headimgurl}`
                }
            }
            return gourl
        }
        async.waterfall([getAccessTokenByCode, getUserFromWX, fixdata, saveOrUpdateUser], function (err, result) {
            if (err) {
                return reply(Boom.badRequest(err))
            }
            let parms = {
                openid: result.openid,
                nickname: new Buffer(result.nickname).toString('base64'),
                headimgurl: encodeURIComponent(result.headimgurl),
                access_token: result.access_token,
            }
            let url = fixcallback(parms, request.session.callback)
            console.log('url: ', url);
            reply.redirect(url)
        })


    }
}
module.exports.findUserByOpenid = {
    handler: function (request, reply) {
        let openid = request.query.openid
        if (!openid) {
            return reply(Boom.badRequest('invalid query'))
        }
        models.user.findOne({ where: { openid: openid } }).then(user => {
            reply(user)
        }).catch(err => {
            reply(err)
        })
    }
}
