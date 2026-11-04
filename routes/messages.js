
const express = require("express");

module.exports = function (db, requireAuth) {
    const router = express.Router();

    // Надсилання повідомлення з контактної форми
    router.post("/", (req, res) => {
        const { name, email, message } = req.body;

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof message !== "string" ||
            name.trim().length < 2 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
            message.trim().length < 5
        ) {
            return res.status(400).json({
                success: false,
                message: "Перевірте правильність заповнення форми."
            });
        }

        const result = db.prepare(`
            INSERT INTO messages (name, email, message)
            VALUES (?, ?, ?)
        `).run(name.trim(), email.trim(), message.trim());

        res.status(201).json({
            success: true,
            message: "Повідомлення успішно збережено!",
            id: result.lastInsertRowid
        });
    });

    // Отримання всіх повідомлень (тільки адміністратор)
    router.get("/", requireAuth, (req, res) => {
        const messages = db.prepare(`
            SELECT id, name, email, message, created_at
            FROM messages
            ORDER BY id DESC
        `).all();

        res.json(messages);
    });

    // Видалення повідомлення (тільки адміністратор)
    router.delete("/:id", requireAuth, (req, res) => {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                success: false,
                message: "Некоректний ID."
            });
        }

        const result = db.prepare(
            "DELETE FROM messages WHERE id = ?"
        ).run(id);

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: "Повідомлення не знайдено."
            });
        }

        res.json({
            success: true,
            message: "Повідомлення видалено."
        });
    });

    return router;
};
