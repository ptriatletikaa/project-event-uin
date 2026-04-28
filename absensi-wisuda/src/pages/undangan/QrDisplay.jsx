import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

export default function QrDisplay() {
  const [undangan, setUndangan] = useState(null);
  const [qrData, setQrData] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("undangan_user");
    if (!stored) {
      navigate("/undangan/login");
      return;
    }
    const data = JSON.parse(stored);
    setUndangan(data);
    setQrData(data.qr_code || String(data.id));
  }, []);

  const handleDownload = () => {
    const canvas = document.getElementById("qr-code");
    if (!canvas) {
      console.log("Canvas not found");
      return;
    }

    try {
      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = `QR_${undangan?.nim_nik || "undangan"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("undangan_user");
    navigate("/undangan/login");
  };

  if (!undangan) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>🎓</div>
          <h2 style={styles.eventName}>{undangan.event_nama || "Event"}</h2>
          <p style={styles.eventDate}>
            {undangan.tanggal} | {undangan.waktu_mulai} - {undangan.waktu_selesai}
          </p>
        </div>

        <div style={styles.statusBox}>
          {undangan.status_checkin === "sudah" ? (
            <div style={styles.statusHadir}>✓ Sudah Check-in</div>
          ) : undangan.event_status === "selesai" ? (
            <div style={styles.statusSelesai}>Event Sudah Selesai</div>
          ) : (
            <div style={styles.statusAktif}>✓ Siap Check-in</div>
          )}
        </div>

        <div style={styles.qrBox}>
          <QRCodeCanvas 
            id="qr-code" 
            value={qrData || String(undangan.id)} 
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>

        <div style={styles.infoBox}>
          <div style={styles.infoNama}>{undangan.nama}</div>
          <div style={styles.infoMeta}>NIM: {undangan.nim_nik}</div>
          <div style={undangan.kategori === "VIP" ? styles.vipBadge : styles.normalBadge}>
            {undangan.kategori}
          </div>
        </div>

        <button 
          style={styles.downloadBtn} 
          onClick={handleDownload}
        >
          Download QR Code
        </button>

        <button style={styles.logoutBtn} onClick={handleLogout}>
          Login dengan NIM lain
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg, #1e3a5f 0%, #0c1929 100%)", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" },
  loading: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#fff" },
  card: { width: "100%", maxWidth: "360px", padding: "28px", borderRadius: "20px", background: "rgba(255,255,255,0.08)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.12)", textAlign: "center" },
  header: { marginBottom: "20px" },
  logo: { fontSize: "48px", marginBottom: "10px" },
  eventName: { color: "#fff", fontSize: "20px", fontWeight: "bold", marginBottom: "4px" },
  eventDate: { color: "#93c5fd", fontSize: "13px" },
  statusBox: { marginBottom: "20px" },
  statusHadir: { padding: "8px 16px", borderRadius: "20px", background: "#10b981", color: "#fff", fontSize: "14px", fontWeight: "bold", display: "inline-block" },
  statusSelesai: { padding: "8px 16px", borderRadius: "20px", background: "#64748b", color: "#fff", fontSize: "14px", fontWeight: "bold", display: "inline-block" },
  statusAktif: { padding: "8px 16px", borderRadius: "20px", background: "#3b82f6", color: "#fff", fontSize: "14px", fontWeight: "bold", display: "inline-block" },
  qrBox: { background: "#fff", padding: "20px", borderRadius: "16px", display: "inline-block", marginBottom: "20px", boxShadow: "0 8px 32px rgba(59,130,246,0.3)" },
  infoBox: { marginBottom: "20px" },
  infoNama: { color: "#fff", fontSize: "18px", fontWeight: "bold", marginBottom: "4px" },
  infoMeta: { color: "#93c5fd", fontSize: "14px", marginBottom: "8px" },
  vipBadge: { display: "inline-block", padding: "4px 14px", borderRadius: "20px", background: "#fbbf24", color: "#78350f", fontSize: "13px", fontWeight: "bold" },
  normalBadge: { display: "inline-block", padding: "4px 14px", borderRadius: "20px", background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: "13px", fontWeight: "bold" },
  downloadBtn: { width: "100%", padding: "14px", borderRadius: "12px", border: "none", background: "#3b82f6", color: "#fff", fontSize: "15px", fontWeight: "bold", cursor: "pointer", marginBottom: "10px" },
  logoutBtn: { width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "#93c5fd", fontSize: "14px", cursor: "pointer" },
};
