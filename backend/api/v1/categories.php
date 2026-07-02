<?php
// backend/api/v1/categories.php
require_once 'config/Database.php';

header("Content-Type: application/json");

$method = $_SERVER['REQUEST_METHOD'];
$conn = Database::getConnection();

if ($method === 'GET') {
    // Fetch hierarchical categories
    $sql = "SELECT id, parent_id, name, slug, level, sort_order, status FROM categories ORDER BY sort_order ASC, name ASC";
    $stmt = $conn->query($sql);
    $categories = $stmt->fetchAll();
    
    // Build tree
    function buildTree(array $elements, $parentId = null) {
        $branch = array();
        foreach ($elements as $element) {
            if ($element['parent_id'] == $parentId) {
                $children = buildTree($elements, $element['id']);
                if ($children) {
                    $element['children'] = $children;
                }
                $branch[] = $element;
            }
        }
        return $branch;
    }

    $tree = buildTree($categories);
    echo json_encode($tree);
}
else if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $name = $data['name'] ?? '';
    $slug = $data['slug'] ?? strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name)));
    $parentId = !empty($data['parent_id']) ? intval($data['parent_id']) : null;
    $level = 1;

    if ($parentId) {
        $stmt = $conn->prepare("SELECT level FROM categories WHERE id = ?");
        $stmt->execute([$parentId]);
        $parentLevel = $stmt->fetchColumn();
        if ($parentLevel) $level = $parentLevel + 1;
    }

    try {
        $stmt = $conn->prepare("INSERT INTO categories (name, slug, parent_id, level) VALUES (?, ?, ?, ?)");
        $stmt->execute([$name, $slug, $parentId, $level]);
        echo json_encode(['success' => true, 'id' => $conn->lastInsertId()]);
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>
