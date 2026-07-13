<?php
define( 'WP_CACHE', true );

/**
 * WordPress Configuration - Replit (SQLite)
 */

define('DB_NAME',     'wordpress');
define('DB_USER',     'root');
define('DB_PASSWORD', '');
define('DB_HOST',     'localhost');
define('DB_CHARSET',  'utf8');
define('DB_COLLATE',  '');

/* SQLite integration */
define('DATABASE_TYPE', 'sqlite');
define('DB_DIR',  __DIR__ . '/wp-content/database/');
define('DB_FILE', 'wordpress.db');

$table_prefix = 'wp_';

define('AUTH_KEY',         'replit-auth-key-change-me-1');
define('SECURE_AUTH_KEY',  'replit-secure-auth-key-2');
define('LOGGED_IN_KEY',    'replit-logged-in-key-3');
define('NONCE_KEY',        'replit-nonce-key-4');
define('AUTH_SALT',        'replit-auth-salt-5');
define('SECURE_AUTH_SALT', 'replit-secure-auth-salt-6');
define('LOGGED_IN_SALT',   'replit-logged-in-salt-7');
define('NONCE_SALT',       'replit-nonce-salt-8');

define('WP_DEBUG',         true);
define('WP_DEBUG_LOG',     true);
define('WP_DEBUG_DISPLAY', false);

/* Replit: derive site URL from host header, validated against expected Replit domain patterns */
$_replit_host = $_SERVER['HTTP_HOST'] ?? 'localhost';
// Allow localhost, 127.0.0.1, *.replit.dev, and *.repl.co — reject anything else
if (!preg_match('/^(localhost(:\d+)?|127\.0\.0\.1(:\d+)?|[\w.-]+\.replit\.dev|[\w.-]+\.repl\.co)$/', $_replit_host)) {
    $_replit_host = 'localhost';
}
// Replit terminates SSL at its proxy — PHP never sees HTTPS directly.
// Tell WordPress SSL is active when the host is a Replit public domain or
// X-Forwarded-Proto says https, so WordPress doesn't issue a redirect loop.
$_replit_is_public = (bool) preg_match('/\.(replit\.dev|repl\.co)$/', $_replit_host);
if (
    $_replit_is_public ||
    (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https')
) {
    $_SERVER['HTTPS'] = 'on';   // makes is_ssl() return true — stops the https redirect loop
    $_SERVER['SERVER_PORT'] = '443';
}
$_replit_scheme = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? 'https' : 'http';
define('WP_SITEURL', $_replit_scheme . '://' . $_replit_host);
define('WP_HOME',    $_replit_scheme . '://' . $_replit_host);
define('FORCE_SSL_ADMIN', false); // proxy handles SSL; let WordPress serve admin over the detected scheme

if (!defined('ABSPATH')) {
    define('ABSPATH', __DIR__ . '/');
}
require_once ABSPATH . 'wp-settings.php';
