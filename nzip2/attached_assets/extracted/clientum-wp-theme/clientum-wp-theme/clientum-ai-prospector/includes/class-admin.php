<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class CAP_Admin {

    public static function add_menu() {
        add_menu_page(
            'Clientum AI Prospector',
            'Clientum',
            'manage_options',
            'clientum-prospector-settings',
            [ __CLASS__, 'settings_page' ],
            'data:image/svg+xml;base64,' . base64_encode( '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' ),
            30
        );

        add_submenu_page(
            'clientum-prospector-settings',
            'Configuración',
            'Configuración',
            'manage_options',
            'clientum-prospector-settings',
            [ __CLASS__, 'settings_page' ]
        );

        add_submenu_page(
            'clientum-prospector-settings',
            'Estado del Plugin',
            'Estado',
            'manage_options',
            'clientum-prospector-status',
            [ __CLASS__, 'status_page' ]
        );
    }

    public static function register_settings() {
        register_setting( 'cap_settings_group', 'cap_gemini_api_key',    [ 'sanitize_callback' => 'sanitize_text_field' ] );
        register_setting( 'cap_settings_group', 'cap_apify_token',       [ 'sanitize_callback' => 'sanitize_text_field' ] );
        register_setting( 'cap_settings_group', 'cap_maps_api_key',      [ 'sanitize_callback' => 'sanitize_text_field' ] );
        register_setting( 'cap_settings_group', 'cap_hunter_api_key',    [ 'sanitize_callback' => 'sanitize_text_field' ] );
        register_setting( 'cap_settings_group', 'cap_app_page_id',       [ 'sanitize_callback' => 'absint' ] );
        register_setting( 'cap_settings_group', 'cap_allow_registration',[ 'sanitize_callback' => 'absint', 'default' => 1 ] );

        /* ── Sección: API Keys ─────────────────────────────────────────── */
        add_settings_section( 'cap_api_section', '🔑 API Keys', null, 'clientum-prospector-settings' );

        add_settings_field( 'cap_gemini_api_key', 'Google Gemini API Key',
            [ __CLASS__, 'field_gemini' ], 'clientum-prospector-settings', 'cap_api_section' );

        add_settings_field( 'cap_apify_token', 'Apify Token (Patagonia Explorer)',
            [ __CLASS__, 'field_apify' ], 'clientum-prospector-settings', 'cap_api_section' );

        add_settings_field( 'cap_maps_api_key', 'Google Maps API Key (opcional)',
            [ __CLASS__, 'field_maps' ], 'clientum-prospector-settings', 'cap_api_section' );

        add_settings_field( 'cap_hunter_api_key', 'Hunter.io API Key (Enriquecer contactos)',
            [ __CLASS__, 'field_hunter' ], 'clientum-prospector-settings', 'cap_api_section' );

        /* ── Sección: App ──────────────────────────────────────────────── */
        add_settings_section( 'cap_app_section', '⚙️ Configuración de la App', null, 'clientum-prospector-settings' );

        add_settings_field( 'cap_app_page_id', 'Página de la App',
            [ __CLASS__, 'field_app_page' ], 'clientum-prospector-settings', 'cap_app_section' );

        add_settings_field( 'cap_allow_registration', 'Permitir registro de nuevos usuarios',
            [ __CLASS__, 'field_registration' ], 'clientum-prospector-settings', 'cap_app_section' );
    }

    /* ── Field renderers ───────────────────────────────────────────────── */

    public static function field_gemini() {
        $val = get_option( 'cap_gemini_api_key', '' );
        echo '<input type="password" name="cap_gemini_api_key" value="' . esc_attr( $val ) . '" class="regular-text" />';
        echo '<p class="description">Obtené tu key en <a href="https://aistudio.google.com/app/apikey" target="_blank">Google AI Studio</a>.</p>';
    }

    public static function field_apify() {
        $val = get_option( 'cap_apify_token', '' );
        echo '<input type="password" name="cap_apify_token" value="' . esc_attr( $val ) . '" class="regular-text" />';
        echo '<p class="description">Requerido para búsqueda real de leads en Google Maps. Sin token se muestran datos demo.</p>';
    }

    public static function field_maps() {
        $val = get_option( 'cap_maps_api_key', '' );
        echo '<input type="password" name="cap_maps_api_key" value="' . esc_attr( $val ) . '" class="regular-text" />';
        echo '<p class="description">Opcional. Para mostrar mapa interactivo en Patagonia Explorer.</p>';
    }

    public static function field_hunter() {
        $val = get_option( 'cap_hunter_api_key', '' );
        echo '<input type="password" name="cap_hunter_api_key" value="' . esc_attr( $val ) . '" class="regular-text" />';
        echo '<p class="description">Obtené tu key en <a href="https://hunter.io/api-keys" target="_blank">Hunter.io</a>. Se usa para buscar contactos por dominio en el CRM Pipeline.</p>';
    }

    public static function field_app_page() {
        $page_id = get_option( 'cap_app_page_id', 0 );
        $pages   = get_pages();
        echo '<select name="cap_app_page_id">';
        echo '<option value="0">— Ninguna (usar shortcode manual) —</option>';
        foreach ( $pages as $page ) {
            $selected = selected( $page->ID, $page_id, false );
            echo '<option value="' . esc_attr( $page->ID ) . '" ' . $selected . '>' . esc_html( $page->post_title ) . '</option>';
        }
        echo '</select>';
        echo '<p class="description">Página donde está insertado el shortcode <code>[clientum_prospector]</code>. También podés acceder directamente en <code>/prospector/</code>.</p>';
    }

    public static function field_registration() {
        $val = get_option( 'cap_allow_registration', 1 );
        echo '<label><input type="checkbox" name="cap_allow_registration" value="1" ' . checked( 1, $val, false ) . ' /> Habilitar registro público de usuarios</label>';
        echo '<p class="description">Si está deshabilitado, solo los admins pueden crear cuentas desde el panel de WordPress.</p>';
    }

    /* ── Settings page ─────────────────────────────────────────────────── */

    public static function settings_page() {
        if ( ! current_user_can( 'manage_options' ) ) {
            wp_die( 'No tenés permisos.' );
        }
        ?>
        <div class="wrap">
            <h1>⚡ Clientum AI Prospector — Configuración</h1>

            <?php settings_errors(); ?>

            <div style="display:flex;gap:24px;align-items:flex-start;margin-top:16px;">
                <div style="flex:1;">
                    <form method="post" action="options.php">
                        <?php
                        settings_fields( 'cap_settings_group' );
                        do_settings_sections( 'clientum-prospector-settings' );
                        submit_button( 'Guardar configuración' );
                        ?>
                    </form>
                </div>

                <div style="width:320px;background:#f8f9fa;border:1px solid #ddd;border-radius:8px;padding:20px;">
                    <h3 style="margin-top:0;">📋 Acceso rápido</h3>
                    <p><strong>Shortcode:</strong><br><code>[clientum_prospector]</code></p>
                    <p><strong>URL directa:</strong><br><code><?php echo esc_url( home_url( '/prospector/' ) ); ?></code></p>
                    <hr>
                    <h3>🔗 API Endpoints</h3>
                    <ul style="font-size:12px;line-height:1.8;">
                        <li><code>POST /wp-json/clientum/v1/auth/login</code></li>
                        <li><code>POST /wp-json/clientum/v1/auth/register</code></li>
                        <li><code>GET /wp-json/clientum/v1/auth/me</code></li>
                        <li><code>POST /wp-json/clientum/v1/generate</code></li>
                        <li><code>POST /wp-json/clientum/v1/scrape-places</code></li>
                        <li><code>GET|POST /wp-json/clientum/v1/deals</code></li>
                        <li><code>GET|POST /wp-json/clientum/v1/contacts</code></li>
                        <li><code>GET|POST /wp-json/clientum/v1/activities</code></li>
                        <li><code>GET|POST /wp-json/clientum/v1/templates</code></li>
                        <li><code>GET|POST /wp-json/clientum/v1/leads</code></li>
                        <li><code>GET|POST /wp-json/clientum/v1/products</code></li>
                        <li><code>GET|POST /wp-json/clientum/v1/sellers</code></li>
                        <li><code>GET|POST /wp-json/clientum/v1/branches</code></li>
                        <li><code>GET|POST /wp-json/clientum/v1/conversations</code></li>
                        <li><code>GET|POST /wp-json/clientum/v1/bot-settings</code></li>
                        <li><code>POST /wp-json/clientum/v1/enrich-contact</code></li>
                    </ul>
                    <hr>
                    <h3>📊 Estado</h3>
                    <a href="<?php echo admin_url( 'admin.php?page=clientum-prospector-status' ); ?>" class="button">Ver estado del plugin →</a>
                </div>
            </div>
        </div>
        <?php
    }

    /* ── Status page ───────────────────────────────────────────────────── */

    public static function status_page() {
        global $wpdb;
        if ( ! current_user_can( 'manage_options' ) ) wp_die( 'No tenés permisos.' );

        $gemini_ok  = ! empty( get_option( 'cap_gemini_api_key' ) );
        $apify_ok   = ! empty( get_option( 'cap_apify_token' ) );
        $js_exists  = file_exists( CAP_PLUGIN_DIR . 'assets/js/clientum-prospector.js' );
        $css_exists = file_exists( CAP_PLUGIN_DIR . 'assets/css/clientum-prospector.css' );

        $tables = [ 'cap_deals', 'cap_activities', 'cap_contacts', 'cap_templates', 'cap_api_keys', 'cap_leads', 'cap_products', 'cap_sellers', 'cap_branches', 'cap_conversations' ];

        function check( $ok ) { return $ok ? '✅' : '❌'; }
        ?>
        <div class="wrap">
            <h1>⚡ Clientum AI Prospector — Estado</h1>
            <table class="widefat" style="max-width:600px;margin-top:16px;">
                <thead><tr><th>Componente</th><th>Estado</th></tr></thead>
                <tbody>
                    <tr><td>Gemini API Key configurada</td><td><?php echo check( $gemini_ok ); ?></td></tr>
                    <tr><td>Apify Token configurado</td><td><?php echo check( $apify_ok ); ?> <?php if ( ! $apify_ok ) echo '<em>(datos demo activos)</em>'; ?></td></tr>
                    <tr><td>React bundle (JS)</td><td><?php echo check( $js_exists ); ?> <?php if ( ! $js_exists ) echo '<em>Falta correr <code>build-for-wp.sh</code></em>'; ?></td></tr>
                    <tr><td>React CSS</td><td><?php echo check( $css_exists ); ?></td></tr>
                    <?php foreach ( $tables as $t ) :
                        $exists = $wpdb->get_var( "SHOW TABLES LIKE '{$wpdb->prefix}{$t}'" ) !== null;
                    ?>
                    <tr><td>Tabla <code><?php echo esc_html( $wpdb->prefix . $t ); ?></code></td><td><?php echo check( $exists ); ?></td></tr>
                    <?php endforeach; ?>
                    <tr><td>Total de usuarios</td><td><?php echo count_users()['total_users']; ?></td></tr>
                </tbody>
            </table>

            <?php if ( ! $js_exists ) : ?>
            <div class="notice notice-warning" style="max-width:600px;margin-top:16px;">
                <p><strong>El bundle de React todavía no está compilado.</strong><br>
                Seguí los pasos del <code>README.md</code> del plugin para compilarlo y copiarlo a <code>assets/js/</code>.</p>
            </div>
            <?php endif; ?>
        </div>
        <?php
    }
}
