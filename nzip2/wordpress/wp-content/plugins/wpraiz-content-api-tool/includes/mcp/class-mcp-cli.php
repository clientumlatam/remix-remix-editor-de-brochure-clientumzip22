<?php
namespace WPRaiz\ContentAPI\MCP;

if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * WP-CLI command for MCP STDIO transport.
 *
 * Usage: wp wpraiz-mcp serve
 *
 * Reads JSON-RPC from stdin, writes responses to stdout.
 * Perfect for Claude Desktop / Cursor integration via claude_desktop_config.json:
 *
 * {
 *   "mcpServers": {
 *     "wpraiz": {
 *       "command": "wp",
 *       "args": ["wpraiz-mcp", "serve", "--path=/path/to/wordpress"]
 *     }
 *   }
 * }
 */
class MCP_CLI {

    /**
     * Register WP-CLI commands.
     */
    public static function register() {
        if ( ! defined( 'WP_CLI' ) || ! WP_CLI ) {
            return;
        }

        \WP_CLI::add_command( 'wpraiz-mcp', __CLASS__ );
    }

    /**
     * Start MCP STDIO server.
     *
     * ## DESCRIPTION
     *
     * Starts a Model Context Protocol server using STDIO transport.
     * Reads JSON-RPC 2.0 messages from stdin and writes responses to stdout.
     *
     * ## OPTIONS
     *
     * [--user=<id>]
     * : WordPress user ID for authentication (default: 1)
     *
     * ## EXAMPLES
     *
     *     wp wpraiz-mcp serve --user=1
     *
     * @when after_wp_load
     */
    public static function serve( $args, $assoc_args ) {
        $user_id = (int) ( $assoc_args['user'] ?? 1 );
        wp_set_current_user( $user_id );

        // Write MCP server info to stderr (not stdout, to keep protocol clean)
        fwrite( STDERR, "WPRaiz MCP Server v" . WPRAIZ_VERSION . " (STDIO)\n" );
        fwrite( STDERR, "Site: " . get_site_url() . "\n" );
        fwrite( STDERR, "User: " . wp_get_current_user()->user_login . "\n" );
        fwrite( STDERR, "Waiting for JSON-RPC messages on stdin...\n" );

        $server = new MCP_Server();

        // Read loop
        while ( $line = fgets( STDIN ) ) {
            $line = trim( $line );
            if ( empty( $line ) ) continue;

            $body = json_decode( $line, true );
            if ( ! $body ) {
                self::write_error( null, -32700, 'Parse error: invalid JSON.' );
                continue;
            }

            // Create a fake REST request
            $request = new \WP_REST_Request( 'POST' );
            $request->set_body( $line );
            $request->set_header( 'Content-Type', 'application/json' );

            // Process via MCP server
            $response = $server->handle_request( $request );
            $data     = $response->get_data();

            // Write response to stdout
            fwrite( STDOUT, wp_json_encode( $data ) . "\n" );
            fflush( STDOUT );
        }
    }

    /**
     * Show MCP server config for Claude Desktop.
     *
     * ## DESCRIPTION
     *
     * Outputs the JSON config snippet to add to claude_desktop_config.json.
     *
     * ## EXAMPLES
     *
     *     wp wpraiz-mcp config
     *
     * @when after_wp_load
     */
    public static function config( $args, $assoc_args ) {
        $wp_path = ABSPATH;

        $config = [
            'mcpServers' => [
                'wpraiz' => [
                    'command' => 'wp',
                    'args'    => [ 'wpraiz-mcp', 'serve', "--path={$wp_path}", '--user=1' ],
                ],
            ],
        ];

        \WP_CLI::log( "Add this to your claude_desktop_config.json:\n" );
        \WP_CLI::log( wp_json_encode( $config, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES ) );
        \WP_CLI::log( "\nOr for HTTP transport, use this endpoint:" );
        \WP_CLI::log( rest_url( 'wpraiz-mcp/v1/mcp' ) );
    }
}

// Auto-register if WP-CLI is available
add_action( 'cli_init', [ MCP_CLI::class, 'register' ] );
