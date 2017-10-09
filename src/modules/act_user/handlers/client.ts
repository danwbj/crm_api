import * as Boom from 'boom'
import * as Sequelize from 'sequelize'

declare let models: any;
/**
 * 获取所有排行
 * @param request 
 * @param act_id 活动id
 * @param page_size 每页显示记录数
 * @param page_num 当前第几页
 */
let getAllRank = (request, act_id, page_size = null, page_num = null) => {
    let sql = `select * from (select a.id,a.point,a.user_id,u.nickname,u.headimgurl,a.act_id,
(select count(distinct point) as rank from act_user_rank where point >= a.point)
        from act_user_rank a inner join public.user u on a.user_id = u.id where act_id = ?) as subq
        order by subq.rank,subq.id asc `
    if (page_num != null && page_size != null && page_num != undefined && page_size != undefined) sql += `limit ${page_size} offset ${page_size * page_num}`
    return request.getDb().sequelize.query(sql,
        {
            replacements: [act_id],
            type: request.getDb().sequelize.QueryTypes.SELECT
        }
    )
}
/**
 * 获取用户基本信息
 * @param request 
 * @param user_id 
 */
let getUserInfo = (request, user_id) => {
    let sql = `select u.*,au.point from public.user u left join act_user_rank au on u.id = au.user_id where u.id = ?`
    return request.getDb().sequelize.query(sql,
        {
            attributes: { exclude: ['privilege', 'unionid', 'createdAt', 'updatedAt'] },
            replacements: [user_id],
            type: request.getDb().sequelize.QueryTypes.SELECT
        }
    )
}
/**
 * 获取用户能量贡献历史
 * @param user_id 
 * @param act_id 
 */
let pointHistory = (user_id, act_id, { page_num, page_size }) => {
    return models.act_user_point.findAndCountAll({
        where: {
            user_id: user_id,
            act_id: act_id
        },
        order: [['createdAt', 'desc']],
        limit: page_size,
        offset: page_size * page_num,
        attributes: { exclude: ['id', 'user_id', 'act_id', 'status', 'updatedAt'] }
    })
}
/**
 * 获取全部用户积分历史
 * @param act_id 
 */
let allUserPointHistory = (act_id, { page_num, page_size }) => {
    return models.act_user_point.findAndCountAll({
        where: {
            act_id: act_id
        },
        include: [{
            model: models.user,
            required: true,
            attributes: ['nickname']
        }],
        limit: page_size,
        offset: page_size * page_num,
        order: [['createdAt', 'desc']],

    })
}

let updateExt = function (id: number, ext: any) {
    return models.user.update({ ext: ext }, {
        where: {
            id: id
        },
        returning: true
    })
}

module.exports.rank = {
    handler: async function (request, reply) {
        if (!request.session.uid) return reply(Boom.unauthorized('未认证'))
        let user_id = request.session.uid
        let act_id = request.params.id
        let page_size = request.query.page_size ? parseInt(request.query.page_size) : 10
        let page_num = request.query.page_num ? parseInt(request.query.page_num) : 0
        try {
            let allRank = await getAllRank(request, act_id)
            let oneself = allRank.filter(item => {
                return item.user_id == user_id
            })
            let records = await getAllRank(request, act_id, page_size, page_num)
            reply({ oneself: oneself[0], data: records, count: allRank.length })
        }
        catch (err) {
            reply(Boom.badRequest(err.message))
        }

    }
}
module.exports.user_info = {
    handler: async function (request, reply) {
        let act_id = request.params.id
        let user_id = request.params.user_id
        try {
            let userinfo = await getUserInfo(request, user_id)
            let p = {
                page_num: request.query.page_num ? parseInt(request.query.page_num) : 0,
                page_size: request.query.page_size ? parseInt(request.query.page_size) : 10
            }
            let history = await pointHistory(user_id, act_id, p)
            if (userinfo.length == 0) return reply(Boom.badRequest('找不到用户'))
            userinfo[0].point_history = history
            reply(userinfo[0])
        }
        catch (err) {
            reply(Boom.badRequest(err.message))
        }

    }
}
module.exports.user_points = {
    handler: async function (request, reply) {
        let act_id = request.params.id
        try {
            let p = {
                page_num: request.query.page_num ? parseInt(request.query.page_num) : 0,
                page_size: request.query.page_size ? parseInt(request.query.page_size) : 20
            }
            let alluserpoints = await allUserPointHistory(act_id, p)
            reply(alluserpoints)
        }
        catch (err) {
            reply(Boom.badRequest(err.message))
        }
    }
}
module.exports.update_ext = {
    handler: async function (request, reply) {
        let act_id = request.params.id
        let user_id = request.params.user_id
        let ext = request.payload
        try {
            let user = await updateExt(user_id, ext)
            reply(user)
        }
        catch (err) {
            reply(Boom.badRequest(err.message))
        }
    }
}