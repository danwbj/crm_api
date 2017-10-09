import * as Plugo from 'plugo'

exports.register = (plugin, options, next) => {
    Plugo.expose({ name: 'handlers', path: __dirname + '/handlers' }, plugin, function () {
        let handlers = plugin.plugins.act_user.handlers;

        plugin.route([
            // Application Routes
            { method: 'GET', path: '/act/user', config: handlers.Admin.hello },

            // 排行榜
            { method: 'GET', path: '/act/user/{id}/rank', config: handlers.Client.rank },

            // 用户详情
            { method: 'GET', path: '/act/user/{id}/users/{user_id}', config: handlers.Client.user_info },

            // 全部用户积分历史
            { method: 'GET', path: '/act/user/{id}/points', config: handlers.Client.user_points },

            // 更新用户扩展资料
            { method: 'PUT', path: '/act/user/{id}/users/{user_id}', config: handlers.Client.update_ext },
        ]);
        next()
    });
};

exports.register.attributes = {
    name: 'act_user'
};
