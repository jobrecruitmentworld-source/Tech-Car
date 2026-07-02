<?php
// backend/api/v1/brands.php
require_once 'config/Database.php';

header("Content-Type: application/json");
$method = $_SERVER['REQUEST_METHOD'];
$conn = Database::getConnection();

if ($method === 'GET') {
    $stmt = $conn->query("SELECT * FROM brands ORDER BY name ASC");
    $brands = $stmt->fetchAll();
    
    foreach ($brands as &$brand) {
        $serStmt = $conn->prepare("SELECT * FROM series WHERE brand_id = ? ORDER BY name ASC");
        $serStmt->execute([$brand['id']]);
        $brand['series'] = $serStmt->fetchAll();
    }
    
    echo json_encode($brands);
}
else if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $action = $_GET['action'] ?? 'brand';
    
    try {
        if ($action === 'brand') {
            $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $data['name'])));
            $stmt = $conn->prepare("INSERT INTO brands (name, slug) VALUES (?, ?)");
            $stmt->execute([$data['name'], $slug]);
            echo json_encode(['success' => true, 'id' => $conn->lastInsertId()]);
        } else if ($action === 'series') {
            $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $data['name'])));
            $stmt = $conn->prepare("INSERT INTO series (brand_id, name, slug) VALUES (?, ?, ?)");
            $stmt->execute([$data['brand_id'], $data['name'], $slug]);
            echo json_encode(['success' => true, 'id' => $conn->lastInsertId()]);
        }
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>
