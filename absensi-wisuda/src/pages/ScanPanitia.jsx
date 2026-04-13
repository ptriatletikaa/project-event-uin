import { useState, useEffect, useRef } from "react";
import jsQR from "jsqr";

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

  const lastScanRef = useRef(null);
  const [notif, setNotif] = useState(null);
  const autoIntervalRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanIntervalRef = useRef(null);

  const showNotification = (message) => {
    setNotif(message);
    setTimeout(() => setNotif(null), 3000);
  };

  useEffect(() => {
    if (tab !== "scan") return;

    // avoid double init
    if (scanIntervalRef.current) return;

    const videoEl = videoRef.current;
    let stream = null;

    const getNearbyNameNim = () => {
      try {
        const el = document.getElementById("qr-code");
        if (!el) return null;
        const parent = el.parentElement;
        if (!parent) return null;
        const ps = parent.querySelectorAll("p");
        let foundNama = null;
        let foundNim = null;
        ps.forEach((p) => {
          const t = p.textContent || "";
          const mNama = t.match(/Nama\s*[:-]?\s*(.+)/i);
          const mNim = t.match(/NIM\s*[:-]?\s*(.+)/i);
          if (mNama) foundNama = mNama[1].trim();
          if (mNim) foundNim = mNim[1].trim();
        });
        if (foundNama || foundNim) return { nama: foundNama, nim: foundNim };
      } catch (e) {
        return null;
      }
      return null;
    };

    const handleDecoded = (decodedText) => {
      if (!decodedText) return;
      if (lastScanRef.current === decodedText) return;
      lastScanRef.current = decodedText;

      let nama = decodedText;
      let nim = decodedText;

      try {
        const data = JSON.parse(decodedText);
        if (data.nama) nama = data.nama;
        if (data.nim) nim = data.nim;
      } catch (e) {
        if (/^\d+$/.test(decodedText)) {
          try {
            const raw = localStorage.getItem("lastGeneratedQr");
            if (raw) {
              const parsed = JSON.parse(raw);
              if (parsed && parsed.nim && parsed.nim.toString() === decodedText.toString()) {
                nama = parsed.nama || decodedText;
                nim = parsed.nim || decodedText;
              }
            }
          } catch (err) { }

          if (!nama || nama === decodedText) {
            const nearby = getNearbyNameNim();
            if (nearby && nearby.nama) {
              nama = nearby.nama;
              nim = nearby.nim || decodedText;
            } else {
              nama = decodedText;
              nim = decodedText;
            }
          }
        } else {
          nama = decodedText;
          nim = "";
          const nearby = getNearbyNameNim();
          if (nearby && nearby.nim) nim = nearby.nim;
        }
      }

      const now = new Date();
      const hari = now.toLocaleDateString("id-ID", { weekday: "long" });
      const jam = now.toLocaleTimeString("id-ID");

      setRiwayat((prev) => [
        ...prev,
        { nama, nim, hari, jam, ket: "Hadir" },
      ]);

      try {
        showNotification(`Scan berhasil: ${nama} ${nim ? `(${nim})` : ""}`);
      } catch (e) { }

      setTimeout(() => {
        lastScanRef.current = null;
      }, 3000);
    };

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoEl) {
          videoEl.srcObject = stream;
          await videoEl.play();

          // create canvas sized to video
          const cw = videoEl.videoWidth || 640;
          const ch = videoEl.videoHeight || 480;
          if (canvasRef.current) {
            canvasRef.current.width = cw;
            canvasRef.current.height = ch;
          }

          scanIntervalRef.current = setInterval(() => {
            try {
              const canvas = canvasRef.current;
              const video = videoEl;
              if (!canvas || !video) return;
              const ctx = canvas.getContext("2d");
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const decoded = jsQR(imgData.data, canvas.width, canvas.height);
              if (decoded && decoded.data) {
                handleDecoded(decoded.data);
              }
            } catch (e) { }
          }, 250);
        }
      } catch (err) {
        console.error("camera error", err);
        const reader = document.getElementById("reader");
        if (reader) reader.innerText = "Tidak dapat mengakses kamera. Periksa izin browser.";
      }
    };

    const tryDecodeFromPage = () => {
      const el = document.getElementById("qr-code");
      if (!el) return null;

      try {
        const parent = el.parentElement;
        if (parent) {
          const ps = parent.querySelectorAll("p");
          let foundNama = null;
          let foundNim = null;
          if (ps && ps.length) {
            ps.forEach((p) => {
              const t = p.textContent || "";
              const mNama = t.match(/Nama\s*[:-]?\s*(.+)/i);
              const mNim = t.match(/NIM\s*[:-]?\s*(.+)/i);
              if (mNama) foundNama = mNama[1].trim();
              if (mNim) foundNim = mNim[1].trim();
            });
          }
          if (foundNama || foundNim) return { nama: foundNama || "Tidak Diketahui", nim: foundNim || "" };
        }
      } catch (e) { }

      if (el.tagName === "CANVAS") {
        const canvas = el;
        try {
          const ctx = canvas.getContext("2d");
          const { width, height } = canvas;
          const imgData = ctx.getImageData(0, 0, width, height);
          const decoded = jsQR(imgData.data, width, height);
          if (decoded && decoded.data) return decoded.data;
        } catch (e) {
          return null;
        }
      }

      if (el.tagName === "IMG") {
        const img = el;
        const off = document.createElement("canvas");
        off.width = img.naturalWidth || img.width;
        off.height = img.naturalHeight || img.height;
        const ctx = off.getContext("2d");
        try {
          ctx.drawImage(img, 0, 0, off.width, off.height);
          const imgData = ctx.getImageData(0, 0, off.width, off.height);
          const decoded = jsQR(imgData.data, off.width, off.height);
          if (decoded && decoded.data) return decoded.data;
        } catch (e) {
          return null;
        }
      }

      return null;
    };

    // start camera and auto-decode attempts
    startCamera();
    const attemptAuto = () => {
      const val = tryDecodeFromPage();
      if (!val) return;
      if (typeof val === "object") {
        const nama = val.nama || "Tidak Diketahui";
        const nim = val.nim || "";
        if (lastScanRef.current === nim && nim) return;
        lastScanRef.current = nim || nama;

        const now = new Date();
        const hari = now.toLocaleDateString("id-ID", { weekday: "long" });
        const jam = now.toLocaleTimeString("id-ID");

        setRiwayat((prev) => {
          const updated = [
            ...prev,
            { nama, nim, hari, jam, ket: "Hadir" },
          ];

          localStorage.setItem("riwayatAbsensi", JSON.stringify(updated));

          return updated;
        });
        try {
          showNotification(`Scan berhasil: ${nama} ${nim ? `(${nim})` : ""}`);
        } catch (e) { }
        return;
      }

      handleDecoded(val);
    };

    attemptAuto();
    autoIntervalRef.current = setInterval(attemptAuto, 800);
    setTimeout(() => {
      try {
        clearInterval(autoIntervalRef.current);
      } catch (e) { }
      autoIntervalRef.current = null;
    }, 5000);

    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
      if (videoEl && videoEl.srcObject) {
        try {
          const tracks = videoEl.srcObject.getTracks();
          tracks.forEach((t) => t.stop());
        } catch (e) { }
        videoEl.srcObject = null;
      }
      if (autoIntervalRef.current) {
        clearInterval(autoIntervalRef.current);
        autoIntervalRef.current = null;
      }
    };
  }, [tab]);

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
          {/* real camera scanner will render video into this div */}
          <div id="reader" style={styles.fakeCamera}>
            <video id="video" ref={videoRef} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          </div>
        </div>
      )}

      {notif && (
        <div style={styles.notif}>
          <div style={styles.notifIcon}>✓</div>
          <div>{notif}</div>
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
    width: "min(860px, 95%)",
    margin: "0 auto",
    background: "rgba(255,255,255,.15)",
    backdropFilter: "blur(10px)",
    padding: "30px",
    borderRadius: "16px",
    textAlign: "center",
  },

  fakeCamera: {
    height: "360px",
    maxHeight: "70vh",
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
  notif: {
    position: "fixed",
    top: 20,
    left: "50%",
    transform: "translateX(-50%)",
    background: "#22c55e",
    color: "#fff",
    padding: "14px 22px",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,.3)",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    zIndex: 9999,
    fontWeight: 600,
  },

  notifIcon: {
    width: "28px",
    height: "28px",
    borderRadius: "6px",
    background: "#fff",
    color: "#22c55e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "18px",
  },
};
