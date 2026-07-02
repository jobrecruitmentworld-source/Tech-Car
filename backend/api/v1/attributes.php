<?php
// backend/api/v1/attributes.php
require_once 'config/Database.php';

header("Content-Type: application/json");
$method = $_SERVER['REQUEST_METHOD'];
$conn = Database::getConnection();

if ($method === 'GET') {
    $categoryId = isset($_GET['category_id']) ? intval($_GET['category_id']) : null;
    
    if (!$categoryId) {
        http_response_code(400);
        echo json_encode(['error' => 'category_id is required']);
        exit;
    }

    // Fetch Groups and their Attributes
    $stmt = $conn->prepare("SELECT * FROM specification_groups WHERE category_id = ? ORDER BY sort_order ASC");
    $stmt->execute([$categoryId]);
    $groups = $stmt->fetchAll();

    foreach ($groups as &$group) {
        $attrStmt = $conn->prepare("SELECT * FROM attributes WHERE group_id = ? ORDER BY sort_order ASC");
        $attrStmt->execute([$group['id']]);
        $group['attributes'] = $attrStmt->fetchAll();
    }

    echo json_encode($groups);
}
else if ($method === 'POST') {
    // Determine if we are creating a Group or an Attribute
    $data = json_decode(file_get_contents('php://input'), true);
    $action = $_GET['action'] ?? '';

    try {
        if ($action === 'create_group') {
            $stmt = $conn->prepare("INSERT INTO specification_groups (category_id, name, sort_order) VALUES (?, ?, ?)");
            $stmt->execute([$data['category_id'], $data['name'], $data['sort_order'] ?? 0]);
            echo json_encode(['success' => true, 'id' => $conn->lastInsertId()]);
        } 
        else if ($action === 'create_attribute') {
            $stmt = $conn->prepare("INSERT INTO attributes (group_id, name, type, unit, sort_order, is_filterable) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $data['group_id'], 
                $data['name'], 
                $data['type'] ?? 'string', 
                $data['unit'] ?? null, 
                $data['sort_order'] ?? 0, 
                $data['is_filterable'] ?? 0
            ]);
            echo json_encode(['success' => true, 'id' => $conn->lastInsertId()]);
        }
        else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid action']);
        }
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>
