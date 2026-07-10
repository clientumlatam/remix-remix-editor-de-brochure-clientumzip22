<?php
// Main router for Clientum CRM PHP application
define('ROOT', __DIR__);

// Headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = rtrim($uri, '/') ?: '/';

// Strip query string from URI for routing
$method = $_SERVER['REQUEST_METHOD'];

// Serve static assets from assets/ folder
if (preg_match('#^/assets/(.+)$#', $uri, $m)) {
    $file = ROOT . '/assets/' . $m[1];
    if (file_exists($file)) {
        $ext = pathinfo($file, PATHINFO_EXTENSION);
        $mime = match($ext) {
            'css' => 'text/css',
            'js' => 'application/javascript',
            'png' => 'image/png',
            'jpg', 'jpeg' => 'image/jpeg',
            'svg' => 'image/svg+xml',
            'ico' => 'image/x-icon',
            default => 'application/octet-stream',
        };
        header("Content-Type: $mime");
        readfile($file);
        exit;
    }
    http_response_code(404);
    exit;
}

// API Routes
if (str_starts_with($uri, '/api/')) {
    require ROOT . '/config/db.php';
    require ROOT . '/config/session.php';

    // Auth routes
    if (preg_match('#^/api/auth/(\w+)$#', $uri, $m)) {
        $_GET['endpoint'] = $m[1];
        require ROOT . '/api/auth.php';
        exit;
    }

    // Generate route
    if ($uri === '/api/generate') {
        require ROOT . '/api/generate.php';
        exit;
    }

    // Scrape route
    if ($uri === '/api/scrape-places') {
        require ROOT . '/api/scrape.php';
        exit;
    }

    // CRM CRUD routes: /api/crm/{entity}[/{id}]
    if (preg_match('#^/api/crm/(\w+)(?:/([^/]+))?$#', $uri, $m)) {
        $_GET['entity'] = $m[1];
        if (!empty($m[2])) $_GET['id'] = $m[2];
        require ROOT . '/api/crm.php';
        exit;
    }

    http_response_code(404);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'API endpoint not found.']);
    exit;
}

// Serve SPA for all other routes
require ROOT . '/config/db.php';
require ROOT . '/config/session.php';
require ROOT . '/pages/app.php';
