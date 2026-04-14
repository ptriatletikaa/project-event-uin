const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// KONEKSI DATABASE
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "db_absensi_wisuda",
});

db.connect((err) => {
  if (err) {
    console.log("Database error:", err);
  } else {
    console.log("Database connected");
  }
});

// TEST SERVER
app.get("/", (req, res) => {
  res.send("Backend jalan");
});

app.post("/wisudawan", (req, res) => {
  const { nama, nim } = req.body;
  const ket = req.body.ket || "Hadir";

  if (!nama || !nim) {
    return res.status(400).send("Nama dan NIM wajib diisi");
  }

  // Try inserting with a status/ket column if the schema supports it.
  const sqlWithKet = "INSERT INTO wisudawan (nama, nim, ket) VALUES (?, ?, ?)";
  db.query(sqlWithKet, [nama, nim, ket], (err, result) => {
    if (!err) {
      return res.send("Data wisudawan berhasil disimpan");
    }

    // If insert with ket failed (likely column doesn't exist), fallback to simple insert
    console.log("Insert with ket failed, falling back:", err.message || err);
    const sql = "INSERT INTO wisudawan (nama, nim) VALUES (?, ?)";
    db.query(sql, [nama, nim], (err2, result2) => {
      if (err2) {
        console.log("ERROR INSERT fallback:", err2);
        return res.status(500).send("Gagal simpan data");
      }
      return res.send("Data wisudawan berhasil disimpan (fallback)");
    });
  });
});

// GET USERS
app.get("/api/users", (req, res) => {
  db.query("SELECT * FROM users", (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});


app.listen(5000, () => {
  console.log("Server berjalan di port 5000");
});