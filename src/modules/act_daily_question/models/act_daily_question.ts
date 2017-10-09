module.exports = function (sequelize, DataTypes) {
    let act_daily_question = sequelize.define(
        'act_daily_question',
        {
            q: {
                type: DataTypes.JSON,
                defaultValue: {}
            },
            status: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1
            },
        },
        {
            tableName: 'act_daily_question',
            timestamps: true,
            classMethods: {
                associate: function (models) {
                    act_daily_question.belongsTo(models.act, { foreignKey: 'act_id' });
                }
            }
        }
    );
    return act_daily_question
};
