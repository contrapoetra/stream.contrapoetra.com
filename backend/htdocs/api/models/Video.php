<?php
class Video {
    private $conn;
    private $table_name = "videos";

    public $video_id;
    public $title;
    public $description;
    public $file_url;
    public $thumbnail_url;
    public $user_id;
    public $created_at;
    public $duration_seconds;
    public $view_count;
    public $file_size;
    public $mime_type;
    public $status;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                SET title=:title, description=:description, file_url=:file_url,
                    thumbnail_url=:thumbnail_url, user_id=:user_id, duration_seconds=:duration_seconds,
                    file_size=:file_size, mime_type=:mime_type, status=:status";

        $stmt = $this->conn->prepare($query);

        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->file_url = htmlspecialchars(strip_tags($this->file_url));
        $this->thumbnail_url = htmlspecialchars(strip_tags($this->thumbnail_url));

        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":file_url", $this->file_url);
        $stmt->bindParam(":thumbnail_url", $this->thumbnail_url);
        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":duration_seconds", $this->duration_seconds);
        $stmt->bindParam(":file_size", $this->file_size);
        $stmt->bindParam(":mime_type", $this->mime_type);
        $stmt->bindParam(":status", $this->status);

        if($stmt->execute()) {
            $this->video_id = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }

    public function read() {
        $query = "SELECT v.*, u.username, u.channel_name
                FROM " . $this->table_name . " v
                LEFT JOIN users u ON v.user_id = u.user_id
                WHERE v.video_id = ?
                LIMIT 0,1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->video_id);
        $stmt->execute();

        return $stmt;
    }

    public function readAll($from_record_num = 0, $records_per_page = 10) {
        $query = "SELECT v.*, u.username, u.channel_name
                FROM " . $this->table_name . " v
                LEFT JOIN users u ON v.user_id = u.user_id
                WHERE v.status = 'ready'
                ORDER BY v.created_at DESC
                LIMIT ?, ?";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $from_record_num, PDO::PARAM_INT);
        $stmt->bindParam(2, $records_per_page, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt;
    }

    public function countAll() {
        $query = "SELECT COUNT(*) as total_rows FROM " . $this->table_name . " WHERE status = 'ready'";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row['total_rows'];
    }

    public function updateViewCount() {
        $query = "UPDATE " . $this->table_name . "
                SET view_count = view_count + 1
                WHERE video_id = ?";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->video_id);

        return $stmt->execute();
    }
}
?>
