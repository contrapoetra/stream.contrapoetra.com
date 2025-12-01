<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once 'config/database.php';
include_once 'models/User.php';
include_once 'models/Video.php';
include_once 'models/Comment.php';
include_once 'models/Subscription.php';
include_once 'controllers/UserController.php';
include_once 'controllers/VideoController.php';
include_once 'controllers/CommentController.php';
include_once 'controllers/SubscriptionController.php';

$database = new Database();
$db = $database->getConnection();

// Get request method and URI
$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];

// Parse the URL path
$path = parse_url($request_uri, PHP_URL_PATH);
$parts = explode('/', trim($path, '/'));

// Debug: Let's see what we're getting
error_log("Request URI: " . $request_uri);
error_log("Path: " . $path);
error_log("Parts: " . print_r($parts, true));

// Remove 'www' and 'api' from parts to get clean routing
$clean_parts = array();
$skip_next = false;

foreach ($parts as $part) {
    if ($part === 'www' || $part === 'api') {
        continue;
    }
    $clean_parts[] = $part;
}

// Debug cleaned parts
error_log("Clean Parts: " . print_r($clean_parts, true));

$controller = $clean_parts[0] ?? '';
$id = $clean_parts[1] ?? null;
$action = $clean_parts[2] ?? '';

// Handle file uploads for videos
if ($method == 'POST' && $controller == 'videos') {
    $videoController = new VideoController($db);
    $data = (object)$_POST;
    echo $videoController->upload($data, $_FILES);
    exit;
}

// Handle JSON input for other endpoints
$input = json_decode(file_get_contents("php://input"));

switch($controller) {
    case 'users':
        $userController = new UserController($db);

        if($method == 'POST' && $id == 'register') {
            echo $userController->register($input);
        }
        elseif($method == 'POST' && $id == 'login') {
            echo $userController->login($input);
        }
        elseif($method == 'GET' && $id && !$action) {
            // GET /users/123
            echo $userController->getProfile($id);
        }
        else {
            http_response_code(404);
            echo json_encode(array("message" => "Users endpoint not found. Available: /users/register, /users/login, /users/{id}"));
        }
        break;

    case 'videos':
        $videoController = new VideoController($db);

        if($method == 'GET' && $id) {
            // GET /videos/123
            echo $videoController->getVideo($id);
        }
        elseif($method == 'GET') {
            // GET /videos
            $page = $_GET['page'] ?? 1;
            $per_page = $_GET['per_page'] ?? 10;
            echo $videoController->getVideos($page, $per_page);
        }
        else {
            http_response_code(404);
            echo json_encode(array("message" => "Videos endpoint not found. Available: GET /videos, GET /videos/{id}, POST /videos"));
        }
        break;

    case 'comments':
        $commentController = new CommentController($db);

        if($method == 'POST') {
            // POST /comments
            echo $commentController->create($input);
        }
        elseif($method == 'GET' && $id) {
            // GET /comments/123 (where 123 is video_id)
            echo $commentController->getByVideo($id);
        }
        else {
            http_response_code(404);
            echo json_encode(array("message" => "Comments endpoint not found. Available: POST /comments, GET /comments/{video_id}"));
        }
        break;

    case 'subscriptions':
        $subscriptionController = new SubscriptionController($db);

        if($method == 'POST' && $id == 'subscribe') {
            // POST /subscriptions/subscribe
            echo $subscriptionController->subscribe($input);
        }
        elseif($method == 'POST' && $id == 'unsubscribe') {
            // POST /subscriptions/unsubscribe
            echo $subscriptionController->unsubscribe($input);
        }
        elseif($method == 'GET' && $id && $action == 'check') {
            // GET /subscriptions/123/check?channel_id=456
            $channel_id = $_GET['channel_id'] ?? null;
            if($channel_id) {
                echo $subscriptionController->checkSubscription($id, $channel_id);
            } else {
                http_response_code(400);
                echo json_encode(array("message" => "channel_id parameter is required."));
            }
        }
        elseif($method == 'GET' && $id && $action == 'count') {
            // GET /subscriptions/123/count
            echo $subscriptionController->getSubscriberCount($id);
        }
        elseif($method == 'GET' && $id && $action == 'subscribers') {
            // GET /subscriptions/123/subscribers
            echo $subscriptionController->getSubscribers($id);
        }
        elseif($method == 'GET' && $id && !$action) {
            // GET /subscriptions/123
            echo $subscriptionController->getSubscriptions($id);
        }
        else {
            http_response_code(404);
            echo json_encode(array("message" => "Subscriptions endpoint not found."));
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(array("message" => "Endpoint not found. Available endpoints: /users, /videos, /comments, /subscriptions"));
        break;
}
?>
