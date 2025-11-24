<?php
/**
 * Comments API Endpoint
 * Handles all comment-related requests
 */

require_once '../config/Config.php';
require_once '../controllers/CommentController.php';

$controller = new CommentController();
$request_method = $_SERVER['REQUEST_METHOD'];
$path_info = isset($_SERVER['PATH_INFO']) ? explode('/', trim($_SERVER['PATH_INFO'], '/')) : [];

switch ($request_method) {
    case 'POST':
        if (count($path_info) === 2 && $path_info[0] === 'video') {
            $controller->create($path_info[1]);
        } else {
            Response::notFound('Endpoint not found');
        }
        break;

    case 'GET':
        if (count($path_info) === 2 && $path_info[0] === 'video') {
            $controller->getByVideo($path_info[1]);
        } else {
            Response::notFound('Endpoint not found');
        }
        break;

    case 'PUT':
        if (count($path_info) === 1) {
            $controller->update($path_info[0]);
        } else {
            Response::notFound('Endpoint not found');
        }
        break;

    case 'DELETE':
        if (count($path_info) === 1) {
            $controller->delete($path_info[0]);
        } else {
            Response::notFound('Endpoint not found');
        }
        break;

    default:
        Response::methodNotAllowed();
        break;
}
?>