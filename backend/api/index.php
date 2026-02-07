<?php
// Memuat konfigurasi database dan SMTP Helper
require_once 'config.php';
require_once 'smtp.php';

// Ambil Method Request
$method = $_SERVER['REQUEST_METHOD'];
$action = '';
$payload = [];

// Parse Input (Bisa dari GET param atau POST Body JSON)
if ($method === 'GET') {
    $action = isset($_GET['action']) ? $_GET['action'] : '';
    $payload = $_GET;
} elseif ($method === 'POST') {
    // React mengirim data dalam bentuk JSON String, bukan Form Data biasa
    $input = json_decode(file_get_contents("php://input"), true);
    $action = isset($input['action']) ? $input['action'] : '';
    $payload = isset($input['payload']) ? $input['payload'] : [];
}

// Konfigurasi Folder Upload (MENGGUNAKAN ABSOLUTE PATH)
// __DIR__ mengacu pada folder 'api'. Naik satu level ke root, lalu ke folder 'upload'.
$uploadDir = __DIR__ . '/../upload/';

// Base URL eksplisit sesuai permintaan user
$baseUrl = 'https://ppk2ipe.unair.ac.id/upload/';

// --- HELPER FUNCTIONS ---

/**
 * Fungsi untuk menyimpan file dari string Base64 ke folder server
 */
function uploadBase64File($base64, $filename, $uploadDir, $baseUrl) {
    // Buat folder jika belum ada dengan permission 0755
    if (!file_exists($uploadDir)) {
        if (!mkdir($uploadDir, 0755, true)) {
            // Jika gagal membuat folder, return null (jangan crash)
            error_log("Gagal membuat folder upload di: " . $uploadDir);
            return null; 
        }
    }
    
    // Bersihkan nama file dari karakter aneh untuk keamanan
    $filename = preg_replace("/[^a-zA-Z0-9\._-]/", "", $filename);
    $uniqueName = uniqid() . '_' . $filename;
    $filePath = $uploadDir . $uniqueName;
    
    // Decode Base64 & Save
    $data = base64_decode($base64);
    if ($data === false) {
        error_log("Gagal decode base64 file: " . $filename);
        return null;
    }

    if (file_put_contents($filePath, $data)) {
        return $baseUrl . $uniqueName;
    } else {
        error_log("Gagal menulis file ke: " . $filePath);
        return null;
    }
}

/**
 * Helper untuk format nomor HP ke format Internasional (WhatsApp)
 * 0812... -> 62812...
 */
function formatPhoneForWA($phone) {
    $phone = preg_replace('/[^0-9]/', '', $phone); // Hapus non-angka
    if (substr($phone, 0, 1) === '0') {
        $phone = '62' . substr($phone, 1);
    }
    return $phone;
}

// --- MAIN ROUTING LOGIC ---

$response = ["status" => "error", "message" => "Invalid action"];

try {
    switch ($action) {
        
        // ==========================================
        // 0. HEALTH CHECK (ROOT URL)
        // ==========================================
        case '': 
        case 'check':
            $response = ["status" => "success", "message" => "API SIM KEPK Siap Digunakan. Koneksi Database Berhasil."];
            break;

        // ==========================================
        // 1. AUTHENTICATION & PASSWORD RESET
        // ==========================================
        case 'login':
            // UPDATE: Login support Email OR Identity Number (NIM/NIK)
            // Menggunakan trim() untuk membersihkan input dari spasi
            $inputParam = isset($payload['email']) ? trim($payload['email']) : '';
            $passwordParam = isset($payload['password']) ? $payload['password'] : '';

            $stmt = $conn->prepare("SELECT * FROM users WHERE (email = :input OR identity_number = :input) AND password = :password LIMIT 1");
            $stmt->bindParam(':input', $inputParam); 
            $stmt->bindParam(':password', $passwordParam); 
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                if ($user['status'] !== 'active') {
                    $response = ["status" => "error", "message" => "Akun Anda belum aktif, ditangguhkan, atau ditolak. Silakan hubungi Admin KEPK."];
                } else {
                    $userData = [
                        'id' => $user['id'],
                        'name' => $user['name'],
                        'email' => $user['email'],
                        'role' => $user['role'],
                        'institution' => $user['institution'],
                        'status' => $user['status'],
                        'identityNumber' => $user['identity_number'],
                        'phone' => $user['phone'],
                        'joinedAt' => $user['joined_at']
                    ];
                    $response = ["status" => "success", "data" => $userData];
                }
            } else {
                $response = ["status" => "error", "message" => "Username (NIM/NIP/NIK) atau password salah."];
            }
            break;

        case 'register':
            // UPDATE: Cek duplikasi Email ATAU Identity Number
            // Trim data input
            $emailClean = trim($payload['email']);
            $idnClean = isset($payload['identityNumber']) ? trim($payload['identityNumber']) : '';

            $check = $conn->prepare("SELECT id FROM users WHERE email = :email OR identity_number = :idn");
            $check->bindParam(':email', $emailClean);
            $check->bindParam(':idn', $idnClean);
            $check->execute();
            
            if ($check->rowCount() > 0) {
                $response = ["status" => "error", "message" => "Email atau NIDN/NIK/NIM tersebut sudah terdaftar."];
            } else {
                $id = 'USR-' . mt_rand(10000, 99999);
                // Insert user baru dengan status 'pending'
                $stmt = $conn->prepare("INSERT INTO users (id, name, email, role, institution, status, password, identity_number, phone, joined_at) VALUES (:id, :name, :email, :role, :inst, 'pending', :pass, :idn, :phone, NOW())");
                
                $stmt->execute([
                    ':id' => $id,
                    ':name' => $payload['name'],
                    ':email' => $emailClean,
                    ':role' => $payload['role'],
                    ':inst' => $payload['institution'],
                    ':pass' => $payload['password'], 
                    ':idn' => $idnClean,
                    ':phone' => isset($payload['phone']) ? $payload['phone'] : ''
                ]);
                $response = ["status" => "success", "message" => "Registrasi berhasil. Tunggu validasi Admin."];
            }
            break;

        case 'forgot_password':
            // UPDATED LOGIC: Catat ke Admin Logs (Priority) -> Kirim Email (Secondary)
            $idn = trim($payload['identityNumber']);
            
            // 1. Cek User exist by ID Number
            $stmt = $conn->prepare("SELECT name, email, identity_number, institution FROM users WHERE identity_number = :idn LIMIT 1");
            $stmt->execute([':idn' => $idn]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                // A. Catat ke ADMIN LOGS agar admin bisa melihat di dashboard (Solusi jika email gagal)
                // Kita gunakan nama 'SYSTEM' agar admin tahu ini notifikasi sistem
                $logDesc = "PERMINTAAN RESET PASSWORD: " . $user['name'] . " (" . $user['identity_number'] . ")";
                $logStmt = $conn->prepare("INSERT INTO admin_logs (admin_name, action_type, description) VALUES ('SYSTEM', 'RESET_REQUEST', :desc)");
                $logStmt->execute([':desc' => $logDesc]);

                // B. Kirim Email Notifikasi ke ADMIN (Dibungkus Try-Catch agar tidak error jika gagal)
                $emailNote = "";
                try {
                    $mailer = new SimpleSMTP(
                        $smtp_config['host'],
                        $smtp_config['username'], 
                        $smtp_config['password'], 
                        $smtp_config['port'], 
                        $smtp_config['secure']
                    );
                    
                    $subject = "Permintaan Reset Password - User: " . $user['name'];
                    
                    $body = "
                        <h3>Permintaan Reset Password</h3>
                        <p>Seorang pengguna meminta reset password:</p>
                        <ul>
                           <li><strong>Nama:</strong> {$user['name']}</li>
                           <li><strong>NIP/NIM/NIK:</strong> {$user['identity_number']}</li>
                           <li><strong>Institusi:</strong> {$user['institution']}</li>
                           <li><strong>Email User:</strong> {$user['email']}</li>
                        </ul>
                        <p>Silakan login ke Dashboard Admin > Manajemen User untuk mereset password pengguna ini ke Default (Sama dengan NIM/NIK).</p>
                    ";

                    $mailer->send($smtp_config['username'], $subject, $body, "Sistem SIM-KEPK");
                } catch (Exception $e) {
                    // Jika email gagal, biarkan saja (silent fail), karena sudah tercatat di Log
                    // Tambahkan catatan kecil di response (opsional)
                    $emailNote = " (Notifikasi email tertunda, namun data sudah masuk ke sistem).";
                }

                // RESPONSE MESSAGE UPDATED
                $response = ["status" => "success", "message" => "Permintaan diterima. Admin akan mengirimkan reset password. Harap konfirmasi ke Admin." . $emailNote];

            } else {
                $response = ["status" => "error", "message" => "Nomor Identitas (NIM/NIP/NIK) tidak ditemukan."];
            }
            break;
            
        case 'adminResetUserPassword':
            // Fitur Admin Reset Manual (Ganti Password Langsung)
            if (!isset($payload['userId']) || !isset($payload['newPassword'])) {
                throw new Exception("Parameter tidak lengkap.");
            }
            
            $stmt = $conn->prepare("UPDATE users SET password = :pass WHERE id = :id");
            $stmt->execute([':pass' => $payload['newPassword'], ':id' => $payload['userId']]);
            
            $response = ["status" => "success", "message" => "Password pengguna berhasil direset secara manual."];
            break;
            
        case 'adminResetToDefault':
            // Logic Baru: Reset Password ke Username (Identity Number)
            if (!isset($payload['userId'])) {
                throw new Exception("User ID required.");
            }
            
            // 1. Ambil data user
            $stmt = $conn->prepare("SELECT name, email, phone, identity_number FROM users WHERE id = :id");
            $stmt->execute([':id' => $payload['userId']]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if(!$user) throw new Exception("User tidak ditemukan.");
            
            $newPassword = $user['identity_number']; // Default = NIM/NIK
            
            // 2. Update Password
            $upd = $conn->prepare("UPDATE users SET password = :pass WHERE id = :id");
            $upd->execute([':pass' => $newPassword, ':id' => $payload['userId']]);
            
            // 3. Email Notification to User
            $emailStatus = "";
            try {
                $mailer = new SimpleSMTP(
                    $smtp_config['host'],
                    $smtp_config['username'], 
                    $smtp_config['password'], 
                    $smtp_config['port'], 
                    $smtp_config['secure']
                );
                
                $subject = "Password Akun SIM KEPK Direset";
                $body = "
                    <h3>Reset Password Berhasil</h3>
                    <p>Halo <strong>{$user['name']}</strong>,</p>
                    <p>Password akun SIM KEPK Anda telah direset oleh Administrator menjadi default (sesuai NIM/NIK/NIP Anda).</p>
                    <p><strong>Password Baru:</strong> {$newPassword}</p>
                    <p>Silakan login dan segera ganti password Anda melalui menu Profil.</p>
                ";
                
                $mailer->send($user['email'], $subject, $body, "Sistem SIM-KEPK");
                $emailStatus = "Email notifikasi terkirim.";
            } catch (Exception $e) {
                $emailStatus = "Gagal kirim email ke user.";
            }
            
            // 4. Prepare WhatsApp Link
            $waPhone = formatPhoneForWA($user['phone']);
            $waMessage = "Halo {$user['name']}, Admin SIM KEPK telah mereset password akun Anda menjadi default (sama dengan NIM/NIK):\n\n*{$newPassword}*\n\nSilakan login dan segera ganti password Anda.";
            $waLink = "https://wa.me/{$waPhone}?text=" . urlencode($waMessage);
            
            // 5. Log
            $logStmt = $conn->prepare("INSERT INTO admin_logs (admin_name, action_type, description) VALUES (:an, 'RESET_DEFAULT', :desc)");
            $logStmt->execute([
                ':an' => isset($payload['adminName']) ? $payload['adminName'] : 'Admin',
                ':desc' => "Reset password ke default (NIM/NIK) untuk user: " . $user['name']
            ]);
            
            $response = [
                "status" => "success", 
                "message" => "Password direset ke NIM/NIK. " . $emailStatus,
                "whatsapp_link" => $waLink,
                "new_password" => $newPassword
            ];
            break;

        case 'reset_password':
            // LEGACY / TOKEN BASED (Masih disimpan jika Admin ingin kirim link manual via email pribadi)
            $token = $payload['token'];
            $newPassword = $payload['newPassword'];

            $stmt = $conn->prepare("SELECT email FROM password_resets WHERE token = :token AND expires_at > NOW() LIMIT 1");
            $stmt->execute([':token' => $token]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($row) {
                $email = $row['email'];
                $upd = $conn->prepare("UPDATE users SET password = :pass WHERE email = :email");
                $upd->execute([':pass' => $newPassword, ':email' => $email]);

                $del = $conn->prepare("DELETE FROM password_resets WHERE email = :email");
                $del->execute([':email' => $email]);

                $response = ["status" => "success", "message" => "Password berhasil diubah."];
            } else {
                $response = ["status" => "error", "message" => "Link reset tidak valid atau sudah kadaluarsa."];
            }
            break;
            
        case 'updateAdminProfile':
            if (!isset($payload['id']) || !isset($payload['currentPassword'])) {
                throw new Exception("Parameter tidak lengkap.");
            }

            // 1. Verifikasi Password Lama
            $stmt = $conn->prepare("SELECT password FROM users WHERE id = :id");
            $stmt->execute([':id' => $payload['id']]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user || $user['password'] !== $payload['currentPassword']) {
                $response = ["status" => "error", "message" => "Password saat ini salah. Perubahan ditolak."];
            } else {
                // 2. Cek apakah email baru sudah dipakai orang lain (selain diri sendiri)
                if (isset($payload['email'])) {
                    $check = $conn->prepare("SELECT id FROM users WHERE email = :email AND id != :id");
                    $check->execute([':email' => $payload['email'], ':id' => $payload['id']]);
                    if ($check->rowCount() > 0) {
                        throw new Exception("Username/Email baru sudah digunakan oleh akun lain.");
                    }
                }

                // 3. Update Data
                $newName = isset($payload['name']) ? $payload['name'] : null;
                $newEmail = isset($payload['email']) ? $payload['email'] : null;
                $newPassword = isset($payload['newPassword']) && !empty($payload['newPassword']) ? $payload['newPassword'] : $payload['currentPassword'];

                // Query Update
                $sql = "UPDATE users SET password = :pass";
                $params = [':pass' => $newPassword, ':id' => $payload['id']];

                if ($newEmail) {
                    $sql .= ", email = :email";
                    $params[':email'] = $newEmail;
                }

                if ($newName) {
                    $sql .= ", name = :name";
                    $params[':name'] = $newName;
                }

                $sql .= " WHERE id = :id";
                
                $updateStmt = $conn->prepare($sql);
                $updateStmt->execute($params);

                $response = ["status" => "success", "message" => "Profil Admin berhasil diperbarui."];
            }
            break;

        // ==========================================
        // 2. SUBMISSIONS (PENGAJUAN ETIK)
        // ==========================================
        case 'createSubmission':
            // A. Proses Upload Dokumen Fisik
            $processedDocs = [];
            if (isset($payload['documents']) && is_array($payload['documents'])) {
                foreach ($payload['documents'] as $doc) {
                    if (isset($doc['content']) && !empty($doc['content'])) {
                        // Upload file base64 ke folder uploads/
                        $url = uploadBase64File($doc['content'], $doc['name'], $uploadDir, $baseUrl);
                        
                        $doc['url'] = $url ? $url : '';
                        unset($doc['content']); 
                    }
                    $processedDocs[] = $doc;
                }
            }

            // B. Simpan Data Metadata ke Database
            $stmt = $conn->prepare("INSERT INTO submissions (id, title, researcher_name, researcher_email, institution, description, status, documents, self_assessment, submission_date, team_members) VALUES (:id, :title, :r_name, :r_email, :inst, :desc, :status, :docs, :sa, :date, :team)");
            
            $stmt->execute([
                ':id' => $payload['id'],
                ':title' => $payload['title'],
                ':r_name' => $payload['researcherName'],
                ':r_email' => $payload['researcherEmail'],
                ':inst' => $payload['institution'],
                ':desc' => $payload['description'],
                ':status' => $payload['status'],
                ':docs' => json_encode($processedDocs),
                ':sa' => json_encode($payload['selfAssessment']),
                ':date' => $payload['submissionDate'],
                ':team' => json_encode(isset($payload['teamMembers']) ? $payload['teamMembers'] : [])
            ]);

            $response = ["status" => "success", "documents" => $processedDocs];
            break;

        case 'editSubmission':
            if (!isset($payload['id'])) throw new Exception("ID required for editing");

            $processedDocs = [];
            if (isset($payload['documents']) && is_array($payload['documents'])) {
                foreach ($payload['documents'] as $doc) {
                    if (isset($doc['content']) && !empty($doc['content'])) {
                        $url = uploadBase64File($doc['content'], $doc['name'], $uploadDir, $baseUrl);
                        $doc['url'] = $url ? $url : '';
                        unset($doc['content']);
                    }
                    $processedDocs[] = $doc;
                }
            }

            $sql = "UPDATE submissions SET 
                    title = :title, 
                    researcher_name = :r_name, 
                    institution = :inst, 
                    description = :desc, 
                    documents = :docs, 
                    self_assessment = :sa,
                    team_members = :team
                    WHERE id = :id";
            
            $stmt = $conn->prepare($sql);
            $stmt->execute([
                ':title' => $payload['title'],
                ':r_name' => $payload['researcherName'],
                ':inst' => $payload['institution'],
                ':desc' => $payload['description'],
                ':docs' => json_encode($processedDocs),
                ':sa' => json_encode($payload['selfAssessment']),
                ':team' => json_encode(isset($payload['teamMembers']) ? $payload['teamMembers'] : []),
                ':id' => $payload['id']
            ]);

            if (isset($payload['status']) && $payload['status'] === 'submitted') {
                 $stmtStatus = $conn->prepare("UPDATE submissions SET status = 'submitted' WHERE id = :id");
                 $stmtStatus->execute([':id' => $payload['id']]);
            }

            $response = ["status" => "success", "documents" => $processedDocs];
            break;

        case 'getSubmissions':
            $sql = "SELECT * FROM submissions";
            $params = [];

            if (isset($payload['role']) && $payload['role'] === 'researcher') {
                $sql .= " WHERE researcher_email = :email";
                $params[':email'] = $payload['email'];
            }
            
            $sql .= " ORDER BY submission_date DESC";
            
            $stmt = $conn->prepare($sql);
            $stmt->execute($params);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $data = [];
            foreach ($rows as $row) {
                $documents = json_decode($row['documents'] ?? '[]', true) ?: [];
                $selfAssessment = json_decode($row['self_assessment'] ?? '[]', true) ?: [];
                $progressReports = json_decode($row['progress_reports'] ?? '[]', true) ?: [];
                $teamMembers = json_decode($row['team_members'] ?? '[]', true) ?: [];

                $data[] = [
                    'id' => $row['id'],
                    'title' => $row['title'],
                    'researcherName' => $row['researcher_name'],
                    'researcherEmail' => $row['researcher_email'],
                    'institution' => $row['institution'],
                    'description' => $row['description'],
                    'status' => $row['status'],
                    'documents' => $documents,
                    'selfAssessment' => $selfAssessment,
                    'submissionDate' => $row['submission_date'],
                    'approvalDate' => $row['approval_date'],
                    'feedback' => $row['feedback'],
                    'progressReports' => $progressReports,
                    'certificateUrl' => isset($row['certificate_url']) ? $row['certificate_url'] : null,
                    'teamMembers' => $teamMembers
                ];
            }
            $response = ["status" => "success", "data" => $data];
            break;

        case 'updateSubmissionStatus':
            $sql = "UPDATE submissions SET status = :status";
            $params = [':status' => $payload['status'], ':id' => $payload['id']];
            
            if (isset($payload['feedback'])) {
                $sql .= ", feedback = :feedback";
                $params[':feedback'] = $payload['feedback'];
            }
            
            if (isset($payload['approvalDate'])) {
                $sql .= ", approval_date = :adate";
                $params[':adate'] = $payload['approvalDate'];
            }
            
            $sql .= " WHERE id = :id";
            $stmt = $conn->prepare($sql);
            $stmt->execute($params);
            $response = ["status" => "success"];
            break;

        case 'uploadCertificate':
            if (isset($payload['content']) && !empty($payload['content'])) {
                $url = uploadBase64File($payload['content'], $payload['name'], $uploadDir, $baseUrl);
                
                if ($url) {
                    $stmt = $conn->prepare("UPDATE submissions SET certificate_url = :url WHERE id = :id");
                    $stmt->execute([':url' => $url, ':id' => $payload['id']]);
                    $response = ["status" => "success", "url" => $url];
                } else {
                    $response = ["status" => "error", "message" => "Gagal menulis file ke server."];
                }
            } else {
                $response = ["status" => "error", "message" => "Konten file kosong."];
            }
            break;

        // ==========================================
        // 3. USER MANAGEMENT (ADMIN)
        // ==========================================
        case 'getUsers':
            $stmt = $conn->prepare("SELECT * FROM users ORDER BY joined_at DESC");
            $stmt->execute();
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $data = [];
            foreach ($rows as $row) {
                $data[] = [
                    'id' => $row['id'],
                    'name' => $row['name'],
                    'email' => $row['email'],
                    'role' => $row['role'],
                    'institution' => $row['institution'],
                    'status' => $row['status'],
                    'identityNumber' => $row['identity_number'],
                    'phone' => $row['phone'],
                    'joinedAt' => $row['joined_at']
                ];
            }
            $response = ["status" => "success", "data" => $data];
            break;

        case 'updateUserStatus':
            $stmt = $conn->prepare("UPDATE users SET status = :status WHERE id = :id");
            $stmt->execute([':status' => $payload['status'], ':id' => $payload['id']]);
            $response = ["status" => "success"];
            break;

        case 'deleteUser':
            // 1. Get user name first for logging
            $stmtGet = $conn->prepare("SELECT name FROM users WHERE id = :id");
            $stmtGet->execute([':id' => $payload['id']]);
            $user = $stmtGet->fetch(PDO::FETCH_ASSOC);
            $deletedUserName = $user ? $user['name'] : 'Unknown User';

            // 2. Delete
            $stmt = $conn->prepare("DELETE FROM users WHERE id = :id");
            $stmt->execute([':id' => $payload['id']]);

            // 3. Log Action (Jika parameter adminName dikirim)
            if (isset($payload['adminName'])) {
                $desc = "Menghapus user: " . $deletedUserName . " (ID: " . $payload['id'] . ")";
                $logStmt = $conn->prepare("INSERT INTO admin_logs (admin_name, action_type, description) VALUES (:an, 'DELETE_USER', :desc)");
                $logStmt->execute([
                    ':an' => $payload['adminName'],
                    ':desc' => $desc
                ]);
            }

            $response = ["status" => "success"];
            break;
            
        case 'getAdminLogs':
            // Ambil 50 log terakhir
            $stmt = $conn->prepare("SELECT * FROM admin_logs ORDER BY timestamp DESC LIMIT 50");
            $stmt->execute();
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $response = ["status" => "success", "data" => $data];
            break;
            
        // NEW ENDPOINT: Hitung request reset password dalam 3 hari terakhir
        case 'getResetRequestCount':
            $stmt = $conn->prepare("SELECT COUNT(*) as count FROM admin_logs WHERE action_type = 'RESET_REQUEST' AND timestamp >= DATE_SUB(NOW(), INTERVAL 3 DAY)");
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $count = $result ? (int)$result['count'] : 0;
            $response = ["status" => "success", "count" => $count];
            break;
            
        // ==========================================
        // 4. CONFIG MANAGEMENT
        // ==========================================
        case 'getConfig':
            $stmt = $conn->prepare("SELECT * FROM config");
            $stmt->execute();
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $data = [];
            foreach ($rows as $row) {
                $data[] = [
                    'id' => $row['id'],
                    'label' => $row['label'],
                    'isRequired' => (bool)$row['is_required']
                ];
            }
            $response = ["status" => "success", "data" => $data];
            break;

        case 'addConfig':
            $stmt = $conn->prepare("INSERT INTO config (id, label, is_required) VALUES (:id, :label, :req)");
            $stmt->execute([
                ':id' => $payload['id'],
                ':label' => $payload['label'],
                ':req' => $payload['isRequired'] ? 1 : 0
            ]);
            $response = ["status" => "success"];
            break;

        case 'deleteConfig':
            $stmt = $conn->prepare("DELETE FROM config WHERE id = :id");
            $stmt->execute([':id' => $payload['id']]);
            $response = ["status" => "success"];
            break;
        
        // ==========================================
        // 5. QUESTIONNAIRE MANAGEMENT (NEW)
        // ==========================================
        
        // Mengambil daftar pertanyaan (Public & Admin)
        case 'getQuestions':
            $sql = "SELECT * FROM questionnaire_questions";
            // Jika untuk publik, hanya ambil yang aktif
            if (isset($payload['public']) && $payload['public'] == true) {
                $sql .= " WHERE is_active = 1";
            }
            $stmt = $conn->prepare($sql);
            $stmt->execute();
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $response = ["status" => "success", "data" => $data];
            break;

        // Admin: Menambah Pertanyaan
        case 'addQuestion':
            if (!isset($payload['text']) || !isset($payload['type'])) {
                throw new Exception("Data pertanyaan tidak lengkap.");
            }
            $stmt = $conn->prepare("INSERT INTO questionnaire_questions (question_text, question_type, is_active) VALUES (:txt, :type, 1)");
            $stmt->execute([':txt' => $payload['text'], ':type' => $payload['type']]);
            $response = ["status" => "success", "message" => "Pertanyaan ditambahkan"];
            break;

        // Admin: Hapus Pertanyaan
        case 'deleteQuestion':
            if (!isset($payload['id'])) throw new Exception("ID required");
            $stmt = $conn->prepare("DELETE FROM questionnaire_questions WHERE id = :id");
            $stmt->execute([':id' => $payload['id']]);
            $response = ["status" => "success"];
            break;

        // Public: Submit Jawaban
        case 'submitQuestionnaire':
            $stmt = $conn->prepare("INSERT INTO questionnaire_responses (respondent_name, respondent_role, answers_json, created_at) VALUES (:name, :role, :ans, NOW())");
            $stmt->execute([
                ':name' => $payload['name'],
                ':role' => $payload['role'],
                ':ans'  => json_encode($payload['answers'])
            ]);
            $response = ["status" => "success", "message" => "Terima kasih atas partisipasi Anda!"];
            break;
            
        // Admin: Get Results
        case 'getQuestionnaireResults':
            $stmt = $conn->prepare("SELECT * FROM questionnaire_responses ORDER BY created_at DESC LIMIT 100");
            $stmt->execute();
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Decode JSON answers for easier frontend handling
            $cleanData = [];
            foreach($data as $row) {
                $row['answers'] = json_decode($row['answers_json'], true);
                unset($row['answers_json']);
                $cleanData[] = $row;
            }
            
            $response = ["status" => "success", "data" => $cleanData];
            break;

        default:
            $response = ["status" => "error", "message" => "Unknown action"];
    }
} catch (Exception $e) {
    $response = ["status" => "error", "message" => $e->getMessage()];
}

echo json_encode($response);
?>