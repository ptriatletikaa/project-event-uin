import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

export default function ManualCheckin() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    setError("");
    setResults([]);
    setSelectedUser(null);

    try {
      const res = await api.get(`/events/${id}/invited-users?search=${encodeURIComponent(search)}`);
      setResults(res.data);
      if (res.data.length === 0) {
        setError("Tidak ditemukan");
      }
    } catch (err) {
      setError("Gagal mencari");
    } finally {
      setLoading(false);
    }
  };

  const handleManualCheckin = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      await api.post("/checkin/manual", {
        nim_nik: selectedUser.nim_nik,
        event_id: parseInt(id),
        reason: reason,
      });
      alert("Check-in manual berhasil!");
      navigate(`/lapangan/scan/${id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Gagal check-in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(`/lapangan/scan/${id}`)}>← Kembali</button>
        <h1 style={styles.title}>Manual Check-in</h1>
      </div>

<div style={styles.fieldGroup}>
          <label style={styles.fieldLabel}>Cari Nama atau NIM/NIK</label>
          <div style={styles.searchBox}>
            <input
              type="text"
              placeholder="ketik nama atau NIM/NIK..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button style={styles.searchBtn} onClick={handleSearch} disabled={loading}>
              {loading ? "..." : "Cari"}
            </button>
          </div>
        </div>

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.results}>
        {results.map((u) => (
          <div
            key={u.id}
            style={{
              ...styles.resultItem,
              borderColor: selectedUser?.id === u.id ? "#10b981" : "#e2e8f0",
              background: selectedUser?.id === u.id ? "#f0fdf4" : "#fff",
            }}
            onClick={() => setSelectedUser(u)}
          >
            <div style={styles.resultInfo}>
              <div style={styles.resultNama}>{u.nama}</div>
              <div style={styles.resultMeta}>NIM: {u.nim_nik} | {u.kategori}</div>
            </div>
            <div style={styles.resultStatus}>
              <span style={u.status_checkin === "sudah" ? styles.hadirBadge : styles.belumBadge}>
                {u.status_checkin === "sudah" ? "Sudah Hadir" : "Belum Hadir"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {selectedUser && (
        <div style={styles.confirmBox}>
          <h3 style={styles.confirmTitle}>Konfirmasi Check-in Manual</h3>
          <p style={styles.confirmInfo}>
            <strong>{selectedUser.nama}</strong><br />
            NIM: {selectedUser.nim_nik} | {selectedUser.kategori}
          </p>
          <textarea
            placeholder="Alasan check-in manual (opsional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={styles.reasonInput}
          />
          <div style={styles.confirmActions}>
            <button style={styles.confirmBtn} onClick={handleManualCheckin} disabled={loading}>
              {loading ? "Memproses..." : "Konfirmasi Check-in"}
            </button>
            <button style={styles.cancelBtn} onClick={() => setSelectedUser(null)}>Batal</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f8fafc", padding: "16px" },
  header: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" },
  backBtn: { padding: "8px 16px", borderRadius: "8px", border: "none", background: "#e2e8f0", color: "#0f172a", fontSize: "14px", cursor: "pointer" },
  title: { fontSize: "20px", fontWeight: "bold", color: "#0f172a" },
  searchBox: { display: "flex", gap: "8px", marginBottom: "16px" },
  searchInput: { flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px" },
  fieldGroup: { marginBottom: "16px" },
  fieldLabel: { display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" },
  searchBtn: { padding: "12px 24px", borderRadius: "10px", border: "none", background: "#10b981", color: "#fff", fontSize: "14px", fontWeight: "bold", cursor: "pointer" },
  error: { textAlign: "center", color: "#ef4444", padding: "12px", marginBottom: "16px" },
  results: { display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" },
  resultItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px", borderRadius: "10px", border: "2px solid #e2e8f0", cursor: "pointer", transition: "all 0.2s" },
  resultInfo: {},
  resultNama: { fontSize: "15px", fontWeight: "bold", color: "#0f172a" },
  resultMeta: { fontSize: "13px", color: "#64748b", marginTop: "2px" },
  hadirBadge: { padding: "4px 10px", borderRadius: "12px", background: "#dcfce7", color: "#16a34a", fontSize: "12px", fontWeight: "bold" },
  belumBadge: { padding: "4px 10px", borderRadius: "12px", background: "#fee2e2", color: "#dc2626", fontSize: "12px", fontWeight: "bold" },
  confirmBox: { background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
  confirmTitle: { fontSize: "16px", fontWeight: "bold", color: "#0f172a", marginBottom: "12px" },
  confirmInfo: { fontSize: "14px", color: "#64748b", marginBottom: "12px", lineHeight: "1.5" },
  reasonInput: { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", minHeight: "60px", marginBottom: "12px", boxSizing: "border-box" },
  confirmActions: { display: "flex", gap: "8px" },
  confirmBtn: { flex: 1, padding: "12px", borderRadius: "8px", border: "none", background: "#10b981", color: "#fff", fontSize: "14px", fontWeight: "bold", cursor: "pointer" },
  cancelBtn: { flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", color: "#0f172a", fontSize: "14px", cursor: "pointer" },
};
