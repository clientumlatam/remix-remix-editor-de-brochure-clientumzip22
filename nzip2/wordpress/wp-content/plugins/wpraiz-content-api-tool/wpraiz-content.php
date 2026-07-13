<?php
/**
 * Plugin Name: WPRaiz Content API Tool
 * Plugin URI: https://wpraiz.com.br
 * Description: Create WordPress posts via REST API with SEO integration, AI content generation, and MCP server for AI agents.
 * Version: 2.0.2
 * Author: José Ícaro – WPRaiz
 * Author URI: https://wpraiz.com.br
 * License: GPLv3
 * License URI: https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain: wpraiz-content-api
 * Domain Path: /languages
 * Requires at least: 5.0
 * Tested up to: 7.0
 * Requires PHP: 7.4
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Plugin constants
define( 'WPRAIZ_VERSION', '2.0.2' );
define( 'WPRAIZ_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'WPRAIZ_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'WPRAIZ_PLUGIN_FILE', __FILE__ );
define( 'WPRAIZ_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

/**
 * PSR-4-style autoloader for WPRaiz classes.
 */
spl_autoload_register( function ( $class ) {
    $prefix = 'WPRaiz\\ContentAPI\\';
    $len    = strlen( $prefix );

    if ( strncmp( $prefix, $class, $len ) !== 0 ) {
        return;
    }

    $relative = substr( $class, $len );
    $parts    = explode( '\\', $relative );
    $filename = 'class-' . strtolower( str_replace( '_', '-', array_pop( $parts ) ) ) . '.php';

    $subdir = '';
    if ( ! empty( $parts ) ) {
        $subdir = strtolower( implode( '/', $parts ) ) . '/';
    }

    $file = WPRAIZ_PLUGIN_DIR . 'includes/' . $subdir . $filename;

    if ( file_exists( $file ) ) {
        require_once $file;
    }
});

/**
 * Initialize the plugin.
 */
function wpraiz_init() {
    // Load textdomain
    load_plugin_textdomain( 'wpraiz-content-api', false, dirname( WPRAIZ_PLUGIN_BASENAME ) . '/languages' );

    // Core
    new WPRaiz\ContentAPI\Auth();
    new WPRaiz\ContentAPI\Content_Manager();
    new WPRaiz\ContentAPI\Search_Engine();
    new WPRaiz\ContentAPI\SEO_Handler();
    new WPRaiz\ContentAPI\Media_Handler();
    new WPRaiz\ContentAPI\Webhooks();

    // AI
    new WPRaiz\ContentAPI\AI\AI_Manager();

    // Gutenberg sidebar
    new WPRaiz\ContentAPI\Gutenberg_Sidebar();

    // MCP
    new WPRaiz\ContentAPI\MCP\MCP_Server();

    // Admin
    if ( is_admin() ) {
        new WPRaiz\ContentAPI\Admin\Admin_Page();
        new WPRaiz\ContentAPI\Admin\License();
    }
}
add_action( 'plugins_loaded', 'wpraiz_init' );

/**
 * Activation hook — create options and flush rewrite rules.
 */
function wpraiz_activate() {
    add_option( 'wpraiz_settings', [
        'ai_provider'    => '',
        'openai_api_key' => '',
        'claude_api_key' => '',
        'auto_seo'       => true,
        'webhook_url'    => '',
        'webhook_events' => [ 'post_created' ],
        'rate_limit'     => 60,
    ]);
    flush_rewrite_rules();
}
register_activation_hook( __FILE__, 'wpraiz_activate' );

/**
 * Deactivation hook.
 */
function wpraiz_deactivate() {
    flush_rewrite_rules();
}
register_deactivation_hook( __FILE__, 'wpraiz_deactivate' );

/**
 * Helper: get plugin settings.
 */
function wpraiz_get_settings() {
    return wp_parse_args( get_option( 'wpraiz_settings', [] ), [
        'ai_provider'        => '',
        'openai_api_key'     => '',
        'claude_api_key'     => '',
        'deepseek_api_key'   => '',
        'openrouter_api_key' => '',
        'auto_seo'           => true,
        'webhook_url'        => '',
        'webhook_events'     => [ 'post_created' ],
        'rate_limit'         => 60,
    ]);
}

/**
 * Helper: check if Pro license is active.
 */
function wpraiz_is_pro(): bool {
    return \WPRaiz\ContentAPI\Admin\License::is_pro();
}
