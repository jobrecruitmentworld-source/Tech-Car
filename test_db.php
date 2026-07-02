<?php
require 'backend/api/v1/config/Database.php';
$c=Database::getConnection();
try { 
    $c->query('SELECT 1 FROM products'); 
    echo 'exists'; 
} catch(Exception $e) { 
    echo $e->getMessage(); 
}
?>
