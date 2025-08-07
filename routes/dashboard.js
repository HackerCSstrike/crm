// routes/dashboard.js

const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/database.sqlite');

// Middleware для проверки авторизации
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect('/login');
}

router.use(isAuthenticated);

router.get('/', (req, res) => {
  db.get("SELECT * FROM users WHERE id = ?", [req.session.user.id], (err, user) => {
    if (err) {
      return res.status(500).send("Ошибка сервера");
    }
    res.render('dashboard/index', { user: user });
  });
});

// Настройки лендинга (сохранение)
router.post('/settings', (req, res) => {
  const { title, contact_info, schedule } = req.body;
  const user_id = req.session.user.id;

  db.run("INSERT OR REPLACE INTO landings (user_id, title, contact_info, schedule) VALUES (?, ?, ?, ?)", 
    [user_id, title, contact_info, schedule], function(err) {
    if (err) {
      return res.status(500).send("Ошибка при сохранении настроек");
    }
    res.redirect('/dashboard');
  });
});

// Просмотр записей
router.get('/appointments', (req, res) => {
  const user_id = req.session.user.id;

  db.all("SELECT * FROM appointments WHERE landing_id IN (SELECT id FROM landings WHERE user_id = ?)", [user_id], (err, appointments) => {
    if (err) {
      return res.status(500).send("Ошибка при получении записей");
    }
    res.render('dashboard/appointments', { appointments: appointments });
  });
});

module.exports = router;