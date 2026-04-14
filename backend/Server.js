const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// KONEK DATABASE
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "db_absensi_wisuda",
});

// CEK KONEKSI
db.connect((err) => {
  if (err) {
    console.log("Database gagal konek:", err);
  } else {
    console.log("Database terkoneksi!");
  }
});


// ================= GET USER =================
app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});


// ================= TAMBAH USER =================
app.post("/users", (req, res) => {
  const { username, email, password } = req.body;

  const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
  db.query(sql, [username, email, password], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "User berhasil ditambahkan" });
  });
});


app.listen(5000, () => {
  console.log("Server jalan di http://localhost:5000");
});