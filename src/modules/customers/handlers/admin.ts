import * as Boom from 'boom'
import * as Sequelize from 'sequelize'

declare let models: any;

module.exports.customer_info = {
    handler: async function (request, reply) {
        try {
            return reply({success:true})
        }
        catch (err) {
            request.log('error', err)
            return reply(Boom.badRequest('获取机构详情失败'))
        }
    }
}