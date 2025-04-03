const mongoose = require("mongoose");
const CreditApplication = require("./models/CreditApplication");
require("dotenv").config();

async function updateExcelReferences() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  const files = await db.collection("fs.files").find({}).toArray();

  let updated = 0;

  for (const file of files) {
    const match = file.filename.match(/loan(\d+)\.xlsx/);
    if (!match) continue;

    const appId = parseInt(match[1]); // loan1.xlsx → 1

    const result = await CreditApplication.updateOne(
      { id_application: appId },
      { $set: { excel_file: file._id } }
    );

    if (result.modifiedCount > 0) {
      console.log(`✅ Обновлено: заявка ${appId} → файл ${file._id}`);
      updated++;
    } else {
      console.warn(`⚠️ Не найдено/не обновлено: заявка ${appId}`);
    }
  }

  console.log(`\n🔄 Всего обновлено: ${updated}`);
  process.exit();
}

updateExcelReferences().catch((err) => {
  console.error("Ошибка:", err);
  process.exit(1);
});
