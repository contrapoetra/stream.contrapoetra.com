<?php
/**
 * Likes API Endpoint
 * Handles all like-related requests
 */

require_once '../config/Config.php';
require_once '../controllers/LikeController.php';

$controller = new LikeController();
$request_method = $_SERVER['REQUEST_METHOD'];
$path_info = isset($_SERVER['PATH_INFO']) ? explode('/', trim($_SERVER['PATH_INFO'], '/')) : [];

switch ($request_method) {
    case 'POST':
        if (count($path_info) === 2 && $path_info[0] === 'video') {
            $controller->like($path_info[1]);
        } else {
            Response::notFound('Endpoint not found');
        }
        break;

    case 'DELETE':
        if (count($path_info) === 2 && $path_info[0] === 'video') {
            $controller->unlike($path_info[1]);
        } else {
            Response::notFound('Endpoint not found');
        }
        break;

    case 'GET':
        if (count($path_info) === 1) {
            if (isset($_GET['user'])) {
                $controller->getLikesByUser($path_info[0]);
            } else {
                $controller->getStatus($path_info[0]);
            }
        } elseif (count($path_info) === 2 && $path_info[0] === 'user') {
            $controller->getLikesByUser($path_info[1]);
        } else {
            Response::notFound('Endpoint not found');
        }
        break;

    default:
        Response::methodNotAllowed();
        break;
}
?>