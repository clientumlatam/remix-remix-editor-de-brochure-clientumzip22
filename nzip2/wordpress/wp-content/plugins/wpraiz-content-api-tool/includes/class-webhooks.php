<?php
namespace WPRaiz\ContentAPI;

if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Webhook system — fire events to external URLs on content actions.
 */
class Webhooks {

    public function __construct() {
        // Process queued webhooks via WP Cron
        add_action( 'wpraiz_fire_webhook', [ __CLASS__, 'process_webhook' ], 10, 3 );
    }

    /**
     * Fire a webhook event.
     *
     * @param string $event Event name (post_created, bulk_completed, post_rewritten).
     * @param array  $data  Payload data.
     */
    public static function fire( string $event, array $data ): void {
        $settings = wpraiz_get_settings();
        $url      = $settings['webhook_url'] ?? '';
        $events   = $settings['webhook_events'] ?? [];

        if ( empty( $url ) || ! filter_var( $url, FILTER_VALIDATE_URL ) ) {
            return;
        }

        if ( ! in_array( $event, $events, true ) && ! in_array( '*', $events, true ) ) {
            return;
        }

        $payload = [
            'event'     => $event,
            'timestamp' => gmdate( 'c' ),
            'site_url'  => get_site_url(),
            'data'      => $data,
        ];

        // Schedule async delivery
        wp_schedule_single_event( time(), 'wpraiz_fire_webhook', [ $url, $payload, 0 ] );
        spawn_cron();
    }

    /**
     * Process a webhook delivery (called via WP Cron).
     *
     * @param string $url     Webhook URL.
     * @param array  $payload Payload.
     * @param int    $attempt Retry attempt (0-2).
     */
    public static function process_webhook( string $url, array $payload, int $attempt = 0 ): void {
        $response = wp_remote_post( $url, [
            'timeout'     => 15,
            'headers'     => [
                'Content-Type'       => 'application/json',
                'X-WPRaiz-Event'     => $payload['event'] ?? '',
                'X-WPRaiz-Signature' => self::sign_payload( $payload ),
            ],
            'body'        => wp_json_encode( $payload ),
            'sslverify'   => true,
        ]);

        $success = ! is_wp_error( $response ) && wp_remote_retrieve_response_code( $response ) < 400;

        // Log delivery
        self::log_delivery( $url, $payload['event'] ?? '', $success, $attempt );

        // Retry with exponential backoff (max 3 attempts)
        if ( ! $success && $attempt < 2 ) {
            $delay = pow( 2, $attempt + 1 ) * 60; // 2min, 4min
            wp_schedule_single_event( time() + $delay, 'wpraiz_fire_webhook', [ $url, $payload, $attempt + 1 ] );
        }
    }

    /**
     * Sign payload with HMAC for verification.
     */
    private static function sign_payload( array $payload ): string {
        return hash_hmac( 'sha256', wp_json_encode( $payload ), wp_salt( 'auth' ) );
    }

    /**
     * Log webhook delivery (keep last 50).
     */
    private static function log_delivery( string $url, string $event, bool $success, int $attempt ): void {
        $logs = get_option( 'wpraiz_webhook_logs', [] );

        array_unshift( $logs, [
            'url'       => $url,
            'event'     => $event,
            'success'   => $success,
            'attempt'   => $attempt,
            'timestamp' => gmdate( 'c' ),
        ]);

        $logs = array_slice( $logs, 0, 50 );
        update_option( 'wpraiz_webhook_logs', $logs, false );
    }

    /**
     * Get delivery logs.
     */
    public static function get_logs(): array {
        return get_option( 'wpraiz_webhook_logs', [] );
    }
}
