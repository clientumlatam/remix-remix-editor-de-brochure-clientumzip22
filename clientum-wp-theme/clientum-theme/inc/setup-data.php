<?php
/**
 * One-click sample data installer for Clientum theme.
 * Run via: add_action('init', 'clientum_install_sample_data');
 * Or trigger manually from Appearance > Clientum Setup.
 */
if (!defined('ABSPATH')) exit;

function clientum_install_sample_data(): void {
    // Prevent re-install
    if (get_option('clientum_sample_data_installed')) return;

    // ── Services ────────────────────────────────────────────────────────────────
    $services = [
        ['title' => 'Chatbot WhatsApp 24/7', 'excerpt' => 'Bot que responde, cotiza, agenda y califica leads automáticamente.', 'icon' => '🤖', 'bullets' => "Conversaciones ilimitadas\nIntegración WhatsApp Business\nPanel de conversaciones en tiempo real"],
        ['title' => 'CRM & Pipeline Kanban', 'excerpt' => 'Pipeline drag & drop con seguimiento automático y facturación AFIP integrada.', 'icon' => '📊', 'bullets' => "Pipeline visual Kanban\nFactura electrónica AFIP\nReportes automáticos de ventas"],
        ['title' => 'Desarrollo Web & E-Commerce', 'excerpt' => 'Tiendas de alto rendimiento con MercadoPago integrado y diseño UX/UI responsivo.', 'icon' => '🌐', 'bullets' => "Tiendas WooCommerce y Shopify\nDiseño UX/UI premium\nControl unificado de stock omnicanal"],
        ['title' => 'Business Intelligence', 'excerpt' => 'Dashboards de ventas, conversiones y ROI actualizados en tiempo real.', 'icon' => '📈', 'bullets' => "Tableros BI personalizados\nAnalítica predictiva\nKPIs de ventas en tiempo real"],
        ['title' => 'Consultoría en IA', 'excerpt' => 'Modelos de Inteligencia Artificial y automatización de flujos para PyMEs.', 'icon' => '🧠', 'bullets' => "Agentes IA a medida\nAutomatización de procesos\nIntegración con sistemas existentes"],
        ['title' => 'Ciberseguridad', 'excerpt' => 'Auditorías de seguridad, backup en la nube y protección de datos sensibles.', 'icon' => '🛡️', 'bullets' => "Auditorías de vulnerabilidades\nBackup automático en la nube\nProtección de datos GDPR"],
    ];

    foreach ($services as $s) {
        $id = wp_insert_post([
            'post_title'   => $s['title'],
            'post_content' => $s['excerpt'],
            'post_excerpt' => $s['excerpt'],
            'post_status'  => 'publish',
            'post_type'    => 'clientum_service',
        ]);
        if ($id && !is_wp_error($id)) {
            update_post_meta($id, '_service_icon',    $s['icon']);
            update_post_meta($id, '_service_bullets', $s['bullets']);
        }
    }

    // ── Testimonials ────────────────────────────────────────────────────────────
    $testimonials = [
        ['title' => 'Martín R.', 'content' => 'Implementamos Clientum en 5 días. El bot de WhatsApp nos generó 40% más de consultas en el primer mes sin contratar nadie.', 'company' => 'Distribuidora del Sur S.A. — Neuquén'],
        ['title' => 'Sofía G.', 'content' => 'El 60% de nuestras reservas ahora se hacen solas por el bot. Redujimos llamadas perdidas y aumentamos la facturación.', 'company' => 'Delicias Gourmet — Bariloche'],
        ['title' => 'Gustavo B.', 'content' => 'Logramos coordinar todas nuestras operaciones con la mitad del esfuerzo. Ahorramos horas de trabajo administrativo cada semana.', 'company' => 'Servicios Patagónicos — General Roca'],
        ['title' => 'Gabriela S.', 'content' => 'La integración con AFIP fue increíble. Ahora facturamos desde el mismo CRM. Ahorro de 3 horas semanales de administración.', 'company' => 'Inmobiliaria del Valle — Cipolletti'],
    ];

    foreach ($testimonials as $t) {
        $id = wp_insert_post([
            'post_title'   => $t['title'],
            'post_content' => $t['content'],
            'post_status'  => 'publish',
            'post_type'    => 'clientum_testimonial',
        ]);
        if ($id && !is_wp_error($id)) {
            update_post_meta($id, '_company', $t['company']);
            update_post_meta($id, '_rating',  5);
        }
    }

    // ── Portfolio Projects ──────────────────────────────────────────────────────
    $projects = [
        ['title' => 'WeWork Latam', 'excerpt' => 'Reestructuración de marca digital y optimización de presencia en motores de búsqueda.', 'year' => '2019', 'type' => 'Rebranding & SEO', 'industry' => 'servicios'],
        ['title' => 'Cereales del Limay', 'excerpt' => 'Digitalización agrícola con balanzas, cartas de porte y liquidación automática en pesos.', 'year' => '2021', 'type' => 'ERP & AFIP', 'industry' => 'agroindustria'],
        ['title' => 'Metalúrgica Morgado', 'excerpt' => 'Optimización de cadena de montaje y control de calidad con reportes de Business Intelligence.', 'year' => '2020', 'type' => 'CRM Manufactura', 'industry' => 'manufactura'],
    ];

    foreach ($projects as $p) {
        $id = wp_insert_post([
            'post_title'   => $p['title'],
            'post_content' => $p['excerpt'],
            'post_excerpt' => $p['excerpt'],
            'post_status'  => 'publish',
            'post_type'    => 'clientum_project',
        ]);
        if ($id && !is_wp_error($id)) {
            update_post_meta($id, '_project_year', $p['year']);
            update_post_meta($id, '_project_type', $p['type']);
        }
    }

    // ── Sample Blog Posts ────────────────────────────────────────────────────────
    $posts = [
        ['title' => 'Cómo mejorar tu SEO en 2026', 'content' => 'Descubrí las mejores prácticas de arquitectura semántica, optimización de velocidad y contenidos de valor para disparar tus visitas orgánicas. El posicionamiento en buscadores es clave para atraer clientes sin pagar publicidad.', 'category' => 'Marketing'],
        ['title' => 'Por qué tu PyME necesita un Chatbot de WhatsApp', 'content' => 'El 70% de los clientes esperan respuesta en menos de 5 minutos. Un chatbot de WhatsApp automatiza la atención inicial, califica leads y agenda reuniones sin que tu equipo intervenga. Conocé cómo Clientum lo hace posible.', 'category' => 'Tecnología'],
        ['title' => 'Facturación AFIP integrada al CRM: guía completa', 'content' => 'Con Clientum podés emitir facturas A, B y C con CAE directamente desde el CRM sin salir del sistema. Esto elimina la doble carga de datos y reduce errores de facturación hasta un 90%.', 'category' => 'Finanzas'],
    ];

    foreach ($posts as $p) {
        $cat = get_cat_ID($p['category']);
        if (!$cat) $cat = wp_create_category($p['category']);
        wp_insert_post([
            'post_title'    => $p['title'],
            'post_content'  => $p['content'],
            'post_status'   => 'publish',
            'post_type'     => 'post',
            'post_category' => [$cat],
        ]);
    }

    update_option('clientum_sample_data_installed', true);
}

// Admin page to trigger install
function clientum_setup_admin_page(): void {
    add_theme_page('Clientum Setup', 'Clientum Setup', 'manage_options', 'clientum-setup', 'clientum_setup_page');
}
add_action('admin_menu', 'clientum_setup_admin_page');

function clientum_setup_page(): void {
    if (isset($_POST['install_data']) && check_admin_referer('clientum_install_data')) {
        delete_option('clientum_sample_data_installed');
        clientum_install_sample_data();
        echo '<div class="notice notice-success"><p>✓ Datos de ejemplo instalados correctamente.</p></div>';
    }
    ?>
    <div class="wrap">
      <h1>Clientum Theme Setup</h1>
      <p>Instalá los datos de ejemplo para ver el tema con contenido real.</p>
      <form method="post">
        <?php wp_nonce_field('clientum_install_data'); ?>
        <button type="submit" name="install_data" class="button button-primary">Instalar datos de ejemplo</button>
      </form>
      <hr>
      <h2>Configuración</h2>
      <p>Personalizá el tema en <a href="<?php echo admin_url('customize.php'); ?>">Apariencia → Personalizar → Información de Contacto</a>.</p>
      <h2>Custom Post Types</h2>
      <ul>
        <li>📦 <strong>Servicios</strong> — Cargá tus servicios en <a href="<?php echo admin_url('edit.php?post_type=clientum_service'); ?>">Servicios</a></li>
        <li>🏆 <strong>Portafolio</strong> — Cargá proyectos en <a href="<?php echo admin_url('edit.php?post_type=clientum_project'); ?>">Portafolio</a></li>
        <li>🎓 <strong>Cursos</strong> — Cargá cursos en <a href="<?php echo admin_url('edit.php?post_type=clientum_course'); ?>">Cursos</a></li>
        <li>💬 <strong>Testimonios</strong> — Cargá testimonios en <a href="<?php echo admin_url('edit.php?post_type=clientum_testimonial'); ?>">Testimonios</a></li>
      </ul>
    </div>
    <?php
}
