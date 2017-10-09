module.exports = function (sequelize, DataTypes) {
    let act_survey = sequelize.define(
        'act_survey',
        {
            title: {
                type: DataTypes.STRING,
            },
            prefix: {
                type: DataTypes.STRING,
            },
            suffix: {
                type: DataTypes.STRING,
            },
            purpose: {
                type: DataTypes.STRING,
            },
            style: {
                type: DataTypes.JSON,
                defaultValue: {}
            },
            config: {
                type: DataTypes.JSON,
                defaultValue: {}
            },
            scan_count: {
                type: DataTypes.INTEGER,
                defaultValue: 0
            },
            status: {
                type: DataTypes.INTEGER,
                defaultValue: 0
            }
        },
        {
            tableName: 'act_survey',
            timestamps: true,
            classMethods: {
                associate: function (models) {
                    act_survey.belongsTo(models.act, { foreignKey: 'act_id' });
                }
            }
        }
    );
    return act_survey;
};
