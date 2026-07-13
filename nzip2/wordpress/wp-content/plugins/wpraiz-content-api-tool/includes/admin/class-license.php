<?php
namespace WPRaiz\ContentAPI\Admin;

if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * License management via WPRaiz self-hosted license server.
 *
 * The license server runs on wpraiz.com.br (class-license-server.php).
 * Flow:
 *   1. Buyer purchases on Hotmart
 *   2. Hotmart webhook → license server generates key → emails buyer
 *   3. Buyer enters key here → plugin calls wpraiz.com.br to activate
 *   4. Background re-validation daily
 *
 * Endpoints (on WPRAIZ_LICENSE_SERVER_URL):
 *   POST /wpraiz/v2/license/activate
 *   POST /wpraiz/v2/license/validate
 *   POST /wpraiz/v2/license/deactivate
 */
class License {

    /** License server base URL. Filterable via 'wpraiz_license_server_url'. */
    const DEFAULT_SERVER = 'https://wpraiz.com.br';

    /** How often to re-validate remotely (seconds). Default: 24h. */
    const RECHECK_INTERVAL = DAY_IN_SECONDS;

    public function __construct() {
        add_action( 'wp_ajax_wpraiz_activate_license',   [ $this, 'ajax_activate' ] );
        add_action( 'wp_ajax_wpraiz_deactivate_license', [ $this, 'ajax_deactivate' ] );

        // Daily background re-validation
        add_action( 'wpraiz_revalidate_license', [ $this, 'revalidate' ] );
        if ( ! wp_next_scheduled( 'wpraiz_revalidate_license' ) ) {
            wp_schedule_event( time(), 'daily', 'wpraiz_revalidate_license' );
        }
    }

    /**
     * Get license server URL (filterable).
     */
    private static function server_url(): string {
        return apply_filters( 'wpraiz_license_server_url', self::DEFAULT_SERVER );
    }

    /* ── AJAX: Activate ─────────────────────────────────────── */

    public function ajax_activate() {
        check_ajax_referer( 'wpraiz_admin_nonce', 'nonce' );
        if ( ! current_user_can( 'manage_options' ) ) {
            wp_send_json_error( [ 'message' => 'Unauthorized.' ] );
        }

        $key = sanitize_text_field( wp_unslash( $_POST['license_key'] ?? '' ) );
        if ( empty( $key ) ) {
            wp_send_json_error( [ 'message' => 'License key is required.' ] );
        }

        $result = $this->remote_activate( $key );

        if ( is_wp_error( $result ) ) {
            wp_send_json_error( [ 'message' => $result->get_error_message() ] );
        }

        wp_send_json_success( [
            'message'    => 'License activated! Pro features unlocked.',
            'expires_at' => $result['expires_at'] ?? null,
        ] );
    }

    /* ── AJAX: Deactivate ───────────────────────────────────── */

    public function ajax_deactivate() {
        check_ajax_referer( 'wpraiz_admin_nonce', 'nonce' );
        if ( ! current_user_can( 'manage_options' ) ) {
            wp_send_json_error( [ 'message' => 'Unauthorized.' ] );
        }

        $key = get_option( 'wpraiz_license_key', '' );

        if ( $key ) {
            wp_remote_post( self::server_url() . '/wp-json/wpraiz/v2/license/deactivate', [
                'timeout' => 15,
                'headers' => [ 'Content-Type' => 'application/json' ],
                'body'    => wp_json_encode( [
                    'license_key' => $key,
                    'site_url'    => get_site_url(),
                ] ),
            ] );
        }

        delete_option( 'wpraiz_license_key' );
        delete_option( 'wpraiz_license_status' );
        delete_option( 'wpraiz_license_activated_at' );
        delete_option( 'wpraiz_license_expires_at' );
        delete_option( 'wpraiz_license_last_check' );

        // Cleanup legacy LemonSqueezy option
        delete_option( 'wpraiz_license_instance_id' );

        wp_send_json_success( [ 'message' => 'License deactivated.' ] );
    }

    /* ── Background re-validation ───────────────────────────── */

    public function revalidate() {
        $key = get_option( 'wpraiz_license_key', '' );
        if ( ! $key ) return;

        $response = wp_remote_post( self::server_url() . '/wp-json/wpraiz/v2/license/validate', [
            'timeout' => 15,
            'headers' => [ 'Content-Type' => 'application/json' ],
            'body'    => wp_json_encode( [
                'license_key' => $key,
                'site_url'    => get_site_url(),
            ] ),
        ] );

        if ( is_wp_error( $response ) ) return;

        $body = json_decode( wp_remote_retrieve_body( $response ), true );

        $valid = isset( $body['valid'] ) && $body['valid'] === true;

        update_option( 'wpraiz_license_status', $valid ? 'active' : 'invalid' );
        update_option( 'wpraiz_license_last_check', time() );

        if ( ! empty( $body['expires_at'] ) ) {
            update_option( 'wpraiz_license_expires_at', $body['expires_at'] );
        }
    }

    /* ── Static helper: is Pro? ─────────────────────────────── */

    public static function is_pro(): bool {
        return get_option( 'wpraiz_license_status' ) === 'active';
    }

    /* ── Internal: remote activate ──────────────────────────── */

    private function remote_activate( string $key ) {
        $response = wp_remote_post( self::server_url() . '/wp-json/wpraiz/v2/license/activate', [
            'timeout' => 15,
            'headers' => [ 'Content-Type' => 'application/json' ],
            'body'    => wp_json_encode( [
                'license_key' => $key,
                'site_url'    => get_site_url(),
            ] ),
        ] );

        if ( is_wp_error( $response ) ) {
            return new \WP_Error( 'ls_network', 'Could not reach license server. Try again.' );
        }

        $code = wp_remote_retrieve_response_code( $response );
        $body = json_decode( wp_remote_retrieve_body( $response ), true );

        if ( $code === 200 && ! empty( $body['activated'] ) ) {
            update_option( 'wpraiz_license_key',          $key );
            update_option( 'wpraiz_license_status',       'active' );
            update_option( 'wpraiz_license_activated_at', time() );
            update_option( 'wpraiz_license_expires_at',   $body['expires_at'] ?? '' );
            update_option( 'wpraiz_license_last_check',   time() );

            // Cleanup legacy LemonSqueezy option
            delete_option( 'wpraiz_license_instance_id' );

            return $body;
        }

        $msg = $body['error'] ?? $body['message'] ?? 'Invalid or expired license key.';
        return new \WP_Error( 'ls_invalid', $msg );
    }
}
