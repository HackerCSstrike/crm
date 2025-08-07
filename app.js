// app.js

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/database.sqlite');

const app = express();
const PORT = process.env.PORT || 3000;

// Настройка middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// Настройка сессий
app.use(session({
  secret: 'super_secret_key', // Замени на более надежный ключ в продакшене
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // В продакшене используй 'secure: true'
}));

// Инициализация базы данных
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT, fullname TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS landings (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, title TEXT, contact_info TEXT, schedule TEXT, FOREIGN KEY(user_id) REFERENCES users(id))");
  db.run("CREATE TABLE IF NOT EXISTS appointments (id INTEGER PRIMARY KEY AUTOINCREMENT, landing_id INTEGER, client_name TEXT, client_contact TEXT, date TEXT, time TEXT, FOREIGN KEY(landing_id) REFERENCES landings(id))");
});

// Подключение маршрутов
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const publicLandingRoutes = require('./routes/publicLanding');

app.use('/', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/u', publicLandingRoutes);

// Главная страница
app.get('/', (req, res) => {
  res.render('index', { user: req.session.user });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});