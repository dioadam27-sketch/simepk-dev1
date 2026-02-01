
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

// Konfigurasi Folder Upload
// URL: https://ppk2ipe.unair.ac.id/upload/
// Path relative dari api/index.php ke folder upload adalah ../upload/
$uploadDir = '../upload/';

// Base URL eksplisit sesuai permintaan user
$baseUrl = 'https://ppk2ipe.unair.ac.id/upload/';

// --- HELPER FUNCTIONS ---

/**
 * Fungsi untuk menyimpan file dari string Base64 ke folder server
 */
function uploadBase64File($base64, $filename, $uploadDir, $baseUrl) {
    // Buat folder jika belum ada
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    // Bersihkan nama file dari karakter aneh untuk keamanan
    $filename = preg_replace("/[^a-zA-Z0-9\._-]/", "", $filename);
    $uniqueName = uniqid() . '_' . $filename;
    $filePath = $uploadDir . $uniqueName;
    
    // Decode Base64 & Save
    $data = base64_decode($base64);
    if (file_put_contents($filePath, $data)) {
        return $baseUrl . $uniqueName;
    }
    return null;
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
            // Cek user berdasarkan email & password
            $stmt = $conn->prepare("SELECT * FROM users WHERE email = :email AND password = :password LIMIT 1");
            $stmt->bindParam(':email', $payload['email']);
            $stmt->bindParam(':password', $payload['password']); // Note: Untuk produksi disarankan hash password
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
                $response = ["status" => "error", "message" => "Email atau password salah."];
            }
            break;

        case 'register':
            // Cek duplikasi email
            $check = $conn->prepare("SELECT id FROM users WHERE email = :email");
            $check->bindParam(':email', $payload['email']);
            $check->execute();
            if ($check->rowCount() > 0) {
                $response = ["status" => "error", "message" => "Email tersebut sudah terdaftar."];
            } else {
                $id = 'USR-' . mt_rand(10000, 99999);
                // Insert user baru dengan status 'pending'
                $stmt = $conn->prepare("INSERT INTO users (id, name, email, role, institution, status, password, identity_number, phone, joined_at) VALUES (:id, :name, :email, :role, :inst, 'pending', :pass, :idn, :phone, NOW())");
                
                $stmt->execute([
                    ':id' => $id,
                    ':name' => $payload['name'],
                    ':email' => $payload['email'],
                    ':role' => $payload['role'],
                    ':inst' => $payload['institution'],
                    ':pass' => $payload['password'], 
                    ':idn' => isset($payload['identityNumber']) ? $payload['identityNumber'] : '',
                    ':phone' => isset($payload['phone']) ? $payload['phone'] : ''
                ]);
                $response = ["status" => "success", "message" => "Registrasi berhasil. Tunggu validasi Admin."];
            }
            break;

        case 'forgot_password':
            // 1. Cek Email
            $email = $payload['email'];
            $stmt = $conn->prepare("SELECT name FROM users WHERE email = :email LIMIT 1");
            $stmt->execute([':email' => $email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                // 2. Generate Token
                $token = bin2hex(random_bytes(32));
                $expires = date("Y-m-d H:i:s", strtotime("+1 hour")); // Expired 1 jam

                // 3. Simpan ke Database
                // Hapus token lama user ini jika ada
                $del = $conn->prepare("DELETE FROM password_resets WHERE email = :email");
                $del->execute([':email' => $email]);

                $ins = $conn->prepare("INSERT INTO password_resets (email, token, expires_at) VALUES (:email, :token, :exp)");
                $ins->execute([':email' => $email, ':token' => $token, ':exp' => $expires]);

                // 4. Kirim Email via SMTP
                try {
                    $mailer = new SimpleSMTP(
                        $smtp_config['host'],
                        $smtp_config['username'], 
                        $smtp_config['password'], 
                        $smtp_config['port'], 
                        $smtp_config['secure']
                    );

                    $link = $frontend_url . "?view=reset&token=" . $token;
                    
                    $subject = "Reset Password - SIM KEPK";
                    $body = "
                        <h3>Halo, {$user['name']}</h3>
                        <p>Kami menerima permintaan untuk mereset password akun SIM KEPK Anda.</p>
                        <p>Silakan klik link berikut untuk membuat password baru:</p>
                        <p><a href='$link' style='background:#003B73;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;'>Reset Password</a></p>
                        <p><small>Link ini berlaku selama 1 jam.</small></p>
                        <p>Jika Anda tidak merasa meminta reset password, abaikan email ini.</p>
                    ";

                    $mailer->send($email, $subject, $body, $smtp_config['from_name']);
                    
                    $response = ["status" => "success", "message" => "Link reset password telah dikirim ke email Anda. Cek Folder Inbox/Spam."];

                } catch (Exception $e) {
                    $response = ["status" => "error", "message" => "Gagal mengirim email: " . $e->getMessage()];
                }

            } else {
                // Jangan beritahu jika email tidak ditemukan untuk keamanan (atau beritahu generic)
                $response = ["status" => "error", "message" => "Email tidak terdaftar dalam sistem."];
            }
            break;

        case 'reset_password':
            $token = $payload['token'];
            $newPassword = $payload['newPassword'];

            // 1. Validasi Token
            $stmt = $conn->prepare("SELECT email FROM password_resets WHERE token = :token AND expires_at > NOW() LIMIT 1");
            $stmt->execute([':token' => $token]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($row) {
                // 2. Update Password User
                $email = $row['email'];
                $upd = $conn->prepare("UPDATE users SET password = :pass WHERE email = :email");
                $upd->execute([':pass' => $newPassword, ':email' => $email]);

                // 3. Hapus Token
                $del = $conn->prepare("DELETE FROM password_resets WHERE email = :email");
                $del->execute([':email' => $email]);

                $response = ["status" => "success", "message" => "Password berhasil diubah. Silakan login dengan password baru."];
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
                $newEmail = isset($payload['email']) ? $payload['email'] : null;
                $newPassword = isset($payload['newPassword']) && !empty($payload['newPassword']) ? $payload['newPassword'] : $payload['currentPassword'];

                // Query Update
                $sql = "UPDATE users SET password = :pass";
                $params = [':pass' => $newPassword, ':id' => $payload['id']];

                if ($newEmail) {
                    $sql .= ", email = :email";
                    $params[':email'] = $newEmail;
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
                        unset($doc['content']); // Hapus string base64 agar database tidak berat
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
            // Mirip create, tapi UPDATE. ID harus ada.
            if (!isset($payload['id'])) throw new Exception("ID required for editing");

            $processedDocs = [];
            // Proses dokumen (campuran antara file baru yg ada content base64 dan file lama yg cuma URL)
            if (isset($payload['documents']) && is_array($payload['documents'])) {
                foreach ($payload['documents'] as $doc) {
                    if (isset($doc['content']) && !empty($doc['content'])) {
                        // File Baru
                        $url = uploadBase64File($doc['content'], $doc['name'], $uploadDir, $baseUrl);
                        $doc['url'] = $url ? $url : '';
                        unset($doc['content']);
                    }
                    // File lama sudah punya URL, biarkan saja
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

            // Jika status 'revision_needed', kembalikan ke 'submitted' atau 'under_review' jika diinginkan?
            // Biasanya user yang edit revisi akan mengubah status kembali ke 'submitted' agar admin tau
            if (isset($payload['status']) && $payload['status'] === 'submitted') {
                 $stmtStatus = $conn->prepare("UPDATE submissions SET status = 'submitted' WHERE id = :id");
                 $stmtStatus->execute([':id' => $payload['id']]);
            }

            $response = ["status" => "success", "documents" => $processedDocs];
            break;

        case 'getSubmissions':
            $sql = "SELECT * FROM submissions";
            $params = [];

            // Jika role Researcher, filter hanya milik dia sendiri
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
                // Decode JSON fields dengan penanganan error (jika null, default ke empty array)
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
            // Update Status, Feedback, atau Approval Date
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
                // Upload File
                $url = uploadBase64File($payload['content'], $payload['name'], $uploadDir, $baseUrl);
                
                if ($url) {
                    // Update Database
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
            $stmt = $conn->prepare("DELETE FROM users WHERE id = :id");
            $stmt->execute([':id' => $payload['id']]);
            $response = ["status" => "success"];
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

        default:
            $response = ["status" => "error", "message" => "Unknown action"];
    }
} catch (Exception $e) {
    $response = ["status" => "error", "message" => $e->getMessage()];
}

echo json_encode($response);
?>
