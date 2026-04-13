const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/index');

const JWT_SECRET = 'your_super_secret_key';

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log("Попытка входа:", username, password);

  const user = await User.findOne({ where: { username } });
  
  if (!user) {
    console.log("Пользователь не найден в БД");
    return res.status(401).json({ error: 'Неверные данные' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  console.log("Пароль совпал?:", isMatch);

  if (isMatch) {
    const token = jwt.sign({ id: user.id }, 'your_super_secret_key', { expiresIn: '1d' });
    return res.json({ token });
  }
  
  res.status(401).json({ error: 'Неверные данные' });
});

router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const userCount = await User.count();
        if (userCount > 0) {
            return res.status(403).json({ error: "Регистрация новых администраторов запрещена" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ username, password: hashedPassword });
        res.json({ message: "Единственный админ успешно создан" });
    } catch (e) {
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

module.exports = router;