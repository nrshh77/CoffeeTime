
 // Мобільне меню
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

menuToggle.addEventListener("click", function () {
    mainNav.classList.toggle("active");

    const isOpen = mainNav.classList.contains("active");

    menuToggle.setAttribute("aria-expanded", isOpen);
    menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Закрити меню" : "Відкрити меню"
    );

    menuToggle.textContent = isOpen ? "✕" : "☰";
});

// Закриття меню після вибору розділу
const menuLinks = document.querySelectorAll(".nav-menu a");

menuLinks.forEach(function (link) {
    link.addEventListener("click", function () {
        mainNav.classList.remove("active");
        menuToggle.textContent = "☰";
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Відкрити меню");
    });
});

// Динамічна зміна тексту
const moreInfoBtn = document.getElementById("moreInfoBtn");
const moreInfo = document.getElementById("moreInfo");

moreInfoBtn.addEventListener("click", function () {
    if (moreInfo.hidden) {
        moreInfo.hidden = false;
        moreInfoBtn.textContent = "Приховати інформацію";
    } else {
        moreInfo.hidden = true;
        moreInfoBtn.textContent = "Дізнатися більше";
    }
});

// Перемикання світлої та темної теми
const themeToggle = document.getElementById("themeToggle");

const savedTheme = localStorage.getItem("coffeeTheme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
    themeToggle.textContent = "☀️ Світла тема";
}

themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-theme");

    if (document.body.classList.contains("dark-theme")) {
        localStorage.setItem("coffeeTheme", "dark");
        themeToggle.textContent = "☀️ Світла тема";
    } else {
        localStorage.setItem("coffeeTheme", "light");
        themeToggle.textContent = "🌙 Темна тема";
    }
});

// Надсилання контактної форми на сервер
const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");

contactForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    if (name.length < 2) {
        showFormMessage("Введіть ім'я (мінімум 2 символи).", "error");
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showFormMessage("Введіть правильну електронну адресу.", "error");
        return;
    }

    if (message.length < 5) {
        showFormMessage("Повідомлення має містити мінімум 5 символів.", "error");
        return;
    }

    try {
        const response = await fetch("/api/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, message })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Не вдалося надіслати повідомлення.");
        }

        showFormMessage(result.message, "success");
        contactForm.reset();

    } catch (error) {
        showFormMessage(
            error.message || "Помилка з'єднання із сервером.",
            "error"
        );
    }
});

function showFormMessage(text, type) {
    formMessage.textContent = text;
    formMessage.className = type;
}

// Додавання нових карток кави
const coffeeList = [
    {
        name: "Лате",
        description: "Ніжна кава з великою кількістю молока.",
        price: "90 грн"
    },
    {
        name: "Американо",
        description: "Класична кава з м'яким насиченим смаком.",
        price: "65 грн"
    },
    {
        name: "Мокачино",
        description: "Кава з молоком і шоколадним смаком.",
        price: "95 грн"
    }
];

const addCoffeeBtn = document.getElementById("addCoffeeBtn");
const extraCoffeeGrid = document.getElementById("extraCoffeeGrid");

let coffeeIndex = 0;

addCoffeeBtn.addEventListener("click", function () {
    if (coffeeIndex >= coffeeList.length) {
        alert("Усі додаткові види кави вже додано!");
        return;
    }

    const coffee = coffeeList[coffeeIndex];

    const card = document.createElement("article");
    card.className = "coffee-card";

    const content = document.createElement("div");
    content.className = "card-content";

    const title = document.createElement("h3");
    title.textContent = coffee.name;

    const description = document.createElement("p");
    description.textContent = coffee.description;

    const price = document.createElement("p");
    price.className = "price";
    price.textContent = coffee.price;

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn";
    deleteBtn.textContent = "Видалити";

    deleteBtn.addEventListener("click", function () {
        card.remove();
    });

    content.append(title, description, price, deleteBtn);
    card.appendChild(content);
    extraCoffeeGrid.appendChild(card);

    coffeeIndex++;
});
