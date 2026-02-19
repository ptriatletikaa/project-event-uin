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

  if (!nama || !nim) {
    return res.status(400).send("Nama dan NIM wajib diisi");
  }

  const sql = "INSERT INTO wisudawan (nama, nim) VALUES (?, ?)";
  db.query(sql, [nama, nim], (err, result) => {
    if (err) {
      console.log("ERROR INSERT:", err);
      return res.status(500).send("Gagal simpan data");
    }

    res.send("Data wisudawan berhasil disimpan");
  });
});


app.listen(5000, () => {
  console.log("Server berjalan di port 5000");
});