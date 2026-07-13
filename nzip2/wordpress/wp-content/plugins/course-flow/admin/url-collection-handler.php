<?php
/**
 * File: url-collection-handler.php
 * Description: Collects site URL and active LMS descriptions, encrypts with public key,
 * and sends to remote collector.
 * Author: Pawel Borowiec
 * Text Domain: course-flow
 *
 * @since 1.0.0
 * @package CourseFlow
 */

defined( 'ABSPATH' ) || exit;

/**
 * Loads public RSA key safely without causing fatal errors.
 *
 * @since 1.0.0
 * @return string Public key contents or empty string on failure.
 */
function courseflow_load_public_key() {
	$key_path = __DIR__ . '/../assets/keys/courseflow_public_key.pem';

	// Check readability to avoid file_get_contents() returning an error.
	if ( is_readable( $key_path ) ) {
		$key_content = file_get_contents( $key_path ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- Local file allowed.
		if ( false !== $key_content ) {
			return $key_content;
		}
	}

	// Return empty string when missing — safe fallback.
	return '';
}

/**
 * Public RSA key value stored as constant for later usage.
 *
 * @var string
 */
define( 'COURSEFLOW_PUBLIC_KEY', courseflow_load_public_key() );

/**
 * Encrypts an array payload with public RSA key.
 *
 * @since 1.0.0
 * @param array $data Data to encrypt.
 * @return string|false Base64-encoded encrypted data or false on failure.
 */
function courseflow_encrypt_for_server( array $data ) {
	// If the key is empty or invalid, encryption cannot proceed.
	if ( empty( COURSEFLOW_PUBLIC_KEY ) ) {
		return false;
	}

	$pkey_id = openssl_pkey_get_public( COURSEFLOW_PUBLIC_KEY );
	if ( false === $pkey_id ) {
		return false;
	}

	$data_string = wp_json_encode(
		$data,
		JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
	);

	$encrypted = '';
	$success   = openssl_public_encrypt(
		$data_string,
		$encrypted,
		$pkey_id,
		OPENSSL_PKCS1_OAEP_PADDING
	);

	if ( ! $success ) {
		return false;
	}

	return base64_encode( $encrypted ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode -- Required for encryption payload.
}

/**
 * Sends URL and LMS descriptions to collector server.
 *
 * @since 1.0.0
 * @param bool $allow_url_collection Whether sending is allowed.
 * @return bool True on success, false on failure.
 */
function courseflow_send_url_collection_data( $allow_url_collection ) {
	static $already_sent = false;

	if ( $already_sent || ! $allow_url_collection ) {
		return false;
	}

	$collector_endpoint = 'https://api.pawelborowiec.com/v1/course-flow/url-collector/url-collector.php';

	$url = home_url();
	if ( empty( $url ) || ! filter_var( $url, FILTER_VALIDATE_URL ) ) {
		$url = 'http://invalid-url.local';
	}

	$lms_description = courseflow_get_lms_description();
	if ( empty( $lms_description ) ) {
		$lms_description = 'No LMS plugin detected.';
	}

	$payload = array(
		'url'             => $url,
		'lms_description' => $lms_description,
	);

	$encrypted_data = courseflow_encrypt_for_server( $payload );
	if ( false === $encrypted_data ) {
		return false;
	}

	$response = wp_remote_post(
		$collector_endpoint,
		array(
			'method'    => 'POST',
			'body'      => array(
				'encrypted_data' => $encrypted_data,
			),
			'timeout'   => 10,
			'sslverify' => true,
			'headers'   => array(
				'Content-Type' => 'application/x-www-form-urlencoded',
			),
		)
	);

	if ( is_wp_error( $response ) ) {
		return false;
	}

	$code = wp_remote_retrieve_response_code( $response );
	$body = wp_remote_retrieve_body( $response );

	if ( 200 === (int) $code && 'OK' === trim( $body ) ) {
		$already_sent = true;
		return true;
	}

	return false;
}

/**
 * Handles URL collection after settings save in admin.
 *
 * @since 1.0.0
 * @return void
 */
function courseflow_handle_url_collection_after_settings_save() {
	if (
		isset( $_POST['option_page'], $_POST['_wpnonce'] )
		&& 'courseflow_options_group' === sanitize_text_field( wp_unslash( $_POST['option_page'] ) )
		&& wp_verify_nonce(
			sanitize_text_field( wp_unslash( $_POST['_wpnonce'] ) ),
			'courseflow_options_group-options'
		)
	) {
		$allow = (
			! empty( $_POST['courseflow_allow_url_collection'] ) &&
			'1' === sanitize_text_field( wp_unslash( $_POST['courseflow_allow_url_collection'] ) )
		);

		courseflow_send_url_collection_data( $allow );
	}
}
add_action( 'admin_init', 'courseflow_handle_url_collection_after_settings_save' );

/**
 * Handles test connection via REST API.
 *
 * @since 1.0.0
 * @param WP_REST_Request $request Request object.
 * @return void
 */
function courseflow_handle_url_collection_test_connection( WP_REST_Request $request ) {
	$param_allow = $request->get_param( 'allow_url_collection' );

	$allow = $param_allow
		? absint( $param_allow )
		: absint( get_option( 'courseflow_allow_url_collection', 0 ) );

	courseflow_send_url_collection_data( $allow );
}

add_action(
	'rest_pre_dispatch',
	function ( $result, $server, $request ) {
		$route  = $request->get_route();
		$method = $request->get_method();

		if (
			false !== strpos( $route, 'course-flow/v1/test-connection' )
			&& 'POST' === $method
		) {
			courseflow_handle_url_collection_test_connection( $request );
		}

		return $result;
	},
	10,
	3
);
