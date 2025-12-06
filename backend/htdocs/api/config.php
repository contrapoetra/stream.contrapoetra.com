<?php
return [
    // DB
    'db' => [
        'host' => 'localhost',
        'dbname' => 'streaming',
        'user' => 'root',
        'pass' => '',
        'charset' => 'utf8mb4',
    ],

    // JWT secret (keep this secret & long)
    'jwt_secret' => 'replace_with_a_long_random_string_here',

    // Upload settings
    'upload_dir' => __DIR__ . '/../uploads/videos',
    'thumb_dir'  => __DIR__ . '/../uploads/thumbnails',
    'max_file_size_bytes' => 1024 * 1024 * 1024, // 1GB cap example (adjust)
    'allowed_mimes' => [
        'video/mp4',
        'video/webm',
        'video/ogg',
        // add others if needed
    ],

    // JWT options
    'jwt_algo' => 'HS256',
    'jwt_issuer' => 'your-app',
    'jwt_exp' => 60*60*24*7, // 7 days
];
