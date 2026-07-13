<?php
/**
 * PHP Built-in Server Router for WordPress (Replit)
 */
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// Block direct access to sensitive paths
$blocked_prefixes = [
    '/wp-content/database/',
    '/wp-content/debug.log',
    '/wp-config.php',
    '/wp-config-sample.php',
];
foreach ($blocked_prefixes as $prefix) {
    if (str_starts_with($uri, $prefix)) {
        http_response_code(403);
        exit('Access denied.');
    }
}

// Serve any existing file (PHP built-in server executes .php files automatically)
if ($uri !== '/' && file_exists(__DIR__ . $uri)) {
    return false;
}

// Route everything else through WordPress front controller
require_once __DIR__ . '/index.php';
