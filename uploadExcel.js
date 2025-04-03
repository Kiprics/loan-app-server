const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const { GridFSBucket } = require("mongodb");
require("dotenv").config();

async function uploadFiles() {
  await mongoose.connect(process.env.MONGO_URI);

  const db = mongoose.connection.db;
  const bucket = new GridFSBucket(db, { bucketName: "fs" });

  const folderPath = path.join(__dirname, "excel");
  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    const filePath = path.join(folderPath, file);

    // Удалим предыдущую версию файла (по имени)
    const existing = await db.collection("fs.files").findOne({ filename: file });
    if (existing) {
      console.log(`Удаление старой версии: ${file}`);
      await db.collection("fs.files").deleteOne({ _id: existing._id });
      await db.collection("fs.chunks").deleteMany({ files_id: existing._id });
    }

    // Загрузим новую
    const stream = fs.createReadStream(filePath);
    const uploadStream = bucket.openUploadStream(file);
    stream.pipe(uploadStream);

    await new Promise((resolve, reject) => {
      uploadStream.on("finish", () => {
        console.log(`✅ Загружено: ${file} (id: ${uploadStream.id})`);
        resolve();
      });
      uploadStream.on("error", reject);
    });
  }

  console.log("📁 Все файлы обновлены.");
  process.exit();
}

uploadFiles().catch((err) => {
  console.error("Ошибка загрузки:", err);
  process.exit(1);
});
