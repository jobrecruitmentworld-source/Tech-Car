<?php
// backend/api/v1/products.php
require_once 'config/Database.php';

header("Content-Type: application/json");
$method = $_SERVER['REQUEST_METHOD'];
$conn = Database::getConnection();

function generate_uuid() {
    return sprintf( '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ),
        mt_rand( 0, 0x0fff ) | 0x4000, mt_rand( 0, 0x3fff ) | 0x8000,
        mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff )
    );
}

if ($method === 'GET') {
    $id = $_GET['id'] ?? null;
    $slug = $_GET['slug'] ?? null;

    if ($id || $slug) {
        // Fetch single product
        $sql = "SELECT p.*, c.name as category_name, b.name as brand_name 
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id 
                LEFT JOIN brands b ON p.brand_id = b.id 
                WHERE " . ($id ? "p.id = ?" : "p.slug = ?");
        $stmt = $conn->prepare($sql);
        $stmt->execute([$id ? $id : $slug]);
        $product = $stmt->fetch();

        if ($product) {
            // Fetch variants
            $varStmt = $conn->prepare("SELECT * FROM product_variants WHERE product_id = ?");
            $varStmt->execute([$product['id']]);
            $variants = $varStmt->fetchAll();

            // For each variant, fetch its dynamic attributes
            foreach ($variants as &$variant) {
                $valStmt = $conn->prepare("
                    SELECT a.name, a.type, a.unit, v.value_string, v.value_numeric, v.value_boolean 
                    FROM variant_attribute_values v 
                    JOIN attributes a ON v.attribute_id = a.id 
                    WHERE v.variant_id = ?
                ");
                $valStmt->execute([$variant['id']]);
                $variant['attributes'] = $valStmt->fetchAll();
            }
            $product['variants'] = $variants;
            echo json_encode($product);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Product not found']);
        }
    } else {
        // Fetch list of products with performance optimization (Pagination/Limits)
        $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
        $offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;
        
        $stmt = $conn->prepare("
            SELECT p.id, p.name, p.slug, p.base_price, p.status, c.name as category_name, b.name as brand_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            LEFT JOIN brands b ON p.brand_id = b.id 
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        ");
        
        // PDO requires integers for LIMIT/OFFSET binding
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        echo json_encode($stmt->fetchAll());
    }
}
else if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    try {
        $conn->beginTransaction();

        $product_id = generate_uuid();
        $slug = $data['slug'] ?? strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $data['name'])));

        // 1. Insert Product
        $stmt = $conn->prepare("INSERT INTO products (id, category_id, brand_id, name, slug, summary, base_price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $product_id, 
            $data['category_id'], 
            $data['brand_id'], 
            $data['name'], 
            $slug, 
            $data['summary'] ?? '', 
            $data['base_price'] ?? 0, 
            $data['status'] ?? 'Draft'
        ]);

        // 2. Insert Variants & Attributes
        if (isset($data['variants']) && is_array($data['variants'])) {
            $varStmt = $conn->prepare("INSERT INTO product_variants (id, product_id, name, sku, price, is_default) VALUES (?, ?, ?, ?, ?, ?)");
            $attrValStmt = $conn->prepare("INSERT INTO variant_attribute_values (variant_id, attribute_id, value_string, value_numeric, value_boolean) VALUES (?, ?, ?, ?, ?)");

            foreach ($data['variants'] as $v) {
                $variant_id = generate_uuid();
                $varStmt->execute([
                    $variant_id, 
                    $product_id, 
                    $v['name'], 
                    $v['sku'] ?? null, 
                    $v['price'], 
                    $v['is_default'] ?? 0
                ]);

                // Insert dynamic attributes
                if (isset($v['attributes']) && is_array($v['attributes'])) {
                    foreach ($v['attributes'] as $attr_id => $val) {
                        // Assuming string/numeric handling based on frontend submission
                        $valString = is_string($val) ? $val : null;
                        $valNumeric = is_numeric($val) ? $val : null;
                        $valBoolean = is_bool($val) ? $val : null;

                        $attrValStmt->execute([$variant_id, $attr_id, $valString, $valNumeric, $valBoolean]);
                    }
                }
            }
        }

        $conn->commit();
        http_response_code(201);
        echo json_encode(['success' => true, 'product_id' => $product_id]);

    } catch (Exception $e) {
        $conn->rollBack();
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>
