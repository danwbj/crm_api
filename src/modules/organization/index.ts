import * as Plugo from 'plugo'

exports.register = (plugin, options, next) => {
    Plugo.expose({ name: 'handlers', path: __dirname + '/handlers' }, plugin, function () {
        plugin.log('info', 'load [organization] API');
        let handlers = plugin.plugins.organization.handlers;
        plugin.route([
            /**
             * 获取机构详情(users)
             */
            { method: 'GET', path: '/organizations/{id}', config: handlers.Admin.organization_info },

            /**
             * 创建机构(users)
             */
            { method: 'POST', path: '/organizations', config: handlers.Admin.organization_create },

            /**
             * 更新机构(users)
             */
            { method: 'PUT', path: '/organizations/{id}', config: handlers.Admin.organization_update },

            /**
             * 删除机构(users)
             */
            { method: 'DELETE', path: '/organizations/{id}', config: handlers.Admin.organization_delete },

            /**
             * 检测机构名是否重复(users)
             */
            { method: 'POST', path: '/organizations/check/name', config: handlers.Admin.organization_check_name },
        ]);
        next()
    });
};

exports.register.attributes = {
    name: 'organization'
};
