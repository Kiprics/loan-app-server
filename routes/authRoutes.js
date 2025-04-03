const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Workers = require("../models/Workers");
const AuthorizationRoles = require("../models/AuthorizationRoles");

const router = express.Router();

// Авторизация сотрудников
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const worker = await Workers.findOne({ username }).populate("id_role");

    if (!worker) {
      return res.status(401).json({ message: "Неверный логин или пароль!" });
    }

    const isMatch = await bcrypt.compare(password, worker.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Неверный логин или пароль!" });
    }

    const token = jwt.sign(
      { id: worker._id, role: worker.id_role.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      role: worker.id_role.role,
      fullName: worker.full_name,
      photo: worker.id_role.photo.toString() // 💥 теперь явно указываем photo
    });

  } catch (error) {
    console.error("Ошибка авторизации:", error);
    res.status(500).json({ message: "Ошибка сервера!" });
  }
});

module.exports = router;
