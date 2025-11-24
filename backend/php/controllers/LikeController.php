<?php
/**
 * Like Controller
 * Handles like/unlike functionality
 */

require_once '../config/Database.php';
require_once '../config/Config.php';
require_once '../helpers/Response.php';
require_once '../middleware/Auth.php';

class LikeController {
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    public function like($video_id) {
        $user_id = Auth::check();

        // Validate video exists
        $videoQuery = "SELECT video_id FROM Videos WHERE video_id = :video_id";
        $videoStmt = $this->db->prepare($videoQuery);
        $videoStmt->bindParam(':video_id', $video_id);
        $videoStmt->execute();

        if ($videoStmt->rowCount() === 0) {
            Response::notFound('Video not found');
        }

        // Check if already liked
        $checkQuery = "SELECT like_id FROM Likes WHERE video_id = :video_id AND user_id = :user_id";
        $checkStmt = $this->db->prepare($checkQuery);
        $checkStmt->bindParam(':video_id', $video_id);
        $checkStmt->bindParam(':user_id', $user_id);
        $checkStmt->execute();

        if ($checkStmt->rowCount() > 0) {
            Response::badRequest('Video already liked');
        }

        // Add like
        $query = "INSERT INTO Likes (video_id, user_id) VALUES (:video_id, :user_id)";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':video_id', $video_id);
        $stmt->bindParam(':user_id', $user_id);

        if ($stmt->execute()) {
            $like_count = $this->getLikeCount($video_id);
            Response::success([
                'like_count' => $like_count,
                'is_liked' => true
            ], 'Video liked successfully');
        } else {
            Response::error('Failed to like video');
        }
    }

    public function unlike($video_id) {
        $user_id = Auth::check();

        // Check if like exists
        $checkQuery = "SELECT like_id FROM Likes WHERE video_id = :video_id AND user_id = :user_id";
        $checkStmt = $this->db->prepare($checkQuery);
        $checkStmt->bindParam(':video_id', $video_id);
        $checkStmt->bindParam(':user_id', $user_id);
        $checkStmt->execute();

        if ($checkStmt->rowCount() === 0) {
            Response::badRequest('Video not liked yet');
        }

        // Remove like
        $query = "DELETE FROM Likes WHERE video_id = :video_id AND user_id = :user_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':video_id', $video_id);
        $stmt->bindParam(':user_id', $user_id);

        if ($stmt->execute()) {
            $like_count = $this->getLikeCount($video_id);
            Response::success([
                'like_count' => $like_count,
                'is_liked' => false
            ], 'Video unliked successfully');
        } else {
            Response::error('Failed to unlike video');
        }
    }

    public function getStatus($video_id) {
        $user_id = Auth::check();

        // Get like status
        $statusQuery = "SELECT COUNT(*) as is_liked FROM Likes WHERE video_id = :video_id AND user_id = :user_id";
        $statusStmt = $this->db->prepare($statusQuery);
        $statusStmt->bindParam(':video_id', $video_id);
        $statusStmt->bindParam(':user_id', $user_id);
        $statusStmt->execute();

        $is_liked = $statusStmt->fetch(PDO::FETCH_ASSOC)['is_liked'] > 0;
        $like_count = $this->getLikeCount($video_id);

        Response::success([
            'like_count' => $like_count,
            'is_liked' => $is_liked
        ]);
    }

    public function getLikesByUser($user_id) {
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 12;
        $offset = ($page - 1) * $limit;

        $query = "SELECT v.*, u.username,
                         (SELECT COUNT(*) FROM Comments WHERE video_id = v.video_id) as comment_count
                  FROM Likes l
                  JOIN Videos v ON l.video_id = v.video_id
                  JOIN Users u ON v.user_id = u.user_id
                  WHERE l.user_id = :user_id
                  ORDER BY l.like_date DESC
                  LIMIT :limit OFFSET :offset";

        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        $videos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($videos as &$video) {
            $video['upload_date'] = date('M j, Y', strtotime($video['upload_date']));
            $video['thumbnail_path'] = str_replace('/videos/', '/thumbnails/', $video['file_path']);
            $video['thumbnail_path'] = str_replace('.mp4', '.jpg', $video['thumbnail_path']);
        }

        Response::success($videos);
    }

    private function getLikeCount($video_id) {
        $query = "SELECT COUNT(*) as count FROM Likes WHERE video_id = :video_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':video_id', $video_id);
        $stmt->execute();

        return (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
    }
}
?>