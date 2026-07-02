<?php
// backend/api/v1/controllers/BlogController.php

require_once __DIR__ . '/../config/Database.php';

class BlogController {

    public static function checkSlug() {
        header("Content-Type: application/json");
        $conn = Database::getConnection();
        
        $input = json_decode(file_get_contents('php://input'), true);
        $slug = $input['slug'] ?? '';
        $exclude_id = $input['exclude_id'] ?? null;

        if (empty($slug)) {
            echo json_encode(['available' => false]);
            return;
        }

        $sql = "SELECT id FROM posts WHERE slug = ?";
        $params = [$slug];

        if ($exclude_id) {
            $sql .= " AND id != ?";
            $params[] = $exclude_id;
        }

        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        
        echo json_encode(['available' => $stmt->rowCount() === 0, 'slug' => $slug]);
    }

    public static function bulkCreate() {
        header("Content-Type: application/json");
        $conn = Database::getConnection();
        $input = json_decode(file_get_contents('php://input'), true);
        
        $blogs = $input['blogs'] ?? [];
        $userId = $input['user_id'] ?? null; // Ideally grabbed from JWT token in AuthMiddleware

        if (empty($blogs)) {
            http_response_code(400);
            echo json_encode(['error' => 'No blogs provided.']);
            return;
        }

        try {
            // START ACID TRANSACTION
            $conn->beginTransaction();

            foreach ($blogs as $blog) {
                // 1. Generate UUID for Post
                $postId = sprintf( '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                    mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ),
                    mt_rand( 0, 0x0fff ) | 0x4000, mt_rand( 0, 0x3fff ) | 0x8000,
                    mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff )
                );

                // Insert or Update Post
                $stmt = $conn->prepare("
                    INSERT INTO posts (id, author_id, category_id, title, slug, summary, content, status) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE 
                        title=VALUES(title), summary=VALUES(summary), content=VALUES(content), status=VALUES(status)
                ");
                
                // Content is built by joining section content for a simple fallback, or store raw JSON
                $fullContent = isset($blog['sections']) ? json_encode($blog['sections']) : '';
                
                $stmt->execute([
                    $postId, 
                    $userId, 
                    $blog['category_id'] ?? null,
                    $blog['title'],
                    $blog['slug'],
                    $blog['description'] ?? '',
                    $fullContent,
                    $blog['status'] ?? 'Draft'
                ]);

                // 2. Insert Post Sections (Delete old if exists for this post, then insert)
                $conn->prepare("DELETE FROM post_sections WHERE post_id = ?")->execute([$postId]);
                if (!empty($blog['sections'])) {
                    $secStmt = $conn->prepare("INSERT INTO post_sections (post_id, heading, content, sort_order) VALUES (?, ?, ?, ?)");
                    foreach ($blog['sections'] as $index => $section) {
                        $secStmt->execute([$postId, $section['heading'], $section['content'], $index]);
                    }
                }

                // 3. Insert SEO Metadata
                if (!empty($blog['seo'])) {
                    $seo = $blog['seo'];
                    $seoStmt = $conn->prepare("
                        INSERT INTO seo_metadata (entity_type, entity_id, meta_title, meta_description, meta_keywords) 
                        VALUES ('post', ?, ?, ?, ?)
                        ON DUPLICATE KEY UPDATE 
                            meta_title=VALUES(meta_title), meta_description=VALUES(meta_description), meta_keywords=VALUES(meta_keywords)
                    ");
                    
                    $metaKeywords = implode(',', $blog['keywords'] ?? []);
                    $seoStmt->execute([$postId, $seo['metaTitle'], $seo['metaDescription'], $metaKeywords]);
                }

                // 4. Tags
                $conn->prepare("DELETE FROM entity_tags WHERE entity_type='post' AND entity_id=?")->execute([$postId]);
                if (!empty($blog['tags'])) {
                    foreach ($blog['tags'] as $tagName) {
                        // Get or Create Tag
                        $tagSlug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $tagName)));
                        
                        $tagStmt = $conn->prepare("SELECT id FROM tags WHERE slug = ?");
                        $tagStmt->execute([$tagSlug]);
                        $tagId = $tagStmt->fetchColumn();
                        
                        if (!$tagId) {
                            $conn->prepare("INSERT INTO tags (name, slug) VALUES (?, ?)")->execute([$tagName, $tagSlug]);
                            $tagId = $conn->lastInsertId();
                        }
                        
                        // Link Tag
                        $conn->prepare("INSERT IGNORE INTO entity_tags (entity_type, entity_id, tag_id) VALUES ('post', ?, ?)")->execute([$postId, $tagId]);
                    }
                }
            }

            // ALL SUCCESSFUL - COMMIT TRANSACTION (ACID)
            $conn->commit();
            
            echo json_encode(['success' => true, 'message' => 'All blogs saved successfully.']);

        } catch (Exception $e) {
            // ON FAILURE - ROLLBACK TRANSACTION
            $conn->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'Transaction failed: ' . $e->getMessage()]);
        }
    }
}
?>
