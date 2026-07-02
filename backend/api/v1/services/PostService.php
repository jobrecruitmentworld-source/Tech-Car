<?php
// backend/api/v1/services/PostService.php
require_once __DIR__ . '/../config/Database.php';

class PostService {
    private $conn;

    public function __construct() {
        $this->conn = Database::getConnection();
    }

    public function getPosts($isAdmin = false) {
        $sql = "
            SELECT p.*, c.name as category_name, 
                   (SELECT file_path FROM media_files mf JOIN entity_media em ON mf.id = em.media_id WHERE em.entity_type = 'post' AND em.entity_id = p.id AND em.context = 'featured' LIMIT 1) as featured_image,
                   (SELECT JSON_OBJECT('meta_title', meta_title, 'meta_description', meta_description) FROM seo_metadata WHERE entity_type = 'post' AND entity_id = p.id LIMIT 1) as seo_json
            FROM posts p
            LEFT JOIN categories c ON p.category_id = c.id
        ";
        
        if (!$isAdmin) {
            $sql .= " WHERE p.status = 'Published' ";
        }
        
        $sql .= " ORDER BY p.created_at DESC";
        
        $stmt = $this->conn->query($sql);
        $posts = $stmt->fetchAll();

        // Format to match old blogs.php
        $formatted = [];
        foreach ($posts as $p) {
            // Fetch tags
            $tagStmt = $this->conn->prepare("SELECT t.name as tag FROM tags t JOIN entity_tags et ON t.id = et.tag_id WHERE et.entity_type = 'post' AND et.entity_id = ?");
            $tagStmt->execute([$p['id']]);
            $tags = $tagStmt->fetchAll();

            $formatted[] = [
                'id' => $p['id'],
                'title' => $p['title'],
                'slug' => $p['slug'],
                'short_description' => $p['summary'],
                'long_description' => $p['content'],
                'featured_image' => $p['featured_image'] ?: '',
                'category_name' => $p['category_name'],
                'status' => $p['status'],
                'views' => $p['views'],
                'published_at' => $p['published_at'],
                'created_at' => $p['created_at'],
                'updated_at' => $p['updated_at'],
                'tags' => $tags,
                'keywords' => [], // For backward compatibility
                'seo' => $p['seo_json'] ? json_decode($p['seo_json'], true) : []
            ];
        }
        return $formatted;
    }

    public function getPostBySlugOrId($param, $isId = false, $isAdmin = false) {
        $sql = "
            SELECT p.*, c.name as category_name, 
                   (SELECT file_path FROM media_files mf JOIN entity_media em ON mf.id = em.media_id WHERE em.entity_type = 'post' AND em.entity_id = p.id AND em.context = 'featured' LIMIT 1) as featured_image,
                   (SELECT JSON_OBJECT('meta_title', meta_title, 'meta_description', meta_description) FROM seo_metadata WHERE entity_type = 'post' AND entity_id = p.id LIMIT 1) as seo_json
            FROM posts p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE " . ($isId ? "p.id = ?" : "p.slug = ?");
            
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$param]);
        $p = $stmt->fetch();

        if (!$p) return null;

        // Tags
        $tagStmt = $this->conn->prepare("SELECT t.name as tag FROM tags t JOIN entity_tags et ON t.id = et.tag_id WHERE et.entity_type = 'post' AND et.entity_id = ?");
        $tagStmt->execute([$p['id']]);
        $tags = $tagStmt->fetchAll();

        // Sections
        $secStmt = $this->conn->prepare("
            SELECT ps.heading, ps.content, ps.sort_order,
                   (SELECT file_path FROM media_files mf JOIN entity_media em ON mf.id = em.media_id WHERE em.entity_type = 'post' AND em.entity_id = ps.post_id AND em.context = 'section' AND em.sort_order = ps.sort_order LIMIT 1) as image_url
            FROM post_sections ps
            WHERE ps.post_id = ? ORDER BY ps.sort_order ASC
        ");
        $secStmt->execute([$p['id']]);
        $sections = $secStmt->fetchAll();

        // Gallery
        $galStmt = $this->conn->prepare("
            SELECT mf.file_path as image_url, mf.alt_text, em.sort_order
            FROM entity_media em
            JOIN media_files mf ON em.media_id = mf.id
            WHERE em.entity_type = 'post' AND em.entity_id = ? AND em.context = 'gallery'
            ORDER BY em.sort_order ASC
        ");
        $galStmt->execute([$p['id']]);
        $gallery = $galStmt->fetchAll();

        // Increase views
        if (!$isAdmin) {
            $this->conn->prepare("UPDATE posts SET views = views + 1 WHERE id = ?")->execute([$p['id']]);
            $p['views']++;
        }

        return [
            'id' => $p['id'],
            'title' => $p['title'],
            'slug' => $p['slug'],
            'short_description' => $p['summary'],
            'long_description' => $p['content'],
            'featured_image' => $p['featured_image'] ?: '',
            'category_name' => $p['category_name'],
            'status' => $p['status'],
            'views' => $p['views'],
            'published_at' => $p['published_at'],
            'created_at' => $p['created_at'],
            'updated_at' => $p['updated_at'],
            'tags' => $tags,
            'keywords' => [], 
            'seo' => $p['seo_json'] ? json_decode($p['seo_json'], true) : [],
            'sections' => $sections,
            'gallery' => $gallery
        ];
    }
}
?>
