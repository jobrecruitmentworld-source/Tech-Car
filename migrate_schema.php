<?php
require_once 'backend/api/v1/config/Database.php';

$conn = Database::getConnection();

// Read the SQL file
$sqlFile = 'backend/enterprise_schema.sql';
if (file_exists($sqlFile)) {
    $sql = file_get_contents($sqlFile);
    try {
        // Execute the SQL queries
        $conn->exec($sql);
        echo "Database migration successful! All tables created.\n";
        
        $conn->exec("INSERT IGNORE INTO roles (name) VALUES ('Super Admin'), ('Admin'), ('Editor'), ('User')");
        echo "Default roles seeded successfully.\n";
    } catch(PDOException $e) {
        echo "Migration failed: " . $e->getMessage() . "\n";
    }
} else {
    echo "SQL file not found.\n";
}
?>
