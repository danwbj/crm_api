import * as Boom from 'boom'
import * as _ from 'lodash'

import config from '../../../config/config'

const uploader = require('../utils/uploader');

module.exports.upload = {
    payload: {
        output: 'stream',
        parse: true,
        maxBytes: 1048576000,
        allow: 'multipart/form-data' // Important
    },
    handler: async function (request, reply) {
        try {
            const data = request.payload;
            const file = data['file'];
            let options = data['options']
            if (options) {
                options = JSON.parse(options)
            }
            if (!file) {
                return reply(Boom.badRequest('没有文件被上传'))
            }
            const fileOptions = {
                dest: `${config.upload.path}/`
            };
            const fileDetails = await uploader(file, _.merge(fileOptions, options));
            reply(fileDetails)
        }
        catch (err) {
            request.log('error',err)
            reply(Boom.badRequest(err.message))
        }
    }
}
