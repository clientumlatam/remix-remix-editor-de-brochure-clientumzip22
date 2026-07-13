<?php
/**
 * Template Name: App — CRM Dashboard
 * Template Post Type: page
 *
 * Dashboard SPA. Solo accesible para usuarios logueados.
 * Ruta sugerida: /app
 */
if ( ! defined( 'ABSPATH' ) ) exit;

/* Redirigir si no está logueado */
if ( ! is_user_logged_in() ) {
    $current_path = $_SERVER['REQUEST_URI'] ?? '/app/';
    wp_safe_redirect( home_url( '/login?redirect_to=' . urlencode( home_url( $current_path ) ) ) );
    exit;
}
?><!DOCTYPE html>
<html lang="es" <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo('charset'); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title><?php bloginfo('name'); ?> — CRM</title>
<?php wp_head(); ?>
<style>
/* Ocultar absolutamente todo lo del tema en la página del dashboard */
#wpadminbar,
.site-header, header.site-header,
.site-footer, footer.site-footer,
.wp-block-template-part,
.admin-bar { display: none !important; }
html { padding-top: 0 !important; }
html, body { margin: 0 !important; padding: 0 !important; height: 100%; overflow: hidden; }
body { background: #f0f2f5; }
</style>
</head>
<body>
<div id="clntm-root"></div>
<?php wp_footer(); ?>
</body>
</html>
