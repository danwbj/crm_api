import * as Plugo from 'plugo'

exports.register = (plugin, options, next) => {
    Plugo.expose({ name: 'handlers', path: __dirname + '/handlers' }, plugin, function () {
        let handlers = plugin.plugins.wx.handlers;

        plugin.route([
            // Application Routes
            { method: 'POST', path: '/wx/jsconfig', config: handlers.Admin.jsconfig },

            { method: 'GET', path: '/wx/{client}/ack', config: handlers.Admin.ack },
            { method: 'POST', path: '/wx/{client}/ack', config: handlers.Admin.msg },
            { method: 'GET', path: '/wx/{client}/tmpqrcode', config: handlers.Admin.tmpqrcode },
            { method: 'GET', path: '/wx/{client}/limitqrcode', config: handlers.Admin.limitqrcode },

            { method: 'GET', path: '/wx/{client}/menu', config: handlers.Admin.getmenu },
            { method: 'POST', path: '/wx/{client}/menu', config: handlers.Admin.createmenu },
            { method: 'DELETE', path: '/wx/{client}/menu', config: handlers.Admin.removemenu },

            { method: 'POST', path: '/wx/{client}/sendtemplate', config: handlers.Admin.sendtemplate },
        ]);
        next()
    });
};

exports.register.attributes = {
    name: 'wx'
};
