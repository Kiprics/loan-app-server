const jwt = require("jsonwebtoken");

// Middleware для проверки токена
const authMiddleware = (req, res, next) => {
  // Получаем токен из заголовка Authorization
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Нет доступа! Токен отсутствует." });
  }

  try {
    // Проверяем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Добавляем данные пользователя в `req`
    req.user = decoded;
    next(); // Передаем управление следующему middleware

  } catch (error) {
    return res.status(401).json({ message: "Неверный или истекший токен!" });
  }
};

module.exports = authMiddleware;
