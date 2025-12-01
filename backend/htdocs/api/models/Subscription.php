<?php
class Subscription {
    private $conn;
    private $table_name = "subscriptions";

    public $subscription_id;
    public $subscriber_id;
    public $channel_id;
    public $created_at;
    public $notification_preferences;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        // Check if already subscribed
        if($this->isSubscribed()) {
            return false; // Already subscribed
        }

        $query = "INSERT INTO " . $this->table_name . "
                SET subscriber_id=:subscriber_id, channel_id=:channel_id,
                    notification_preferences=:notification_preferences";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":subscriber_id", $this->subscriber_id);
        $stmt->bindParam(":channel_id", $this->channel_id);
        $stmt->bindParam(":notification_preferences", $this->notification_preferences);

        if($stmt->execute()) {
            $this->subscription_id = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }

    public function delete() {
        $query = "DELETE FROM " . $this->table_name . "
                WHERE subscriber_id = ? AND channel_id = ?";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->subscriber_id);
        $stmt->bindParam(2, $this->channel_id);

        return $stmt->execute();
    }

    public function isSubscribed() {
        $query = "SELECT subscription_id
                FROM " . $this->table_name . "
                WHERE subscriber_id = ? AND channel_id = ?
                LIMIT 0,1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->subscriber_id);
        $stmt->bindParam(2, $this->channel_id);
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }

    public function getSubscriberCount($channel_id) {
        $query = "SELECT COUNT(*) as count
                FROM " . $this->table_name . "
                WHERE channel_id = ?";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $channel_id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row['count'];
    }

    public function getSubscriptions($subscriber_id) {
        $query = "SELECT s.*, u.username, u.channel_name, u.profile_picture_url
                FROM " . $this->table_name . " s
                LEFT JOIN users u ON s.channel_id = u.user_id
                WHERE s.subscriber_id = ?
                ORDER BY s.created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $subscriber_id);
        $stmt->execute();

        return $stmt;
    }

    public function getSubscribers($channel_id) {
        $query = "SELECT s.*, u.username, u.profile_picture_url
                FROM " . $this->table_name . " s
                LEFT JOIN users u ON s.subscriber_id = u.user_id
                WHERE s.channel_id = ?
                ORDER BY s.created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $channel_id);
        $stmt->execute();

        return $stmt;
    }
}
?>
