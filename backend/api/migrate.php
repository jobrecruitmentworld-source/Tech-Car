<?php
// backend/api/migrate.php
// Script to migrate data from old CMS tables (blogs, blog_sections, blog_gallery)
// to the new Enterprise CMS tables (posts, categories, media_files, entity_media, tags, etc.)

header("Content-Type: text/plain");

$host = 'localhost';
$user = 'root';
$password = '';
$dbname = 'blog_db';

function generate_uuid() {
    return sprintf( '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ),
        mt_rand( 0, 0xffff ),
        mt_rand( 0, 0x0fff ) | 0x4000,
        mt_rand( 0, 0x3fff ) | 0x8000,
        mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff )
    );
}

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Starting Migration...\n";

    // 1. Migrate Categories
    echo "Migrating Categories...\n";
    $stmt = $pdo->query("SELECT DISTINCT category_name FROM blogs WHERE category_name IS NOT NULL");
    $old_categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $category_map = []; // Map old category name to new category ID

    foreach ($old_categories as $cat) {
        $name = $cat['category_name'];
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name)));
        
        $checkStmt = $pdo->prepare("SELECT id FROM categories WHERE slug = ?");
        $checkStmt->execute([$slug]);
        $existing = $checkStmt->fetchColumn();
        
        if (!$existing) {
            $insertCat = $pdo->prepare("INSERT INTO categories (name, slug) VALUES (?, ?)");
            $insertCat->execute([$name, $slug]);
            $category_map[$name] = $pdo->lastInsertId();
        } else {
            $category_map[$name] = $existing;
        }
    }

    // 2. Migrate Blogs to Posts
    echo "Migrating Blogs to Posts...\n";
    $blogs = $pdo->query("SELECT * FROM blogs")->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($blogs as $blog) {
        $post_id = generate_uuid();
        $cat_id = isset($category_map[$blog['category_name']]) ? $category_map[$blog['category_name']] : null;
        
        // Check if post already exists (by slug)
        $checkPost = $pdo->prepare("SELECT id FROM posts WHERE slug = ?");
        $checkPost->execute([$blog['slug']]);
        if ($checkPost->fetchColumn()) {
            echo "Skipping {$blog['slug']} (Already migrated)\n";
            continue;
        }

        // Insert Post
        $insertPost = $pdo->prepare("
            INSERT INTO posts (id, type, category_id, title, slug, summary, content, status, views, published_at, created_at, updated_at) 
            VALUES (?, 'blog', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $insertPost->execute([
            $post_id,
            $cat_id,
            $blog['title'],
            $blog['slug'],
            $blog['short_description'],
            $blog['long_description'],
            $blog['status'] == 'Published' ? 'Published' : 'Draft',
            $blog['views'],
            $blog['published_at'],
            $blog['created_at'],
            $blog['updated_at']
        ]);

        // Featured Image
        if (!empty($blog['featured_image'])) {
            $media_id = generate_uuid();
            $pdo->prepare("INSERT INTO media_files (id, file_name, file_path, provider) VALUES (?, ?, ?, 'unsplash')")
                ->execute([$media_id, 'featured_' . $blog['slug'], $blog['featured_image']]);
            
            $pdo->prepare("INSERT INTO entity_media (entity_type, entity_id, media_id, context) VALUES ('post', ?, ?, 'featured')")
                ->execute([$post_id, $media_id]);
        }

        // SEO
        if (!empty($blog['seo'])) {
            $seo = json_decode($blog['seo'], true);
            $pdo->prepare("INSERT INTO seo_metadata (entity_type, entity_id, meta_title, meta_description) VALUES ('post', ?, ?, ?)")
                ->execute([$post_id, $seo['meta_title'] ?? '', $seo['meta_description'] ?? '']);
        }

        // Tags & Keywords
        $tagsList = [];
        if (!empty($blog['tags'])) {
            $tags = json_decode($blog['tags'], true);
            foreach($tags as $t) { $tagsList[] = $t['tag']; }
        }
        if (!empty($blog['keywords'])) {
            $kws = json_decode($blog['keywords'], true);
            foreach($kws as $k) { $tagsList[] = $k['keyword']; }
        }
        
        $tagsList = array_unique(array_filter($tagsList));
        foreach ($tagsList as $tagName) {
            $tagSlug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $tagName)));
            
            $checkTag = $pdo->prepare("SELECT id FROM tags WHERE slug = ?");
            $checkTag->execute([$tagSlug]);
            $tag_id = $checkTag->fetchColumn();
            
            if (!$tag_id) {
                $pdo->prepare("INSERT INTO tags (name, slug) VALUES (?, ?)")->execute([$tagName, $tagSlug]);
                $tag_id = $pdo->lastInsertId();
            }
            
            $pdo->prepare("INSERT IGNORE INTO entity_tags (entity_type, entity_id, tag_id) VALUES ('post', ?, ?)")
                ->execute([$post_id, $tag_id]);
        }

        // Blog Sections
        $sections = $pdo->prepare("SELECT * FROM blog_sections WHERE blog_id = ?");
        $sections->execute([$blog['id']]);
        foreach ($sections->fetchAll(PDO::FETCH_ASSOC) as $sec) {
            $pdo->prepare("INSERT INTO post_sections (post_id, heading, content, sort_order) VALUES (?, ?, ?, ?)")
                ->execute([$post_id, $sec['heading'], $sec['content'], $sec['sort_order']]);
            
            if (!empty($sec['image_url'])) {
                $media_id = generate_uuid();
                $pdo->prepare("INSERT INTO media_files (id, file_name, file_path, provider) VALUES (?, ?, ?, 'unsplash')")
                    ->execute([$media_id, 'section_img', $sec['image_url']]);
                
                $pdo->prepare("INSERT INTO entity_media (entity_type, entity_id, media_id, context, sort_order) VALUES ('post', ?, ?, 'section', ?)")
                    ->execute([$post_id, $media_id, $sec['sort_order']]);
            }
        }

        // Blog Gallery
        $gallery = $pdo->prepare("SELECT * FROM blog_gallery WHERE blog_id = ?");
        $gallery->execute([$blog['id']]);
        foreach ($gallery->fetchAll(PDO::FETCH_ASSOC) as $gal) {
            if (!empty($gal['image_url'])) {
                $media_id = generate_uuid();
                $pdo->prepare("INSERT INTO media_files (id, file_name, file_path, alt_text, provider) VALUES (?, ?, ?, ?, 'unsplash')")
                    ->execute([$media_id, 'gallery_img', $gal['image_url'], $gal['alt_text']]);
                
                $pdo->prepare("INSERT INTO entity_media (entity_type, entity_id, media_id, context, sort_order) VALUES ('post', ?, ?, 'gallery', ?)")
                    ->execute([$post_id, $media_id, $gal['sort_order']]);
            }
        }
    }

    echo "Migration Completed Successfully!\n";

} catch (PDOException $e) {
    echo "Database error: " . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
