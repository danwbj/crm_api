module.exports = function (sequelize, DataTypes) {
    let act_feedback_cof = sequelize.define(
        'act_feedback_cof',
        {
            banners:{
                type:DataTypes.JSON,
                defaultValue:[]
            }
        },
        {
            tableName: 'act_feedback_cof',
            timestamps: true,
            classMethods: {
                associate: function (models) {
                    act_feedback_cof.belongsTo(models.act, { foreignKey: 'act_id' });
                }
            }
        }
    );
    return act_feedback_cof
};
