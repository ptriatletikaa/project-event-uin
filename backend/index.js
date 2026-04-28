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
  database: "db_absensi_event",
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

// ==============================
// 🔥 TAMBAHAN AUTH LOGIN (INI YANG PENTING)
// ==============================
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  // sementara dummy dulu (biar bisa login dari React)
  if (email === "admin@event.com" && password === "123456") {
    return res.json({
      token: "dummy_token",
      user: {
        id: 1,
        nama: "Admin",
        email,
        role: "admin_sistem",
      },
    });
  }

  return res.status(401).json({ message: "Email atau password salah" });
});

// ==============================
// END AUTH
// ==============================

app.post("/wisudawan", (req, res) => {
  const { nama, nim } = req.body;
  const ket = req.body.ket || "Hadir";

  if (!nama || !nim) {
    return res.status(400).send("Nama dan NIM wajib diisi");
  }

  const sqlWithKet = "INSERT INTO wisudawan (nama, nim, ket) VALUES (?, ?, ?)";
  db.query(sqlWithKet, [nama, nim, ket], (err, result) => {
    if (!err) {
      return res.send("Data wisudawan berhasil disimpan");
    }

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

// GET EVENTS
app.get("/api/events", (req, res) => {
  db.query("SELECT * FROM events", (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// GET CHECKIN LOGS BERDASARKAN EVENT
app.get("/api/events/:id/checkin-logs", (req, res) => {
  const eventId = req.params.id;

  const sql = `
    SELECT cl.*, iu.nama 
    FROM checkin_logs cl
    JOIN invited_users iu ON cl.invited_user_id = iu.id
    WHERE cl.event_id = ?
    ORDER BY cl.timestamp DESC
    LIMIT 10
  `;

  db.query(sql, [eventId], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send(err);
    }
    res.json(result);
  });
});

// LOGIN MAHASISWA (NIM / NIK)
app.post("/api/mahasiswa/login", (req, res) => {
  const { nim_nik } = req.body;

  if (!nim_nik) {
    return res.status(400).json({ message: "NIM/NIK wajib diisi" });
  }

  const sql = "SELECT * FROM invited_users WHERE nim_nik = ?";

  db.query(sql, [nim_nik], (err, result) => {
    if (err) {
      console.log("ERROR DB:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    // kirim data + QR
    res.json({
      message: "Login berhasil",
      data: result[0],
    });
  });
});