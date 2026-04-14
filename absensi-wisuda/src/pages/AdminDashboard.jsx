import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import logo from "../assets/logo.png";

export default function AdminDashboard() {
  const [active, setActive] = useState("Undangan");
  const [dataUser, setDataUser] = useState([]);
  const [dataUndangan, setDataUndangan] = useState([]);
  const [search, setSearch] = useState("");

  const menu = [
    "Dashboard",
    "Data Undangan",
    "Data Mahasiswa",
    "Data Event",

  ];

  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.logoBox}>
          <img src={logo} alt="logo" style={styles.logoImg} />
          <div>
            <div style={styles.logoTitle}>AdminSistemAbsensi</div>
            <div style={styles.logoSub}>UIN Ponorogo</div>
          </div>
        </div>

        <div style={styles.menu}>
          <div
            style={active === "User" ? styles.menuItemActive : styles.menuItem}
            onClick={() => setActive("User")}
          >
            User
          </div>

          <div
            style={active === "Event" ? styles.menuItemActive : styles.menuItem}
            onClick={() => setActive("Event")}
          >
            Event
          </div>

          <div
            style={active === "Undangan" ? styles.menuItemActive : styles.menuItem}
            onClick={() => setActive("Undangan")}
          >
            Undangan
          </div>
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
  container: { display: "flex", height: "100vh", background: "#f5f7fb" },
  sidebar: {
    width: "250px",
    background: "#fff",
    padding: "20px",
    borderRight: "1px solid #eee",
  },
  logoBox: { display: "flex", gap: "10px", marginBottom: "30px" },
  logoImg: { width: "35px", height: "35px" },
  logoTitle: { fontWeight: "bold", fontSize: "14px" },
  logoSub: { fontSize: "11px", color: "#888" },
  menu: { display: "flex", flexDirection: "column", gap: "10px" },
  menuItem: { padding: "10px", cursor: "pointer" },
  menuItemActive: {
    padding: "10px",
    background: "#e6f4ff",
    borderRadius: "8px",
    color: "#1890ff",
    fontWeight: "bold",
  },
  main: { flex: 1, padding: "20px" },
  topbar: { display: "flex", justifyContent: "space-between", marginBottom: "20px" },
  search: { padding: "10px", width: "300px", borderRadius: "8px", border: "1px solid #ddd" },
  actions: { display: "flex", gap: "10px" },
  btn: {
    padding: "10px 15px",
    background: "#52c41a",
    color: "#fff",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
  },
  btnPrimary: {
    padding: "10px 15px",
    background: "#1890ff",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  tableBox: { background: "#fff", borderRadius: "12px", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "12px", background: "#fafafa" },
  td: { padding: "12px", borderTop: "1px solid #eee" },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
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
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
  },
};