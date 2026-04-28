const db = require("../config/db");

const checkin = (req, res) => {
  const { qr_code } = req.body;
  const adminId = req.user.id;

  if (!qr_code) {
    return res.status(400).json({ success: false, message: "QR code wajib diisi" });
  }

  db.query(`
    SELECT iu.*, e.status as event_status, e.kapasitas,
           (SELECT COUNT(*) FROM invited_users WHERE event_id = e.id AND status_checkin = 'sudah') as checked_in_count
    FROM invited_users iu
    JOIN events e ON iu.event_id = e.id
    WHERE iu.qr_code = ?
  `, [qr_code], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Server error" });

    if (results.length === 0) {
      return res.json({ success: false, message: "QR tidak dikenali", error: "not_found" });
    }

    const invited = results[0];

    if (invited.event_status === "selesai") {
      return res.json({ success: false, message: "Event sudah berakhir", error: "event_finished" });
    }

    if (invited.event_status === "draft") {
      return res.json({ success: false, message: "Event belum aktif", error: "event_not_active" });
    }

    if (invited.status_checkin === "sudah") {
      return res.json({
        success: false,
        message: `Sudah check-in pada pukul ${new Date(invited.checkin_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`,
        error: "already_checkin"
      });
    }

    if (parseInt(invited.checked_in_count) >= parseInt(invited.kapasitas)) {
      return res.json({ success: false, message: "Maaf, kapasitas event sudah penuh", error: "capacity_full" });
    }

    db.query("UPDATE invited_users SET status_checkin = 'sudah', checkin_at = NOW(), scanned_by = ? WHERE id = ?",
      [adminId, invited.id], (err2) => {
        if (err2) return res.status(500).json({ success: false, message: "Server error" });

        db.query("INSERT INTO checkin_logs (invited_user_id, event_id, admin_lapangan_id, method) VALUES (?, ?, ?, 'scan')",
          [invited.id, invited.event_id, adminId], (err3) => {
            if (err3) return res.status(500).json({ success: false, message: "Server error" });

            return res.json({
              success: true,
              message: `Berhasil! Selamat datang, ${invited.nama}`,
              data: {
                nama: invited.nama,
                nim_nik: invited.nim_nik,
                kategori: invited.kategori,
                checkin_at: new Date().toISOString()
              }
            });
          });
      });
  });
};

const manualCheckin = (req, res) => {
  const { nim_nik, nama, event_id, reason } = req.body;
  const adminId = req.user.id;

  if ((!nim_nik && !nama) || !event_id) {
    return res.status(400).json({ success: false, message: "NIM/NIK atau Nama, dan Event ID wajib diisi" });
  }

  let sql = "SELECT iu.*, e.status as event_status, e.kapasitas, (SELECT COUNT(*) FROM invited_users WHERE event_id = e.id AND status_checkin = 'sudah') as checked_in_count FROM invited_users iu JOIN events e ON iu.event_id = e.id WHERE iu.event_id = ?";
  const params = [event_id];

  if (nim_nik) {
    sql += " AND iu.nim_nik = ?";
    params.push(nim_nik);
  } else if (nama) {
    sql += " AND iu.nama LIKE ?";
    params.push(`%${nama}%`);
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Server error" });

    if (results.length === 0) {
      return res.json({ success: false, message: "Data tidak ditemukan", error: "not_found" });
    }

if (results.length > 1) {
      return res.json({ success: false, message: "Ditemukan beberapa data. Gunakan NIM/NIK untuk hasil yang lebih spesifik", error: "multiple_results", data: results });
    }

    const invited = results[0];

    if (invited.event_status === "selesai") {
      return res.json({ success: false, message: "Event sudah berakhir", error: "event_finished" });
    }

    if (invited.status_checkin === "sudah") {
      return res.json({ success: false, message: `Sudah check-in pada pukul ${new Date(invited.checkin_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`, error: "already_checkin" });
    }

    if (parseInt(invited.checked_in_count) >= parseInt(invited.kapasitas)) {
      return res.json({ success: false, message: "Maaf, kapasitas event sudah penuh", error: "capacity_full" });
    }

    db.query("UPDATE invited_users SET status_checkin = 'sudah', checkin_at = NOW(), scanned_by = ? WHERE id = ?",
      [adminId, invited.id], (err2) => {
        if (err2) return res.status(500).json({ success: false, message: "Server error" });

        db.query("INSERT INTO checkin_logs (invited_user_id, event_id, admin_lapangan_id, method, reason) VALUES (?, ?, ?, 'manual', ?)",
          [invited.id, invited.event_id, adminId, reason || ""], (err3) => {
            if (err3) return res.status(500).json({ success: false, message: "Server error" });

            return res.json({
              success: true,
              message: `Berhasil check-in manual untuk ${invited.nama}`,
              data: {
                nama: invited.nama,
                nim_nik: invited.nim_nik,
                kategori: invited.kategori,
                checkin_at: new Date().toISOString()
              }
            });
          });
      });
  });
};

const getCheckinStatus = (req, res) => {
  const { eventId } = req.params;

  db.query(`
    SELECT
      e.kapasitas,
      e.status as event_status,
      (SELECT COUNT(*) FROM invited_users WHERE event_id = e.id) as total_invited,
      (SELECT COUNT(*) FROM invited_users WHERE event_id = e.id AND status_checkin = 'sudah') as total_checkin,
      (SELECT COUNT(*) FROM invited_users WHERE event_id = e.id AND kategori = 'VIP') as total_vip,
      (SELECT COUNT(*) FROM invited_users WHERE event_id = e.id AND kategori = 'VIP' AND status_checkin = 'sudah') as vip_checkin,
      (SELECT COUNT(*) FROM invited_users WHERE event_id = e.id AND kategori = 'Normal') as total_normal,
      (SELECT COUNT(*) FROM invited_users WHERE event_id = e.id AND kategori = 'Normal' AND status_checkin = 'sudah') as normal_checkin
    FROM events e
    WHERE e.id = ?
  `, [eventId], (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (results.length === 0) return res.status(404).json({ message: "Event tidak ditemukan" });

    const data = results[0];
    res.json({
      kapasitas: data.kapasitas,
      event_status: data.event_status,
      total_invited: data.total_invited,
      total_checkin: data.total_checkin,
      remaining_capacity: data.kapasitas - data.total_checkin,
      percentage: data.total_invited > 0 ? Math.round((data.total_checkin / data.total_invited) * 100) : 0,
      breakdown: {
        VIP: { total: data.total_vip, checked_in: data.vip_checkin },
        Normal: { total: data.total_normal, checked_in: data.normal_checkin }
      }
    });
  });
};

const getCheckinLogs = (req, res) => {
  const { eventId } = req.params;

  db.query(`
    SELECT cl.*, iu.nama, iu.nim_nik, iu.kategori, u.nama as scanned_by_nama
    FROM checkin_logs cl
    JOIN invited_users iu ON cl.invited_user_id = iu.id
    LEFT JOIN users u ON cl.admin_lapangan_id = u.id
    WHERE cl.event_id = ?
    ORDER BY cl.timestamp DESC
  `, [eventId], (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });
    res.json(results);
  });
};

const getReport = (req, res) => {
  const { eventId } = req.params;

  db.query(`
    SELECT
      e.id, e.nama, e.tanggal, e.waktu_mulai, e.waktu_selesai, e.lokasi, e.kapasitas, e.status,
      (SELECT COUNT(*) FROM invited_users WHERE event_id = e.id) as total_invited,
      (SELECT COUNT(*) FROM invited_users WHERE event_id = e.id AND status_checkin = 'sudah') as total_checkin,
      (SELECT COUNT(*) FROM invited_users WHERE event_id = e.id AND status_checkin = 'belum') as total_belum
    FROM events e
    WHERE e.id = ?
  `, [eventId], (err, events) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (events.length === 0) return res.status(404).json({ message: "Event tidak ditemukan" });

    db.query("SELECT * FROM invited_users WHERE event_id = ? ORDER BY status_checkin DESC, nama ASC", [eventId], (err2, invited) => {
      if (err2) return res.status(500).json({ message: "Server error" });

      res.json({
        event: events[0],
        invited_users: invited,
        summary: {
          total: invited.length,
          checked_in: invited.filter(i => i.status_checkin === "sudah").length,
          belum_checkin: invited.filter(i => i.status_checkin === "belum").length
        }
      });
    });
  });
};

module.exports = { checkin, manualCheckin, getCheckinStatus, getCheckinLogs, getReport };
