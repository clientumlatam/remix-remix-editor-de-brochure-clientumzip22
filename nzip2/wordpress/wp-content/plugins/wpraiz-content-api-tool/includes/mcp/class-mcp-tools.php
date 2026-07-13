<?php
namespace WPRaiz\ContentAPI\MCP;

if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * MCP Tools — expose WPRaiz endpoints as MCP tools for AI agents.
 */
class MCP_Tools {

    /**
     * Get all tool definitions (JSON Schema).
     */
    public static function get_definitions(): array {
        return [
            [
                'name'        => 'create_post',
                'description' => 'Create a new WordPress post with title, content, SEO metadata, featured image, categories and tags.',
                'inputSchema' => [
                    'type'       => 'object',
                    'properties' => [
                        'title'            => [ 'type' => 'string', 'description' => 'Post title (required)' ],
                        'content'          => [ 'type' => 'string', 'description' => 'Post content in HTML (required)' ],
                        'status'           => [ 'type' => 'string', 'enum' => [ 'draft', 'publish', 'pending', 'private' ], 'default' => 'draft' ],
                        'post_type'        => [ 'type' => 'string', 'default' => 'post', 'description' => 'Post type (post, page, or any registered CPT)' ],
                        'primary_category' => [ 'type' => 'string', 'description' => 'Category name (created if not exists)' ],
                        'tags'             => [ 'type' => 'array', 'items' => [ 'type' => 'string' ], 'description' => 'List of tags' ],
                        'excerpt'          => [ 'type' => 'string', 'description' => 'Post excerpt/summary' ],
                        'seo_title'        => [ 'type' => 'string', 'description' => 'SEO title (max 60 chars). Auto-generated via AI if empty.' ],
                        'seo_desc'         => [ 'type' => 'string', 'description' => 'SEO meta description (max 155 chars). Auto-generated via AI if empty.' ],
                        'image_url'        => [ 'type' => 'string', 'description' => 'URL of featured image to download and attach' ],
                        'custom_meta'      => [ 'type' => 'object', 'description' => 'Key-value pairs for custom post meta fields' ],
                    ],
                    'required'   => [ 'title', 'content' ],
                ],
            ],
            [
                'name'        => 'update_post',
                'description' => 'Update an existing WordPress post. Only include fields you want to change.',
                'inputSchema' => [
                    'type'       => 'object',
                    'properties' => [
                        'post_id'   => [ 'type' => 'integer', 'description' => 'ID of the post to update (required)' ],
                        'title'     => [ 'type' => 'string' ],
                        'content'   => [ 'type' => 'string' ],
                        'status'    => [ 'type' => 'string', 'enum' => [ 'draft', 'publish', 'pending', 'private' ] ],
                        'excerpt'   => [ 'type' => 'string' ],
                        'seo_title' => [ 'type' => 'string' ],
                        'seo_desc'  => [ 'type' => 'string' ],
                        'image_url' => [ 'type' => 'string' ],
                    ],
                    'required'   => [ 'post_id' ],
                ],
            ],
            [
                'name'        => 'search_similar',
                'description' => 'Find published posts with titles similar to the given title. Useful for internal linking and avoiding duplicate content.',
                'inputSchema' => [
                    'type'       => 'object',
                    'properties' => [
                        'title'     => [ 'type' => 'string', 'description' => 'Title to search against (required)' ],
                        'limit'     => [ 'type' => 'integer', 'default' => 10, 'description' => 'Max results (1-50)' ],
                        'post_type' => [ 'type' => 'string', 'default' => 'post' ],
                    ],
                    'required'   => [ 'title' ],
                ],
            ],
            [
                'name'        => 'get_categories',
                'description' => 'List all post categories with their IDs, slugs, and post counts.',
                'inputSchema' => [
                    'type'       => 'object',
                    'properties' => new \stdClass(),
                ],
            ],
            [
                'name'        => 'generate_content',
                'description' => 'Generate a complete blog post using AI from a topic/briefing. Returns title, HTML content, excerpt, SEO meta, and tags. Pro feature.',
                'inputSchema' => [
                    'type'       => 'object',
                    'properties' => [
                        'topic'            => [ 'type' => 'string', 'description' => 'Topic or briefing for the article (required)' ],
                        'tone'             => [ 'type' => 'string', 'default' => 'professional', 'description' => 'Writing tone (professional, casual, technical, friendly)' ],
                        'length'           => [ 'type' => 'string', 'enum' => [ 'short', 'medium', 'long' ], 'default' => 'medium' ],
                        'language'         => [ 'type' => 'string', 'default' => 'pt-BR', 'description' => 'Content language (ISO code)' ],
                        'keywords'         => [ 'type' => 'array', 'items' => [ 'type' => 'string' ], 'description' => 'SEO keywords to include' ],
                        'auto_publish'     => [ 'type' => 'boolean', 'default' => false, 'description' => 'Publish immediately after generation' ],
                        'primary_category' => [ 'type' => 'string', 'description' => 'Category for auto-published posts' ],
                    ],
                    'required'   => [ 'topic' ],
                ],
            ],
            [
                'name'        => 'rewrite_post',
                'description' => 'Rewrite an existing post using AI. Actions: improve_seo, fix_grammar, change_tone, expand, summarize. Pro feature.',
                'inputSchema' => [
                    'type'       => 'object',
                    'properties' => [
                        'post_id' => [ 'type' => 'integer', 'description' => 'ID of the post to rewrite (required)' ],
                        'action'  => [ 'type' => 'string', 'enum' => [ 'improve_seo', 'fix_grammar', 'change_tone', 'expand', 'summarize' ], 'description' => 'Rewrite action (required)' ],
                        'tone'    => [ 'type' => 'string', 'description' => 'Target tone (only for change_tone action)' ],
                        'save'    => [ 'type' => 'boolean', 'default' => false, 'description' => 'Save rewritten content directly to the post' ],
                    ],
                    'required'   => [ 'post_id', 'action' ],
                ],
            ],
            [
                'name'        => 'bulk_create',
                'description' => 'Create multiple posts in a single request (max 50). Each item follows the same schema as create_post. Pro feature.',
                'inputSchema' => [
                    'type'       => 'object',
                    'properties' => [
                        'posts' => [
                            'type'  => 'array',
                            'items' => [
                                'type'       => 'object',
                                'properties' => [
                                    'title'            => [ 'type' => 'string' ],
                                    'content'          => [ 'type' => 'string' ],
                                    'status'           => [ 'type' => 'string', 'default' => 'draft' ],
                                    'primary_category' => [ 'type' => 'string' ],
                                    'seo_title'        => [ 'type' => 'string' ],
                                    'seo_desc'         => [ 'type' => 'string' ],
                                    'image_url'        => [ 'type' => 'string' ],
                                    'tags'             => [ 'type' => 'array', 'items' => [ 'type' => 'string' ] ],
                                ],
                                'required' => [ 'title', 'content' ],
                            ],
                            'maxItems'    => 50,
                            'description' => 'Array of posts to create',
                        ],
                    ],
                    'required' => [ 'posts' ],
                ],
            ],
        ];
    }

    /** Authorization header forwarded from the incoming MCP request. */
    private static ?string $current_auth_header = null;

    /**
     * Store the Authorization header for use in internal REST proxying.
     * Call this once from MCP_Server before dispatching tool calls.
     */
    public static function set_auth_context( ?string $auth_header ): void {
        self::$current_auth_header = $auth_header;
    }

    /**
     * Execute a tool by name.
     *
     * @param string $name      Tool name.
     * @param array  $arguments Tool arguments.
     * @return mixed Result data or WP_Error.
     */
    public static function execute( string $name, array $arguments ) {
        // Build a fake REST request to reuse existing endpoint logic
        switch ( $name ) {
            case 'create_post':
                return self::proxy_rest( 'POST', 'wpraiz/v2/create-post', $arguments );

            case 'update_post':
                return self::proxy_rest( 'POST', 'wpraiz/v2/update-post', $arguments );

            case 'search_similar':
                $request = new \WP_REST_Request( 'GET' );
                foreach ( $arguments as $key => $val ) {
                    $request->set_param( $key, $val );
                }
                $engine = new \WPRaiz\ContentAPI\Search_Engine();
                $response = $engine->search_similar( $request );
                return $response instanceof \WP_REST_Response ? $response->get_data() : $response;

            case 'get_categories':
                $engine = new \WPRaiz\ContentAPI\Search_Engine();
                $response = $engine->get_categories();
                return $response instanceof \WP_REST_Response ? $response->get_data() : $response;

            case 'generate_content':
                return self::proxy_rest( 'POST', 'wpraiz/v2/generate-content', $arguments );

            case 'rewrite_post':
                return self::proxy_rest( 'POST', 'wpraiz/v2/rewrite-post', $arguments );

            case 'bulk_create':
                return self::proxy_rest( 'POST', 'wpraiz/v2/create-posts', $arguments );

            default:
                return new \WP_Error( 'unknown_tool', "Unknown tool: {$name}" );
        }
    }

    /**
     * Proxy a request to an internal REST endpoint.
     */
    private static function proxy_rest( string $method, string $route, array $body ) {
        $request = new \WP_REST_Request( $method );
        $request->set_body( wp_json_encode( $body ) );
        $request->set_header( 'Content-Type', 'application/json' );

        // Propagate the caller's Authorization so permission callbacks pass.
        if ( self::$current_auth_header ) {
            $request->set_header( 'Authorization', self::$current_auth_header );
        }

        $response = rest_do_request( $request->set_route( '/' . $route ) );

        if ( $response->is_error() ) {
            $error = $response->as_error();
            return $error;
        }

        return $response->get_data();
    }
}
