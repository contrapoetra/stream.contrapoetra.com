<?php
/**
 * Authentication Middleware
 */

class Auth {
    public static function check() {
        if (!isset($_SESSION['user_id'])) {
            Response::unauthorized('You must be logged in to access this resource');
        }
        return $_SESSION['user_id'];
    }

    public static function user() {
        if (!isset($_SESSION['user_id'])) {
            return null;
        }

        $database = new Database();
        $db = $database->getConnection();

        $query = "SELECT user_id, username, email, join_date FROM Users WHERE user_id = :user_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $_SESSION['user_id']);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public static function login($user_id) {
        $_SESSION['user_id'] = $user_id;
        $_SESSION['last_activity'] = time();
    }

    public static function logout() {
        session_destroy();
    }

    public static function requireLogin() {
        self::check();
    }
}
?>