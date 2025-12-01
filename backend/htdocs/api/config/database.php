<?php
class Database {
    private $host = "localhost";
    private $db_name = "streaming";
    private $username = "root";
    private $password = "i.hate.sequels";
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->exec("set names utf8");
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            error_log("Connection error: " . $exception->getMessage());
            // Don't echo in production, just log
        }
        return $this->conn;
    }
}
?>
