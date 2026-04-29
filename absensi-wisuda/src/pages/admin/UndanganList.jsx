import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

export default function UndanganList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invited, setInvited] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterKategori, setFilterKategori] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    if (!user || user.role !== "admin_sistem") {
      navigate("/login");
      return;
    }
    loadInvited();
  }, []);

  const loadInvited = async () => {
    setLoading(true);
    try {
      const res = await api.get("/all-invited");
      setInvited(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalInvited = invited.length;
  const totalCheckin = invited.filter(i => i.status_checkin === "sudah").length;
  const totalBelum = invited.filter(i => i.status_checkin === "belum").length;
  const totalVIP = invited.filter(i => i.kategori === "VIP").length;

  const filtered = invited.filter((u) => {
    const matchSearch = u.nama.toLowerCase().includes(search.toLowerCase()) ||
      u.nim_nik.toLowerCase().includes(search.toLowerCase()) ||
      (u.event_nama || "").toLowerCase().includes(search.toLowerCase());
    const matchKategori = !filterKategori || u.kategori === filterKategori;
    const matchStatus = !filterStatus || u.status_checkin === filterStatus;
    return matchSearch && matchKategori && matchStatus;
  });

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Memuat data undangan...</p>
      </div>
    );
  }

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
          <div style={styles.menuItemActive}>Undangan</div>
        </div>
      </aside>

      <main style={styles.main}>
        <h1 style={styles.pageTitle}>Semua Undangan</h1>

        <div style={styles.statsRow}>
          <div style={{ ...styles.statCard, borderLeft: "4px solid #3b82f6" }}>
            <div style={styles.statIcon}>📬</div>
            <div>
              <div style={styles.statValue}>{totalInvited}</div>
              <div style={styles.statLabel}>Total Undangan</div>
            </div>
          </div>
          <div style={{ ...styles.statCard, borderLeft: "4px solid #10b981" }}>
            <div style={styles.statIcon}>✅</div>
            <div>
              <div style={styles.statValue}>{totalCheckin}</div>
              <div style={styles.statLabel}>Sudah Check-in</div>
            </div>
          </div>
          <div style={{ ...styles.statCard, borderLeft: "4px solid #f59e0b" }}>
            <div style={styles.statIcon}>⏳</div>
            <div>
              <div style={styles.statValue}>{totalBelum}</div>
              <div style={styles.statLabel}>Belum Check-in</div>
            </div>
          </div>
          <div style={{ ...styles.statCard, borderLeft: "4px solid #8b5cf6" }}>
            <div style={styles.statIcon}>⭐</div>
            <div>
              <div style={styles.statValue}>{totalVIP}</div>
              <div style={styles.statLabel}>VIP</div>
            </div>
          </div>
        </div>

        <div style={styles.toolbar}>
          <input
            type="text"
            placeholder="Cari nama, NIM/NIK, atau event..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          <select value={filterKategori} onChange={(e) => setFilterKategori(e.target.value)} style={styles.select}>
            <option value="">Semua Kategori</option>
            <option value="Normal">Normal</option>
            <option value="VIP">VIP</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={styles.select}>
            <option value="">Semua Status</option>
            <option value="belum">Belum Check-in</option>
            <option value="sudah">Sudah Check-in</option>
          </select>
        </div>

        <div style={styles.tableBox}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Nama</th>
                <th style={styles.th}>NIM/NIK</th>
                <th style={styles.th}>Event</th>
                <th style={styles.th}>Kategori</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Check-in</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="6" style={styles.empty}>Tidak ada data undangan</td></tr>
              ) : filtered.map((u) => (
                <tr key={u.id}>
                  <td style={styles.td}>{u.nama}</td>
                  <td style={styles.td}>{u.nim_nik}</td>
                  <td style={styles.td}>{u.event_nama || "-"}</td>
                  <td style={styles.td}>
                    <span style={u.kategori === "VIP" ? styles.vipBadge : styles.normalBadge}>{u.kategori}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={u.status_checkin === "sudah" ? styles.hadirBadge : styles.belumBadge}>
                      {u.status_checkin === "sudah" ? "Hadir" : "Belum"}
                    </span>
                  </td>
                  <td style={styles.td}>{u.checkin_at ? new Date(u.checkin_at).toLocaleString("id-ID") : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
  loading: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: "16px", color: "#64748b" },
  spinner: { width: "40px", height: "40px", border: "4px solid #e2e8f0", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 1s linear infinite" },
  pageTitle: { fontSize: "24px", fontWeight: "bold", color: "#0f172a", marginBottom: "24px" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px" },
  statCard: { background: "#fff", padding: "16px 20px", borderRadius: "12px", display: "flex", gap: "12px", alignItems: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  statIcon: { fontSize: "28px" },
  statValue: { fontSize: "24px", fontWeight: "bold", color: "#0f172a" },
  statLabel: { fontSize: "12px", color: "#64748b" },
  toolbar: { display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" },
  searchInput: { padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", flex: 1, minWidth: "200px", fontSize: "14px" },
  select: { padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px" },
  tableBox: { background: "#fff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "12px", background: "#f1f5f9", textAlign: "left", fontSize: "13px", color: "#64748b", borderBottom: "1px solid #e2e8f0" },
  td: { padding: "12px", fontSize: "14px", color: "#0f172a", borderBottom: "1px solid #e2e8f0" },
  empty: { padding: "24px", textAlign: "center", color: "#94a3b8" },
  vipBadge: { padding: "4px 10px", borderRadius: "12px", background: "#fef3c7", color: "#92400e", fontSize: "12px", fontWeight: "bold" },
  normalBadge: { padding: "4px 10px", borderRadius: "12px", background: "#e2e8f0", color: "#64748b", fontSize: "12px", fontWeight: "bold" },
  hadirBadge: { padding: "4px 10px", borderRadius: "12px", background: "#dcfce7", color: "#16a34a", fontSize: "12px", fontWeight: "bold" },
  belumBadge: { padding: "4px 10px", borderRadius: "12px", background: "#fee2e2", color: "#dc2626", fontSize: "12px", fontWeight: "bold" },
};