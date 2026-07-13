<?php
/**
 * Clientum — Script de importación de categorías desde CSV
 * 
 * INSTRUCCIONES:
 * 1. Subí este archivo a la raíz de tu WordPress (carpeta public_html o similar)
 * 2. Accedé vía: https://tusitioweb.com/setup-categorias.php?key=clientum2025
 * 3. Una vez ejecutado correctamente, ELIMINÁ este archivo del servidor
 * 
 * Este script crea automáticamente:
 *   - Categorías de posts (blog)
 *   - Categorías de productos (WooCommerce)
 *   - Categorías de cursos (LMS)
 */

define('ABSPATH', dirname(__FILE__) . '/');
$secret = $_GET['key'] ?? '';
if ($secret !== 'clientum2025') {
    die('Acceso denegado. Usá ?key=clientum2025');
}

require_once(ABSPATH . 'wp-load.php');

if (!current_user_can('manage_options') && !defined('WP_CLI')) {
    wp_die('Solo administradores pueden ejecutar este script.');
}

$results = [];

/* ── Categorías de POSTS (blog) ─────────────────────────────── */
$post_cats = [
    ['Educación', 'educacion', 0, 'Cursos, tutoriales y recursos para aprender'],
    ['Cursos en línea', 'cursos-en-linea', 'educacion', 'Formación online para PyMEs'],
    ['Tecnología', 'tecnologia', 0, 'Noticias y novedades tecnológicas'],
    ['ERP y Software', 'erp-software', 'tecnologia', 'Software de gestión para empresas'],
    ['Desarrollo Web', 'desarrollo-web-blog', 'tecnologia', 'Tendencias y proyectos web'],
    ['Inteligencia Artificial', 'inteligencia-artificial', 'tecnologia', 'IA aplicada a negocios'],
    ['Marketing', 'marketing', 0, 'Estrategias y herramientas de marketing'],
    ['Marketing Digital', 'marketing-digital', 'marketing', 'SEO, SEM, redes sociales y email marketing'],
    ['Negocios', 'negocios', 0, 'Gestión, estrategia y crecimiento empresarial'],
    ['Consultoría Empresarial', 'consultoria-empresarial', 'negocios', 'Diagnóstico y mejora de procesos'],
    ['Casos de Éxito', 'casos-de-exito', 0, 'Historias reales de PyMEs que crecieron con Clientum'],
    ['CRM y Ventas', 'crm-ventas', 0, 'Tips y estrategias de ventas con CRM'],
    ['Facturación AFIP', 'facturacion-afip', 0, 'AFIP, CAE y facturación electrónica en Argentina'],
    ['PyMEs Argentina', 'pymes-argentina', 0, 'Noticias y recursos para PyMEs argentinas'],
];

foreach ($post_cats as $cat) {
    $parent_id = 0;
    if (!is_int($cat[2]) && !empty($cat[2])) {
        $parent_term = get_term_by('slug', $cat[2], 'category');
        if ($parent_term) $parent_id = $parent_term->term_id;
    }
    $existing = get_term_by('slug', $cat[1], 'category');
    if (!$existing) {
        $result = wp_insert_term($cat[0], 'category', [
            'slug'        => $cat[1],
            'description' => $cat[3],
            'parent'      => $parent_id,
        ]);
        $results[] = $result instanceof WP_Error
            ? "❌ {$cat[0]}: " . $result->get_error_message()
            : "✅ Categoría creada: {$cat[0]}";
    } else {
        $results[] = "⚠️  Ya existe: {$cat[0]}";
    }
}

/* ── Categorías de PRODUCTOS (WooCommerce) ──────────────────── */
if (taxonomy_exists('product_cat')) {
    $product_cats = [
        ['ERP y CRM', 'erp-crm-producto', 0, 'Software de gestión ERP y CRM para empresas'],
        ['Integración API', 'integracion-api', 0, 'Servicios de integración API Gateway'],
        ['IA y Automatización', 'ia-automatizacion', 0, 'Inteligencia artificial y automatización de procesos'],
        ['Desarrollo Web', 'desarrollo-web-producto', 0, 'Servicios de desarrollo web personalizado'],
        ['E-commerce', 'e-commerce', 0, 'Tiendas online y soluciones de comercio electrónico'],
        ['Capacitación', 'capacitacion-producto', 0, 'Cursos y talleres de capacitación'],
        ['Consultoría', 'consultoria-producto', 0, 'Servicios de consultoría empresarial'],
        ['Hosting y Dominios', 'hosting-dominios', 0, 'Servicios de hosting, dominios y seguridad web'],
        ['Marketing Digital', 'marketing-digital-producto', 0, 'Campañas, SEO y herramientas de marketing'],
        ['Business Intelligence', 'business-intelligence', 0, 'Dashboards, analytics y reportes avanzados'],
        ['Soporte Técnico', 'soporte-tecnico', 0, 'Planes de soporte y mantenimiento'],
        ['Pack Integrado', 'pack-integrado', 0, 'Soluciones completas CRM+API+IA+Web'],
    ];
    foreach ($product_cats as $cat) {
        $existing = get_term_by('slug', $cat[1], 'product_cat');
        if (!$existing) {
            $result = wp_insert_term($cat[0], 'product_cat', [
                'slug'        => $cat[1],
                'description' => $cat[3],
            ]);
            $results[] = $result instanceof WP_Error
                ? "❌ Producto [{$cat[0]}]: " . $result->get_error_message()
                : "✅ Cat. producto creada: {$cat[0]}";
        } else {
            $results[] = "⚠️  Producto ya existe: {$cat[0]}";
        }
    }
} else {
    $results[] = "ℹ️  WooCommerce no activo — categorías de productos omitidas";
}

/* ── Tags de POSTS ──────────────────────────────────────────── */
$tags = [
    'CRM','ERP','PyMEs','Automatización','WhatsApp','IA','Facturación AFIP',
    'Leads','Pipeline','Dashboard','E-commerce','WordPress','Clientum',
    'Marketing Digital','Ventas','Integraciones','API','Chatbot',
];
foreach ($tags as $tag) {
    $slug = sanitize_title($tag);
    if (!get_term_by('slug', $slug, 'post_tag')) {
        $r = wp_insert_term($tag, 'post_tag', ['slug' => $slug]);
        $results[] = $r instanceof WP_Error ? "❌ Tag [{$tag}]" : "✅ Tag: {$tag}";
    }
}

/* ── Crear páginas del menú si no existen ───────────────────── */
$pages = [
    ['Catálogo de Servicios', 'catalogo-servicios', 'Catálogo de Servicios', 'Catálogo de Servicios'],
    ['Integración API Gateway', 'integracion-api-gateway', 'API Gateway', 'API Gateway'],
    ['Viaweb AI Copilot', 'ai-copilot', 'AI Copilot', 'AI Copilot'],
    ['Desarrollo Web Personalizado', 'desarrollo-web-personalizado', 'Desarrollo Web Personalizado', 'Desarrollo Web Personalizado'],
    ['Academia y Cursos', 'academia-cursos', 'Academia y Cursos', 'Academia y Cursos'],
];
foreach ($pages as $page) {
    $existing = get_page_by_path($page[1]);
    if (!$existing) {
        $id = wp_insert_post([
            'post_title'  => $page[0],
            'post_name'   => $page[1],
            'post_status' => 'publish',
            'post_type'   => 'page',
            'page_template' => 'template-' . $page[2] . '.php',
        ]);
        $results[] = is_wp_error($id) ? "❌ Página [{$page[0]}]" : "✅ Página creada: {$page[0]} (ID: {$id})";
    } else {
        $results[] = "⚠️  Página ya existe: {$page[0]}";
    }
}

?><!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Setup Categorías — Clientum</title>
<style>body{font-family:system-ui;max-width:700px;margin:40px auto;padding:20px;background:#f8fafc}
h1{color:#1A3461}li{padding:4px 0;font-size:.9rem}
.ok{color:#166534}.warn{color:#92400e}.err{color:#991b1b}
.box{background:white;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin-top:20px}
.done{background:#dcfce7;border-color:#86efac;border-radius:8px;padding:16px;margin-top:20px;color:#166534;font-weight:600}</style>
</head><body>
<h1>🚀 Clientum — Importación de categorías</h1>
<div class="box">
<ul>
<?php foreach ($results as $r): ?>
<li class="<?php echo strpos($r,'✅') !== false ? 'ok' : (strpos($r,'⚠️') !== false ? 'warn' : 'err'); ?>">
  <?php echo esc_html($r); ?>
</li>
<?php endforeach; ?>
</ul>
</div>
<div class="done">
  ✅ Proceso completado. <strong>Eliminá este archivo del servidor ahora.</strong><br>
  <small>setup-categorias.php no debe quedar accesible públicamente.</small>
</div>
<p style="margin-top:20px;font-size:.82rem;color:#64748b">
  Categorías importadas desde los CSVs de viaweb.net.ar para el tema Clientum.
</p>
</body></html>
