<?php
/**
 * Subscription Controller
 * Handles subscription functionality
 */

require_once '../config/Database.php';
require_once '../config/Config.php';
require_once '../helpers/Response.php';
require_once '../middleware/Auth.php';

class SubscriptionController {
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    public function subscribe($channel_id) {
        $user_id = Auth::check();

        // Can't subscribe to yourself
        if ($user_id == $channel_id) {
            Response::badRequest('You cannot subscribe to yourself');
        }

        // Validate channel exists
        $channelQuery = "SELECT user_id, username FROM Users WHERE user_id = :channel_id";
        $channelStmt = $this->db->prepare($channelQuery);
        $channelStmt->bindParam(':channel_id', $channel_id);
        $channelStmt->execute();

        if ($channelStmt->rowCount() === 0) {
            Response::notFound('Channel not found');
        }

        // Check if already subscribed
        $checkQuery = "SELECT subscription_id FROM Subscriptions WHERE subscriber_id = :subscriber_id AND channel_id = :channel_id";
        $checkStmt = $this->db->prepare($checkQuery);
        $checkStmt->bindParam(':subscriber_id', $user_id);
        $checkStmt->bindParam(':channel_id', $channel_id);
        $checkStmt->execute();

        if ($checkStmt->rowCount() > 0) {
            Response::badRequest('Already subscribed to this channel');
        }

        // Add subscription
        $query = "INSERT INTO Subscriptions (subscriber_id, channel_id) VALUES (:subscriber_id, :channel_id)";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':subscriber_id', $user_id);
        $stmt->bindParam(':channel_id', $channel_id);

        if ($stmt->execute()) {
            $channel = $channelStmt->fetch(PDO::FETCH_ASSOC);
            $subscriber_count = $this->getSubscriberCount($channel_id);

            Response::success([
                'channel_id' => $channel_id,
                'channel_name' => $channel['username'],
                'subscriber_count' => $subscriber_count,
                'is_subscribed' => true
            ], 'Subscribed successfully');
        } else {
            Response::error('Failed to subscribe');
        }
    }

    public function unsubscribe($channel_id) {
        $user_id = Auth::check();

        // Check if subscription exists
        $checkQuery = "SELECT subscription_id FROM Subscriptions WHERE subscriber_id = :subscriber_id AND channel_id = :channel_id";
        $checkStmt = $this->db->prepare($checkQuery);
        $checkStmt->bindParam(':subscriber_id', $user_id);
        $checkStmt->bindParam(':channel_id', $channel_id);
        $checkStmt->execute();

        if ($checkStmt->rowCount() === 0) {
            Response::badRequest('Not subscribed to this channel');
        }

        // Remove subscription
        $query = "DELETE FROM Subscriptions WHERE subscriber_id = :subscriber_id AND channel_id = :channel_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':subscriber_id', $user_id);
        $stmt->bindParam(':channel_id', $channel_id);

        if ($stmt->execute()) {
            $subscriber_count = $this->getSubscriberCount($channel_id);

            Response::success([
                'channel_id' => $channel_id,
                'subscriber_count' => $subscriber_count,
                'is_subscribed' => false
            ], 'Unsubscribed successfully');
        } else {
            Response::error('Failed to unsubscribe');
        }
    }

    public function getStatus($channel_id) {
        $user_id = Auth::check();

        // Get subscription status
        $statusQuery = "SELECT COUNT(*) as is_subscribed FROM Subscriptions WHERE subscriber_id = :subscriber_id AND channel_id = :channel_id";
        $statusStmt = $this->db->prepare($statusQuery);
        $statusStmt->bindParam(':subscriber_id', $user_id);
        $statusStmt->bindParam(':channel_id', $channel_id);
        $statusStmt->execute();

        $is_subscribed = $statusStmt->fetch(PDO::FETCH_ASSOC)['is_subscribed'] > 0;
        $subscriber_count = $this->getSubscriberCount($channel_id);

        Response::success([
            'subscriber_count' => $subscriber_count,
            'is_subscribed' => $is_subscribed
        ]);
    }

    public function getSubscriptions($user_id = null) {
        if ($user_id === null) {
            $user_id = Auth::check();
        }

        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 12;
        $offset = ($page - 1) * $limit;

        $query = "SELECT u.user_id, u.username, u.email, u.join_date,
                         (SELECT COUNT(*) FROM Videos WHERE user_id = u.user_id) as video_count
                  FROM Subscriptions s
                  JOIN Users u ON s.channel_id = u.user_id
                  WHERE s.subscriber_id = :user_id
                  ORDER BY s.subscribe_date DESC
                  LIMIT :limit OFFSET :offset";

        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        $channels = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($channels as &$channel) {
            $channel['subscriber_count'] = $this->getSubscriberCount($channel['user_id']);
            $channel['join_date'] = date('M j, Y', strtotime($channel['join_date']));
            $channel['is_subscribed'] = true;
        }

        Response::success($channels);
    }

    public function getSubscribers($channel_id) {
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 12;
        $offset = ($page - 1) * $limit;

        $query = "SELECT u.user_id, u.username, u.email, u.join_date,
                        s.subscribe_date
                  FROM Subscriptions s
                  JOIN Users u ON s.subscriber_id = u.user_id
                  WHERE s.channel_id = :channel_id
                  ORDER BY s.subscribe_date DESC
                  LIMIT :limit OFFSET :offset";

        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':channel_id', $channel_id);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        $subscribers = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($subscribers as &$subscriber) {
            $subscriber['subscribe_date'] = date('M j, Y', strtotime($subscriber['subscribe_date']));
            $subscriber['join_date'] = date('M j, Y', strtotime($subscriber['join_date']));
        }

        Response::success($subscribers);
    }

    private function getSubscriberCount($channel_id) {
        $query = "SELECT COUNT(*) as count FROM Subscriptions WHERE channel_id = :channel_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':channel_id', $channel_id);
        $stmt->execute();

        return (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
    }
}
?>