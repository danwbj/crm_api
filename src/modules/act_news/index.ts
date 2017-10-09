import * as Plugo from 'plugo'

exports.register = (plugin, options, next) => {
    Plugo.expose({ name: 'handlers', path: __dirname + '/handlers' }, plugin, function () {
        let handlers = plugin.plugins.act_news.handlers;

        plugin.route([

            // =========================client 客户端=========================
            // 新闻配置
            { method: 'GET', path: '/act/news/{act_id}/conf', config: handlers.Client.news_configuration },

            // 新闻列表
            { method: 'GET', path: '/act/news/{act_id}', config: handlers.Client.news_list },

            // 新闻详情
            { method: 'GET', path: '/act/news/{id}/info', config: handlers.Client.news_info },

            // 新闻转发记录
            { method: 'PUT', path: '/act/news/{id}/share', config: handlers.Client.news_share },


            // =========================admin 管理端=========================
            // 新增新闻
            { method: 'POST', path: '/act/{id}/news', config: handlers.Admin.news_create },

            // 修改
            { method: 'PUT', path: '/act/news/{id}', config: handlers.Admin.news_update },

            // 删除
            { method: 'DELETE', path: '/act/news/{id}', config: handlers.Admin.news_delete },

            // 更新新闻配置
            { method: 'PUT', path: '/act/news/{act_id}/conf', config: handlers.Admin.hello },

            // 获取新闻配置
            { method: 'GET', path: '/act/{id}/news/conf', config: handlers.Admin.new_cof_info },

            // 新闻列表
            { method: 'GET', path: '/act/{id}/news', config: handlers.Admin.news_list },

            // 新闻详情
            { method: 'GET', path: '/act/news/{id}/admin_info', config: handlers.Admin.news_info },

            // banner列表
            { method: 'GET', path: '/act/{id}/banners', config: handlers.Admin.banner_list },

            // banner创建
            { method: 'POST', path: '/act/{id}/banners', config: handlers.Admin.banner_create },

            // banner删除
            { method: 'DELETE', path: '/act/{id}/banners/{uuid}', config: handlers.Admin.banner_delete },

            // banner修改
            { method: 'PUT', path: '/act/{id}/banners/{uuid}', config: handlers.Admin.banner_update },


        ]);
        next()
    });
};

exports.register.attributes = {
    name: 'act_news'
};
