const db = require("../config/db");

const getAllEvents = (req, res) => {
  db.query(`
    SELECT e.*, u.nama as created_by_nama,
           (SELECT COUNT(*) FROM invited_users WHERE event_id = e.id) as total_invited,
           (SELECT COUNT(*) FROM invited_users WHERE event_id = e.id AND status_checkin = 'sudah') as total_checkin
    FROM events e
    LEFT JOIN users u ON e.created_by = u.id
    ORDER BY e.created_at DESC
  `, (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });
    res.json(results);
  });
};

const getEventById = (req, res) => {
  const { id } = req.params;

  db.query(`
    SELECT e.*, u.nama as created_by_nama
    FROM events e
    LEFT JOIN users u ON e.created_by = u.id
    WHERE e.id = ?
  `, [id], (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (results.length === 0) return res.status(404).json({ message: "Event tidak ditemukan" });

    db.query(`
      SELECT u.id, u.nama, u.email
      FROM users u
      JOIN event_admins ea ON u.id = ea.admin_lapangan_id
      WHERE ea.event_id = ?
    `, [id], (err2, admins) => {
      if (err2) return res.status(500).json({ message: "Server error" });

      const event = results[0];
      event.assigned_admins = admins;
      res.json(event);
    });
  });
};

const createEvent = (req, res) => {
  const { nama, tanggal, waktu_mulai, waktu_selesai, lokasi, deskripsi, kapasitas } = req.body;
  const created_by = req.user.id;

  if (!nama || !tanggal || !waktu_mulai || !waktu_selesai || !lokasi || !kapasitas) {
    return res.status(400).json({ message: "Semua field wajib diisi" });
  }

  db.query("INSERT INTO events (nama, tanggal, waktu_mulai, waktu_selesai, lokasi, deskripsi, kapasitas, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [nama, tanggal, waktu_mulai, waktu_selesai, lokasi, deskripsi || "", kapasitas, created_by],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Server error" });
      res.status(201).json({ message: "Event berhasil dibuat", id: result.insertId });
    });
};

const updateEvent = (req, res) => {
  const { id } = req.params;
  const { nama, tanggal, waktu_mulai, waktu_selesai, lokasi, deskripsi, kapasitas, status } = req.body;

  if (!nama || !tanggal || !waktu_mulai || !waktu_selesai || !lokasi || !kapasitas) {
    return res.status(400).json({ message: "Semua field wajib diisi" });
  }

  db.query("UPDATE events SET nama = ?, tanggal = ?, waktu_mulai = ?, waktu_selesai = ?, lokasi = ?, deskripsi = ?, kapasitas = ?, status = ? WHERE id = ?",
    [nama, tanggal, waktu_mulai, waktu_selesai, lokasi, deskripsi || "", kapasitas, status || "draft", id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Server error" });
      if (result.affectedRows === 0) return res.status(404).json({ message: "Event tidak ditemukan" });
      res.json({ message: "Event berhasil diupdate" });
    });
};

const deleteEvent = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM events WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Event tidak ditemukan" });
    res.json({ message: "Event berhasil dihapus" });
  });
};

const assignAdmins = (req, res) => {
  const { id } = req.params;
  const { admin_ids } = req.body;

  if (!Array.isArray(admin_ids)) {
    return res.status(400).json({ message: "admin_ids harus array" });
  }

  db.query("DELETE FROM event_admins WHERE event_id = ?", [id], (err) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if (admin_ids.length === 0) {
      return res.json({ message: "Admin berhasil dihapus dari event" });
    }

    const values = admin_ids.map(aid => [id, aid]);
    db.query("INSERT INTO event_admins (event_id, admin_lapangan_id) VALUES ?", [values], (err2) => {
      if (err2) return res.status(500).json({ message: "Server error" });
      res.json({ message: "Admin berhasil diassign ke event" });
    });
  });
};

const getMyEvents = (req, res) => {
  const adminId = req.user.id;

  db.query(`
    SELECT e.*,
           (SELECT COUNT(*) FROM invited_users WHERE event_id = e.id) as total_invited,
           (SELECT COUNT(*) FROM invited_users WHERE event_id = e.id AND status_checkin = 'sudah') as total_checkin
    FROM events e
    JOIN event_admins ea ON e.id = ea.event_id
    WHERE ea.admin_lapangan_id = ? AND e.status = 'active'
    ORDER BY e.tanggal ASC
  `, [adminId], (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });
    res.json(results);
  });
};

module.exports = { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent, assignAdmins, getMyEvents };
