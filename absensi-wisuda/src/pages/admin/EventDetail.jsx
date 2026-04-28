import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import * as XLSX from "xlsx";
import { QRCodeCanvas } from "qrcode.react";

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [invitedUsers, setInvitedUsers] = useState([]);
  const [checkinStatus, setCheckinStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("undangan");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(null);
  const [form, setForm] = useState({ nama: "", nim_nik: "", email: "", kategori: "Normal" });

  useEffect(() => {
    if (!user || user.role !== "admin_sistem") {
      navigate("/login");
      return;
    }
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [eventRes, invitedRes, statusRes] = await Promise.all([
        api.get(`/events/${id}`),
        api.get(`/events/${id}/invited-users`),
        api.get(`/events/${id}/checkin-status`),
      ]);
      setEvent(eventRes.data);
      setInvitedUsers(invitedRes.data);
      setCheckinStatus(statusRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    api.post(`/events/${id}/invited-users/bulk`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then(() => {
        alert("Import berhasil!");
        loadData();
      })
      .catch((err) => {
        alert(err.response?.data?.message || "Import gagal");
      });
  };

  const handleAddInvited = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/events/${id}/invited-users`, form);
      setShowAddModal(false);
      setForm({ nama: "", nim_nik: "", email: "", kategori: "Normal" });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menambahkan");
    }
  };

  const handleDeleteInvited = async (invitedId) => {
    if (!confirm("Hapus undangan ini?")) return;
    try {
      await api.delete(`/invited-users/${invitedId}`);
      loadData();
    } catch (err) {
      alert("Gagal menghapus");
    }
  };

  const filteredUsers = invitedUsers.filter((u) =>
    u.nama.toLowerCase().includes(search.toLowerCase()) ||
    u.nim_nik.toLowerCase().includes(search.toLowerCase())
  );

  const exportToExcel = () => {
    const data = invitedUsers.map((u, i) => ({
      No: i + 1,
      Nama: u.nama,
      "NIM/NIK": u.nim_nik,
      Email: u.email,
      Kategori: u.kategori,
      Status: u.status_checkin === "sudah" ? "Hadir" : "Belum Hadir",
      "Waktu Check-in": u.checkin_at ? new Date(u.checkin_at).toLocaleString("id-ID") : "-",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Undangan");
    XLSX.writeFile(wb, `${event?.nama || "event"}_undangan.xlsx`);
  };

  if (loading || !event) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <div style={styles.logoBox}>
          <div style={styles.logoIcon}>🎓</div>
          <div>
            <div style={styles.logoTitle}>Absensi Event</div>
            <div style={styles.logoSub}>Admin Sistem</div>
          </div>
        </div>
        <div style={styles.menu}>
          <div style={styles.menuItem} onClick={() => navigate("/admin/dashboard")}>Dashboard</div>
          <div style={styles.menuItem} onClick={() => navigate("/admin/users")}>User Management</div>
          <div style={styles.menuItem} onClick={() => navigate("/admin/events")}>Event Management</div>
        </div>
      </aside>

      <main style={styles.main}>
        <div style={styles.eventHeader}>
          <div>
            <h1 style={styles.eventTitle}>{event.nama}</h1>
            <p style={styles.eventMeta}>{event.lokasi} | {event.tanggal} | {event.waktu_mulai} - {event.waktu_selesai}</p>
          </div>
          <div style={styles.eventStats}>
            <div style={styles.statBox}>
              <div style={styles.statNum}>{checkinStatus?.total_invited || 0}</div>
              <div style={styles.statLabel}>Undangan</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statNum}>{checkinStatus?.total_checkin || 0}</div>
              <div style={styles.statLabel}>Check-in</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statNum}>{checkinStatus?.remaining_capacity || 0}</div>
              <div style={styles.statLabel}>Sisa Kapasitas</div>
            </div>
          </div>
        </div>

        <div style={styles.tabs}>
          {["undangan", "stats"].map((tab) => (
            <button
              key={tab}
              style={activeTab === tab ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "undangan" ? "Daftar Undangan" : "Statistik"}
            </button>
          ))}
        </div>

        {activeTab === "undangan" && (
          <div>
            <div style={styles.toolbar}>
              <input
                type="text"
                placeholder="Cari nama atau NIM..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.searchInput}
              />
              <div style={styles.toolbarActions}>
                <label style={styles.btnGreen}>
                  Import Excel
                  <input type="file" accept=".xlsx,.xls" onChange={handleImportExcel} style={{ display: "none" }} />
                </label>
                <button style={styles.btnBlue} onClick={() => setShowAddModal(true)}>+ Tambah Undangan</button>
                <button style={styles.btnBlue} onClick={exportToExcel}>Export Excel</button>
              </div>
            </div>

            <div style={styles.tableBox}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Nama</th>
                    <th style={styles.th}>NIM/NIK</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Kategori</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan="6" style={styles.empty}>Belum ada undangan</td></tr>
                  ) : filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td style={styles.td}>{u.nama}</td>
                      <td style={styles.td}>{u.nim_nik}</td>
                      <td style={styles.td}>{u.email}</td>
                      <td style={styles.td}><span style={u.kategori === "VIP" ? styles.vipBadge : styles.normalBadge}>{u.kategori}</span></td>
                      <td style={styles.td}>
                        <span style={u.status_checkin === "sudah" ? styles.hadirBadge : styles.belumBadge}>
                          {u.status_checkin === "sudah" ? "Hadir" : "Belum Hadir"}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actionBtns}>
                          <button style={styles.btnQr} onClick={() => setShowQrModal(u)}>QR</button>
                          <button style={styles.btnDanger} onClick={() => handleDeleteInvited(u.id)}>Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "stats" && checkinStatus && (
          <div style={styles.statsBox}>
            <div style={styles.progressSection}>
              <div style={styles.progressLabel}>Attendance Rate</div>
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: `${checkinStatus.percentage}%` }} />
              </div>
              <div style={styles.progressText}>{checkinStatus.percentage}%</div>
            </div>
            <div style={styles.statsGrid}>
              <div style={styles.statsCard}>
                <div style={styles.statsNum}>{checkinStatus.breakdown.VIP.total}</div>
                <div style={styles.statsLabel}>Total VIP</div>
              </div>
              <div style={styles.statsCard}>
                <div style={styles.statsNum}>{checkinStatus.breakdown.VIP.checked_in}</div>
                <div style={styles.statsLabel}>VIP Check-in</div>
              </div>
              <div style={styles.statsCard}>
                <div style={styles.statsNum}>{checkinStatus.breakdown.Normal.total}</div>
                <div style={styles.statsLabel}>Total Normal</div>
              </div>
              <div style={styles.statsCard}>
                <div style={styles.statsNum}>{checkinStatus.breakdown.Normal.checked_in}</div>
                <div style={styles.statsLabel}>Normal Check-in</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {showAddModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Tambah Undangan</h2>
            <form onSubmit={handleAddInvited}>
              <input type="text" placeholder="Nama" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} style={styles.input} required />
              <input type="text" placeholder="NIM/NIK" value={form.nim_nik} onChange={(e) => setForm({ ...form, nim_nik: e.target.value })} style={styles.input} required />
              <input type="email" placeholder="Email (opsional)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={styles.input} />
              <select value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} style={styles.input}>
                <option value="Normal">Normal</option>
                <option value="VIP">VIP</option>
              </select>
              <div style={styles.modalActions}>
                <button type="submit" style={styles.btnPrimary}>Simpan</button>
                <button type="button" style={styles.btnSecondary} onClick={() => setShowAddModal(false)}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showQrModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>QR Code - {showQrModal.nama}</h2>
            <div style={styles.qrBox}>
              <QRCodeCanvas value={showQrModal.qr_code} size={200} />
            </div>
            <p style={styles.qrInfo}>NIM: {showQrModal.nim_nik}</p>
            <button style={styles.btnSecondary} onClick={() => setShowQrModal(null)}>Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { display: "flex", minHeight: "100vh", background: "#f8fafc" },
  sidebar: { width: "240px", background: "#1e293b", padding: "20px", display: "flex", flexDirection: "column" },
  logoBox: { display: "flex", gap: "10px", alignItems: "center", marginBottom: "32px" },
  logoIcon: { fontSize: "28px" },
  logoTitle: { color: "#fff", fontWeight: "bold", fontSize: "15px" },
  logoSub: { color: "#94a3b8", fontSize: "12px" },
  menu: { flex: 1, display: "flex", flexDirection: "column", gap: "4px" },
  menuItem: { padding: "10px 14px", borderRadius: "8px", color: "#94a3b8", cursor: "pointer", fontSize: "14px" },
  main: { flex: 1, padding: "24px 32px" },
  loading: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#64748b" },
  eventHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" },
  eventTitle: { fontSize: "24px", fontWeight: "bold", color: "#0f172a" },
  eventMeta: { fontSize: "14px", color: "#64748b", marginTop: "4px" },
  eventStats: { display: "flex", gap: "16px" },
  statBox: { background: "#fff", padding: "12px 20px", borderRadius: "10px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  statNum: { fontSize: "24px", fontWeight: "bold", color: "#2563eb" },
  statLabel: { fontSize: "12px", color: "#64748b" },
  tabs: { display: "flex", gap: "8px", marginBottom: "20px" },
  tab: { padding: "10px 20px", borderRadius: "8px", border: "none", background: "#e2e8f0", color: "#64748b", cursor: "pointer", fontSize: "14px", fontWeight: "bold" },
  tabActive: { padding: "10px 20px", borderRadius: "8px", border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: "bold" },
  toolbar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" },
  searchInput: { padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", width: "240px", fontSize: "14px" },
  toolbarActions: { display: "flex", gap: "8px" },
  btnGreen: { padding: "10px 16px", borderRadius: "8px", border: "none", background: "#10b981", color: "#fff", fontSize: "14px", fontWeight: "bold", cursor: "pointer" },
  btnBlue: { padding: "10px 16px", borderRadius: "8px", border: "none", background: "#2563eb", color: "#fff", fontSize: "14px", fontWeight: "bold", cursor: "pointer" },
  tableBox: { background: "#fff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "12px", background: "#f1f5f9", textAlign: "left", fontSize: "13px", color: "#64748b", borderBottom: "1px solid #e2e8f0" },
  td: { padding: "12px", fontSize: "14px", color: "#0f172a", borderBottom: "1px solid #e2e8f0" },
  empty: { padding: "24px", textAlign: "center", color: "#94a3b8" },
  vipBadge: { padding: "4px 10px", borderRadius: "12px", background: "#fef3c7", color: "#92400e", fontSize: "12px", fontWeight: "bold" },
  normalBadge: { padding: "4px 10px", borderRadius: "12px", background: "#e2e8f0", color: "#64748b", fontSize: "12px", fontWeight: "bold" },
  hadirBadge: { padding: "4px 10px", borderRadius: "12px", background: "#dcfce7", color: "#16a34a", fontSize: "12px", fontWeight: "bold" },
  belumBadge: { padding: "4px 10px", borderRadius: "12px", background: "#fee2e2", color: "#dc2626", fontSize: "12px", fontWeight: "bold" },
  actionBtns: { display: "flex", gap: "8px" },
  btnQr: { padding: "6px 10px", borderRadius: "6px", border: "none", background: "#dbeafe", color: "#1d4ed8", fontSize: "12px", cursor: "pointer" },
  btnDanger: { padding: "6px 10px", borderRadius: "6px", border: "none", background: "#fee2e2", color: "#dc2626", fontSize: "12px", cursor: "pointer" },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modal: { background: "#fff", padding: "24px", borderRadius: "12px", width: "400px", maxWidth: "90vw" },
  modalTitle: { fontSize: "18px", fontWeight: "bold", marginBottom: "16px", color: "#0f172a" },
  input: { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", marginBottom: "12px", boxSizing: "border-box" },
  modalActions: { display: "flex", gap: "8px", marginTop: "16px" },
  btnPrimary: { padding: "10px 16px", borderRadius: "8px", border: "none", background: "#2563eb", color: "#fff", fontSize: "14px", fontWeight: "bold", cursor: "pointer" },
  btnSecondary: { padding: "10px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", color: "#0f172a", fontSize: "14px", cursor: "pointer" },
  qrBox: { display: "flex", justifyContent: "center", margin: "16px 0", padding: "20px", background: "#f8fafc", borderRadius: "12px" },
  qrInfo: { textAlign: "center", fontSize: "14px", color: "#64748b", marginBottom: "16px" },
  statsBox: { background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  progressSection: { marginBottom: "24px" },
  progressLabel: { fontSize: "14px", fontWeight: "bold", color: "#0f172a", marginBottom: "8px" },
  progressBar: { height: "12px", background: "#e2e8f0", borderRadius: "6px", overflow: "hidden" },
  progressFill: { height: "100%", background: "#10b981", borderRadius: "6px", transition: "width 0.3s" },
  progressText: { fontSize: "14px", color: "#64748b", marginTop: "4px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" },
  statsCard: { background: "#f8fafc", padding: "16px", borderRadius: "10px", textAlign: "center" },
  statsNum: { fontSize: "28px", fontWeight: "bold", color: "#2563eb" },
  statsLabel: { fontSize: "13px", color: "#64748b" },
};
