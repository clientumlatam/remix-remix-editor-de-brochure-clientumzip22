<?php
namespace WPRaiz\ContentAPI\AI;

if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * OpenRouter AI Provider.
 *
 * Gateway to 400+ models including FREE ones.
 * Default model: openrouter/free (auto-selects a free model).
 * Free users get $0 cost — no API key needed for free tier!
 *
 * @link https://openrouter.ai/docs/quickstart
 */
class OpenRouter_Provider implements AI_Provider {

    private string $api_key;
    private string $model;

    public function __construct() {
        $settings      = wpraiz_get_settings();
        $this->api_key = $settings['openrouter_api_key'] ?? '';
        $this->model   = $settings['openrouter_model'] ?? 'openrouter/free';
    }

    public function get_name(): string {
        return 'OpenRouter';
    }

    public function is_configured(): bool {
        // OpenRouter free models work even without API key,
        // but rate limits are stricter. With key is better.
        return true;
    }

    public function generate( string $prompt, array $params = [] ) {
        $headers = [
            'Content-Type'    => 'application/json',
            'HTTP-Referer'    => get_site_url(),
            'X-Title'         => get_bloginfo( 'name' ),
        ];

        if ( ! empty( $this->api_key ) ) {
            $headers['Authorization'] = 'Bearer ' . $this->api_key;
        }

        $response = wp_remote_post( 'https://openrouter.ai/api/v1/chat/completions', [
            'timeout' => 120,
            'headers' => $headers,
            'body'    => wp_json_encode( [
                'model'       => $params['model'] ?? $this->model,
                'messages'    => [
                    [ 'role' => 'system', 'content' => $params['system'] ?? 'You are a helpful content writer.' ],
                    [ 'role' => 'user',   'content' => $prompt ],
                ],
                'temperature' => $params['temperature'] ?? 0.7,
                'max_tokens'  => $params['max_tokens'] ?? 4096,
            ] ),
        ] );

        if ( is_wp_error( $response ) ) {
            return new \WP_Error( 'openrouter_request_failed', $response->get_error_message() );
        }

        $body = json_decode( wp_remote_retrieve_body( $response ), true );

        if ( empty( $body['choices'][0]['message']['content'] ) ) {
            $err = $body['error']['message'] ?? wp_remote_retrieve_response_message( $response );
            return new \WP_Error( 'openrouter_empty_response', $err ?: 'OpenRouter returned an empty response.' );
        }

        return $body['choices'][0]['message']['content'];
    }
}
