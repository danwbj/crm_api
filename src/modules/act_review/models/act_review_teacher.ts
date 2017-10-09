module.exports = function (sequelize, DataTypes) {
    let act_review_teacher = sequelize.define(
        'act_review_teacher',
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            mobile: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            perm: {
                type: DataTypes.JSON,
                defaultValue:[]
            },
            ext: {
                type: DataTypes.JSON,
                defaultValue:{}
            }
        },
        {
            tableName: 'act_review_teacher',
            timestamps: true,
            classMethods: {
                associate: function (models) {
                    act_review_teacher.belongsTo(models.act, { foreignKey: 'act_id' });
                    act_review_teacher.belongsTo(models.act_review, { foreignKey: 'act_review_id' });
                }
            }
        }
    );
    return act_review_teacher;
};
