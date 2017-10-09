import * as Boom from 'boom'
import * as _ from 'lodash'
import * as uuid from 'uuid'
declare let models: any;

module.exports.hello = {
    handler: function (request, reply) {
        reply({ name: 'act_checkin' })
    }
}
//获取对应活动的反馈配置
let getFeedbackCofByActId = (request) => {
    let act_id = request.params.act_id
    return models.act_feedback_cof.findOne({
        where: { act_id }
    })
}
let getFeedbacksByActId = (request) => {
    let query = request.query
    let act_id = request.params.act_id
    let options = {
        where: {act_id},
        limit: 10,
        offset: 0,
        order:[['createdAt','desc']]
    }
    if (query.query_key && query.query_key != '') {
        options.where['name'] = {
            $like: `%${query.query_key}%`
        }
    }
    if (query.filter_key && query.filter_key != '') {
        options.where['status'] = query.filter_key        
    }
    if (query.sort && query.sort != '') {
        options.order.push(_.split(query.sort, ' '));
    }
    if (query.page_size && query.page_size != '') {
        options.limit = query.page_size;
    }
    if (query.page_num && query.page_num != '') {
        options.offset = query.page_num * options.limit;
    }
    return models.act_feedback.findAndCount(options)
}


// 切换已读/未读状态
// 0为已读，1为未读
let getFeedbackById = (request) => {
    let act_id = request.params.act_id
    let id = request.params.id
    return new Promise((resolve, reject) => {
        models.act_feedback.findOne({ where: { act_id: act_id, id: id } }).then(feedback => {
            if (!feedback) return reject(new Error())
            feedback.update({ status:1 }).then(r => {
                resolve(r)
            }).catch(err => {
                reject(err)
            })
        })
    })
}

let delFeedbackById = (request) => {
    let act_id = request.params.act_id
    let id = request.params.id
    return models.act_feedback.destroy({
        where: {
            act_id:act_id,
            id:id
        }
    })
}

let createBanner = (act_id, banner) => {
    banner.uuid = uuid()
    return new Promise((resolve, reject) => {
        models.act_feedback_cof.findOne({ where: { act_id } }).then(cof => {
            if (!cof) return reject(new Error())
            cof.banners.push(banner)
            cof.update({ banners: cof.banners }).then(r => {
                resolve(banner)
            }).catch(err => {
                reject(err)
            })
        })
    })
}

let updateBanner = (act_id, obj) => {
    return new Promise((resolve, reject) => {
        models.act_feedback_cof.findOne({ where: { act_id } }).then(cof => {
            if (!cof) return reject(new Error())
            let cof_banners = _.keyBy(cof.banners, 'uuid')
            if (!_.has(cof_banners, obj.uuid)) return reject(new Error())
            let update_banners = _.keyBy([obj], 'uuid')
            let feedback_banners = _.merge({}, cof_banners, update_banners)
            cof.update({ banners: _.values(feedback_banners) }).then(r => {
                resolve({ uuid: obj.uuid })
            }).catch(err => {
                reject(err)
            })
        })
    })
}

let deleteBanner = (act_id, uuid) => {
    return new Promise((resolve, reject) => {
        models.act_feedback_cof.findOne({ where: { act_id } }).then(cof => {
            if (!cof) return reject(new Error())
            let feedback_banners = _.keyBy(cof.banners, 'uuid')
            if (!_.has(feedback_banners, uuid)) return reject(new Error())
            delete feedback_banners[uuid]
            cof.update({ banners: _.values(feedback_banners) }).then(r => {
                resolve({ uuid: uuid })
            }).catch(err => {
                reject(err)
            })
        })
    })
}

// 获取意见反馈列表 feedback_list
module.exports.feedback_list = {
    handler: async function(request, reply){
        try{
            let f_list = await getFeedbacksByActId(request)
            return reply(f_list ? f_list:[])
        }catch (err) {
            return reply(Boom.badRequest('获取意见反馈列表失败'))
        }
    }
}

// 获取意见反馈详情 get_feedback
module.exports.get_feedback = {
    handler: async function(request, reply){
        try{
            let feedback = await getFeedbackById(request)
            return reply(feedback?feedback:'获取失败')
        }catch(err){
            return reply(Boom.badRequest('获取反馈详情失败'))
        }
    }
}

//删除意见反馈 feedback_delete
module.exports.feedback_delete = {
    handler: async function(request, reply){
        try{
            let delItem = await delFeedbackById(request)
            console.log(delItem,'delItem')
            reply(delItem == 1 ? delItem :'删除失败' )
        }catch(err){
            return reply(Boom.badRequest('删除意见反馈失败'))
        }
    }
}

//获取轮播图列表
module.exports.banner_list = {
    handler: async function (request, reply) {
        try {
            let cof = await getFeedbackCofByActId(request)
            return reply(cof ? cof.banners : []);
        } catch (err) {
            return reply(Boom.badRequest('获取轮播图列表失败'))
        }
    }
}

//创建轮播图
module.exports.banner_create = {
    handler: async function (request, reply) {
        try {
            let act_id = request.params.act_id
            let banner = await createBanner(act_id, request.payload)
            return reply(banner)
        }
        catch (err) {
            return reply(Boom.badRequest('创建轮播图失败'))
        }
    }
}

//编辑轮播图
module.exports.banner_update = {
    handler: async function (request, reply) {
        try {
            let act_id = request.params.act_id
            let uuid = request.params.uuid
            let obj = {
                ...request.payload,
                uuid
            }
            let banner = await updateBanner(act_id, obj)
            return reply(banner)
        }
        catch (err) {
            return reply(Boom.badRequest('编辑轮播图失败'))
        }
    }
}

//删除轮播图
module.exports.banner_delete = {
    handler: async function (request, reply) {
        try {
            let act_id = request.params.act_id
            let uuid = request.params.uuid
            let banner = await deleteBanner(act_id, uuid)
            return reply(banner)
        }
        catch (err) {
            return reply(Boom.badRequest('删除轮播图失败'))
        }
    }
}
