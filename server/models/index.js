const sequelize = require('../config/db');
const User = require('./User');
const Folder = require('./Folder');
const Article = require('./Article');

Folder.hasMany(Folder, { as: 'children', foreignKey: 'parentId' });
Folder.hasMany(Article, { foreignKey: 'folderId' });
Article.belongsTo(Folder, { foreignKey: 'folderId' });

const initDB = async () => {
  try {
    await sequelize.sync({ alter: true }); 
    console.log("База данных готова к работе.");
  } catch (error) {
    console.error("Ошибка при создании таблиц:", error);
  }
};

module.exports = { User, Folder, Article, initDB };