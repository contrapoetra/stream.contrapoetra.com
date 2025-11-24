<?php
/**
 * Comment Controller
 * Handles comment CRUD operations
 */

require_once '../config/Database.php';
require_once '../config/Config.php';
require_once '../helpers/Response.php';
require_once '../middleware/Auth.php';

class CommentController {
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    public function create($video_id) {
        $user_id = Auth::check();
        $data = json_decode(file_get_contents("php://input"));

        if (!empty($data->comment_text)) {
            // Validate video exists
            $videoQuery = "SELECT video_id FROM Videos WHERE video_id = :video_id";
            $videoStmt = $this->db->prepare($videoQuery);
            $videoStmt->bindParam(':video_id', $video_id);
            $videoStmt->execute();

            if ($videoStmt->rowCount() === 0) {
                Response::notFound('Video not found');
            }

            $query = "INSERT INTO Comments (video_id, user_id, comment_text) VALUES (:video_id, :user_id, :comment_text)";
            $stmt = $this->db->prepare($query);

            $stmt->bindParam(':video_id', $video_id);
            $stmt->bindParam(':user_id', $user_id);
            $stmt->bindParam(':comment_text', $data->comment_text);

            if ($stmt->execute()) {
                $comment_id = $this->db->lastInsertId();

                // Get the created comment with user info
                $comment = $this->getCommentById($comment_id);

                Response::created($comment, 'Comment added successfully');
            } else {
                Response::error('Failed to add comment');
            }
        } else {
            Response::badRequest('Comment text is required');
        }
    }

    public function getByVideo($video_id) {
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        $offset = ($page - 1) * $limit;

        $query = "SELECT c.*, u.username, u.join_date
                  FROM Comments c
                  JOIN Users u ON c.user_id = u.user_id
                  WHERE c.video_id = :video_id
                  ORDER BY c.comment_date DESC
                  LIMIT :limit OFFSET :offset";

        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':video_id', $video_id);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Format date
        foreach ($comments as &$comment) {
            $comment['comment_date'] = $this->formatCommentDate($comment['comment_date']);
            $comment['user_avatar'] = "https://api.dicebear.com/7.x/avataaars/svg?seed=" . urlencode($comment['username']);
        }

        Response::success($comments);
    }

    public function update($comment_id) {
        $user_id = Auth::check();
        $data = json_decode(file_get_contents("php://input"));

        if (!empty($data->comment_text)) {
            // Check if comment belongs to current user
            $checkQuery = "SELECT user_id FROM Comments WHERE comment_id = :comment_id";
            $checkStmt = $this->db->prepare($checkQuery);
            $checkStmt->bindParam(':comment_id', $comment_id);
            $checkStmt->execute();

            $comment = $checkStmt->fetch(PDO::FETCH_ASSOC);

            if (!$comment || $comment['user_id'] != $user_id) {
                Response::forbidden('You can only edit your own comments');
            }

            $query = "UPDATE Comments SET comment_text = :comment_text WHERE comment_id = :comment_id";
            $stmt = $this->db->prepare($query);

            $stmt->bindParam(':comment_text', $data->comment_text);
            $stmt->bindParam(':comment_id', $comment_id);

            if ($stmt->execute()) {
                Response::success(null, 'Comment updated successfully');
            } else {
                Response::error('Failed to update comment');
            }
        } else {
            Response::badRequest('Comment text is required');
        }
    }

    public function delete($comment_id) {
        $user_id = Auth::check();

        // Check if comment belongs to current user
        $checkQuery = "SELECT user_id FROM Comments WHERE comment_id = :comment_id";
        $checkStmt = $this->db->prepare($checkQuery);
        $checkStmt->bindParam(':comment_id', $comment_id);
        $checkStmt->execute();

        $comment = $checkStmt->fetch(PDO::FETCH_ASSOC);

        if (!$comment || $comment['user_id'] != $user_id) {
            Response::forbidden('You can only delete your own comments');
        }

        $query = "DELETE FROM Comments WHERE comment_id = :comment_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':comment_id', $comment_id);

        if ($stmt->execute()) {
            Response::success(null, 'Comment deleted successfully');
        } else {
            Response::error('Failed to delete comment');
        }
    }

    private function getCommentById($comment_id) {
        $query = "SELECT c.*, u.username
                  FROM Comments c
                  JOIN Users u ON c.user_id = u.user_id
                  WHERE c.comment_id = :comment_id";

        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':comment_id', $comment_id);
        $stmt->execute();

        $comment = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($comment) {
            $comment['comment_date'] = $this->formatCommentDate($comment['comment_date']);
            $comment['user_avatar'] = "https://api.dicebear.com/7.x/avataaars/svg?seed=" . urlencode($comment['username']);
        }

        return $comment;
    }

    private function formatCommentDate($date) {
        $timestamp = strtotime($date);
        $now = time();
        $diff = $now - $timestamp;

        if ($diff < 60) {
            return 'just now';
        } elseif ($diff < 3600) {
            $minutes = floor($diff / 60);
            return $minutes . ' minute' . ($minutes > 1 ? 's' : '') . ' ago';
        } elseif ($diff < 86400) {
            $hours = floor($diff / 3600);
            return $hours . ' hour' . ($hours > 1 ? 's' : '') . ' ago';
        } elseif ($diff < 604800) {
            $days = floor($diff / 86400);
            return $days . ' day' . ($days > 1 ? 's' : '') . ' ago';
        } else {
            return date('M j, Y', $timestamp);
        }
    }
}
?>