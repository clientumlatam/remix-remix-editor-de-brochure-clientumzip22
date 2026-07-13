<?php
namespace WPRaiz\ContentAPI\MCP;

if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * MCP Server — Model Context Protocol implementation via HTTP (REST) transport.
 *
 * Implements JSON-RPC 2.0 over REST for AI agent communication.
 * Supports: initialize, tools/list, tools/call, resources/list, resources/read, prompts/list, prompts/get
 */
class MCP_Server {

    const PROTOCOL_VERSION = '2024-11-05';
    const SERVER_NAME      = 'wpraiz-content-api';

    public function __construct() {
        add_action( 'rest_api_init', [ $this, 'register_routes' ] );
    }

    public function register_routes() {
        // Main MCP endpoint (JSON-RPC)
        register_rest_route( 'wpraiz-mcp/v1', '/mcp', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'handle_request' ],
            'permission_callback' => [ \WPRaiz\ContentAPI\Auth::class, 'authenticate' ],
        ]);

        // SSE endpoint for streaming (future)
        register_rest_route( 'wpraiz-mcp/v1', '/sse', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'handle_sse' ],
            'permission_callback' => [ \WPRaiz\ContentAPI\Auth::class, 'authenticate' ],
        ]);
    }

    /**
     * Handle JSON-RPC 2.0 request.
     */
    public function handle_request( \WP_REST_Request $request ) {
        $body = $request->get_json_params();

        $jsonrpc = $body['jsonrpc'] ?? '';
        $method  = $body['method'] ?? '';
        $params  = $body['params'] ?? [];
        $id      = $body['id'] ?? null;

        // Forward auth header so proxy_rest can re-authenticate internal calls.
        MCP_Tools::set_auth_context( $request->get_header( 'Authorization' ) );

        if ( $jsonrpc !== '2.0' || empty( $method ) ) {
            return $this->error_response( $id, -32600, 'Invalid JSON-RPC request.' );
        }

        $result = match ( $method ) {
            'initialize'     => $this->handle_initialize( $params ),
            'tools/list'     => $this->handle_tools_list(),
            'tools/call'     => $this->handle_tools_call( $params ),
            'resources/list' => $this->handle_resources_list(),
            'resources/read' => $this->handle_resources_read( $params ),
            'prompts/list'   => $this->handle_prompts_list(),
            'prompts/get'    => $this->handle_prompts_get( $params ),
            'ping'           => [ 'status' => 'pong' ],
            default          => null,
        };

        if ( $result === null ) {
            return $this->error_response( $id, -32601, "Method not found: {$method}" );
        }

        return new \WP_REST_Response( [
            'jsonrpc' => '2.0',
            'id'      => $id,
            'result'  => $result,
        ], 200 );
    }

    // ─── Initialize ──────────────────────────────────────────

    private function handle_initialize( array $params ): array {
        return [
            'protocolVersion' => self::PROTOCOL_VERSION,
            'capabilities'    => [
                'tools'     => [ 'listChanged' => false ],
                'resources' => [ 'subscribe' => false, 'listChanged' => false ],
                'prompts'   => [ 'listChanged' => false ],
            ],
            'serverInfo'      => [
                'name'    => self::SERVER_NAME,
                'version' => WPRAIZ_VERSION,
            ],
        ];
    }

    // ─── Tools ───────────────────────────────────────────────

    private function handle_tools_list(): array {
        return [ 'tools' => MCP_Tools::get_definitions() ];
    }

    private function handle_tools_call( array $params ) {
        $name      = $params['name'] ?? '';
        $arguments = $params['arguments'] ?? [];

        $result = MCP_Tools::execute( $name, $arguments );

        if ( is_wp_error( $result ) ) {
            return [
                'content' => [ [
                    'type' => 'text',
                    'text' => $result->get_error_message(),
                ] ],
                'isError' => true,
            ];
        }

        $text = is_string( $result ) ? $result : wp_json_encode( $result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE );

        return [
            'content' => [ [
                'type' => 'text',
                'text' => $text,
            ] ],
        ];
    }

    // ─── Resources ───────────────────────────────────────────

    private function handle_resources_list(): array {
        return [ 'resources' => MCP_Resources::get_definitions() ];
    }

    private function handle_resources_read( array $params ): array {
        $uri  = $params['uri'] ?? '';
        $data = MCP_Resources::read( $uri );

        return [
            'contents' => [ [
                'uri'      => $uri,
                'mimeType' => 'application/json',
                'text'     => wp_json_encode( $data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE ),
            ] ],
        ];
    }

    // ─── Prompts ─────────────────────────────────────────────

    private function handle_prompts_list(): array {
        return [ 'prompts' => MCP_Prompts::get_definitions() ];
    }

    private function handle_prompts_get( array $params ): array {
        $name      = $params['name'] ?? '';
        $arguments = $params['arguments'] ?? [];

        return MCP_Prompts::get( $name, $arguments );
    }

    // ─── SSE (placeholder) ───────────────────────────────────

    public function handle_sse( \WP_REST_Request $request ) {
        return new \WP_REST_Response( [
            'message' => 'SSE transport not yet implemented. Use HTTP POST to /mcp.',
        ], 501 );
    }

    // ─── Helpers ─────────────────────────────────────────────

    private function error_response( $id, int $code, string $message ): \WP_REST_Response {
        return new \WP_REST_Response( [
            'jsonrpc' => '2.0',
            'id'      => $id,
            'error'   => [
                'code'    => $code,
                'message' => $message,
            ],
        ], 200 ); // JSON-RPC errors still return HTTP 200
    }
}
