const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { JWT_SECRET } = require("../middleware/auth");

const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email dan password wajib diisi" });
  }

  db.query("SELECT * FROM users WHERE email = ? AND status = 'active'", [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (results.length === 0) return res.status(401).json({ message: "Email atau password salah" });

    const user = results[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "24h" });

    res.json({
      token,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
        first_login: user.first_login
      }
    });
  });
};

const logout = (req, res) => {
  res.json({ message: "Logout berhasil" });
};

const me = (req, res) => {
  res.json({ user: req.user });
};

const changePassword = (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "Password lama dan baru wajib diisi" });
  }

  db.query("SELECT password_hash FROM users WHERE id = ?", [userId], async (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (results.length === 0) return res.status(404).json({ message: "User tidak ditemukan" });

    const validOld = await bcrypt.compare(oldPassword, results[0].password_hash);
    if (!validOld) return res.status(400).json({ message: "Password lama salah" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    db.query("UPDATE users SET password_hash = ?, first_login = FALSE WHERE id = ?", [hashedPassword, userId], (err2) => {
      if (err2) return res.status(500).json({ message: "Server error" });
      res.json({ message: "Password berhasil diubah" });
    });
  });
};

module.exports = { login, logout, me, changePassword };
