import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

export default function UserManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ nama: "", email: "", password: "", role: "admin_lapangan" });
  const [filterRole, setFilterRole] = useState("");

  useEffect(() => {
    if (!user || user.role !== "admin_sistem") {
      navigate("/login");
      return;
    }
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users" + (filterRole ? `?role=${filterRole}` : ""));
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [filterRole]);

  const openAddModal = () => {
    setEditingUser(null);
    setForm({ nama: "", email: "", password: "", role: "admin_lapangan" });
    setShowModal(true);
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setForm({ nama: u.nama, email: u.email, password: "", role: u.role });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, { nama: form.nama, email: form.email, role: form.role, status: "active" });
      } else {
        if (!form.password) return alert("Password wajib diisi");
        await api.post("/users", form);
      }
      setShowModal(false);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menyimpan");
    }
  };

  const handleResetPassword = async (id) => {
    if (!window.confirm("Reset password ke 'password123'?")) return;
    try {
      await api.put(`/users/${id}/reset-password`);
      alert("Password berhasil direset");
    } catch (err) {
      alert("Gagal reset password");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus user ini? Data user akan dihapus permanen.")) return;
    try {
      await api.delete(`/users/${id}`);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus user");
    }
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
          <div style={styles.menuItemActive} onClick={() => navigate("/admin/users")}>User Management</div>
          <div style={styles.menuItem} onClick={() => navigate("/admin/events")}>Event Management</div>
        </div>
      </aside>

      <main style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.pageTitle}>User Management</h1>
          <div style={styles.headerActions}>
            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} style={styles.select}>
              <option value="">Semua Role</option>
              <option value="admin_sistem">Admin Sistem</option>
              <option value="admin_lapangan">Admin Lapangan</option>
            </select>
            <button style={styles.btnPrimary} onClick={openAddModal}>+ Tambah User</button>
          </div>
        </div>

        <div style={styles.tableBox}>
          {loading ? (
            <p style={styles.empty}>Loading...</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Nama</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={styles.td}>{u.nama}</td>
                    <td style={styles.td}>{u.email}</td>
                    <td style={styles.td}>
                      <span style={u.role === "admin_sistem" ? styles.badgeBlue : styles.badgeGreen}>
                        {u.role === "admin_sistem" ? "Admin Sistem" : "Admin Lapangan"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={u.status === "active" ? styles.badgeGreen : styles.badgeRed}>
                        {u.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionBtns}>
                        <button style={styles.btnEdit} onClick={() => openEditModal(u)}>Edit</button>
                        <button style={styles.btnReset} onClick={() => handleResetPassword(u.id)}>Reset PW</button>
                        <button style={styles.btnDanger} onClick={() => handleDelete(u.id)}>Hapus</button>
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
              <h2 style={styles.modalTitle}>{editingUser ? "Edit User" : "Tambah User"}</h2>
              <form onSubmit={handleSubmit}>
                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>Nama</label>
                  <input type="text" placeholder="masukkan nama" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} style={styles.input} required />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>Email</label>
                  <input type="email" placeholder="masukkan email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={styles.input} required />
                </div>
                {!editingUser && (
                  <div style={styles.fieldGroup}>
                    <label style={styles.fieldLabel}>Password</label>
                    <input type="password" placeholder="masukkan password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={styles.input} required />
                  </div>
                )}
                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>Role</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={styles.input}>
                    <option value="admin_lapangan">Admin Lapangan</option>
                    <option value="admin_sistem">Admin Sistem</option>
                  </select>
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
  headerActions: { display: "flex", gap: "12px", alignItems: "center" },
  select: { padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px" },
  btnPrimary: { padding: "10px 16px", borderRadius: "8px", border: "none", background: "#2563eb", color: "#fff", fontSize: "14px", fontWeight: "bold", cursor: "pointer" },
  tableBox: { background: "#fff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "12px", background: "#f1f5f9", textAlign: "left", fontSize: "13px", color: "#64748b", borderBottom: "1px solid #e2e8f0" },
  td: { padding: "12px", fontSize: "14px", color: "#0f172a", borderBottom: "1px solid #e2e8f0" },
  empty: { padding: "24px", textAlign: "center", color: "#94a3b8" },
  badgeBlue: { padding: "4px 10px", borderRadius: "12px", background: "#dbeafe", color: "#1d4ed8", fontSize: "12px", fontWeight: "bold" },
  badgeGreen: { padding: "4px 10px", borderRadius: "12px", background: "#dcfce7", color: "#16a34a", fontSize: "12px", fontWeight: "bold" },
  badgeRed: { padding: "4px 10px", borderRadius: "12px", background: "#fee2e2", color: "#dc2626", fontSize: "12px", fontWeight: "bold" },
  actionBtns: { display: "flex", gap: "8px" },
  btnEdit: { padding: "6px 10px", borderRadius: "6px", border: "none", background: "#f1f5f9", color: "#0f172a", fontSize: "12px", cursor: "pointer" },
  btnReset: { padding: "6px 10px", borderRadius: "6px", border: "none", background: "#fef3c7", color: "#92400e", fontSize: "12px", cursor: "pointer" },
  btnDanger: { padding: "6px 10px", borderRadius: "6px", border: "none", background: "#fee2e2", color: "#dc2626", fontSize: "12px", cursor: "pointer" },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modal: { background: "#fff", padding: "24px", borderRadius: "12px", width: "400px", maxWidth: "90vw" },
  modalTitle: { fontSize: "18px", fontWeight: "bold", marginBottom: "16px", color: "#0f172a" },
  input: { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", boxSizing: "border-box" },
  fieldGroup: { marginBottom: "12px" },
  fieldLabel: { display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "4px" },
  modalActions: { display: "flex", gap: "8px", marginTop: "16px" },
  btnSecondary: { padding: "10px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", color: "#0f172a", fontSize: "14px", cursor: "pointer" },
};
