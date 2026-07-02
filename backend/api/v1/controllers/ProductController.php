<?php
// backend/api/v1/controllers/ProductController.php

require_once __DIR__ . '/../config/Database.php';

class ProductController {
    public static function getProducts() {
        header("Content-Type: application/json");
        $conn = Database::getConnection();

        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        $offset = ($page - 1) * $limit;

        $stmt = $conn->prepare("
            SELECT p.id, p.name, p.slug, p.base_price, p.status, p.created_at,
                   c.name as category_name, b.name as brand_name 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN brands b ON p.brand_id = b.id
            WHERE p.deleted_at IS NULL
            ORDER BY p.created_at DESC
            LIMIT :limit OFFSET :offset
        ");
        
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Fetch total count for pagination
        $countStmt = $conn->query("SELECT COUNT(id) FROM products WHERE deleted_at IS NULL");
        $total = $countStmt->fetchColumn();

        echo json_encode([
            'success' => true,
            'data' => $products,
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'total_pages' => ceil($total / $limit)
            ]
        ]);
    }

    public static function getProductDetails($slug) {
        header("Content-Type: application/json");
        $conn = Database::getConnection();

        $stmt = $conn->prepare("
            SELECT p.*, c.name as category_name, b.name as brand_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN brands b ON p.brand_id = b.id
            WHERE p.slug = ? AND p.deleted_at IS NULL
        ");
        $stmt->execute([$slug]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$product) {
            http_response_code(404);
            echo json_encode(['error' => 'Product not found']);
            return;
        }

        // Fetch variants
        $variantStmt = $conn->prepare("SELECT * FROM product_variants WHERE product_id = ?");
        $variantStmt->execute([$product['id']]);
        $variants = $variantStmt->fetchAll(PDO::FETCH_ASSOC);

        // Fetch EAV attributes for variants
        foreach ($variants as &$variant) {
            $attrStmt = $conn->prepare("
                SELECT a.name, a.type, a.unit, v.value_string, v.value_numeric, v.value_boolean 
                FROM variant_attribute_values v
                JOIN attributes a ON v.attribute_id = a.id
                WHERE v.variant_id = ?
            ");
            $attrStmt->execute([$variant['id']]);
            $variant['attributes'] = $attrStmt->fetchAll(PDO::FETCH_ASSOC);
        }
        $product['variants'] = $variants;

        echo json_encode(['success' => true, 'data' => $product]);
    }
}
?>
