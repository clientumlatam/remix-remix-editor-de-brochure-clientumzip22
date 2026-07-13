<?php
namespace WPRaiz\ContentAPI\AI;

if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * DeepSeek AI Provider.
 *
 * OpenAI-compatible API at api.deepseek.com.
 * Model: deepseek-chat (DeepSeek-V3, 128K context).
 * Pricing: ~$0.28/1M input tokens, ~$0.42/1M output — way cheaper than GPT-4.
 */
class DeepSeek_Provider implements AI_Provider {

    private string $api_key;
    private string $model;

    public function __construct() {
        $settings      = wpraiz_get_settings();
        $this->api_key = $settings['deepseek_api_key'] ?? '';
        $this->model   = $settings['deepseek_model'] ?? 'deepseek-chat';
    }

    public function get_name(): string {
        return 'DeepSeek';
    }

    public function is_configured(): bool {
        return ! empty( $this->api_key );
    }

    public function generate( string $prompt, array $params = [] ) {
        if ( ! $this->is_configured() ) {
            return new \WP_Error( 'deepseek_not_configured', 'DeepSeek API key is not configured.' );
        }

        $response = wp_remote_post( 'https://api.deepseek.com/chat/completions', [
            'timeout' => 120,
            'headers' => [
                'Content-Type'  => 'application/json',
                'Authorization' => 'Bearer ' . $this->api_key,
            ],
            'body' => wp_json_encode( [
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
            return new \WP_Error( 'deepseek_request_failed', $response->get_error_message() );
        }

        $body = json_decode( wp_remote_retrieve_body( $response ), true );

        if ( empty( $body['choices'][0]['message']['content'] ) ) {
            $err = $body['error']['message'] ?? wp_remote_retrieve_response_message( $response );
            return new \WP_Error( 'deepseek_empty_response', $err ?: 'DeepSeek returned an empty response.' );
        }

        return $body['choices'][0]['message']['content'];
    }
}
