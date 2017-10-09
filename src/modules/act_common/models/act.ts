module.exports = function (sequelize, DataTypes) {
    let act = sequelize.define(
        'act',
        {
            title: {
                type: DataTypes.STRING,
            },
            type: {
                type: DataTypes.STRING,
            },
            desc: {
                type: DataTypes.STRING,
            },
            share: {
                type: DataTypes.JSON,
                defaultValue: { title: '', desc: '', img: '' }
            },
            status: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            config: {
                type: DataTypes.JSON,
            },
            t_user_id: {
                type: DataTypes.INTEGER
            },
            start_time: {
                type:DataTypes.DATE,
            },
            end_time: {
                type:DataTypes.DATE,
            }
        },
        {
            tableName: 'act',
            timestamps: true
        }
    );
    return act;
};
