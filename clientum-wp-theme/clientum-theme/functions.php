<?php
if (!defined('ABSPATH')) exit;

define('CLIENTUM_VERSION', '1.0.0');
define('CLIENTUM_DIR', get_template_directory());
define('CLIENTUM_URI', get_template_directory_uri());

// ── Theme Setup ───────────────────────────────────────────────────────────────
function clientum_setup(): void {
    load_theme_textdomain('clientum', CLIENTUM_DIR . '/languages');
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', ['search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script']);
    add_theme_support('custom-logo', ['height' => 60, 'width' => 200, 'flex-width' => true]);
    add_theme_support('customize-selective-refresh-widgets');
    register_nav_menus([
        'primary' => __('Menú Principal', 'clientum'),
        'footer'  => __('Menú Footer', 'clientum'),
    ]);
}
add_action('after_setup_theme', 'clientum_setup');

// ── Enqueue Assets ─────────────────────────────────────────────────────────────
function clientum_enqueue_assets(): void {
    // Tailwind CDN
    wp_enqueue_script('tailwind-cdn', 'https://cdn.tailwindcss.com', [], null);
    // Main CSS
    wp_enqueue_style('clientum-main', CLIENTUM_URI . '/assets/css/main.css', [], CLIENTUM_VERSION);
    // Main JS
    wp_enqueue_script('clientum-main', CLIENTUM_URI . '/assets/js/main.js', [], CLIENTUM_VERSION, true);
    // Pass ajax URL and nonce to JS
    wp_localize_script('clientum-main', 'clientumData', [
        'ajaxUrl' => admin_url('admin-ajax.php'),
        'nonce'   => wp_create_nonce('clientum_nonce'),
        'homeUrl' => home_url('/'),
    ]);
}
add_action('wp_enqueue_scripts', 'clientum_enqueue_assets');

// ── Custom Post Types ──────────────────────────────────────────────────────────
function clientum_register_cpts(): void {
    // Services CPT
    register_post_type('clientum_service', [
        'labels'      => ['name' => 'Servicios', 'singular_name' => 'Servicio'],
        'public'      => true,
        'has_archive' => true,
        'menu_icon'   => 'dashicons-admin-tools',
        'supports'    => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
        'rewrite'     => ['slug' => 'servicios'],
    ]);
    // Projects / Portfolio CPT
    register_post_type('clientum_project', [
        'labels'      => ['name' => 'Portafolio', 'singular_name' => 'Proyecto'],
        'public'      => true,
        'has_archive' => true,
        'menu_icon'   => 'dashicons-portfolio',
        'supports'    => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
        'rewrite'     => ['slug' => 'portafolio'],
    ]);
    // Courses CPT
    register_post_type('clientum_course', [
        'labels'      => ['name' => 'Cursos', 'singular_name' => 'Curso'],
        'public'      => true,
        'has_archive' => true,
        'menu_icon'   => 'dashicons-welcome-learn-more',
        'supports'    => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
        'rewrite'     => ['slug' => 'academia'],
    ]);
    // Testimonials CPT
    register_post_type('clientum_testimonial', [
        'labels'      => ['name' => 'Testimonios', 'singular_name' => 'Testimonio'],
        'public'      => false,
        'show_ui'     => true,
        'menu_icon'   => 'dashicons-format-quote',
        'supports'    => ['title', 'editor', 'custom-fields'],
    ]);
}
add_action('init', 'clientum_register_cpts');

// ── Custom Taxonomies ──────────────────────────────────────────────────────────
function clientum_register_taxonomies(): void {
    register_taxonomy('service_category', 'clientum_service', [
        'label'        => 'Categoría de Servicio',
        'hierarchical' => true,
        'rewrite'      => ['slug' => 'categoria-servicio'],
    ]);
    register_taxonomy('industry', 'clientum_project', [
        'label'        => 'Industria',
        'hierarchical' => true,
        'rewrite'      => ['slug' => 'industria'],
    ]);
}
add_action('init', 'clientum_register_taxonomies');

// ── Theme Options via Customizer ───────────────────────────────────────────────
function clientum_customizer(WP_Customize_Manager $wp_customize): void {
    $wp_customize->add_section('clientum_contact', [
        'title'    => 'Información de Contacto',
        'priority' => 30,
    ]);
    $fields = [
        'clientum_phone'   => ['label' => 'Teléfono', 'default' => '+54 298 451-0883'],
        'clientum_email'   => ['label' => 'Email', 'default' => 'info@clientum.com.ar'],
        'clientum_address' => ['label' => 'Dirección', 'default' => 'General Roca, Río Negro, Argentina'],
        'clientum_website' => ['label' => 'Sitio Web', 'default' => 'clientum.com.ar'],
        'clientum_whatsapp'=> ['label' => 'WhatsApp (número)', 'default' => '5492984510883'],
        'clientum_hero_slogan' => ['label' => 'Slogan Principal (Hero)', 'default' => 'Todo lo que tu empresa necesita, en una sola plataforma.'],
        'clientum_hero_sub'    => ['label' => 'Subtítulo Hero', 'default' => 'CRM, Chatbot WhatsApp con IA, E-Commerce, ERP, Business Intelligence — el ecosistema completo para hacer crecer tu PyME.'],
        'clientum_color_theme' => ['label' => 'Color Tema (navy/forest/amber/charcoal)', 'default' => 'navy'],
    ];
    foreach ($fields as $id => $args) {
        $wp_customize->add_setting($id, ['default' => $args['default'], 'sanitize_callback' => 'sanitize_text_field']);
        $wp_customize->add_control($id, ['label' => $args['label'], 'section' => 'clientum_contact', 'type' => 'text']);
    }
}
add_action('customize_register', 'clientum_customizer');

// Helper to get theme mod with fallback
function clientum_opt(string $key, string $default = ''): string {
    return get_theme_mod($key, $default);
}

// ── AJAX: Contact Form ─────────────────────────────────────────────────────────
function clientum_ajax_contact(): void {
    check_ajax_referer('clientum_nonce', 'nonce');
    $name    = sanitize_text_field($_POST['nombre'] ?? '');
    $email   = sanitize_email($_POST['email'] ?? '');
    $empresa = sanitize_text_field($_POST['empresa'] ?? '');
    $mensaje = sanitize_textarea_field($_POST['mensaje'] ?? '');
    $service = sanitize_text_field($_POST['servicio'] ?? '');

    if (!$name || !$email || !is_email($email)) {
        wp_send_json_error(['message' => 'Por favor completá tu nombre y email.']);
    }

    $admin_email = get_option('admin_email');
    $subject = "[Clientum] Nueva consulta de {$name} — {$empresa}";
    $body = "Nombre: {$name}\nEmail: {$email}\nEmpresa: {$empresa}\nServicio: {$service}\n\nMensaje:\n{$mensaje}";
    $headers = ['Content-Type: text/plain; charset=UTF-8', "Reply-To: {$name} <{$email}>"];

    $sent = wp_mail($admin_email, $subject, $body, $headers);
    if ($sent) {
        wp_send_json_success(['message' => '¡Gracias! Te contactaremos en menos de 24 horas.']);
    } else {
        wp_send_json_error(['message' => 'Ocurrió un error al enviar. Escribinos directamente a ' . clientum_opt('clientum_email', 'info@clientum.com.ar')]);
    }
}
add_action('wp_ajax_clientum_contact', 'clientum_ajax_contact');
add_action('wp_ajax_nopriv_clientum_contact', 'clientum_ajax_contact');

// ── AJAX: Newsletter ───────────────────────────────────────────────────────────
function clientum_ajax_newsletter(): void {
    check_ajax_referer('clientum_nonce', 'nonce');
    $email = sanitize_email($_POST['email'] ?? '');
    if (!$email || !is_email($email)) {
        wp_send_json_error(['message' => 'Email inválido.']);
    }
    // Store subscriber in options (simple implementation — replace with Mailchimp/etc)
    $subscribers = get_option('clientum_newsletter_subscribers', []);
    if (!in_array($email, $subscribers)) {
        $subscribers[] = $email;
        update_option('clientum_newsletter_subscribers', $subscribers);
    }
    wp_send_json_success(['message' => '¡Gracias por suscribirte!']);
}
add_action('wp_ajax_clientum_newsletter', 'clientum_ajax_newsletter');
add_action('wp_ajax_nopriv_clientum_newsletter', 'clientum_ajax_newsletter');

// ── Shortcodes ─────────────────────────────────────────────────────────────────
// [clientum_contact_form]
function clientum_shortcode_contact_form(): string {
    ob_start();
    get_template_part('template-parts/contact-form');
    return ob_get_clean();
}
add_shortcode('clientum_contact_form', 'clientum_shortcode_contact_form');

// [clientum_services]
function clientum_shortcode_services(): string {
    ob_start();
    get_template_part('template-parts/services-grid');
    return ob_get_clean();
}
add_shortcode('clientum_services', 'clientum_shortcode_services');

// ── Widget Areas ───────────────────────────────────────────────────────────────
function clientum_widgets(): void {
    register_sidebar([
        'name'          => 'Footer Col 1',
        'id'            => 'footer-1',
        'before_widget' => '<div class="widget">',
        'after_widget'  => '</div>',
        'before_title'  => '<h4 class="widget-title text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">',
        'after_title'   => '</h4>',
    ]);
}
add_action('widgets_init', 'clientum_widgets');

// ── Security: remove WP version ────────────────────────────────────────────────
remove_action('wp_head', 'wp_generator');

// ── Include additional files ────────────────────────────────────────────────────
require_once CLIENTUM_DIR . '/inc/meta-boxes.php';
require_once CLIENTUM_DIR . '/inc/customizer-fields.php';
require_once CLIENTUM_DIR . '/inc/setup-data.php';
