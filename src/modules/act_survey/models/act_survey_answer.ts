module.exports = function (sequelize, DataTypes) {
    let act_survey_answer = sequelize.define(
        'act_survey_answer',
        {
            time_start: {
                type: DataTypes.DATE,
            },
            time_end: {
                type: DataTypes.DATE,
            },
            channel: {
                type: DataTypes.STRING,
            },
            answer: {
                type: DataTypes.JSON,
                defaultValue: []
            }
        },
        {
            tableName: 'act_survey_answer',
            timestamps: true,
            classMethods: {
                associate: function (models) {
                    act_survey_answer.belongsTo(models.act_survey, { foreignKey: 'act_survey_id' });
                    act_survey_answer.belongsTo(models.act, { foreignKey: 'act_id' });
                    act_survey_answer.belongsTo(models.user, { foreignKey: 'user_id' });
                }
            }
        }
    );
    return act_survey_answer;
};
