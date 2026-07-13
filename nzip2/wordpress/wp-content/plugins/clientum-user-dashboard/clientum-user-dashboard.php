<?php
/**
 * Plugin Name: Clientum — Panel de Usuario (CRM)
 * Plugin URI:  https://clientum.com.ar
 * Description: Panel de usuario independiente (CRM: contactos, empresas, leads, deals, actividades, productos, facturas, cotizaciones) con login, registro y recuperación de contraseña propios. Funciona con cualquier tema activo — no depende de páginas ni plantillas del tema.
 * Version:     1.0.0
 * Author:      Clientum
 * Text Domain: clientum-user-dashboard
 */

if ( ! defined( 'ABSPATH' ) ) exit;

/* ═══════════════════════════════════════════════════════════════
   CONSTANTES
   ═══════════════════════════════════════════════════════════════ */
define( 'CLNTM_UD_VERSION', '1.0.0' );
define( 'CLNTM_UD_DIR',     plugin_dir_path( __FILE__ ) );
define( 'CLNTM_UD_URL',     plugin_dir_url( __FILE__ ) );
define( 'CLNTM_DB_VER',     '1' ); // usada por includes/class-database.php

/* ═══════════════════════════════════════════════════════════════
   INCLUDES — Base de datos y REST API del CRM
   (Mismo código que usa el tema Clientum, agnóstico de tema)
   ═══════════════════════════════════════════════════════════════ */
require_once CLNTM_UD_DIR . 'includes/class-database.php';
require_once CLNTM_UD_DIR . 'includes/class-rest-api.php';

/* ─── Instalar tablas al activar el plugin ────────────────────── */
register_activation_hook( __FILE__, function () {
    Clntm_Database::install();
    flush_rewrite_rules();
} );

/* ─── Actualizar tablas si cambia la versión de DB ───────────── */
add_action( 'init', function () {
    if ( get_option( 'clntm_db_ver' ) !== CLNTM_DB_VER ) {
        Clntm_Database::install();
    }
} );

/* ─── Arrancar la REST API ────────────────────────────────────── */
add_action( 'plugins_loaded', function () {
    new Clntm_Rest_Api();
} );

/* ═══════════════════════════════════════════════════════════════
   RUTEO — /app, /login, /registro, /recuperar-contrasena
   El plugin intercepta estas rutas directamente (independiente
   de si existen páginas de WordPress con esos slugs, y del tema
   activo), y sirve su propio HTML autocontenido.
   ═══════════════════════════════════════════════════════════════ */
function clntm_ud_path() {
    $request_path = trim( (string) wp_parse_url( $_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH ), '/' );
    $base_path    = trim( (string) wp_parse_url( home_url( '/' ), PHP_URL_PATH ), '/' );

    if ( $base_path !== '' ) {
        if ( $request_path === $base_path ) {
            $request_path = '';
        } elseif ( strpos( $request_path, $base_path . '/' ) === 0 ) {
            $request_path = substr( $request_path, strlen( $base_path ) + 1 );
        }
    }

    return $request_path;
}

function clntm_ud_is_app_path() {
    $path = clntm_ud_path();
    return $path === 'app' || strpos( $path, 'app/' ) === 0;
}

add_action( 'template_redirect', function () {
    $path = clntm_ud_path();

    if ( clntm_ud_is_app_path() ) {
        status_header( 200 );
        include CLNTM_UD_DIR . 'templates/app.php';
        exit;
    }

    if ( $path === 'login' ) {
        clntm_ud_handle_login_post();
        status_header( 200 );
        include CLNTM_UD_DIR . 'templates/login.php';
        exit;
    }

    if ( $path === 'registro' ) {
        clntm_ud_handle_register_post();
        status_header( 200 );
        include CLNTM_UD_DIR . 'templates/register.php';
        exit;
    }

    if ( $path === 'recuperar-contrasena' ) {
        clntm_ud_handle_forgot_post();
        status_header( 200 );
        include CLNTM_UD_DIR . 'templates/forgot-password.php';
        exit;
    }
}, 5 );

/* ═══════════════════════════════════════════════════════════════
   ASSETS — Dashboard (app.js + dashboard.css)
   ═══════════════════════════════════════════════════════════════ */
function clntm_ud_dashboard_assets() {
    $v = CLNTM_UD_VERSION;

    wp_enqueue_style(  'clntm-ud-dashboard', CLNTM_UD_URL . 'assets/css/dashboard.css', [], $v );
    wp_enqueue_script( 'clntm-ud-app',       CLNTM_UD_URL . 'assets/js/app.js',         [], $v, true );

    $user = wp_get_current_user();
    wp_localize_script( 'clntm-ud-app', 'ClntmConfig', [
        'apiBase'   => rest_url( 'clientum/v1' ),
        'nonce'     => wp_create_nonce( 'wp_rest' ),
        'homeUrl'   => home_url( '/' ),
        'logoutUrl' => wp_logout_url( home_url( '/' ) ),
        'user'      => [
            'id'      => $user->ID,
            'name'    => $user->display_name,
            'email'   => $user->user_email,
            'company' => get_user_meta( $user->ID, 'clientum_company', true ),
            'avatar'  => get_avatar_url( $user->ID, [ 'size' => 64 ] ),
            'isAdmin' => current_user_can( 'manage_options' ),
        ],
        'logoUrl'   => CLNTM_UD_URL . 'assets/images/logo-icon.png',
        'siteTitle' => get_bloginfo( 'name' ),
    ] );
}

/* ═══════════════════════════════════════════════════════════════
   SHORTCODE — [clientum_user_dashboard] embed en cualquier página
   ═══════════════════════════════════════════════════════════════ */
add_shortcode( 'clientum_user_dashboard', function () {
    if ( ! is_user_logged_in() ) {
        return '<p>Por favor <a href="' . esc_url( home_url( '/login' ) ) . '">iniciá sesión</a> para acceder a tu panel.</p>';
    }
    clntm_ud_dashboard_assets();
    ob_start();
    ?>
    <div id="clntm-root" style="height:80vh"></div>
    <?php
    return ob_get_clean();
} );

/* ═══════════════════════════════════════════════════════════════
   AUTH HANDLERS — Login / Registro / Recuperar contraseña
   ═══════════════════════════════════════════════════════════════ */
function clntm_ud_handle_login_post() {
    if ( $_SERVER['REQUEST_METHOD'] !== 'POST' ) return;

    if ( ! wp_verify_nonce( $_POST['clientum_login_nonce'] ?? '', 'clientum_login' ) ) {
        wp_safe_redirect( home_url( '/login?error=security' ) ); exit;
    }

    $creds = [
        'user_login'    => sanitize_text_field( $_POST['log'] ?? '' ),
        'user_password' => $_POST['pwd'] ?? '',
        'remember'      => true,
    ];

    $user = wp_signon( $creds, false );

    if ( is_wp_error( $user ) ) {
        wp_safe_redirect( home_url( '/login?error=invalid' ) ); exit;
    }

    $redirect = sanitize_url( $_POST['redirect_to'] ?? '' );
    wp_safe_redirect( $redirect ?: home_url( '/app' ) ); exit;
}

function clntm_ud_handle_register_post() {
    if ( $_SERVER['REQUEST_METHOD'] !== 'POST' ) return;

    if ( ! wp_verify_nonce( $_POST['clientum_register_nonce'] ?? '', 'clientum_register' ) ) {
        wp_safe_redirect( home_url( '/registro?error=security' ) ); exit;
    }

    $company  = sanitize_text_field( $_POST['company_name'] ?? '' );
    $name     = sanitize_text_field( $_POST['first_name']   ?? '' );
    $email    = sanitize_email(      $_POST['user_email']   ?? '' );
    $password = $_POST['user_pass'] ?? '';

    if ( empty( $company ) || empty( $name ) || empty( $email ) || empty( $password ) ) {
        wp_safe_redirect( home_url( '/registro?error=missing_fields' ) ); exit;
    }
    if ( ! is_email( $email ) ) {
        wp_safe_redirect( home_url( '/registro?error=invalid_email' ) ); exit;
    }
    if ( strlen( $password ) < 8 ) {
        wp_safe_redirect( home_url( '/registro?error=weak_password' ) ); exit;
    }
    if ( email_exists( $email ) ) {
        wp_safe_redirect( home_url( '/registro?error=email_exists' ) ); exit;
    }

    $user_id = wp_create_user( $email, $password, $email );

    if ( is_wp_error( $user_id ) ) {
        wp_safe_redirect( home_url( '/registro?error=create_failed' ) ); exit;
    }

    wp_update_user( [ 'ID' => $user_id, 'display_name' => $name, 'first_name' => $name ] );
    update_user_meta( $user_id, 'clientum_company', $company );

    wp_set_current_user( $user_id );
    wp_set_auth_cookie( $user_id, true );
    wp_safe_redirect( home_url( '/app' ) ); exit;
}

function clntm_ud_handle_forgot_post() {
    if ( $_SERVER['REQUEST_METHOD'] !== 'POST' ) return;

    if ( ! wp_verify_nonce( $_POST['clientum_forgot_nonce'] ?? '', 'clientum_forgot' ) ) {
        wp_safe_redirect( home_url( '/recuperar-contrasena?error=security' ) ); exit;
    }

    $email = sanitize_email( $_POST['user_login'] ?? '' );

    if ( ! is_email( $email ) ) {
        wp_safe_redirect( home_url( '/recuperar-contrasena?error=invalid_email' ) ); exit;
    }

    $user = get_user_by( 'email', $email );

    if ( $user ) {
        $key = get_password_reset_key( $user );
        if ( ! is_wp_error( $key ) ) {
            $reset_url = network_site_url(
                'wp-login.php?action=rp&key=' . rawurlencode( $key ) .
                '&login=' . rawurlencode( $user->user_login ),
                'login'
            );
            $site = get_bloginfo( 'name' );
            $msg  = "Hola {$user->display_name},\n\n";
            $msg .= "Recibimos una solicitud para restablecer tu contraseña de {$site}.\n\n";
            $msg .= "Hacé clic en el siguiente enlace para crear una nueva:\n\n{$reset_url}\n\n";
            $msg .= "El enlace expira en 24 horas.\n";
            $msg .= "Si no solicitaste esto, ignorá este mensaje.\n\n";
            $msg .= "— El equipo de Clientum";
            wp_mail( $email, "Restablecer tu contraseña — {$site}", $msg );
        }
    }
    wp_safe_redirect( home_url( '/recuperar-contrasena?sent=1' ) ); exit;
}

/* ── Redirigir el login de WP hacia la página personalizada ───── */
add_filter( 'login_redirect', function ( $redirect_to, $req, $user ) {
    if ( is_wp_error( $user ) ) return $redirect_to;
    if ( ! $user->has_cap( 'manage_options' ) ) return home_url( '/app' );
    return $redirect_to;
}, 10, 3 );

add_filter( 'wp_login_url', function ( $url ) {
    if ( strpos( $url, 'action=' ) === false ) return home_url( '/login' );
    return $url;
} );

/* ═══════════════════════════════════════════════════════════════
   ADMIN — Acceso rápido al panel desde WP Admin
   ═══════════════════════════════════════════════════════════════ */
add_action( 'admin_menu', function () {
    add_menu_page(
        'Mi Panel (Clientum)',
        'Mi Panel',
        'read',
        'clientum-ud-redirect',
        function () {
            wp_redirect( home_url( '/app' ) ); exit;
        },
        'dashicons-businessman',
        3
    );
} );

add_action( 'admin_bar_menu', function ( WP_Admin_Bar $bar ) {
    $bar->add_node( [
        'id'    => 'clientum-ud-link',
        'title' => '🏢 Ir a mi panel',
        'href'  => home_url( '/app' ),
        'meta'  => [ 'target' => '_blank' ],
    ] );
}, 999 );
