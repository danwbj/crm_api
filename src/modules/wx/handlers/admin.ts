import * as WechatAPI from 'wechat-api'
import * as async from 'async'
import * as Boom from 'boom'
import config from '../../../config/config'
import * as _ from 'lodash'
import { auth, message } from 'node-weixin-api'
const messages = message.messages;
const rreply = message.reply
declare var models: any;

import { fixdata, saveOrUpdateUser, doCommand } from '../utils/index'

const clients = config.clients

declare let cache: any;

let getApi: any = function (client, callback) {

    let api = new WechatAPI(clients[client].appid, clients[client].secret, (cb) => {
        //  读取access_token
        cache.get(`${client}-access_token`, (err, value, cached, log) => {
            if (!err) {
                cb(null, JSON.parse(value))
            }
            cb(null, null)
        });
    }, (token, cb) => {
        //  写入读取access_token 
        cache.set(`${client}-access_token`, JSON.stringify(token), null, (err) => {
        });
    })

    api.registerTicketHandle((type, cb) => {
        // get api ticket
        cache.get(`${client}-api_ticket`, (err, value, cached, log) => {
            if (!err) {
                cb(null, JSON.parse(value))
            }
            cb(null, null)
        });
    }, (type, _ticketToken, cb) => {
        //  set api ticket
        cache.set(`${client}-api_ticket`, JSON.stringify(_ticketToken), null, (err) => {
        });
        cb(null)
    })
    callback(null, api)
}

let getJsConfig = function (api, param) {
    return new Promise((resolve, reject) => {
        api.getJsConfig(param, (err, result) => {
            if (!err) {
                return resolve(result)
            }
            return reject(err)
        })
    })
}

let getWelMsg = function (extra, message) {
    let welmsg = '感谢您的关注'
    if (extra.client && clients[extra.client].welmsg) {
        welmsg = clients[extra.client].welmsg
    }
    var text = rreply.text(message.ToUserName, message.FromUserName, welmsg);
    return text
}

module.exports.jsconfig = {
    handler: function (request, reply) {
        let url = request.payload.url
        let client = request.payload.client
        getApi(client, async (err, api) => {
            let param = {
                debug: false,
                jsApiList: [
                    'onMenuShareTimeline',
                    'onMenuShareAppMessage',
                    'onMenuShareQQ',
                    'onMenuShareWeibo',
                    'onMenuShareQZone',
                    'startRecord',
                    'stopRecord',
                    'onVoiceRecordEnd',
                    'playVoice',
                    'pauseVoice',
                    'stopVoice',
                    'onVoicePlayEnd',
                    'uploadVoice',
                    'downloadVoice',
                    'chooseImage',
                    'previewImage',
                    'uploadImage',
                    'downloadImage',
                    'translateVoice',
                    'getNetworkType',
                    'openLocation',
                    'getLocation',
                    'hideOptionMenu',
                    'showOptionMenu',
                    'hideMenuItems',
                    'showMenuItems',
                    'hideAllNonBaseMenuItem',
                    'showAllNonBaseMenuItem',
                    'closeWindow',
                    'scanQRCode',
                    'chooseWXPay',
                    'openProductSpecificView',
                    'addCard',
                    'chooseCard',
                    'openCard',
                ],
                url: url
            }
            try {
                let result = await getJsConfig(api, param)
                return reply(result)
            } catch (error) {
                return reply(Boom.badRequest('请求JsConfig失败'))
            }
        })
    }
}

module.exports.ack = {
    handler: function (request, reply) {
        // console.log(request);
        let client = request.params.client
        let conf = config.clients[client]

        let data = auth.extract(request.query);
        // console.log(data);
        auth.ack(conf.token, data, function (error, echoStr) {
            if (!error) {
                reply(echoStr);
                return;
            }
            switch (error) {
                case 1:
                    reply('Input Error!');
                    break;
                case 2:
                    reply('Signature Not Match!');
                    break;
                default:
                    reply('Unknown Error!');
                    break;
            }
        });
    }
}

//处理用户订阅
messages.event.on.subscribe(function (message, reply, callback, extra) {
    console.log('-->> subscribe');


    let openid = message.FromUserName

    extra.api.getUser(openid, (err, result) => {
        if (!err) {
            let obj = result
            obj.client = extra.client
            obj.channel = 'subscribe'
            let getUser = ((cb) => {
                cb(null, obj)
            })
            async.waterfall([getUser, fixdata, saveOrUpdateUser], function (err, result) {
                // console.log(result);
            })
        }
    });

    if (message.EventKey != '') {
        let commands = _.split(message.EventKey, '_')
        if (commands[0] == 'qrscene' && commands.length == 2) {
            doCommand(commands[1], openid, (err, res) => {
                if (res != '') {
                    var text = rreply.text(message.ToUserName, message.FromUserName, res);
                    return reply(text)
                }
                var text = getWelMsg(extra, message)
                return reply(text).code(200)
            })
        } else {
            var text = getWelMsg(extra, message)
            return reply(text).code(200)
        }
    } else {
        var text = getWelMsg(extra, message)
        return reply(text).code(200)
    }
});
//处理用户退订
messages.event.on.unsubscribe(function (message, reply, callback, extra) {
    console.log('-->> unsubscribe');
    let openid = message.FromUserName
    return reply().code(200)
});
messages.event.on.scan(function (message, reply, callback, extra) {
    let openid = message.FromUserName
    doCommand(message.EventKey, openid, (err, res) => {
        if (res != null) {
            var text = rreply.text(message.ToUserName, message.FromUserName, res);
            return reply(text)
        }
        return reply().code(200)
    })
})
messages.event.on.location(function (message, reply, callback, extra) { return reply().code(200) })
messages.event.on.click(function (message, reply, callback, extra) { return reply().code(200) })
messages.event.on.view(function (message, reply, callback, extra) { return reply().code(200) })
messages.event.on.templatesendjobfinish(function (message, reply, callback, extra) { return reply().code(200) })

messages.on.text(function (message, reply, callback, extra) {
    console.log('-->> text');
    console.log(message);
    var text = rreply.text(message.ToUserName, message.FromUserName, '我们收到了您的消息');
    return reply(text)
})
messages.on.image(function (message, reply, callback, extra) {
    console.log('----> image');
    return reply().code(200)
})
messages.on.voice(function (message, reply, callback, extra) { return reply().code(200) })
messages.on.video(function (message, reply, callback, extra) { return reply().code(200) })
messages.on.shortvideo(function (message, reply, callback, extra) { return reply().code(200) })
messages.on.location(function (message, reply, callback, extra) { return reply().code(200) })
messages.on.link(function (message, reply, callback, extra) { return reply().code(200) })


module.exports.msg = {
    handler: function (request, reply) {
        let client = request.params.client
        getApi(client, (err, api) => {

            console.log(request.payload);
            messages.onXML(request.payload, reply, function callback() {
            }, { client, api })
        })
    }
}

module.exports.tmpqrcode = {
    handler: function (request, reply) {
        let client = request.params.client
        let sceneid = request.query.sceneid
        getApi(client, (err, api) => {
            api.createTmpQRCode(sceneid, 1800, function (err, result) {
                console.log(err, result);
                if (err) {
                    return reply(Boom.badRequest(err))
                }
                result = _.merge({ qrcode: api.showQRCodeURL(result.ticket) }, result)
                return reply(result)
            });
        })
    }
}

module.exports.limitqrcode = {
    handler: function (request, reply) {
        let client = request.params.client
        let sceneid = request.query.sceneid
        getApi(client, (err, api) => {
            api.createLimitQRCode(sceneid, function (err, result) {
                if (err) {
                    return reply(Boom.badRequest(err))
                }
                result = _.merge({ qrcode: api.showQRCodeURL(result.ticket) }, result)
                return reply(result)
            });
        })

    }
}

module.exports.getmenu = {
    handler: function (request, reply) {
        let client = request.params.client
        getApi(client, (err, api) => {
            api.getMenu((err, result) => {
                if (err) {
                    return reply(Boom.badRequest(err))
                }
                return reply(result)
            });
        })
    }
}

module.exports.createmenu = {
    handler: function (request, reply) {
        let client = request.params.client
        let menu = request.payload.menu
        getApi(client, (err, api) => {
            api.createMenu(menu, (err, result) => {
                if (err) {
                    return reply(Boom.badRequest(err))
                }
                return reply(result)
            });
        })
    }
}

module.exports.removemenu = {
    handler: function (request, reply) {
        let client = request.params.client
        getApi(client, (err, api) => {
            api.removeMenu((err, result) => {
                if (err) {
                    return reply(Boom.badRequest(err))
                }
                return reply(result)
            });
        })
    }
}

module.exports.sendtemplate = {
    handler: function (request, reply) {
        let client = request.params.client
        let { openid, templateId, url, data } = request.payload
        getApi(client, (err, api) => {
            api.sendTemplate(openid, templateId, url, data, (err, result) => {
                if (err) {
                    return reply(Boom.badRequest(err))
                }
                return reply(result)
            });
        })
    }
}

function sendtemplate(client,obj,cb){
    let { openid, templateId, url, data } = obj
    getApi(client, (err, api) => {
        api.sendTemplate(openid, templateId, url, data, (err, result) => {
            return cb(null,result)
        });
    })
}
export default sendtemplate