<?php
// backend/api/init_db.php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$host = 'localhost';
$user = 'root';
$password = ''; // Default XAMPP password
$dbname = 'blog_db';

try {
    // 1. Connect without database to create it if it doesn't exist
    $pdo = new PDO("mysql:host=$host;charset=utf8mb4", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create database
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname`");
    
    // Connect to the new database
    $pdo->exec("USE `$dbname`");
    
    // 2. Create Blogs Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS blogs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        short_description TEXT,
        long_description LONGTEXT,
        featured_image TEXT,
        category_name VARCHAR(100),
        status VARCHAR(50) DEFAULT 'Draft',
        views INT DEFAULT 0,
        published_at DATETIME NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        tags JSON,
        keywords JSON,
        seo JSON
    )");
    
    // 3. Create Sections Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS blog_sections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        blog_id INT NOT NULL,
        heading VARCHAR(255),
        content LONGTEXT,
        image_url TEXT,
        sort_order INT DEFAULT 0,
        FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE
    )");
    
    // 4. Create Gallery Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS blog_gallery (
        id INT AUTO_INCREMENT PRIMARY KEY,
        blog_id INT NOT NULL,
        image_url TEXT,
        alt_text VARCHAR(255),
        caption VARCHAR(255),
        sort_order INT DEFAULT 0,
        FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE
    )");
    
    echo json_encode(['success' => true, 'message' => 'Database and tables created successfully!']);

} catch (PDOException $e) {
    echo json_encode(['error' => 'Database initialization failed: ' . $e->getMessage()]);
}
?>
