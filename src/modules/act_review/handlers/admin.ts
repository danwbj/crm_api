
import * as md5 from 'md5'
import * as Boom from 'boom'
import * as _ from 'lodash'


declare let models: any;

/**
 * 新增教师
 * @param teacher 教师对象
 */
let createTeacher = function (teacher: Object) {
    return models.act_review_teacher.create(teacher);
}
let updateTeacher = function (id, teacher) {
    return models.act_review_teacher.update(teacher,{where:{id}})
}
let getTeacherById = function (id) {
    return models.act_review_teacher.findById(id, {
        attributes: { exclude: ['password'] }
    })
}
let deleteTeacher = function (obj) {
    return models.act_review_teacher.destroy({
        where:obj
    })
}
let getReviewByActId = function (act_id: number) {
    return models.act_review.findOne({
        where: {act_id}
    })
}
let update_act_review = function (id, obj) {
    return models.act_review.update(obj, {
        where: { id },
        returning:true
    })
}
let getTeacherByMobile = (act_id, mobile) => {
    return new Promise((resolve, reject) => {
        models.act_review_teacher.findOne({ where: { act_id: act_id, mobile: mobile } }).then(s => {
            if (s) resolve(true)
            resolve(false)
        })
    })
}
let getTeacherByMobileAndId = (request) => {
    return request.getDb().sequelize.query(
                `select * from act_review_teacher where id != ? and mobile = ? and act_id = ? `,
                {
                    replacements: [request.params.id,request.payload.mobile,request.params.act_id],
                    type: request.getDb().sequelize.QueryTypes.SELECT,
                }
            )
}
let getTeachers = (request) => {
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
    if (query.sort && query.sort != '') {
        options.order[0] = _.split(query.sort, ' ');
    }
    if (query.page_size && query.page_size != '') {
        options.limit = query.page_size;
    }
    if (query.page_num && query.page_num != '') {
        options.offset = query.page_num * options.limit;
    }
    return models.act_review_teacher.findAndCount(options)
}
let getAllTeachers = (request) => {
    let query = request.query
    let act_id = request.params.act_id
    let options = {
        where: {act_id},
    }
    return models.act_review_teacher.findAll(options)
}
let getTeacherOwnerCount = (request) => {
    let query = request.query
    let act_id = request.params.act_id
    return request.getDb().sequelize.query(
        `select owner_teacher_id,count(*) from act_exam where act_id = ? and owner_teacher_id is not null group by owner_teacher_id`,
        {
            replacements: [request.params.act_id],
            type: request.getDb().sequelize.QueryTypes.SELECT,
        }
    )

}

module.exports.hello = {
    handler: function (request, reply) {
        reply({ name: 'act_checkin' })
    }
}

module.exports.teacher_create = {
    handler: async function (request, reply) {
        try {
            if (!(/^1[34578]\d{9}$/.test(request.payload.mobile))) {
                return reply(Boom.badRequest('手机号码有误，请重填'))
            }
            let act_id = request.params.act_id
            let _teacher = request.payload;
            _teacher.act_id = act_id
            _teacher.password = md5(_teacher.mobile)
            let review = await getReviewByActId(act_id)
            if (!review) return reply(Boom.badRequest('创建教师失败'))
            _teacher.act_review_id =  review.id
            let isExist = await getTeacherByMobile(act_id, request.payload.mobile)
            if (isExist === true) return reply(Boom.badRequest('手机号已存在'))
            let teacher = await createTeacher(_teacher)
            return reply(teacher)
        }
        catch (err) {
            return reply(Boom.badRequest('创建教师失败'))
        }
    }
}
module.exports.teacher_list = {
    handler: async function (request, reply) {
        try {
            return reply(await getTeachers(request))
        }
        catch (err) {
            return reply(Boom.badRequest('获取教师列表失败'))
        }
    }
}
module.exports.teacher_list_all = {
    handler: async function (request, reply) {
        try {
            let teachers = await getAllTeachers(request)
            let count = await getTeacherOwnerCount(request)
            let list = []
            teachers.forEach(item => {
                let obj = _.find(count, { owner_teacher_id: item.id })
                let o = {
                    ...item.dataValues,
                    count:obj?obj.count:0
                }
                list.push(o)
            })
            return reply(list)
        }
        catch (err) {
            console.log('err: ', err);
            return reply(Boom.badRequest('获取教师列表失败'))
        }
    }
}
module.exports.teacher_update = {
    handler: async function (request, reply) {
        try {
            if (!(/^1[34578]\d{9}$/.test(request.payload.mobile))) {
                return reply(Boom.badRequest('手机号码有误，请重填'))
            }
            let _teacher = request.payload;
            _teacher.password = md5(_teacher.mobile)
            let t = await getTeacherByMobileAndId(request)
            if(t[0]) return reply(Boom.badRequest('手机号已存在'))
            let result = await updateTeacher(request.params.id, _teacher)
            if(result[0] == 0) return reply(Boom.badRequest('更新教师失败'))
            return reply({id:request.params.id})
        }
        catch (err) {
            return reply(Boom.badRequest('更新教师失败'))
        }
    }
}
module.exports.teacher_info = {
    handler: async function (request, reply) {
        try {
            return reply(await getTeacherById(request.params.id))
        }
        catch (err) {
            return reply(Boom.badRequest('获取教师详情失败'))
        }
    }
}
module.exports.teacher_delete = {
    handler: async function (request, reply) {
        try {
            let result = await deleteTeacher({ id: request.params.id })
            if(result == 0) return reply(Boom.badRequest('找不到记录'))
            return reply({id:request.params.id})
        }
        catch (err) {
            return reply(Boom.badRequest('删除教师失败'))
        }
    }
}

module.exports.act_review_info = {
    handler: async function (request, reply) {
        try {
            return reply(await getReviewByActId(request.params.act_id))
        }
        catch (err) {
            return reply(Boom.badRequest('获取配置信息失败'))
        }
    }
}
module.exports.act_review_update = {
    handler: async function (request, reply) {
        try {
            let result = await update_act_review(request.params.id, request.payload)
            if (!result || result[0] == 0) return reply(Boom.badRequest('找不到记录'))
            return reply(result[1][0])
        }
        catch (err) {
            return reply(Boom.badRequest('修改配置信息失败'))
        }
    }
}
