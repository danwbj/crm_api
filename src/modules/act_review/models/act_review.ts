module.exports = function (sequelize, DataTypes) {
    let act_review = sequelize.define(
        'act_review',
        {
            config: {
                type: DataTypes.JSON,
                defaultValue: {}
            },
        },
        {
            tableName: 'act_review',
            timestamps: true,
            classMethods: {
                associate: function (models) {
                    act_review.belongsTo(models.act, { foreignKey: 'act_id' });
                }
            }
        }
    );
    return act_review;
};
