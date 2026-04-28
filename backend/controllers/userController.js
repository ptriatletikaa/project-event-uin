const bcrypt = require("bcrypt");
const db = require("../config/db");

const getAllUsers = (req, res) => {
  const { role } = req.query;
  let sql = "SELECT id, nama, email, role, status, first_login, created_at FROM users";
  const params = [];

  if (role) {
    sql += " WHERE role = ?";
    params.push(role);
  }

  sql += " ORDER BY created_at DESC";

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });
    res.json(results);
  });
};

const createUser = (req, res) => {
  const { nama, email, password, role } = req.body;

  if (!nama || !email || !password || !role) {
    return res.status(400).json({ message: "Semua field wajib diisi" });
  }

  if (!["admin_sistem", "admin_lapangan"].includes(role)) {
    return res.status(400).json({ message: "Role tidak valid" });
  }

  db.query("SELECT id FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (results.length > 0) return res.status(400).json({ message: "Email sudah terdaftar" });

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query("INSERT INTO users (nama, email, password_hash, role) VALUES (?, ?, ?, ?)", [nama, email, hashedPassword, role], (err2, result) => {
      if (err2) return res.status(500).json({ message: "Server error" });
      res.status(201).json({ message: "User berhasil dibuat", id: result.insertId });
    });
  });
};

const updateUser = (req, res) => {
  const { id } = req.params;
  const { nama, email, role, status } = req.body;

  if (!nama || !email || !role) {
    return res.status(400).json({ message: "Nama, email, dan role wajib diisi" });
  }

  if (!["admin_sistem", "admin_lapangan"].includes(role)) {
    return res.status(400).json({ message: "Role tidak valid" });
  }

  db.query("UPDATE users SET nama = ?, email = ?, role = ?, status = ? WHERE id = ?", [nama, email, role, status || "active", id], (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (result.affectedRows === 0) return res.status(404).json({ message: "User tidak ditemukan" });
    res.json({ message: "User berhasil diupdate" });
  });
};

const deleteUser = (req, res) => {
  const { id } = req.params;

  db.query("UPDATE users SET status = 'inactive' WHERE id = ? AND role != 'admin_sistem'", [id], (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (result.affectedRows === 0) return res.status(404).json({ message: "User tidak ditemukan atau tidak bisa dihapus" });
    res.json({ message: "User berhasil dinonaktifkan" });
  });
};

const resetPassword = (req, res) => {
  const { id } = req.params;
  const defaultPassword = "password123";

  db.query("SELECT role FROM users WHERE id = ?", [id], async (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (results.length === 0) return res.status(404).json({ message: "User tidak ditemukan" });

    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    db.query("UPDATE users SET password_hash = ?, first_login = TRUE WHERE id = ?", [hashedPassword, id], (err2) => {
      if (err2) return res.status(500).json({ message: "Server error" });
      res.json({ message: `Password berhasil direset menjadi "${defaultPassword}"` });
    });
  });
};

module.exports = { getAllUsers, createUser, updateUser, deleteUser, resetPassword };
