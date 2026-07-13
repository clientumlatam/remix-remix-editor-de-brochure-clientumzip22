<?php
namespace WPRaiz\ContentAPI\AI;

if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * OpenAI provider (GPT-4o, GPT-4o-mini).
 */
class OpenAI_Provider implements AI_Provider {

    private string $api_key;
    private string $model;

    public function __construct() {
        $settings      = wpraiz_get_settings();
        $this->api_key = $settings['openai_api_key'] ?? '';
        $this->model   = $settings['openai_model'] ?? 'gpt-4o-mini';
    }

    public function get_name(): string {
        return 'openai';
    }

    public function is_configured(): bool {
        return ! empty( $this->api_key );
    }

    public function generate( string $prompt, array $params = [] ) {
        if ( ! $this->is_configured() ) {
            return new \WP_Error( 'not_configured', __( 'OpenAI API key not configured.', 'wpraiz-content-api' ) );
        }

        $body = [
            'model'       => $params['model'] ?? $this->model,
            'messages'    => [
                [ 'role' => 'system', 'content' => $params['system'] ?? 'You are a professional content writer.' ],
                [ 'role' => 'user', 'content' => $prompt ],
            ],
            'temperature' => $params['temperature'] ?? 0.7,
            'max_tokens'  => $params['max_tokens'] ?? 4096,
        ];

        $response = wp_remote_post( 'https://api.openai.com/v1/chat/completions', [
            'timeout' => 120,
            'headers' => [
                'Content-Type'  => 'application/json',
                'Authorization' => 'Bearer ' . $this->api_key,
            ],
            'body' => wp_json_encode( $body ),
        ]);

        if ( is_wp_error( $response ) ) {
            return $response;
        }

        $code = wp_remote_retrieve_response_code( $response );
        $data = json_decode( wp_remote_retrieve_body( $response ), true );

        if ( $code !== 200 ) {
            $error_msg = $data['error']['message'] ?? __( 'OpenAI API error.', 'wpraiz-content-api' );
            return new \WP_Error( 'openai_error', $error_msg );
        }

        return $data['choices'][0]['message']['content'] ?? '';
    }
}
