import * as Plugo from 'plugo'

exports.register = (plugin, options, next) => {
    Plugo.expose({ name: 'handlers', path: __dirname + '/handlers' }, plugin, function () {
        let handlers = plugin.plugins.act_review.handlers;

        plugin.route([
            // =========================client 客户端=========================
            // 获取活动详情
            { method: 'GET', path: '/act/review/{act_id}', config: handlers.Client.hello },

            // 教师登录
            { method: 'POST', path: '/act/review/{act_id}/teacher/login', config: handlers.Client.login_teacher },
            { method: 'GET', path: '/act/review/{act_id}/teacher/touch', config: handlers.Client.touch_teacher },

            // 教师登出
            { method: 'GET', path: '/act/review/{act_id}/teacher/logout', config: handlers.Client.logout_teacher },

            // 学生登录
            { method: 'POST', path: '/act/review/{act_id}/student/login', config: handlers.Client.login_student },
            { method: 'GET', path: '/act/review/{act_id}/student/touch', config: handlers.Client.touch_student },

            // 学生注册(pc)
            { method: 'POST', path: '/act/review/{act_id}/student/register', config: handlers.Client.register_student },
            //教师注册(pc)
            { method: 'POST', path: '/act/review/{act_id}/teacher/register', config: handlers.Client.register_teacher },

            // 学生登录(pc)
            { method: 'POST', path: '/act/review/{act_id}/student/login_pc', config: handlers.Client.login_student_pc },
            //教师登录(pc)
            { method: 'POST', path: '/act/review/{act_id}/teacher/login_pc', config: handlers.Client.login_teacher_pc },

            //教师列表
            { method: 'GET', path: '/act/{id}/teachers', config: handlers.Client.teacher_list },


            // 学生登出
            { method: 'GET', path: '/act/review/{act_id}/student/logout', config: handlers.Client.logout_student },

            // =========================admin 管理端=========================
            // 教师列表
            { method: 'GET', path: '/act/review/{act_id}/teacher', config: handlers.Admin.teacher_list },

            // 教师详情
            { method: 'GET', path: '/act/review/teacher/{id}', config: handlers.Admin.teacher_info },

            // 新增教师
            { method: 'POST', path: '/act/review/{act_id}/teacher', config: handlers.Admin.teacher_create },

            // 修改教师
            { method: 'PUT', path: '/act/review/{act_id}/teacher/{id}', config: handlers.Admin.teacher_update },

            // 删除教师
            { method: 'DELETE', path: '/act/review/teacher/{id}', config: handlers.Admin.teacher_delete },

            // 获取活动的基础配置信息
            { method: 'GET', path: '/act/review/{act_id}/act_review', config: handlers.Admin.act_review_info },
            
            //修改活动的配置信息
            { method: 'PUT', path: '/act/review/act_review/{id}', config: handlers.Admin.act_review_update },

            // 创建一个评审活动
            { method: 'POST', path: '/act/review', config: handlers.Admin.hello },

            //教师列表(all)
            { method: 'GET', path: '/act/{act_id}/allteachers', config: handlers.Admin.teacher_list_all },
        ]);
        next()
    });
};

exports.register.attributes = {
    name: 'act_review'
};
