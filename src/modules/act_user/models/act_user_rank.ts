module.exports = function (sequelize, DataTypes) {
    let act_user_rank = sequelize.define(
        'act_user_rank',
        {
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
            status: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1
            },
        },
        {
            tableName: 'act_user_rank',
            timestamps: true,
            classMethods: {
                associate: function (models) {
                    act_user_rank.belongsTo(models.user, { foreignKey: 'user_id' });
                    act_user_rank.belongsTo(models.act, { foreignKey: 'act_id' });
                }
            }
        }
    );
    return act_user_rank
};
