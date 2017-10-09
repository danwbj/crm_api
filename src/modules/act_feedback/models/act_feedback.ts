module.exports = function (sequelize, DataTypes) {
    let act_feedback = sequelize.define(
        'act_feedback',
        {
            name:{
                type:DataTypes.STRING,
                allowNull:true
            },
            tel:{
                type:DataTypes.STRING,
                allowNull:true
            },
            content: {
                type: DataTypes.STRING,
                allowNull:false
            },
            screenshot:{
                type:DataTypes.STRING
            },
            status:{
                type:DataTypes.INTEGER,
                defaultValue:0
            },
        },
        {
            tableName: 'act_feedback',
            timestamps: true,
            classMethods: {
                associate: function (models) {
                    act_feedback.belongsTo(models.act, { foreignKey: 'act_id' });
                    act_feedback.belongsTo(models.user, { foreignKey: 'user_id' });
                }
            }
        }
    );
    return act_feedback
};
