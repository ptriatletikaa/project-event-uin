import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import jsQR from "jsqr";

export default function Scan() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [stats, setStats] = useState({ total_checkin: 0, kapasitas: 0, total_invited: 0, remaining_capacity: 0 });
  const [riwayat, setRiwayat] = useState([]);
  const [notif, setNotif] = useState(null);
  const [notifType, setNotifType] = useState("success");
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraMessage, setCameraMessage] = useState("Memuat kamera...");
  const [loading, setLoading] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const [lastQr, setLastQr] = useState(null);
  const [scanCount, setScanCount] = useState(0);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);
  const lastScanTime = useRef(0);

  useEffect(() => {
    if (!user) {
      navigate("/lapangan/login");
      return;
    }

    initPage();

    return () => {
      cleanupCamera();
    };
  }, [id]);

  const initPage = async () => {
    await loadData();
    setLoading(false);
    startCamera();
  };

  const loadData = async () => {
    try {
      const eventRes = await api.get(`/events/${id}`);
      setEvent(eventRes.data);

      const statsRes = await api.get(`/events/${id}/checkin-status`);
      setStats(statsRes.data);
    } catch (err) {
      showNotification("Gagal memuat data", "error");
    }
  };

  const showNotification = (msg, type = "success", duration = 4000) => {
    setNotif(msg);
    setNotifType(type);
    setTimeout(() => setNotif(null), duration);
  };

  const cleanupCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraOn(false);
  };

  const startCamera = async () => {
    setCameraMessage("Memuat kamera...");

    try {
      cleanupCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        videoRef.current.autoplay = true;

        await videoRef.current.play();

        setCameraOn(true);
        showNotification("📷 Kamera aktif! Siap scan QR.", "success", 2000);

        if (canvasRef.current) {
          canvasRef.current.width = videoRef.current.videoWidth || 640;
          canvasRef.current.height = videoRef.current.videoHeight || 480;
        }

        startScanning();
      }
    } catch (err) {
      console.error("Camera error:", err);
      setCameraOn(false);

      if (err.name === "NotAllowedError") {
        setCameraMessage("Izin ditolak. Klik 🔒 di URL, allow Camera.");
      } else if (err.name === "NotFoundError") {
        setCameraMessage("Kamera tidak ditemukan.");
      } else if (err.name === "NotReadableError") {
        setCameraMessage("Kamera dipakai aplikasi lain.");
      } else {
        setCameraMessage("Kamera gagal aktif.");
      }
    }
  };

  const startScanning = () => {
    const scan = () => {
      if (!cameraOn || !videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.readyState >= 2) {
        try {
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, canvas.width, canvas.height);

          if (code?.data) {
            const now = Date.now();
            if (code.data !== lastQr || now - lastScanTime.current > 3000) {
              setLastQr(code.data);
              lastScanTime.current = now;
              setScanCount(prev => prev + 1);
              console.log("🎯 QR DETECTED:", code.data);
              handleCheckin(code.data);
            }
          }
        } catch (err) {
          console.error("Scan error:", err);
        }
      }

      animFrameRef.current = requestAnimationFrame(scan);
    };

    scan();
  };

  const handleCheckin = async (qrCode) => {
    showNotification(`🔍 scanning: ${qrCode.substring(0, 20)}...`, "success", 1500);

    try {
      console.log("Sending checkin with qr_code:", qrCode);

      const res = await api.post("/checkin", { qr_code: qrCode });

      console.log("Checkin response:", res.data);

      if (res.data.success) {
        showNotification("✅ BERHASIL! " + res.data.message, "success");
        if (res.data.data) {
          setRiwayat(prev => [res.data.data, ...prev].slice(0, 10));
        }
        loadData();
      } else {
        showNotification("❌ Gagal: " + (res.data.message || "Unknown error"), "error");
      }
    } catch (err) {
      console.error("Checkin error:", err.response?.data);
      const msg = err.response?.data?.message || "QR tidak dikenali di sistem";
      showNotification("❌ " + msg, "error");
    }

    setTimeout(() => { setLastQr(null); }, 3000);
  };

  const handleRetry = () => {
    cleanupCamera();
    startCamera();
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Memuat...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate("/lapangan/event-select")}>
          ← Kembali
        </button>
        <div style={styles.eventInfo}>
          <h1 style={styles.title}>{event?.nama || "Event"}</h1>
          <p style={styles.subtitle}>{event?.lokasi} | {event?.tanggal}</p>
        </div>
        <button style={styles.manualBtn} onClick={() => navigate(`/lapangan/manual/${id}`)}>
          Manual
        </button>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.stat}>
          <span style={styles.statNum}>{stats.total_checkin || 0}</span>
          <span style={styles.statLabel}>Check-in</span>
        </div>
        <span style={styles.statSep}>/</span>
        <div style={styles.stat}>
          <span style={styles.statNum}>{stats.kapasitas || 0}</span>
          <span style={styles.statLabel}>Kapasitas</span>
        </div>
        <span style={styles.statSep}>=</span>
        <div style={styles.stat}>
          <span style={{ ...styles.statNum, color: (stats.remaining_capacity || 0) <= 0 ? "#ef4444" : "#10b981" }}>
            {stats.remaining_capacity || 0}
          </span>
          <span style={styles.statLabel}>Sisa</span>
        </div>
      </div>

      <div style={styles.cameraSection}>
        <div style={styles.cameraBox}>
          <video
            ref={videoRef}
            style={cameraOn ? styles.videoOn : styles.videoOff}
            playsInline
            muted
            autoPlay
          />
          <canvas ref={canvasRef} style={styles.canvas} />

          {cameraOn && (
            <div style={styles.scanFrame}>
              <div style={styles.scanLine}></div>
            </div>
          )}

          {!cameraOn && (
            <div style={styles.cameraOff}>
              <div style={styles.icon}>📷</div>
              <p style={styles.msg}>{cameraMessage}</p>
              <button style={styles.retryBtn} onClick={handleRetry}>
                🔄 Aktifkan Kamera
              </button>
            </div>
          )}
        </div>
        <p style={styles.hint}>
          {cameraOn ? "📷 Arahkan QR Code ke kotak hijau" : "Kamera belum aktif"}
        </p>

        {debugMode && (
          <div style={styles.debugBox}>
            <div style={styles.debugTitle}>🔧 DEBUG MODE</div>
            <div>Last QR: <code>{lastQr || "-"}</code></div>
            <div>Scan count: {scanCount}</div>
            <button style={styles.debugToggle} onClick={() => setDebugMode(false)}>Hide Debug</button>
          </div>
        )}
        {!debugMode && (
          <button style={styles.debugToggle} onClick={() => setDebugMode(true)}>🔧 Debug</button>
        )}
      </div>

      <div style={styles.riwayatBox}>
        <h2 style={styles.sectionTitle}>📋 Scan Terakhir</h2>
        {riwayat.length === 0 ? (
          <p style={styles.empty}>Belum ada yang di-scan</p>
        ) : (
          <div style={styles.list}>
            {riwayat.map((r, i) => (
              <div key={i} style={styles.item}>
                <div style={styles.checkIcon}>✓</div>
                <div style={styles.info}>
                  <div style={styles.name}>{r.nama}</div>
                  <div style={styles.meta}>{r.nim_nik} | {r.kategori}</div>
                </div>
                <div style={styles.time}>
                  {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {notif && (
        <div style={{
          ...styles.notif,
          background: notifType === "success" ? "linear-gradient(135deg, #10b981, #059669)" : "linear-gradient(135deg, #ef4444, #dc2626)"
        }}>
          <span style={{ fontSize: "20px" }}>{notif}</span>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f8fafc", padding: "16px" },
  loading: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: "16px", color: "#64748b" },
  spinner: { width: "48px", height: "48px", border: "4px solid #e2e8f0", borderTopColor: "#10b981", borderRadius: "50%", animation: "spin 1s linear infinite" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  backBtn: { padding: "10px 16px", borderRadius: "8px", border: "none", background: "#e2e8f0", color: "#0f172a", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
  eventInfo: { textAlign: "center", flex: 1 },
  title: { fontSize: "18px", fontWeight: "bold", color: "#0f172a" },
  subtitle: { fontSize: "13px", color: "#64748b" },
  manualBtn: { padding: "10px 16px", borderRadius: "8px", border: "none", background: "#10b981", color: "#fff", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
  statsRow: { display: "flex", justifyContent: "center", alignItems: "center", gap: "20px", background: "#fff", padding: "16px", borderRadius: "12px", marginBottom: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  stat: { textAlign: "center" },
  statNum: { fontSize: "32px", fontWeight: "bold", color: "#0f172a" },
  statLabel: { fontSize: "12px", color: "#64748b" },
  statSep: { fontSize: "24px", color: "#e2e8f0" },
  cameraSection: { marginBottom: "20px" },
  cameraBox: { height: "340px", background: "#1e293b", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" },
  videoOn: { width: "100%", height: "100%", objectFit: "cover" },
  videoOff: { display: "none" },
  canvas: { display: "none" },
  scanFrame: { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "220px", height: "220px", border: "3px solid #10b981", borderRadius: "16px", boxShadow: "0 0 0 9999px rgba(0,0,0,0.6)" },
  scanLine: { position: "absolute", top: "0", left: "10%", right: "10%", height: "3px", background: "linear-gradient(90deg, transparent, #10b981, transparent)", animation: "scanLine 2s linear infinite" },
  cameraOff: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", padding: "20px", textAlign: "center" },
  icon: { fontSize: "64px", opacity: 0.4 },
  msg: { color: "#94a3b8", fontSize: "14px", maxWidth: "280px", lineHeight: "1.5" },
  retryBtn: { padding: "14px 28px", borderRadius: "10px", border: "none", background: "#10b981", color: "#fff", fontSize: "16px", fontWeight: "600", cursor: "pointer" },
  hint: { textAlign: "center", color: "#64748b", fontSize: "14px", marginTop: "12px" },
  debugBox: { background: "#1e293b", color: "#10b981", padding: "12px", borderRadius: "8px", marginTop: "12px", fontSize: "12px", fontFamily: "monospace" },
  debugTitle: { fontWeight: "bold", marginBottom: "8px" },
  debugToggle: { background: "#64748b", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", cursor: "pointer", marginTop: "8px" },
  riwayatBox: { background: "#fff", borderRadius: "12px", padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  sectionTitle: { fontSize: "16px", fontWeight: "bold", color: "#0f172a", marginBottom: "12px" },
  empty: { textAlign: "center", color: "#94a3b8", padding: "24px" },
  list: { display: "flex", flexDirection: "column", gap: "10px" },
  item: { display: "flex", alignItems: "center", gap: "12px", padding: "14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" },
  checkIcon: { width: "36px", height: "36px", borderRadius: "50%", background: "#10b981", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "18px" },
  info: { flex: 1 },
  name: { fontSize: "15px", fontWeight: "bold", color: "#0f172a" },
  meta: { fontSize: "13px", color: "#64748b" },
  time: { fontSize: "13px", color: "#64748b" },
  notif: { position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)", padding: "18px 32px", borderRadius: "14px", color: "#fff", fontWeight: "bold", fontSize: "16px", display: "flex", alignItems: "center", gap: "12px", zIndex: 9999, boxShadow: "0 8px 32px rgba(0,0,0,0.3)", maxWidth: "90%", textAlign: "center", animation: "slideDown 0.3s ease" },
};