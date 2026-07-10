<?php
session_set_cookie_params([
    'lifetime' => 7 * 24 * 60 * 60,
    'path' => '/',
    'httponly' => true,
    'samesite' => 'Lax',
    'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
]);
session_name('clientum_session');
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function requireAuth(): void {
    if (empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'No autenticado.']);
        exit;
    }
}

function requireAdmin(): void {
    if (empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'No autenticado.']);
        exit;
    }
    try {
        $db = getDB();
        $stmt = $db->prepare("SELECT role FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $row = $stmt->fetch();
        if (!$row || $row['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Se requiere rol de administrador.']);
            exit;
        }
        $_SESSION['role'] = $row['role'];
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error verificando permisos.']);
        exit;
    }
}

function currentUser(): ?array {
    if (empty($_SESSION['user_id'])) return null;
    return [
        'id' => $_SESSION['user_id'],
        'username' => $_SESSION['username'] ?? '',
        'role' => $_SESSION['role'] ?? 'user',
    ];
}
