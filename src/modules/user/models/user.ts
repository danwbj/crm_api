module.exports = function (sequelize, DataTypes) {
	let user = sequelize.define('t_user', {
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: sequelize.fn('nextval', 's_user'),
			primaryKey: true
		},
		org_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		mobile: {
			type: DataTypes.STRING,
			allowNull: false
		},
		avatar: {
			type: DataTypes.STRING,
			allowNull: false
		},
		type: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0
		},
		status: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 1
		},
		created_at: {
			type: DataTypes.TIME,
			allowNull: false,
			defaultValue: sequelize.fn('now')
		},
		updated_at: {
			type: DataTypes.TIME,
			allowNull: false,
			defaultValue: sequelize.fn('now')
		}
	}, {
			tableName: 't_user',
			createdAt: false,
			updatedAt: 'updated_at',
			classMethods: {
				associate: function (models) {
					user.belongsTo(models.organization, { foreignKey: 'org_id' });
				}
			}
		});
	return user
};
