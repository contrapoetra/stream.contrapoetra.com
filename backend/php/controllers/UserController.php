<?php
/**
 * User Controller
 * Handles user registration, login, and profile management
 */

require_once '../config/Database.php';
require_once '../config/Config.php';
require_once '../helpers/Response.php';
require_once '../middleware/Auth.php';

class UserController {
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    public function register() {
        $data = json_decode(file_get_contents("php://input"));

        if (!empty($data->username) && !empty($data->email) && !empty($data->password)) {
            // Validate email
            if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
                Response::badRequest('Invalid email format');
            }

            // Check if user already exists
            $checkQuery = "SELECT user_id FROM Users WHERE email = :email OR username = :username";
            $checkStmt = $this->db->prepare($checkQuery);
            $checkStmt->bindParam(':email', $data->email);
            $checkStmt->bindParam(':username', $data->username);
            $checkStmt->execute();

            if ($checkStmt->rowCount() > 0) {
                Response::badRequest('Email or username already exists');
            }

            // Hash password
            $hashed_password = password_hash($data->password, PASSWORD_DEFAULT);

            // Insert new user
            $query = "INSERT INTO Users (username, email, password) VALUES (:username, :email, :password)";
            $stmt = $this->db->prepare($query);

            $stmt->bindParam(':username', $data->username);
            $stmt->bindParam(':email', $data->email);
            $stmt->bindParam(':password', $hashed_password);

            if ($stmt->execute()) {
                $user_id = $this->db->lastInsertId();
                Auth::login($user_id);

                Response::created([
                    'user_id' => $user_id,
                    'username' => $data->username,
                    'email' => $data->email
                ], 'User registered successfully');
            } else {
                Response::error('Registration failed');
            }
        } else {
            Response::badRequest('Missing required fields: username, email, password');
        }
    }

    public function login() {
        $data = json_decode(file_get_contents("php://input"));

        if (!empty($data->email) && !empty($data->password)) {
            $query = "SELECT user_id, username, email, password FROM Users WHERE email = :email";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':email', $data->email);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                $user = $stmt->fetch(PDO::FETCH_ASSOC);

                if (password_verify($data->password, $user['password'])) {
                    Auth::login($user['user_id']);

                    unset($user['password']); // Remove password from response

                    Response::success([
                        'user' => $user
                    ], 'Login successful');
                } else {
                    Response::unauthorized('Invalid email or password');
                }
            } else {
                Response::unauthorized('Invalid email or password');
            }
        } else {
            Response::badRequest('Missing required fields: email, password');
        }
    }

    public function logout() {
        Auth::logout();
        Response::success(null, 'Logout successful');
    }

    public function profile() {
        $user = Auth::user();
        if (!$user) {
            Response::unauthorized('User not logged in');
        }

        // Get user's videos count
        $videoQuery = "SELECT COUNT(*) as video_count FROM Videos WHERE user_id = :user_id";
        $videoStmt = $this->db->prepare($videoQuery);
        $videoStmt->bindParam(':user_id', $user['user_id']);
        $videoStmt->execute();
        $video_count = $videoStmt->fetch(PDO::FETCH_ASSOC)['video_count'];

        // Get subscribers count
        $subscriberQuery = "SELECT COUNT(*) as subscriber_count FROM Subscriptions WHERE channel_id = :user_id";
        $subscriberStmt = $this->db->prepare($subscriberQuery);
        $subscriberStmt->bindParam(':user_id', $user['user_id']);
        $subscriberStmt->execute();
        $subscriber_count = $subscriberStmt->fetch(PDO::FETCH_ASSOC)['subscriber_count'];

        $user['video_count'] = $video_count;
        $user['subscriber_count'] = $subscriber_count;

        Response::success($user);
    }

    public function getCurrentUser() {
        $user = Auth::user();
        if ($user) {
            Response::success($user);
        } else {
            Response::unauthorized('Not logged in');
        }
    }
}
?>