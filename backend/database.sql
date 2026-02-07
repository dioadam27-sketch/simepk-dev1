-- ==========================================
-- QUERY PEMBARUAN DATABASE SIM KEPK
-- Jalankan script ini di phpMyAdmin (Tab SQL)
-- ==========================================

-- 1. TABEL USERS
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL, -- researcher, reviewer, admin
    institution VARCHAR(150),
    status VARCHAR(20) DEFAULT 'pending', -- active, pending, rejected, suspended
    password VARCHAR(255) NOT NULL,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    identity_number VARCHAR(50),
    phone VARCHAR(20)
);

-- 2. TABEL SUBMISSIONS
CREATE TABLE IF NOT EXISTS submissions (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    researcher_name VARCHAR(100),
    researcher_email VARCHAR(100),
    institution VARCHAR(150),
    description TEXT,
    status VARCHAR(50),
    documents LONGTEXT, -- JSON
    self_assessment LONGTEXT, -- JSON
    submission_date DATE,
    approval_date DATE,
    feedback TEXT,
    progress_reports LONGTEXT, -- JSON
    certificate_url VARCHAR(255), -- Kolom Baru
    team_members LONGTEXT -- Kolom Baru
);

-- 3. SAFE MIGRATION (Update Struktur Tabel Otomatis)
-- Script ini aman dijalankan berulang kali. 
-- Hanya akan menambahkan kolom jika kolom tersebut BELUM ADA.

-- Cek & Tambah kolom 'certificate_url'
SET @dbname = DATABASE();
SET @tablename = "submissions";
SET @columnname = "certificate_url";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 1",
  "ALTER TABLE submissions ADD COLUMN certificate_url VARCHAR(255)"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Cek & Tambah kolom 'team_members'
SET @columnname = "team_members";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 1",
  "ALTER TABLE submissions ADD COLUMN team_members LONGTEXT"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 4. TABEL CONFIG (Master Dokumen)
CREATE TABLE IF NOT EXISTS config (
    id VARCHAR(50) PRIMARY KEY,
    label VARCHAR(150) NOT NULL,
    is_required TINYINT(1) DEFAULT 1
);

-- 5. TABEL PASSWORD RESETS
CREATE TABLE IF NOT EXISTS password_resets (
    email VARCHAR(100) NOT NULL,
    token VARCHAR(100) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    KEY(token)
);

-- 6. TABEL ADMIN LOGS (BARU)
CREATE TABLE IF NOT EXISTS admin_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_name VARCHAR(100) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABEL PERTANYAAN KUESIONER (BARU)
CREATE TABLE IF NOT EXISTS questionnaire_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) NOT NULL, -- 'rating', 'text', 'yesno', 'likert'
    is_active TINYINT(1) DEFAULT 1
);

-- 8. TABEL RESPON KUESIONER (BARU)
CREATE TABLE IF NOT EXISTS questionnaire_responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    respondent_name VARCHAR(100),
    respondent_role VARCHAR(50),
    answers_json LONGTEXT, -- Menyimpan array jawaban [{question_id: 1, answer: "5"}]
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. DATA DEFAULT (SEEDING)

-- Default Akun Administrator
-- Username: admin
-- Password: admin
INSERT IGNORE INTO users (id, name, email, role, institution, status, password, joined_at) 
VALUES ('ADM-001', 'Administrator Utama', 'admin', 'admin', 'Sekretariat KEPK', 'active', 'admin', NOW());

-- Catatan: Data dummy pertanyaan kuesioner dan dokumen persyaratan telah dihapus agar sistem mulai dalam keadaan bersih.
-- Silakan tambahkan melalui dashboard Admin.
