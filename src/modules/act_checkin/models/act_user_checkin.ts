module.exports = function (sequelize, DataTypes) {
    let act_user_checkin = sequelize.define(
        'act_user_checkin',
        {
            date: {
                type: DataTypes.DATEONLY,
                defaultValue: sequelize.fn('now')
            },
            status: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1
            },
        },
        {
            tableName: 'act_user_checkin',
            timestamps: true,
            classMethods: {
                associate: function (models) {
                    act_user_checkin.belongsTo(models.user, { foreignKey: 'user_id' });
                    act_user_checkin.belongsTo(models.act, { foreignKey: 'act_id' });
                }
            }
        }
    );
    return act_user_checkin
};
