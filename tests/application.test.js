const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const express = require("express");
const bodyParser = require("body-parser");

const applicationRoutes = require("../routes/applicationRoutes");
const CreditApplication = require("../models/CreditApplication");
const Clients = require("../models/Clients");
const ApplicationStatus = require("../models/ApplicationStatus");

// Создание временного сервера
let app;
let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  await mongoose.connect(uri);

  app = express();
  app.use(bodyParser.json());
  app.use("/api", applicationRoutes);

  // Добавим тестовый статус, чтобы можно было привязать заявку
  await ApplicationStatus.create({ status: "Поступил" });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  await CreditApplication.deleteMany();
  await Clients.deleteMany();
});

test("✅ Должен создать нового клиента и заявку", async () => {
  const res = await request(app)
    .post("/api/applications/submit")
    .field("full_name", "Тестовый Клиент")
    .field("birthday", "01.01.1990")
    .field("phone_number", "+7(999) 123-45-67")
    .field("email", "test@example.com")
    .field("loan_amount", 500)
    .field("loan_term", 12)
    .attach("file", Buffer.from("test content"), "test.xlsx");

  expect(res.statusCode).toBe(201);

  const client = await Clients.findOne({ full_name: "Тестовый Клиент" });
  expect(client).toBeTruthy();

  const apps = await CreditApplication.find({ id_client: client._id });
  expect(apps.length).toBe(1);
});

test("❌ Не должен создать заявку без файла", async () => {
  const res = await request(app)
    .post("/api/applications/submit")
    .field("full_name", "Без файла")
    .field("birthday", "02.02.2000")
    .field("phone_number", "+7(111) 222-33-44")
    .field("email", "nofile@example.com")
    .field("loan_amount", 100)
    .field("loan_term", 12);

  expect(res.statusCode).toBe(500); // Ошибка из-за отсутствия файла
});

test("✅ Повторный клиент не должен дублироваться", async () => {
  await Clients.create({
    full_name: "Повтор Клиент",
    birthday: "01.01.1980",
    phone_number: "+7(000) 000-00-00",
    email: "repeat@example.com",
    id_client: 99,
  });

  const res = await request(app)
    .post("/api/applications/submit")
    .field("full_name", "Повтор Клиент")
    .field("birthday", "01.01.1980")
    .field("phone_number", "+7(000) 000-00-00")
    .field("email", "repeat@example.com")
    .field("loan_amount", 150)
    .field("loan_term", 24)
    .attach("file", Buffer.from("abc"), "file.xlsx");

  expect(res.statusCode).toBe(201);

  const clients = await Clients.find({ full_name: "Повтор Клиент" });
  expect(clients.length).toBe(1);
});
