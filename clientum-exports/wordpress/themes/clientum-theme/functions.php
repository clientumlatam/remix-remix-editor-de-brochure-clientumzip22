<?php
/**
 * Clientum Theme — functions.php
 * Incluye: setup del tema, menús (3 posiciones + auto-asignación),
 * CRM Dashboard (DB, REST API, assets), auth handlers.
 */

if ( ! defined( 'ABSPATH' ) ) exit;

/* ═══════════════════════════════════════════════════════════════
   CONSTANTES DEL CRM (usadas por includes/class-*.php)
   ═══════════════════════════════════════════════════════════════ */
define( 'CLNTM_VERSION', '2.1.0' );
define( 'CLNTM_DIR',     get_template_directory() . '/' );
define( 'CLNTM_URL',     get_template_directory_uri() . '/' );
define( 'CLNTM_DB_VER',  '2' );

/* ═══════════════════════════════════════════════════════════════
   INCLUDES — Base de datos y REST API del CRM
   ═══════════════════════════════════════════════════════════════ */
require_once CLNTM_DIR . 'includes/class-database.php';
require_once CLNTM_DIR . 'includes/class-rest-api.php';

/* ─── Instalar tablas al activar el tema ──────────────────────── */
add_action( 'after_switch_theme', function () {
    Clntm_Database::install();
    flush_rewrite_rules();
});

/* ═══════════════════════════════════════════════════════════════
   RUTEO DEL DASHBOARD (/app, /app/dashboard, /app/contacts, etc.)
   El SPA usa pushState para rutas como /app/dashboard — WordPress
   por sí solo no tiene una página en esas URLs, así que interceptamos
   cualquier request que empiece con /app y servimos el shell del CRM
   directamente, sin depender de que exista una página con ese slug.
   ═══════════════════════════════════════════════════════════════ */
function clientum_is_app_path() {
    $path = trim( (string) wp_parse_url( $_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH ), '/' );
    return $path === 'app' || strpos( $path, 'app/' ) === 0;
}

add_action( 'template_redirect', function () {
    if ( ! clientum_is_app_path() ) return;
    status_header( 200 );
    include CLNTM_DIR . 'template-app.php';
    exit;
}, 5 );

/* ─── Actualizar tablas si cambia la versión de DB ───────────── */
add_action( 'init', function () {
    if ( get_option( 'clntm_db_ver' ) !== CLNTM_DB_VER ) {
        Clntm_Database::install();
    }
});

/* ─── Arrancar la REST API ────────────────────────────────────── */
// plugins_loaded ya disparó cuando se carga el tema; se usa after_setup_theme
// que corre antes de rest_api_init y garantiza que los hooks queden registrados.
add_action( 'after_setup_theme', function () {
    new Clntm_Rest_Api();
}, 5 );

/* ═══════════════════════════════════════════════════════════════
   THEME SETUP
   ═══════════════════════════════════════════════════════════════ */
function clientum_setup() {
    add_theme_support( 'title-tag' );
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'html5', [ 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ] );
    add_theme_support( 'custom-logo', [
        'height'      => 64,
        'width'       => 64,
        'flex-height' => true,
        'flex-width'  => true,
    ] );
    add_theme_support( 'menus' );

    register_nav_menus( [
        'primary' => __( 'Menú principal',     'clientum' ),
        'footer'  => __( 'Menú pie de página', 'clientum' ),
        'usuario' => __( 'Menú usuario',        'clientum' ),
    ] );
}
add_action( 'after_setup_theme', 'clientum_setup' );

/* ─── Auto-asignar menús a posiciones después del import WXR ─── */
add_action( 'init', function () {
    if ( get_option( 'clntm_menus_assigned' ) ) return;

    $map = [
        'menu-principal' => 'primary',
        'menu-footer'    => 'footer',
        'menu-usuario'   => 'usuario',
    ];

    $assigned = false;
    $locations = get_nav_menu_locations();

    foreach ( $map as $slug => $location ) {
        $menu = get_term_by( 'slug', $slug, 'nav_menu' );
        if ( $menu ) {
            $locations[ $location ] = $menu->term_id;
            $assigned = true;
        }
    }

    if ( $assigned ) {
        set_theme_mod( 'nav_menu_locations', $locations );
        update_option( 'clntm_menus_assigned', 1 );
    }
} );

/* ═══════════════════════════════════════════════════════════════
   ENQUEUE — Assets generales del tema
   ═══════════════════════════════════════════════════════════════ */
function clientum_assets() {
    $v = wp_get_theme()->get( 'Version' );

    /* En la página del CRM solo se carga el dashboard — nada más */
    if ( clientum_is_app_page() ) return;

    wp_enqueue_style(  'clientum-fonts', 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap', [], null );
    wp_enqueue_style(  'clientum-main',  get_template_directory_uri() . '/assets/css/main.css', [ 'clientum-fonts' ], $v );
    wp_enqueue_script( 'clientum-main',  get_template_directory_uri() . '/assets/js/main.js', [], $v, true );

    wp_localize_script( 'clientum-main', 'clientumData', [
        'ajaxUrl' => admin_url( 'admin-ajax.php' ),
        'nonce'   => wp_create_nonce( 'clientum_contact' ),
        'homeUrl' => home_url( '/' ),
    ] );
}
add_action( 'wp_enqueue_scripts', 'clientum_assets' );

/* ─── Assets del CRM Dashboard (solo en template-app) ─────────── */
function clientum_dashboard_assets() {
    if ( ! clientum_is_app_page() ) return;

    $v = CLNTM_VERSION;

    wp_enqueue_style(  'clntm-dashboard', get_template_directory_uri() . '/assets/css/dashboard.css', [], $v );
    wp_enqueue_script( 'clntm-app',       get_template_directory_uri() . '/assets/js/app.js',         [], $v, true );

    $user = wp_get_current_user();
    wp_localize_script( 'clntm-app', 'ClntmConfig', [
        'apiBase'   => rest_url( 'clientum/v1' ),
        'nonce'     => wp_create_nonce( 'wp_rest' ),
        'homeUrl'   => home_url( '/' ),
        'logoutUrl' => wp_logout_url( home_url( '/' ) ),
        'user'      => [
            'id'          => $user->ID,
            'name'        => $user->display_name,
            'email'       => $user->user_email,
            'company'     => get_user_meta( $user->ID, 'clientum_company', true ),
            'avatar'      => get_avatar_url( $user->ID, [ 'size' => 64 ] ),
            'isAdmin'     => current_user_can( 'manage_options' ),
        ],
        'logoUrl'   => get_template_directory_uri() . '/assets/images/logo-icon.png',
        'siteTitle' => get_bloginfo( 'name' ),
    ] );
}
add_action( 'wp_enqueue_scripts', 'clientum_dashboard_assets' );

/* ─── Eliminar estilos WP que interfieren (en páginas normales) ─ */
function clientum_dequeue_wp_defaults() {
    if ( clientum_is_app_page() ) return;
    wp_dequeue_style( 'wp-block-library' );
    wp_dequeue_style( 'wp-block-library-theme' );
    wp_dequeue_style( 'classic-theme-styles' );
    wp_dequeue_style( 'global-styles' );
    wp_dequeue_style( 'dashicons' );
}
add_action( 'wp_enqueue_scripts', 'clientum_dequeue_wp_defaults', 100 );

/* ═══════════════════════════════════════════════════════════════
   HELPER: detectar si estamos en el dashboard CRM
   (cualquier URL /app o /app/lo-que-sea — ver clientum_is_app_path()
   más arriba, que sirve el shell del SPA para todas esas rutas)
   ═══════════════════════════════════════════════════════════════ */
function clientum_is_app_page() {
    return clientum_is_app_path();
}

/* La protección de login (redirigir a /login si no está logueado)
   ya la maneja template-app.php directamente, porque es el único
   archivo que se ejecuta para cualquier ruta /app/* — ver el
   template_redirect de arriba (prioridad 5, antes que todo esto). */

/* ═══════════════════════════════════════════════════════════════
   CONTACT FORM — AJAX
   ═══════════════════════════════════════════════════════════════ */
function clientum_handle_contact() {
    check_ajax_referer( 'clientum_contact', 'nonce' );
    $name    = sanitize_text_field( $_POST['nombre']  ?? '' );
    $email   = sanitize_email(      $_POST['email']   ?? '' );
    $empresa = sanitize_text_field( $_POST['empresa'] ?? '' );
    $rubro   = sanitize_text_field( $_POST['rubro']   ?? '' );
    $msg     = sanitize_textarea_field( $_POST['mensaje'] ?? '' );

    if ( empty( $name ) || ! is_email( $email ) || empty( $msg ) ) {
        wp_send_json_error( [ 'message' => 'Por favor completá todos los campos requeridos.' ] );
    }

    $to      = get_option( 'admin_email' );
    $subject = "Nuevo contacto desde el sitio — {$name}";
    $body    = "Nombre: {$name}\nEmail: {$email}\nEmpresa: {$empresa}\nRubro: {$rubro}\n\nMensaje:\n{$msg}";
    $headers = [ "Reply-To: {$name} <{$email}>", 'Content-Type: text/plain; charset=UTF-8' ];
    $sent    = wp_mail( $to, $subject, $body, $headers );

    if ( $sent ) {
        wp_send_json_success( [ 'message' => '¡Mensaje enviado! Te respondemos en menos de 24 horas hábiles.' ] );
    } else {
        wp_send_json_error( [ 'message' => 'Hubo un problema al enviar el mensaje. Por favor escribinos a info@clientum.com.ar' ] );
    }
}
add_action( 'wp_ajax_nopriv_clientum_contact', 'clientum_handle_contact' );
add_action( 'wp_ajax_clientum_contact',        'clientum_handle_contact' );

/* ═══════════════════════════════════════════════════════════════
   HELPERS GLOBALES
   ═══════════════════════════════════════════════════════════════ */
function clientum_logo() {
    if ( has_custom_logo() ) {
        the_custom_logo();
    } else {
        echo '<a href="' . esc_url( home_url( '/' ) ) . '" class="site-logo-text">
            <img src="' . esc_url( get_template_directory_uri() ) . '/assets/images/logo-icon.png" alt="Clientum" width="40" height="40">
            <span>Clientum</span>
        </a>';
    }
}

function clientum_cta_url()  { return home_url( '/registro' ); }
function clientum_app_url()  { return home_url( '/app' ); }
function clientum_whatsapp() { return 'https://wa.me/542984510883'; }
function clientum_phone()    { return '+54 298 451-0883'; }
function clientum_email()    { return 'info@clientum.com.ar'; }

function clientum_page_title() {
    if ( is_front_page() ) return 'Inicio';
    if ( is_singular() )   return get_the_title();
    if ( is_archive() )    return get_the_archive_title();
    if ( is_search() )     return 'Resultados de búsqueda: ' . get_search_query();
    return get_bloginfo( 'name' );
}

/* ─── Excerpt ─────────────────────────────────────────────────── */
add_filter( 'excerpt_length', fn() => 25 );
add_filter( 'excerpt_more',   fn() => '…' );

/* ─── Quitar emoji scripts (performance) ─────────────────────── */
remove_action( 'wp_head',        'print_emoji_detection_script', 7 );
remove_action( 'wp_print_styles', 'print_emoji_styles' );

/* ═══════════════════════════════════════════════════════════════
   AUTH HANDLERS — Login / Registro / Recuperar contraseña
   ═══════════════════════════════════════════════════════════════ */

/* ── 1. LOGIN ─────────────────────────────────────────────────── */
add_action( 'template_redirect', function () {
    if ( ! is_page( 'login' ) || $_SERVER['REQUEST_METHOD'] !== 'POST' ) return;

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
} );

/* ── 2. REGISTRO ──────────────────────────────────────────────── */
add_action( 'template_redirect', function () {
    if ( ! is_page( 'registro' ) || $_SERVER['REQUEST_METHOD'] !== 'POST' ) return;

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
} );

/* ── 3. RECUPERAR CONTRASEÑA ──────────────────────────────────── */
add_action( 'template_redirect', function () {
    if ( ! is_page( 'recuperar-contrasena' ) || $_SERVER['REQUEST_METHOD'] !== 'POST' ) return;

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
} );

/* ── Redirigir WP login hacia la página personalizada ─────────── */
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
   SHORTCODE: [clientum_app] — embed del CRM en cualquier página
   ═══════════════════════════════════════════════════════════════ */
add_shortcode( 'clientum_app', function () {
    if ( ! is_user_logged_in() ) {
        return '<p>Por favor <a href="' . esc_url( home_url( '/login' ) ) . '">iniciá sesión</a> para acceder al CRM.</p>';
    }
    ob_start();
    ?>
    <div id="clntm-root" style="height:80vh"></div>
    <?php
    clientum_dashboard_assets();
    return ob_get_clean();
} );

/* ═══════════════════════════════════════════════════════════════
   ADMIN — Acceso rápido al CRM desde WP Admin
   ═══════════════════════════════════════════════════════════════ */
add_action( 'admin_menu', function () {
    add_menu_page(
        'Clientum CRM',
        'Clientum CRM',
        'read',
        'clientum-crm-redirect',
        function () {
            wp_redirect( home_url( '/app' ) ); exit;
        },
        'dashicons-businessman',
        3
    );
} );

/* ─── Barra de admin: link rápido al dashboard ────────────────── */
add_action( 'admin_bar_menu', function ( WP_Admin_Bar $bar ) {
    $bar->add_node( [
        'id'    => 'clientum-crm-link',
        'title' => '🏢 Ir al CRM',
        'href'  => home_url( '/app' ),
        'meta'  => [ 'target' => '_blank' ],
    ] );
}, 999 );

/* ─── Integración: AI Marketing Expert + WhatsApp de Clientum ── */
add_filter( 'aime_chatbot_system_prompt', function ( string $prompt, $conversation ): string {
    $whatsapp_url   = clientum_whatsapp();
    $whatsapp_phone = clientum_phone();

    $prompt .= "\n\n--- INSTRUCCIONES DE DERIVACIÓN A HUMANO ---\n";
    $prompt .= "Si el visitante pide hablar con una persona, un asesor, soporte humano, o si no podés resolver su consulta, decile que puede contactarnos directamente por WhatsApp: {$whatsapp_url}\n";
    $prompt .= "También podés darle el teléfono: {$whatsapp_phone}\n";
    $prompt .= "Cuando derives al visitante, incluí el token [HUMAN_HANDOFF] en tu respuesta para que el sistema registre el traspaso.\n";
    $prompt .= "--- FIN INSTRUCCIONES ---";

    return $prompt;
}, 10, 2 );
