const mongoose = require("mongoose");

const CreditApplicationSchema = new mongoose.Schema({
  id_application: {
    type: Number,
    unique: true,
    required: true,
  },
  id_client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Clients",
    required: true,
  },
  loan_amount: {
    type: Number,
    required: true,
    min: 50,
    max: 70000,
  },
  loan_term: {
    type: Number,
    required: true,
    min: 12,
    max: 120,
  },
  excel_file: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  id_status: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ApplicationStatus",
    required: true,
  },
  id_rate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ApplicationRate",
    default: null,
  },
});

module.exports = mongoose.model("CreditApplication", CreditApplicationSchema, "CreditApplication");
