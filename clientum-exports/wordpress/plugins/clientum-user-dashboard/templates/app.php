<?php
/**
 * Shell del panel SPA. Solo accesible para usuarios logueados.
 * Ruta: /app (y cualquier subruta /app/* usada por el router del SPA)
 */
if ( ! defined( 'ABSPATH' ) ) exit;

if ( ! is_user_logged_in() ) {
    $current_path = $_SERVER['REQUEST_URI'] ?? '/app/';
    wp_safe_redirect( home_url( '/login?redirect_to=' . urlencode( home_url( $current_path ) ) ) );
    exit;
}

clntm_ud_dashboard_assets();
?><!DOCTYPE html>
<html lang="es" <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo('charset'); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title><?php bloginfo('name'); ?> — Mi Panel</title>
<?php wp_head(); ?>
<style>
html, body { margin: 0 !important; padding: 0 !important; height: 100%; overflow: hidden; }
body { background: #f0f2f5; }
</style>
</head>
<body>
<div id="clntm-root"></div>
<?php wp_footer(); ?>
</body>
</html>
