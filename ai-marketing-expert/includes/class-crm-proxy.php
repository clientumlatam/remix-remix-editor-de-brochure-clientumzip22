<?php
/**
 * CRM Proxy — bridges WordPress REST to the Clientum CRM Express service.
 *
 * The Express server (whatsapp-bridge sibling service) runs internally on
 * port 3001 and is not publicly reachable. This controller proxies AI
 * generation and prospecting requests from authenticated WordPress users to
 * that service, adding the shared internal token so Express can verify the
 * call comes from a trusted source.
 *
 * Routes registered (namespace aime/v1):
 *   POST /crm/generate  — proxy to Express /api/generate
 *   POST /crm/scrape    — proxy to Express /api/scrape-places
 */

namespace WPSpace\AiMarketingExpert;

if ( ! defined( 'ABSPATH' ) ) exit;

class CrmProxy {

	private string $express_base;
	private string $internal_token;

	public function __construct() {
		$this->express_base   = rtrim( getenv( 'CRM_EXPRESS_URL' ) ?: 'http://127.0.0.1:3001', '/' );
		$this->internal_token = getenv( 'CRM_INTERNAL_TOKEN' ) ?: '';

		// Register routes immediately — this constructor is called from inside
		// the rest_api_init hook (via on_rest_api_init), so we cannot add another
		// rest_api_init action (it would never fire). Call directly instead.
		$this->register_routes();
	}

	public function register_routes(): void {
		$ns = aime_rest_namespace();

		register_rest_route( $ns, '/crm/generate', [
			'methods'             => 'POST',
			'callback'            => [ $this, 'generate' ],
			'permission_callback' => [ $this, 'require_login' ],
		] );

		register_rest_route( $ns, '/crm/scrape', [
			'methods'             => 'POST',
			'callback'            => [ $this, 'scrape' ],
			'permission_callback' => [ $this, 'require_login' ],
		] );
	}

	/** Only logged-in WordPress users may call these endpoints. */
	public function require_login(): bool {
		return is_user_logged_in();
	}

	/** Proxy POST /crm/generate → Express /api/generate */
	public function generate( \WP_REST_Request $request ): \WP_REST_Response {
		$body = $request->get_json_params();
		return $this->proxy( '/api/generate', $body );
	}

	/** Proxy POST /crm/scrape → Express /api/scrape-places */
	public function scrape( \WP_REST_Request $request ): \WP_REST_Response {
		$body = $request->get_json_params();
		return $this->proxy( '/api/scrape-places', $body );
	}

	/** Forward a request to the Express service and relay its response. */
	private function proxy( string $path, array $body ): \WP_REST_Response {
		if ( ! $this->internal_token ) {
			return new \WP_REST_Response(
				[ 'error' => 'CRM service not configured (missing CRM_INTERNAL_TOKEN).' ],
				503
			);
		}

		$url      = $this->express_base . $path;
		$response = wp_remote_post( $url, [
			'timeout' => 120,
			'headers' => [
				'Content-Type'      => 'application/json',
				'X-CRM-Token'       => $this->internal_token,
			],
			'body'    => wp_json_encode( $body ),
		] );

		if ( is_wp_error( $response ) ) {
			return new \WP_REST_Response(
				[ 'error' => $response->get_error_message() ],
				502
			);
		}

		$code = wp_remote_retrieve_response_code( $response );
		$raw  = wp_remote_retrieve_body( $response );
		$data = json_decode( $raw, true );

		if ( $data === null ) {
			return new \WP_REST_Response( [ 'error' => 'Invalid response from CRM service.' ], 502 );
		}

		return new \WP_REST_Response( $data, (int) $code );
	}
}
