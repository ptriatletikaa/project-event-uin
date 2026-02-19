import { useLocation } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import bg from "../assets/Gedung.jpg";

function Barcode() {
    const location = useLocation();
    const { nama, nim } = location.state || {};

    if (!nama || !nim) {
        return <h3>Data tidak ditemukan</h3>;
    }

    const handleDownload = () => {
        const canvas = document.getElementById("qr-code");
        const pngUrl = canvas
            .toDataURL("image/png")
            .replace("image/png", "image/octet-stream");

        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `QR_${nim}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    return (
        <div
            style={{
                ...styles.page,
                backgroundImage: `
                    linear-gradient(
                        rgba(0,0,0,0.35),
                        rgba(0,0,0,0.35)
                    ),
                    url(${bg})
                `,
            }}
        >
            <div style={styles.card}>
                <h2>QR Code Absensi Wisuda</h2>

                <QRCodeCanvas
                    id="qr-code"
                    value={nim}
                    size={220}
                />

                <div style={styles.info}>
                    <p>Nama : {nama}</p>
                    <p>NIM : {nim}</p>
                </div>

                <button onClick={handleDownload} style={styles.button}>
                    Download QR
                </button>
            </div>
        </div>
    );
}

export default Barcode;

const styles = {
    page: {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundSize: "cover",
        backgroundPosition: "center",
    },
    card: {
        background: "#ffffff",
        padding: "30px",
        borderRadius: "14px",
        textAlign: "center",
        width: "320px",

        /* ✨ EFEK CAHAYA */
        boxShadow: `
            0 0 15px rgba(37, 99, 235, 0.6),
            0 0 30px rgba(37, 99, 235, 0.4),
            0 0 45px rgba(37, 99, 235, 0.2)
        `,
    },
    info: {
        marginTop: "12px",
        marginBottom: "16px",
        lineHeight: "1.4",
    },
    button: {
        width: "100%",
        padding: "10px",
        background: "#2563eb",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
    },
};
