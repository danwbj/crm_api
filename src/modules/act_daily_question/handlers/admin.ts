import * as Boom from 'boom'
import * as _ from 'lodash'
import * as Sequelize from 'sequelize'

declare let models: any;


let getQuestionsList = (request) => {
    return new Promise((resolve, reject) => {
        let { sort, query_key, page_size, page_num } = request.query;
        let act_id = request.params.act_id
        let limit = page_size || 10;
        let offset = (page_num || 0) * limit;
        if (!sort && sort == '') { 
            sort = 'createdAt desc';
        }
        let replacements = [act_id];
        let sql_list = `select * from act_daily_question where act_id = ?`;
        if (query_key && query_key != '') {
            sql_list += ` and (q->>'title') like '%${query_key}%'`;
        }
        let sql_count = `select count(1) from (${sql_list}) t`
        sql_list += ' order by '+'"'+sort.split(' ')[0]+'"'+' '+sort.split(' ')[1]+' offset ? limit ?'
        replacements.push(offset)
        replacements.push(limit)
        let options = {
            replacements: replacements,
            type: request.getDb().sequelize.QueryTypes.SELECT
        }
        try {
            request.getDb().sequelize.query(sql_count, options).then(function (r1) {
                request.getDb().sequelize.query(sql_list, options).then(function (r2) {
                    resolve({
                        count: r1[0].count,
                        rows: r2
                    })
                })
            })
        } catch (err) {
            reject(Boom.badRequest(err))
        }
    })
}

let createQuestion = (question) => {
    return models.act_daily_question.create(question)
}

let getQuestionById = (id) => {
    return models.act_daily_question.findById(id)
}

let deleteQuestion = (id) => {
    return models.act_daily_question.destroy({ where: { id } })
}

let updateQuestion = (id, question) => {
    return models.act_daily_question.update(question, { where: { id } })
}

//给题库增加一道题
module.exports.question_create = {
    handler: async function (request, reply) {
        try {
            let question = {
                ...request.payload,
                act_id: request.params.act_id,
                q: {
                    title: request.payload.title,
                    type: request.payload.type,
                    options: request.payload.options,
                    answer: request.payload.answer,
                }
            }
            let result = await createQuestion(question)
            return reply(result)
        } catch (err) {
            return reply(Boom.badRequest('创建问题失败'))
        }
    }
}

//获取题目列表
module.exports.question_list = {
    handler: async function (request, reply) {
        try {
            let question_list = await getQuestionsList(request)
            return reply(question_list);
        } catch (err) {
            return reply(Boom.badRequest('获取题目列表失败'))
        }
    }
}

//获取题目详情
module.exports.question_info = {
    handler: async function (request, reply) {
        try {
            let result = await getQuestionById(request.params.id)
            return reply(result)
        } catch (err) {
            return reply(Boom.badRequest('获取题目详情失败'))
        }
    }
}

//修改一道题
module.exports.question_update = {
    handler: async function (request, reply) {
        try {
            let question = {
                ...request.payload,
                q: {
                    title: request.payload.title,
                    type: request.payload.type,
                    options: request.payload.options,
                    answer: request.payload.answer,
                }
            }
            let result = await updateQuestion(request.params.id, question)
            if (!result || result[0] == 0) return reply(Boom.badRequest('找不到记录'))
            return reply({ id: request.params.id })
        } catch (err) {
            return reply(Boom.badRequest('修改题目失败'))
        }
    }
}

//删除一道题
module.exports.question_delete = {
    handler: async function (request, reply) {
        try {
            let result = await deleteQuestion(request.params.id)
            if (result == 0) return reply(Boom.badRequest('找不到记录'))
            return reply({ id: request.params.id })
        } catch (err) {
            return reply(Boom.badRequest('删除题目失败'))
        }
    }
}

module.exports.hello = {
    handler: function (request, reply) {
        reply({ name: 'act_daily_question' })
    }
}
