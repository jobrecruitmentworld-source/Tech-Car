<?php
// backend/api/v1/middleware/AuthMiddleware.php

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../services/JWTService.php';

class AuthMiddleware {
    public static function authenticate() {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized. Token missing.']);
            exit();
        }

        $token = $matches[1];
        $payload = JWTService::verifyToken($token);

        if (!$payload) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized. Invalid or expired token.']);
            exit();
        }

        return $payload; // Returns user info (user_id, email, etc.)
    }

    public static function requireRole($requiredRoles) {
        $user = self::authenticate();
        $userId = $user['user_id'];
        
        $conn = Database::getConnection();
        $stmt = $conn->prepare("
            SELECT r.name 
            FROM roles r 
            JOIN user_roles ur ON r.id = ur.role_id 
            WHERE ur.user_id = ?
        ");
        $stmt->execute([$userId]);
        $roles = $stmt->fetchAll(PDO::FETCH_COLUMN);

        $hasRole = false;
        foreach ((array)$requiredRoles as $role) {
            if (in_array($role, $roles)) {
                $hasRole = true;
                break;
            }
        }

        if (!$hasRole) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden. Insufficient permissions.']);
            exit();
        }

        return $user;
    }
}

// Polyfill for apache_request_headers if not running under Apache
if (!function_exists('apache_request_headers')) {
    function apache_request_headers() {
        $headers = [];
        foreach ($_SERVER as $key => $value) {
            if (substr($key, 0, 5) == 'HTTP_') {
                $header = str_replace(' ', '-', ucwords(str_replace('_', ' ', strtolower(substr($key, 5)))));
                $headers[$header] = $value;
            }
        }
        return $headers;
    }
}
?>
