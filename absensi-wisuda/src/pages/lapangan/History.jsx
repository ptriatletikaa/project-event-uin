import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import * as XLSX from "xlsx";

export default function History() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "admin_lapangan") {
      navigate("/login");
      return;
    }
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [eventRes, logsRes] = await Promise.all([
        api.get(`/events/${id}`),
        api.get(`/events/${id}/checkin-logs`),
      ]);
      setEvent(eventRes.data);
      setLogs(logsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const data = logs.map((log, i) => ({
      No: i + 1,
      Nama: log.nama,
      "NIM/NIK": log.nim_nik,
      Kategori: log.kategori,
      "Waktu Check-in": new Date(log.timestamp).toLocaleString("id-ID"),
      Metode: log.method === "scan" ? "Scan QR" : "Manual",
      "Scanned By": log.scanned_by_nama || "-",
      Alasan: log.reason || "-",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Riwayat Check-in");
    XLSX.writeFile(wb, `${event?.nama || "event"}_checkin.xlsx`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(`/lapangan/scan/${id}`)}>← Kembali</button>
        <h1 style={styles.title}>Riwayat Check-in</h1>
        {logs.length > 0 && <button style={styles.exportBtn} onClick={exportCSV}>Export Excel</button>}
      </div>

      {event && (
        <div style={styles.eventInfo}>
          <h2 style={styles.eventName}>{event.nama}</h2>
          <p style={styles.eventMeta}>{event.lokasi} | {event.tanggal}</p>
        </div>
      )}

      {loading ? (
        <p style={styles.loading}>Loading...</p>
      ) : logs.length === 0 ? (
        <div style={styles.emptyState}>
          <p>Belum ada check-in untuk event ini.</p>
        </div>
      ) : (
        <div style={styles.tableBox}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>No</th>
                <th style={styles.th}>Nama</th>
                <th style={styles.th}>NIM/NIK</th>
                <th style={styles.th}>Kategori</th>
                <th style={styles.th}>Waktu</th>
                <th style={styles.th}>Metode</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={log.id}>
                  <td style={styles.td}>{i + 1}</td>
                  <td style={styles.td}>{log.nama}</td>
                  <td style={styles.td}>{log.nim_nik}</td>
                  <td style={styles.td}>{log.kategori}</td>
                  <td style={styles.td}>{new Date(log.timestamp).toLocaleString("id-ID")}</td>
                  <td style={styles.td}>
                    <span style={log.method === "scan" ? styles.scanBadge : styles.manualBadge}>
                      {log.method === "scan" ? "📷 Scan" : "✏️ Manual"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f8fafc", padding: "16px" },
  header: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" },
  backBtn: { padding: "8px 16px", borderRadius: "8px", border: "none", background: "#e2e8f0", color: "#0f172a", fontSize: "14px", cursor: "pointer" },
  title: { flex: 1, fontSize: "20px", fontWeight: "bold", color: "#0f172a" },
  exportBtn: { padding: "8px 16px", borderRadius: "8px", border: "none", background: "#10b981", color: "#fff", fontSize: "14px", fontWeight: "bold", cursor: "pointer" },
  eventInfo: { marginBottom: "20px" },
  eventName: { fontSize: "18px", fontWeight: "bold", color: "#0f172a" },
  eventMeta: { fontSize: "13px", color: "#64748b" },
  loading: { textAlign: "center", color: "#64748b", padding: "48px" },
  emptyState: { textAlign: "center", color: "#64748b", padding: "48px", background: "#fff", borderRadius: "12px" },
  tableBox: { background: "#fff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "12px", background: "#f1f5f9", textAlign: "left", fontSize: "13px", color: "#64748b", borderBottom: "1px solid #e2e8f0" },
  td: { padding: "12px", fontSize: "14px", color: "#0f172a", borderBottom: "1px solid #e2e8f0" },
  scanBadge: { padding: "4px 8px", borderRadius: "6px", background: "#dcfce7", color: "#16a34a", fontSize: "12px" },
  manualBadge: { padding: "4px 8px", borderRadius: "6px", background: "#fef3c7", color: "#92400e", fontSize: "12px" },
};
