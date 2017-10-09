import * as Plugo from 'plugo'

exports.register = (plugin, options, next) => {
    Plugo.expose({ name: 'handlers', path: __dirname + '/handlers' }, plugin, function () {
        let handlers = plugin.plugins.survey.handlers;

        plugin.route([
            // =========================client 客户端=========================
            //问卷详情
            { method: 'GET', path: '/client/act/survey/{act_id}', config: handlers.Client.survey_info },

            //提交答案
            { method: 'POST', path: '/client/act/survey/{act_id}/answers', config: handlers.Client.answers_create },



            // =========================admin 客户端=========================
            { method: 'GET', path: '/act/survey/{act_id}', config: handlers.Admin.survey_info },
            { method: 'POST', path: '/act/survey/{act_id}', config: handlers.Admin.create_survey },
            //问卷回收统计（浏览量、回收量、回收率、平均完成时间、问卷回收量按时间轴统计图表）
            { method: 'GET', path: '/act/survey/{act_id}/statistics', config: handlers.Admin.survey_statistics },
            //样本数据
            { method: 'GET', path: '/act/survey/{act_id}/answers', config: handlers.Admin.answers_list },

            //答题详情
            { method: 'GET', path: '/act/survey/{act_id}/answers/{id}', config: handlers.Admin.answers_info },


            //编辑survey 样式信息
            { method: 'PUT', path: '/act/survey/{act_id}/style', config: handlers.Admin.survey_style_update },
            //更新survey状态
            { method: 'PUT', path: '/act/survey/{act_id}/status', config: handlers.Admin.survey_status_update },
            // 样本数据(导出)
            { method: 'GET', path: '/act/survey/{act_id}/answers/export', config: handlers.Admin.answer_export },
        ]);
        next()
    });
};

exports.register.attributes = {
    name: 'survey'
};
