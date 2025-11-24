<?php
/**
 * Videos API Endpoint
 * Handles all video-related requests
 */

require_once '../config/Config.php';
require_once '../controllers/VideoController.php';

$controller = new VideoController();
$request_method = $_SERVER['REQUEST_METHOD'];
$path_info = isset($_SERVER['PATH_INFO']) ? explode('/', trim($_SERVER['PATH_INFO'], '/')) : [];

switch ($request_method) {
    case 'POST':
        if (empty($path_info)) {
            $controller->upload();
        } else {
            Response::notFound('Endpoint not found');
        }
        break;

    case 'GET':
        if (empty($path_info)) {
            if (isset($_GET['search'])) {
                $controller->search();
            } elseif (isset($_GET['user'])) {
                $controller->getByUser($_GET['user']);
            } else {
                $controller->getAll();
            }
        } elseif (count($path_info) === 1) {
            $controller->getById($path_info[0]);
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