import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import logo from "../assets/logo.png";

export default function AdminDashboard() {
  const [active, setActive] = useState("Undangan");
  const [dataUser, setDataUser] = useState([]);
  const [dataUndangan, setDataUndangan] = useState([]);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [formEvent, setFormEvent] = useState({
    nama: "",
    tempat: "",
    tanggal: "",
  });

  const [dataEvent, setDataEvent] = useState([
    { id: 1, nama: "Wisuda 2025", tempat: "Gedung A", tanggal: "2025-09-10" },
    { id: 2, nama: "Seminar IT", tempat: "Aula Kampus", tanggal: "2025-10-05" },
  ]);

  useEffect(() => {
    fetch("http://localhost:5000/users")
      .then((res) => res.json())
      .then((data) => setDataUser(data))
      .catch((err) => console.error(err));
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
        nama: item.Nama || "",
        nim: item.NIM || "",
        jurusan: item.Jurusan || "",
        ortu: item.Ortu || "",
        event: item.Event || "Wisuda 2025",
      }));

      setDataUndangan(formatted);
      localStorage.setItem("dataUndangan", JSON.stringify(formatted));
    };

    reader.readAsArrayBuffer(file);
  };

  // TAMBAH EVENT
  const handleAddEvent = () => {
    if (!formEvent.nama || !formEvent.tempat || !formEvent.tanggal) {
      alert("Semua field harus diisi!");
      return;
    }

    const newEvent = {
      id: dataEvent.length + 1,
      ...formEvent,
    };

    setDataEvent([...dataEvent, newEvent]);
    setFormEvent({ nama: "", tempat: "", tanggal: "" });
    setShowModal(false);
  };

  // COPY UNDANGAN
  const buatUndangan = () => {
    const text = dataUndangan
      .map(
        (u) => `
UNDANGAN WISUDA 🎓

${u.nama}
Event: ${u.event}
Ortu: ${u.ortu}
NIM: ${u.nim}
Jurusan: ${u.jurusan}
`
      )
      .join("\n");

    navigator.clipboard.writeText(text);
    alert("Undangan disalin!");
  };

  const filtered = dataUndangan.filter((d) =>
    d.nama.toLowerCase().includes(search.toLowerCase())
  );

  const filteredEvent = dataEvent.filter((e) =>
    e.nama.toLowerCase().includes(search.toLowerCase())
  );

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
      <div style={styles.main}>
        <div style={styles.topbar}>
          <input
            type="text"
            placeholder="Search..."
            style={styles.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div style={styles.actions}>
            {active === "Undangan" && (
              <>
                <label style={styles.btn}>
                  Import Excel
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleImportExcel}
                    style={{ display: "none" }}
                  /> 
                </label>

                <button style={styles.btn} onClick={buatUndangan}>
                  Copy Undangan
                </button>
              </>
            )}

            <button
              style={styles.btnPrimary}
              onClick={() => active === "Event" && setShowModal(true)}
            >
              + Tambah
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div style={styles.tableBox}>
          <table style={styles.table}>
            {/* USER */}
           {active === "User" && (
  <>
    <thead>
      <tr>
        <th style={styles.th}>ID</th>
        <th style={styles.th}>Nama</th>
        <th style={styles.th}>NIM</th>
        <th style={styles.th}>Email</th>
      </tr>
    </thead>

    <tbody>
      {dataUser.map((user, index) => (
        <tr key={index}>
          <td style={styles.td}>{user.id}</td>
          <td style={styles.td}>{user.nama}</td>
          <td style={styles.td}>{user.nim}</td>
          <td style={styles.td}>{user.email}</td>
        </tr>
      ))}
    </tbody>
  </>
)}
            {/* EVENT */}
            {active === "Event" && (
              <>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Nama Event</th>
                    <th style={styles.th}>Tempat</th>
                    <th style={styles.th}>Tanggal</th>
                    <th style={styles.th}>Riwayat</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEvent.map((event, index) => (
                    <tr key={index}>
                      <td style={styles.td}>{event.id}</td>
                      <td style={styles.td}>{event.nama}</td>
                      <td style={styles.td}>{event.tempat}</td>
                      <td style={styles.td}>{event.tanggal}</td>
                      <td style={styles.td}>
                        <button
                          style={styles.btn}
                          onClick={() =>
                            alert(`Riwayat event: ${event.nama}`)
                          }
                        >
                          Lihat Riwayat
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}

            {/* UNDANGAN */}
            {active === "Undangan" && (
              <>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Nama</th>
                    <th style={styles.th}>Event</th>
                    <th style={styles.th}>NIM</th>
                    <th style={styles.th}>Jurusan</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((u, index) => (
                    <tr key={index}>
                      <td style={styles.td}>{index + 1}</td>
                      <td style={styles.td}>{u.nama}</td>
                      <td style={styles.td}>{u.event}</td>
                      <td style={styles.td}>{u.nim}</td>
                      <td style={styles.td}>{u.jurusan}</td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}
          </table>
        </div>
      </div>

      {/* ✅ MODAL TAMBAH EVENT */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Tambah Event</h3>

            <input
              type="text"
              placeholder="Nama Event"
              style={styles.input}
              value={formEvent.nama}
              onChange={(e) =>
                setFormEvent({ ...formEvent, nama: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Tempat"
              style={styles.input}
              value={formEvent.tempat}
              onChange={(e) =>
                setFormEvent({ ...formEvent, tempat: e.target.value })
              }
            />

            <input
              type="date"
              style={styles.input}
              value={formEvent.tanggal}
              onChange={(e) =>
                setFormEvent({ ...formEvent, tanggal: e.target.value })
              }
            />

            <div style={{ display: "flex", gap: "10px" }}>
              <button style={styles.btnPrimary} onClick={handleAddEvent}>
                Simpan
              </button>
              <button style={styles.btn} onClick={() => setShowModal(false)}>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
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
  modal: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    width: "300px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
  },
};