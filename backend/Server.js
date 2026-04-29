const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const multer = require("multer");
const XLSX = require("xlsx");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "db_absensi_event",
});

db.connect((err) => {
  if (err) console.log("DB connection failed:", err.message);
  else console.log("Database connected");
});

// =====================================================
// TEST ENDPOINT
// =====================================================
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is running!", timestamp: new Date() });
});

// =====================================================
// TEMP RESET PASSWORD - CEK DAN RESET ADMIN
// =====================================================
app.post("/api/temp-reset-admin", async (req, res) => {
  db.query("SELECT id FROM users WHERE email = 'admin@event.com'", async (err, results) => {
    if (err) return res.json({ success: false, message: err.message });

    const hash = await bcrypt.hash("admin123", 10);

    if (results.length === 0) {
      db.query(
        "INSERT INTO users (nama, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)",
        ["Admin Sistem", "admin@event.com", hash, "admin_sistem", "active"],
        (err2) => {
          if (err2) return res.json({ success: false, message: err2.message });
          res.json({ success: true, message: "Admin created: admin@event.com / admin123" });
        }
      );
    } else {
      db.query(
        "UPDATE users SET password_hash = ? WHERE email = 'admin@event.com'",
        [hash],
        (err3) => {
          if (err3) return res.json({ success: false, message: err3.message });
          res.json({ success: true, message: "Admin password reset: admin@event.com / admin123" });
        }
      );
    }
  });
});

// =====================================================
// AUTH LOGIN
// =====================================================
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email dan password wajib diisi" });
  }

  db.query(
    "SELECT * FROM users WHERE email = ? AND status = 'active'",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });

      if (results.length === 0) {
        return res.status(401).json({ message: "Email atau password salah" });
      }

      const user = results[0];
      const validPassword = await bcrypt.compare(password, user.password_hash);

      if (!validPassword) {
        return res.status(401).json({ message: "Email atau password salah" });
      }

      const JWT_SECRET = "absensi_event_secret_key_2024";
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({
        token,
        user: {
          id: user.id,
          nama: user.nama,
          email: user.email,
          role: user.role,
          first_login: user.first_login || false,
        },
      });
    }
  );
});

// =====================================================
// AUTH ME
// =====================================================
app.get("/api/auth/me", (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token tidak ditemukan" });
  }

  const token = authHeader.split(" ")[1];
  const JWT_SECRET = "absensi_event_secret_key_2024";

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    db.query(
      "SELECT id, nama, email, role, status FROM users WHERE id = ? AND status = 'active'",
      [decoded.id],
      (err, results) => {
        if (err) return res.status(500).json({ message: "Server error" });
        if (results.length === 0) return res.status(401).json({ message: "User tidak valid" });
        res.json({ user: results[0] });
      }
    );
  } catch (err) {
    return res.status(401).json({ message: "Token tidak valid" });
  }
});

// =====================================================
// EVENTS
// =====================================================
app.get("/api/events", (req, res) => {
  db.query(
    `SELECT e.*,
     (SELECT COUNT(*) FROM invited_users WHERE event_id = e.id) as total_invited,
     (SELECT COUNT(*) FROM invited_users WHERE event_id = e.id AND status_checkin = 'sudah') as total_checkin
     FROM events e ORDER BY e.created_at DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });
      res.json(results);
    }
  );
});

app.get("/api/events/:id", (req, res) => {
  db.query("SELECT * FROM events WHERE id = ?", [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (results.length === 0) return res.status(404).json({ message: "Event tidak ditemukan" });
    res.json(results[0]);
  });
});

app.post("/api/events", (req, res) => {
  const { nama, tanggal, lokasi, waktu_mulai, waktu_selesai, deskripsi, kapasitas, status } = req.body;

  if (!nama || !tanggal || !lokasi || !waktu_mulai || !waktu_selesai || !kapasitas) {
    return res.status(400).json({ message: "Semua field wajib diisi" });
  }

  db.query(
    "INSERT INTO events (nama, tanggal, lokasi, waktu_mulai, waktu_selesai, deskripsi, kapasitas, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [nama, tanggal, lokasi, waktu_mulai, waktu_selesai, deskripsi || "", kapasitas, status || "draft"],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Server error" });
      res.status(201).json({ message: "Event berhasil dibuat", id: result.insertId });
    }
  );
});

app.put("/api/events/:id", (req, res) => {
  const { nama, tanggal, lokasi, waktu_mulai, waktu_selesai, deskripsi, kapasitas, status } = req.body;

  db.query(
    "UPDATE events SET nama = ?, tanggal = ?, lokasi = ?, waktu_mulai = ?, waktu_selesai = ?, deskripsi = ?, kapasitas = ?, status = ? WHERE id = ?",
    [nama, tanggal, lokasi, waktu_mulai, waktu_selesai, deskripsi || "", kapasitas, status || "draft", req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Server error" });
      res.json({ message: "Event berhasil diupdate" });
    }
  );
});

app.delete("/api/events/:id", (req, res) => {
  const eventId = req.params.id;

  db.query("SET FOREIGN_KEY_CHECKS=0", () => {
    db.query("DELETE FROM checkin_logs WHERE event_id = ?", [eventId], (err) => {
      if (err) {
        console.error("Error deleting checkin_logs:", err.message);
        db.query("SET FOREIGN_KEY_CHECKS=1");
        return res.status(500).json({ message: "Gagal menghapus data check-in logs" });
      }

      db.query("DELETE FROM invited_users WHERE event_id = ?", [eventId], (err2) => {
        if (err2) {
          console.error("Error deleting invited_users:", err2.message);
          db.query("SET FOREIGN_KEY_CHECKS=1");
          return res.status(500).json({ message: "Gagal menghapus data undangan" });
        }

        db.query("DELETE FROM undangan WHERE event_id = ?", [eventId], (err2b) => {
          if (err2b) {
            console.error("Error deleting undangan:", err2b.message);
          }

          db.query("DELETE FROM event_admins WHERE event_id = ?", [eventId], (err3) => {
            if (err3) {
              console.error("Error deleting event_admins:", err3.message);
              db.query("SET FOREIGN_KEY_CHECKS=1");
              return res.status(500).json({ message: "Gagal menghapus data admin event" });
            }

            db.query("DELETE FROM events WHERE id = ?", [eventId], (err4, result) => {
              db.query("SET FOREIGN_KEY_CHECKS=1");

              if (err4) {
                console.error("Error deleting event:", err4.message);
                return res.status(500).json({ message: "Gagal menghapus event" });
              }
              if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Event tidak ditemukan" });
              }
              res.json({ message: "Event berhasil dihapus" });
            });
          });
        });
      });
    });
  });
});

app.put("/api/events/:id/assign-admins", (req, res) => {
  const { admin_ids } = req.body;

  if (!Array.isArray(admin_ids)) {
    return res.status(400).json({ message: "admin_ids harus array" });
  }

  db.query("DELETE FROM event_admins WHERE event_id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if (admin_ids.length === 0) {
      return res.json({ message: "Admin berhasil dihapus dari event" });
    }

    const values = admin_ids.map(aid => [parseInt(req.params.id), aid]);
    db.query("INSERT INTO event_admins (event_id, admin_lapangan_id) VALUES ?", [values], (err2) => {
      if (err2) return res.status(500).json({ message: "Server error" });
      res.json({ message: "Admin berhasil diassign ke event" });
    });
  });
});

// =====================================================
// INVITED USERS
// =====================================================
app.get("/api/events/:eventId/invited-users", (req, res) => {
  db.query(
    "SELECT * FROM invited_users WHERE event_id = ? ORDER BY nama ASC",
    [req.params.eventId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });
      res.json(results);
    }
  );
});

app.post("/api/events/:eventId/invited-users", (req, res) => {
  const { nama, nim_nik, email, kategori } = req.body;

  if (!nama || !nim_nik) {
    return res.status(400).json({ message: "Nama dan NIM/NIK wajib diisi" });
  }

  const qrCode = crypto.randomBytes(16).toString("hex");

  db.query(
    "INSERT INTO invited_users (nama, nim_nik, email, event_id, kategori, qr_code) VALUES (?, ?, ?, ?, ?, ?)",
    [nama, nim_nik, email || "", req.params.eventId, kategori || "Normal", qrCode],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") return res.status(400).json({ message: "NIM/NIK sudah terdaftar" });
        return res.status(500).json({ message: "Server error" });
      }
      res.status(201).json({ message: "Undangan berhasil dibuat", id: result.insertId, qr_code: qrCode });
    }
  );
});

app.delete("/api/invited-users/:id", (req, res) => {
  const userId = req.params.id;

  db.query("DELETE FROM checkin_logs WHERE invited_user_id = ?", [userId], (err) => {
    if (err) {
      console.error("Error deleting checkin_logs:", err.message);
      return res.status(500).json({ message: "Gagal menghapus data check-in" });
    }

    db.query("DELETE FROM invited_users WHERE id = ?", [userId], (err2, result) => {
      if (err2) {
        console.error("Error deleting invited_user:", err2.message);
        return res.status(500).json({ message: "Gagal menghapus undangan" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Undangan tidak ditemukan" });
      }
      res.json({ message: "Undangan berhasil dihapus" });
    });
  });
});

app.post("/api/events/:eventId/invited-users/bulk", (req, res) => {
  upload(req, res, (err) => {
    if (err || !req.file) {
      return res.status(400).json({ message: "File Excel wajib diupload" });
    }

    try {
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);

      if (json.length === 0) {
        return res.status(400).json({ message: "File Excel kosong" });
      }

      const eventId = req.params.eventId;

      const invited = json.map(row => {
        const nama = row.Nama || row.nama || "";
        const nim_nik = row.NIM || row.NIK || row.nim_nik || "";
        const email = row.Email || row.email || "";
        const kategori = row.Kategori || row.kategori || "Normal";

        if (!nama || !nim_nik) return null;

        return [
          nama,
          String(nim_nik),
          email,
          parseInt(eventId),
          kategori,
          crypto.randomBytes(16).toString("hex")
        ];
      }).filter(Boolean);

      if (invited.length === 0) {
        return res.status(400).json({ message: "Data tidak valid. Pastikan ada kolom Nama dan NIM/NIK" });
      }

      db.query("INSERT INTO invited_users (nama, nim_nik, email, event_id, kategori, qr_code) VALUES ?", [invited], (err, result) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") return res.status(400).json({ message: "Beberapa NIM/NIK sudah terdaftar" });
          return res.status(500).json({ message: "Server error" });
        }
        res.status(201).json({ message: `Berhasil import ${result.affectedRows} undangan` });
      });
    } catch (err) {
      return res.status(500).json({ message: "Gagal membaca file Excel" });
    }
  });
});

// =====================================================
// CHECKIN
// =====================================================
app.post("/api/checkin", (req, res) => {
  const { qr_code } = req.body;

  if (!qr_code) {
    return res.status(400).json({ success: false, message: "QR code wajib diisi" });
  }

  db.query(
    `SELECT iu.*, e.status as event_status, e.kapasitas,
     (SELECT COUNT(*) FROM invited_users WHERE event_id = e.id AND status_checkin = 'sudah') as checked_in_count
     FROM invited_users iu
     JOIN events e ON iu.event_id = e.id
     WHERE iu.qr_code = ?`,
    [qr_code],
    (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "Server error" });

      if (results.length === 0) {
        return res.json({ success: false, message: "QR tidak dikenali", error: "not_found" });
      }

      const invited = results[0];

      if (invited.event_status === "selesai") {
        return res.json({ success: false, message: "Event sudah berakhir", error: "event_finished" });
      }

      if (invited.status_checkin === "sudah") {
        return res.json({
          success: false,
          message: "Sudah check-in pada pukul " + new Date(invited.checkin_at).toLocaleTimeString("id-ID"),
          error: "already_checkin"
        });
      }

      if (parseInt(invited.checked_in_count) >= parseInt(invited.kapasitas)) {
        return res.json({ success: false, message: "Maaf, kapasitas event sudah penuh", error: "capacity_full" });
      }

      db.query(
        "UPDATE invited_users SET status_checkin = 'sudah', checkin_at = NOW() WHERE id = ?",
        [invited.id],
        (err2) => {
          if (err2) return res.status(500).json({ success: false, message: "Server error" });
          
          // Insert checkin log
          db.query(
            "INSERT INTO checkin_logs (invited_user_id, event_id, admin_lapangan_id, method) VALUES (?, ?, ?, 'scan')",
            [invited.id, invited.event_id, 1], // admin_lapangan_id sementara 1
            (err3) => {}
          );
          
          return res.json({
            success: true,
            message: "Berhasil! Selamat datang, " + invited.nama,
            data: { nama: invited.nama, nim_nik: invited.nim_nik, kategori: invited.kategori }
          });
        }
      );
    }
  );
});

app.get("/api/events/:eventId/checkin-status", (req, res) => {
  db.query(
    `SELECT e.kapasitas, e.status as event_status,
     (SELECT COUNT(*) FROM invited_users WHERE event_id = e.id) as total_invited,
     (SELECT COUNT(*) FROM invited_users WHERE event_id = e.id AND status_checkin = 'sudah') as total_checkin
     FROM events e WHERE e.id = ?`,
    [req.params.eventId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });
      if (results.length === 0) return res.status(404).json({ message: "Event tidak ditemukan" });

      const data = results[0];
      res.json({
        kapasitas: data.kapasitas,
        event_status: data.event_status,
        total_invited: data.total_invited,
        total_checkin: data.total_checkin,
        remaining_capacity: data.kapasitas - data.total_checkin,
        percentage: data.total_invited > 0 ? Math.round((data.total_checkin / data.total_invited) * 100) : 0
      });
    }
  );
});

app.get("/api/checkin-logs", (req, res) => {
  db.query(
    `SELECT cl.*, iu.nama, iu.nim_nik, iu.kategori
     FROM checkin_logs cl
     JOIN invited_users iu ON cl.invited_user_id = iu.id
     ORDER BY cl.timestamp DESC
     LIMIT 50`,
    (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });
      res.json(results);
    }
  );
});

// =====================================================
// USERS
// =====================================================
app.get("/api/users", (req, res) => {
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
});

app.post("/api/users", async (req, res) => {
  const { nama, email, password, role } = req.body;

  if (!nama || !email || !password || !role) {
    return res.status(400).json({ message: "Semua field wajib diisi" });
  }

  const hash = await bcrypt.hash(password, 10);
  db.query(
    "INSERT INTO users (nama, email, password_hash, role) VALUES (?, ?, ?, ?)",
    [nama, email, hash, role],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") return res.status(400).json({ message: "Email sudah terdaftar" });
        return res.status(500).json({ message: "Server error" });
      }
      res.status(201).json({ message: "User berhasil dibuat", id: result.insertId });
    }
  );
});

app.put("/api/users/:id", (req, res) => {
  const { nama, email, role, status } = req.body;
  db.query(
    "UPDATE users SET nama = ?, email = ?, role = ?, status = ? WHERE id = ?",
    [nama, email, role, status || "active", req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Server error" });
      res.json({ message: "User berhasil diupdate" });
    }
  );
});

app.delete("/api/users/:id", (req, res) => {
  const userId = req.params.id;

  if (parseInt(userId) === 1) {
    return res.status(403).json({ message: "Tidak bisa menghapus admin utama" });
  }

  db.query("SET FOREIGN_KEY_CHECKS=0", () => {
    db.query("DELETE FROM checkin_logs WHERE admin_lapangan_id = ?", [userId], (err) => {
      if (err) {
        console.error("Error deleting checkin_logs:", err.message);
        db.query("SET FOREIGN_KEY_CHECKS=1");
        return res.status(500).json({ message: "Gagal menghapus data check-in" });
      }

      db.query("UPDATE invited_users SET scanned_by = NULL WHERE scanned_by = ?", [userId], (err2) => {
        if (err2) {
          console.error("Error updating invited_users:", err2.message);
          db.query("SET FOREIGN_KEY_CHECKS=1");
          return res.status(500).json({ message: "Gagal menghapus data undangan" });
        }

        db.query("DELETE FROM event_admins WHERE admin_lapangan_id = ?", [userId], (err3) => {
          if (err3) {
            console.error("Error deleting event_admins:", err3.message);
            db.query("SET FOREIGN_KEY_CHECKS=1");
            return res.status(500).json({ message: "Gagal menghapus data admin event" });
          }

          db.query("DELETE FROM users WHERE id = ?", [userId], (err4, result) => {
            db.query("SET FOREIGN_KEY_CHECKS=1");

            if (err4) {
              console.error("Error deleting user:", err4.message);
              return res.status(500).json({ message: "Gagal menghapus user" });
            }
            if (result.affectedRows === 0) {
              return res.status(404).json({ message: "User tidak ditemukan" });
            }
            res.json({ message: "User berhasil dihapus" });
          });
        });
      });
    });
  });
});

app.put("/api/users/:id/reset-password", async (req, res) => {
  const hash = await bcrypt.hash("password123", 10);
  db.query("UPDATE users SET password_hash = ?, first_login = TRUE WHERE id = ?", [hash, req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "Server error" });
    res.json({ message: "Password berhasil direset menjadi 'password123'" });
  });
});

// =====================================================
// UNDANGAN LOGIN (MAHASISWA)
// =====================================================
app.post("/api/undangan/login", (req, res) => {
  const { nim_nik } = req.body;

  if (!nim_nik) {
    return res.status(400).json({ message: "NIM/NIK wajib diisi" });
  }

  db.query(
    `SELECT iu.*, e.nama as event_nama, e.tanggal, e.waktu_mulai, e.waktu_selesai, e.status as event_status
     FROM invited_users iu
     JOIN events e ON iu.event_id = e.id
     WHERE iu.nim_nik = ?`,
    [nim_nik],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });
      if (results.length === 0) return res.status(404).json({ message: "NIM/NIK tidak ditemukan" });

      const invited = results[0];
      res.json({
        invited_user: {
          id: invited.id,
          nama: invited.nama,
          nim_nik: invited.nim_nik,
          email: invited.email,
          event_id: invited.event_id,
          event_nama: invited.event_nama,
          tanggal: invited.tanggal,
          waktu_mulai: invited.waktu_mulai,
          waktu_selesai: invited.waktu_selesai,
          event_status: invited.event_status,
          kategori: invited.kategori,
          status_checkin: invited.status_checkin,
          qr_code: invited.qr_code
        }
      });
    }
  );
});

// =====================================================
// INIT DEFAULT ADMIN
// =====================================================
const initDefaultAdmin = async () => {
  const hash = await bcrypt.hash("admin123", 10);

  db.query("SELECT id FROM users WHERE email = 'admin@event.com'", (err, results) => {
    if (err) {
      console.log("Error checking admin:", err.message);
      return;
    }

    if (results.length === 0) {
      db.query(
        "INSERT INTO users (nama, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)",
        ["Admin Sistem", "admin@event.com", hash, "admin_sistem", "active"],
        (err2) => {
          if (err2) console.log("Failed to create default admin:", err2.message);
          else console.log("Default admin created: admin@event.com / admin123");
        }
      );
    } else {
      db.query(
        "UPDATE users SET password_hash = ?, role = 'admin_sistem', status = 'active' WHERE email = 'admin@event.com'",
        [hash],
        (err3) => {
          if (err3) console.log("Failed to update admin:", err3.message);
          else console.log("Admin password updated: admin@event.com / admin123");
        }
      );
    }
  });
};

initDefaultAdmin();

app.listen(5000, () => console.log("Server running on port 5000"));
