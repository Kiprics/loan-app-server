const mongoose = require("mongoose");

// Определяет схему статуса заявки (ApplicationStatusSchema)
const ApplicationStatusSchema = new mongoose.Schema({
  status: { 
    type: String, 
    required: true, 
    unique: true, // Статус должен быть уникальным
    maxlength: 100 // Максимальная длина - 100 символов
  }
});

// Экспортирует модель ApplicationStatus
module.exports = mongoose.model("ApplicationStatus", ApplicationStatusSchema, "ApplicationStatus");
