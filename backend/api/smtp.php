<?php
/**
 * Simple SMTP Mailer Class
 * Alternatif ringan pengganti PHPMailer untuk penggunaan di cPanel tanpa Composer.
 */
class SimpleSMTP {
    private $host;
    private $port;
    private $username;
    private $password;
    private $timeout = 30;

    public function __construct($host, $username, $password, $port = 465, $secure = 'ssl') {
        $this->host = ($secure === 'ssl' ? 'ssl://' : '') . $host;
        $this->port = $port;
        $this->username = $username;
        $this->password = $password;
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
        // Gunakan stream_socket_client dengan opsi bypass SSL verify (self-signed) untuk localhost
        $context = stream_context_create([
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            ]
        ]);

        $socket = stream_socket_client(
            $this->host . ":" . $this->port,
            $errno,
            $errstr,
            $this->timeout,
            STREAM_CLIENT_CONNECT,
            $context
        );

        if (!$socket) throw new Exception("Gagal connect ke SMTP: $errstr ($errno)");

        $this->getResponse($socket); // Server ready

        fputs($socket, "EHLO " . $_SERVER['SERVER_NAME'] . "\r\n");
        $this->getResponse($socket);

        fputs($socket, "AUTH LOGIN\r\n");
        $this->getResponse($socket);

        fputs($socket, base64_encode($this->username) . "\r\n");
        $this->getResponse($socket);

        fputs($socket, base64_encode($this->password) . "\r\n");
        $resp = $this->getResponse($socket);
        if (substr($resp, 0, 3) != '235') throw new Exception("Auth Failed: $resp");

        fputs($socket, "MAIL FROM: <" . $this->username . ">\r\n");
        $this->getResponse($socket);

        fputs($socket, "RCPT TO: <$to>\r\n");
        $this->getResponse($socket);

        fputs($socket, "DATA\r\n");
        $this->getResponse($socket);

        // --- HEADERS LENGKAP & OPTIMASI DELIVERABILITY ---
        
        // Ambil domain dari email pengirim untuk Message-ID yang valid
        $domainParts = explode('@', $this->username);
        $domain = count($domainParts) > 1 ? $domainParts[1] : $_SERVER['SERVER_NAME'];
        
        $headers  = "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $headers .= "Content-Transfer-Encoding: 8bit\r\n"; // 8bit lebih aman untuk HTML
        $headers .= "Date: " . date("r") . "\r\n";
        
        // Encode Subject & From
        $encodedSubject = "=?UTF-8?B?" . base64_encode($subject) . "?=";
        $encodedFromName = "=?UTF-8?B?" . base64_encode($fromName) . "?=";
        
        $headers .= "From: $encodedFromName <" . $this->username . ">\r\n";
        $headers .= "Sender: <" . $this->username . ">\r\n"; // Header Sender membantu di beberapa filter
        
        // PENTING: Header To jangan pakai kurung siku <> di sini untuk kompatibilitas max
        $headers .= "To: $to\r\n";
        
        $headers .= "Subject: $encodedSubject\r\n";
        $headers .= "Reply-To: <" . $this->username . ">\r\n";
        $headers .= "Return-Path: <" . $this->username . ">\r\n";
        
        // Message-ID Valid
        $messageId = md5(uniqid(time())) . "@" . $domain;
        $headers .= "Message-ID: <$messageId>\r\n";
        
        $headers .= "X-Mailer: SIM-KEPK Mailer\r\n";
        $headers .= "X-Priority: 3\r\n"; 
        $headers .= "Organization: Komisi Etik Penelitian Kesehatan\r\n";

        fputs($socket, "$headers\r\n$body\r\n.\r\n");
        $resp = $this->getResponse($socket);

        fputs($socket, "QUIT\r\n");
        fclose($socket);

        if (substr($resp, 0, 3) != '250') throw new Exception("Gagal mengirim email (Server menolak data): $resp");
        
        return true;
    }
}
?>