import { useState } from "react";
import bg from "../assets/Gedung.jpg";

export default function AdminDashboard() {
  const [active, setActive] = useState("Dashboard");

  const menu = [
    "Dashboard",
    "Data Undangan",
    "Data Mahasiswa",
    "Data Event",

  ];

  return (
    <div style={styles.page}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.brand}>DASHBOARD ADMIN</div>

        <div style={styles.menu}>
          {menu.map((item) => (
            <div
              key={item}
              onClick={() => setActive(item)}
              style={{
                ...styles.menuItem,
                ...(active === item ? styles.menuActive : {}),
              }}
            >
              <span
                style={{
                  ...styles.indicator,
                  opacity: active === item ? 1 : 0,
                }}
              />
              {item}
            </div>
          ))}
        </div>
      </aside>

      {/* MAIN */}
      <main style={styles.main}>
        <h1 style={styles.title}>Selamat Datang</h1>
        <p style={styles.subtitle}>Sistem Absensi Wisuda QR Code</p>

        {/* STATISTIK */}
        <div style={styles.cards}>
          <Stat title="Total Undangan" value="120" color="#2563eb" />
          <Stat title="Mahasiswa Hadir" value="85" color="#7c3aed" />
          <Stat title="Event Aktif" value="1" color="#16a34a" />
        </div>
      </main>
    </div>
  );
}

function Stat({ title, value, color }) {
  return (
    <div style={{ ...styles.card, background: color }}>
      <div style={styles.cardTitle}>{title}</div>
      <div style={styles.cardValue}>{value}</div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    minHeight: "100vh",
    backgroundImage: `
      linear-gradient(rgba(255,255,255,.93), rgba(255,255,255,.93)),
      url(${bg})
    `,
    backgroundSize: "cover",
  },

  sidebar: {
    width: "260px",
    background: "#020617",
    padding: "25px 15px",
  },

  brand: {
    color: "#fff",
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "30px",
    textAlign: "center",
    letterSpacing: "1px",
  },

  menu: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  menuItem: {
    color: "#cbd5f5",
    padding: "12px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    position: "relative",
    display: "flex",
    alignItems: "center",
    transition: "all .2s",
  },

  menuActive: {
    color: "#fff",
    background: "rgba(255,255,255,.05)",
  },

  indicator: {
    width: "4px",
    height: "18px",
    background: "#3b82f6",
    borderRadius: "4px",
    marginRight: "10px",
    transition: "opacity .2s",
  },

  main: {
    flex: 1,
    padding: "35px",
  },

  title: {
    fontSize: "26px",
    marginBottom: "4px",
  },

  subtitle: {
    color: "#475569",
    marginBottom: "30px",
  },

  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
    gap: "20px",
  },

  card: {
    color: "#fff",
    padding: "22px",
    borderRadius: "14px",
    boxShadow: "0 12px 30px rgba(0,0,0,.18)",
  },

  cardTitle: {
    fontSize: "14px",
    opacity: 0.9,
  },

  cardValue: {
    fontSize: "34px",
    fontWeight: "bold",
    marginTop: "8px",
  },
};