module.exports = function (sequelize, DataTypes) {
    let act_exam = sequelize.define(
        'act_exam',
        {
            answers: {
                type: DataTypes.JSON,
                defaultValue:{}
            },
            scores: {
                type: DataTypes.JSON,
                defaultValue:{}
            },
            status: {
                type: DataTypes.INTEGER,
                defaultValue:0
            },
            owner_teacher_id: {
              type: DataTypes.INTEGER,
            },
            check_time: {
                type:DataTypes.DATE
            },
            is_push: {
                type: DataTypes.INTEGER,
                defaultValue:0
            },
            ext: {
                type: DataTypes.JSON,
                defaultValue:{}
            }
        },
        {
            tableName: 'act_exam',
            timestamps: true,
            classMethods: {
                associate: function (models) {
                    act_exam.belongsTo(models.act, { foreignKey: 'act_id' });
                    act_exam.belongsTo(models.act_review_student, { foreignKey: 'student_id' });
                    act_exam.belongsTo(models.act_review_teacher, { foreignKey: 'act_review_teacher_id' });
                }
            }
        }
    );
    return act_exam;
};
