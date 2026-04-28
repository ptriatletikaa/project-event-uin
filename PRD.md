# PRD: Sistem Absensi Event - Absensi Wisuda

## 1. Concept & Vision

Sistem manajemen absensi event (wisuda/conference/seminar) dengan 3 role utama: **Admin Sistem**, **Admin Lapangan**, dan **Undangan**. Memiliki alur sederhana: admin buat event → generate/download undangan → undangan scan QR saat check-in → admin lapangan scan verifikasi → data tersimpan & bisa di-export.

**Feel**: Clean, profesional, mudah digunakan di lapangan (field) dengan UI yang jelas dan feedback langsung saat scan.

---

## 2. Design Language

### Aesthetic Direction
Minimalist functional — terinspirasi dari sistem check-in event modern seperti Eventbrite/Ticketmaster. Fokus pada clarity dan speed.

### Color Palette
| Role | Color | Usage |
|------|-------|-------|
| Primary | `#2563EB` (blue) | Buttons, active states |
| Secondary | `#10B981` (green) | Success, check-in confirmed |
| Warning | `#F59E0B` (amber) | Pending states |
| Danger | `#EF4444` (red) | Error, rejected |
| Background | `#F8FAFC` | Main bg |
| Sidebar | `#1E293B` | Dark sidebar |
| Card | `#FFFFFF` | White cards |
| Text Primary | `#0F172A` | Main text |
| Text Muted | `#64748B` | Secondary text |

### Typography
- **Font**: Inter (Google Fonts), fallback sans-serif
- **Headings**: 18-24px, bold
- **Body**: 14-16px, regular
- **Labels**: 12-13px, medium

### Motion Philosophy
- Scan success: green flash + checkmark animation (300ms)
- Error: shake animation (200ms)
- Page transitions: fade 150ms
- Notifications: slide-in from top, auto-dismiss 3s

---

## 3. User Roles & Permissions

### 3 Role Utama

| Role | Keterangan | Akses |
|------|------------|-------|
| **Admin Sistem** | Superadmin, manage semua | Dashboard, user management, event management, laporan |
| **Admin Lapangan** | Operator event di lapangan | Login/Logout, Scan QR verifikasi, laporan absensi event |
| **Undangan** | Tamu yang diundang | Login, lihat QR, check-in (scan QR gerbang) |

---

## 4. Features & Functionality

### 4.1 Authentication System

#### Admin Sistem
- Login dengan email + password
- Manage admin lainnya (CRUD)
- Manage admin lapangan
- Reset password

#### Admin Lapangan
- Login dengan kredensial dari Admin Sistem
- Password sementara saat pertama kali login → wajib ganti
- Logout

#### Undangan
- Login dengan NIM/NIK atau kode tiket
- Tidak perlu password (kode sekali pakai atau NIM)
- Setelah login dapat QR code personal
- QR code valid hingga event selesai

### 4.2 Management Menu

#### User Management (Admin Sistem)
- List semua admin (sistem & lapangan)
- Tambah admin baru
- Edit admin (reset password, update data)
- Hapus/Nonaktifkan admin
- Filter by role

#### Event Management (Admin Sistem)
- CRUD event
- Field: nama, tanggal, waktu mulai, waktu selesai, lokasi, deskripsi, kapasitas, status
- Set admin lapangan yang bertanggung jawab per event
- Status event: Draft / Active / Selesai
- Kapasitas akan di-enforce saat check-in

#### Undangan Management (Admin Sistem)
- Import dari Excel (template: Nama, NIM/NIK, Email, Event, Kategori [VIP/Normal])
- Generate QR codes secara masal
- Download semua QR sebagai PDF/ZIP
- List undangan per event
- Check-in status per undangan

### 4.3 Check-in Flow

```
Undangan datang → Tunjukkan QR di HP
Admin Lapangan scan QR → Sistem verifikasi:
  ✅ Valid + belum check-in → "Berhasil! Selamat datang, [Nama]"
  ❌ Sudah check-in → "Sudah check-in pukul [jam]"
  ❌ Tidak valid → "QR tidak dikenali"
  ❌ Kapasitas penuh → "Maaf, kapasitas event sudah penuh"
  ❌ Event selesai → "Event sudah berakhir"
```

#### Kapasitas Enforcement
- Setiap event memiliki kapasitas maximum
- Jika jumlah check-in已经达到 kapasitas, check-in ditolak
- Admin dapat melihat sisa kapasitas di dashboard

#### Manual Check-in
- Jika QR rusak/tidak bisa di-scan, admin lapangan dapat melakukan manual check-in
- Cari undangan berdasarkan Nama atau NIM
- Verifikasi identity sebelum manual check-in

#### QR Code Expiration
- QR hanya valid saat event aktif (status = Active)
- Jika event berubah menjadi Selesai, QR tidak bisa di-scan lagi

### 4.4 Dashboard & Reports (Admin Sistem)

- Total undangan per event
- Total check-in vs belum
- Persentase attendance
- Export laporan ke Excel/CSV

### 4.5 Dashboard Admin Lapangan

- Pilih event yang sedang aktif
- Scan QR untuk verifikasi
- Lihat jumlah yang sudah check-in (real-time)
- Sisa kapasitas tersisa
- Export laporan event tersebut

---

## 5. Database Schema

### Tables

```sql
-- Admin/Sistem
users (id, nama, email, password_hash, role [admin_sistem|admin_lapangan], status, created_at)

events (id, nama, tanggal, waktu_mulai, waktu_selesai, lokasi, deskripsi, kapasitas, status [draft|active|selesai], created_by, created_at)

event_admins (event_id, admin_lapangan_id) -- Many-to-many relationship

invited_users (id, nama, nim_nik, email, event_id, kategori, qr_code, status_checkin, checkin_at, scanned_by)

-- Check-in logs
checkin_logs (id, invited_user_id, event_id, admin_lapangan_id, timestamp, method [scan|manual])
```

### Relationship
- `users.role = admin_lapangan` → bisa assigned ke banyak events (via event_admins)
- `events` → banyak `invited_users`
- `invited_users` → banyak `checkin_logs`

---

## 6. API Endpoints

### Auth
- `POST /api/auth/login` - Login admin (email + password)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Users (Admin Sistem Only)
- `GET /api/users` - List all users (filter by role)
- `POST /api/users` - Create user (admin sistem atau admin lapangan)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (soft delete / set status = inactive)
- `PUT /api/users/:id/reset-password` - Reset password ke default

### Events (Admin Sistem)
- `GET /api/events` - List events
- `POST /api/events` - Create event
- `GET /api/events/:id` - Get event detail
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `PUT /api/events/:id/assign-admins` - Assign admin lapangan ke event

### Invited Users (Undangan)
- `GET /api/events/:id/invited-users` - List undangan per event
- `POST /api/events/:id/invited-users` - Add undangan (single)
- `POST /api/events/:id/invited-users/bulk` - Bulk import from Excel
- `PUT /api/invited-users/:id` - Update undangan
- `DELETE /api/invited-users/:id` - Delete undangan
- `GET /api/invited-users/:id` - Get invited user detail

### Check-in
- `POST /api/checkin` - Scan QR → check-in (returns success/error with message)
- `POST /api/checkin/manual` - Manual check-in (by nama or nim_nik)
- `GET /api/events/:id/checkin-status` - Get check-in stats (total, checked-in, percentage, capacity remaining)
- `GET /api/events/:id/checkin-logs` - Get all check-in logs for event

### Reports
- `GET /api/events/:id/report` - Get full report (export ready)
- `GET /api/events/:id/export` - Export to Excel/CSV

### Undangan Login (Public)
- `POST /api/undangan/login` - Login dengan NIM/NIK (returns invited user data + QR code)
- `GET /api/undangan/:id/qr` - Get QR code data for invited user

---

## 7. Page Structure

### Admin Sistem

#### Login Page
- Email + password
- Error message if failed

#### Dashboard
- Summary stats: total events, total undangan, total check-in
- Recent activity
- Quick access to events

#### User Management Page
- Table: Nama, Email, Role, Status, Actions
- Filter by role
- Add new user modal
- Edit/Reset Password/Delete actions

#### Event Management Page
- Table: Nama, Tanggal, Lokasi, Kapasitas, Status, Actions
- Create new event modal
- Edit event
- Assign admin lapangan to event
- View detail → invited users list

#### Event Detail Page
- Event info header
- Tabs: Undangan | Check-in Stats | Laporan
- Undangan tab: list semua undangan dengan status check-in
- Import Excel button
- Export button

#### Undangan Management (per event)
- List undangan
- Check-in status badge
- Search by nama/NIM
- Bulk actions

### Admin Lapangan

#### Login Page
- Username/NIK + password
- First time → must change password

#### Event Selection Page
- List event yang assigned ke admin ini dan berstatus Active
- Select event to start scanning

#### Scan Page
- Camera view untuk scan QR
- Live counter: "Check-in: X / Y"
- Recent scans list (scrollable)
- Sisa kapasitas display

#### Manual Check-in Page
- Search by nama atau NIM
- Show matching results
- Select person → confirm manual check-in
- Must input reason for manual check-in

#### History Page
- Riwayat check-in untuk event yang dipilih
- Export CSV button

### Undangan (Mobile-First)

#### Login Page
- Input NIM/NIK
- Submit → get QR code

#### QR Display Page
- Large QR code (generated from invited_user id)
- Nama dan NIM displayed
- Download QR button

---

## 8. Check-in Validation Rules

| Condition | Response |
|-----------|----------|
| QR valid + belum check-in + event active + kapasitas ada | ✅ Success: "Berhasil! Selamat datang, [Nama]" |
| QR valid + sudah check-in | ❌ "Sudah check-in pada pukul [jam]" |
| QR valid + event sudah selesai | ❌ "Event sudah berakhir" |
| QR valid + kapasitas penuh | ❌ "Maaf, kapasitas event sudah penuh" |
| QR tidak valid/tidak ditemukan | ❌ "QR tidak dikenali" |
| Manual: data ditemukan + belum check-in + kapasitas ada | ✅ "Berhasil check-in manual" |
| Manual: tidak ditemukan | ❌ "Data tidak ditemukan" |

---

## 9. Technical Approach

### Frontend
- React 18 (existing)
- React Router v7
- State: React Context untuk auth state
- QR: qrcode.react (generate), jsQR (scan)
- Export: xlsx for Excel export

### Backend
- Node.js + Express (existing)
- MySQL (existing)
- JWT untuk authentication (token expiry 24h)
- bcrypt untuk password hashing

### Folder Structure (Backend)
```
backend/
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── eventController.js
│   ├── invitedUserController.js
│   └── checkinController.js
├── middleware/
│   ├── auth.js (JWT verification)
│   └── roleCheck.js (role-based access)
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── events.js
│   ├── invitedUsers.js
│   └── checkin.js
├── models/
│   └── (optional: separate model files)
├── uploads/
│   └── (for excel imports)
├── Server.js
└── package.json
```

### Folder Structure (Frontend)
```
absensi-wisuda/src/
├── contexts/
│   └── AuthContext.jsx
├── pages/
│   ├── admin/
│   │   ├── Dashboard.jsx
│   │   ├── UserManagement.jsx
│   │   ├── EventManagement.jsx
│   │   ├── EventDetail.jsx
│   │   └── LoginAdmin.jsx (existing - can rename)
│   ├── lapangan/
│   │   ├── LoginLapangan.jsx
│   │   ├── EventSelect.jsx
│   │   ├── Scan.jsx
│   │   ├── ManualCheckin.jsx
│   │   └── History.jsx
│   └── undangan/
│       ├── LoginUndangan.jsx
│       └── QrDisplay.jsx
├── components/
│   ├── Sidebar.jsx
│   ├── Table.jsx
│   ├── Modal.jsx
│   ├── Notification.jsx
│   └── ...
├── services/
│   └── api.js (axios instance)
├── utils/
│   └── helpers.js
├── App.js
└── index.js
```

---

## 10. Implementation Phases

### Phase 1: Foundation (Auth + User + Event)
1. Setup database schema baru
2. Auth system (JWT login, middleware)
3. User management (CRUD)
4. Event management (CRUD + assign admins)

### Phase 2: Invitation System
1. Invited users CRUD
2. Bulk import from Excel
3. QR generation (individual)
4. Undangan login + QR display

### Phase 3: Check-in System
1. Check-in API with validation rules
2. Admin lapangan scan page
3. Real-time stats (checked-in / capacity)
4. Manual check-in feature
5. Kapasitas enforcement

### Phase 4: Reports & Polish
1. Export Excel reports
2. Dashboard stats
3. UI polish & error handling

---

## 11. Decision Summary

| Item | Decision |
|------|----------|
| Email notification | ❌ Tidak perlu |
| Kapasitas enforcement | ✅ Ya, check-in ditolak jika kapasitas penuh |
| Manual check-in | ✅ Ya, untuk QR rusak/tidak bisa scan |
| QR expiration | ✅ Berlaku saat event sudah selesai (status = selesai) |

---

## 12. Open Questions (Resolved)

- [x] Email notification - tidak perlu
- [x] Kapasitas - di-enforce
- [x] Manual check-in - perlu
- [x] QR expiration - event selesai = QR invalid