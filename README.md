# Sistem Absensi Event - Absensi Wisuda

Aplikasi manajemen absensi event dengan 3 role: **Admin Sistem**, **Admin Lapangan**, dan **Undangan**.

## Struktur Project

```
absensi-wisuda/
├── backend/                    # Node.js + Express API
│   ├── config/db.js           # Koneksi MySQL
│   ├── controllers/           # Logic API
│   ├── middleware/            # JWT Auth & Role Check
│   ├── routes/                # API Routes
│   ├── schema.sql             # Database Schema
│   └── Server.js              # Entry point
│
├── absensi-wisuda/            # React Frontend
│   └── src/
│       ├── contexts/          # Auth Context
│       ├── pages/
│       │   ├── admin/         # Admin Sistem pages
│       │   ├── lapangan/      # Admin Lapangan pages
│       │   └── undangan/      # Undangan pages
│       └── services/           # API Axios instance
│
└── PRD.md                     # Product Requirements Document
```

## Prerequisites

- Node.js v18+
- MySQL 8.0+

## Installation & Running

### 1. Setup Database

```bash
# Login ke MySQL
mysql -u root -p

# Buat database
CREATE DATABASE db_absensi_event;

# Keluar MySQL, lalu import schema
mysql -u root -p db_absensi_event < backend/schema.sql
```

### 2. Jalankan Backend

```bash
cd backend
npm install
npm start
```
Backend akan jalan di `http://localhost:5000`

Default admin akan otomatis dibuat:
- Email: `admin@event.com`
- Password: `admin123`

### 3. Jalankan Frontend

```bash
cd absensi-wisuda
npm install
npm start
```
Frontend akan jalan di `http://localhost:3000`

---

## Alur Penggunaan

### Admin Sistem (Superadmin)

1. Login di `/login` dengan `admin@event.com` / `admin123`
2. Buat Admin Lapangan baru di **User Management**
3. Buat Event baru di **Event Management** + assign Admin Lapangan
4. Di **Event Detail**, import Excel undangan atau tambah manual
5. Undangan bisa export QR code

### Admin Lapangan

1. Login di `/lapangan/login` dengan kredensial dari Admin Sistem
2. Pertama login akan diminta ubah password
3. Pilih event yang sudah di-assign
4. Scan QRCode undangan untuk check-in
5. Gunakan **Manual Check-in** jika QR tidak bisa di-scan
6. Lihat history dan export laporan

### Undangan (Tamu)

1. Login di `/undangan/login` dengan NIM/NIK
2. Lihat dan download QR Code
3. Tunjukkan QR saat check-in di venue

---

## API Endpoints

### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/change-password` - Change password

### Users (Admin Sistem only)
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PUT /api/users/:id/reset-password` - Reset password

### Events (Admin Sistem)
- `GET /api/events` - List events
- `POST /api/events` - Create event
- `GET /api/events/:id` - Get event detail
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `PUT /api/events/:id/assign-admins` - Assign admins

### Undangan
- `GET /api/events/:id/invited-users` - List undangan
- `POST /api/events/:id/invited-users` - Add undangan
- `POST /api/events/:id/invited-users/bulk` - Bulk import Excel
- `DELETE /api/invited-users/:id` - Delete undangan

### Check-in (Admin Lapangan)
- `POST /api/checkin` - Scan QR check-in
- `POST /api/checkin/manual` - Manual check-in
- `GET /api/events/:id/checkin-status` - Get stats
- `GET /api/events/:id/checkin-logs` - Get logs

### Undangan Login (Public)
- `POST /api/undangan/login` - Login dengan NIM/NIK

---

## Excel Import Template

Kolom yang dibutuhkan:
| Nama | NIM | Email | Kategori |
|------|-----|-------|----------|

- `Nama`: Nama lengkap undangan
- `NIM`: NIM atau NIK unik
- `Email`: Email (opsional)
- `Kategori`: `VIP` atau `Normal`

---

## Fitur Sesuai PRD

| Fitur | Status |
|-------|--------|
| Login 3 role (Admin Sistem, Admin Lapangan, Undangan) | ✅ |
| User Management (CRUD + role filter) | ✅ |
| Event Management (CRUD + assign admins) | ✅ |
| Undangan Management (Import Excel + manual) | ✅ |
| QR Code Generation | ✅ |
| Check-in dengan QR Scan | ✅ |
| Kapasitas Enforcement | ✅ |
| Manual Check-in | ✅ |
| QR Expiration (event selesai) | ✅ |
| Export Excel/CSV | ✅ |
| Change Password (first login) | ✅ |
| Real-time stats | ✅ |
