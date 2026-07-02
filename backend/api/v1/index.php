<?php
// backend/api/v1/index.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$requestUri = $_SERVER['REQUEST_URI'];
$parsedUrl = parse_url($requestUri, PHP_URL_PATH);
// Extract the route path after index.php
$path = preg_replace('/^.*index\.php/', '', $parsedUrl);
if ($path === '') $path = '/';
$method = $_SERVER['REQUEST_METHOD'];

// Extremely simple router
if (preg_match('#^/auth/login$#', $path) && $method === 'POST') {
    require_once __DIR__ . '/controllers/AuthController.php';
    AuthController::login();
} elseif (preg_match('#^/auth/register$#', $path) && $method === 'POST') {
    require_once __DIR__ . '/controllers/AuthController.php';
    AuthController::register();
} elseif (preg_match('#^/admin/dashboard-stats$#', $path) && $method === 'GET') {
    require_once __DIR__ . '/middleware/AuthMiddleware.php';
    // Protect this route, requires 'Admin' or 'Super Admin'
    $user = AuthMiddleware::requireRole(['Admin', 'Super Admin']);
    
    echo json_encode([
        'success' => true,
        'message' => 'Welcome to the secure admin area, ' . $user['email'],
        'stats' => ['users' => 120, 'posts' => 45]
    ]);
} elseif (preg_match('#^/products$#', $path) && $method === 'GET') {
    require_once __DIR__ . '/controllers/ProductController.php';
    ProductController::getProducts();
} elseif (preg_match('#^/products/([a-zA-Z0-9-]+)$#', $path, $matches) && $method === 'GET') {
    require_once __DIR__ . '/controllers/ProductController.php';
    ProductController::getProductDetails($matches[1]);
} elseif (preg_match('#^/media/upload$#', $path) && $method === 'POST') {
    require_once __DIR__ . '/middleware/AuthMiddleware.php';
    AuthMiddleware::authenticate();
    require_once __DIR__ . '/controllers/MediaController.php';
    MediaController::upload();
} elseif (preg_match('#^/ai/generate$#', $path) && $method === 'POST') {
    // Note: EventSource (SSE) doesn't easily support Authorization headers in browser natively,
    // in production you would pass token in query string or use fetch with custom stream reader.
    require_once __DIR__ . '/controllers/AIController.php';
    AIController::streamGeneration();
} elseif (preg_match('#^/ai/analyze$#', $path) && $method === 'POST') {
    require_once __DIR__ . '/controllers/AIController.php';
    AIController::analyzeContent();
} elseif (preg_match('#^/blogs/bulk-create$#', $path) && $method === 'POST') {
    require_once __DIR__ . '/middleware/AuthMiddleware.php';
    AuthMiddleware::authenticate();
    require_once __DIR__ . '/controllers/BlogController.php';
    BlogController::bulkCreate();
} elseif (preg_match('#^/blogs/check-slug$#', $path) && $method === 'POST') {
    require_once __DIR__ . '/middleware/AuthMiddleware.php';
    AuthMiddleware::authenticate();
    require_once __DIR__ . '/controllers/BlogController.php';
    BlogController::checkSlug();
} else {
    // If route not matched, allow falling back to legacy direct script access if this index was hit accidentally.
    // Or return 404.
    http_response_code(404);
    echo json_encode(['error' => 'Route not found: ' . $path]);
}
?>
