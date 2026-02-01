
-- PETUNJUK KHUSUS CPANEL:
-- 1. Buat database manual di cPanel (Menu MySQL Databases), misal: 'username_simkepk'
-- 2. Buka phpMyAdmin, KLIK database tersebut di panel kiri.
-- 3. Baru jalankan (Import/SQL) script di bawah ini.

-- Tabel Users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL, -- researcher, reviewer, admin
    institution VARCHAR(150),
    status VARCHAR(20) DEFAULT 'pending', -- active, pending, rejected, suspended
    password VARCHAR(255) NOT NULL, -- Disarankan menggunakan Hash di production
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    identity_number VARCHAR(50),
    phone VARCHAR(20)
);

-- Tabel Submissions (Pengajuan)
CREATE TABLE IF NOT EXISTS submissions (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    researcher_name VARCHAR(100),
    researcher_email VARCHAR(100),
    institution VARCHAR(150),
    description TEXT,
    status VARCHAR(50),
    documents LONGTEXT, -- Menyimpan JSON Array dokumen
    self_assessment LONGTEXT, -- Menyimpan JSON Array assessment
    submission_date DATE,
    approval_date DATE,
    feedback TEXT,
    progress_reports LONGTEXT, -- Menyimpan JSON Array laporan
    certificate_url VARCHAR(255), -- New Column for uploaded certificate
    team_members LONGTEXT -- New Column for Anggota Peneliti (JSON)
);

-- Tabel Config (Master Dokumen)
CREATE TABLE IF NOT EXISTS config (
    id VARCHAR(50) PRIMARY KEY,
    label VARCHAR(150) NOT NULL,
    is_required TINYINT(1) DEFAULT 1
);

-- Tabel Password Resets (BARU)
CREATE TABLE IF NOT EXISTS password_resets (
    email VARCHAR(100) NOT NULL,
    token VARCHAR(100) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    KEY(token)
);

-- Data Awal (Seeding) untuk Config
INSERT IGNORE INTO config (id, label, is_required) VALUES 
('protocol', 'Protokol Lengkap (PDF)', 1),
('consent', 'Informed Consent / PSP', 1);

-- Data Awal Admin
-- Username (Email): admin
-- Password: admin
INSERT INTO users (id, name, email, role, institution, status, password, joined_at) 
VALUES ('ADM-001', 'Administrator Utama', 'admin', 'admin', 'Sekretariat KEPK', 'active', 'admin', NOW())
ON DUPLICATE KEY UPDATE password = 'admin';
