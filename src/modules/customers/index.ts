import * as Plugo from 'plugo'

exports.register = (plugin, options, next) => {
    Plugo.expose({ name: 'handlers', path: __dirname + '/handlers' }, plugin, function () {
        plugin.log('info', 'load [customer] API');
        let handlers = plugin.plugins.customer.handlers;
        plugin.route([
            /**
             * 获取机构详情(users)
             */
            { method: 'GET', path: '/customer/{id}', config: handlers.Admin.customer_info },
        ]);
        next()
    });
};

exports.register.attributes = {
    name: 'customer'
};
