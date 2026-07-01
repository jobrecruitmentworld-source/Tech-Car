<?php
// backend/api/blogs.php
require_once 'config.php';

header("Content-Type: application/json");

$method = $_SERVER['REQUEST_METHOD'];

// Helper to format JSON fields
function safeJsonDecode($string) {
    if (!$string) return [];
    $decoded = json_decode($string, true);
    return is_array($decoded) ? $decoded : [];
}

if ($method === 'GET') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    $slug = isset($_GET['slug']) ? $_GET['slug'] : null;
    $isAdmin = isset($_GET['admin']) && $_GET['admin'] === 'true';

    try {
        if ($id || $slug) {
            // Get single blog
            $sql = $id ? "SELECT * FROM blogs WHERE id = ?" : "SELECT * FROM blogs WHERE slug = ?";
            $param = $id ? $id : $slug;
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$param]);
            $blog = $stmt->fetch();

            if (!$blog) {
                http_response_code(404);
                echo json_encode(['error' => 'Blog not found']);
                exit;
            }

            // Decode JSON fields
            $blog['tags'] = safeJsonDecode($blog['tags']);
            $blog['keywords'] = safeJsonDecode($blog['keywords']);
            $blog['seo'] = safeJsonDecode($blog['seo']);

            // Get sections
            $stmt = $pdo->prepare("SELECT * FROM blog_sections WHERE blog_id = ? ORDER BY sort_order ASC");
            $stmt->execute([$blog['id']]);
            $blog['sections'] = $stmt->fetchAll();

            // Get gallery
            $stmt = $pdo->prepare("SELECT * FROM blog_gallery WHERE blog_id = ? ORDER BY sort_order ASC");
            $stmt->execute([$blog['id']]);
            $blog['gallery'] = $stmt->fetchAll();

            // Increase views if not admin
            if (!$isAdmin) {
                $pdo->prepare("UPDATE blogs SET views = views + 1 WHERE id = ?")->execute([$blog['id']]);
                $blog['views']++;
            }

            echo json_encode($blog);
        } else {
            // Get multiple blogs
            $sql = $isAdmin ? "SELECT * FROM blogs ORDER BY created_at DESC" : "SELECT * FROM blogs WHERE status = 'Published' ORDER BY created_at DESC";
            $stmt = $pdo->query($sql);
            $blogs = $stmt->fetchAll();

            // Decode JSON fields for all blogs
            foreach ($blogs as &$b) {
                $b['tags'] = safeJsonDecode($b['tags']);
                $b['keywords'] = safeJsonDecode($b['keywords']);
                $b['seo'] = safeJsonDecode($b['seo']);
            }

            echo json_encode($blogs);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

else if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON']);
        exit;
    }

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare("INSERT INTO blogs (title, slug, short_description, long_description, featured_image, category_name, status, tags, keywords, seo, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        $publishedAt = ($data['status'] === 'Published') ? date('Y-m-d H:i:s') : null;
        
        $stmt->execute([
            $data['title'] ?? '',
            $data['slug'] ?? uniqid('blog-'),
            $data['short_description'] ?? '',
            $data['long_description'] ?? '',
            $data['featured_image'] ?? '',
            $data['category_name'] ?? '',
            $data['status'] ?? 'Draft',
            json_encode($data['tags'] ?? []),
            json_encode($data['keywords'] ?? []),
            json_encode($data['seo'] ?? []),
            $publishedAt
        ]);

        $blogId = $pdo->lastInsertId();

        // Insert sections
        if (isset($data['sections']) && is_array($data['sections'])) {
            $stmtSec = $pdo->prepare("INSERT INTO blog_sections (blog_id, heading, content, image_url, sort_order) VALUES (?, ?, ?, ?, ?)");
            foreach ($data['sections'] as $sec) {
                $stmtSec->execute([$blogId, $sec['heading'] ?? '', $sec['content'] ?? '', $sec['image_url'] ?? '', $sec['sort_order'] ?? 0]);
            }
        }

        // Insert gallery
        if (isset($data['gallery']) && is_array($data['gallery'])) {
            $stmtGal = $pdo->prepare("INSERT INTO blog_gallery (blog_id, image_url, alt_text, caption, sort_order) VALUES (?, ?, ?, ?, ?)");
            foreach ($data['gallery'] as $gal) {
                $stmtGal->execute([$blogId, $gal['image_url'] ?? '', $gal['alt_text'] ?? '', $gal['caption'] ?? '', $gal['sort_order'] ?? 0]);
            }
        }

        $pdo->commit();
        http_response_code(201);
        echo json_encode(['success' => true, 'blog_id' => $blogId]);

    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

else if ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'ID is required']);
        exit;
    }

    $id = intval($data['id']);

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare("UPDATE blogs SET title=?, slug=?, short_description=?, long_description=?, featured_image=?, category_name=?, status=?, tags=?, keywords=?, seo=? WHERE id=?");
        
        $stmt->execute([
            $data['title'] ?? '',
            $data['slug'] ?? uniqid('blog-'),
            $data['short_description'] ?? '',
            $data['long_description'] ?? '',
            $data['featured_image'] ?? '',
            $data['category_name'] ?? '',
            $data['status'] ?? 'Draft',
            json_encode($data['tags'] ?? []),
            json_encode($data['keywords'] ?? []),
            json_encode($data['seo'] ?? []),
            $id
        ]);

        // Replace sections
        $pdo->prepare("DELETE FROM blog_sections WHERE blog_id=?")->execute([$id]);
        if (isset($data['sections']) && is_array($data['sections'])) {
            $stmtSec = $pdo->prepare("INSERT INTO blog_sections (blog_id, heading, content, image_url, sort_order) VALUES (?, ?, ?, ?, ?)");
            foreach ($data['sections'] as $sec) {
                $stmtSec->execute([$id, $sec['heading'] ?? '', $sec['content'] ?? '', $sec['image_url'] ?? '', $sec['sort_order'] ?? 0]);
            }
        }

        // Replace gallery
        $pdo->prepare("DELETE FROM blog_gallery WHERE blog_id=?")->execute([$id]);
        if (isset($data['gallery']) && is_array($data['gallery'])) {
            $stmtGal = $pdo->prepare("INSERT INTO blog_gallery (blog_id, image_url, alt_text, caption, sort_order) VALUES (?, ?, ?, ?, ?)");
            foreach ($data['gallery'] as $gal) {
                $stmtGal->execute([$id, $gal['image_url'] ?? '', $gal['alt_text'] ?? '', $gal['caption'] ?? '', $gal['sort_order'] ?? 0]);
            }
        }

        $pdo->commit();
        echo json_encode(['success' => true, 'blog_id' => $id]);

    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

else if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID is required']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM blogs WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'deleted_id' => $id]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>
