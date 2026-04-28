const crypto = require("crypto");
const XLSX = require("xlsx");
const db = require("../config/db");

const getInvitedUsersByEvent = (req, res) => {
  const { eventId } = req.params;
  const { search } = req.query;

  let sql = "SELECT * FROM invited_users WHERE event_id = ?";
  const params = [eventId];

  if (search) {
    sql += " AND (nama LIKE ? OR nim_nik LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  sql += " ORDER BY nama ASC";

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });
    res.json(results);
  });
};

const getInvitedUserById = (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM invited_users WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (results.length === 0) return res.status(404).json({ message: "Undangan tidak ditemukan" });
    res.json(results[0]);
  });
};

const createInvitedUser = (req, res) => {
  const { eventId } = req.params;
  const { nama, nim_nik, email, kategori } = req.body;

  if (!nama || !nim_nik) {
    return res.status(400).json({ message: "Nama dan NIM/NIK wajib diisi" });
  }

  const qrCode = crypto.randomBytes(16).toString("hex");

  db.query("INSERT INTO invited_users (nama, nim_nik, email, event_id, kategori, qr_code) VALUES (?, ?, ?, ?, ?, ?)",
    [nama, nim_nik, email || "", eventId, kategori || "Normal", qrCode],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") return res.status(400).json({ message: "NIM/NIK sudah terdaftar" });
        return res.status(500).json({ message: "Server error" });
      }
      res.status(201).json({ message: "Undangan berhasil dibuat", id: result.insertId, qr_code: qrCode });
    });
};

const updateInvitedUser = (req, res) => {
  const { id } = req.params;
  const { nama, nim_nik, email, kategori } = req.body;

  if (!nama || !nim_nik) {
    return res.status(400).json({ message: "Nama dan NIM/NIK wajib diisi" });
  }

  db.query("UPDATE invited_users SET nama = ?, nim_nik = ?, email = ?, kategori = ? WHERE id = ?",
    [nama, nim_nik, email || "", kategori || "Normal", id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Server error" });
      if (result.affectedRows === 0) return res.status(404).json({ message: "Undangan tidak ditemukan" });
      res.json({ message: "Undangan berhasil diupdate" });
    });
};

const deleteInvitedUser = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM invited_users WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Undangan tidak ditemukan" });
    res.json({ message: "Undangan berhasil dihapus" });
  });
};

const bulkImportInvitedUsers = (req, res) => {
  const { eventId } = req.params;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "File Excel wajib diupload" });
  }

  try {
    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet);

    if (json.length === 0) {
      return res.status(400).json({ message: "File Excel kosong" });
    }

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
};

const generateQrCodes = (req, res) => {
  const { eventId } = req.params;

  db.query("SELECT id, nama, nim_nik, qr_code FROM invited_users WHERE event_id = ?", [eventId], (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });
    res.json(results);
  });
};

const undanganLogin = (req, res) => {
  const { nim_nik } = req.body;

  if (!nim_nik) {
    return res.status(400).json({ message: "NIM/NIK wajib diisi" });
  }

  db.query(`
    SELECT iu.*, e.nama as event_nama, e.tanggal, e.waktu_mulai, e.waktu_selesai, e.status as event_status
    FROM invited_users iu
    JOIN events e ON iu.event_id = e.id
    WHERE iu.nim_nik = ?
  `, [nim_nik], (err, results) => {
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
  });
};

module.exports = {
  getInvitedUsersByEvent,
  getInvitedUserById,
  createInvitedUser,
  updateInvitedUser,
  deleteInvitedUser,
  bulkImportInvitedUsers,
  generateQrCodes,
  undanganLogin
};
