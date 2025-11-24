<?php
/**
 * API Response Helper
 */

class Response {
    public static function success($data = null, $message = 'Success') {
        http_response_code(200);
        echo json_encode([
            'status' => 'success',
            'message' => $message,
            'data' => $data
        ]);
        exit;
    }

    public static function created($data = null, $message = 'Created successfully') {
        http_response_code(201);
        echo json_encode([
            'status' => 'success',
            'message' => $message,
            'data' => $data
        ]);
        exit;
    }

    public static function error($message = 'Internal Server Error', $code = 500) {
        http_response_code($code);
        echo json_encode([
            'status' => 'error',
            'message' => $message,
            'data' => null
        ]);
        exit;
    }

    public static function badRequest($message = 'Bad Request') {
        self::error($message, 400);
    }

    public static function unauthorized($message = 'Unauthorized') {
        self::error($message, 401);
    }

    public static function forbidden($message = 'Forbidden') {
        self::error($message, 403);
    }

    public static function notFound($message = 'Not Found') {
        self::error($message, 404);
    }

    public static function methodNotAllowed($message = 'Method Not Allowed') {
        self::error($message, 405);
    }
}
?>