<?php
/**
 * Users API Endpoint
 * Handles all user-related requests
 */

require_once '../config/Config.php';
require_once '../controllers/UserController.php';

$controller = new UserController();
$request_method = $_SERVER['REQUEST_METHOD'];
$path_info = isset($_SERVER['PATH_INFO']) ? explode('/', trim($_SERVER['PATH_INFO'], '/')) : [];

switch ($request_method) {
    case 'POST':
        if (empty($path_info) || $path_info[0] === 'register') {
            $controller->register();
        } elseif ($path_info[0] === 'login') {
            $controller->login();
        } elseif ($path_info[0] === 'logout') {
            $controller->logout();
        } else {
            Response::notFound('Endpoint not found');
        }
        break;

    case 'GET':
        if (empty($path_info)) {
            $controller->getCurrentUser();
        } elseif ($path_info[0] === 'profile') {
            $controller->profile();
        } else {
            Response::notFound('Endpoint not found');
        }
        break;

    default:
        Response::methodNotAllowed();
        break;
}
?>