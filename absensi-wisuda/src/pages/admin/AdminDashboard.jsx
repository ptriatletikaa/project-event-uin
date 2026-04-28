import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ events: 0, users: 0, invited: 0, checkin: 0 });
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [activeMenu, setActiveMenu] = useState("dashboard");

  useEffect(() => {
    if (!user || user.role !== "admin_sistem") {
      navigate("/login");
      return;
    }
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [eventsRes, usersRes] = await Promise.all([
        api.get("/events"),
        api.get("/users"),
      ]);

      const events = eventsRes.data || [];
      const users = usersRes.data || [];

      const totalInvited = events.reduce((sum, e) => sum + (e.total_invited || 0), 0);
      const totalCheckin = events.reduce((sum, e) => sum + (e.total_checkin || 0), 0);

      setStats({
        events: events.length,
        users: users.length,
        invited: totalInvited,
        checkin: totalCheckin,
      });

      // Ambil checkin logs (endpoint mungkin belum ada di backend lama)
      try {
        const logsRes = await api.get("/checkin-logs");
        setRecentCheckins((logsRes.data || []).slice(0, 5));
      } catch (logsErr) {
        console.log("Checkin logs endpoint not available yet");
        setRecentCheckins([]);
      }
    } catch (err) {
      console.error("Error loading stats:", err);
      setStats({ events: 0, users: 0, invited: 0, checkin: 0 });
      setRecentCheckins([]);
    }
  };

  const statCards = [
    {
      label: "Total Event",
      value: stats.events,
      icon: "📅",
      color: "#2563eb",
      onClick: () => navigate("/admin/events")
    },
    {
      label: "Total User",
      value: stats.users,
      icon: "👤",
      color: "#7c3aed",
      onClick: () => navigate("/admin/users")
    },
    {
      label: "Total Undangan",
      value: stats.invited,
      icon: "📬",
      color: "#10b981",
      onClick: () => navigate("/admin/events")
    },
    {
      label: "Total Check-in",
      value: stats.checkin,
      icon: "✅",
      color: "#f59e0b",
      onClick: () => navigate("/admin/events")
    },
  ];

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
          {[
            { key: "dashboard", label: "Dashboard" },
            { key: "users", label: "User Management" },
            { key: "events", label: "Event Management" },
          ].map((item) => (
            <div
              key={item.key}
              style={activeMenu === item.key ? styles.menuItemActive : styles.menuItem}
              onClick={() => {
                setActiveMenu(item.key);
                if (item.key === "users") navigate("/admin/users");
                else if (item.key === "events") navigate("/admin/events");
              }}
            >
              {item.label}
            </div>
          ))}
        </div>

        <div style={styles.bottomMenu}>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{user?.nama}</div>
            <div style={styles.userRole}>{user?.email}</div>
          </div>
          <button style={styles.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </aside>

      <main style={styles.main}>
        <h1 style={styles.pageTitle}>Dashboard</h1>

        <div style={styles.statsGrid}>
          {statCards.map((stat) => (
            <div
              key={stat.label}
              style={{
                ...styles.statCard,
                cursor: "pointer",
                borderLeft: `4px solid ${stat.color}`
              }}
              onClick={stat.onClick}
            >
              <div style={styles.statIcon}>{stat.icon}</div>
              <div>
                <div style={styles.statValue}>{stat.value}</div>
                <div style={styles.statLabel}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Aktivitas Check-in Terakhir</h2>
          {recentCheckins.length === 0 ? (
            <p style={styles.empty}>Belum ada check-in</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Nama</th>
                  <th style={styles.th}>NIM/NIK</th>
                  <th style={styles.th}>Waktu</th>
                  <th style={styles.th}>Metode</th>
                </tr>
              </thead>
              <tbody>
                {recentCheckins.map((log) => (
                  <tr key={log.id}>
                    <td style={styles.td}>{log.nama || "Unknown"}</td>
                    <td style={styles.td}>{log.nim_nik || "-"}</td>
                    <td style={styles.td}>{log.timestamp ? new Date(log.timestamp).toLocaleString("id-ID") : "-"}</td>
                    <td style={styles.td}>
                      <span style={log.method === "scan" ? styles.scanBadge : styles.manualBadge}>
                        {log.method === "scan" ? "📷 Scan" : "✏️ Manual"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
  bottomMenu: { borderTop: "1px solid #334155", paddingTop: "16px" },
  userInfo: { marginBottom: "12px" },
  userName: { color: "#fff", fontSize: "13px", fontWeight: "bold" },
  userRole: { color: "#94a3b8", fontSize: "11px" },
  logoutBtn: { width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ef4444", background: "transparent", color: "#ef4444", cursor: "pointer", fontSize: "13px" },
  main: { flex: 1, padding: "24px 32px" },
  pageTitle: { fontSize: "24px", fontWeight: "bold", color: "#0f172a", marginBottom: "24px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" },
  statCard: { background: "#fff", padding: "20px", borderRadius: "12px", display: "flex", gap: "14px", alignItems: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", transition: "transform 0.2s, box-shadow 0.2s" },
  statIcon: { fontSize: "32px" },
  statValue: { fontSize: "28px", fontWeight: "bold", color: "#0f172a" },
  statLabel: { fontSize: "13px", color: "#64748b" },
  section: { background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  sectionTitle: { fontSize: "16px", fontWeight: "bold", color: "#0f172a", marginBottom: "16px" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "10px 12px", background: "#f1f5f9", textAlign: "left", fontSize: "13px", color: "#64748b", borderBottom: "1px solid #e2e8f0" },
  td: { padding: "10px 12px", fontSize: "14px", color: "#0f172a", borderBottom: "1px solid #e2e8f0" },
  empty: { color: "#94a3b8", textAlign: "center", padding: "24px" },
  scanBadge: { padding: "4px 8px", borderRadius: "6px", background: "#dcfce7", color: "#16a34a", fontSize: "12px" },
  manualBadge: { padding: "4px 8px", borderRadius: "6px", background: "#fef3c7", color: "#92400e", fontSize: "12px" },
};
