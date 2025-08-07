// routes/publicLanding.js

const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/database.sqlite');

// Отображение публичного лендинга
router.get('/:username', (req, res) => {
  const { username } = req.params;

  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err || !user) {
      return res.status(404).send("Мастер не найден");
    }

    db.get("SELECT * FROM landings WHERE user_id = ?", [user.id], (err, landing) => {
      if (err || !landing) {
        // Если настроек лендинга нет, можно показать дефолтный
        return res.render('landing', { landing: { title: "Лендинг мастера", contact_info: "Нет контактов" }, username: user.username });
      }

      // Вот здесь мы добавляем username в объект, который передаём в шаблон
      res.render('landing', { landing: landing, username: user.username });
    });
  });
});

// Обработка формы записи
router.post('/:username/book', (req, res) => {
  const { username } = req.params;
  const { client_name, client_contact, date, time } = req.body;

  db.get("SELECT id FROM users WHERE username = ?", [username], (err, user) => {
    if (err || !user) {
      return res.status(404).send("Мастер не найден");
    }

    db.get("SELECT id FROM landings WHERE user_id = ?", [user.id], (err, landing) => {
      if (err || !landing) {
        return res.status(404).send("Лендинг не настроен");
      }

      db.run("INSERT INTO appointments (landing_id, client_name, client_contact, date, time) VALUES (?, ?, ?, ?, ?)", 
        [landing.id, client_name, client_contact, date, time], function(err) {
        if (err) {
          return res.status(500).send("Ошибка при записи");
        }
        res.send("Вы успешно записались!");
      });
    });
  });
});

module.exports = router;