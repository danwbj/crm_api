import * as Plugo from 'plugo'

exports.register = (plugin, options, next) => {
    Plugo.expose({ name: 'handlers', path: __dirname + '/handlers' }, plugin, function () {
        let handlers = plugin.plugins.act_feedback.handlers;

        plugin.route([


            // =========================客户端=========================
            //创建意见反馈
            { method: 'POST', path: '/act/{act_id}/feedbacks', config: handlers.Client.feedbacks },
            // 意见配置
            { method: 'GET', path: '/act/{act_id}/feedback/conf', config: handlers.Client.feedback_configuration },


            // =========================管理端=========================
            //意见反馈列表
            { method: 'GET', path: '/act/{act_id}/feedback/feedbacks', config: handlers.Admin.feedback_list },
            //意见反馈详情
            { method: 'GET', path: '/act/{act_id}/feedback/feedbacks/{id}', config: handlers.Admin.get_feedback },
            //删除意见反馈
            { method: 'DELETE', path: '/act/{act_id}/feedback/feedbacks/{id}', config: handlers.Admin.feedback_delete },


            // banner列表
            { method: 'GET', path: '/act/{act_id}/feedback/banners', config: handlers.Admin.banner_list },
            // banner创建
            { method: 'POST', path: '/act/{act_id}/feedback/banners', config: handlers.Admin.banner_create },
            // banner删除
            { method: 'DELETE', path: '/act/{act_id}/feedback/banners/{uuid}', config: handlers.Admin.banner_delete },
            // banner修改
            { method: 'PUT', path: '/act/{act_id}/feedback/banners/{uuid}', config: handlers.Admin.banner_update },

        ]);
        next()
    });
};

exports.register.attributes = {
    name: 'act_feedback'
};
