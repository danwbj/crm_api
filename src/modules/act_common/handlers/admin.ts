import * as Boom from 'boom'
import * as Sequelize from 'sequelize'
import * as _ from 'lodash'

declare let models: any;

/**
 * 创建活动
 * @param activity
 */
let createActivity = function (t: any, activity: any) {
    if (!activity.config) {
        switch (activity.type) {
            case 'plant':
                activity.config = {
                    'checkin': 1,
                    'correct_answer': 3,
                    'inaccuracy_answer': 1,
                    'share': 5,
                    'help': 1
                }
                break;
            default:
                break;
        }
    }
    return models.act.create(activity, {
        transaction: t
    });
}


/**
 * 创建种树活动
 * @param t
 * @param id act_id
 */
let createActPlant = function (t: any, id: number) {
    return models.act_plant.create({ act_id: id }, { transaction: t });
}


/**
 * 创建人员评审活动
 * @param t
 */
let createActReview = function (t: any, act_id: number) {
    return models.act_review.create({ act_id }, { transaction: t })
}

/**
 * 创建问卷调研
 * @param t 
 * @param act_id 
 */
let createActSurvey = function (t: any, act_id: number, title) {
    let prefix = '为了给您提供更好的服务，希望您能抽出几分钟时间，将您的感受和建议告诉我们，我们非常重视每位用户的宝贵意见，期待您的参与！现在我们就马上开始吧！'
    let suffix = '问卷到此结束，感谢您的参与！'
    return models.act_survey.create({ title, prefix, suffix, act_id }, { transaction: t })
}

/**
 * 创建新闻资讯
 * @param t 
 * @param act_id 
 */
let createNewsCof = function (t: any, act_id: number) {
    return models.act_news_cof.create({ act_id }, { transaction: t })
}

/**
 * 创建意见反馈
 * @param t 
 * @param act_id 
 */
let createFeedbackCof = function (t: any, act_id: number) {
    return models.act_feedback_cof.create({ act_id }, { transaction: t })
}



let getActsByUserId = function (t: any, uid: number, q: any, status: string, sort: string, pager: any) {

    let { query_key } = q
    let where: any = { t_user_id: uid }
    if (status && status != '') where.status = status
    if (query_key && query_key != '') where.title = { $like: `%${query_key}%` }
    let page_num = pager.page_num || 0
    let page_size = pager.page_size || 10
    if (!sort || sort == '') sort = "createdAt desc"

    return models.act.findAndCountAll({
        attributes: { exclude: ['config', 'share'] },
        where: where,
        limit: page_size,
        offset: page_num * page_size,
        order: [_.split(sort, ' ')],
        transaction: t
    })
}

let getSpecByType = function (request, type) {
    return request.getDb().sequelize.query(`select t.type, s.name,s.module,s.ext
	from act_specification s join act_type_specification t on t.act_specification_id=s.id
		where t.type=? order by s.sort desc`, {
            replacements: [type],
            type: request.getDb().sequelize.QueryTypes.SELECT
        });
}

let getActById = function (t: any, id: number) {
    return models.act.findOne({ where: { id: id }, transaction: t })
}

let updateStatusByActId = function (t: any, new_status: number, id: number) {
    let newStatus = { status: new_status }
    return models.act.update(newStatus, {
        where: { id: id },
        transaction: t,
        returning: true
    })
}
let updateAct = (id, obj) => {
    return models.act.update(obj, {
        where:{id}
    })
}
module.exports.act_create = {
    handler: function (request, reply) {
        let user_id = request.session.uid;
        if (!user_id) {
            return reply(Boom.badRequest("用户不存在"));
        }
        const db = request.getDb();
        let _activity = request.payload;
        _activity.t_user_id = user_id
        db.sequelize.transaction(async t => {
            let activity = await createActivity(t, _activity)
            let act = [activity]
            switch (_activity.type) {
                case 'review':
                    let review = await createActReview(t, activity.id)
                    let news_cof = await createNewsCof(t, activity.id)
                    act.push(review)
                    act.push(news_cof)
                    break;
                case 'plant':
                    let plant = await createActPlant(t, activity.id)
                    act.push(plant)
                    break;
                case 'survey':
                    let { title } = request.payload
                    let survey = await createActSurvey(t, activity.id, title)
                    act.push(survey)
                    break;
                case 'feedback':
                    let feedback = await createFeedbackCof(t, activity.id)
                    act.push(feedback)
                    break;
                default:
                    break;
            }
            return act
        }).then(result => {
            return reply(result)
        }).catch(err => {
            console.log('err-----------------', err)
            return reply(Boom.badRequest(err.message))
        });
    }
}

module.exports.act_list = {
    handler: function (request, reply) {

        let { sort, query_key, page_num, page_size, status } = request.query
        let pager = { page_num, page_size }
        let user_id = request.session.uid;
        if (!user_id) {
            return reply(Boom.badRequest("用户不存在"));
        }
        const db = request.getDb()
        let p = {
            page_num: request.query.page_num ? parseInt(request.query.page_num) : 0,
            page_size: request.query.page_size ? parseInt(request.query.page_size) : 20
        }
        db.sequelize.transaction(async t => {
            let acts = await getActsByUserId(t, user_id, { query_key }, status, sort, pager)
            return acts
        }).then(result => {
            return reply(result)
        }).catch(err => {
            return reply(Boom.badRequest(err.message))
        });
    }
}

module.exports.act_info = {
    handler: function (request, reply) {
        let user_id = request.session.uid;
        let act_id = request.params.act_id
        if (!user_id) {
            return reply(Boom.badRequest("用户不存在"));
        }
        const db = request.getDb()
        db.sequelize.transaction(async t => {
            let act = await getActById(t, act_id)
            return act
        }).then(result => {
            return reply(result)
        }).catch(err => {
            return reply(Boom.badRequest(err.message))
        });
    }
}

//修改活动状态，未开始、进行中、已结束 0，1，2
module.exports.update_status = {
    handler: function (request, reply) {
        let act_id = request.params.act_id
        let new_status = request.payload.new_status
        const db = request.getDb()
        db.sequelize.transaction(async t => {
            let act = await updateStatusByActId(t, new_status, act_id)
            if (act === null || act[0] === 0) {
                return reply(Boom.badRequest("活动不存在"));
            }
            return reply(act[1][0])
        }).catch(err => {
            return reply(Boom.badRequest(err.message))
        });
    }
}
module.exports.act_update = {
    handler: async function (request, reply) {
        try {
            let result = await updateAct(request.params.act_id, request.payload)
            if (!result || result[0] === 0) return reply(Boom.badRequest('找不到活动'))
            return reply({id:request.params.act_id})
        }
        catch (err) {
            return reply(Boom.badRequest('修改活动失败'))
        }
    }
}

module.exports.act_type_spec = {
    handler: async function (request, reply) {
        let type = request.params.type
        let specs = await getSpecByType(request, type)
        return reply(specs)
    }
}

module.exports.hello = {
    handler: function (request, reply) {
        reply({ name: 'act_common' })
    }
}
