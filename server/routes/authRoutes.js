const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/index');
require('dotenv').config();

const secret = process.env.JWT_SECRET;

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = await User.findOne({ where: { username } });
    
    if (!user) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Неверный пароль' });
    }

    // Создаем токен на 24 часа
    const token = jwt.sign({ id: user.id }, secret, { expiresIn: '1d' });
    
    res.json({ token });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера при входе' });
  }
});

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userCount = await User.count();
        if (userCount > 0) {
            return res.status(403).json({ error: "Регистрация запрещена (админ уже есть)" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ username, password: hashedPassword });
        res.json({ message: "Администратор создан" });
    } catch (e) {
        res.status(500).json({ error: "Ошибка при регистрации" });
    }
});

module.exports = router;