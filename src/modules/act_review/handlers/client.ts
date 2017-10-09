
import * as md5 from 'md5'
import * as Boom from 'boom'
import * as Sequelize from 'sequelize'
import * as _ from 'lodash'

declare let models: any;

/**
 * 登录
 * @param mobile 用户名
 * @param password 密码
 */
let teacher_login = function (mobile: string, password: string) {
    return new Promise(function (resolve, reject) {
        models.act_review_teacher.findOne({ where: { mobile: mobile } }).then(function (user) {
            user && user.password === md5(password) ? resolve(user) : resolve(false);
        });
    });
}
//更新教师表
let update_act_review_teacher = (id, obj) => {
    return models.act_review_teacher.update(obj, {
        where: {
            id: id
        },
        returning:true
    })
}
module.exports.hello = {
    handler: function (request, reply) {
        reply({ name: 'act_checkin' })
    }
}
let getActReviewByActId = (act_id) => {
    return models.act_review.findOne({
        where: {
            act_id: act_id
        }
    })
}
let student_login = (obj) => {
    return models.act_review_student.findOrCreate({
        where: {
            mobile: obj.mobile,
            password: md5(obj.mobile)
        },
        defaults: {
            name: obj.name,
            password: md5(obj.mobile),
            mobile: obj.mobile,
            ext: obj.ext,
            act_id: obj.act_id,
            act_review_id: obj.act_review_id,

        },
    })

}
let student_register = (obj) => {
    return models.act_review_student.create(obj)
}
// let teacher_register = (obj) => {
//     return models.act_review_teacher.create(obj)
// }
let student_login_pc = (act_id, name, mobile) => {
    return new Promise(function (resolve, reject) {
        models.act_review_student.findOne({ where: { mobile: mobile, name: name, act_id: act_id } }).then(function (s) {
            s ? resolve(s) : resolve(false);
        });
    });
}
let teacher_login_pc = (act_id, name, mobile) => {
    return new Promise(function (resolve, reject) {
        models.act_review_teacher.findOne({ where: { mobile: mobile, name: name, act_id: act_id } }).then(function (t) {
            t ? resolve(t) : resolve(false);
        });
    });
}

let getStudentByMobile = (act_id, mobile) => {
    return new Promise((resolve, reject) => {
        models.act_review_student.findOne({ where: { act_id: act_id, mobile: mobile } }).then(s => {
            if (s) resolve(true)
            resolve(false)
        })
    })
}
// let getTeacherByMobile = (act_id, mobile) => {
//     return new Promise((resolve, reject) => {
//         models.act_review_teacher.findOne({ where: { act_id: act_id, mobile: mobile } }).then(s => {
//             if (s) resolve(true)
//             resolve(false)
//         })
//     })
// }
let getTeachers = (request) => {
    let query = request.query
    let options = {
        where: {
            act_id:request.params.id
        },
        limit: 50,
        offset: 0,
        order:[['createdAt','desc']]
    }
    if (query.page_size && query.page_size != '') {
        options.limit = query.page_size;
    }
    if (query.page_num && query.page_num != '') {
        options.offset = query.page_num * options.limit;
    }
    return models.act_review_teacher.findAndCount(options)
}
module.exports.login_teacher = {
    handler: async function (request, reply) {
        let mobile = request.payload.mobile,
            password = mobile,
            user: any = await teacher_login(mobile, password);
        if (!user) return reply(Boom.create(400, '用户名或密码错误', { timestamp: Date.now() }))
        if (request.payload.ext && request.payload.ext.openid) {
            //更新openid
            let nuser = _.merge({ ext: user.ext }, { ext: { openid: request.payload.ext.openid } })
            user.update(nuser).then(u => {
                request.session.rt_id = user['id'];
                return reply(u)
            })
        } else {
            request.session.rt_id = user['id'];
            return reply(user)
        }
    }
};

module.exports.touch_teacher = {
    handler: async function (request, reply) {
        if (request.session.rt_id) {
            return reply({ live: true })
        } else {
            return reply({ live: false })
        }
    }
}

module.exports.login_student = {
    handler: async function (request, reply) {
        try {
            let act_id = request.params.act_id

            let mobile = request.payload.mobile;


            if (!mobile || mobile == "") {
                return reply(Boom.badRequest('注册登录失败'))
            }


            let act_review = await getActReviewByActId(act_id)
            if (!act_review) { return reply(Boom.badRequest('注册登录失败')) }
            request.payload.act_review_id = act_review.id
            request.payload.act_id = act_id
            let student: any = await student_login(request.payload);
            if (!student) {
                return reply(Boom.create(400, '用户名或密码错误', { timestamp: Date.now() }))
            } else {
                request.session.rs_id = student[0]['id'];
                return reply(student[0])
            }
        }
        catch (err) {
            return reply(Boom.badRequest('注册登录失败'))
        }
    }
};
module.exports.touch_student = {
    handler: async function (request, reply) {
        if (request.session.rs_id) {
            return reply({ live: true })
        } else {
            return reply({ live: false })
        }
    }
}
/**
 * pc端医生注册
 */
module.exports.register_student = {
    handler: async function (request, reply) {
        try {
            if (!(/^1[34578]\d{9}$/.test(request.payload.mobile))) {
                return reply(Boom.badRequest('手机号码有误，请重填'))
            }
            let act_id = request.params.act_id
            let act_review = await getActReviewByActId(act_id)
            if (!act_review) { return reply(Boom.badRequest('注册失败')) }

            let isExist = await getStudentByMobile(act_id, request.payload.mobile)
            if (isExist === true) return reply(Boom.badRequest('手机号已存在'))

            request.payload.password = md5(request.payload.mobile)
            request.payload.act_id = act_id
            request.payload.act_review_id = act_review.id
            let result = await student_register(request.payload)
            return reply(result)
        }
        catch (err) {
            reply(Boom.badRequest('注册失败'))
        }
    }
}
module.exports.register_teacher = {
    handler: async function (request, reply) {
        try {
            let mobile = request.payload.mobile,
                password = mobile,
                user: any = await teacher_login(mobile, password);
            if(!user) return reply(Boom.create(400, '您不可以注册为专家', { timestamp: Date.now() }))
            // let _u = await update_act_review_teacher(user.id, { ext: request.payload.ext })
            request.session.rt_id = user['id'];
            return reply(user)
        }
        catch (err) {
            return reply(Boom.badRequest('注册失败'))
        }
    }
}
module.exports.login_student_pc = {
    handler: async function (request, reply) {
        let act_id = request.params.act_id
        let name = request.payload.name
        let mobile = request.payload.mobile
        let s = await student_login_pc(act_id, name, mobile)
        if (!s) {
            return reply(Boom.create(400, '用户名或手机号填写错误', { timestamp: Date.now() }))
        } else {
            request.session.rs_id = s['id'];
            return reply(s)
        }
    }
}
module.exports.login_teacher_pc = {
    handler: async function (request, reply) {
        let act_id = request.params.act_id
        let name = request.payload.name
        let mobile = request.payload.mobile
        let t = await teacher_login_pc(act_id, name, mobile)
        if (!t) {
            return reply(Boom.create(400, '用户名或手机号填写错误', { timestamp: Date.now() }))
        } else {
            request.session.rt_id = t['id'];
            return reply(t)
        }
    }
}
module.exports.logout_teacher = {
    handler: async function (request, reply) {
        request.session = {};
        return reply({ status: 'success' })
    }
};
module.exports.logout_student = {
    handler: async function (request, reply) {
        request.session = {};
        return reply({ status: 'success' })
    }
};

module.exports.teacher_list = {
    handler: async function (request, reply) {
        try {
            reply(getTeachers(request))
        }
        catch (err) {
            reply(Boom.badRequest('获取教师列表失败'))
        }
    }
}
