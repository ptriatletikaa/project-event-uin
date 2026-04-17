const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "db_absensi_wisuda",
});

db.connect((err) => {
  if (err) console.log(err);
  else console.log("Database terkoneksi!");
});

// GET USER
app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, result) => {
    if (err) return res.json(err);
    res.json(result);
  });
});

// INSERT USER (FIX EMAIL)
app.post("/users", (req, res) => {
  const { nama, nim, email } = req.body;

  const sql = "INSERT INTO users (nama, nim, email) VALUES (?, ?, ?)";

  db.query(sql, [nama, nim, email], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Login berhasil & data tersimpan" });
  });
});

app.listen(5000, () => console.log("Server jalan di port 5000"));