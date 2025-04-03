const mongoose = require("mongoose");

const ApplicationRateSchema = new mongoose.Schema({
  percent: {
    type: Number,
    required: true,
  },
  payment: {
    type: Number,
    required: true,
  }
});

// ✅ Безопасное подключение модели
module.exports = mongoose.models.ApplicationRate || mongoose.model("ApplicationRate", ApplicationRateSchema, "ApplicationRate");
