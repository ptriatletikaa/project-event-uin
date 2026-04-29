import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext"; // ✅ FIX
import api from "../../services/api"; // ✅ FIX

export default function LoginAdmin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);

      if (user.role === "admin_sistem") {
        navigate("/admin/dashboard");
      } else if (user.role === "admin_lapangan") {
        navigate("/lapangan/event-select");
      } else {
        setError("Role tidak dikenali");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <h2 style={styles.title}>Login Admin</h2>
        <p style={styles.subtitle}>Sistem Absensi Event</p>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.field}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            placeholder="masukkan email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Password</label>
          <input
            type="password"
            placeholder="masukkan password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
        </div>

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Loading..." : "Login"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "360px",
    padding: "32px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.15)",
  },
  title: { color: "#fff", textAlign: "center", marginBottom: "4px", fontSize: "24px" },
  subtitle: { color: "#94a3b8", textAlign: "center", marginBottom: "24px", fontSize: "14px" },
  error: { background: "#ef4444", color: "#fff", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", textAlign: "center" },
  input: { width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: "14px", boxSizing: "border-box" },
  field: { marginBottom: "16px" },
  label: { display: "block", color: "#94a3b8", fontSize: "13px", fontWeight: "600", marginBottom: "6px" },
  button: { width: "100%", padding: "12px", borderRadius: "8px", border: "none", background: "#2563eb", color: "#fff", fontSize: "15px", fontWeight: "bold", cursor: "pointer", marginTop: "8px" },
};