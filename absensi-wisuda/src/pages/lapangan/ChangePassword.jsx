import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

export default function ChangePassword() {
  const { user, changePassword, logout } = useAuth();
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "admin_lapangan") {
      navigate("/login");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Password baru dan konfirmasi password tidak sama");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    try {
      await changePassword(oldPassword, newPassword);
      setSuccess(true);
      setTimeout(() => navigate("/lapangan/event-select"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengubah password");
    }
  };

  return (
    <div style={styles.page}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <h2 style={styles.title}>Ubah Password</h2>
        <p style={styles.subtitle}>Password sementara harus diganti</p>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>Password berhasil diubah! Mengarah ke dashboard...</div>}

        <input
          type="password"
          placeholder="Password Lama"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Password Baru"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Konfirmasi Password Baru"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={styles.input}
          required
        />

        <button type="submit" style={styles.button} disabled={success}>
          Ubah Password
        </button>
      </form>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg, #065f46 0%, #0f172a 100%)", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" },
  card: { width: "100%", maxWidth: "360px", padding: "32px", borderRadius: "16px", background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.15)" },
  title: { color: "#fff", textAlign: "center", marginBottom: "4px", fontSize: "24px" },
  subtitle: { color: "#6ee7b7", textAlign: "center", marginBottom: "24px", fontSize: "14px" },
  error: { background: "#ef4444", color: "#fff", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", textAlign: "center" },
  success: { background: "#10b981", color: "#fff", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", textAlign: "center" },
  input: { width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)", color: "#fff", marginBottom: "12px", fontSize: "14px", boxSizing: "border-box" },
  button: { width: "100%", padding: "12px", borderRadius: "8px", border: "none", background: "#10b981", color: "#fff", fontSize: "15px", fontWeight: "bold", cursor: "pointer", marginTop: "8px" },
};
