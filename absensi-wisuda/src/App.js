import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

import LoginAdmin from "./pages/admin/LoginAdmin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import EventManagement from "./pages/admin/EventManagement";
import EventDetail from "./pages/admin/EventDetail";

import LoginLapangan from "./pages/lapangan/LoginLapangan";
import ChangePassword from "./pages/lapangan/ChangePassword";
import EventSelect from "./pages/lapangan/EventSelect";
import Scan from "./pages/lapangan/Scan";
import ManualCheckin from "./pages/lapangan/ManualCheckin";
import History from "./pages/lapangan/History";

import LoginUndangan from "./pages/undangan/LoginUndangan";
import QrDisplay from "./pages/undangan/QrDisplay";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/undangan/login" element={<LoginUndangan />} />
          <Route path="/undangan/qr" element={<QrDisplay />} />

          <Route path="/login" element={<LoginAdmin />} />

          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/events" element={<EventManagement />} />
          <Route path="/admin/events/:id" element={<EventDetail />} />

          <Route path="/lapangan/login" element={<LoginLapangan />} />
          <Route path="/lapangan/change-password" element={<ChangePassword />} />
          <Route path="/lapangan/event-select" element={<EventSelect />} />
          <Route path="/lapangan/scan/:id" element={<Scan />} />
          <Route path="/lapangan/manual/:id" element={<ManualCheckin />} />
          <Route path="/lapangan/history/:id" element={<History />} />

          <Route path="/" element={<Navigate to="/undangan/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
