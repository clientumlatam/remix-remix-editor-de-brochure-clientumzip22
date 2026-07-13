<?php
namespace WPRaiz\ContentAPI\AI;

if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * AI Manager — factory, content generation, rewrite, auto-SEO endpoints.
 */
class AI_Manager {

    public function __construct() {
        add_action( 'rest_api_init', [ $this, 'register_routes' ] );
    }

    public function register_routes() {
        // Generate content (Pro)
        register_rest_route( 'wpraiz/v2', '/generate-content', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'handle_generate' ],
            'permission_callback' => [ \WPRaiz\ContentAPI\Auth::class, 'authenticate' ],
        ]);

        // Rewrite post (Pro)
        register_rest_route( 'wpraiz/v2', '/rewrite-post', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'handle_rewrite' ],
            'permission_callback' => [ \WPRaiz\ContentAPI\Auth::class, 'authenticate' ],
        ]);
    }

    /**
     * Get the active AI provider instance.
     */
    public static function get_provider(): ?AI_Provider {
        $settings = wpraiz_get_settings();
        $provider = $settings['ai_provider'] ?? '';

        $providers = [
            'openai'     => OpenAI_Provider::class,
            'claude'     => Claude_Provider::class,
            'deepseek'   => DeepSeek_Provider::class,
            'openrouter' => OpenRouter_Provider::class,
        ];

        // Explicit selection
        if ( isset( $providers[ $provider ] ) ) {
            $p = new $providers[ $provider ]();
            return $p->is_configured() ? $p : null;
        }

        // Auto-detect: OpenRouter (free) first, then DeepSeek, Claude, OpenAI
        $auto_order = [ 'openrouter', 'deepseek', 'claude', 'openai' ];
        foreach ( $auto_order as $key ) {
            $p = new $providers[ $key ]();
            if ( $p->is_configured() ) return $p;
        }

        return null;
    }

    /**
     * Generate SEO title and description from content.
     *
     * @param string $title   Post title.
     * @param string $content Post content.
     * @return array|\WP_Error [ 'seo_title' => ..., 'seo_desc' => ... ]
     */
    public static function generate_seo( string $title, string $content ) {
        $provider = self::get_provider();
        if ( ! $provider ) {
            return new \WP_Error( 'no_provider', __( 'No AI provider configured.', 'wpraiz-content-api' ) );
        }

        $content_preview = mb_substr( wp_strip_all_tags( $content ), 0, 1000 );

        $prompt = "Based on this article, generate an optimized SEO title (max 60 chars) and meta description (max 155 chars).\n\n"
                . "Article title: {$title}\n\n"
                . "Article content (preview): {$content_preview}\n\n"
                . "Respond ONLY in this exact JSON format, no other text:\n"
                . '{"seo_title": "...", "seo_desc": "..."}';

        $result = $provider->generate( $prompt, [
            'system'      => 'You are an SEO specialist. Respond only with valid JSON.',
            'temperature' => 0.3,
            'max_tokens'  => 200,
        ]);

        if ( is_wp_error( $result ) ) {
            return $result;
        }

        $parsed = json_decode( $result, true );
        if ( ! $parsed || empty( $parsed['seo_title'] ) ) {
            return new \WP_Error( 'parse_error', __( 'Failed to parse AI SEO response.', 'wpraiz-content-api' ) );
        }

        return [
            'seo_title' => sanitize_text_field( $parsed['seo_title'] ),
            'seo_desc'  => sanitize_text_field( $parsed['seo_desc'] ?? '' ),
        ];
    }

    /**
     * Handle /generate-content endpoint.
     */
    public function handle_generate( \WP_REST_Request $request ) {
        if ( ! wpraiz_is_pro() ) {
            return new \WP_Error( 'pro_required', __( 'Content generation requires WPRaiz Pro.', 'wpraiz-content-api' ), [ 'status' => 403 ] );
        }

        $provider = self::get_provider();
        if ( ! $provider ) {
            return new \WP_Error( 'no_provider', __( 'No AI provider configured. Add your API key in Settings.', 'wpraiz-content-api' ), [ 'status' => 400 ] );
        }

        $params = $request->get_json_params();
        $topic  = sanitize_text_field( $params['topic'] ?? '' );

        if ( empty( $topic ) ) {
            return new \WP_Error( 'missing_topic', __( 'Topic is required.', 'wpraiz-content-api' ), [ 'status' => 400 ] );
        }

        $tone     = sanitize_text_field( $params['tone'] ?? 'professional' );
        $length   = sanitize_text_field( $params['length'] ?? 'medium' );
        $language = sanitize_text_field( $params['language'] ?? 'pt-BR' );
        $keywords = $params['keywords'] ?? [];
        $publish  = (bool) ( $params['auto_publish'] ?? false );
        $category = sanitize_text_field( $params['primary_category'] ?? '' );

        $length_guide = match( $length ) {
            'short'  => '500-800 words',
            'long'   => '2000-3000 words',
            default  => '1000-1500 words',
        };

        $keywords_str = is_array( $keywords ) ? implode( ', ', array_map( 'sanitize_text_field', $keywords ) ) : '';

        $prompt = "Write a blog article about: {$topic}\n\n"
                . "Requirements:\n"
                . "- Tone: {$tone}\n"
                . "- Length: {$length_guide}\n"
                . "- Language: {$language}\n"
                . ( $keywords_str ? "- Include these keywords naturally: {$keywords_str}\n" : '' )
                . "- Format with proper HTML headings (h2, h3), paragraphs, lists where appropriate\n"
                . "- Do NOT include the main title (h1) in the content — it will be set separately\n\n"
                . "Respond ONLY with valid JSON in this format:\n"
                . '{"title": "Article Title", "content": "<h2>...</h2><p>...</p>...", "excerpt": "Short 1-2 sentence summary", "seo_title": "SEO optimized title (max 60 chars)", "seo_desc": "Meta description (max 155 chars)", "tags": ["tag1", "tag2", "tag3"]}';

        $result = $provider->generate( $prompt, [
            'system'      => "You are an expert content writer. Write engaging, well-structured articles. Always respond with valid JSON only, no markdown code fences.",
            'temperature' => 0.7,
            'max_tokens'  => 8192,
        ]);

        if ( is_wp_error( $result ) ) {
            return $result;
        }

        // Clean and parse JSON
        $result = preg_replace( '/^```json\s*/', '', trim( $result ) );
        $result = preg_replace( '/\s*```$/', '', $result );
        $parsed = json_decode( $result, true );

        if ( ! $parsed || empty( $parsed['title'] ) || empty( $parsed['content'] ) ) {
            return new \WP_Error( 'parse_error', __( 'Failed to parse AI response.', 'wpraiz-content-api' ), [ 'status' => 500 ] );
        }

        // Optionally auto-publish
        if ( $publish ) {
            $post_data = [
                'title'            => $parsed['title'],
                'content'          => $parsed['content'],
                'status'           => 'publish',
                'excerpt'          => $parsed['excerpt'] ?? '',
                'seo_title'        => $parsed['seo_title'] ?? '',
                'seo_desc'         => $parsed['seo_desc'] ?? '',
                'tags'             => $parsed['tags'] ?? [],
                'primary_category' => $category,
                'auto_seo'         => false,
            ];

            $sub_request = new \WP_REST_Request( 'POST' );
            $sub_request->set_body( wp_json_encode( $post_data ) );
            $sub_request->set_header( 'Content-Type', 'application/json' );

            $cm     = new \WPRaiz\ContentAPI\Content_Manager();
            $create = $cm->create_post( $sub_request );

            if ( is_wp_error( $create ) ) {
                return $create;
            }

            $create_data = $create->get_data();
            $parsed['post_id']  = $create_data['post_id'];
            $parsed['post_url'] = $create_data['post_url'];
            $parsed['status']   = 'published';
        } else {
            $parsed['status'] = 'preview';
        }

        $parsed['provider'] = $provider->get_name();

        return new \WP_REST_Response( $parsed, 200 );
    }

    /**
     * Handle /rewrite-post endpoint.
     */
    public function handle_rewrite( \WP_REST_Request $request ) {
        if ( ! wpraiz_is_pro() ) {
            return new \WP_Error( 'pro_required', __( 'Rewrite requires WPRaiz Pro.', 'wpraiz-content-api' ), [ 'status' => 403 ] );
        }

        $provider = self::get_provider();
        if ( ! $provider ) {
            return new \WP_Error( 'no_provider', __( 'No AI provider configured.', 'wpraiz-content-api' ), [ 'status' => 400 ] );
        }

        $params  = $request->get_json_params();
        $post_id = (int) ( $params['post_id'] ?? 0 );
        $action  = sanitize_key( $params['action'] ?? 'improve_seo' );
        $save    = (bool) ( $params['save'] ?? false );

        $post = get_post( $post_id );
        if ( ! $post ) {
            return new \WP_Error( 'not_found', __( 'Post not found.', 'wpraiz-content-api' ), [ 'status' => 404 ] );
        }

        $valid_actions = [ 'improve_seo', 'fix_grammar', 'change_tone', 'expand', 'summarize' ];
        if ( ! in_array( $action, $valid_actions, true ) ) {
            return new \WP_Error( 'invalid_action', sprintf(
                __( 'Invalid action. Use: %s', 'wpraiz-content-api' ),
                implode( ', ', $valid_actions )
            ), [ 'status' => 400 ] );
        }

        $instructions = match( $action ) {
            'improve_seo'  => 'Rewrite this article to improve SEO. Add relevant keywords naturally, improve headings, add internal linking suggestions.',
            'fix_grammar'  => 'Fix all grammar, spelling, and punctuation errors. Keep the same tone and style.',
            'change_tone'  => 'Rewrite in a ' . sanitize_text_field( $params['tone'] ?? 'professional' ) . ' tone while keeping the same information.',
            'expand'       => 'Expand this article with more detail, examples, and depth. At least double the length.',
            'summarize'    => 'Create a concise summary of this article, keeping key points. Target 30% of original length.',
        };

        $content = wp_strip_all_tags( $post->post_content );
        $content = mb_substr( $content, 0, 6000 );

        $prompt = "{$instructions}\n\nOriginal title: {$post->post_title}\n\nOriginal content:\n{$content}\n\n"
                . "Respond with valid JSON only:\n"
                . '{"title": "...", "content": "<h2>...</h2><p>...</p>...", "seo_title": "...", "seo_desc": "..."}';

        $result = $provider->generate( $prompt, [
            'system'      => 'You are an expert content editor. Respond with valid JSON only, no markdown code fences.',
            'temperature' => 0.5,
            'max_tokens'  => 8192,
        ]);

        if ( is_wp_error( $result ) ) {
            return $result;
        }

        $result = preg_replace( '/^```json\s*/', '', trim( $result ) );
        $result = preg_replace( '/\s*```$/', '', $result );
        $parsed = json_decode( $result, true );

        if ( ! $parsed || empty( $parsed['content'] ) ) {
            return new \WP_Error( 'parse_error', __( 'Failed to parse AI response.', 'wpraiz-content-api' ), [ 'status' => 500 ] );
        }

        // Optionally save directly
        if ( $save ) {
            remove_filter( 'content_save_pre', 'wp_filter_post_kses' );
            wp_update_post( [
                'ID'           => $post_id,
                'post_title'   => sanitize_text_field( $parsed['title'] ?? $post->post_title ),
                'post_content' => $parsed['content'],
            ] );
            add_filter( 'content_save_pre', 'wp_filter_post_kses' );

            if ( ! empty( $parsed['seo_title'] ) || ! empty( $parsed['seo_desc'] ) ) {
                \WPRaiz\ContentAPI\SEO_Handler::save_meta( $post_id, $parsed['seo_title'] ?? '', $parsed['seo_desc'] ?? '' );
            }

            \WPRaiz\ContentAPI\Webhooks::fire( 'post_rewritten', [
                'post_id' => $post_id,
                'action'  => $action,
            ]);
        }

        return new \WP_REST_Response( [
            'post_id'  => $post_id,
            'action'   => $action,
            'saved'    => $save,
            'result'   => $parsed,
            'provider' => $provider->get_name(),
        ], 200 );
    }
}
