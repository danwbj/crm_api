import * as Plugo from 'plugo'
exports.register = (plugin, options, next) => {
    Plugo.expose({ name: 'handlers', path: __dirname + '/handlers' }, plugin, function () {
        let handlers = plugin.plugins.act_pim.handlers;
        plugin.route([
            // =========================client 客户端=========================
            // 获取用户信息
            { method: 'POST', path: '/dxy/getbyticket', config: handlers.Client.getbyticket }
        ]);
        next();
    });
};
exports.register.attributes = {
    name: 'act_pim'
};
