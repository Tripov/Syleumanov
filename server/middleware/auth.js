const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(403).json({ error: "Токен отсутствует" });
  }

  const token = authHeader.split(" ")[1];
  
  if (!token) {
    return res.status(403).json({ error: "Формат токена неверный (нужен Bearer)" });
  }

  try {
    const secret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.error("Ошибка JWT:", err.message);
    res.status(401).json({ error: "Неверный или истекший токен" });
  }
};