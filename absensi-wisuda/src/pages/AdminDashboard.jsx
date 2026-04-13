import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import bg from "../assets/Gedung.jpg";

export default function AdminDashboard() {
  const [active, setActive] = useState("Dashboard");
  const [dataMahasiswa, setDataMahasiswa] = useState([]);
  const [dataUndangan, setDataUndangan] = useState([]);

  const menu = [
    "Dashboard",
    "Data Undangan",
    "Data Mahasiswa",
    "Data Event",
  ];

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
        jurusan: item.Jurusan || item.jurusan || "",
        ortu: item.Ortu || item["Nama Orang Tua"] || "",
      }));

      setDataUndangan(formatted);
      localStorage.setItem("dataUndangan", JSON.stringify(formatted));
    };

    reader.readAsArrayBuffer(file);
  };

  // BUAT UNDANGAN OTOMATIS
  const buatUndangan = () => {
    if (dataUndangan.length === 0) {
      alert("Data undangan masih kosong!");
      return;
    }

    const template = dataUndangan.map((u) => `
UNDANGAN WISUDA 🎓

Kepada Yth:
${u.nama}
Orang Tua: ${u.ortu || "-"}

Kami mengundang Anda untuk menghadiri acara Wisuda.

Detail:
NIM: ${u.nim}
Jurusan: ${u.jurusan || "-"}

Terima kasih 🙏
-----------------------------------
`).join("\n");

    if (navigator.share) {
      navigator.share({
        title: "Undangan Wisuda",
        text: template,
      });
    } else {
      navigator.clipboard.writeText(template);
      alert("Undangan berhasil dibuat & disalin!");
    }
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

            <div style={styles.tableModern}>
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
                        <td style={styles.tdNama}>{m.nama}</td>
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
            <h1 style={styles.title}>DATA UNDANGAN</h1>

            <div style={styles.actionBar}>
              
              <div style={styles.rightAction}>
                <label style={styles.glassBtn}>
                  📂 Import Excel
                  <input
                    type="file"
                    accept=".xlsx, .csv"
                    onChange={handleImportExcel}
                    hidden
                  />
                </label>

                <button
                  style={styles.glassBtnGreen}
                  onClick={buatUndangan}
                >
                  ✉️ Buat Undangan
                </button>
              </div>
            </div>

            <div style={styles.tableModern}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>No</th>
                    <th style={styles.th}>Nama</th>
                    <th style={styles.th}>NIM</th>
                    <th style={styles.th}>Jurusan</th>
                  </tr>
                </thead>
                <tbody>
                  {dataUndangan.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={styles.empty}>
                        Belum ada data undangan
                      </td>
                    </tr>
                  ) : (
                    dataUndangan.map((u, i) => (
                      <tr key={i}>
                        <td style={styles.td}>{i + 1}</td>

                        <td style={styles.tdNamaBox}>
                          <div style={styles.namaUtama}>{u.nama}</div>
                          <div style={styles.namaOrtu}>
                            Orang Tua: {u.ortu || "-"}
                          </div>
                        </td>

                        <td style={styles.td}>{u.nim}</td>
                        <td style={styles.td}>{u.jurusan || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

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
    textAlign: "center",
    marginBottom: "30px",
    fontWeight: "bold",
  },

  menu: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  menuItem: {
    color: "#cbd5f5",
    padding: "12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },

  menuActive: {
    background: "rgba(255,255,255,.05)",
    color: "#fff",
  },

  indicator: {
    width: "4px",
    height: "18px",
    background: "#3b82f6",
    marginRight: "10px",
  },

  main: {
    flex: 1,
    padding: "30px",
  },

  title: {
    fontSize: "24px",
    marginBottom: "10px",
  },

  subtitle: {
    marginBottom: "20px",
  },

  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
    gap: "20px",
  },

  card: {
    padding: "20px",
    borderRadius: "12px",
    color: "#fff",
  },

  actionBar: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
  },

  rightAction: {
    display: "flex",
    gap: "10px",
  },

  tag: {
    background: "#2563eb",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: "999px",
  },

  glassBtn: {
    padding: "10px",
    borderRadius: "10px",
    backdropFilter: "blur(10px)",
    background: "rgba(255,255,255,0.3)",
    cursor: "pointer",
  },

  glassBtnGreen: {
    padding: "10px",
    borderRadius: "10px",
    backdropFilter: "blur(10px)",
    background: "rgba(22,163,74,0.3)",
    cursor: "pointer",
  },

  tableModern: {
    background: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    padding: "12px",
    background: "#f1f5f9",
  },

  td: {
    padding: "12px",
    borderTop: "1px solid #eee",
    textAlign: "center",
  },

  tdNamaBox: {
    textAlign: "left",
  },

  namaUtama: {
    fontWeight: "bold",
  },

  namaOrtu: {
    fontSize: "13px",
    color: "#64748b",
  },

  empty: {
    textAlign: "center",
    padding: "20px",
  },
};