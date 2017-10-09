module.exports = function (sequelize, DataTypes) {
    let act_type_specification = sequelize.define(
        'act_type_specification',
        {
            type: {
                type: DataTypes.STRING,
            },
            status: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1
            },
        },
        {
            tableName: 'act_type_specification',
            timestamps: true,
            classMethods: {
                associate: function (models) {
                    act_type_specification.belongsTo(models.act_specification, { foreignKey: 'act_specification_id' });
                }
            }
        }
    );
    return act_type_specification;
};
