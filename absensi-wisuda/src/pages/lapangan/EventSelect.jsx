import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

export default function EventSelect() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      // Ambil semua event dulu (nanti difilter di frontend)
      const res = await api.get("/events");
      const allEvents = res.data || [];
      
      // Untuk demo, tampilkan semua event yang active
      // Nanti bisa difilter berdasarkan user yang login
      const activeEvents = allEvents.filter(e => e.status === "active");
      setEvents(activeEvents.length > 0 ? activeEvents : allEvents);
    } catch (err) {
      console.error("Error loading events:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Pilih Event</h1>
          <p style={styles.subtitle}>Pilih event untuk mulai scan</p>
        </div>
        <button style={styles.logoutBtn} onClick={logout}>Logout</button>
      </div>

      {loading ? (
        <p style={styles.loading}>Loading...</p>
      ) : events.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>Tidak ada event yang tersedia.</p>
          <p style={styles.emptySubtext}>Hubungi Admin Sistem untuk dibuatkan event.</p>
        </div>
      ) : (
        <div style={styles.eventGrid}>
          {events.map((event) => (
            <div
              key={event.id}
              style={styles.eventCard}
              onClick={() => navigate(`/lapangan/scan/${event.id}`)}
            >
              <div style={styles.eventIcon}>📅</div>
              <div style={styles.eventInfo}>
                <h2 style={styles.eventName}>{event.nama}</h2>
                <p style={styles.eventMeta}>{event.lokasi || "Lokasi belum ditentukan"}</p>
                <p style={styles.eventMeta}>
                  {event.tanggal ? new Date(event.tanggal).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "-"}
                </p>
              </div>
              <div style={styles.eventStats}>
                <div style={styles.statItem}>
                  <span style={styles.statNum}>{event.total_invited || 0}</span>
                  <span style={styles.statLabel}>Undangan</span>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statNum}>{event.total_checkin || 0}</span>
                  <span style={styles.statLabel}>Check-in</span>
                </div>
              </div>
              <button style={styles.scanBtn}>Mulai Scan</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f8fafc", padding: "24px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" },
  title: { fontSize: "28px", fontWeight: "bold", color: "#0f172a" },
  subtitle: { fontSize: "14px", color: "#64748b" },
  logoutBtn: { padding: "10px 20px", borderRadius: "8px", border: "1px solid #ef4444", background: "transparent", color: "#ef4444", fontSize: "14px", fontWeight: "bold", cursor: "pointer" },
  loading: { textAlign: "center", color: "#64748b", padding: "48px" },
  emptyState: { textAlign: "center", padding: "48px", background: "#fff", borderRadius: "16px" },
  emptyText: { fontSize: "18px", color: "#0f172a", marginBottom: "8px" },
  emptySubtext: { fontSize: "14px", color: "#64748b" },
  eventGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" },
  eventCard: { background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", cursor: "pointer", transition: "transform 0.2s", display: "flex", flexDirection: "column", gap: "16px" },
  eventIcon: { fontSize: "40px" },
  eventInfo: { flex: 1 },
  eventName: { fontSize: "20px", fontWeight: "bold", color: "#0f172a", marginBottom: "8px" },
  eventMeta: { fontSize: "13px", color: "#64748b", marginTop: "4px" },
  eventStats: { display: "flex", gap: "24px", padding: "12px 0", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0" },
  statItem: { display: "flex", flexDirection: "column" },
  statNum: { fontSize: "20px", fontWeight: "bold", color: "#10b981" },
  statLabel: { fontSize: "12px", color: "#64748b" },
  scanBtn: { width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: "#10b981", color: "#fff", fontSize: "15px", fontWeight: "bold", cursor: "pointer" },
};
