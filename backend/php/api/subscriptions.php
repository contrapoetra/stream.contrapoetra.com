<?php
/**
 * Subscriptions API Endpoint
 * Handles all subscription-related requests
 */

require_once '../config/Config.php';
require_once '../controllers/SubscriptionController.php';

$controller = new SubscriptionController();
$request_method = $_SERVER['REQUEST_METHOD'];
$path_info = isset($_SERVER['PATH_INFO']) ? explode('/', trim($_SERVER['PATH_INFO'], '/')) : [];

switch ($request_method) {
    case 'POST':
        if (count($path_info) === 2 && $path_info[0] === 'channel') {
            $controller->subscribe($path_info[1]);
        } else {
            Response::notFound('Endpoint not found');
        }
        break;

    case 'DELETE':
        if (count($path_info) === 2 && $path_info[0] === 'channel') {
            $controller->unsubscribe($path_info[1]);
        } else {
            Response::notFound('Endpoint not found');
        }
        break;

    case 'GET':
        if (empty($path_info)) {
            $controller->getSubscriptions();
        } elseif (count($path_info) === 1) {
            $controller->getStatus($path_info[0]);
        } elseif (count($path_info) === 2) {
            if ($path_info[0] === 'user') {
                $controller->getSubscriptions($path_info[1]);
            } elseif ($path_info[0] === 'channel') {
                $controller->getSubscribers($path_info[1]);
            } else {
                Response::notFound('Endpoint not found');
            }
        } else {
            Response::notFound('Endpoint not found');
        }
        break;

    default:
        Response::methodNotAllowed();
        break;
}
?>