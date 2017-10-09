import * as Boom from 'boom'
import * as Sequelize from 'sequelize'
import * as _ from 'lodash'

declare let models: any;

let getActById = function (t: any, id: number) {
    return models.act.findOne({ where: { id: id }, transaction: t })
}

module.exports.act_info = {
    handler: function (request, reply) {
        let act_id = request.params.act_id
        const db = request.getDb()
        db.sequelize.transaction(async t => {
            let act = await getActById(t, act_id)
            return act
        }).then(result => {
            return reply(result)
        }).catch(err => {
            return reply(Boom.badRequest(err.message))
        });
    }
}