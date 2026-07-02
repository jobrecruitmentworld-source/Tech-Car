<?php
// backend/api/blogs.php
require_once 'v1/config/Database.php';
require_once 'v1/services/PostService.php';

header("Content-Type: application/json");

$method = $_SERVER['REQUEST_METHOD'];
$postService = new PostService();

if ($method === 'GET') {
    $id = isset($_GET['id']) ? $_GET['id'] : null;
    $slug = isset($_GET['slug']) ? $_GET['slug'] : null;
    $isAdmin = isset($_GET['admin']) && $_GET['admin'] === 'true';

    try {
        if ($id || $slug) {
            $param = $id ? $id : $slug;
            $isId = $id !== null;
            $post = $postService->getPostBySlugOrId($param, $isId, $isAdmin);
            
            if (!$post) {
                http_response_code(404);
                echo json_encode(['error' => 'Blog not found']);
                exit;
            }
            echo json_encode($post);
        } else {
            $posts = $postService->getPosts($isAdmin);
            echo json_encode($posts);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
else {
    // For now, write operations are disabled to prevent data fragmentation.
    // In the next step, we will implement full POST/PUT/DELETE using the new architecture.
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed during migration phase. Please wait.']);
}
?>
