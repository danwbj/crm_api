module.exports = function (sequelize, DataTypes) {
    let act_survey_question = sequelize.define(
        'act_survey_question',
        {
            title: {
                type: DataTypes.STRING,
            },
            description: {
                type: DataTypes.STRING,
            },
            type: {
                type: DataTypes.STRING,
            },
            required: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            validate: {
                type: DataTypes.STRING,
            },
            sort: {
                type: DataTypes.INTEGER,
            },
            page: {
                type: DataTypes.INTEGER,
            },
            rows: {
                type: DataTypes.INTEGER,
            },
            cols: {
                type: DataTypes.INTEGER,
            },
            starNum: {
                type: DataTypes.INTEGER,
            },
            starShow: {
                type: DataTypes.STRING,
            },
            starShowCustomEnd: {
                type: DataTypes.STRING,
            },
            starShowCustomStart: {
                type: DataTypes.STRING,
            },
            starType: {
                type: DataTypes.STRING,
                defaultValue: "default"
            },
            options: {
                type: DataTypes.JSON,
                defaultValue: {}
            }
        },
        {
            tableName: 'act_survey_question',
            timestamps: true,
            classMethods: {
                associate: function (models) {
                    act_survey_question.belongsTo(models.act_survey, { foreignKey: 'act_survey_id' });
                    act_survey_question.belongsTo(models.act, { foreignKey: 'act_id' });
                }
            }
        }
    );
    return act_survey_question;
};
