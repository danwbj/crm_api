import * as Boom from 'boom'
import * as _ from 'lodash'
import * as uuid from 'uuid'
declare let models: any;

module.exports.hello = {
    handler: function (request, reply) {
        reply({ name: 'act_checkin' })
    }
}
/**
 * 获取新闻列表
 * @param request 
 */
let getNewsList = (request) => {
    let query = request.query
    let act_id = request.params.id
    let options = {
        where: {act_id},
        limit: 10,
        offset: 0,
        order:[['createdAt','desc']]
    }
    if (query.query_key && query.query_key != '') {
        options.where['title'] = {
            $like: `%${query.query_key}%`
        }
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
    return models.act_news.findAndCount(options);
}
let createNews = (news) => {
    return models.act_news.create(news)
}
let getNewsById = (id) => {
    return models.act_news.findById(id)
}
let updateNews = (id, news) => {
    return models.act_news.update(news,{where:{id}})
}
let deleteNews = (id) => {
    return models.act_news.destroy({where:{id}})
}
/**
 * 获取对应活动的新闻配置
 * @param request 
 */
let getNewsCofByActId = (request) => {
    let act_id = request.params.id
    return models.act_news_cof.findOne({
        where:{act_id}
    })
}
let createBanner = (act_id, banner) => {
    banner.uuid = uuid()
    return new Promise((resolve, reject) => {
        models.act_news_cof.findOne({ where: { act_id } }).then(cof => {
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
let deleteBanner = (act_id, uuid) => {
    return new Promise((resolve, reject) => {
        models.act_news_cof.findOne({ where: { act_id } }).then(cof => {
            if (!cof) return reject(new Error())
            let new_banners = _.keyBy(cof.banners, 'uuid')
            if (!_.has(new_banners, uuid)) return reject(new Error())
            delete new_banners[uuid]
            cof.update({ banners: _.values(new_banners) }).then(r => {
                resolve({uuid:uuid})
            }).catch(err => {
                reject(err)
            })
        })
    })
}
let updateBanner = (act_id, obj) => {
    return new Promise((resolve, reject) => {
        models.act_news_cof.findOne({ where: { act_id } }).then(cof => {
            if (!cof) return reject(new Error())
            let cof_banners = _.keyBy(cof.banners, 'uuid')
            if (!_.has(cof_banners, obj.uuid)) return reject(new Error())
            let update_banners = _.keyBy([obj], 'uuid')
            let new_banners = _.merge({},cof_banners, update_banners)
            cof.update({ banners: _.values(new_banners) }).then(r => {
                resolve({uuid:obj.uuid})
            }).catch(err => {
                reject(err)
            })
        })
    })
}
module.exports.news_list = {
    handler: async function (request, reply) {
        try {
            return reply(await getNewsList(request));
        } catch (err) {
            return reply(Boom.badRequest('获取新闻列表失败'))
        }
    }
}
module.exports.news_info = {
    handler: async function (request, reply) {
        try {
            let result = await getNewsById(request.params.id)
            return reply(result)
        } catch (err) {
            return reply(Boom.badRequest('获取新闻详情失败'))
        }
    }
}
module.exports.news_create = {
    handler: async function (request, reply) {
        try {
            let news = {
                ...request.payload,
                act_id: request.params.id,
                share: {
                    title:request.payload.title,
                    description:request.payload.description,
                    thumbnail:request.payload.thumbnail,
                }
            }
            let result = await createNews(news)
            return reply(result)
        } catch (err) {
            return reply(Boom.badRequest('创建新闻失败'))
        }
    }
}
module.exports.news_update = {
    handler: async function (request, reply) {
        try {
            let news = {
                ...request.payload,
                share: {
                    title:request.payload.title,
                    description:request.payload.description,
                    thumbnail:request.payload.thumbnail,
                }
            }
            let result = await updateNews(request.params.id, news)
            if(!result || result[0]==0) return reply(Boom.badRequest('找不到记录'))
            return reply({id:request.params.id})
        } catch (err) {
            return reply(Boom.badRequest('修改新闻失败'))
        }
    }
}
module.exports.news_delete = {
    handler: async function (request, reply) {
        try {
            let result = await deleteNews(request.params.id)
            if(result==0) return reply(Boom.badRequest('找不到记录'))
            return reply({id:request.params.id})
        } catch (err) {
            return reply(Boom.badRequest('删除新闻失败'))
        }
    }
}
module.exports.new_cof_info = {
    handler: async function (request, reply) {
        try {
            let cof = await getNewsCofByActId(request)
            return reply(cof)
        } catch (err) {
            return reply(Boom.badRequest('获取新闻配置失败'))
        }
    }
}

module.exports.banner_list = {
    handler: async function (request, reply) {
        try {
            let cof = await getNewsCofByActId(request)
            return reply(cof?cof.banners:[]);
        } catch (err) {
            return reply(Boom.badRequest('获取轮播图列表失败'))
        }
    }
}
module.exports.banner_create = {
    handler: async function (request, reply) {
        try {
            let act_id = request.params.id
            let banner = await createBanner(act_id, request.payload)
            return reply(banner)
        }
        catch (err) {
            return reply(Boom.badRequest('创建轮播图失败'))
        }
    }
}
module.exports.banner_delete = {
    handler: async function (request, reply) {
        try {
            let act_id = request.params.id
            let uuid = request.params.uuid
            let banner = await deleteBanner(act_id, uuid)
            return reply(banner)
        }
        catch (err) {
            return reply(Boom.badRequest('删除轮播图失败'))
        }
    }
}
module.exports.banner_update = {
    handler: async function (request, reply) {
        try {
            let act_id = request.params.id
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