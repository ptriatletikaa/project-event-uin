import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import bg from "../assets/Gedung.jpg";

export default function AdminDashboard() {
  const [active, setActive] = useState("Dashboard");

  const [dataMahasiswa, setDataMahasiswa] = useState([]);
  const [dataUndangan, setDataUndangan] = useState([]);

  const [tabUndangan, setTabUndangan] = useState("Data Undangan");

  const menu = [
    "Dashboard",
    "Data Undangan",
    "Data Mahasiswa",
    "Data Event",
  ];

  // LOAD DATA
  useEffect(() => {
    const mhs = localStorage.getItem("riwayatAbsensi");
    if (mhs) setDataMahasiswa(JSON.parse(mhs));

    const undangan = localStorage.getItem("dataUndangan");
    if (undangan) setDataUndangan(JSON.parse(undangan));
  }, []);

  // IMPORT EXCEL
  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);

      const formatted = json.map((item) => ({
        nama: item.Nama || item.nama || "",
        nim: item.NIM || item.nim || "",
      }));

      setDataUndangan(formatted);
      localStorage.setItem("dataUndangan", JSON.stringify(formatted));
    };

    reader.readAsArrayBuffer(file);
  };

  // BUAT UNDANGAN
  const buatUndangan = () => {
    if (dataUndangan.length === 0) {
      alert("Data undangan masih kosong!");
      return;
    }

    alert("Undangan berhasil dibuat!");
  };

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
        {/* DASHBOARD */}
        {active === "Dashboard" && (
          <>
            <h1 style={styles.title}>Selamat Datang</h1>
            <p style={styles.subtitle}>
              Sistem Absensi Wisuda QR Code
            </p>

            <div style={styles.cards}>
              <Stat
                title="Total Undangan"
                value={dataUndangan.length}
                color="#2563eb"
              />
              <Stat
                title="Mahasiswa Hadir"
                value={dataMahasiswa.length}
                color="#7c3aed"
              />
              <Stat title="Event Aktif" value="1" color="#16a34a" />
            </div>
          </>
        )}

        {/* DATA MAHASISWA */}
        {active === "Data Mahasiswa" && (
          <>
            <h1 style={styles.title}>Data Mahasiswa Hadir</h1>

            <div style={styles.tableBox}>
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
                  {dataMahasiswa.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={styles.empty}>
                        Belum ada data
                      </td>
                    </tr>
                  ) : (
                    dataMahasiswa.map((m, i) => (
                      <tr key={i}>
                        <td style={styles.td}>{i + 1}</td>
                        <td style={styles.td}>{m.nama}</td>
                        <td style={styles.td}>{m.nim}</td>
                        <td style={styles.td}>{m.hari}</td>
                        <td style={styles.td}>{m.jam}</td>
                        <td style={styles.td}>{m.ket}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* DATA UNDANGAN */}
        {active === "Data Undangan" && (
          <>
            <h1 style={styles.title}>Data Undangan</h1>

            {/* TAB */}
            <div style={styles.tabWrap}>
              {["Data Undangan"].map((item) => (
                <button
                  key={item}
                  onClick={() => setTabUndangan(item)}
                  style={{
                    ...styles.tabBtn,
                    ...(tabUndangan === item ? styles.tabActive : {}),
                  }}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* IMPORT + BUAT */}
            <div style={styles.topAction}>
              <label style={styles.uploadBtn}>
                Import Excel
                <input
                  type="file"
                  accept=".xlsx, .csv"
                  onChange={handleImportExcel}
                  hidden
                />
              </label>

              <button
                style={styles.generateBtn}
                onClick={buatUndangan}
              >
                Buat Undangan
              </button>
            </div>

            {/* DATA UNDANGAN */}
            {tabUndangan === "Data Undangan" && (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>No</th>
                    <th style={styles.th}>Nama</th>
                    <th style={styles.th}>NIM</th>
                  </tr>
                </thead>
                <tbody>
                  {dataUndangan.map((u, i) => (
                    <tr key={i}>
                      <td style={styles.td}>{i + 1}</td>
                      <td style={styles.td}>{u.nama}</td>
                      <td style={styles.td}>{u.nim}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* HADIR */}
            {tabUndangan === "Hadir" && (
              <table style={styles.table}>
                <tbody>
                  {dataMahasiswa.map((m, i) => (
                    <tr key={i}>
                      <td style={styles.td}>{m.nama}</td>
                      <td style={styles.td}>{m.nim}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* TIDAK HADIR */}
            {tabUndangan === "Tidak Hadir" && (
              <table style={styles.table}>
                <tbody>
                  {dataUndangan
                    .filter(
                      (u) =>
                        !dataMahasiswa.some(
                          (m) => m.nim === u.nim
                        )
                    )
                    .map((u, i) => (
                      <tr key={i}>
                        <td style={styles.td}>{u.nama}</td>
                        <td style={styles.td}>{u.nim}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </>
        )}

        {/* DATA EVENT */}
        {active === "Data Event" && (
          <h1 style={styles.title}>Halaman Data Event</h1>
        )}
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
    display: "flex",
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
  },

  main: {
    flex: 1,
    padding: "35px",
  },

  title: {
    fontSize: "24px",
    marginBottom: "10px",
  },

  subtitle: {
    color: "#475569",
    marginBottom: "30px",
  },

  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))",
    gap: "20px",
  },

  card: {
    color: "#fff",
    padding: "20px",
    borderRadius: "12px",
  },

  cardTitle: {
    fontSize: "14px",
  },

  cardValue: {
    fontSize: "30px",
    fontWeight: "bold",
  },

  tableBox: {
    background: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    marginTop: "20px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
  },

  th: {
    background: "#f1f5f9",
    padding: "12px",
    textAlign: "center",
  },

  td: {
    padding: "10px",
    textAlign: "center",
    borderTop: "1px solid #e2e8f0",
  },

  empty: {
    padding: "20px",
    textAlign: "center",
  },

  tabWrap: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  },

  tabBtn: {
    padding: "8px 14px",
    border: "none",
    borderRadius: "8px",
    background: "#e2e8f0",
    cursor: "pointer",
  },

  tabActive: {
    background: "#2563eb",
    color: "#fff",
  },

  topAction: {
    display: "flex",
    gap: "10px",
    marginBottom: "15px",
  },

  uploadBtn: {
    padding: "8px 14px",
    background: "#2563eb",
    color: "#fff",
    borderRadius: "6px",
    cursor: "pointer",
  },

  generateBtn: {
    padding: "8px 14px",
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};