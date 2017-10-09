module.exports = function (sequelize, DataTypes) {
    let act_news_cof = sequelize.define(
        'act_news_cof',
        {
            types: {
                type: DataTypes.JSON,
                defaultValue:[]
            },
            banners: {
                type: DataTypes.JSON,
                defaultValue:[]
            },
        },
        {
            tableName: 'act_news_cof',
            timestamps: true,
            classMethods: {
                associate: function (models) {
                    act_news_cof.belongsTo(models.act, { foreignKey: 'act_id' });
                }
            }
        }
    );
    return act_news_cof;
};
