<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    if (!isset($_FILES['file'])) {
        sendJson(["error" => "No file uploaded"], 400);
    }

    $file = $_FILES['file'];
    $seo_name = isset($_POST['seo_name']) ? $_POST['seo_name'] : 'image';
    
    // Sanitize seo_name
    $seo_name = preg_replace('/[^a-z0-9]+/', '-', strtolower($seo_name));
    $seo_name = trim($seo_name, '-');
    if (empty($seo_name)) $seo_name = 'image';

    $uploadDir = '../uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    
    if (!in_array($extension, $allowed)) {
        sendJson(["error" => "Invalid file type"], 400);
    }

    // Convert to WebP for performance
    $uniqueHash = substr(md5(uniqid()), 0, 6);
    $filename = $seo_name . '-' . $uniqueHash . '.webp';
    $filepath = $uploadDir . $filename;

    // Load image based on type
    $image = null;
    if ($extension == 'jpg' || $extension == 'jpeg') $image = imagecreatefromjpeg($file['tmp_name']);
    else if ($extension == 'png') $image = imagecreatefrompng($file['tmp_name']);
    else if ($extension == 'gif') $image = imagecreatefromgif($file['tmp_name']);
    else if ($extension == 'webp') $image = imagecreatefromwebp($file['tmp_name']);

    if (!$image) {
        sendJson(["error" => "Failed to process image"], 500);
    }

    // Save as WebP
    imagepalettetotruecolor($image);
    imagealphablending($image, true);
    imagesavealpha($image, true);
    imagewebp($image, $filepath, 85);
    imagedestroy($image);

    // Return the URL path
    sendJson(["url" => "/uploads/" . $filename]);
}
?>
