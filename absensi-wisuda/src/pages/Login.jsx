import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bg from "../assets/Gedung.jpg";

function Login() {
  const [nama, setNama] = useState("");
  const [nim, setNim] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nama || !nim) {
      alert("Nama dan NIM wajib diisi");
      return;
    }

    navigate("/barcode", {
      state: { nama, nim },
    });
  };

  return (
    <div
      style={{
        ...styles.page,
        backgroundImage: `
          linear-gradient(
            rgba(0, 0, 0, 0.35),
            rgba(0, 0, 0, 0.35)
          ),
          url(${bg})
        `,
      }}
    >
      <form style={styles.card} onSubmit={handleSubmit}>
        <h2 style={styles.title}>Login Absensi Wisuda</h2>

        {/* TABEL INPUT (POTRAIT & CENTER) */}
        <div style={styles.inputGroup}>
          <div style={styles.field}>
            <label style={styles.label}>Nama</label>
            <input
              type="text"
              placeholder="Masukkan Nama Lengkap"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>NIM</label>
            <input
              type="text"
              placeholder="Masukkan NIM"
              value={nim}
              onChange={(e) => setNim(e.target.value)}
              style={styles.input}
            />
          </div>
        </div>

        <button type="submit" style={styles.button}>
          Masuk
        </button>
      </form>
    </div>
  );
}

export default Login;

const styles = {
  page: {
    minHeight: "100vh",
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "320px",
    padding: "30px",
    borderRadius: "16px",
    background: "rgba(255, 255, 255, 0.25)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
    textAlign: "center",
  },
  title: {
    marginBottom: "20px",
    color: "#111",
  },

  /* === BAGIAN YANG DIRAPIKAN === */
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    marginBottom: "20px",
  },
  field: {
    textAlign: "left",
  },
  label: {
    fontSize: "13px",
    marginBottom: "4px",
    display: "block",
    color: "#111",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    outline: "none",
  },

  button: {
    width: "100%",
    padding: "11px",
    borderRadius: "8px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontSize: "15px",
    cursor: "pointer",
  },
};
