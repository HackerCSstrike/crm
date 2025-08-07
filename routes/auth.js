// routes/auth.js

const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/database.sqlite');
const bcrypt = require('bcrypt'); // Используем для хеширования паролей

// Страница входа
router.get('/login', (req, res) => {
  res.render('auth/login');
});

// Обработка входа
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
    if (err || !user) {
      return res.render('auth/login', { error: 'Неверное имя пользователя или пароль.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render('auth/login', { error: 'Неверное имя пользователя или пароль.' });
    }

    req.session.user = { id: user.id, username: user.username };
    res.redirect('/dashboard');
  });
});

// Страница регистрации
router.get('/register', (req, res) => {
  res.render('auth/register');
});

// Обработка регистрации
router.post('/register', async (req, res) => {
  const { fullname, username, password } = req.body;

  // Хеширование пароля
  const hashedPassword = await bcrypt.hash(password, 10);

  db.run("INSERT INTO users (fullname, username, password) VALUES (?, ?, ?)", 
    [fullname, username, hashedPassword], function(err) {
    if (err) {
      // Может быть ошибка, если пользователь с таким именем уже существует
      return res.render('auth/register', { error: 'Пользователь с таким именем уже существует.' });
    }
    // После успешной регистрации сразу авторизуем
    req.session.user = { id: this.lastID, username: username };
    res.redirect('/dashboard');
  });
});

// Выход из аккаунта
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;