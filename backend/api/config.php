<?php
// Tentukan Domain Frontend (React) Anda di sini untuk keamanan CORS
// Saat development bisa menggunakan *
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle Preflight Request (Untuk React/Axios)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ==========================================
// KONFIGURASI DATABASE CPANEL
// ==========================================
$host       = "localhost";
$db_name    = "ppk2ipe_simepk";       // Nama Database
$username   = "ppk2ipe_simepk01";     // User Database
$password   = "@Dioadam27";           // Password Database

// ==========================================
// KONFIGURASI SMTP EMAIL (CPANEL)
// ==========================================
// Menggunakan Port 587 (Submission) yang lebih ramah firewall
$smtp_config = [
    'host'      => 'localhost',            // Host Internal
    'username'  => 'admin@ppk2ipe.unair.ac.id', 
    'password'  => '@Dioadam27',           
    'port'      => 587,                    // Ubah ke 587 (STARTTLS)
    'from_name' => 'Admin SIM-KEPK',       
    'secure'    => 'tls'                   // Mode TLS
];

// URL Frontend (Untuk link reset password)
$frontend_url = "https://ppk2ipe.unair.ac.id"; 

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $conn->exec("set names utf8");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $exception) {
    echo json_encode([
        "status" => "error", 
        "message" => "Koneksi Database Gagal: " . $exception->getMessage()
    ]);
    exit();
}
?>