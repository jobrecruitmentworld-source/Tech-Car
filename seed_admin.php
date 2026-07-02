<?php
require_once 'backend/api/v1/config/Database.php';

$conn = Database::getConnection();

try {
    // 1. Get 'Super Admin' role ID
    $stmt = $conn->prepare("SELECT id FROM roles WHERE name = 'Super Admin'");
    $stmt->execute();
    $roleId = $stmt->fetchColumn();

    if (!$roleId) {
        die("Error: Super Admin role not found. Please run migration first.\n");
    }

    $email = 'admin@enterprise.com';
    $password = 'admin123';
    $hash = password_hash($password, PASSWORD_DEFAULT);

    // 2. Check if admin exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $userId = $stmt->fetchColumn();

    if (!$userId) {
        // Generate UUID
        $userId = sprintf( '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ),
            mt_rand( 0, 0x0fff ) | 0x4000, mt_rand( 0, 0x3fff ) | 0x8000,
            mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff )
        );

        $stmt = $conn->prepare("INSERT INTO users (id, email, password_hash, first_name, last_name, status) VALUES (?, ?, ?, 'Super', 'Admin', 'Active')");
        $stmt->execute([$userId, $email, $hash]);

        $stmt = $conn->prepare("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)");
        $stmt->execute([$userId, $roleId]);

        echo "Admin user created successfully!\n";
    } else {
        // Ensure role is assigned
        $stmt = $conn->prepare("INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)");
        $stmt->execute([$userId, $roleId]);
        echo "Admin user already exists. Role ensured.\n";
    }

    echo "Email: " . $email . "\n";
    echo "Password: " . $password . "\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
