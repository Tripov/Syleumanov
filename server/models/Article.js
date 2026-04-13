const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Article = sequelize.define('Article', {
  title: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  order: { type: DataTypes.INTEGER, defaultValue: 0 },
  type: { 
  type: DataTypes.ENUM('markdown', 'pdf'), 
  defaultValue: 'markdown' 
},
fileUrl: { 
  type: DataTypes.STRING, 
  allowNull: true 
}
});

module.exports = Article;