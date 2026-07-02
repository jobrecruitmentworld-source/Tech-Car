<?php
require_once 'backend/api/v1/config/Database.php';

$conn = Database::getConnection();

// --- TEST 1: SUCCESSFUL COMMIT (ACID Durability & Atomicity) ---
echo "--- TEST 1: SUCCESSFUL TRANSACTION ---\n";
try {
    $conn->beginTransaction();
    
    // 1. Insert Post
    $postId = 'test-uuid-1';
    $conn->exec("INSERT INTO posts (id, title, slug) VALUES ('$postId', 'Test Title', 'test-slug-1')");
    
    // 2. Insert Section
    $conn->exec("INSERT INTO post_sections (post_id, heading) VALUES ('$postId', 'Test Heading')");
    
    $conn->commit();
    echo "[PASS] Transaction committed. Data saved.\n";
    
    // Verify
    $postCount = $conn->query("SELECT COUNT(*) FROM posts WHERE id = '$postId'")->fetchColumn();
    $sectionCount = $conn->query("SELECT COUNT(*) FROM post_sections WHERE post_id = '$postId'")->fetchColumn();
    echo "Verification -> Posts: $postCount, Sections: $sectionCount\n";
    
} catch(Exception $e) {
    $conn->rollBack();
    echo "[FAIL] Unexpected error.\n";
}

// --- TEST 2: FORCED FAILURE TO TRIGGER ROLLBACK (ACID Atomicity & Consistency) ---
echo "\n--- TEST 2: FORCED FAILURE TRANSACTION ---\n";
try {
    $conn->beginTransaction();
    
    // 1. Insert Post (Success)
    $postId2 = 'test-uuid-fail';
    $conn->exec("INSERT INTO posts (id, title, slug) VALUES ('$postId2', 'Fail Title', 'fail-slug-1')");
    
    // 2. Force Error (Invalid table name)
    $conn->exec("INSERT INTO invalid_table_name (bad_column) VALUES ('bad')");
    
    $conn->commit();
    echo "[FAIL] Should not reach here!\n";
    
} catch(Exception $e) {
    // 3. Rollback!
    $conn->rollBack();
    echo "[PASS] Error Caught -> Rolling back transaction!\n";
    
    // Verify NOTHING was inserted
    $postCountFail = $conn->query("SELECT COUNT(*) FROM posts WHERE id = '$postId2'")->fetchColumn();
    echo "Verification -> Posts saved: $postCountFail (Should be 0 because of Rollback)\n";
}

// Cleanup
$conn->exec("DELETE FROM posts WHERE id = 'test-uuid-1'");

?>
