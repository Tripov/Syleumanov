const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Folder = sequelize.define('Folder', {
  name: { type: DataTypes.STRING, allowNull: false },
  parentId: { type: DataTypes.INTEGER, allowNull: true },
  slug: { type: DataTypes.STRING, allowNull: true }
});

module.exports = Folder;