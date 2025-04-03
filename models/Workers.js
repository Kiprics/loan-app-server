const mongoose = require("mongoose");

// Определяет схему сотрудника (WorkersSchema)
const WorkersSchema = new mongoose.Schema({
  full_name: { 
    type: String, 
    required: true, 
    maxlength: 100 // Максимальная длина ФИО - 100 символов
  },
  id_role: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "AuthorizationRoles", // Связь с коллекцией AuthorizationRoles
    required: true 
  },
  username: { 
    type: String, 
    required: true, 
    unique: true, // Логин должен быть уникальным
    maxlength: 50 // Максимальная длина логина - 50 символов
  },
  password: { 
    type: String, 
    required: true, 
    maxlength: 100 // Максимальная длина пароля - 100 символов (захеширован)
  }
});

// Экспортируем модель Workers
module.exports = mongoose.model("Workers", WorkersSchema, "Workers");
