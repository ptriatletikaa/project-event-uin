import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bg from "../assets/Gedung.jpg";

export default function LoginAdmin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (username === "admin" && password === "admin123") {
      navigate("/admin/dashboard");
    } else {
      alert("Username atau Password salah");
    }
  };

  return (
    <div
      style={{
        ...styles.page,
        backgroundImage: `
          linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.5)),
          url(${bg})
        `,
      }}
    >
      <form style={styles.card} onSubmit={handleLogin}>
        <h2>Login Admin</h2>
        <p style={{ fontSize: "13px", marginBottom: "16px" }}>
          Sistem Absensi Wisuda
        </p>

        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <button style={styles.button}>Login</button>
      </form>
    </div>
  );
}

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
    background: "rgba(255,255,255,.25)",
    backdropFilter: "blur(14px)",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    borderRadius: "8px",
    border: "none",
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};
