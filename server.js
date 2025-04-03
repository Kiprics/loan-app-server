require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path"); // 💡 Добавлено для работы с путями

// Импорт middleware для защиты маршрутов
const authMiddleware = require("./middleware/authMiddleware");

// Создаем приложение Express
const app = express();

// Миддлвары
app.use(cors());
app.use(express.json());

// Подключаемся к MongoDB
mongoose.connect(process.env.MONGO_URI, {});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "❌ Ошибка подключения к MongoDB:"));
db.once("open", async () => {
  console.log("✅ MongoDB подключена!");
});

// Простейший маршрут (тест API)
app.get("/api", (req, res) => res.send("API работает!"));

// Подключаем маршруты
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const applicationRoutes = require("./routes/applicationRoutes");
app.use("/api", applicationRoutes);

const fileRoutes = require("./routes/fileRoutes");
app.use("/api", fileRoutes);

// Пример защищенного маршрута (только авторизованные пользователи)
app.get("/api/protected-route", authMiddleware, (req, res) => {
  res.json({
    message: "🔒 Доступ разрешен!",
    user: req.user, // id и role сотрудника из токена
  });
});

// ⚠️ Раздача фронтенда (React Build)
app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Запускаем сервер на указанном порту
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Сервер запущен на порту ${PORT}`));
