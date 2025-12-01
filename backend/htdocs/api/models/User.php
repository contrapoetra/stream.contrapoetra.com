<?php
class User {
    private $conn;
    private $table_name = "users";

    public $user_id;
    public $username;
    public $email;
    public $password_hash;
    public $created_at;
    public $channel_name;
    public $profile_picture_url;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                SET username=:username, email=:email, password_hash=:password_hash,
                    channel_name=:channel_name, profile_picture_url=:profile_picture_url";

        $stmt = $this->conn->prepare($query);

        $this->username = htmlspecialchars(strip_tags($this->username));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->password_hash = password_hash($this->password_hash, PASSWORD_DEFAULT);
        $this->channel_name = htmlspecialchars(strip_tags($this->channel_name));
        $this->profile_picture_url = htmlspecialchars(strip_tags($this->profile_picture_url));

        $stmt->bindParam(":username", $this->username);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":password_hash", $this->password_hash);
        $stmt->bindParam(":channel_name", $this->channel_name);
        $stmt->bindParam(":profile_picture_url", $this->profile_picture_url);

        if($stmt->execute()) {
            $this->user_id = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }

    public function emailExists() {
        $query = "SELECT user_id, username, password_hash, channel_name
                FROM " . $this->table_name . "
                WHERE email = ?
                LIMIT 0,1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->email);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $this->user_id = $row['user_id'];
            $this->username = $row['username'];
            $this->password_hash = $row['password_hash'];
            $this->channel_name = $row['channel_name'];
            return true;
        }
        return false;
    }

    public function read() {
        $query = "SELECT user_id, username, email, created_at, channel_name, profile_picture_url
                FROM " . $this->table_name . "
                WHERE user_id = ?
                LIMIT 0,1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->user_id);
        $stmt->execute();

        return $stmt;
    }
}
?>
