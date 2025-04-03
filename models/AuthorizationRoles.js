const mongoose = require("mongoose");

// Определяет схему ролей (AuthorizationRolesSchema)
const AuthorizationRolesSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    unique: true, // Роль должна быть уникальной
    maxlength: 50 // Максимальная длина - 50 символов
  },
  photo: {
    type: mongoose.Schema.Types.ObjectId,
    required: true // Поле для хранения пути к фото роли
  }
});

// ✅ Безопасное подключение модели без переопределения
module.exports =
  mongoose.models.AuthorizationRoles ||
  mongoose.model("AuthorizationRoles", AuthorizationRolesSchema, "AuthorizationRoles");
