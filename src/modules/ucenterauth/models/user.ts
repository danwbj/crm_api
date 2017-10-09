module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'user',
        {
            channel: {
                type: DataTypes.JSON,
                defaultValue: []
            },
            client: {
                type: DataTypes.STRING,
                allowNull: false
            },
            openid: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false,
            },
            nickname: {
                type: DataTypes.STRING,
            },
            sex: {
                type: DataTypes.STRING,
            },
            province: {
                type: DataTypes.STRING,
            },
            city: {
                type: DataTypes.STRING,
            },
            country: {
                type: DataTypes.STRING,
            },
            headimgurl: {
                type: DataTypes.STRING,
            },
            privilege: {
                type: DataTypes.JSON,
            },
            unionid: {
                type: DataTypes.STRING,
            },
            ext: {
                type: DataTypes.JSON,
                defaultValue:{}
            }

        },
        {
            tableName: 'user',
            timestamps: true
        }
    );

};