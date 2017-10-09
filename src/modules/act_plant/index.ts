import * as Plugo from 'plugo'

exports.register = (plugin, options, next) => {
    Plugo.expose({ name: 'handlers', path: __dirname + '/handlers' }, plugin, function () {
        let handlers = plugin.plugins.act_plant.handlers;

        plugin.route([
            // Application Routes
            { method: 'GET', path: '/act/plant', config: handlers.Admin.hello },

            // 获取活动详情
            { method: 'GET', path: '/act/plant/{act_id}', config: handlers.Client.plant_info },

            // 分享活动
            { method: 'POST', path: '/act/plant/share/{id}', config: handlers.Client.share },

            //助力
            { method: 'POST', path: '/act/plant/{act_id}/help/{to_user_id}', config: handlers.Client.help },
        ]);
        next()
    });
};

exports.register.attributes = {
    name: 'act_plant'
};
