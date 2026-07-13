<?php
/**
 * Plugin Name: Clientum AI Prospector
 * Plugin URI:  https://clientum.ar
 * Description: Sistema integral de prospección B2B, calificación MEDDIC, CRM pipeline, brochure con IA y automatización de outreach — instalable como plugin independiente de WordPress.
 * Version:     2.0.0
 * Author:      Clientum
 * Author URI:  https://clientum.ar
 * License:     GPL-2.0+
 * Text Domain: clientum-ai-prospector
 */

if ( ! defined( 'ABSPATH' ) ) exit;

define( 'CAP_VERSION',    '2.0.0' );
define( 'CAP_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'CAP_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'CAP_SLUG',       'clientum-ai-prospector' );

/* ─── Autoload includes ────────────────────────────────────────────────────── */
require_once CAP_PLUGIN_DIR . 'includes/class-database.php';
require_once CAP_PLUGIN_DIR . 'includes/class-ai-handler.php';
require_once CAP_PLUGIN_DIR . 'includes/class-scraper.php';
require_once CAP_PLUGIN_DIR . 'includes/class-rest-api.php';
require_once CAP_PLUGIN_DIR . 'includes/class-admin.php';

/* ─── Activation / Deactivation ────────────────────────────────────────────── */
register_activation_hook( __FILE__, [ 'CAP_Database', 'install' ] );
register_deactivation_hook( __FILE__, [ 'CAP_Database', 'deactivate' ] );

/* ─── Init ─────────────────────────────────────────────────────────────────── */
add_action( 'init',            'cap_register_rewrite_rules' );
add_action( 'rest_api_init',   [ 'CAP_REST_API', 'register_routes' ] );
add_action( 'admin_menu',      [ 'CAP_Admin', 'add_menu' ] );
add_action( 'admin_init',      [ 'CAP_Admin', 'register_settings' ] );
add_action( 'wp_enqueue_scripts', 'cap_enqueue_assets' );
add_filter( 'query_vars',      'cap_query_vars' );
add_action( 'template_redirect', 'cap_template_redirect' );

/* ─── Shortcode ─────────────────────────────────────────────────────────────── */
add_shortcode( 'clientum_prospector', 'cap_shortcode' );

/**
 * Shortcode: render la app React dentro de cualquier página WP.
 * Uso: [clientum_prospector]
 */
function cap_shortcode( $atts ) {
    cap_enqueue_assets();
    ob_start();
    ?>
    <div id="clientum-prospector-root" style="min-height:100vh;"></div>
    <?php
    return ob_get_clean();
}

/* ─── Enqueue assets ────────────────────────────────────────────────────────── */
function cap_enqueue_assets() {
    $js  = CAP_PLUGIN_URL . 'assets/js/clientum-prospector.js';
    $css = CAP_PLUGIN_URL . 'assets/css/clientum-prospector.css';

    // Solo encolar si los archivos de build existen
    if ( file_exists( CAP_PLUGIN_DIR . 'assets/js/clientum-prospector.js' ) ) {
        wp_enqueue_script(
            CAP_SLUG,
            $js,
            [],
            CAP_VERSION,
            true
        );
    }

    if ( file_exists( CAP_PLUGIN_DIR . 'assets/css/clientum-prospector.css' ) ) {
        wp_enqueue_style( CAP_SLUG, $css, [], CAP_VERSION );
    }

    // Inyectar configuración PHP → JS (window.clientumConfig)
    $config = [
        'apiBase'    => rest_url( 'clientum/v1' ),
        'nonce'      => wp_create_nonce( 'wp_rest' ),
        'siteUrl'    => site_url(),
        'pluginUrl'  => CAP_PLUGIN_URL,
        'currentUser'=> cap_get_current_user_data(),
    ];

    wp_add_inline_script(
        CAP_SLUG,
        'window.clientumConfig = ' . wp_json_encode( $config ) . ';',
        'before'
    );
}

function cap_get_current_user_data() {
    if ( ! is_user_logged_in() ) return null;
    $u = wp_get_current_user();
    return [
        'username' => $u->user_login,
        'role'     => cap_wp_role_to_cap( $u->roles ),
        'id'       => $u->ID,
    ];
}

function cap_wp_role_to_cap( array $roles ): string {
    if ( in_array( 'administrator', $roles, true ) ) return 'admin';
    if ( in_array( 'cap_admin', $roles, true ) )     return 'admin';
    return 'user';
}

/* ─── Rewrite rules para rutas SPA ─────────────────────────────────────────── */
function cap_register_rewrite_rules() {
    add_rewrite_rule( '^prospector(/.*)?$', 'index.php?cap_route=$matches[1]', 'top' );
}

function cap_query_vars( $vars ) {
    $vars[] = 'cap_route';
    return $vars;
}

function cap_template_redirect() {
    $route = get_query_var( 'cap_route' );
    if ( $route !== '' && $route !== false ) {
        // Servir el template SPA
        cap_enqueue_assets();
        get_header();
        echo '<div id="clientum-prospector-root" style="min-height:100vh;"></div>';
        get_footer();
        exit;
    }
}

/* ─── Plugin action links ───────────────────────────────────────────────────── */
add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), function( $links ) {
    $settings = '<a href="' . admin_url( 'admin.php?page=clientum-prospector-settings' ) . '">' . __( 'Configuración', 'clientum-ai-prospector' ) . '</a>';
    array_unshift( $links, $settings );
    return $links;
} );
