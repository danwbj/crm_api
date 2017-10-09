import * as md5 from 'md5'
import * as _ from 'lodash'
import * as Boom from 'boom'
import * as Sequelize from 'sequelize'
import pickDeep from '../utils/pick-deep/index'
import parseTree from '../utils/parse-tree/index'
import config from '../../../config/config'

declare let models: any;


/**
 * 获取用户详情
 * @param user_id 用户id
 */
let getUserInfo = function (user_id: string) {
    return new Promise(function (resolve, reject) {
        models.t_user.findById(user_id, {
            attributes: { exclude: ['org_id', 'password', 'created_at', 'updated_at'] },
            include: [
                {
                    model: models.organization,
                    required: true,
                    attributes: { exclude: ['created_at', 'updated_at'] },
                }
            ]
        }).then(function (user) {
            if (user) {
                user = JSON.parse(JSON.stringify(user))
                user.org_name = user.organization.name
                user.org_id = user.organization.id
                delete user.organization
            }
            resolve(user)
        }).catch(err => {
            reject(err)
        })
    })
}

/**
 * 获取用户列表
 * @param query 请求对象
 */
let getUserList = function (request) {
    let query = request.query,
        options = {
            attributes: {
                exclude: [
                    'org_id', 'password'
                ]
            },
            where: {},
            order: [],
            limit: 50,
            offset: 0,
            include: [
                {
                    model: models.organization,
                    attributes: ['name'],
                    required: true
                }
            ]
        }
    if (query.status && query.status != '') {
        options.where['status'] = query.status;
    }
    if (query.query_key && query.query_key != '') {
        options.where['name'] = {
            $like: `%${query.query_key}%`
        }
    }
    if (query.org_id && query.org_is != '') {
        options.where['org_id'] = query.org_id;
    }
    if (query.perm_id && query.perm_id != '') {
        options.where['id'] = {
            $in: Sequelize.literal(
                `(select user_id from t_user_permission where perm_id = ${query.perm_id})`
            )
        }
    }
    if (!request.session.super) {
        options.where['org_id'] = {
            $in: Sequelize.literal(
                `(select org_id from t_permission p, t_user_permission u where p.id = u.perm_id and p.route = 'users' and u.user_id = ${request.session.uid})`
            )
        }
    }
    if (query.sort && query.sort != '') {
        options.order.push(_.split(query.sort, ' '));
    }
    if (query.page_size && query.page_size != '') {
        options.limit = query.page_size;
    }
    if (query.page_num && query.page_num != '') {
        options.offset = query.page_num * options.limit;
    }
    return models.t_user.findAndCountAll(options);
}

/**
 * 创建用户
 * @param user 用户对象
 */
let createUser = function (t: any, user: Object) {
    return models.t_user.create(user, {
        transaction: t
    })
}

/**
 * 更新用户
 * @param user_id 用户id
 * @param user 用户对象
 */
let updateUser = function (t: any, user_id: string, user: any) {
    let { email, name, mobile, org_id, avatar } = user
    let _u: any = { email, name, mobile, org_id, avatar }
    if (user.password) _u.password = user.password
    return models.t_user.update(_u, {
        where: {
            id: user_id
        },
        returning: true,
        transaction: t
    })
}

/**
 * 登录
 * @param email 用户名
 * @param password 密码
 */
let login = function (email: string, password: string) {
    return new Promise(function (resolve, reject) {
        models.t_user.findOne({ where: { email: email } }).then(function (user) {
            user && user.password === md5(password) ? resolve(user) : resolve(false);
        });
    });
}

/**
 * 获取用户权限树
 * @param request 请求对象
 * @param user_id 用户id
 * @param org_perms 是否包含机构权限
 */
let getUserPermissionsTree = function (request: any, user_id: string, org_perms: boolean = false) {
    return new Promise(function (resolve, reject) {
        models.t_user.findOne({ where: { id: user_id } }).then(function (user) {
            let sql = null;
            if (user.type === 1) {
                if (!org_perms) {
                    sql = `select o.id, o.org_id, o.name, 'true' as owner from t_organization o order by 2, 1`;
                } else {
                    sql = `select o.id, o.org_id, o.name, 'true' as owner, (select json_agg(json_build_object(id, route)) from t_permission) as org_perms from t_organization o order by 2, 1`
                }
            } else {
                if (!org_perms) {
                    sql = `with recursive t as (
                             select a.id, a.org_id, a.name, true as owner from t_organization a where a.id in (
                               select org_id from t_user_permission where user_id = ${user_id}
                             )
                             union all
                             select b.id, b.org_id, b.name, false as owner from t_organization b join t on b.id = t.org_id
                           ) select t.id, t.org_id, t.name, bool_or(t.owner) as owner from t group by t.id, t.org_id, t.name order by 2, 1`
                } else {
                    sql = `with recursive t as (
                             select a.id, a.org_id, a.name, true as owner,
                                    (select coalesce(json_agg(json_build_object(p.id, route)), '[]'::json) from t_user_permission u, t_permission p where u.perm_id = p.id and u.user_id = ${user_id} and u.org_id = a.id ) as org_perms
                               from t_organization a
                                 where a.id in ( select org_id from t_user_permission where user_id = ${user_id} )
                             union all
                             select b.id, b.org_id, b.name, false as owner,
                                    (select coalesce(json_agg(json_build_object(p.id, route)), '[]'::json) from t_user_permission u, t_permission p where u.perm_id = p.id and u.user_id = ${user_id} and u.org_id = b.id) as org_perms
                               from t_organization b join t on b.id = t.org_id
                           ) select t.id, t.org_id, t.name, bool_or(t.owner) as owner, json_agg(t.org_perms)->0 as org_perms from t group by t.id, t.org_id, t.name order by 2, 1`
                }
            }
            request.getDb().sequelize.query(
                sql, { type: Sequelize.QueryTypes.SELECT }
            ).then(function (data) {
                return resolve(data);
            });
        });
    });
}

/**
 * 获取用户权限
 * @param user_id 用户id
 */
let getUserPermissions = function (user_id: string, permTree) {
    return new Promise(function (resolve, reject) {
        models.user_permission.findAll(
            {
                attributes: ['user_id', 'org_id'],
                include: [
                    { model: models.organization, attributes: ['name'] },
                    { model: models.permission, attributes: ['name'] },
                ],
                where: { user_id: user_id }
            }
        ).then(function (permissions) {
            let perms = []
            if (permissions) {
                permissions = JSON.parse(JSON.stringify(permissions))
                let _permissions = permissions.map((permission) => {
                    permission.permissions = [permission.permission.name]
                    permission.org_name = permission.organization.name
                    delete permission.permission
                    delete permission.organization
                    delete permission.user_id
                    return permission
                })
                _permissions = _.groupBy(_permissions, 'org_id');
                _.values(_permissions).map((group) => {
                    let perm = _.reduce(group, function (per, next) {
                        return _.mergeWith(per, next, function (dest, source) {
                            if (_.isArray(dest)) {
                                return dest.concat(source)
                            }
                        });
                    });
                    let data = _.cloneDeep(permTree)
                    let { path_name } = pickDeep(parseInt(perm.org_id), data)
                    perm.path_name = path_name
                    perms.push(perm)
                })
            }
            resolve(perms)
        }).catch(err => {
            reject(err)
        })
    })
}

/**
 * 获取用户功能权限
 * @param user_id 用户id
 */

let getUserFunctionPermissions = async function (request, user_id) {
    let user = await models.t_user.findById(user_id);
    if (user.type === 1) {
        return request.getDb().sequelize.query(
            `select p.id, p.name, p.sort,p.route from t_permission p`,
            {
                type: request.getDb().sequelize.QueryTypes.SELECT
            }
        );
    } else {
        return request.getDb().sequelize.query(
            `select distinct p.id, p.name, p.route,p.sort
                   from t_user_permission u, t_permission p
                     where u.perm_id = p.id and u.user_id = ?`,
            {
                replacements: [user_id],
                type: request.getDb().sequelize.QueryTypes.SELECT
            }
        );
    }
}

/**
 * 删除用户权限
 * @param t 事务开关
 * @param user_id 用户id
 */
let destroyUserPermissions = function (t: any, user_id: number) {
    return models.user_permission.destroy({
        where: {
            user_id: user_id
        },
        transaction: t
    })
}

/**
 * 创建用户权限
 * @param user_id 用户id
 * @param permissions 权限数组
 */
let createUserPermissions = function (t: any, user_id: number, permissions: Array<Object>) {
    let records = permissions.map(item => {
        item['user_id'] = user_id
        return item
    })
    return models.user_permission.bulkCreate(records, { transaction: t })
}

/**
 * 禁用或者启用用户
 * @param user_id 用户id
 * @param status 用户状态
 */
let ableUser = function (user_id, status) {
    return models.t_user.update({ status: status }, {
        where: {
            id: user_id
        },
        returning: true,
        attributes: ['id', 'status']
    })
}

/**
 * 修改密码
 * @param user_id 用户id
 * @param oldpassword 旧密码
 * @param newpassword 新密码
 */
let changeUserPassword = function (user_id: string, oldpassword: string, newpassword: string) {
    return new Promise((resolve, reject) => {
        models.t_user.findById(user_id).then(user => {
            if (!user) return resolve(Boom.badRequest('找不到用户'))
            if (md5(oldpassword) !== user.password) {
                return resolve(Boom.badRequest('当前密码输入错误'))
            }
            user.update({ password: md5(newpassword) }).then(result => {
                result ? resolve({ id: result.id }) : resolve(Boom.badRequest('修改密码失败'))
            }).catch(err => {
                reject(err)
            })
        }).catch(err => {
            reject(err)
        })
    })
}

/**
 * 根据用户名获取用户
 * @param email 用户名
 */
let getUsersByEmail = function (email: string) {
    return models.t_user.findAll({
        where: {
            email: email
        },
        attributes: ['id']
    })
}

module.exports.user_info = {
    handler: async function (request, reply) {
        try {
            let user_id = request.params.id;
            if (!user_id) {
                user_id = request.session.uid;
            }
            let user: any = await getUserInfo(user_id)
            if (!user) {
                return reply(Boom.create(400, '用户不存在', { timestamp: Date.now() }))
            }
            let _perm = await getUserPermissionsTree(request, user_id, false)
            let permTree = parseTree(_perm)
            let permissions = await getUserPermissions(user_id, permTree)
            user.permissions = permissions
            // user.fun_permissions = await getUserFunctionPermissions(request, user_id)
            return reply(user)
        }
        catch (err) {
            request.log('error', err)
            reply(Boom.badRequest('获取用户详情失败'))
        }

    }
};

module.exports.user_common_info = {
    handler: async function (request, reply) {
        try {
            let user_id = request.params.id;
            if (!user_id) {
                user_id = request.session.uid;
            }
            let user: any = await getUserInfo(user_id)
            if (!user) {
                return reply(Boom.create(400, '用户不存在', { timestamp: Date.now() }))
            }
            let fun_permissions = await getUserFunctionPermissions(request, user_id)
            return reply({
                user: user,
                fun_permissions: fun_permissions
            })
        }
        catch (err) {
            request.log('error', err)
            reply(Boom.badRequest('获取用户通用数据失败'))
        }
    }
};

module.exports.user_list = {
    handler: async function (request, reply) {
        try {
            let users = await getUserList(request);
            if (users) {
                users = JSON.parse(JSON.stringify(users));
                _.forEach(users.rows, function (user) {
                    user.org_name = user.organization.name;
                    delete user.organization;
                });
            }
            return reply(users);
        } catch (err) {
            request.log('error', err)
            return reply(Boom.badRequest("请求用户列表错误"))
        }
    }
};

module.exports.user_create = {
    handler: async function (request, reply) {
        try {
            const db = request.getDb();
            let _user = request.payload;
            _user.password = md5(_user.password)
            let _permissions = request.payload.permissions;
            if (_permissions.length == 0) return reply(Boom.badRequest('用户权限不能为空'))
            let result = await db.sequelize.transaction(async t => {
                let user = await createUser(t, _user)
                let permissions = await createUserPermissions(t, user.id, _permissions)
                if (permissions) return { id: user.id }
                return Boom.badRequest('创建用户失败')
            })
            return reply(result)
        }
        catch (err) {
            console.log('err: ', err);
            return reply(Boom.badRequest("创建用户失败"))
        }
    }
};

module.exports.user_update = {
    handler: async function (request, reply) {
        try {
            const db = request.getDb();
            let _user = request.payload
            let _permissions = request.payload.permissions;
            let user_id = request.params.id;
            if (_permissions.length == 0) return Boom.badRequest('用户权限不能为空')
            let result = await db.sequelize.transaction(async t => {
                if (_user.password) _user.password = md5(_user.password)
                let user: any = await updateUser(t, user_id, _user)
                if (user === null || user[0] === 0) {
                    return Boom.badRequest("用户不存在");
                }
                user = user[1][0]
                let destroyResult = await destroyUserPermissions(t, user_id)
                let permissions = await createUserPermissions(t, user_id, _permissions)
                if (permissions) return { id: user_id }
                return Boom.badRequest('修改用户失败')
            })
            return reply(result)
        }
        catch (err) {
            request.log('error', err)
            return reply(Boom.badRequest("更新用户失败"))
        }
    }
};

module.exports.login = {
    handler: async function (request, reply) {
        try {
            let email = request.payload.email,
                password = request.payload.password,
                user: any = await login(email, password);
            if (!user) {
                return reply(Boom.create(400, '用户名或密码错误', { timestamp: Date.now() }))
            } else if (user && user.status == 0) {
                return reply(Boom.create(400, '用户已被禁用', { timestamp: Date.now() }))
            } else {
                user.get().permissions = await getUserFunctionPermissions(request, user['id'])
                request.session.uid = user['id'];
                request.session.super = user['type'] === 1;
                return reply(user);
            }
        }
        catch (err) {
            request.log('error', err)
            return reply(Boom.badRequest("登录失败"))
        }
    }
};

module.exports.logout = {
    handler: async function (request, reply) {
        try {
            request.session = {};
            return reply({}).code(204);
        }
        catch (err) {
            request.log('error', err)
            return reply(Boom.badRequest("退出登录失败"))
        }
    }
};

module.exports.user_permissions = {
    handler: async function (request, reply) {
        try {
            let user_id = request.params.id;
            let _perm = await getUserPermissionsTree(request, user_id, false)
            let permTree = parseTree(_perm)
            let permissions = await getUserPermissions(user_id, permTree)
            return reply(permissions)
        }
        catch (err) {
            request.log('error', err)
            return reply(Boom.badRequest("获取用户权限列表失败"))
        }
    }
};

module.exports.user_permissions_tree = {
    handler: async function (request, reply) {
        try {
            let user_id = request.params.id;
            if (!user_id) {
                user_id = request.session.uid;
            }
            if (!user_id) {
                return reply(Boom.badRequest("用户不存在"));
            }
            let org_perms = request.query.org_perms;
            let permissions = await getUserPermissionsTree(request, user_id, org_perms)
            return reply(parseTree(permissions))
        }
        catch (err) {
            request.log('error', err)
            return reply(Boom.badRequest("获取指定用户权限树失败"))
        }
    }
};

module.exports.user_able = {
    handler: async function (request, reply) {
        try {
            let user_id = request.params.id;
            let status = request.payload.status
            let user = await ableUser(user_id, status)
            if (user === null || user[0] === 0) {
                return reply(Boom.badRequest("用户不存在"));
            }
            return reply(user[1][0])
        }
        catch (err) {
            request.log('error', err)
            return reply(Boom.badRequest('修改用户状态失败'))
        }
    }
};

module.exports.user_password_change = {
    handler: async function (request, reply) {
        try {
            let user_id = request.params.id;
            let oldpassword = request.payload.oldpassword;
            let newpassword = request.payload.newpassword;
            if (_.trim(oldpassword) == '' || _.trim(newpassword) == '') {
                return reply(Boom.badRequest("密码不能为空"))
            }
            let user = await changeUserPassword(user_id, oldpassword, newpassword)
            return reply(user)
        }
        catch (err) {
            request.log('error', err)
            return reply(Boom.badRequest('更新密码失败'))
        }
    }
};

module.exports.user_check_email = {
    handler: async function (request, reply) {
        try {
            let email = request.payload.email
            let users = await getUsersByEmail(email)
            if (users.length == 0) {
                return reply({ exist: false })
            }
            return reply({ exist: true })
        }
        catch (err) {
            request.log('error', err)
            return reply(Boom.badRequest('检测失败'))
        }
    }
};
