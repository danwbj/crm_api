import * as Boom from 'boom'
import * as Sequelize from 'sequelize'

declare let models: any;

/**
 * 获取机构详情
 * @param organization_id 机构id
 */
let getOrganizationInfo = function (request, organization_id: string) {
    // return request.getDb().sequelize.query(
    //         `select distinct p.id, p.name, p.route 
    //                from t_user_permission u, t_permission p
    //                  where u.perm_id = p.id and u.user_id = ?`,
    //         {
    //             replacements: [user_id],
    //             type: request.getDb().sequelize.QueryTypes.SELECT
    //         }
    //     );
    //select a.*,b.name org_name from t_organization a left join t_organization b on a.org_id = b.id where a.id =1000000007
    return models.organization.findById(organization_id, {
        attributes: {
            include: [[Sequelize.literal(`(SELECT "name" FROM "t_organization" WHERE "t_organization"."id" = "organization"."org_id" and "organization"."id"=${organization_id} )`),
                'org_name']]
        }
    });
}

/**
 * 创建机构
 * @param organization 机构对象
 */
let createOrganization = function (organization: Object) {
    return models.organization.create(organization);
}

/**
 * 更新机构
 * @param organization_id 机构id
 * @param organization 机构对象
 */
let updateOrganization = function (organization_id: string, organization: Object) {
    return models.organization.update(organization, {
        fields: ['name', 'contact', 'mobile', 'address', 'description'],
        where: {
            id: organization_id
        },
        returning: true
    });
}

/**
 * 删除机构
 * @param organization_id 机构id
 */
let deleteOrganization = function (organization_id: string) {
    return new Promise((resolve, reject) => {
        models.organization.findOne({
            where: {
                org_id: organization_id
            }
        }).then(org => {
            if (org) return reject(new Error('该机构下存在子机构，不允许删除'))
            models.organization.destroy({
                where: {
                    id: organization_id
                }
            }).then(result => {
                return resolve(result)
            }).catch(err => {
                reject(err)
            })
        });
    })
}

/**
 * 根据机构名获取机构
 * @param name 机构名
 */
let getOrganizationsByName = function (name: string) {
    return models.organization.findAll({
        where: {
            name: name
        },
        attributes: ['id']
    })
}

module.exports.organization_info = {
    handler: async function (request, reply) {
        try {
            let organization_id = request.params.id;
            let organization = await getOrganizationInfo(request, organization_id)
            return reply(organization)
        }
        catch (err) {
            request.log('error', err)
            return reply(Boom.badRequest('获取机构详情失败'))
        }
    }
}

module.exports.organization_create = {
    handler: async function (request, reply) {
        try {
            let _organization = request.payload;
            let organization = await createOrganization(_organization)
            return reply(organization)
        }
        catch (err) {
            request.log('error', err)
            return reply(Boom.badRequest('创建机构失败'))
        }
    }
}

module.exports.organization_update = {
    handler: async function (request, reply) {
        try {
            let organization_id = request.params.id;
            let _organization = request.payload;
            let organization = await updateOrganization(organization_id, _organization)
            if (organization === null || organization[0] === 0) {
                return reply(Boom.badRequest("机构不存在"));
            }
            return reply(organization[1][0])
        }
        catch (err) {
            request.log('error', err)
            return reply(Boom.badRequest('更新机构失败'))
        }
    }
}

module.exports.organization_delete = {
    handler: async function (request, reply) {
        try {
            let organization_id = request.params.id;
            let result = await deleteOrganization(organization_id)
            return reply(
                result == 0 ? Boom.badRequest('该机构不存在') : { id: organization_id }
            );
        }
        catch (err) {
            request.log('error', err)
            if (err.original && err.original.code === '23503' && err.original.table === 't_media') {
                return reply(Boom.create(400, '请先移除机构内资源再删除机构'))
            }
            if (err.original && err.original.code === '23503' && err.original.table === 't_user') {
                return reply(Boom.create(400, '请先移除机构内用户再删除机构'))
            }
            if (err.original && err.original.code === '23503' && err.original.table === 't_plan') {
                return reply(Boom.create(400, '请先移除机构内方案再删除机构'))
            }
            if (err.original && err.original.code === '23503' && err.original.table === 't_device') {
                return reply(Boom.create(400, '请先移除机构内设备再删除机构'))
            }
            return reply(Boom.badRequest('删除机构失败'))
        }
    }
}

module.exports.organization_check_name = {
    handler: async function (request, reply) {
        let name = request.payload.name
        try {
            let users = await getOrganizationsByName(name)
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
