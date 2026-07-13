<?php
namespace WPRaiz\ContentAPI;

if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Content Manager — create, update, bulk post operations via REST API.
 */
class Content_Manager {

    public function __construct() {
        add_action( 'rest_api_init', [ $this, 'register_routes' ] );
    }

    public function register_routes() {
        // Create single post
        register_rest_route( 'wpraiz/v2', '/create-post', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'create_post' ],
            'permission_callback' => [ Auth::class, 'authenticate' ],
            'args'                => $this->get_create_post_args(),
        ]);

        // Bulk create posts (Pro)
        register_rest_route( 'wpraiz/v2', '/create-posts', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'bulk_create' ],
            'permission_callback' => [ Auth::class, 'authenticate' ],
        ]);

        // Update post
        register_rest_route( 'wpraiz/v2', '/update-post', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'update_post' ],
            'permission_callback' => [ Auth::class, 'authenticate' ],
        ]);

        // Check status (public)
        register_rest_route( 'wpraiz/v2', '/check-status', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'check_status' ],
            'permission_callback' => '__return_true',
        ]);

        // ── Legacy v1 endpoints (backward compat) ──
        register_rest_route( 'api-post-creator/v1', '/create-post', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'create_post' ],
            'permission_callback' => [ Auth::class, 'authenticate' ],
        ]);
        register_rest_route( 'api-post-creator/v1', '/check-status', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'check_status' ],
            'permission_callback' => '__return_true',
        ]);
    }

    /**
     * Schema for create-post args.
     */
    private function get_create_post_args(): array {
        return [
            'title' => [
                'required'          => true,
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'content' => [
                'required' => true,
                'type'     => 'string',
            ],
            'status' => [
                'type'              => 'string',
                'default'           => 'draft',
                'sanitize_callback' => 'sanitize_text_field',
                'enum'              => [ 'draft', 'publish', 'pending', 'private', 'future' ],
            ],
            'post_type' => [
                'type'              => 'string',
                'default'           => 'post',
                'sanitize_callback' => 'sanitize_key',
            ],
            'primary_category' => [
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'tags' => [
                'type'  => 'array',
                'items' => [ 'type' => 'string' ],
            ],
            'excerpt' => [
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_textarea_field',
            ],
            'seo_title' => [
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'seo_desc' => [
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'image_url' => [
                'type'   => 'string',
                'format' => 'uri',
            ],
            'custom_meta' => [
                'type' => 'object',
            ],
            'auto_seo' => [
                'type'    => 'boolean',
                'default' => true,
            ],
        ];
    }

    /**
     * Create a single post.
     */
    public function create_post( \WP_REST_Request $request ) {
        $params = $request->get_json_params();

        // Validate post type
        $post_type = sanitize_key( $params['post_type'] ?? 'post' );
        if ( ! post_type_exists( $post_type ) ) {
            return new \WP_Error( 'invalid_post_type', __( 'Invalid post type.', 'wpraiz-content-api' ), [ 'status' => 400 ] );
        }

        // Allow unfiltered HTML for API
        remove_filter( 'content_save_pre', 'wp_filter_post_kses' );

        $post_data = [
            'post_title'   => sanitize_text_field( $params['title'] ),
            'post_content' => $params['content'],
            'post_status'  => sanitize_text_field( $params['status'] ?? 'draft' ),
            'post_type'    => $post_type,
            'post_author'  => get_current_user_id(),
        ];

        // Excerpt
        if ( ! empty( $params['excerpt'] ) ) {
            $post_data['post_excerpt'] = sanitize_textarea_field( $params['excerpt'] );
        }

        $post_id = wp_insert_post( $post_data, true );

        add_filter( 'content_save_pre', 'wp_filter_post_kses' );

        if ( is_wp_error( $post_id ) ) {
            return new \WP_Error( 'creation_failed', $post_id->get_error_message(), [ 'status' => 500 ] );
        }

        // Category
        if ( ! empty( $params['primary_category'] ) ) {
            $cat_id = Search_Engine::get_or_create_category( trim( $params['primary_category'] ) );
            if ( ! is_wp_error( $cat_id ) ) {
                wp_set_post_terms( $post_id, [ $cat_id ], 'category' );
            }
        }

        // Tags
        if ( ! empty( $params['tags'] ) && is_array( $params['tags'] ) ) {
            $tags = array_map( 'sanitize_text_field', $params['tags'] );
            wp_set_post_tags( $post_id, $tags );
        }

        // Featured image
        if ( ! empty( $params['image_url'] ) ) {
            $image_id = Media_Handler::upload_from_url( $params['image_url'], $post_id );
            if ( ! is_wp_error( $image_id ) ) {
                set_post_thumbnail( $post_id, $image_id );
            }
        }

        // SEO
        $seo_title = $params['seo_title'] ?? '';
        $seo_desc  = $params['seo_desc'] ?? '';

        // Auto-SEO via AI if enabled and fields empty
        $auto_seo = $params['auto_seo'] ?? true;
        if ( $auto_seo && wpraiz_is_pro() && ( empty( $seo_title ) || empty( $seo_desc ) ) ) {
            $ai_seo = AI\AI_Manager::generate_seo( $params['title'], $params['content'] );
            if ( ! is_wp_error( $ai_seo ) ) {
                $seo_title = $seo_title ?: ( $ai_seo['seo_title'] ?? '' );
                $seo_desc  = $seo_desc ?: ( $ai_seo['seo_desc'] ?? '' );
            }
        }

        if ( ! empty( $seo_title ) || ! empty( $seo_desc ) ) {
            SEO_Handler::save_meta( $post_id, $seo_title, $seo_desc );
        }

        // Custom meta
        if ( ! empty( $params['custom_meta'] ) && is_array( $params['custom_meta'] ) ) {
            foreach ( $params['custom_meta'] as $key => $value ) {
                $key = sanitize_key( $key );
                if ( ! empty( $key ) ) {
                    update_post_meta( $post_id, $key, sanitize_text_field( $value ) );
                }
            }
        }

        // Fire webhook
        Webhooks::fire( 'post_created', [
            'post_id'  => $post_id,
            'title'    => $params['title'],
            'status'   => $params['status'] ?? 'draft',
            'post_url' => get_permalink( $post_id ),
        ]);

        return new \WP_REST_Response( [
            'message'  => __( 'Post created successfully!', 'wpraiz-content-api' ),
            'post_id'  => $post_id,
            'post_url' => get_permalink( $post_id ),
            'edit_url' => admin_url( "post.php?post={$post_id}&action=edit" ),
        ], 201 );
    }

    /**
     * Bulk create posts (Pro).
     */
    public function bulk_create( \WP_REST_Request $request ) {
        if ( ! wpraiz_is_pro() ) {
            return new \WP_Error( 'pro_required', __( 'Bulk creation requires WPRaiz Pro.', 'wpraiz-content-api' ), [ 'status' => 403 ] );
        }

        $posts = $request->get_param( 'posts' );

        if ( ! is_array( $posts ) || empty( $posts ) ) {
            return new \WP_Error( 'invalid_data', __( 'Posts array is required.', 'wpraiz-content-api' ), [ 'status' => 400 ] );
        }

        if ( count( $posts ) > 50 ) {
            return new \WP_Error( 'too_many', __( 'Maximum 50 posts per batch.', 'wpraiz-content-api' ), [ 'status' => 400 ] );
        }

        $results = [];

        foreach ( $posts as $index => $post_data ) {
            if ( empty( $post_data['title'] ) || empty( $post_data['content'] ) ) {
                $results[] = [
                    'index' => $index,
                    'error' => __( 'Title and content are required.', 'wpraiz-content-api' ),
                ];
                continue;
            }

            // Create a fake request for each post
            $sub_request = new \WP_REST_Request( 'POST' );
            $sub_request->set_body( wp_json_encode( $post_data ) );
            $sub_request->set_header( 'Content-Type', 'application/json' );

            $result = $this->create_post( $sub_request );

            if ( is_wp_error( $result ) ) {
                $results[] = [
                    'index' => $index,
                    'error' => $result->get_error_message(),
                ];
            } else {
                $data = $result->get_data();
                $results[] = [
                    'index'    => $index,
                    'post_id'  => $data['post_id'],
                    'post_url' => $data['post_url'],
                ];
            }
        }

        // Fire webhook
        Webhooks::fire( 'bulk_completed', [
            'total'   => count( $posts ),
            'results' => $results,
        ]);

        return new \WP_REST_Response( [
            'message' => sprintf( __( 'Processed %d posts.', 'wpraiz-content-api' ), count( $posts ) ),
            'results' => $results,
        ], 200 );
    }

    /**
     * Update an existing post.
     */
    public function update_post( \WP_REST_Request $request ) {
        $params  = $request->get_json_params();
        $post_id = (int) ( $params['post_id'] ?? 0 );

        if ( ! $post_id || ! get_post( $post_id ) ) {
            return new \WP_Error( 'not_found', __( 'Post not found.', 'wpraiz-content-api' ), [ 'status' => 404 ] );
        }

        $update_data = [ 'ID' => $post_id ];

        if ( ! empty( $params['title'] ) ) {
            $update_data['post_title'] = sanitize_text_field( $params['title'] );
        }
        if ( ! empty( $params['content'] ) ) {
            $update_data['post_content'] = $params['content'];
        }
        if ( ! empty( $params['status'] ) ) {
            $update_data['post_status'] = sanitize_text_field( $params['status'] );
        }
        if ( ! empty( $params['excerpt'] ) ) {
            $update_data['post_excerpt'] = sanitize_textarea_field( $params['excerpt'] );
        }

        $had_kses = has_filter( 'content_save_pre', 'wp_filter_post_kses' );
        if ( $had_kses ) {
            remove_filter( 'content_save_pre', 'wp_filter_post_kses' );
        }
        try {
            $result = wp_update_post( $update_data, true );
        } finally {
            if ( $had_kses ) {
                add_filter( 'content_save_pre', 'wp_filter_post_kses' );
            }
        }

        if ( is_wp_error( $result ) ) {
            return new \WP_Error( 'update_failed', $result->get_error_message(), [ 'status' => 500 ] );
        }

        // SEO
        if ( ! empty( $params['seo_title'] ) || ! empty( $params['seo_desc'] ) ) {
            SEO_Handler::save_meta( $post_id, $params['seo_title'] ?? '', $params['seo_desc'] ?? '' );
        }

        // Featured image
        if ( ! empty( $params['image_url'] ) ) {
            $image_id = Media_Handler::upload_from_url( $params['image_url'], $post_id );
            if ( ! is_wp_error( $image_id ) ) {
                set_post_thumbnail( $post_id, $image_id );
            }
        }

        return new \WP_REST_Response( [
            'message'  => __( 'Post updated successfully!', 'wpraiz-content-api' ),
            'post_id'  => $post_id,
            'post_url' => get_permalink( $post_id ),
        ], 200 );
    }

    /**
     * Check plugin status.
     */
    public function check_status() {
        $seo_plugin = SEO_Handler::detect_plugin();

        return new \WP_REST_Response( [
            'plugin'     => 'WPRaiz Content API Tool',
            'version'    => WPRAIZ_VERSION,
            'status'     => 'active',
            'seo_plugin' => $seo_plugin ?: 'none',
            'pro'        => wpraiz_is_pro(),
            'php'        => PHP_VERSION,
            'wp'         => get_bloginfo( 'version' ),
            'endpoints'  => [
                'create_post'     => rest_url( 'wpraiz/v2/create-post' ),
                'bulk_create'     => rest_url( 'wpraiz/v2/create-posts' ),
                'update_post'     => rest_url( 'wpraiz/v2/update-post' ),
                'search_similar'  => rest_url( 'wpraiz/v2/search-similar' ),
                'categories'      => rest_url( 'wpraiz/v2/categories' ),
                'generate'        => rest_url( 'wpraiz/v2/generate-content' ),
                'rewrite'         => rest_url( 'wpraiz/v2/rewrite-post' ),
                'auth'            => rest_url( 'wpraiz/v2/auth/token' ),
                'mcp'             => rest_url( 'wpraiz-mcp/v1/mcp' ),
            ],
        ], 200 );
    }
}
