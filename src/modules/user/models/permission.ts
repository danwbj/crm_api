module.exports = function (sequelize, DataTypes) {
	return sequelize.define('permission', {
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: sequelize.fn('nextval', 's_permission'),
			primaryKey: true
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		sort: {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		route: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		},
		description: {
			type: DataTypes.STRING,
			allowNull: true
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
			tableName: 't_permission',
			createdAt: false,
			updatedAt: 'updated_at'
		});
};
