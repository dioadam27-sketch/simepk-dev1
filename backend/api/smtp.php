
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
    private $debug = false;

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
        $socket = fsockopen($this->host, $this->port, $errno, $errstr, $this->timeout);
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

        $headers  = "MIME-Version: 1.0\r\n";
        $headers .= "Content-type: text/html; charset=utf-8\r\n";
        $headers .= "From: $fromName <" . $this->username . ">\r\n";
        $headers .= "To: $to\r\n";
        $headers .= "Subject: $subject\r\n";

        fputs($socket, "$headers\r\n$body\r\n.\r\n");
        $resp = $this->getResponse($socket);

        fputs($socket, "QUIT\r\n");
        fclose($socket);

        if (substr($resp, 0, 3) != '250') throw new Exception("Gagal mengirim email: $resp");
        
        return true;
    }
}
?>
