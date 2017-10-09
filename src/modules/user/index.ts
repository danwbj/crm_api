import * as Plugo from 'plugo'
import * as Joi from 'joi'

exports.register = (plugin, options, next) => {
    Plugo.expose({ name: 'handlers', path: __dirname + '/handlers' }, plugin, function () {
        plugin.log('info', 'load [user, permission] API');
        let handlers = plugin.plugins.user.handlers;
        plugin.route([
            /**
            * 获取用户列表(users)
            */
            { method: 'GET', path: '/users', config: handlers.Admin.user_list },

            /**
             * 获取用户详情(users)
             */
            { method: 'GET', path: '/users/{id}', config: handlers.Admin.user_info },

            /**
             * 获取用户通用数据(通用)
             */
            { method: 'GET', path: '/users/common/info', config: handlers.Admin.user_common_info },

            /**
             * 创建用户(users)
             */
            { method: 'POST', path: '/users', config: handlers.Admin.user_create },

            /**
             * 更新用户(users)
             */
            { method: 'PUT', path: '/users/{id}', config: handlers.Admin.user_update },

            /**
             * 用户登录
             */
            { method: 'POST', path: '/login', config: handlers.Admin.login },

            /**
             * 用户退出
             */
            { method: 'GET', path: '/logout', config: handlers.Admin.logout },

            /**
             * 获取用户权限列表(users)
             */
            { method: 'GET', path: '/users/{id}/permissions', config: handlers.Admin.user_permissions },

            /**
             * 获取指定用户权限树(users)
             */
            { method: 'GET', path: '/users/{id}/permissions/tree', config: handlers.Admin.user_permissions_tree },

            /**
            * 获取登录用户权限树(通用)
            */
            { method: 'GET', path: '/users/permissions/tree', config: handlers.Admin.user_permissions_tree },

            /**
             * 启用或禁用用户(users)
             */
            { method: 'PUT', path: '/users/{id}/able', config: handlers.Admin.user_able },

            /**
             * 修改用户密码(无限制)
             */
            { method: 'PUT', path: '/users/{id}/password', config: handlers.Admin.user_password_change },

            /**
             * 检测用户名是否重复(users)
             */
            { method: 'POST', path: '/users/check/email', config: handlers.Admin.user_check_email },
        ]);
        next()
    });
};

exports.register.attributes = {
    name: 'user'
};
