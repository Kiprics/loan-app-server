const express = require("express");
const mongoose = require("mongoose");
const { GridFSBucket, ObjectId } = require("mongodb");
const mime = require("mime-types");

const router = express.Router();

let bucket;

mongoose.connection.once("open", () => {
  bucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: "fs",
  });
});

// 🎯 GET /api/files/:id — отдать файл из GridFS
router.get("/files/:id", async (req, res) => {
  try {
    const fileId = req.params.id;

    if (!ObjectId.isValid(fileId)) {
      return res.status(400).json({ message: "Некорректный ID файла" });
    }

    const _id = new ObjectId(fileId);

    const files = await mongoose.connection.db
      .collection("fs.files")
      .find({ _id })
      .toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({ message: "Файл не найден" });
    }

    const file = files[0];
    const mimeType =
      file.contentType || mime.lookup(file.filename) || "application/octet-stream";

    res.set("Content-Type", mimeType);

    // Определяем, inline или attachment
   const isInline =
	  mimeType.startsWith("image/") ||
	  mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

	res.set(
	  "Content-Disposition",
	  `${isInline ? "inline" : "attachment"}; filename="${file.filename}"`
	);


    bucket.openDownloadStream(_id).pipe(res);
  } catch (err) {
    console.error("Ошибка при получении файла:", err);
    res.status(500).json({ message: "Ошибка при получении файла" });
  }
});

module.exports = router;
