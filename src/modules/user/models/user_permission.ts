module.exports = function (sequelize, DataTypes) {
	let user_permission = sequelize.define('user_permission', {
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: sequelize.fn('nextval', 's_user_permission'),
			primaryKey: true
		},
		user_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			unique: true
		},
		org_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		perm_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
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
			tableName: 't_user_permission',
			createdAt: false,
			updatedAt: 'updated_at',
			classMethods: {
				associate: function (models) {
					user_permission.belongsTo(models.t_user, { foreignKey: 'user_id' });
					user_permission.belongsTo(models.organization, { foreignKey: 'org_id' });
					user_permission.belongsTo(models.permission, { foreignKey: 'perm_id' });
				}
			}
		});
	return user_permission
};
