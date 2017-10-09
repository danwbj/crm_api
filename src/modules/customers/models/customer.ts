module.exports = function (sequelize, DataTypes) {
    let customer = sequelize.define(
        'customer',
        {
            name: {
                type: DataTypes.STRING,
                defaultValue:0
            },
            mobile: {
                type: DataTypes.STRING,
                defaultValue:0
            },
        },
        {
            tableName: 't_customer',
            timestamps: true,
            classMethods: {
                associate: function (models) {
                    // customer.belongsTo(models.act, { foreignKey: 'act_id' });
                }
            }
        }
    );
    return customer;
};
