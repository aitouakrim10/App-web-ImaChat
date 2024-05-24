const Sequelize = require('sequelize')
const db = require('./database.js')

const groups = db.define('groups', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: Sequelize.STRING(128),
    unique: true,
    allowNull: false
  },
  ownerId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  }
}, {
  timestamps: false,
  tableName: 'groups'
});

module.exports = groups