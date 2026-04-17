-- Database: db_absensi_wisuda

-- ================= TABLE: users =================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'operator') DEFAULT 'operator',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================= TABLE: mahasiswa =================
CREATE TABLE IF NOT EXISTS mahasiswa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nim VARCHAR(20) UNIQUE NOT NULL,
  nama VARCHAR(150) NOT NULL,
  fakultas VARCHAR(100),
  prodi VARCHAR(100),
  jenjang ENUM('S1', 'S2', 'S3') DEFAULT 'S1',
  no_hp VARCHAR(20),
  email VARCHAR(150),
  foto VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================= TABLE: acara =================
CREATE TABLE IF NOT EXISTS acara (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_acara VARCHAR(200) NOT NULL,
  tanggal DATE NOT NULL,
  waktu_mulai TIME NOT NULL,
  waktu_selesai TIME,
  tempat VARCHAR(200),
  kapasitas INT,
  deskripsi TEXT,
  status ENUM('draft', 'aktif', 'selesai') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================= TABLE: qr_codes =================
CREATE TABLE IF NOT EXISTS qr_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  acara_id INT NOT NULL,
  kode_qr VARCHAR(255) UNIQUE NOT NULL,
  mahasiswa_id INT,
  token VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  status ENUM('aktif', 'used', 'expired') DEFAULT 'aktif',
  FOREIGN KEY (acara_id) REFERENCES acara(id) ON DELETE CASCADE,
  FOREIGN KEY (mahasiswa_id) REFERENCES mahasiswa(id) ON DELETE SET NULL
);

-- ================= TABLE: absensi =================
CREATE TABLE IF NOT EXISTS absensi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  acara_id INT NOT NULL,
  mahasiswa_id INT,
  qr_id INT,
  waktu_absen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('hadir', 'terlambat', 'alpha') DEFAULT 'hadir',
  device_info VARCHAR(255),
  lokasi VARCHAR(255),
  FOREIGN KEY (acara_id) REFERENCES acara(id) ON DELETE CASCADE,
  FOREIGN KEY (mahasiswa_id) REFERENCES mahasiswa(id) ON DELETE SET NULL,
  FOREIGN KEY (qr_id) REFERENCES qr_codes(id) ON DELETE SET NULL
);

-- ================= TABLE: laporan =================
CREATE TABLE IF NOT EXISTS laporan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  acara_id INT NOT NULL,
  total_peserta INT DEFAULT 0,
  total_hadir INT DEFAULT 0,
  total_terlambat INT DEFAULT 0,
  total_alpha INT DEFAULT 0,
  file_laporan VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (acara_id) REFERENCES acara(id) ON DELETE CASCADE
);

-- Insert sample user (password: admin123)
INSERT INTO users (username, email, password, role) VALUES 
('admin', 'admin@uinsgd.ac.id', 'admin123', 'admin');
