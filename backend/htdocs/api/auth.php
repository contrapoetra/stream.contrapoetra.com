<?php
// auth.php
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

require_once __DIR__ . '/vendor/autoload.php';
$config = require __DIR__ . '/config.php';

function generate_jwt($user_id) {
    global $config;
    $now = time();
    $payload = [
        'iss' => $config['jwt_issuer'],
        'iat' => $now,
        'nbf' => $now,
        'exp' => $now + $config['jwt_exp'],
        'sub' => $user_id
    ];
    return JWT::encode($payload, $config['jwt_secret'], $config['jwt_algo']);
}

function decode_jwt($token) {
    global $config;
    try {
        $decoded = JWT::decode($token, new Key($config['jwt_secret'], $config['jwt_algo']));
        return $decoded;
    } catch (Exception $e) {
        return null;
    }
}

function get_bearer_token() {
    $headers = null;
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
    } else if (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $headers = trim($_SERVER['REDIRECT_HTTP_AUTHORIZATION']);
    }
    if (!$headers && function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        if (isset($requestHeaders['Authorization'])) {
            $headers = trim($requestHeaders['Authorization']);
        }
    }
    if ($headers) {
        if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
            return $matches[1];
        }
    }
    return null;
}
