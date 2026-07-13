<?php
namespace WPRaiz\ContentAPI\AI;

if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * AI Provider interface.
 */
interface AI_Provider {

    /**
     * Generate text from a prompt.
     *
     * @param string $prompt     System + user prompt.
     * @param array  $params     Additional params (temperature, max_tokens, etc.).
     * @return string|\WP_Error  Generated text or error.
     */
    public function generate( string $prompt, array $params = [] );

    /**
     * Get provider name.
     */
    public function get_name(): string;

    /**
     * Check if provider is configured.
     */
    public function is_configured(): bool;
}
