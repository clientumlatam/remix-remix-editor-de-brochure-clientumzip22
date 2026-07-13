<?php
namespace WPRaiz\ContentAPI;

if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Authentication handler: JWT + Basic Auth + Rate Limiting.
 */
class Auth {

    const JWT_ALGO = 'HS256';
    const TOKEN_EXPIRY = 86400; // 24h

    public function __construct() {
        add_action( 'rest_api_init', [ $this, 'register_routes' ] );
    }

    public function register_routes() {
        register_rest_route( 'wpraiz/v2', '/auth/token', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'generate_token' ],
            'permission_callback' => '__return_true',
        ]);
    }

    /**
     * Generate JWT token from username + application password.
     */
    public function generate_token( \WP_REST_Request $request ) {
        $username = sanitize_text_field( $request->get_param( 'username' ) );
        $password = $request->get_param( 'password' );

        if ( empty( $username ) || empty( $password ) ) {
            return new \WP_Error( 'missing_credentials', __( 'Username and password are required.', 'wpraiz-content-api' ), [ 'status' => 400 ] );
        }

        $user = wp_authenticate( $username, $password );

        if ( is_wp_error( $user ) ) {
            return new \WP_Error( 'invalid_credentials', __( 'Invalid username or password.', 'wpraiz-content-api' ), [ 'status' => 401 ] );
        }

        $issued_at  = time();
        $expiration = $issued_at + self::TOKEN_EXPIRY;

        $payload = [
            'iss'  => get_bloginfo( 'url' ),
            'iat'  => $issued_at,
            'exp'  => $expiration,
            'user' => [
                'id'    => $user->ID,
                'login' => $user->user_login,
            ],
        ];

        $token = self::encode_jwt( $payload );

        return new \WP_REST_Response( [
            'token'      => $token,
            'expires_at' => $expiration,
            'user_id'    => $user->ID,
        ], 200 );
    }

    /**
     * Authenticate user from request — supports JWT Bearer and Basic Auth.
     */
    public static function authenticate( \WP_REST_Request $request ) {
        // Rate limiting check
        if ( ! self::check_rate_limit( $request ) ) {
            return new \WP_Error( 'rate_limit_exceeded', __( 'Too many requests. Please slow down.', 'wpraiz-content-api' ), [ 'status' => 429 ] );
        }

        // Try JWT first
        $auth_header = $request->get_header( 'Authorization' );

        if ( $auth_header && preg_match( '/^Bearer\s+(.+)$/i', $auth_header, $matches ) ) {
            $token   = $matches[1];
            $payload = self::decode_jwt( $token );

            if ( is_wp_error( $payload ) ) {
                return $payload;
            }

            $user = get_user_by( 'id', $payload['user']['id'] );
            if ( ! $user || ! user_can( $user, 'edit_posts' ) ) {
                return new \WP_Error( 'forbidden', __( 'Insufficient permissions.', 'wpraiz-content-api' ), [ 'status' => 403 ] );
            }

            wp_set_current_user( $user->ID );
            return true;
        }

        // Fallback to WordPress default auth (Basic Auth / Application Passwords)
        if ( current_user_can( 'edit_posts' ) ) {
            return true;
        }

        return new \WP_Error( 'unauthorized', __( 'Authentication required. Use JWT Bearer token or Basic Auth.', 'wpraiz-content-api' ), [ 'status' => 401 ] );
    }

    /**
     * Rate limiting via transients.
     */
    private static function check_rate_limit( \WP_REST_Request $request ) {
        $settings = wpraiz_get_settings();
        $limit    = (int) ( $settings['rate_limit'] ?? 60 );

        if ( $limit <= 0 ) {
            return true;
        }

        $ip  = self::get_client_ip( $request );
        $key = 'wpraiz_rl_' . md5( $ip );

        $data = get_transient( $key );

        if ( false === $data ) {
            set_transient( $key, [ 'count' => 1, 'start' => time() ], 60 );
            return true;
        }

        if ( $data['count'] >= $limit ) {
            return false;
        }

        $data['count']++;
        set_transient( $key, $data, max( 1, 60 - ( time() - $data['start'] ) ) );
        return true;
    }

    /**
     * Get client IP.
     */
    private static function get_client_ip( \WP_REST_Request $request ) {
        $ip = $request->get_header( 'X-Forwarded-For' );
        if ( $ip ) {
            $ip = explode( ',', $ip )[0];
        } else {
            $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        }
        return sanitize_text_field( trim( $ip ) );
    }

    // ─── JWT Encode/Decode (no external deps) ─────────────────────

    private static function get_secret() {
        return wp_salt( 'auth' );
    }

    public static function encode_jwt( array $payload ): string {
        $header = self::base64url_encode( wp_json_encode( [ 'alg' => self::JWT_ALGO, 'typ' => 'JWT' ] ) );
        $body   = self::base64url_encode( wp_json_encode( $payload ) );
        $sig    = self::base64url_encode( hash_hmac( 'sha256', "$header.$body", self::get_secret(), true ) );

        return "$header.$body.$sig";
    }

    public static function decode_jwt( string $token ) {
        $parts = explode( '.', $token );
        if ( count( $parts ) !== 3 ) {
            return new \WP_Error( 'invalid_token', __( 'Malformed JWT token.', 'wpraiz-content-api' ), [ 'status' => 401 ] );
        }

        [ $header_b64, $body_b64, $sig_b64 ] = $parts;

        $expected_sig = self::base64url_encode( hash_hmac( 'sha256', "$header_b64.$body_b64", self::get_secret(), true ) );

        if ( ! hash_equals( $expected_sig, $sig_b64 ) ) {
            return new \WP_Error( 'invalid_token', __( 'Invalid JWT signature.', 'wpraiz-content-api' ), [ 'status' => 401 ] );
        }

        $payload = json_decode( self::base64url_decode( $body_b64 ), true );

        if ( ! $payload || empty( $payload['exp'] ) ) {
            return new \WP_Error( 'invalid_token', __( 'Invalid JWT payload.', 'wpraiz-content-api' ), [ 'status' => 401 ] );
        }

        if ( $payload['exp'] < time() ) {
            return new \WP_Error( 'token_expired', __( 'JWT token has expired.', 'wpraiz-content-api' ), [ 'status' => 401 ] );
        }

        return $payload;
    }

    private static function base64url_encode( string $data ): string {
        return rtrim( strtr( base64_encode( $data ), '+/', '-_' ), '=' );
    }

    private static function base64url_decode( string $data ): string {
        return base64_decode( strtr( $data, '-_', '+/' ) );
    }
}
