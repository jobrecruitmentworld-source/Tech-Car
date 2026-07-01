<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (isset($_GET['slug'])) {
        // Fetch single blog
        $slug = $_GET['slug'];
        $stmt = $conn->prepare("SELECT b.*, c.category_name, u.username as author_name FROM blogs b LEFT JOIN categories c ON b.category_id = c.id LEFT JOIN users u ON b.author_id = u.id WHERE b.slug = ? AND b.status = 'Published'");
        $stmt->execute([$slug]);
        $blog = $stmt->fetch();

        if (!$blog) {
            sendJson(["error" => "Blog not found"], 404);
        }

        $blog_id = $blog['id'];

        // Fetch relations
        $stmt = $conn->prepare("SELECT * FROM blog_sections WHERE blog_id = ? ORDER BY sort_order ASC");
        $stmt->execute([$blog_id]);
        $blog['sections'] = $stmt->fetchAll();

        $stmt = $conn->prepare("SELECT * FROM blog_images WHERE blog_id = ? ORDER BY sort_order ASC");
        $stmt->execute([$blog_id]);
        $blog['images'] = $stmt->fetchAll();

        $stmt = $conn->prepare("SELECT * FROM blog_gallery WHERE blog_id = ? ORDER BY sort_order ASC");
        $stmt->execute([$blog_id]);
        $blog['gallery'] = $stmt->fetchAll();

        $stmt = $conn->prepare("SELECT * FROM blog_tags WHERE blog_id = ?");
        $stmt->execute([$blog_id]);
        $blog['tags'] = $stmt->fetchAll();

        $stmt = $conn->prepare("SELECT * FROM blog_keywords WHERE blog_id = ?");
        $stmt->execute([$blog_id]);
        $blog['keywords'] = $stmt->fetchAll();

        $stmt = $conn->prepare("SELECT * FROM blog_seo WHERE blog_id = ?");
        $stmt->execute([$blog_id]);
        $blog['seo'] = $stmt->fetch();

        // Increment views
        $conn->prepare("UPDATE blogs SET views = views + 1 WHERE id = ?")->execute([$blog_id]);

        sendJson($blog);
    } else {
        // Fetch all blogs (published only, unless admin flag is present)
        $isAdmin = isset($_GET['admin']) && $_GET['admin'] === 'true';
        $statusCondition = $isAdmin ? "1=1" : "b.status = 'Published'";

        $stmt = $conn->prepare("SELECT b.*, c.category_name, u.username as author_name, 
            (SELECT meta_description FROM blog_seo WHERE blog_id = b.id LIMIT 1) as meta_description 
            FROM blogs b 
            LEFT JOIN categories c ON b.category_id = c.id 
            LEFT JOIN users u ON b.author_id = u.id 
            WHERE $statusCondition 
            ORDER BY b.created_at DESC");
        $stmt->execute();
        $blogs = $stmt->fetchAll();

        // Structure response for Next.js (which expects blog.seo.meta_description)
        foreach ($blogs as &$b) {
            $b['seo'] = ['meta_description' => $b['meta_description']];
            unset($b['meta_description']);
        }
        sendJson($blogs);
    }
}

if ($method === 'POST') {
    // Receive JSON data
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) sendJson(["error" => "Invalid JSON payload"], 400);

    // Support both single blog object or array of blogs
    $blogsToInsert = isset($data[0]) ? $data : [$data];
    $insertedIds = [];

    try {
        $conn->beginTransaction();

        foreach ($blogsToInsert as $blogData) {
            // 1. Insert Blog
            $stmt = $conn->prepare("INSERT INTO blogs (title, slug, short_description, featured_image, category_id, author_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $blogData['title'] ?? '',
                $blogData['slug'] ?? '',
                $blogData['short_description'] ?? '',
                $blogData['featured_image'] ?? '',
                $blogData['category_id'] ?? 1,
                $blogData['author_id'] ?? 1,
                $blogData['status'] ?? 'Published'
            ]);
            $blog_id = $conn->lastInsertId();
            $insertedIds[] = $blog_id;

            // 2. Insert Sections
            if (isset($blogData['sections']) && is_array($blogData['sections'])) {
                $stmt = $conn->prepare("INSERT INTO blog_sections (blog_id, heading, content, image_url, sort_order) VALUES (?, ?, ?, ?, ?)");
                foreach ($blogData['sections'] as $i => $sec) {
                    $stmt->execute([$blog_id, $sec['heading'] ?? '', $sec['content'] ?? '', $sec['image_url'] ?? '', $i]);
                }
            }

            // 3. Insert Gallery Images
            if (isset($blogData['gallery']) && is_array($blogData['gallery'])) {
                $stmt = $conn->prepare("INSERT INTO blog_gallery (blog_id, image_url, alt_text, caption, sort_order) VALUES (?, ?, ?, ?, ?)");
                foreach ($blogData['gallery'] as $i => $img) {
                    $stmt->execute([$blog_id, $img['image_url'] ?? '', $img['alt_text'] ?? '', $img['caption'] ?? '', $i]);
                }
            }

            // 4. Insert Tags
            if (isset($blogData['tags']) && is_array($blogData['tags'])) {
                $stmt = $conn->prepare("INSERT INTO blog_tags (blog_id, tag) VALUES (?, ?)");
                foreach ($blogData['tags'] as $tag) {
                    $tagVal = is_array($tag) ? ($tag['tag'] ?? '') : $tag;
                    $stmt->execute([$blog_id, $tagVal]);
                }
            }

            // 5. Insert Keywords
            if (isset($blogData['keywords']) && is_array($blogData['keywords'])) {
                $stmt = $conn->prepare("INSERT INTO blog_keywords (blog_id, keyword) VALUES (?, ?)");
                foreach ($blogData['keywords'] as $kw) {
                    $kwVal = is_array($kw) ? ($kw['keyword'] ?? '') : $kw;
                    $stmt->execute([$blog_id, $kwVal]);
                }
            }

            // 6. Insert SEO
            if (isset($blogData['seo']) && is_array($blogData['seo'])) {
                $stmt = $conn->prepare("INSERT INTO blog_seo (blog_id, meta_title, meta_description, canonical_url, og_title, og_description, og_image, twitter_card, schema_jsonld, focus_keyword, seo_score, readability_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([
                    $blog_id,
                    $blogData['seo']['meta_title'] ?? '',
                    $blogData['seo']['meta_description'] ?? '',
                    $blogData['seo']['canonical_url'] ?? '',
                    $blogData['seo']['og_title'] ?? '',
                    $blogData['seo']['og_description'] ?? '',
                    $blogData['seo']['og_image'] ?? '',
                    $blogData['seo']['twitter_card'] ?? '',
                    $blogData['seo']['schema_jsonld'] ?? '',
                    $blogData['seo']['focus_keyword'] ?? '',
                    $blogData['seo']['seo_score'] ?? null,
                    $blogData['seo']['readability_score'] ?? null
                ]);
            }
        }

        $conn->commit();
        sendJson(["success" => true, "inserted_count" => count($insertedIds), "blog_ids" => $insertedIds], 201);
    } catch (Exception $e) {
        $conn->rollBack();
        sendJson(["error" => "Failed to save blogs: " . $e->getMessage()], 500);
    }
}
?>
