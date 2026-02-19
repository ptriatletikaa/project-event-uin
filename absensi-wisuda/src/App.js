import { BrowserRouter, Routes, Route } from "react-router-dom";

// MAHASISWA
import Login from "./pages/Login";
import Barcode from "./pages/Barcode";

// PANITIA
import LoginPanitia from "./pages/LoginPanitia";
import ScanPanitia from "./pages/ScanPanitia";

// ADMINN
import LoginAdmin from "./pages/LoginAdmin";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ===== MAHASISWA ===== */}
        <Route path="/" element={<Login />} />
        <Route path="/barcode" element={<Barcode />} />

        {/* ===== PANITIA ===== */}
        <Route path="/panitia" element={<LoginPanitia />} />
        <Route path="/panitia/scan" element={<ScanPanitia />} />

        {/* ===== ADMINNN ===== */}
        <Route path="/admin/login" element={<LoginAdmin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

      </Routes>
    </BrowserRouter>
  );
}
