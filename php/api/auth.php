<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$path = $_GET['endpoint'] ?? '';

if ($method === 'GET' && $path === 'me') {
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
        if (!$row) {
            http_response_code(401);
            echo json_encode(['error' => 'No autenticado.']);
            exit;
        }
        $_SESSION['role'] = $row['role'];
        echo json_encode(['user' => [
            'id' => $_SESSION['user_id'],
            'username' => $_SESSION['username'],
            'role' => $row['role'],
        ]]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al verificar sesión.']);
    }
    exit;
}

$body = json_decode(file_get_contents('php://input'), true) ?? [];

if ($method === 'POST' && $path === 'register') {
    $username = trim($body['username'] ?? '');
    $password = $body['password'] ?? '';
    if (!$username || !$password) {
        http_response_code(400);
        echo json_encode(['error' => 'Usuario y contraseña son requeridos.']);
        exit;
    }
    if (!preg_match('/^[a-zA-Z0-9_.\-]{3,32}$/', $username)) {
        http_response_code(400);
        echo json_encode(['error' => 'El usuario debe tener entre 3 y 32 caracteres (letras, números, . _ -).']);
        exit;
    }
    if (strlen($password) < 8) {
        http_response_code(400);
        echo json_encode(['error' => 'La contraseña debe tener al menos 8 caracteres.']);
        exit;
    }
    try {
        $db = getDB();
        $check = $db->prepare("SELECT id FROM users WHERE username = ?");
        $check->execute([$username]);
        if ($check->fetch()) {
            http_response_code(409);
            echo json_encode(['error' => 'Ese usuario ya existe.']);
            exit;
        }
        $count = $db->query("SELECT COUNT(*) as c FROM users")->fetch();
        $role = ($count['c'] == 0) ? 'admin' : 'user';
        $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
        $ins = $db->prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)");
        $ins->execute([$username, $hash, $role]);
        $userId = (int)$db->lastInsertId();
        session_regenerate_id(true);
        $_SESSION['user_id'] = $userId;
        $_SESSION['username'] = $username;
        $_SESSION['role'] = $role;
        http_response_code(201);
        echo json_encode(['user' => ['id' => $userId, 'username' => $username, 'role' => $role]]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al registrar el usuario.']);
    }
    exit;
}

if ($method === 'POST' && $path === 'login') {
    $username = trim($body['username'] ?? '');
    $password = $body['password'] ?? '';
    if (!$username || !$password) {
        http_response_code(400);
        echo json_encode(['error' => 'Usuario y contraseña son requeridos.']);
        exit;
    }
    try {
        $db = getDB();
        $stmt = $db->prepare("SELECT id, username, password_hash, role FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();
        $validHash = $user['password_hash'] ?? '$2y$12$invalidsaltinvalidsaltinvalidsaltXXXXXXXXXXXXXXXXXXXX';
        $isValid = password_verify($password, $validHash);
        if (!$user || !$isValid) {
            http_response_code(401);
            echo json_encode(['error' => 'Usuario o contraseña incorrectos.']);
            exit;
        }
        session_regenerate_id(true);
        $_SESSION['user_id'] = (int)$user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];
        echo json_encode(['user' => ['id' => (int)$user['id'], 'username' => $user['username'], 'role' => $user['role']]]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al iniciar sesión.']);
    }
    exit;
}

if ($method === 'POST' && $path === 'logout') {
    session_destroy();
    setcookie('clientum_session', '', time() - 3600, '/');
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Endpoint no encontrado.']);
