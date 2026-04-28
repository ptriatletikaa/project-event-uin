const express = require("express");
const router = express.Router();

// LOGIN
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // sementara dummy dulu (biar bisa test)
  if (email === "admin@event.com" && password === "123456") {
    return res.json({
      token: "dummy_token",
      user: {
        id: 1,
        nama: "Admin",
        email,
        role: "admin_sistem"
      }
    });
  }

  return res.status(401).json({ message: "Email atau password salah" });
});

module.exports = router;