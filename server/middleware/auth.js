const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_super_secret_key';

module.exports = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ error: "Нет доступа" });

  try {
    const decoded = jwt.verify(token.split(" ")[1], JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: "Неверный токен" });
  }
};