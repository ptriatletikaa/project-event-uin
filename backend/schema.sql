-- =====================================================
-- Database: db_absensi_event
-- Sistem Absensi Event - Absensi Wisuda
-- =====================================================

CREATE DATABASE IF NOT EXISTS db_absensi_event;
USE db_absensi_event;

-- =====================================================
-- TABLE: users
-- Admin Sistem & Admin Lapangan
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin_sistem', 'admin_lapangan') NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    first_login BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role_status (role, status)
);

-- =====================================================
-- TABLE: events
-- Event yang dikelola Admin Sistem
-- =====================================================
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    tanggal DATE NOT NULL,
    waktu_mulai TIME NOT NULL,
    waktu_selesai TIME NOT NULL,
    lokasi VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    kapasitas INT NOT NULL,
    status ENUM('draft', 'active', 'selesai') DEFAULT 'draft',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_tanggal (tanggal)
);

-- =====================================================
-- TABLE: event_admins
-- Many-to-Many: Admin Lapangan bisa assigned ke banyak Event
-- =====================================================
CREATE TABLE IF NOT EXISTS event_admins (
    event_id INT NOT NULL,
    admin_lapangan_id INT NOT NULL,
    PRIMARY KEY (event_id, admin_lapangan_id),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_lapangan_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLE: invited_users
-- Undangan/Tamu yang diundang ke event
-- =====================================================
CREATE TABLE IF NOT EXISTS invited_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    nim_nik VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255),
    event_id INT NOT NULL,
    kategori ENUM('VIP', 'Normal') DEFAULT 'Normal',
    qr_code VARCHAR(255) UNIQUE,
    status_checkin ENUM('belum', 'sudah') DEFAULT 'belum',
    checkin_at DATETIME,
    scanned_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (scanned_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_event_id (event_id),
    INDEX idx_nim_nik (nim_nik),
    INDEX idx_qr_code (qr_code),
    INDEX idx_status_checkin (status_checkin)
);

-- =====================================================
-- TABLE: checkin_logs
-- Log semua aktivitas check-in (scan & manual)
-- =====================================================
CREATE TABLE IF NOT EXISTS checkin_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invited_user_id INT NOT NULL,
    event_id INT NOT NULL,
    admin_lapangan_id INT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    method ENUM('scan', 'manual') NOT NULL,
    reason VARCHAR(255),
    FOREIGN KEY (invited_user_id) REFERENCES invited_users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_lapangan_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_event_id (event_id),
    INDEX idx_timestamp (timestamp)
);

-- =====================================================
-- NOTES:
-- 1. Default admin akan dibuat otomatis oleh Server.js saat start
-- 2. Password: admin123 (di-hash dengan bcrypt)
-- 3. Jangan insert manual admin di schema ini
-- =====================================================
