<?php
/**
 * Video Controller
 * Handles video upload, listing, and CRUD operations
 */

require_once '../config/Database.php';
require_once '../config/Config.php';
require_once '../helpers/Response.php';
require_once '../middleware/Auth.php';

class VideoController {
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    public function upload() {
        $user_id = Auth::check();

        if (!isset($_FILES['video']) || !isset($_POST['title'])) {
            Response::badRequest('Video file and title are required');
        }

        $video = $_FILES['video'];
        $title = $_POST['title'];
        $description = $_POST['description'] ?? '';

        // Validate video file
        if ($video['error'] !== UPLOAD_ERR_OK) {
            Response::badRequest('Video upload failed');
        }

        if ($video['size'] > MAX_VIDEO_SIZE) {
            Response::badRequest('Video file too large');
        }

        if (!in_array($video['type'], ALLOWED_VIDEO_TYPES)) {
            Response::badRequest('Invalid video format');
        }

        // Generate unique filename
        $file_extension = pathinfo($video['name'], PATHINFO_EXTENSION);
        $unique_filename = uniqid('video_') . '.' . $file_extension;
        $upload_path = UPLOAD_DIR . $unique_filename;

        // Create upload directory if it doesn't exist
        if (!file_exists(UPLOAD_DIR)) {
            mkdir(UPLOAD_DIR, 0777, true);
        }

        // Move uploaded file
        if (move_uploaded_file($video['tmp_name'], $upload_path)) {
            // Insert video record into database
            $query = "INSERT INTO Videos (user_id, title, description, file_path) VALUES (:user_id, :title, :description, :file_path)";
            $stmt = $this->db->prepare($query);

            $relative_path = '/videos/' . $unique_filename;
            $stmt->bindParam(':user_id', $user_id);
            $stmt->bindParam(':title', $title);
            $stmt->bindParam(':description', $description);
            $stmt->bindParam(':file_path', $relative_path);

            if ($stmt->execute()) {
                $video_id = $this->db->lastInsertId();
                Response::created([
                    'video_id' => $video_id,
                    'title' => $title,
                    'description' => $description,
                    'file_path' => $relative_path,
                    'upload_date' => date('Y-m-d')
                ], 'Video uploaded successfully');
            } else {
                // Remove uploaded file if database insert fails
                unlink($upload_path);
                Response::error('Failed to save video information');
            }
        } else {
            Response::error('Failed to upload video file');
        }
    }

    public function getAll() {
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 12;
        $offset = ($page - 1) * $limit;

        $query = "SELECT v.*, u.username,
                         (SELECT COUNT(*) FROM Likes WHERE video_id = v.video_id) as like_count,
                         (SELECT COUNT(*) FROM Comments WHERE video_id = v.video_id) as comment_count
                  FROM Videos v
                  JOIN Users u ON v.user_id = u.user_id
                  ORDER BY v.upload_date DESC
                  LIMIT :limit OFFSET :offset";

        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        $videos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Format date and add thumbnail path
        foreach ($videos as &$video) {
            $video['upload_date'] = date('M j, Y', strtotime($video['upload_date']));
            $video['thumbnail_path'] = str_replace('/videos/', '/thumbnails/', $video['file_path']);
            $video['thumbnail_path'] = str_replace('.mp4', '.jpg', $video['thumbnail_path']);
        }

        Response::success($videos);
    }

    public function getById($video_id) {
        $query = "SELECT v.*, u.username,
                         (SELECT COUNT(*) FROM Likes WHERE video_id = v.video_id) as like_count,
                         (SELECT COUNT(*) FROM Comments WHERE video_id = v.video_id) as comment_count
                  FROM Videos v
                  JOIN Users u ON v.user_id = u.user_id
                  WHERE v.video_id = :video_id";

        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':video_id', $video_id);
        $stmt->execute();

        $video = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($video) {
            // Increment view count
            $this->incrementViews($video_id);

            $video['upload_date'] = date('M j, Y', strtotime($video['upload_date']));
            $video['thumbnail_path'] = str_replace('/videos/', '/thumbnails/', $video['file_path']);
            $video['thumbnail_path'] = str_replace('.mp4', '.jpg', $video['thumbnail_path']);

            Response::success($video);
        } else {
            Response::notFound('Video not found');
        }
    }

    public function getByUser($user_id) {
        $query = "SELECT v.*,
                         (SELECT COUNT(*) FROM Likes WHERE video_id = v.video_id) as like_count,
                         (SELECT COUNT(*) FROM Comments WHERE video_id = v.video_id) as comment_count
                  FROM Videos v
                  WHERE v.user_id = :user_id
                  ORDER BY v.upload_date DESC";

        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();

        $videos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($videos as &$video) {
            $video['upload_date'] = date('M j, Y', strtotime($video['upload_date']));
        }

        Response::success($videos);
    }

    public function search() {
        $search_term = isset($_GET['q']) ? trim($_GET['q']) : '';

        if (empty($search_term)) {
            Response::badRequest('Search term is required');
        }

        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 12;
        $offset = ($page - 1) * $limit;

        $query = "SELECT v.*, u.username,
                         (SELECT COUNT(*) FROM Likes WHERE video_id = v.video_id) as like_count,
                         (SELECT COUNT(*) FROM Comments WHERE video_id = v.video_id) as comment_count
                  FROM Videos v
                  JOIN Users u ON v.user_id = u.user_id
                  WHERE v.title LIKE :search_term OR v.description LIKE :search_term
                  ORDER BY v.upload_date DESC
                  LIMIT :limit OFFSET :offset";

        $search_pattern = "%{$search_term}%";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':search_term', $search_pattern);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        $videos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($videos as &$video) {
            $video['upload_date'] = date('M j, Y', strtotime($video['upload_date']));
        }

        Response::success($videos);
    }

    public function update($video_id) {
        $user_id = Auth::check();

        $data = json_decode(file_get_contents("php://input"));

        // Check if video belongs to current user
        $checkQuery = "SELECT user_id FROM Videos WHERE video_id = :video_id";
        $checkStmt = $this->db->prepare($checkQuery);
        $checkStmt->bindParam(':video_id', $video_id);
        $checkStmt->execute();

        $video = $checkStmt->fetch(PDO::FETCH_ASSOC);

        if (!$video || $video['user_id'] != $user_id) {
            Response::forbidden('You can only edit your own videos');
        }

        $query = "UPDATE Videos SET title = :title, description = :description WHERE video_id = :video_id";
        $stmt = $this->db->prepare($query);

        $stmt->bindParam(':title', $data->title);
        $stmt->bindParam(':description', $data->description);
        $stmt->bindParam(':video_id', $video_id);

        if ($stmt->execute()) {
            Response::success(null, 'Video updated successfully');
        } else {
            Response::error('Failed to update video');
        }
    }

    public function delete($video_id) {
        $user_id = Auth::check();

        // Check if video belongs to current user
        $checkQuery = "SELECT user_id, file_path FROM Videos WHERE video_id = :video_id";
        $checkStmt = $this->db->prepare($checkQuery);
        $checkStmt->bindParam(':video_id', $video_id);
        $checkStmt->execute();

        $video = $checkStmt->fetch(PDO::FETCH_ASSOC);

        if (!$video || $video['user_id'] != $user_id) {
            Response::forbidden('You can only delete your own videos');
        }

        // Delete video file
        $file_path = UPLOAD_DIR . basename($video['file_path']);
        if (file_exists($file_path)) {
            unlink($file_path);
        }

        // Delete from database (cascades will handle likes and comments)
        $query = "DELETE FROM Videos WHERE video_id = :video_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':video_id', $video_id);

        if ($stmt->execute()) {
            Response::success(null, 'Video deleted successfully');
        } else {
            Response::error('Failed to delete video');
        }
    }

    private function incrementViews($video_id) {
        $query = "UPDATE Videos SET views = views + 1 WHERE video_id = :video_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':video_id', $video_id);
        $stmt->execute();
    }
}
?>