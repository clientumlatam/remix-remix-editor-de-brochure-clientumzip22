<?php
namespace WPRaiz\ContentAPI;

if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Gutenberg Sidebar — AI tools inside the post editor.
 *
 * Adds a "WPRaiz AI" panel in the block editor sidebar with:
 * - Generate article from topic
 * - Rewrite current post (5 modes)
 * - Generate SEO meta
 * - Search similar posts
 *
 * All via inline JS + REST API calls (no build step needed).
 */
class Gutenberg_Sidebar {

    public function __construct() {
        add_action( 'enqueue_block_editor_assets', [ $this, 'enqueue_sidebar' ] );
        add_action( 'rest_api_init', [ $this, 'register_quick_routes' ] );
    }

    /**
     * Register lightweight endpoints for editor use.
     */
    public function register_quick_routes() {
        // Quick SEO generation from current post content
        register_rest_route( 'wpraiz/v2', '/quick-seo/(?P<post_id>\d+)', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'handle_quick_seo' ],
            'permission_callback' => function() {
                return current_user_can( 'edit_posts' );
            },
        ] );
    }

    public function handle_quick_seo( \WP_REST_Request $request ) {
        $post = get_post( (int) $request['post_id'] );
        if ( ! $post ) {
            return new \WP_Error( 'not_found', 'Post not found.', [ 'status' => 404 ] );
        }

        $result = AI\AI_Manager::generate_seo( $post->post_title, $post->post_content );

        if ( is_wp_error( $result ) ) {
            return $result;
        }

        // Save SEO meta
        SEO_Handler::save_meta( $post->ID, $result['seo_title'], $result['seo_desc'] );

        return new \WP_REST_Response( [
            'seo_title' => $result['seo_title'],
            'seo_desc'  => $result['seo_desc'],
            'saved'     => true,
        ], 200 );
    }

    /**
     * Enqueue sidebar script in block editor.
     */
    public function enqueue_sidebar( ) {
        $settings = wpraiz_get_settings();
        $provider = AI\AI_Manager::get_provider();

        wp_enqueue_script(
            'wpraiz-gutenberg-sidebar',
            WPRAIZ_PLUGIN_URL . 'assets/js/gutenberg-sidebar.js',
            [ 'wp-plugins', 'wp-edit-post', 'wp-element', 'wp-components', 'wp-data', 'wp-api-fetch' ],
            WPRAIZ_VERSION,
            true
        );

        wp_localize_script( 'wpraiz-gutenberg-sidebar', 'wpraizEditor', [
            'isPro'          => wpraiz_is_pro(),
            'hasProvider'    => $provider !== null,
            'providerName'   => $provider ? $provider->get_name() : '',
            'restBase'       => rest_url( 'wpraiz/v2/' ),
            'nonce'          => wp_create_nonce( 'wp_rest' ),
            'seoPlugin'      => SEO_Handler::detect_plugin(),
        ] );
    }
}
