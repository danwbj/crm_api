module.exports = function (sequelize, DataTypes) {
	return sequelize.define('organization', {
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: sequelize.fn('nextval', 's_organization'),
			primaryKey: true
		},
		org_id: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		},
		contact: {
			type: DataTypes.STRING,
			allowNull: false
		},
		mobile: {
			type: DataTypes.STRING,
			allowNull: false
		},
		address: {
			type: DataTypes.STRING,
			allowNull: false
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
			tableName: 't_organization',
			createdAt: false,
			updatedAt: 'updated_at'
		});
};
