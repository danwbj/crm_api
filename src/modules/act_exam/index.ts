import * as Plugo from 'plugo'

exports.register = (plugin, options, next) => {
    Plugo.expose({ name: 'handlers', path: __dirname + '/handlers' }, plugin, function () {
        let handlers = plugin.plugins.act_exam.handlers;

        plugin.route([
            // =========================client 客户端=========================

            // 提交答题信息
            { method: 'POST', path: '/act/exam/{act_id}', config: handlers.Client.create_answer },

            // 答题信息列表
            { method: 'GET', path: '/act/exam/{act_id}', config: handlers.Client.exam_list },

            // 教师对答题评分
            { method: 'PUT', path: '/act/exam/{act_id}/exam/{id}', config: handlers.Client.update_score },

            // 获取答题详情
            { method: 'GET', path: '/act/exam/{act_id}/exam/{id}', config: handlers.Client.get_answer },

            // 获取我的实践列表
            { method: 'GET', path: '/act/exam/{act_id}/my_exams', config: handlers.Client.my_exam_list },

            // 答卷删除
            { method: 'DELETE', path: '/client/act/exams/{id}', config: handlers.Client.exam_delete },

            // =========================admin 管理端=========================
            // 答题信息列表
            { method: 'GET', path: '/act/{id}/exams', config: handlers.Admin.exam_list },

            // 答卷详情
            { method: 'GET', path: '/act/exams/{id}', config: handlers.Admin.exam_info },

            // 答卷删除
            { method: 'DELETE', path: '/act/exams/{id}', config: handlers.Admin.exam_delete },


            // 审批答卷并且分配专家
            { method: 'PUT', path: '/act/exams/{id}/status', config: handlers.Admin.exam_status_update },

            // 答题信息列表(导出)
            { method: 'GET', path: '/act/{id}/exams/export', config: handlers.Admin.exam_export },

        ]);
        next()
    });
};

exports.register.attributes = {
    name: 'act_exam'
};
