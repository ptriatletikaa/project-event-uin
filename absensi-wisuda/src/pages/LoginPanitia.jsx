import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bg from "../assets/Gedung.jpg"; // PASTIKAN FILE ADA DI FOLDER INI

function LoginPanitia() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // LOGIN SEDERHANA (BISA DIGANTI DATABASE)
    if (username === "panitia" && password === "12345") {
      navigate("/panitia/scan");
    } else {
      alert("Username atau password salah");
    }
  };

  return (
    <div
      style={{
        ...styles.page,
        backgroundImage: `
          linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)),
          url(${bg})
        `,
      }}
    >
      <form style={styles.card} onSubmit={handleLogin}>
        <h2 style={styles.title}>Login Panitia</h2>

        <input
          type="text"
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

export default LoginPanitia;

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
    background: "rgba(255,255,255,0.25)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    padding: "30px",
    width: "320px",
    borderRadius: "16px",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  },

  title: {
    marginBottom: "18px",
    color: "#111",
  },

  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    borderRadius: "8px",
    border: "none",
    outline: "none",
  },

  button: {
    width: "100%",
    padding: "10px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};
