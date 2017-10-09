module.exports = function (sequelize, DataTypes) {
    let act_specification = sequelize.define(
        'act_specification',
        {
            name: {
                type: DataTypes.STRING,
            },
            module: {
                type: DataTypes.STRING,
            },
            ext: {
                type: DataTypes.JSON,
            },
            sort: {
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
            tableName: 'act_specification',
            timestamps: true
        }
    );
    return act_specification;
};
