<?php
// backend/api/v1/controllers/MediaController.php

require_once __DIR__ . '/../config/Database.php';

class MediaController {
    public static function upload() {
        header("Content-Type: application/json");
        
        if (!isset($_FILES['file'])) {
            http_response_code(400);
            echo json_encode(['error' => 'No file uploaded']);
            return;
        }

        $file = $_FILES['file'];
        
        // Basic validation
        $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
        if (!in_array($file['type'], $allowedTypes)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid file type']);
            return;
        }

        $uploadDir = __DIR__ . '/../../../uploads/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        // Generate UUID for file name and DB id
        $id = sprintf( '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ),
            mt_rand( 0, 0x0fff ) | 0x4000, mt_rand( 0, 0x3fff ) | 0x8000,
            mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff )
        );

        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $newFileName = $id . '.' . $ext;
        $destination = $uploadDir . $newFileName;
        $publicPath = '/Blog_sys/uploads/' . $newFileName;

        if (move_uploaded_file($file['tmp_name'], $destination)) {
            $conn = Database::getConnection();
            $stmt = $conn->prepare("
                INSERT INTO media_files (id, file_name, file_path, file_size, mime_type, provider) 
                VALUES (?, ?, ?, ?, ?, 'local')
            ");
            $stmt->execute([$id, $file['name'], $publicPath, $file['size'], $file['type']]);

            echo json_encode([
                'success' => true,
                'media' => [
                    'id' => $id,
                    'file_name' => $file['name'],
                    'url' => $publicPath
                ]
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to move uploaded file']);
        }
    }
}
?>
