<?php
function json_response($data, $status = 200) {
    header_remove();
    header("Content-Type: application/json; charset=utf-8");
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function get_json_input() {
    $input = json_decode(file_get_contents('php://input'), true);
    return $input ?: [];
}

function require_auth_user_id() {
    require_once __DIR__ . '/auth.php';
    $token = get_bearer_token();
    if (!$token) {
        json_response(['error' => 'Authorization header required'], 401);
    }
    $decoded = decode_jwt($token);
    if (!$decoded || !isset($decoded->sub)) {
        json_response(['error' => 'Invalid or expired token'], 401);
    }
    return intval($decoded->sub);
}
