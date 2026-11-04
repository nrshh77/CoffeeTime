const { test, after } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

process.env.NODE_ENV = "test";
process.env.SESSION_SECRET = "test_secret";
process.env.ADMIN_USERNAME = "admin";
process.env.ADMIN_PASSWORD = "test_password";

const { app, db } = require("../server");

// Тест 1. Перевірка роботи сервера
test("Сервер повертає повідомлення про роботу", async () => {
    const response = await request(app).get("/api");

    assert.equal(response.status, 200);
    assert.equal(response.body.message, "Сервер CoffeeTime працює!");
});

// Тест 2. Перевірка надсилання повідомлення
test("Контактна форма зберігає правильне повідомлення", async () => {
    const response = await request(app)
        .post("/api/messages")
        .send({
            name: "Тестовий користувач",
            email: "test@example.com",
            message: "Це тестове повідомлення"
        });

    assert.equal(response.status, 201);
    assert.equal(response.body.success, true);

    const savedMessage = db
        .prepare("SELECT * FROM messages WHERE id = ?")
        .get(response.body.id);

    assert.equal(savedMessage.email, "test@example.com");
});

// Тест 3. Перевірка некоректної електронної пошти
test("Контактна форма відхиляє неправильну електронну пошту", async () => {
    const response = await request(app)
        .post("/api/messages")
        .send({
            name: "Тестовий користувач",
            email: "wrong-email",
            message: "Це тестове повідомлення"
        });

    assert.equal(response.status, 400);
    assert.equal(response.body.success, false);
});

// Закриття бази даних після тестів
after(() => {
    db.close();
});