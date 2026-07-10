<?php
if (!defined('ABSPATH')) exit;

// ── Service Meta Boxes ─────────────────────────────────────────────────────────
function clientum_add_meta_boxes(): void {
    add_meta_box('clientum_service_meta',     'Detalles del Servicio',      'clientum_service_meta_cb',     'clientum_service',     'normal', 'high');
    add_meta_box('clientum_service_gallery',  'Galería del Servicio',       'clientum_service_gallery_cb',  'clientum_service',     'normal', 'default');
    add_meta_box('clientum_service_faqs',     'FAQs del Servicio (JSON)',   'clientum_service_faqs_cb',     'clientum_service',     'normal', 'default');
    add_meta_box('clientum_project_meta',     'Detalles del Proyecto',      'clientum_project_meta_cb',     'clientum_project',     'normal', 'high');
    add_meta_box('clientum_course_meta',      'Detalles del Curso',         'clientum_course_meta_cb',      'clientum_course',      'normal', 'high');
    add_meta_box('clientum_testimonial_meta', 'Detalles del Testimonio',    'clientum_testimonial_meta_cb', 'clientum_testimonial', 'normal', 'high');
}
add_action('add_meta_boxes', 'clientum_add_meta_boxes');

function clientum_service_meta_cb(WP_Post $post): void {
    wp_nonce_field('clientum_service_meta', 'clientum_service_nonce');
    $icon     = get_post_meta($post->ID, '_service_icon', true);
    $price    = get_post_meta($post->ID, '_service_price', true);
    $monthly  = get_post_meta($post->ID, '_service_monthly', true);
    $bullets  = get_post_meta($post->ID, '_service_bullets', true);
    $delivery = get_post_meta($post->ID, '_service_delivery', true);
    ?>
    <table class="form-table">
      <tr><th><label>Ícono (emoji)</label></th><td><input name="_service_icon" value="<?php echo esc_attr($icon); ?>" class="regular-text" placeholder="🚀"></td></tr>
      <tr><th><label>Precio (número)</label></th><td><input name="_service_price" value="<?php echo esc_attr($price); ?>" class="regular-text" placeholder="150000"></td></tr>
      <tr><th><label>Es mensual</label></th><td><input type="checkbox" name="_service_monthly" <?php checked($monthly, 'on'); ?>><label style="margin-left:6px">Sí (precio mensual)</label></td></tr>
      <tr><th><label>Plazo de entrega</label></th><td><input name="_service_delivery" value="<?php echo esc_attr($delivery); ?>" class="regular-text" placeholder="5 días hábiles"></td></tr>
      <tr><th><label>Bullets incluidos<br><small>(un ítem por línea)</small></label></th><td><textarea name="_service_bullets" rows="6" class="large-text"><?php echo esc_textarea($bullets); ?></textarea></td></tr>
    </table>
    <?php
}

function clientum_service_gallery_cb(WP_Post $post): void {
    wp_nonce_field('clientum_service_gallery', 'clientum_gallery_nonce');
    $gallery = get_post_meta($post->ID, '_service_gallery', true);
    ?>
    <p style="color:#666;font-size:12px;margin-bottom:8px">Ingresá los IDs de adjuntos separados por coma (ej: <code>42,57,103</code>). Subí las imágenes desde <strong>Medios</strong> y copiá sus IDs.</p>
    <input name="_service_gallery" value="<?php echo esc_attr($gallery); ?>" class="large-text" placeholder="42,57,103">
    <?php
}

function clientum_service_faqs_cb(WP_Post $post): void {
    wp_nonce_field('clientum_service_faqs', 'clientum_faqs_nonce');
    $faqs = get_post_meta($post->ID, '_service_faqs', true);
    ?>
    <p style="color:#666;font-size:12px;margin-bottom:8px">Formato JSON. Ejemplo:</p>
    <pre style="background:#f6f7f7;padding:8px;border-radius:4px;font-size:11px;overflow:auto">[{"q":"¿Qué incluye?","a":"Incluye configuración completa y soporte."},{"q":"¿Cuánto tarda?","a":"5 días hábiles."}]</pre>
    <textarea name="_service_faqs" rows="6" class="large-text" style="font-family:monospace"><?php echo esc_textarea($faqs); ?></textarea>
    <?php
}

function clientum_project_meta_cb(WP_Post $post): void {
    wp_nonce_field('clientum_project_meta', 'clientum_project_nonce');
    $year     = get_post_meta($post->ID, '_project_year', true);
    $type     = get_post_meta($post->ID, '_project_type', true);
    $industry = get_post_meta($post->ID, '_project_industry', true);
    ?>
    <table class="form-table">
      <tr><th><label>Año</label></th><td><input name="_project_year" value="<?php echo esc_attr($year); ?>" class="regular-text" placeholder="2024"></td></tr>
      <tr><th><label>Tipo de Proyecto</label></th><td><input name="_project_type" value="<?php echo esc_attr($type); ?>" class="regular-text" placeholder="E-Commerce & CRM"></td></tr>
      <tr><th><label>Industria</label></th>
        <td><select name="_project_industry">
          <?php foreach (['servicios' => 'Servicios', 'retail' => 'Retail', 'agroindustria' => 'Agroindustria', 'manufactura' => 'Manufactura', 'ciberseguridad' => 'Ciberseguridad', 'salud' => 'Salud', 'gastronomia' => 'Gastronomía'] as $slug => $label): ?>
            <option value="<?php echo esc_attr($slug); ?>" <?php selected($industry, $slug); ?>><?php echo esc_html($label); ?></option>
          <?php endforeach; ?>
        </select></td></tr>
    </table>
    <?php
}

function clientum_course_meta_cb(WP_Post $post): void {
    wp_nonce_field('clientum_course_meta', 'clientum_course_nonce');
    $duration = get_post_meta($post->ID, '_course_duration', true);
    $level    = get_post_meta($post->ID, '_course_level', true);
    $price    = get_post_meta($post->ID, '_course_price', true);
    $url      = get_post_meta($post->ID, '_course_url', true);
    ?>
    <table class="form-table">
      <tr><th><label>Duración</label></th><td><input name="_course_duration" value="<?php echo esc_attr($duration); ?>" class="regular-text" placeholder="4 semanas"></td></tr>
      <tr><th><label>Nivel</label></th>
        <td><select name="_course_level">
          <?php foreach (['Principiante', 'Intermedio', 'Avanzado', 'General'] as $lvl): ?>
            <option value="<?php echo esc_attr($lvl); ?>" <?php selected($level, $lvl); ?>><?php echo esc_html($lvl); ?></option>
          <?php endforeach; ?>
        </select></td></tr>
      <tr><th><label>Precio (vacío = gratis)</label></th><td><input name="_course_price" value="<?php echo esc_attr($price); ?>" class="regular-text" placeholder="0"></td></tr>
      <tr><th><label>URL externa del curso</label></th><td><input name="_course_url" value="<?php echo esc_attr($url); ?>" class="large-text" placeholder="https://..."></td></tr>
    </table>
    <?php
}

function clientum_testimonial_meta_cb(WP_Post $post): void {
    wp_nonce_field('clientum_testimonial_meta', 'clientum_testimonial_nonce');
    $company = get_post_meta($post->ID, '_company', true);
    $rating  = get_post_meta($post->ID, '_rating', true) ?: 5;
    ?>
    <table class="form-table">
      <tr><th><label>Empresa / Cargo</label></th><td><input name="_company" value="<?php echo esc_attr($company); ?>" class="large-text" placeholder="Distribuidora del Sur — Neuquén"></td></tr>
      <tr><th><label>Rating (1-5)</label></th>
        <td><select name="_rating">
          <?php for ($i = 5; $i >= 1; $i--): ?>
            <option value="<?php echo $i; ?>" <?php selected($rating, $i); ?>><?php echo $i; ?> ★</option>
          <?php endfor; ?>
        </select></td></tr>
    </table>
    <?php
}

// ── Save Meta ─────────────────────────────────────────────────────────────────
function clientum_save_meta(int $post_id): void {
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $post_id)) return;

    $nonces = [
        'clientum_service_nonce'     => ['_service_icon', '_service_price', '_service_monthly', '_service_bullets', '_service_delivery'],
        'clientum_gallery_nonce'     => ['_service_gallery'],
        'clientum_faqs_nonce'        => ['_service_faqs'],
        'clientum_project_nonce'     => ['_project_year', '_project_type', '_project_industry'],
        'clientum_course_nonce'      => ['_course_duration', '_course_level', '_course_price', '_course_url'],
        'clientum_testimonial_nonce' => ['_company', '_rating'],
    ];

    foreach ($nonces as $nonce_key => $fields) {
        if (empty($_POST[$nonce_key]) || !wp_verify_nonce($_POST[$nonce_key], $nonce_key)) continue;
        foreach ($fields as $field) {
            if (isset($_POST[$field])) {
                // FAQs: allow JSON
                if ($field === '_service_faqs') {
                    $raw = stripslashes($_POST[$field]);
                    json_decode($raw); // validate
                    if (json_last_error() === JSON_ERROR_NONE || empty(trim($raw))) {
                        update_post_meta($post_id, $field, $raw);
                    }
                } elseif ($field === '_service_gallery') {
                    // Comma-sep IDs
                    $val = preg_replace('/[^0-9,]/', '', $_POST[$field]);
                    update_post_meta($post_id, $field, $val);
                } else {
                    update_post_meta($post_id, $field, sanitize_text_field($_POST[$field]));
                }
            } else {
                // Unchecked checkbox = delete
                if ($field === '_service_monthly') {
                    delete_post_meta($post_id, $field);
                }
            }
        }
    }
}
add_action('save_post', 'clientum_save_meta');
