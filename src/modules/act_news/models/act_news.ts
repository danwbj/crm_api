module.exports = function (sequelize, DataTypes) {
    let act_news = sequelize.define(
        'act_news',
        {
            view_count: {
                type: DataTypes.INTEGER,
                defaultValue:0
            },
            share_count: {
                type: DataTypes.INTEGER,
                defaultValue:0
            },
            title: {
                type: DataTypes.STRING,
                allowNull:false
            },
            description: {
                type: DataTypes.STRING,
                allowNull:false
            },
            thumbnail: {
                type: DataTypes.STRING
            },
            info: {
                type: DataTypes.STRING
            },
            share: {
                type: DataTypes.JSON,
                defaultValue:{}
            },
            type: {
                type: DataTypes.STRING,
            },
            news_type: {
                type: DataTypes.INTEGER,
                defaultValue:0
            },
            link: {
                type: DataTypes.STRING,
            },
            sort: {
                type: DataTypes.INTEGER,
            },
        },
        {
            tableName: 'act_news',
            timestamps: true,
            classMethods: {
                associate: function (models) {
                    act_news.belongsTo(models.act, { foreignKey: 'act_id' });
                }
            }
        }
    );
    return act_news;
};
