import * as Plugo from 'plugo'

exports.register = (plugin, options, next) => {
    Plugo.expose({ name: 'handlers', path: __dirname + '/handlers' }, plugin, function () {
        plugin.log('info', 'load [upload] API');
        let handlers = plugin.plugins.upload.handlers;
        plugin.route([
            { method: 'POST', path: '/upload', config: handlers.Admin.upload },
        ]);
        next()
    });
};

exports.register.attributes = {
    name: 'upload'
};
