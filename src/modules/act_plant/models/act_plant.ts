module.exports = function (sequelize, DataTypes) {
    let act_plant = sequelize.define(
        'act_plant',
        {
            config: {
                type: DataTypes.JSON,
                defaultValue: {}
            },
            point: {
                type: DataTypes.INTEGER,
                defaultValue: 0
            },
            status: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1
            },
        },
        {
            tableName: 'act_plant',
            timestamps: true,
            classMethods: {
                associate: function (models) {
                    act_plant.belongsTo(models.act, { foreignKey: 'act_id' });
                }
            }
        }
    );
    return act_plant
};
