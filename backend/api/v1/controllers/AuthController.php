<?php
// backend/api/v1/controllers/AuthController.php

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../services/JWTService.php';

class AuthController {
    public static function login() {
        header("Content-Type: application/json");
        $data = json_decode(file_get_contents('php://input'), true);

        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        if (!$email || !$password) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password are required.']);
            return;
        }

        $conn = Database::getConnection();
        $stmt = $conn->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password_hash'])) {
            if ($user['status'] !== 'Active') {
                http_response_code(403);
                echo json_encode(['error' => 'User account is not active.']);
                return;
            }

            // Fetch roles
            $stmt = $conn->prepare("
                SELECT r.name 
                FROM roles r 
                JOIN user_roles ur ON r.id = ur.role_id 
                WHERE ur.user_id = ?
            ");
            $stmt->execute([$user['id']]);
            $roles = $stmt->fetchAll(PDO::FETCH_COLUMN);

            // Update last login
            $conn->prepare("UPDATE users SET last_login = NOW() WHERE id = ?")->execute([$user['id']]);

            $payload = [
                'user_id' => $user['id'],
                'email' => $user['email'],
                'roles' => $roles
            ];

            $token = JWTService::generateToken($payload);

            echo json_encode([
                'success' => true,
                'token' => $token,
                'user' => [
                    'id' => $user['id'],
                    'first_name' => $user['first_name'],
                    'last_name' => $user['last_name'],
                    'email' => $user['email'],
                    'roles' => $roles
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid email or password.']);
        }
    }

    public static function register() {
        header("Content-Type: application/json");
        $data = json_decode(file_get_contents('php://input'), true);

        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        $firstName = $data['first_name'] ?? '';
        $lastName = $data['last_name'] ?? '';

        if (!$email || !$password) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password are required.']);
            return;
        }

        $conn = Database::getConnection();
        
        // Check if email exists
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetchColumn()) {
            http_response_code(409);
            echo json_encode(['error' => 'Email already registered.']);
            return;
        }

        try {
            $conn->beginTransaction();

            $userId = sprintf( '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ),
                mt_rand( 0, 0x0fff ) | 0x4000, mt_rand( 0, 0x3fff ) | 0x8000,
                mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff )
            );
            $passwordHash = password_hash($password, PASSWORD_BCRYPT);

            $stmt = $conn->prepare("INSERT INTO users (id, email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$userId, $email, $passwordHash, $firstName, $lastName]);

            // Assign default role 'User'
            $stmt = $conn->prepare("SELECT id FROM roles WHERE name = 'User'");
            $stmt->execute();
            $roleId = $stmt->fetchColumn();
            
            if ($roleId) {
                $conn->prepare("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)")->execute([$userId, $roleId]);
            }

            $conn->commit();
            
            echo json_encode(['success' => true, 'message' => 'User registered successfully.']);
        } catch (Exception $e) {
            $conn->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'Registration failed: ' . $e->getMessage()]);
        }
    }
}
?>
