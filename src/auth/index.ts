
import * as _ from 'lodash'
declare let models: any;
declare let cache: any;

/**
 * 获取用户功能权限
 * @param user_id 用户id
 */
let getUserFunctionPermissions = async function (request, user_id) {
    let user = await models.user.findById(user_id);
    if (user.type === 1) {
        return request.getDb().sequelize.query(
            `select p.id, p.name, p.route from t_permission p`,
            {
                type: request.getDb().sequelize.QueryTypes.SELECT
            }
        );
    } else {
        return request.getDb().sequelize.query(
            `select distinct p.id, p.name, p.route 
                   from t_user_permission u, t_permission p
                     where u.perm_id = p.id and u.user_id = ?`,
            {
                replacements: [user_id],
                type: request.getDb().sequelize.QueryTypes.SELECT
            }
        );
    }
}

let getUserFunctionPermissionsFromCache = async function (user_id) {
    return new Promise(function (resolve, reject) {
        cache.get(`${user_id}_fun_permissions`, (err, value, cached, log) => {
            if (!err) {
                return resolve(value)
            }
            return resolve(null)
        });
    })
}

let validateFunc = async function (state, request, perm, callback) {
    let { uid } = request.session
    if (!uid) {
        return callback(null, false, null)
    }

    let fun_permissions = await getUserFunctionPermissionsFromCache(uid)
    if (!fun_permissions) {
        fun_permissions = await getUserFunctionPermissions(request, uid)
        fun_permissions = _.map(fun_permissions, 'route');
        cache.set(`${uid}_fun_permissions`, fun_permissions, null, (err) => {
        });
    }
    if (_.includes(fun_permissions, perm)) {
        return callback(null, true, {})
    } else {
        return callback(null, false)
    }
}

// [ 'users', 'device', 'resources', 'plan', 'publish', 'upgrade' ]
let validateFuncUsers = async function (state, request, callback) {
    return validateFunc(state, request, 'users', callback)
}
let validateFuncDevice = async function (state, request, callback) {
    return validateFunc(state, request, 'device', callback)
}
let validateFuncResources = async function (state, request, callback) {
    return validateFunc(state, request, 'resources', callback)
}
let validateFuncPlan = async function (state, request, callback) {
    return validateFunc(state, request, 'plan', callback)
}
let validateFuncPublish = async function (state, request, callback) {
    return validateFunc(state, request, 'publish', callback)
}
let validateFuncUpgrade = async function (state, request, callback) {
    return validateFunc(state, request, 'upgrade', callback)
}

exports.register = function (plugin, options, next) {
    plugin.auth.strategy('users', 'mext', {
        validateFunc: validateFuncUsers
    });
    plugin.auth.strategy('device', 'mext', {
        validateFunc: validateFuncDevice
    });
    plugin.auth.strategy('resources', 'mext', {
        validateFunc: validateFuncResources
    });
    plugin.auth.strategy('plan', 'mext', {
        validateFunc: validateFuncPlan
    });
    plugin.auth.strategy('publish', 'mext', {
        validateFunc: validateFuncPublish
    });
    plugin.auth.strategy('upgrade', 'mext', {
        validateFunc: validateFuncUpgrade
    });
    next();
}

exports.register.attributes = {
    name: 'auth'
};
