import * as Plugo from 'plugo'

exports.register = (plugin, options, next) => {
    Plugo.expose({ name: 'handlers', path: __dirname + '/handlers' }, plugin, function () {
        let handlers = plugin.plugins.act_daily_question.handlers;

        plugin.route([
            // Application Routes
            { method: 'GET', path: '/act/daily/question', config: handlers.Admin.hello },


            // 获取题目列表
            { method: 'GET', path: '/act/{act_id}/daily/question', config: handlers.Admin.question_list },

            // 给题库增加一道题
            { method: 'POST', path: '/act/{act_id}/daily/question', config: handlers.Admin.question_create },

            // 获取题目详情
            { method: 'GET', path: '/act/daily/question/{id}', config: handlers.Admin.question_info },

            // 修改
            { method: 'PUT', path: '/act/daily/question/{id}', config: handlers.Admin.question_update },

            // 删除
            { method: 'DELETE', path: '/act/daily/question/{id}', config: handlers.Admin.question_delete },

            // 随机从题库中选出一道题
            { method: 'GET', path: '/act/daily/question/random', config: handlers.Client.get_qusetion },

            // 答题
            { method: 'POST', path: '/act/daily/question/{id}', config: handlers.Client.answer_question },

            // 答题状态
            { method: 'GET', path: '/act/{id}/daily/question_status', config: handlers.Client.question_status },
        ]);
        next()
    });
};

exports.register.attributes = {
    name: 'act_daily_question'
};
