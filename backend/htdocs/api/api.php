<?php
// api.php
ini_set('display_errors', 0);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/auth.php';

$config = require __DIR__ . '/config.php';

global $pdo;

// Handle OPTIONS preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Basic router: use ?action=...
$action = $_GET['action'] ?? null;
$method = $_SERVER['REQUEST_METHOD'];

// -------------------- Public endpoints --------------------
if ($action === 'register' && $method === 'POST') {
    $data = get_json_input();
    $username = trim($data['username'] ?? '');
    $email = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';

    if (!$username || !$email || !$password) {
        json_response(['error' => 'username, email and password required'], 400);
    }

    // check email unique
    $stmt = $pdo->prepare("SELECT user_id FROM Users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        json_response(['error' => 'Email already in use'], 409);
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO Users (username, email, password) VALUES (?, ?, ?)");
    $stmt->execute([$username, $email, $hash]);
    $user_id = $pdo->lastInsertId();
    $token = generate_jwt($user_id);

    json_response(['message' => 'registered', 'token' => $token, 'user_id' => (int)$user_id], 201);
}

if ($action === 'login' && $method === 'POST') {
    $data = get_json_input();
    $email = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';

    if (!$email || !$password) {
        json_response(['error' => 'email and password required'], 400);
    }

    $stmt = $pdo->prepare("SELECT user_id, username, email, password FROM Users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password'])) {
        json_response(['error' => 'Invalid credentials'], 401);
    }

    $token = generate_jwt($user['user_id']);
    json_response([
        'token' => $token, 
        'user_id' => (int)$user['user_id'],
        'username' => $user['username'],
        'email' => $user['email']
    ]);
}

// public: list videos with basic pagination
if ($action === 'videos' && $method === 'GET') {
    try {
        $page = max(1, intval($_GET['page'] ?? 1));
        $limit = min(100, intval($_GET['limit'] ?? 10));
        $offset = ($page - 1) * $limit;
        $userIdFilter = intval($_GET['user_id'] ?? 0);

        // check for optional auth to show private videos
        $currentUserId = 0;
        $token = get_bearer_token();
        if ($token) {
            $decoded = decode_jwt($token);
            if ($decoded && isset($decoded->sub)) {
                $currentUserId = intval($decoded->sub);
            }
        }

        $sql = "SELECT v.video_id, v.user_id, u.username, v.title, v.description, v.file_path, v.thumbnail_path, v.views, v.duration, v.visibility, v.created_at
                FROM Videos v
                JOIN Users u ON u.user_id = v.user_id
                WHERE (v.visibility = 'public' OR v.user_id = :current_user_id)";
        
        if ($userIdFilter > 0) {
            $sql .= " AND v.user_id = :uid";
        }
        
        $sql .= " ORDER BY v.created_at DESC LIMIT :limit OFFSET :offset";

        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':current_user_id', $currentUserId, PDO::PARAM_INT);
        if ($userIdFilter > 0) {
            $stmt->bindValue(':uid', $userIdFilter, PDO::PARAM_INT);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $videos = $stmt->fetchAll();

        json_response(['page'=>$page,'limit'=>$limit,'videos'=>$videos]);
    } catch (Exception $e) {
        json_response(['error' => $e->getMessage()], 500);
    }
}

// public: get channel info by username
if ($action === 'channel' && $method === 'GET') {
    try {
        $username = trim($_GET['username'] ?? '');
        if (!$username) json_response(['error' => 'username required'], 400);

        // Get user info
        $stmt = $pdo->prepare("SELECT user_id, username, email, created_at FROM Users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if (!$user) json_response(['error' => 'User not found'], 404);

        // Get subscriber count
        $stmtSub = $pdo->prepare("SELECT COUNT(*) as count FROM Subscriptions WHERE channel_id = ? AND status = 'active'");
        $stmtSub->execute([$user['user_id']]);
        $subCount = $stmtSub->fetch()['count'];

        $user['subscriber_count'] = $subCount;

        json_response(['user' => $user]);
    } catch (Exception $e) {
        json_response(['error' => $e->getMessage()], 500);
    }
}

// public: single video by id (if public or authorized)
if ($action === 'video' && $method === 'GET') {
    $id = intval($_GET['id'] ?? 0);
    if (!$id) json_response(['error'=>'id required'], 400);

    $tokenUser = null;
    $token = get_bearer_token();
    if ($token) {
        $d = decode_jwt($token);
        if ($d && isset($d->sub)) $tokenUser = intval($d->sub);
    }

    // fetch
    $stmt = $pdo->prepare("SELECT v.*, u.username FROM Videos v JOIN Users u ON u.user_id = v.user_id WHERE v.video_id = ?");
    $stmt->execute([$id]);
    $v = $stmt->fetch();
    if (!$v) json_response(['error'=>'not found'],404);

    if ($v['visibility'] === 'private' && $tokenUser !== intval($v['user_id'])) {
        json_response(['error'=>'not authorized to view this video'],403);
    }

    // increment view counter (non-blocking best-effort)
    try {
        $upd = $pdo->prepare("UPDATE Videos SET views = views + 1 WHERE video_id = ?");
        $upd->execute([$id]);
    } catch (Exception $e) { /* ignore */ }

    json_response(['video'=>$v]);
}

// -------------------- Authenticated endpoints --------------------
if ($action === 'upload' && ($method === 'POST')) {
    try {
        $user_id = require_auth_user_id();

        // we expect form-data with multipart file 'video'
        if (!isset($_FILES['video'])) {
            json_response(['error'=>'no video file supplied (multipart/form-data, field name "video")'],400);
        }

        $file = $_FILES['video'];
        if ($file['error'] !== UPLOAD_ERR_OK) {
            json_response(['error'=>'upload error', 'code'=>$file['error']],400);
        }

        // validate size
        if ($file['size'] > $config['max_file_size_bytes']) {
            json_response(['error'=>'file too large'],413);
        }

        // validate mime
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mime, $config['allowed_mimes'])) {
            json_response(['error'=>'unsupported mime type', 'mime'=>$mime],415);
        }

        // sanitize title/description from POST fields
        $title = trim($_POST['title'] ?? '');
        $description = trim($_POST['description'] ?? null);
        $duration = intval($_POST['duration'] ?? 0);
        $visibility = in_array($_POST['visibility'] ?? 'public', ['public','private']) ? $_POST['visibility'] : 'public';
        if (!$title) $title = substr($file['name'], 0, 150);

        // ensure upload directory exists
        $subdir = date('Y/m');
        $targetDir = rtrim($config['upload_dir'], '/') . '/' . $subdir;
        if (!is_dir($targetDir) && !mkdir($targetDir, 0755, true)) {
            json_response(['error'=>'cannot create upload dir'],500);
        }

        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $baseName = bin2hex(random_bytes(8)) . '.' . ($ext ?: 'mp4');
        $targetPath = $targetDir . '/' . $baseName;
        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            json_response(['error'=>'failed to move uploaded file'],500);
        }

        // store relative file path for serving
        $relativePath = 'uploads/videos/' . $subdir . '/' . $baseName;

        // handle thumbnail upload
        $thumbnailPath = null;
        if (isset($_FILES['thumbnail']) && $_FILES['thumbnail']['error'] === UPLOAD_ERR_OK) {
            $thumb = $_FILES['thumbnail'];
            // Basic validation for thumbnail
            $tInfo = finfo_open(FILEINFO_MIME_TYPE);
            $tMime = finfo_file($tInfo, $thumb['tmp_name']);
            finfo_close($tInfo);
            
            if (strpos($tMime, 'image/') === 0) {
                $thumbSubdir = date('Y/m');
                $thumbDir = rtrim($config['thumb_dir'], '/') . '/' . $thumbSubdir;
                if (!is_dir($thumbDir) && !mkdir($thumbDir, 0755, true)) {
                    // silently fail or log? just ignore thumb for now
                } else {
                    $tExt = pathinfo($thumb['name'], PATHINFO_EXTENSION);
                    $tBaseName = bin2hex(random_bytes(8)) . '.' . ($tExt ?: 'jpg');
                    $tTargetPath = $thumbDir . '/' . $tBaseName;
                    if (move_uploaded_file($thumb['tmp_name'], $tTargetPath)) {
                        $thumbnailPath = 'uploads/thumbnails/' . $thumbSubdir . '/' . $tBaseName;
                    }
                }
            }
        }

        $stmt = $pdo->prepare("INSERT INTO Videos (user_id, title, description, file_path, thumbnail_path, mime_type, size, duration, visibility, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$user_id, $title, $description, $relativePath, $thumbnailPath, $mime, $file['size'], $duration, $visibility, 'uploaded']);
        $video_id = $pdo->lastInsertId();

        // OPTIONAL: kick background job to generate thumbnails / transcode
        // For now, we return success and let a background service update duration/thumbnail/status later.
        json_response(['message'=>'uploaded','video_id'=>(int)$video_id,'file_path'=>$relativePath],201);
    } catch (Exception $e) {
        json_response(['error' => $e->getMessage()], 500);
    }
}

// edit video (owner only)
if ($action === 'video' && $method === 'PUT') {
    $user_id = require_auth_user_id();
    $id = intval($_GET['id'] ?? 0);
    if (!$id) json_response(['error'=>'id required'],400);

    // verify owner
    $stmt = $pdo->prepare("SELECT user_id FROM Videos WHERE video_id = ?");
    $stmt->execute([$id]);
    $v = $stmt->fetch();
    if (!$v) json_response(['error'=>'not found'],404);
    if ($v['user_id'] != $user_id) json_response(['error'=>'forbidden'],403);

    $data = get_json_input();
    $fields = [];
    $values = [];
    foreach (['title','description','visibility','status'] as $f) {
        if (isset($data[$f])) {
            $fields[] = "$f = ?";
            $values[] = $data[$f];
        }
    }
    if (!$fields) json_response(['error'=>'no updatable fields provided'],400);

    $values[] = $id;
    $sql = "UPDATE Videos SET " . implode(", ", $fields) . " WHERE video_id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($values);
    json_response(['message'=>'updated']);
}

// delete video (owner only)
if ($action === 'video' && $method === 'DELETE') {
    $user_id = require_auth_user_id();
    $id = intval($_GET['id'] ?? 0);
    if (!$id) json_response(['error'=>'id required'],400);

    $stmt = $pdo->prepare("SELECT user_id, file_path, thumbnail_path FROM Videos WHERE video_id = ?");
    $stmt->execute([$id]);
    $v = $stmt->fetch();
    if (!$v) json_response(['error'=>'not found'],404);
    if ($v['user_id'] != $user_id) json_response(['error'=>'forbidden'],403);

    // delete DB row (file removal optional, but we attempt)
    $pdo->prepare("DELETE FROM Videos WHERE video_id = ?")->execute([$id]);

    // attempt to delete files (best-effort)
    if (!empty($v['file_path'])) {
        $fp = __DIR__ . '/' . $v['file_path'];
        if (file_exists($fp)) @unlink($fp);
    }
    if (!empty($v['thumbnail_path'])) {
        $tp = __DIR__ . '/' . $v['thumbnail_path'];
        if (file_exists($tp)) @unlink($tp);
    }

    json_response(['message'=>'deleted']);
}

// comments: list
if ($action === 'comments' && $method === 'GET') {
    $videoId = intval($_GET['video_id'] ?? 0);
    if (!$videoId) json_response(['error'=>'video_id required'], 400);

    $stmt = $pdo->prepare("SELECT c.comment_id, c.video_id, c.comment_text, c.created_at, u.username 
                           FROM Comments c 
                           JOIN Users u ON u.user_id = c.user_id 
                           WHERE c.video_id = ? 
                           ORDER BY c.created_at DESC");
    $stmt->execute([$videoId]);
    $comments = $stmt->fetchAll();
    
    json_response(['comments'=>$comments]);
}

// comments: create
if ($action === 'comment' && $method === 'POST') {
    $user_id = require_auth_user_id();
    $data = get_json_input();
    $video_id = intval($data['video_id'] ?? 0);
    $text = trim($data['comment_text'] ?? '');
    if (!$video_id || !$text) json_response(['error'=>'video_id and comment_text required'],400);

    $stmt = $pdo->prepare("INSERT INTO Comments (video_id, user_id, comment_text) VALUES (?, ?, ?)");
    $stmt->execute([$video_id, $user_id, $text]);
    json_response(['message'=>'commented','comment_id'=>$pdo->lastInsertId()],201);
}

// likes: toggle or set (simple)
if ($action === 'like' && $method === 'POST') {
    $user_id = require_auth_user_id();
    $data = get_json_input();
    $video_id = intval($data['video_id'] ?? 0);
    $type = ($data['like_type'] ?? 'like') === 'dislike' ? 'dislike' : 'like';
    if (!$video_id) json_response(['error'=>'video_id required'],400);

    // insert or update (unique key on video_id,user_id prevents duplicates)
    $stmt = $pdo->prepare("INSERT INTO Likes (video_id, user_id, like_type) VALUES (?, ?, ?)
                           ON DUPLICATE KEY UPDATE like_type = VALUES(like_type), like_date = CURRENT_TIMESTAMP");
    $stmt->execute([$video_id, $user_id, $type]);
    json_response(['message'=>'ok']);
}

// subscribe
if ($action === 'subscribe' && $method === 'POST') {
    $user_id = require_auth_user_id();
    $data = get_json_input();
    $channel_id = intval($data['channel_id'] ?? 0);
    if (!$channel_id) json_response(['error'=>'channel_id required'],400);
    if ($channel_id == $user_id) json_response(['error'=>'cannot subscribe to yourself'],400);

    // insert or update
    $stmt = $pdo->prepare("INSERT INTO Subscriptions (subscriber_id, channel_id, status) VALUES (?, ?, 'active')
                           ON DUPLICATE KEY UPDATE status='active', subscribe_date = CURRENT_DATE");
    $stmt->execute([$user_id, $channel_id]);
    json_response(['message'=>'subscribed']);
}

// unsubscribe
if ($action === 'unsubscribe' && $method === 'POST') {
    $user_id = require_auth_user_id();
    $data = get_json_input();
    $channel_id = intval($data['channel_id'] ?? 0);
    if (!$channel_id) json_response(['error'=>'channel_id required'],400);

    $stmt = $pdo->prepare("UPDATE Subscriptions SET status='inactive' WHERE subscriber_id = ? AND channel_id = ?");
    $stmt->execute([$user_id, $channel_id]);
    json_response(['message'=>'unsubscribed']);
}

// fallback
json_response(['error'=>'unknown endpoint or method','action'=>$action,'method'=>$method], 404);
