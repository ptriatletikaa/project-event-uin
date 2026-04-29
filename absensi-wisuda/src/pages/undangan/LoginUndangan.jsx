import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function LoginUndangan() {
  const [nim_nik, setNim_nik] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/undangan/login", { nim_nik });
      const invitedUser = res.data.invited_user;
      localStorage.setItem("undangan_user", JSON.stringify(invitedUser));
      navigate("/undangan/qr");
    } catch (err) {
      setError(err.response?.data?.message || "Login gagal. NIM/NIK tidak ditemukan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <div style={styles.logoArea}>
          <div style={styles.logo}>🔐</div>
          <h2 style={styles.title}>Absensi Event</h2>
          <p style={styles.subtitle}>Masukkan NIM/NIK Anda untuk login</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.field}>
          <label style={styles.label}>NIM / NIK</label>
          <input
            type="text"
            placeholder="masukkan NIM atau NIK"
            value={nim_nik}
            onChange={(e) => setNim_nik(e.target.value)}
            style={styles.input}
            required
          />
        </div>

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Memproses..." : "Login & Lihat QR"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg, #1e3a5f 0%, #0c1929 100%)", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" },
  card: { width: "100%", maxWidth: "360px", padding: "32px", borderRadius: "20px", background: "rgba(255,255,255,0.08)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.12)", textAlign: "center" },
  logoArea: { marginBottom: "24px" },
  logo: { fontSize: "56px", marginBottom: "12px" },
  title: { color: "#fff", fontSize: "26px", fontWeight: "bold", marginBottom: "6px" },
  subtitle: { color: "#93c5fd", fontSize: "14px" },
  error: { background: "#ef4444", color: "#fff", padding: "10px 14px", borderRadius: "10px", marginBottom: "16px", fontSize: "14px" },
  input: { width: "100%", padding: "14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: "16px", boxSizing: "border-box" },
  field: { marginBottom: "20px" },
  label: { display: "block", color: "#93c5fd", fontSize: "14px", fontWeight: "600", marginBottom: "8px", textAlign: "left" },
  button: { width: "100%", padding: "14px", borderRadius: "10px", border: "none", background: "#3b82f6", color: "#fff", fontSize: "16px", fontWeight: "bold", cursor: "pointer" },
};
