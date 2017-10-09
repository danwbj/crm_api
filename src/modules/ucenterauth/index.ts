import * as Plugo from 'plugo'

exports.register = (plugin, options, next) => {
    Plugo.expose({ name: 'handlers', path: __dirname + '/handlers' }, plugin, function () {
        let handlers = plugin.plugins.ucenterauth.handlers;

        plugin.route([
            // Application Routes
            { method: 'GET', path: '/', config: handlers.Ucenterauth.auth },
            // { method: 'GET', path: '/oauth_response', config: handlers.Ucenterauth.oauthResponse },
            { method: 'GET', path: '/userinfo', config: handlers.Ucenterauth.findUserByOpenid },
            { method: 'GET', path: '/ucenterauth/auth', config: handlers.Ucenterauth.auth },
            { method: 'GET', path: '/ucenterauth/oauth_response', config: handlers.Ucenterauth.oauthResponse },
            { method: 'GET', path: '/ucenterauth/userinfo', config: handlers.Ucenterauth.findUserByOpenid }
        ]);
        next()
    });
};

exports.register.attributes = {
    name: 'ucenterauth'
};
