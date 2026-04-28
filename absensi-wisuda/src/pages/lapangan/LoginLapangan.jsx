import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function LoginLapangan() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "admin_lapangan") {
        navigate("/lapangan/event-select");
      } else if (user.role === "admin_sistem") {
        navigate("/admin/dashboard");
      } else {
        setError("Akun ini bukan Admin Lapangan");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <form style={styles.card} onSubmit={handleLogin}>
        <h2 style={styles.title}>Login Admin Lapangan</h2>
        <p style={styles.subtitle}>Scan QR Code Wisudawan</p>

        {error && <div style={styles.error}>{error}</div>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Loading..." : "Login"}
        </button>

        <p style={styles.note}>
          Login dengan akun admin lapangan<br />
          dari Admin Sistem
        </p>
      </form>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #065f46 0%, #0f172a 100%)",
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
  subtitle: { color: "#6ee7b7", textAlign: "center", marginBottom: "24px", fontSize: "14px" },
  error: { background: "#ef4444", color: "#fff", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", textAlign: "center" },
  input: { width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)", color: "#fff", marginBottom: "12px", fontSize: "14px", boxSizing: "border-box" },
  button: { width: "100%", padding: "12px", borderRadius: "8px", border: "none", background: "#10b981", color: "#fff", fontSize: "15px", fontWeight: "bold", cursor: "pointer", marginTop: "8px" },
  note: { color: "#6ee7b7", textAlign: "center", marginTop: "16px", fontSize: "12px" },
};
