import { useState, } from "react";

import bg from "../assets/Gedung.jpg";

export default function ScanPanitia() {
  const [tab, setTab] = useState("scan");

  const [riwayat, setRiwayat] = useState([
    {
      nama: "Putri Atletikaa",
      nim: "202210001",
      hari: "Senin",
      jam: "08:15",
      ket: "Hadir",
    },
  ]);

  const tambahSimulasi = () => {
    const now = new Date();
    const hari = now.toLocaleDateString("id-ID", { weekday: "long" });
    const jam = now.toLocaleTimeString("id-ID");

    setRiwayat([
      ...riwayat,
      {
        nama: "Mahasiswa Baru",
        nim: "202210002",
        hari,
        jam,
        ket: "Hadir",
      },
    ]);
  };

  const downloadCSV = () => {
    if (riwayat.length === 0) return;

    const header = ["No", "Nama", "NIM", "Hari", "Jam", "Keterangan"];
    const rows = riwayat.map((r, i) => [
      i + 1,
      r.nama,
      r.nim,
      r.hari,
      r.jam,
      r.ket,
    ]);

    let csv =
      "data:text/csv;charset=utf-8," +
      header.join(",") +
      "\n" +
      rows.map((r) => r.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "riwayat-absensi-wisuda.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      {/* MENU ATAS */}
      <div style={styles.menu}>
        <button
          style={tab === "scan" ? styles.menuActive : styles.menuBtn}
          onClick={() => setTab("scan")}
        >
          Scan QR
        </button>
        <button
          style={tab === "riwayat" ? styles.menuActive : styles.menuBtn}
          onClick={() => setTab("riwayat")}
        >
          Riwayat
        </button>
      </div>

      {/* SCAN */}
      {tab === "scan" && (
        <div style={styles.scanBox}>
          <h2>Scan QR Wisudawan</h2>
          <div style={styles.fakeCamera}>Kamera Scan (Simulasi)</div>
          <button style={styles.scanBtn} onClick={tambahSimulasi}>
            Simulasikan Scan
          </button>
        </div>
      )}

      {/* RIWAYAT */}
      {tab === "riwayat" && (
        <div style={styles.riwayatBox}>
          <div style={styles.headerRiwayat}>
            <h2>Riwayat Absensi Wisuda</h2>
            <button style={styles.downloadBtn} onClick={downloadCSV}>
              Download Data
            </button>
          </div>

          <div style={styles.tableGlass}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>No</th>
                  <th style={styles.th}>Nama</th>
                  <th style={styles.th}>NIM</th>
                  <th style={styles.th}>Hari</th>
                  <th style={styles.th}>Jam</th>
                  <th style={styles.th}>Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {riwayat.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={styles.empty}>
                      Belum ada data
                    </td>
                  </tr>
                ) : (
                  riwayat.map((r, i) => (
                    <tr key={i}>
                      <td style={styles.td}>{i + 1}</td>
                      <td style={styles.td}>{r.nama}</td>
                      <td style={styles.td}>{r.nim}</td>
                      <td style={styles.td}>{r.hari}</td>
                      <td style={styles.td}>{r.jam}</td>
                      <td style={styles.td}>{r.ket}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundSize: "cover",
    backgroundPosition: "center",
    padding: "20px",
    color: "#fff",
  },

  menu: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    marginBottom: "20px",
  },

  menuBtn: {
    padding: "10px 20px",
    borderRadius: "20px",
    border: "none",
    background: "rgba(255,255,255,.3)",
    color: "#fff",
    cursor: "pointer",
  },

  menuActive: {
    padding: "10px 20px",
    borderRadius: "20px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontWeight: "bold",
  },

  scanBox: {
    maxWidth: "420px",
    margin: "0 auto",
    background: "rgba(255,255,255,.15)",
    backdropFilter: "blur(10px)",
    padding: "25px",
    borderRadius: "16px",
    textAlign: "center",
  },

  fakeCamera: {
    height: "220px",
    background: "rgba(0,0,0,.4)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "15px 0",
  },

  scanBtn: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "#22c55e",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },

  riwayatBox: {
    width: "100%",
  },

  headerRiwayat: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },

  downloadBtn: {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
  },

  tableGlass: {
    width: "100%",
    background: "rgba(255,255,255,.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "12px",
    overflowX: "auto",
    boxShadow: "0 15px 40px rgba(0,0,0,.35)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    color: "#111",
    fontSize: "14px",
  },

  th: {
  border: "1px solid #cbd5e1",
  padding: "12px",
  background: "#c0cff0ff",   // WARNA HEADER
  color: "#000000ff",        // WARNA TEKS
  textAlign: "center",
  fontWeight: "bold",
},


  td: {
    border: "1px solid #cbd5e1",
    padding: "10px",
    textAlign: "center",
    
  },

  empty: {
    padding: "20px",
    textAlign: "center",
    color: "#333",
  },
};
