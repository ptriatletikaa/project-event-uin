import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

export default function EventManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [allAdmins, setAllAdmins] = useState([]);
  const [form, setForm] = useState({
    nama: "", tanggal: "", waktu_mulai: "", waktu_selesai: "", lokasi: "", deskripsi: "", kapasitas: "", status: "draft", admin_ids: []
  });

  useEffect(() => {
    if (!user || user.role !== "admin_sistem") {
      navigate("/login");
      return;
    }
    loadEvents();
    loadAdmins();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/events");
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAdmins = async () => {
    try {
      const res = await api.get("/users?role=admin_lapangan");
      setAllAdmins(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const openAddModal = () => {
    setEditingEvent(null);
    setForm({ nama: "", tanggal: "", waktu_mulai: "", waktu_selesai: "", lokasi: "", deskripsi: "", kapasitas: "", status: "draft", admin_ids: [] });
    setShowModal(true);
  };

  const openEditModal = (e) => {
    setEditingEvent(e);
    setForm({
      nama: e.nama, tanggal: e.tanggal, waktu_mulai: e.waktu_mulai, waktu_selesai: e.waktu_selesai,
      lokasi: e.lokasi, deskripsi: e.deskripsi || "", kapasitas: e.kapasitas, status: e.status, admin_ids: []
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await api.put(`/events/${editingEvent.id}`, form);
        if (form.admin_ids.length > 0) {
          await api.put(`/events/${editingEvent.id}/assign-admins`, { admin_ids: form.admin_ids });
        }
      } else {
        const res = await api.post("/events", form);
        if (form.admin_ids.length > 0) {
          await api.put(`/events/${res.data.id}/assign-admins`, { admin_ids: form.admin_ids });
        }
      }
      setShowModal(false);
      loadEvents();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menyimpan");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus event ini? Semua undangan terkait juga akan dihapus.")) return;
    try {
      await api.delete(`/events/${id}`);
      loadEvents();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus");
    }
  };

  const getStatusBadge = (status) => {
    const colors = { draft: "#fef3c7", active: "#dcfce7", selesai: "#e2e8f0" };
    const text = { draft: "#92400e", active: "#16a34a", selesai: "#64748b" };
    return { background: colors[status] || "#f1f5f9", color: text[status] || "#0f172a" };
  };

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
          <div style={styles.menuItemActive}>Event Management</div>
        </div>
      </aside>

      <main style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.pageTitle}>Event Management</h1>
          <div style={styles.headerActions}>
            <button style={styles.btnScan} onClick={() => navigate("/lapangan/event-select")}>📷 Scan QR</button>
            <button style={styles.btnPrimary} onClick={openAddModal}>+ Tambah Event</button>
          </div>
        </div>

        <div style={styles.tableBox}>
          {loading ? (
            <p style={styles.empty}>Loading...</p>
          ) : events.length === 0 ? (
            <p style={styles.empty}>Belum ada event</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Nama</th>
                  <th style={styles.th}>Tanggal</th>
                  <th style={styles.th}>Lokasi</th>
                  <th style={styles.th}>Kapasitas</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Undangan</th>
                  <th style={styles.th}>Check-in</th>
                  <th style={styles.th}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id}>
                    <td style={styles.td}>{e.nama}</td>
                    <td style={styles.td}>{e.tanggal}</td>
                    <td style={styles.td}>{e.lokasi}</td>
                    <td style={styles.td}>{e.kapasitas}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, ...getStatusBadge(e.status) }}>{e.status}</span>
                    </td>
                    <td style={styles.td}>{e.total_invited || 0}</td>
                    <td style={styles.td}>{e.total_checkin || 0}</td>
                    <td style={styles.td}>
                      <div style={styles.actionBtns}>
                        <button style={styles.btnDetail} onClick={() => navigate(`/admin/events/${e.id}`)}>Detail</button>
                        <button style={styles.btnEdit} onClick={() => openEditModal(e)}>Edit</button>
                        <button style={styles.btnDanger} onClick={() => handleDelete(e.id)}>Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {showModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h2 style={styles.modalTitle}>{editingEvent ? "Edit Event" : "Tambah Event"}</h2>
              <form onSubmit={handleSubmit}>
                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>Nama Event</label>
                  <input type="text" placeholder="masukkan nama event" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} style={styles.input} required />
                </div>
                <div style={styles.row}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.fieldLabel}>Tanggal</label>
                    <input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} style={styles.input} required />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.fieldLabel}>Kapasitas</label>
                    <input type="number" placeholder="jumlah" value={form.kapasitas} onChange={(e) => setForm({ ...form, kapasitas: e.target.value })} style={styles.input} required />
                  </div>
                </div>
                <div style={styles.row}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.fieldLabel}>Waktu Mulai</label>
                    <input type="time" value={form.waktu_mulai} onChange={(e) => setForm({ ...form, waktu_mulai: e.target.value })} style={styles.input} required />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.fieldLabel}>Waktu Selesai</label>
                    <input type="time" value={form.waktu_selesai} onChange={(e) => setForm({ ...form, waktu_selesai: e.target.value })} style={styles.input} required />
                  </div>
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>Lokasi</label>
                  <input type="text" placeholder="masukkan lokasi" value={form.lokasi} onChange={(e) => setForm({ ...form, lokasi: e.target.value })} style={styles.input} required />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>Deskripsi (opsional)</label>
                  <textarea placeholder="deskripsi event" value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} style={{ ...styles.input, minHeight: "60px" }} />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={styles.input}>
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="selesai">Selesai</option>
                  </select>
                </div>
                <div style={styles.checkboxGroup}>
                  <label style={styles.checkboxLabel}>Assign Admin Lapangan:</label>
                  <div style={styles.checkboxList}>
                    {allAdmins.map((admin) => (
                      <label key={admin.id} style={styles.checkboxItem}>
                        <input
                          type="checkbox"
                          checked={form.admin_ids.includes(admin.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm({ ...form, admin_ids: [...form.admin_ids, admin.id] });
                            } else {
                              setForm({ ...form, admin_ids: form.admin_ids.filter(id => id !== admin.id) });
                            }
                          }}
                        />
                        {admin.nama}
                      </label>
                    ))}
                  </div>
                </div>
                <div style={styles.modalActions}>
                  <button type="submit" style={styles.btnPrimary}>Simpan</button>
                  <button type="button" style={styles.btnSecondary} onClick={() => setShowModal(false)}>Batal</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
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
  menuItemActive: { padding: "10px 14px", borderRadius: "8px", background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: "bold" },
  main: { flex: 1, padding: "24px 32px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" },
  pageTitle: { fontSize: "24px", fontWeight: "bold", color: "#0f172a" },
  headerActions: { display: "flex", gap: "10px" },
  btnScan: { padding: "10px 16px", borderRadius: "8px", border: "none", background: "#10b981", color: "#fff", fontSize: "14px", fontWeight: "bold", cursor: "pointer" },
  btnPrimary: { padding: "10px 16px", borderRadius: "8px", border: "none", background: "#2563eb", color: "#fff", fontSize: "14px", fontWeight: "bold", cursor: "pointer" },
  tableBox: { background: "#fff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "12px", background: "#f1f5f9", textAlign: "left", fontSize: "13px", color: "#64748b", borderBottom: "1px solid #e2e8f0" },
  td: { padding: "12px", fontSize: "14px", color: "#0f172a", borderBottom: "1px solid #e2e8f0" },
  empty: { padding: "24px", textAlign: "center", color: "#94a3b8" },
  badge: { padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold", textTransform: "capitalize" },
  actionBtns: { display: "flex", gap: "8px" },
  btnDetail: { padding: "6px 10px", borderRadius: "6px", border: "none", background: "#dbeafe", color: "#1d4ed8", fontSize: "12px", cursor: "pointer" },
  btnEdit: { padding: "6px 10px", borderRadius: "6px", border: "none", background: "#f1f5f9", color: "#0f172a", fontSize: "12px", cursor: "pointer" },
  btnDanger: { padding: "6px 10px", borderRadius: "6px", border: "none", background: "#fee2e2", color: "#dc2626", fontSize: "12px", cursor: "pointer" },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modal: { background: "#fff", padding: "24px", borderRadius: "12px", width: "500px", maxWidth: "90vw", maxHeight: "90vh", overflowY: "auto" },
  modalTitle: { fontSize: "18px", fontWeight: "bold", marginBottom: "16px", color: "#0f172a" },
  input: { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", boxSizing: "border-box" },
  fieldGroup: { marginBottom: "12px" },
  fieldLabel: { display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "4px" },
  row: { display: "flex", gap: "12px" },
  modalActions: { display: "flex", gap: "8px", marginTop: "16px" },
  btnSecondary: { padding: "10px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", color: "#0f172a", fontSize: "14px", cursor: "pointer" },
  checkboxGroup: { marginBottom: "12px" },
  checkboxLabel: { fontSize: "14px", fontWeight: "bold", color: "#0f172a", display: "block", marginBottom: "8px" },
  checkboxList: { display: "flex", flexWrap: "wrap", gap: "8px" },
  checkboxItem: { display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "6px 10px", background: "#f1f5f9", borderRadius: "6px", cursor: "pointer" },
};
