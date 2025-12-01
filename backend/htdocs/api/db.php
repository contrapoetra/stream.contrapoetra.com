<?php
$config = require __DIR__ . '/config.php';

$dsn = "mysql:host={$config['db']['host']};dbname={$config['db']['dbname']};charset={$config['db']['charset']}";
try {
    $pdo = new PDO($dsn, $config['db']['user'], $config['db']['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'DB connection failed', 'message' => $e->getMessage()]);
    exit;
}
