import * as Plugo from 'plugo'

exports.register = (plugin, options, next) => {
    Plugo.expose({ name: 'handlers', path: __dirname + '/handlers' }, plugin, function () {
        let handlers = plugin.plugins.login.handlers;

        plugin.route([
            // Application Routes
            { method: 'GET', path: '/login/corp', config: handlers.Client.corp },
            { method: 'GET', path: '/login/weixin', config: handlers.Client.weixin },
        ]);
        next()
    });
};

exports.register.attributes = {
    name: 'login'
};
