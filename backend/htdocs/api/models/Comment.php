<?php
class Comment {
    private $conn;
    private $table_name = "comments";

    public $comment_id;
    public $comment_text;
    public $user_id;
    public $video_id;
    public $created_at;
    public $like_count;
    public $parent_comment_id;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                SET comment_text=:comment_text, user_id=:user_id, video_id=:video_id,
                    parent_comment_id=:parent_comment_id";

        $stmt = $this->conn->prepare($query);

        $this->comment_text = htmlspecialchars(strip_tags($this->comment_text));

        $stmt->bindParam(":comment_text", $this->comment_text);
        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":video_id", $this->video_id);
        $stmt->bindParam(":parent_comment_id", $this->parent_comment_id);

        if($stmt->execute()) {
            $this->comment_id = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }

    public function readByVideo() {
        $query = "SELECT c.*, u.username
                FROM " . $this->table_name . " c
                LEFT JOIN users u ON c.user_id = u.user_id
                WHERE c.video_id = ?
                ORDER BY c.created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->video_id);
        $stmt->execute();

        return $stmt;
    }
}
?>
