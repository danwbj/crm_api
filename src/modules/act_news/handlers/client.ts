import * as Boom from 'boom'
import * as sequelize from 'sequelize'
import * as moment from 'moment'
declare let models: any;

module.exports.hello = {
    handler: function (request, reply) {
        reply({ name: 'act_checkin' })
    }
}

/**
 * 新闻配置
 * @param act_id 活动id
 */
let getNewsConfiguration = function (request, act_id: string) {
    return models.act_news_cof.findOne({
        where: {
            act_id: act_id
        }
    })
}

function getNewsList(request) {
    let query = request.query
    let act_id = request.params.act_id
    let { page_num, page_size } = request.query

    let where = { act_id: act_id }
    if (query.type && query.type != '') {
        where['type'] = query.type;
    }
    page_num = page_num || 0
    page_size = page_size || 10

    return models.act_news.findAndCount({
        where: where,
        limit: page_size,
        offset: page_num * page_size,
        order: [['sort', 'DESC']]
    });
}

function getNewsInfo(news_id: string) {
    return models.act_news.findById(news_id).then(news => {
        return news.increment('view_count')
    })
}


/**
 * 更新新闻转发次数
 * @param id 新闻id
 */
let updateNewsShare = function (id: number) {
    return new Promise((resolve, reject) => {
        models.act_news.findById(id).then(act_news => {
            if (!act_news) { return reject(Boom.badRequest('找不到资讯记录')) }
            act_news.increment('share_count').then(result => {
                resolve(result)
            })
        }).catch(err => {
            reject(err)
        })
    })
}

module.exports.news_configuration = {
    handler: async function (request, reply) {
        try {
            let act_id = request.params.act_id
            let act_news_cof = await getNewsConfiguration(request, act_id)
            return reply(act_news_cof)
        } catch (err) {
            reply(Boom.badRequest('获取新闻配置失败'))
        }
    }
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
            let news_id = request.params.id;
            let news = await getNewsInfo(news_id)
            reply(news)
        } catch (err) {
            return reply(Boom.badRequest('获取新闻详情失败'));
        }
    }
}

module.exports.news_share = {
    handler: async function (request, reply) {
        try {
            let id = request.params.id
            let act_news = await updateNewsShare(id)
            return reply(act_news)
        } catch (err) {
            reply(Boom.badRequest('更新新闻转发次数失败'))
        }
    }
}
