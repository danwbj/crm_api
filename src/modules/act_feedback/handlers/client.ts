import * as Boom from 'boom'
import * as Sequelize from 'sequelize'
import * as moment from 'moment'
import * as mt from 'moment-timezone'

declare let models: any;

import config from '../../../config/config'

//创建客户端意见反馈
module.exports.feedbacks = {
    handler: async function (request, reply) {
        if (!request.session.uid) return reply(Boom.unauthorized('未认证'))
        let data =  request.payload
        data.act_id = request.params.act_id
        // data.user_id = request.session.uid
        data.user_id = 36
        console.log(data,'11111111')
        if(!data.act_id) return reply(Boom.badRequest('活动id不能为空'))
        if(!data.content) return reply(Boom.badRequest('评论内容不能为空'))
        models.act.findOne({
            where: {id: data.act_id},
        }).then(result => {
            if (result) {
                return models.act_feedback.create(
                    data
                )
            }
            else {reply(Boom.badRequest('活动不存在'))}
        }).then(result =>{
            reply(result)
        }).catch(err => {
            reply(err)
            // reply(Boom.badRequest('创建意见反馈失败'))
        })
    }
}


module.exports.hello = {
    handler: function (request, reply) {
        reply({ name: 'act_checkin' })
    }
}

//获取对应活动的反馈配置
let getFeedbackCofByActId = function (request, act_id: string) {
    return models.act_feedback_cof.findOne({
        where: {
            act_id: act_id
        }
    })
}

//获取轮播图列表
module.exports.feedback_configuration = {
    handler: async function (request, reply) {
        try {
            let act_id = request.params.act_id
            let act_feedback_cof = await getFeedbackCofByActId(request, act_id)
            return reply(act_feedback_cof)
        } catch (err) {
            reply(Boom.badRequest('获取新闻配置失败'))
        }
    }
}
