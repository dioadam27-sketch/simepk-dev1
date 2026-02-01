<?php
/**
 * Simple SMTP Mailer Class
 * Mendukung STARTTLS untuk Port 587 (Kompatibel dengan cPanel Localhost)
 */
class SimpleSMTP {
    private $host;
    private $port;
    private $username;
    private $password;
    private $timeout = 30;
    private $secure;

    public function __construct($host, $username, $password, $port = 587, $secure = 'tls') {
        $this->host = $host;
        $this->port = $port;
        $this->username = $username;
        $this->password = $password;
        $this->secure = $secure;
    }

    private function getResponse($socket) {
        $response = "";
        while (($line = fgets($socket, 515)) !== false) {
            $response .= $line;
            if (substr($line, 3, 1) == " ") break;
        }
        return $response;
    }

    public function send($to, $subject, $body, $fromName) {
        // 1. Connect ke TCP (belum dienkripsi)
        $socket = stream_socket_client(
            "tcp://" . $this->host . ":" . $this->port,
            $errno,
            $errstr,
            $this->timeout
        );

        if (!$socket) throw new Exception("Gagal connect ke SMTP: $errstr ($errno)");
        $this->getResponse($socket); // Server ready

        // 2. Hello
        fputs($socket, "EHLO " . $_SERVER['SERVER_NAME'] . "\r\n");
        $this->getResponse($socket);

        // 3. STARTTLS Logic (Jika menggunakan port 587/tls)
        if ($this->secure === 'tls') {
            fputs($socket, "STARTTLS\r\n");
            $resp = $this->getResponse($socket);
            if (substr($resp, 0, 3) != '220') {
                throw new Exception("Gagal STARTTLS: $resp");
            }

            // Enable Crypto
            $crypto_method = STREAM_CRYPTO_METHOD_TLS_CLIENT;
            if (defined('STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT')) {
                $crypto_method |= STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT;
            }
            if (defined('STREAM_CRYPTO_METHOD_TLSv1_1_CLIENT')) {
                $crypto_method |= STREAM_CRYPTO_METHOD_TLSv1_1_CLIENT;
            }

            if (!stream_socket_enable_crypto($socket, true, $crypto_method)) {
                throw new Exception("Gagal mengaktifkan enkripsi SSL/TLS.");
            }

            // Kirim EHLO lagi setelah secure channel terbentuk
            fputs($socket, "EHLO " . $_SERVER['SERVER_NAME'] . "\r\n");
            $this->getResponse($socket);
        }

        // 4. Auth
        fputs($socket, "AUTH LOGIN\r\n");
        $this->getResponse($socket);

        fputs($socket, base64_encode($this->username) . "\r\n");
        $this->getResponse($socket);

        fputs($socket, base64_encode($this->password) . "\r\n");
        $resp = $this->getResponse($socket);
        if (substr($resp, 0, 3) != '235') throw new Exception("Auth Failed. Periksa email & password config. ($resp)");

        // 5. Send Headers & Body
        fputs($socket, "MAIL FROM: <" . $this->username . ">\r\n");
        $this->getResponse($socket);

        fputs($socket, "RCPT TO: <$to>\r\n");
        $this->getResponse($socket);

        fputs($socket, "DATA\r\n");
        $this->getResponse($socket);

        // --- HEADERS ---
        $domainParts = explode('@', $this->username);
        $domain = count($domainParts) > 1 ? $domainParts[1] : $_SERVER['SERVER_NAME'];
        
        $headers  = "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $headers .= "Content-Transfer-Encoding: 8bit\r\n";
        $headers .= "Date: " . date("r") . "\r\n";
        
        $encodedSubject = "=?UTF-8?B?" . base64_encode($subject) . "?=";
        $encodedFromName = "=?UTF-8?B?" . base64_encode($fromName) . "?=";
        
        $headers .= "From: $encodedFromName <" . $this->username . ">\r\n";
        $headers .= "Sender: <" . $this->username . ">\r\n";
        $headers .= "To: $to\r\n";
        $headers .= "Subject: $encodedSubject\r\n";
        $headers .= "Reply-To: <" . $this->username . ">\r\n";
        $headers .= "Return-Path: <" . $this->username . ">\r\n";
        $headers .= "Message-ID: <" . md5(uniqid(time())) . "@" . $domain . ">\r\n";
        $headers .= "X-Mailer: SIM-KEPK Mailer\r\n";

        fputs($socket, "$headers\r\n$body\r\n.\r\n");
        $resp = $this->getResponse($socket);

        fputs($socket, "QUIT\r\n");
        fclose($socket);

        if (substr($resp, 0, 3) != '250') throw new Exception("Gagal mengirim email (Server menolak): $resp");
        
        return true;
    }
}
?>