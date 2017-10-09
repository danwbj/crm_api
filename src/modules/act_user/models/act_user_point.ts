module.exports = function (sequelize, DataTypes) {
    let act_user_point = sequelize.define(
        'act_user_point',
        {
            type: {
                type: DataTypes.STRING,
            },
            point: {
                type: DataTypes.INTEGER,
                defaultValue: 0
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
		    },
            act_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            ext1: {
                type: DataTypes.JSON,
                defaultValue:{}
		    },
            status: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1
            },
        },
        {
            tableName: 'act_user_point',
            timestamps: true,
            classMethods: {
                associate: function (models) {
                    act_user_point.belongsTo(models.user, { foreignKey: 'user_id' });
                    act_user_point.belongsTo(models.act, { foreignKey: 'act_id' });
                }
            }
        }
    );
    return act_user_point
};
