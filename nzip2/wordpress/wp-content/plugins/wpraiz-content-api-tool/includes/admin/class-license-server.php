<?php
namespace WPRaiz\ContentAPI\Admin;

if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Self-hosted License Server.
 *
 * Runs on wpraiz.com.br (or any site the seller controls).
 * Handles:
 *   - Hotmart webhook → auto-generates license keys on purchase
 *   - REST endpoints for license activate/validate/deactivate
 *   - License key storage in wp_options (wpraiz_licenses)
 *
 * Flow:
 *   1. Buyer purchases on Hotmart
 *   2. Hotmart webhook → POST /wpraiz/v2/webhook/hotmart
 *   3. This class generates a UUID key, stores it, emails buyer
 *   4. Buyer enters key in their WP site
 *   5. Their plugin calls POST /wpraiz/v2/license/activate on this server
 *   6. Server validates and returns success
 *
 * Enable server mode by adding to wp-config.php:
 *   define( 'WPRAIZ_LICENSE_SERVER', true );
 */
class License_Server {

    public function __construct() {
        // Only run if this site is the license server
        if ( ! defined( 'WPRAIZ_LICENSE_SERVER' ) || ! WPRAIZ_LICENSE_SERVER ) {
            return;
        }

        add_action( 'rest_api_init', [ $this, 'register_routes' ] );
    }

    public function register_routes() {
        // Hotmart webhook receiver
        register_rest_route( 'wpraiz/v2', '/webhook/hotmart', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'handle_hotmart_webhook' ],
            'permission_callback' => '__return_true',
        ] );

        // License activation (called by client plugins)
        register_rest_route( 'wpraiz/v2', '/license/activate', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'handle_activate' ],
            'permission_callback' => '__return_true',
        ] );

        // License validation
        register_rest_route( 'wpraiz/v2', '/license/validate', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'handle_validate' ],
            'permission_callback' => '__return_true',
        ] );

        // License deactivation
        register_rest_route( 'wpraiz/v2', '/license/deactivate', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'handle_deactivate' ],
            'permission_callback' => '__return_true',
        ] );

        // Admin: list all licenses (protected)
        register_rest_route( 'wpraiz/v2', '/license/list', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'handle_list' ],
            'permission_callback' => function() { return current_user_can( 'manage_options' ); },
        ] );
    }

    /* ── Hotmart Webhook ────────────────────────────────────── */

    public function handle_hotmart_webhook( \WP_REST_Request $request ) {
        $body = $request->get_json_params();

        // Fallback to form data (Hotmart can send both)
        if ( empty( $body ) ) {
            $body = $request->get_body_params();
        }

        // Validate hottok (Hotmart webhook token)
        $settings = wpraiz_get_settings();
        $hottok   = $settings['hotmart_hottok'] ?? '';

        if ( $hottok && isset( $body['hottok'] ) && $body['hottok'] !== $hottok ) {
            return new \WP_REST_Response( [ 'error' => 'Invalid hottok' ], 403 );
        }

        // Check event type — only process approved purchases
        $status = $body['status'] ?? $body['purchase']['status'] ?? '';
        if ( ! in_array( strtolower( $status ), [ 'approved', 'complete', 'completed' ], true ) ) {
            return new \WP_REST_Response( [ 'status' => 'ignored', 'reason' => $status ], 200 );
        }

        // Extract buyer info
        $email = $body['email'] ?? $body['buyer']['email'] ?? $body['buyer_email'] ?? '';
        $name  = $body['name'] ?? $body['buyer']['name'] ?? $body['buyer_name'] ?? '';
        $transaction = $body['transaction'] ?? $body['purchase']['transaction'] ?? '';
        $product     = $body['prod_name'] ?? $body['product']['name'] ?? 'WPRaiz Pro';

        if ( empty( $email ) ) {
            return new \WP_REST_Response( [ 'error' => 'No buyer email' ], 400 );
        }

        // Generate license key
        $key = $this->generate_key();

        // Store license
        $licenses = get_option( 'wpraiz_licenses', [] );
        $licenses[ $key ] = [
            'email'       => sanitize_email( $email ),
            'name'        => sanitize_text_field( $name ),
            'transaction' => sanitize_text_field( $transaction ),
            'product'     => sanitize_text_field( $product ),
            'created_at'  => current_time( 'mysql' ),
            'expires_at'  => date( 'Y-m-d H:i:s', strtotime( '+1 year' ) ),
            'max_sites'   => 3,
            'sites'       => [],
            'status'      => 'active',
        ];
        update_option( 'wpraiz_licenses', $licenses );

        // Email the license key to buyer
        $this->send_license_email( $email, $name, $key, $product );

        return new \WP_REST_Response( [
            'status'      => 'ok',
            'license_key' => $key,
            'email'       => $email,
        ], 201 );
    }

    /* ── License Activate ───────────────────────────────────── */

    public function handle_activate( \WP_REST_Request $request ) {
        $params = $request->get_json_params();
        $key    = sanitize_text_field( $params['license_key'] ?? '' );
        $site   = sanitize_text_field( $params['site_url'] ?? '' );

        if ( empty( $key ) || empty( $site ) ) {
            return new \WP_REST_Response( [ 'activated' => false, 'error' => 'license_key and site_url required' ], 400 );
        }

        $licenses = get_option( 'wpraiz_licenses', [] );

        if ( ! isset( $licenses[ $key ] ) ) {
            return new \WP_REST_Response( [ 'activated' => false, 'error' => 'Invalid license key' ], 404 );
        }

        $lic = &$licenses[ $key ];

        // Check status
        if ( $lic['status'] !== 'active' ) {
            return new \WP_REST_Response( [ 'activated' => false, 'error' => 'License is ' . $lic['status'] ], 403 );
        }

        // Check expiration
        if ( ! empty( $lic['expires_at'] ) && strtotime( $lic['expires_at'] ) < time() ) {
            $lic['status'] = 'expired';
            update_option( 'wpraiz_licenses', $licenses );
            return new \WP_REST_Response( [ 'activated' => false, 'error' => 'License expired' ], 403 );
        }

        // Check if already activated on this site
        $site_host = parse_url( $site, PHP_URL_HOST ) ?: $site;
        if ( in_array( $site_host, $lic['sites'], true ) ) {
            return new \WP_REST_Response( [ 'activated' => true, 'message' => 'Already activated on this site' ], 200 );
        }

        // Check max sites
        if ( count( $lic['sites'] ) >= $lic['max_sites'] ) {
            return new \WP_REST_Response( [ 'activated' => false, 'error' => 'Activation limit reached (' . $lic['max_sites'] . ' sites)' ], 403 );
        }

        // Activate
        $lic['sites'][] = $site_host;
        update_option( 'wpraiz_licenses', $licenses );

        return new \WP_REST_Response( [
            'activated'  => true,
            'expires_at' => $lic['expires_at'],
            'sites_used' => count( $lic['sites'] ),
            'sites_max'  => $lic['max_sites'],
        ], 200 );
    }

    /* ── License Validate ───────────────────────────────────── */

    public function handle_validate( \WP_REST_Request $request ) {
        $params = $request->get_json_params();
        $key    = sanitize_text_field( $params['license_key'] ?? '' );
        $site   = sanitize_text_field( $params['site_url'] ?? '' );

        $licenses = get_option( 'wpraiz_licenses', [] );

        if ( ! isset( $licenses[ $key ] ) ) {
            return new \WP_REST_Response( [ 'valid' => false ], 200 );
        }

        $lic = $licenses[ $key ];

        // Check expiration
        $expired = ! empty( $lic['expires_at'] ) && strtotime( $lic['expires_at'] ) < time();
        $site_host = $site ? ( parse_url( $site, PHP_URL_HOST ) ?: $site ) : '';
        $site_ok   = empty( $site_host ) || in_array( $site_host, $lic['sites'], true );

        return new \WP_REST_Response( [
            'valid'      => $lic['status'] === 'active' && ! $expired && $site_ok,
            'status'     => $expired ? 'expired' : $lic['status'],
            'expires_at' => $lic['expires_at'],
        ], 200 );
    }

    /* ── License Deactivate ─────────────────────────────────── */

    public function handle_deactivate( \WP_REST_Request $request ) {
        $params = $request->get_json_params();
        $key    = sanitize_text_field( $params['license_key'] ?? '' );
        $site   = sanitize_text_field( $params['site_url'] ?? '' );

        $licenses = get_option( 'wpraiz_licenses', [] );

        if ( ! isset( $licenses[ $key ] ) ) {
            return new \WP_REST_Response( [ 'deactivated' => false ], 404 );
        }

        $site_host = parse_url( $site, PHP_URL_HOST ) ?: $site;
        $licenses[ $key ]['sites'] = array_values( array_filter(
            $licenses[ $key ]['sites'],
            fn( $s ) => $s !== $site_host
        ) );

        update_option( 'wpraiz_licenses', $licenses );

        return new \WP_REST_Response( [ 'deactivated' => true ], 200 );
    }

    /* ── List All (admin) ───────────────────────────────────── */

    public function handle_list( \WP_REST_Request $request ) {
        return new \WP_REST_Response( get_option( 'wpraiz_licenses', [] ), 200 );
    }

    /* ── Helpers ────────────────────────────────────────────── */

    private function generate_key(): string {
        $segments = [];
        for ( $i = 0; $i < 4; $i++ ) {
            $segments[] = strtoupper( wp_generate_password( 4, false ) );
        }
        return 'WPRAIZ-' . implode( '-', $segments );
    }

    private function send_license_email( string $email, string $name, string $key, string $product ) {
        $subject = "Your {$product} License Key";
        $message = "Hi {$name},\n\n"
            . "Thanks for purchasing {$product}!\n\n"
            . "Your license key: {$key}\n\n"
            . "How to activate:\n"
            . "1. Go to your WordPress admin → Tools → WPRaiz Content API\n"
            . "2. Click the License tab\n"
            . "3. Paste your key and click Activate\n\n"
            . "Your license is valid for 1 year and can be activated on up to 3 sites.\n\n"
            . "— WPRaiz Team\n"
            . "https://wpraiz.com.br";

        wp_mail( $email, $subject, $message );
    }
}
