import * as Plugo from 'plugo'

exports.register = (plugin, options, next) => {
    Plugo.expose({ name: 'handlers', path: __dirname + '/handlers' }, plugin, function () {
        let handlers = plugin.plugins.act_common.handlers;

        plugin.route([
            // Application Routes
            { method: 'GET', path: '/act/common', config: handlers.Admin.hello },

            // 获取活动列表
            { method: 'GET', path: '/act', config: handlers.Admin.act_list },


            // 获取活动详情
            { method: 'GET', path: '/act/{act_id}', config: handlers.Admin.act_info },

            // 修改活动状态
            { method: 'PUT', path: '/act/{act_id}/status', config: handlers.Admin.update_status },
            
            // 修改活动
            { method: 'PUT', path: '/act/{act_id}', config: handlers.Admin.act_update },

            // 获取活动子模块
            { method: 'GET', path: '/act/spec/{type}', config: handlers.Admin.act_type_spec },

            // 创建一个活动 (种树活动)
            { method: 'POST', path: '/act', config: handlers.Admin.act_create },

            // 获取client端活动详情
            { method: 'GET', path: '/act/client/{act_id}', config: handlers.Client.act_info },
        ]);
        next()
    });
};

exports.register.attributes = {
    name: 'act_common'
};
