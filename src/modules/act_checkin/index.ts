import * as Plugo from 'plugo'

exports.register = (plugin, options, next) => {
    Plugo.expose({ name: 'handlers', path: __dirname + '/handlers' }, plugin, function () {
        let handlers = plugin.plugins.act_checkin.handlers;

        plugin.route([
            // Application Routes
            { method: 'GET', path: '/act/checkin', config: handlers.Admin.hello },

            // 用户签到
            { method: 'POST', path: '/act/checkin', config: handlers.Client.user_checkin },

            // 查询当天签到状态
            { method: 'GET', path: '/act/{id}/checkin_status', config: handlers.Client.checkin_status },

        ]);
        next()
    });
};

exports.register.attributes = {
    name: 'act_checkin'
};
