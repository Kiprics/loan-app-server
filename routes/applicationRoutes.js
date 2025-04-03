const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");

const CreditApplication = require("../models/CreditApplication");
const Clients = require("../models/Clients");
const ApplicationStatus = require("../models/ApplicationStatus");
const ApplicationRate = require("../models/ApplicationRate");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// 📥 Получить заявки по статусу
router.get("/applications/status/:status", async (req, res) => {
  try {
    const statusName = req.params.status;
    const status = await ApplicationStatus.findOne({ status: statusName });
    if (!status) return res.status(404).json({ message: "Статус не найден" });

    const applications = await CreditApplication.find({ id_status: status._id })
      .populate("id_client")
      .populate("id_rate")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (err) {
    console.error("Ошибка получения заявок:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// ✅ Проверено — смена статуса на "Проверен"
router.put("/applications/:id/verify", async (req, res) => {
  try {
    const status = await ApplicationStatus.findOne({ status: "Проверен" });
    if (!status) return res.status(404).json({ message: "Статус 'Проверен' не найден" });

    await CreditApplication.findByIdAndUpdate(req.params.id, {
      id_status: status._id,
    });

    res.sendStatus(200);
  } catch (error) {
    console.error("Ошибка при проверке заявки:", error);
    res.status(500).json({ message: "Ошибка сервера при проверке" });
  }
});

// ✅ Одобрить — смена статуса на "Одобрен"
router.put("/applications/:id/approve", async (req, res) => {
  try {
    const status = await ApplicationStatus.findOne({ status: "Одобрен" });
    if (!status) return res.status(404).json({ message: "Статус 'Одобрен' не найден" });

    await CreditApplication.findByIdAndUpdate(req.params.id, {
      id_status: status._id,
    });

    res.sendStatus(200);
  } catch (error) {
    console.error("Ошибка при одобрении заявки:", error);
    res.status(500).json({ message: "Ошибка сервера при одобрении" });
  }
});

// ✅ Оформить — смена статуса на "Оформлен" + установка тарифа
router.put("/applications/:id/complete", async (req, res) => {
  try {
    const { id_rate } = req.body;
    if (!id_rate) return res.status(400).json({ message: "id_rate обязателен" });

    const status = await ApplicationStatus.findOne({ status: "Оформлен" });
    if (!status) return res.status(404).json({ message: "Статус 'Оформлен' не найден" });

    await CreditApplication.findByIdAndUpdate(req.params.id, {
      id_status: status._id,
      id_rate: id_rate,
    });

    res.sendStatus(200);
  } catch (error) {
    console.error("Ошибка при оформлении заявки:", error);
    res.status(500).json({ message: "Ошибка сервера при оформлении" });
  }
});

// ❌ Удалить заявку
router.delete("/applications/:id", async (req, res) => {
  try {
    await CreditApplication.findByIdAndDelete(req.params.id);
    res.sendStatus(200);
  } catch (error) {
    console.error("Ошибка при удалении заявки:", error);
    res.status(500).json({ message: "Ошибка сервера при удалении" });
  }
});

// 📊 Получить все тарифы
router.get("/rates", async (req, res) => {
  try {
    const rates = await ApplicationRate.find();
    res.json(rates);
  } catch (err) {
    console.error("Ошибка загрузки тарифов:", err);
    res.status(500).json({ message: "Ошибка сервера при получении тарифов" });
  }
});

// 📊 Получить кредитные активности (оформленные и выплаченные заявки)
router.get("/applications/activities", async (req, res) => {
  try {
    const statuses = await ApplicationStatus.find({
      status: { $in: ["Оформлен", "Выплачен"] },
    });

    const statusIds = statuses.map((s) => s._id);

    const applications = await CreditApplication.find({ id_status: { $in: statusIds } })
      .populate("id_client")
      .populate("id_status")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error("Ошибка получения активностей:", error);
    res.status(500).json({ message: "Ошибка сервера при получении активностей" });
  }
});

// 🆕 ✅ Подать заявку пользователем
router.post("/applications/submit", upload.single("file"), async (req, res) => {
  try {
	  
	console.log("📥 ЗАПРОС ПОЛУЧЕН НА /applications/submit");

    // ЛОГИРУЕМ ВСЁ:
    console.log("➡️ req.body:", req.body);
    console.log("📎 req.file:", req.file);
	
	
    const {
      full_name,
      birthday,
      phone_number,
      email,
      loan_amount,
      loan_term
    } = req.body;

    let client = await Clients.findOne({ full_name, birthday });

    if (client) {
      if (client.phone_number !== phone_number || client.email !== email) {
        client.phone_number = phone_number;
        client.email = email;
        await client.save();
      }
    } else {
      const lastClient = await Clients.findOne().sort({ id_client: -1 });
      const newIdClient = lastClient?.id_client ? lastClient.id_client + 1 : 1;

      client = await Clients.create({
        full_name,
        birthday,
        phone_number,
        email,
        id_client: newIdClient
      });
    }

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: "fs"
    });

    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype
    });

    const fileId = uploadStream.id;

    uploadStream.end(req.file.buffer);

    uploadStream.on("finish", async () => {
      const status = await ApplicationStatus.findOne({ status: "Поступил" });
      if (!status) return res.status(400).json({ message: "Статус 'Поступил' не найден" });



      // 🔽 Генерация следующего id_application
      const lastApplication = await CreditApplication.findOne().sort({ id_application: -1 });
      const newIdApplication = lastApplication?.id_application ? lastApplication.id_application + 1 : 1;

      const application = await CreditApplication.create({
        id_application: newIdApplication,
        id_client: client._id,
        loan_amount,
        loan_term,
        excel_file: fileId,
        id_status: status._id,
        id_rate: null,
      });

      res.status(201).json({ message: "Заявка подана!", id: application._id });
    });

    uploadStream.on("error", (err) => {
      console.error("Ошибка загрузки файла:", err);
      res.status(500).json({ message: "Ошибка при сохранении файла в GridFS" });
    });
  } catch (err) {
    console.error("Ошибка подачи заявки:", err);
    res.status(500).json({ message: "Ошибка сервера при подаче" });
  }
});


module.exports = router;
