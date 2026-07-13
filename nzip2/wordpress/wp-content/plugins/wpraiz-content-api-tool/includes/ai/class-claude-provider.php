<?php
namespace WPRaiz\ContentAPI\AI;

if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Claude (Anthropic) provider.
 */
class Claude_Provider implements AI_Provider {

    private string $api_key;
    private string $model;

    public function __construct() {
        $settings      = wpraiz_get_settings();
        $this->api_key = $settings['claude_api_key'] ?? '';
        $this->model   = $settings['claude_model'] ?? 'claude-sonnet-4-5-20250514';
    }

    public function get_name(): string {
        return 'claude';
    }

    public function is_configured(): bool {
        return ! empty( $this->api_key );
    }

    public function generate( string $prompt, array $params = [] ) {
        if ( ! $this->is_configured() ) {
            return new \WP_Error( 'not_configured', __( 'Claude API key not configured.', 'wpraiz-content-api' ) );
        }

        $body = [
            'model'      => $params['model'] ?? $this->model,
            'max_tokens' => $params['max_tokens'] ?? 4096,
            'messages'   => [
                [ 'role' => 'user', 'content' => $prompt ],
            ],
        ];

        if ( ! empty( $params['system'] ) ) {
            $body['system'] = $params['system'];
        }

        $response = wp_remote_post( 'https://api.anthropic.com/v1/messages', [
            'timeout' => 120,
            'headers' => [
                'Content-Type'      => 'application/json',
                'x-api-key'         => $this->api_key,
                'anthropic-version'  => '2023-06-01',
            ],
            'body' => wp_json_encode( $body ),
        ]);

        if ( is_wp_error( $response ) ) {
            return $response;
        }

        $code = wp_remote_retrieve_response_code( $response );
        $data = json_decode( wp_remote_retrieve_body( $response ), true );

        if ( $code !== 200 ) {
            $error_msg = $data['error']['message'] ?? __( 'Claude API error.', 'wpraiz-content-api' );
            return new \WP_Error( 'claude_error', $error_msg );
        }

        // Extract text from content blocks
        $text = '';
        foreach ( ( $data['content'] ?? [] ) as $block ) {
            if ( $block['type'] === 'text' ) {
                $text .= $block['text'];
            }
        }

        return $text;
    }
}
