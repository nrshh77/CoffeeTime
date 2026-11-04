
const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");
const session = require("express-session");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Підключення бази даних
const db = new Database(
    process.env.NODE_ENV === "test"
        ? ":memory:"
        : path.join(__dirname, "coffeetime.db")
);

// Створення таблиці повідомлень
db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
`);

// Налаштування сервера
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Налаштування сеансу адміністратора
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "strict",
        secure: false,
        maxAge: 1000 * 60 * 60
    }
}));

// Підключення сайту
app.use(express.static(path.join(__dirname, "public")));

// Перевірка авторизації
function requireAuth(req, res, next) {
    if (req.session && req.session.isAdmin) {
        return next();
    }

    return res.status(401).json({
        success: false,
        message: "Потрібно увійти як адміністратор."
    });
}

// Сторінка входу
app.get("/admin/login", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "login.html"));
});

// Авторизація адміністратора
app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;

    if (
        username !== process.env.ADMIN_USERNAME ||
        password !== process.env.ADMIN_PASSWORD
    ) {
        return res.status(401).json({
            success: false,
            message: "Неправильний логін або пароль."
        });
    }

    req.session.isAdmin = true;

    res.json({
        success: true,
        message: "Вхід виконано."
    });
});

// Вихід адміністратора
app.post("/api/auth/logout", requireAuth, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Не вдалося завершити сеанс."
            });
        }

        res.clearCookie("connect.sid");
        res.json({ success: true });
    });
});

// Сторінка повідомлень адміністратора
app.get("/admin/messages", requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, "views", "messages.html"));
});

// Маршрути повідомлень
const messagesRouter = require("./routes/messages");
app.use("/api/messages", messagesRouter(db, requireAuth));

// Перевірка роботи сервера
app.get("/api", (req, res) => {
    res.json({ message: "Сервер CoffeeTime працює!" });
});

// Запуск сервера
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`CoffeeTime працює: http://localhost:${PORT}`);
    });
}

// Експорт для автоматичного тестування
module.exports = { app, db };
