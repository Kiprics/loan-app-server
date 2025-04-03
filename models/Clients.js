const mongoose = require("mongoose");

// Определяет схему клиента (ClientsSchema) с полями:
const ClientsSchema = new mongoose.Schema({
  id_client: { 
    type: Number, 
    required: true, 
    unique: true // Уникальный ID клиента
  },
  full_name: { 
    type: String, 
    required: true, 
    maxlength: 100 // Максимальная длина ФИО - 100 символов
  },
  birthday: { 
    type: String, 
    required: true // Дата рождения в формате YYYY-MM-DD
  },
  phone_number: { 
    type: String, 
    required: true // Обязательный номер телефона
  },
  email: { 
    type: String, 
    required: true, 
    maxlength: 50 // Максимальная длина email - 50 символов
  }
});

// Экспортирует модель Clients
module.exports = mongoose.model("Clients", ClientsSchema, "Clients");
