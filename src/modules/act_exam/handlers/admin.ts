import * as Boom from 'boom'
import * as _ from 'lodash'
import * as nodeExcel from 'excel-export'
import * as moment from 'moment-timezone';
import sendtemplate from '../../wx/handlers/admin'

declare let models: any;

let getExamList = (request, act_id) => {
    let { page_num, page_size, status, sort, query_key } = request.query
    if (!sort && sort == '') { 
        sort = 'createdAt desc';
    }
    let limit = 10
    let offset = 0
    if (page_size && page_size != '') {
        limit = page_size;
    }
    if (page_num && page_num != '') {
        offset = page_num * limit;
    }
    let replacements = [act_id]
    let list_sql = `select e.id,e.answers,e."createdAt",e."updatedAt",e.act_id,e.student_id,e.status,e.check_time,e.is_push,s."name",s.mobile,s.ext
from act_exam e left join act_review_student s on e.student_id = s.id where e.act_id=? `
    if (status && status != '') {
        list_sql += ` and e.status = ?`
        replacements.push(status);
    }
    if (query_key && query_key != '') {
        list_sql += ` and (s.ext->>'city') like '%${query_key}%' or s.name like '%${query_key}%' or s.mobile like '%${query_key}%'`
    }
    let count_sql = `select count(1) from (${list_sql}) t`
    list_sql += ' order by ' + '"' + sort.split(' ')[0] + '"' + ' ' + sort.split(' ')[1] + ' offset ? limit ?'
    replacements.push(offset)
    replacements.push(limit)
    let options = {
        replacements: replacements,
        type: request.getDb().sequelize.QueryTypes.SELECT
    }
    return new Promise((resolve, reject) => {
        request.getDb().sequelize.query(count_sql, options).then(function (r1) {
            request.getDb().sequelize.query(list_sql, options).then(function (r2) {
                resolve({
                    count: r1[0] ? r1[0].count : 0,
                    rows: r2
                })
            })
        })
    })
    // let options = {
    //     attributes:['id','answers','student_id','createdAt','updatedAt','status'],
    //     where: {act_id},
    //     limit: 10,
    //     offset: 0,
    //     order: [['updatedAt', 'desc']]
    // }
    // if (query.sort && query.sort != '') {
    //     options.order[0]=_.split(query.sort, ' ');
    // }
    // if (query.status && query.status != '') {
    //     options.where['status'] = query.status;
    // }
    // if (query.page_size && query.page_size != '') {
    //     options.limit = query.page_size;
    // }
    // if (query.page_num && query.page_num != '') {
    //     options.offset = query.page_num * options.limit;
    // }
    // return models.act_exam.findAndCount(options);
}
let getActReviewByActId = (act_id) => {
    return models.act_review.findOne({where:{act_id}})
}
let getAllExams = (request,act_id) => {
    return request.getDb().sequelize.query(
                `select a.*,
s.name as student_name,s.mobile as student_mobile,s.ext as student_ext,
t.name as teacher_name,t.mobile as teacher_mobile,t.ext as teacher_ext,
t_o.name as owner_teacher_name,t_o.mobile as owner_teacher_mobile,t_o.ext as owner_teacher_ext
from act_exam a
left join act_review_student s on s.id = a.student_id 
left join act_review_teacher t on t.id = a.act_review_teacher_id
left join act_review_teacher t_o on t_o.id = a.owner_teacher_id
where a.act_id = ? `,
                {
                    replacements: [act_id],
                    type: request.getDb().sequelize.QueryTypes.SELECT,
                }
            )
}
let exportExam = (request, list,ks) => {
    var conf:any ={};
	// conf.stylesXmlFile = "styles.xml";
    conf.name = "mysheet";
    conf.cols = []
    ks.forEach(item => {
        conf.cols.push({
            caption: item,
        })
    })
    conf.rows = []
    list.forEach(item => {
        let arr = []
        ks.forEach(k => {
            if (_.get(item, k) || _.get(item, k) === 0 || _.get(item, k) === false) {
                if (_.get(item, k) instanceof Date) {
                    arr.push(moment.tz(_.get(item, k), "Asia/Shanghai").format('YYYY-MM-DD'))
                } else {
                    if (k == 'ext.score_time') {
                        arr.push(moment.tz(_.get(item, k), "Asia/Shanghai").format('YYYY-MM-DD'))
                    } else {
                        arr.push(_.get(item, k).toString().replace(/\u000b/gi, ''))
                    }
                }
            } else { 
                arr.push('')
            }
        })
        conf.rows.push(arr)
    })
    var result = nodeExcel.execute(conf);
    request.raw.res.setHeader('Content-Type', 'application/vnd.openxmlformats');
  	request.raw.res.setHeader("Content-Disposition", "attachment; filename=" + "report.xlsx");
  	request.raw.res.end(result, 'binary');
    
}
let getExamById = (id) => {
    return models.act_exam.findById(id, {
        include: [{
            model:models.act_review_student
        }]
    })
}
let updateExamStatus = (id, obj) => {
    return models.act_exam.update(obj,{where:{id}})
}
let getTeacherById = (id) => {
    return models.act_review_teacher.findById(id)
}
let deleteExam = (w) => {
    return models.act_exam.destroy({
        where:w
    })
}
//抑郁症项目给医生推送消息－－－临时使用
let pushMessageStudentForMotivate = (examId) => {
    let obj = {
        openid: "",
        templateId: "Nf94vWKZiwhBKUCI0H7piRghYC0vnjaMnY5Tt5f7SaY",
        url: `http://h5.baleina.cn/havas/motivate/mobile/page5-3.html?eid=${examId}&nid=0`,
        data: {
            first: {
                value: "",
                color: "#173177"
            },
            keyword1: {
                value: "",
                color: "#173177"
            },
            keyword2: {
                value: "",
                color: "#173177"
            },
            remark: {
                value: "",
                color: "#173177"
            }
        }
    }
    models.act_exam.findById(examId, {
        include: [{
            model:models.act_review_student
        }]
        }).then(exam => {
            if (exam && exam.act_review_student && exam.act_review_student.ext && exam.act_review_student.ext.openid) {
                obj.openid = exam.act_review_student.ext.openid
                obj.data.first.value = `尊敬的医生，您好！实践题目为“${exam.answers.topic}”,已被推送至评审专家，请耐心等待评审。`
                obj.data.keyword1.value = `临床实践已被推送至评审专家`
                obj.data.keyword2.value = moment().tz("Asia/Shanghai").format('YYYY年MM月DD日')
                sendtemplate('motivate', obj, (err, result) => {
                    console.log(`推送给医生－－－－${exam.id}`)
                    console.log('result: ', result);
                })
            } else {
                console.log('找不到医生记录或者openid')
            }
        })
    
    
}
//抑郁症项目给专家推送消息－－－临时使用
let pushMessageTeacherForMotivate = (examId,teacherId) => {
    let obj = {
        openid: "",
        templateId: "Nf94vWKZiwhBKUCI0H7piRghYC0vnjaMnY5Tt5f7SaY",
        url: `http://h5.baleina.cn/havas/motivate/mobile/page5-3.html?eid=${examId}&nid=1`,
        data: {
            first: {
                value: "",
                color: "#173177"
            },
            keyword1: {
                value: "",
                color: "#173177"
            },
            keyword2: {
                value: "",
                color: "#173177"
            },
            remark: {
                value: "",
                color: "#173177"
            }
        }
    }
    models.act_review_teacher.findById(teacherId).then(teacher => {
            if (teacher && teacher.ext && teacher.ext.openid) {
                obj.openid = teacher.ext.openid
                obj.data.first.value = `尊敬的专家，您好！您有一条新的待评审临床实践，请登录平台进行评审。`
                obj.data.keyword1.value = `评审临床实践`
                obj.data.keyword2.value = moment().tz("Asia/Shanghai").format('YYYY年MM月DD日')
                obj.data.remark.value = `为了保证交流互动的及时性，请在收到本提示信息后两周内登录平台评审。`
                sendtemplate('motivate', obj, (err, result) => {
                    console.log(`推送给专家－－－－－－`)
                    console.log('result: ', result);
                })
            } else {
                console.log('找不到专家记录或者openid')
            }
        })
    
}
module.exports.exam_list = {
    handler: async function (request, reply) {
        try {
            return reply(await getExamList(request,request.params.id));
        } catch (err) {
            return reply(Boom.badRequest("请求答题列表错误"))
        }
    }
};
module.exports.exam_info = {
    handler: async function (request, reply) {
        try {
            return reply(await getExamById(request.params.id));
        } catch (err) {
            return reply(Boom.badRequest("请求答卷详情错误"))
        }
    }
}
module.exports.exam_status_update = {
    handler: async function (request, reply) {
        try {
            let status = request.payload.status
            if (status != 1 && status != 2) return reply(Boom.badRequest('status参数错误'))
            let obj = {
                status: status,
                check_time:new Date()
            }
            if (status === 2) {
                obj['ext']=request.payload.ext
            }
            if (request.payload.teacher_id && request.payload.teacher_id != '') {
                let teacher = await getTeacherById(request.payload.teacher_id)
                if(!teacher) return reply(Boom.badRequest('找不到教师'))
                obj['owner_teacher_id']=request.payload.teacher_id
            }
            let result = await updateExamStatus(request.params.id, obj)
            if (!result || result[0] == 0) return reply(Boom.badRequest('找不到记录'))
            if (status===1){
                //推送给医生
                pushMessageStudentForMotivate(request.params.id)
                //推送给专家
                pushMessageTeacherForMotivate(request.params.id,request.payload.teacher_id)
            }
            return reply({id:request.params.id});
        } catch (err) {
            return reply(Boom.badRequest("审批失败"))
        }
    }
}
module.exports.exam_export = {
    handler: async function (request, reply) {
        try {  
            let act_review = await getActReviewByActId(request.params.id)     
            if(JSON.stringify(act_review.config) == "{}") return reply(Boom.badRequest('导出失败，找不到导出字段的配置'))
            let list = await getAllExams(request, request.params.id)
            let result = await exportExam(request,list,act_review.config.export_exam_keys)
        }
        catch (err) {
            console.log('err: ', err);
            return reply(Boom.badRequest("导出失败"))
        }
    }
}
module.exports.exam_delete = {
    handler: async function (request, reply) {
        try {  
            let result = await deleteExam({ id: request.params.id })
            if (result === 0) return reply(Boom.badRequest('删除实践失败'))
            return reply({id:request.params.id})
        }
        catch (err) {
            console.log('err: ', err);
            return reply(Boom.badRequest("删除实践失败"))
        }
    }
}