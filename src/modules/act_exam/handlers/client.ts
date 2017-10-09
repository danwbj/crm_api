import * as md5 from 'md5'
import * as Boom from 'boom'
import * as Sequelize from 'sequelize'
import * as _ from 'lodash'

declare let models: any;

let createActExam = function (answers: Object) {
    return models.act_exam.create(answers)
}

let getActAnswer = function (id: number) {
    return models.act_exam.findOne({
        where: {
            id: id
        }
    })
}

let updateScore = function (id: number, obj: any) {
    return models.act_exam.update(obj, {
        where: {
            id: id
        }
    })
}

/**
 * 答题列表
 */
let getExamList = function (request, rt_id, act_id) {
    let { page_num, page_size, review_status, city, sort, filter } = request.query
    let _sort = sort || '"createdAt" desc';
    let limit = 10
    let offset = 0
    if (page_size && page_size != '') {
        limit = page_size;
    }
    if (page_num && page_num != '') {
        offset = page_num * limit;
    }
    let replacements = [act_id]
    let list_sql = `select * from act_exam where status = 1 and act_id = ? `
    let yes_grade_count_sql = `select count(*) from act_exam where status = 1 and act_id = ? and act_review_teacher_id is not null`
    let no_grade_count_sql = `select count(*) from act_exam where status = 1 and act_id = ? and act_review_teacher_id is null`
    if (city && city != '') {
        list_sql += ` and (answers->>'city') = ?`
        yes_grade_count_sql += ` and (answers->>'city') = ?`
        no_grade_count_sql += ` and (answers->>'city') = ?`
        replacements.push(city);
    }
    if (review_status == '1') {
        list_sql += ` and act_review_teacher_id is not null`
    }
    if (review_status == '0') {
        list_sql += ` and act_review_teacher_id is null`
    }
    if (filter && filter == 'my') {
        list_sql += ` and act_review_teacher_id = ?`
        replacements.push(rt_id);
    }
    if (filter && filter == 'owner') {
        list_sql += ` and owner_teacher_id = ?`
        replacements.push(rt_id);
    }
    let count_sql = `select count(1) from (${list_sql}) t`
    list_sql += ` order by ${_sort} limit ${limit} offset ${offset}`
    let options = {
        replacements: replacements,
        type: request.getDb().sequelize.QueryTypes.SELECT
    }
    return new Promise((resolve, reject) => {
        request.getDb().sequelize.query(count_sql, options).then(function (r1) {
            request.getDb().sequelize.query(yes_grade_count_sql, options).then(function (r2) {
                request.getDb().sequelize.query(no_grade_count_sql, options).then(function (r3) {
                    request.getDb().sequelize.query(list_sql, options).then(function (r4) {
                        resolve({
                            count: r1[0] ? r1[0].count : 0,
                            yes_grade_count: r2[0] ? r2[0].count : 0,
                            no_grade_count: r3[0] ? r3[0].count : 0,
                            rows: r4
                        })
                    })

                })

            })
        })
    })
}
let getMyExams = (request, uid, act_id) => {
    let { page_num, page_size } = request.query
    let limit = 10
    let offset = 0
    if (page_size && page_size != '') {
        limit = page_size;
    }
    if (page_num && page_num != '') {
        offset = page_num * limit;
    }
    return models.act_exam.findAndCountAll({
        where: {
            student_id: uid,
            act_id: act_id
        },
        limit: limit,
        offset: offset

    })
}
let deleteExam = (w) => {
    return models.act_exam.destroy({
        where:w
    })
}
module.exports.hello = {
    handler: function (request, reply) {
        reply({ name: 'act_checkin' })
    }
}

module.exports.create_answer = {
    handler: async function (request, reply) {
        try {
            let s_id = request.session.rs_id
            if (!request.session.rs_id) return reply(Boom.badRequest('未认证'))
            let act_id = request.params.act_id
            let obj = {
                act_id: act_id,
                student_id: s_id,
                answers: request.payload
            }
            let answers = await createActExam(obj)
            return reply(answers)
        }
        catch (err) {
            request.log('error', err)
            return reply(Boom.badRequest('提交失败'))
        }
    }
}

module.exports.get_answer = {
    handler: async function (request, reply) {
        try {
            let id = request.params.id
            let act_id = request.params.act_id
            let answer = await getActAnswer(id)
            // console.log(answer)
            reply(answer)
        }
        catch (err) {
            return reply(Boom.badRequest('获取答题详情'))
        }
    }
}

module.exports.update_score = {
    handler: async function (request, reply) {
        try {
            let rt_id = request.session.rt_id
            if (!request.session.rt_id) return reply(Boom.badRequest('未认证'))
            let id = request.params.id
            let act_id = request.params.act_id
            let answer = await getActAnswer(id)
            if(!answer) return reply(Boom.badRequest('找不到该实践'))
            if (!answer.owner_teacher_id || answer.owner_teacher_id!=rt_id) return reply(Boom.badRequest('您没有权限对该实践评分'))
            let ext = _.merge(answer.ext, { score_time: new Date() })
            let obj = {
                act_review_teacher_id: rt_id,
                scores: request.payload,
                ext:ext
            }
            let answers = await updateScore(id, obj)
            reply(answers)
            // if (JSON.stringify(answer.scores) == "{}") {
                
            // } else {
            //     return reply(Boom.badRequest('本题已被评分'))
            // }
        }
        catch (err) {
            return reply(Boom.badRequest('评分失败'))
        }
    }
}
module.exports.exam_list = {
    handler: async function (request, reply) {
        try {
            let rt_id = request.session.rt_id

            if (!request.session.rt_id) return reply(Boom.badRequest('未认证'))
            let act_id = request.params.act_id
            let exams = await getExamList(request, rt_id, act_id);
            return reply(exams);
        } catch (err) {
            return reply(Boom.badRequest("请求答题列表错误"))
        }
    }
};
module.exports.my_exam_list = {
    handler: async function (request, reply) {
        try {
            let act_id = request.params.act_id
            let s_id = request.session.rs_id


            if (!s_id) return reply(Boom.badRequest('未认证'))
            let exams = await getMyExams(request, s_id, act_id)
            return reply(exams);
        } catch (err) {
            return reply(Boom.badRequest("请求答题列表错误"))
        }
    }
};
module.exports.exam_delete = {
    handler: async function (request, reply) {
        try {  
            let result = await deleteExam({ id: request.params.id })
            if (result === 0) return reply(Boom.badRequest('删除实践失败'))
            return reply({id:request.params.id})
        }
        catch (err) {
            return reply(Boom.badRequest("删除实践失败"))
        }
    }
}