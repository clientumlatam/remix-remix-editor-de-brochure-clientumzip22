<?php
/**
 * File: admin/settings-page.php
 * Description: Handles the general settings page for the Course Flow plugin. 
 * Version: 1.2.11
 * Author: Pawel Borowiec
 * Text Domain: course-flow
 *
 * @package CourseFlow
 */

defined( 'ABSPATH' ) || exit;

/* ------------------------------------------------------------------------- *
 * Secure storage for Stripe Secret Key (encrypted option).
 * Uses OpenSSL AES-256-GCM when available, otherwise libsodium.
 * ------------------------------------------------------------------------- */

/**
 * Return binary encryption key derived from WP salts.
 *
 * @return string
 */
function courseflow_get_secret_encryption_key() {
	$material = ( defined( 'AUTH_KEY' ) ? AUTH_KEY : '' ) .  '|' .  ( defined( 'SECURE_AUTH_KEY' ) ? SECURE_AUTH_KEY : '' );
	return hash( 'sha256', $material, true );
}

/**
 * Determine available crypto backend.
 *
 * @return string 'openssl'|'sodium'|'none'
 */
function courseflow_crypto_backend() {
	if ( function_exists( 'openssl_encrypt' ) && function_exists( 'random_bytes' ) ) {
		return 'openssl';
	}
	if ( function_exists( 'sodium_crypto_aead_xchacha20poly1305_ietf_encrypt' ) && function_exists( 'random_bytes' ) ) {
		return 'sodium';
	}
	return 'none';
}

/**
 * Encrypt secret using available backend.
 *
 * @param string $plaintext Secret key. 
 * @return string|false Base64 payload or false on failure.
 */
function courseflow_encrypt_secret( $plaintext ) {
	$plaintext = (string) $plaintext;
	if ( '' === $plaintext ) {
		return false;
	}

	$backend = courseflow_crypto_backend();

	if ( 'openssl' === $backend ) {
		$key = courseflow_get_secret_encryption_key();
		try {
			$iv = random_bytes( 12 );
		} catch ( Exception $e ) {
			error_log( '[CourseFlow] encrypt:  random_bytes failure.' );
			return false;
		}
		$tag    = '';
		$cipher = openssl_encrypt( $plaintext, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag );
		if ( false === $cipher ) {
			error_log( '[CourseFlow] encrypt: openssl_encrypt failure.' );
			return false;
		}
		$payload = array(
			'backend' => 'openssl',
			'iv'      => base64_encode( $iv ),
			'tag'     => base64_encode( $tag ),
			'data'    => base64_encode( $cipher ),
		);
		return base64_encode( wp_json_encode( $payload ) );
	}

	if ( 'sodium' === $backend ) {
		$key   = courseflow_get_secret_encryption_key();
		$nonce = random_bytes( SODIUM_CRYPTO_AEAD_XCHACHA20POLY1305_IETF_NPUBBYTES );
		$cipher = sodium_crypto_aead_xchacha20poly1305_ietf_encrypt( $plaintext, '', $nonce, $key );
		$payload = array(
			'backend' => 'sodium',
			'nonce'   => base64_encode( $nonce ),
			'data'    => base64_encode( $cipher ),
		);
		return base64_encode( wp_json_encode( $payload ) );
	}

	error_log( '[CourseFlow] encrypt: no crypto backend available.' );
	return false;
}

/**
 * Decrypt secret using available backend.
 *
 * @param string $encoded Base64 payload.
 * @return string Decrypted secret or empty string. 
 */
function courseflow_decrypt_secret( $encoded ) {
	$encoded = (string) $encoded;
	if ( '' === $encoded ) {
		return '';
	}

	$json = base64_decode( $encoded, true );
	if ( false === $json ) {
		return '';
	}

	$payload = json_decode( $json, true );
	if ( !  is_array( $payload ) || empty( $payload['backend'] ) ) {
		return '';
	}

	$backend = $payload['backend'];

	if ( 'openssl' === $backend ) {
		if ( !  function_exists( 'openssl_decrypt' ) ) {
			return '';
		}
		if ( empty( $payload['iv'] ) || empty( $payload['tag'] ) || empty( $payload['data'] ) ) {
			return '';
		}
		$iv     = base64_decode( (string) $payload['iv'], true );
		$tag    = base64_decode( (string) $payload['tag'], true );
		$cipher = base64_decode( (string) $payload['data'], true );
		if ( false === $iv || false === $tag || false === $cipher ) {
			return '';
		}
		$key = courseflow_get_secret_encryption_key();
		$pt  = openssl_decrypt( $cipher, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag );
		return false === $pt ? '' : (string) $pt;
	}

	if ( 'sodium' === $backend ) {
		if ( ! function_exists( 'sodium_crypto_aead_xchacha20poly1305_ietf_decrypt' ) ) {
			return '';
		}
		if ( empty( $payload['nonce'] ) || empty( $payload['data'] ) ) {
			return '';
		}
		$nonce  = base64_decode( (string) $payload['nonce'], true );
		$cipher = base64_decode( (string) $payload['data'], true );
		if ( false === $nonce || false === $cipher ) {
			return '';
		}
		$key = courseflow_get_secret_encryption_key();
		try {
			$pt = sodium_crypto_aead_xchacha20poly1305_ietf_decrypt( $cipher, '', $nonce, $key );
		} catch ( Exception $e ) {
			return '';
		}
		return false === $pt ? '' : (string) $pt;
	}

	return '';
}

/**
 * Get stored Stripe secret key (decrypted).
 *
 * @return string
 */
function courseflow_get_stored_stripe_secret_key() {
	$enc = (string) get_option( 'courseflow_stripe_secret_key_encrypted', '' );
	return courseflow_decrypt_secret( $enc );
}

/**
 * Store Stripe secret key encrypted.
 *
 * Returns true on success or WP_Error on failure.
 *
 * @param string $secret Secret key.
 * @return true|WP_Error
 */
function courseflow_store_stripe_secret_key( $secret ) {
	$secret = trim( (string) $secret );

	// Validate format strictly.
	if ( !  preg_match( '/^sk_(test|live)_[A-Za-z0-9]+$/', $secret ) ) {
		return new WP_Error( 'invalid_format', 'Stripe secret key format invalid.' );
	}

	$enc = courseflow_encrypt_secret( $secret );
	if ( false === $enc ) {
		$backend = courseflow_crypto_backend();
		return new WP_Error( 'encryption_failed', 'Server misconfiguration:  secure crypto not available.' );
	}

	$updated = update_option( 'courseflow_stripe_secret_key_encrypted', $enc );
	// update_option may return false when value identical; verify readback anyway.
	$readback = get_option( 'courseflow_stripe_secret_key_encrypted', '' );
	if ( $readback !== $enc ) {
		return new WP_Error( 'persist_failed', 'Failed to persist encrypted secret.' );
	}

	// Clear legacy plain option to avoid exposure.
	update_option( 'courseflow_stripe_secret_key', '' );

	return true;
}

/* ------------------------------------------------------------------------- *
 * Settings registration and admin page rendering
 * ------------------------------------------------------------------------- */

add_action( 'admin_init', 'courseflow_register_stripe_settings' );

/**
 * Registers all settings, sections, and fields for the main settings page.
 *
 * @since 1.0.0
 * @return void
 */
function courseflow_register_stripe_settings() {
	$option_group = 'courseflow_options_group';
	$page_slug    = 'course-flow';
	$section_id   = 'courseflow_stripe_settings';

	// Register the settings.
	$settings = array(
		'courseflow_stripe_publishable_key' => 'sanitize_text_field',
		'courseflow_stripe_secret_key'      => 'sanitize_text_field',
		'courseflow_stripe_endpoint_secret' => 'sanitize_text_field',
		'courseflow_auto_create_account'    => 'absint',
		'courseflow_allow_url_collection'   => 'absint',
		'courseflow_success_page_id'        => 'absint',
	);
	foreach ( $settings as $option_name => $sanitize_callback ) {
		register_setting(
			$option_group,
			$option_name,
			array(
				'sanitize_callback' => $sanitize_callback,
			)
		);
	}

	// Add a single settings section for all options.
	add_settings_section(
		$section_id,
		__( 'Stripe Settings', 'course-flow' ),
		function () {
			echo '<p>' . esc_html__( 'Configure your Stripe API keys and other integration options. ', 'course-flow' ) . '</p>';
		},
		$page_slug
	);

	add_settings_field(
		'courseflow_stripe_publishable_key',
		__( 'Stripe Public Key', 'course-flow' ),
		function () {
			$value = get_option( 'courseflow_stripe_publishable_key', '' );
			echo '<input type="text" name="courseflow_stripe_publishable_key" id="courseflow_stripe_publishable_key" value="' . esc_attr( $value ) . '" class="regular-text" />';
			echo '<p class="description">' . esc_html__( 'Enter the Stripe public key from your Stripe dashboard.', 'course-flow' ) . '</p>';
		},
		$page_slug,
		$section_id
	);

	add_settings_field(
		'courseflow_stripe_secret_key',
		__( 'Stripe Secret Key', 'course-flow' ),
		function () {
			$value = get_option( 'courseflow_stripe_secret_key', '' );
			echo '<input type="password" name="courseflow_stripe_secret_key" id="courseflow_stripe_secret_key" value="' . esc_attr( $value ) . '" class="regular-text" />';
			echo '<p class="description">' . esc_html__( 'Enter the Stripe secret key from your Stripe dashboard.  The key is masked for security.  Use the new React UI for modern workflow.', 'course-flow' ) . '</p>';
		},
		$page_slug,
		$section_id
	);

	add_settings_field(
		'courseflow_stripe_endpoint_secret',
		__( 'Stripe Webhook Secret', 'course-flow' ),
		function () {
			$value = get_option( 'courseflow_stripe_endpoint_secret', '' );
			echo '<input type="text" name="courseflow_stripe_endpoint_secret" id="courseflow_stripe_endpoint_secret" value="' . esc_attr( $value ) . '" class="regular-text" />';
			echo '<p class="description">' . esc_html__( 'Enter the Stripe webhook key from your Stripe dashboard.', 'course-flow' ) . '</p>';
		},
		$page_slug,
		$section_id
	);

	add_settings_field(
		'courseflow_webhook_url',
		__( 'Webhook URL', 'course-flow' ),
		function () {
			$pretty_webhook_url = trailingslashit( site_url() ) . 'wp-json/course-flow/v1/webhook';
			echo '<code>' . esc_url( $pretty_webhook_url ) . '</code>';
			echo '<p class="description">' . esc_html__( 'Copy this URL and configure it as a webhook endpoint in your Stripe dashboard.', 'course-flow' ) . '</p>';
		},
		$page_slug,
		$section_id
	);

	add_settings_field(
		'courseflow_webhook_event_info',
		'',
		function () {
			echo wp_kses_post( __( 'When configuring a webhook in Stripe, select the event <strong>checkout.session.completed</strong> for payments to work properly.', 'course-flow' ) );
		},
		$page_slug,
		$section_id
	);

	add_settings_field(
		'courseflow_allow_url_collection',
		__( 'Please help improve the plugin. ', 'course-flow' ),
		function () {
			$value = absint( get_option( 'courseflow_allow_url_collection', 0 ) );
			echo '<input type="checkbox" name="courseflow_allow_url_collection" id="courseflow_allow_url_collection" value="1" ' . checked( 1, $value, false ) . ' />';
			echo '<label for="courseflow_allow_url_collection">' . 
				esc_html__( 'By enabling this option, you agree to share anonymous usage data to help improve Course Flow.  Your privacy is protected — no personal data is collected, and the information is used solely for statistical purposes to make the plugin better for everyone.  You can change this setting at any time. ', 'course-flow' ) .
				'</label>';
			echo '<p class="description">' . 
				wp_kses_post( __( 'Connection tests will show whether data sharing is enabled (✅) or disabled (❌). For more information, please see our <a href="https://dev.pawelborowiec.com/course-flow/privacy-policy.html" target="_blank">privacy policy</a>.', 'course-flow' ) ) .
				'</p>';
		},
		$page_slug,
		$section_id
	);

	add_settings_field(
		'courseflow_test_connection',
		__( 'Stripe Connection Test', 'course-flow' ),
		function () {
			echo '<button type="button" id="courseflow-test-stripe-connection" class="button">' .  esc_html__( 'TEST CONNECTION', 'course-flow' ) . '</button>';
			echo '<div id="courseflow-test-result" style="margin-top: 10px; display: block; background-color: #f8f8f8; padding: 10px; border: 1px solid #ddd; border-radius: 4px;"></div>';
		},
		$page_slug,
		$section_id
	);

	add_settings_field(
		'courseflow_auto_create_account',
		__( 'Automatic Account Creation', 'course-flow' ),
		function () {
			$value = absint( get_option( 'courseflow_auto_create_account', 1 ) );
			echo '<input type="checkbox" name="courseflow_auto_create_account" id="courseflow_auto_create_account" value="1" ' .  checked( 1, $value, false ) . ' />';
			echo '<label for="courseflow_auto_create_account">' .  esc_html__( 'Check to automatically create a user account upon completion of payment.', 'course-flow' ) . '</label>';
		},
		$page_slug,
		$section_id
	);

	add_settings_field(
		'courseflow_success_page_id',
		__( 'Page After Payment Completion', 'course-flow' ),
		function () {
			$value = absint( get_option( 'courseflow_success_page_id', 0 ) );
			wp_dropdown_pages(
				array(
					'name'              => 'courseflow_success_page_id',
					'id'                => 'courseflow_success_page_id',
					'show_option_none'  => esc_html__( 'Default homepage', 'course-flow' ),
					'option_none_value' => '0',
					'selected'          => esc_attr( $value ),
					'class'             => 'regular-text',
				)
			);
			echo '<p class="description">' . esc_html__( 'Select the page to which the user will be redirected after payment is completed.  By default, the homepage is used with the parameter ? success. ', 'course-flow' ) . '</p>';
		},
		$page_slug,
		$section_id
	);
}

/**
 * Renders the main settings page HTML structure.
 *
 * Note: The React app provides the modern UI.  This PHP render outputs a minimal
 * container for the React application with proper WordPress admin layout.
 *
 * @since 1.0.0
 * @return void
 */
function courseflow_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'course-flow' ) );
	}

	?>
	<div class="wrap courseflow-settings-wrapper">
		<h1><?php echo esc_html__( '', 'course-flow' ); ?></h1>

		<div id="courseflow-settings-root"
		     role="region"
		     aria-label="<?php echo esc_attr( __( 'Course Flow settings', 'course-flow' ) ); ?>"
		     data-courseflow="<?php echo esc_attr( wp_json_encode( array(
			     'nonce'   => wp_create_nonce( 'wp_rest' ),
			     'restUrl' => esc_url_raw( rest_url( 'course-flow/v1' ) ),
		     ) ) ); ?>"></div>

		<noscript>
			<div class="notice notice-warning">
				<p><?php esc_html_e( 'The Course Flow settings page requires JavaScript.  Please enable JavaScript in your browser to use the modern settings UI.  The legacy PHP form is preserved for compatibility but is no longer the primary interface.', 'course-flow' ); ?></p>
			</div>

			<form method="post" action="options.php">
				<?php
				settings_fields( 'courseflow_options_group' );
				do_settings_sections( 'course-flow' );
				submit_button();
				?>
			</form>
		</noscript>
	</div>
	<?php
}

// Include the ordered courses preview page for the "Courses" submenu. 
require_once COURSEFLOW_PATH . 'admin/courses-page.php';

/* ---------------------------
 * REST endpoints
 * --------------------------- */

/**
 * Extract nonce from request.
 *
 * @param WP_REST_Request $request Request instance.
 * @return string|false
 */
function courseflow_extract_nonce_from_request( WP_REST_Request $request ) {
	$nonce = $request->get_header( 'X-WP-Nonce' );
	if ( ! empty( $nonce ) ) {
		return sanitize_text_field( $nonce );
	}

	$json_params = $request->get_json_params();
	if ( is_array( $json_params ) && ! empty( $json_params['nonce'] ) ) {
		return sanitize_text_field( $json_params['nonce'] );
	}

	$param = $request->get_param( 'nonce' );
	if ( ! empty( $param ) ) {
		return sanitize_text_field( $param );
	}

	$param2 = $request->get_param( '_wpnonce' );
	if ( ! empty( $param2 ) ) {
		return sanitize_text_field( $param2 );
	}

	return false;
}

/**
 * Return pages list (id, title) for dropdowns.
 *
 * @return array<int,array{ id:int, title:string }>
 */
function courseflow_get_pages_list() {
	$pages = get_posts(
		array(
			'post_type'      => 'page',
			'posts_per_page' => -1,
			'post_status'    => 'publish',
			'orderby'        => 'post_title',
			'order'          => 'ASC',
			'fields'         => 'ids',
		)
	);

	$result = array();
	foreach ( $pages as $pid ) {
		$result[] = array(
			'id'    => (int) $pid,
			'title' => sanitize_text_field( wp_strip_all_tags( get_the_title( $pid ) ) ),
		);
	}

	return $result;
}

/**
 * REST:  pages endpoint callback.
 *
 * @param WP_REST_Request $request Request. 
 * @return WP_REST_Response
 */
if ( ! function_exists( 'courseflow_rest_get_pages' ) ) {
	function courseflow_rest_get_pages( WP_REST_Request $request ) {
		if ( ! current_user_can( 'manage_options' ) ) {
			return new WP_REST_Response( array( 'success' => false, 'message' => __( 'Permission denied.', 'course-flow' ) ), 403 );
		}

		try {
			$pages = courseflow_get_pages_list();
			return rest_ensure_response( array( 'success' => true, 'pages' => $pages ) );
		} catch ( Exception $e ) {
			return new WP_REST_Response(
				array(
					'success' => false,
					'message' => __( 'Unable to retrieve pages.', 'course-flow' ) . ' ' . esc_html( $e->getMessage() ),
				),
				500
			);
		}
	}
}

/**
 * REST: returns current settings (safe).
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response
 */
if ( ! function_exists( 'courseflow_rest_get_settings' ) ) {
	function courseflow_rest_get_settings( WP_REST_Request $request ) {
		if ( ! current_user_can( 'manage_options' ) ) {
			return new WP_REST_Response( array( 'success' => false, 'message' => __( 'Permission denied. ', 'course-flow' ) ), 403 );
		}

		$publishable = sanitize_text_field( (string) get_option( 'courseflow_stripe_publishable_key', '' ) );
		$has_secret  = ( '' !== courseflow_get_stored_stripe_secret_key() );
		$endpoint_set = '' !== trim( (string) get_option( 'courseflow_stripe_endpoint_secret', '' ) );

		$allow_url_collection = absint( get_option( 'courseflow_allow_url_collection', 0 ) );
		$auto_create_account  = absint( get_option( 'courseflow_auto_create_account', 1 ) );
		$success_page_id      = absint( get_option( 'courseflow_success_page_id', 0 ) );
		$auto_payment_methods = absint( get_option( 'courseflow_auto_payment_methods', 1 ) );
		$default_currency     = strtoupper( sanitize_text_field( (string) get_option( 'courseflow_default_currency', 'USD' ) ) );
		if ( '' === $default_currency ) {
			$default_currency = 'USD';
		}
		$default_currency = substr( $default_currency, 0, 3 );

		$pages = courseflow_get_pages_list();

		$data = array(
			'courseflow_stripe_publishable_key' => $publishable,
			'courseflow_has_secret'             => (bool) $has_secret,
			'courseflow_stripe_endpoint_secret_set' => (bool) $endpoint_set,

			'courseflow_allow_url_collection'   => (int) $allow_url_collection,
			'courseflow_auto_create_account'    => (int) $auto_create_account,
			'courseflow_success_page_id'        => $success_page_id,
			'courseflow_auto_payment_methods'   => (int) $auto_payment_methods,
			'courseflow_default_currency'       => $default_currency,

			'has_secret'        => (bool) $has_secret,
			'endpoint_secret_set'=> (bool) $endpoint_set,
			'allow_url_collection' => (int) $allow_url_collection,
			'auto_create_account'  => (int) $auto_create_account,
			'success_page_id'      => $success_page_id,
			'auto_payment_methods' => (int) $auto_payment_methods,
			'default_currency'     => $default_currency,

			'pages' => $pages,
		);

		return rest_ensure_response( array( 'success' => true, 'data' => $data, 'message' => __( 'Settings retrieved. ', 'course-flow' ) ) );
	}
}

/**
 * GET/POST get-secret. 
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response
 */
if ( ! function_exists( 'courseflow_rest_get_secret' ) ) {
	function courseflow_rest_get_secret( WP_REST_Request $request ) {
		if ( ! current_user_can( 'manage_options' ) ) {
			return new WP_REST_Response( array( 'success' => false, 'message' => __( 'Permission denied. ', 'course-flow' ) ), 403 );
		}

		$reveal = filter_var( $request->get_param( 'reveal' ), FILTER_VALIDATE_BOOLEAN );

		$secret     = courseflow_get_stored_stripe_secret_key();
		$has_secret = ( '' !== $secret );

		if ( ! $reveal ) {
			return rest_ensure_response( array( 'success' => true, 'has_secret' => (bool) $has_secret ) );
		}

		$nonce = courseflow_extract_nonce_from_request( $request );
		if ( false === $nonce || !  wp_verify_nonce( $nonce, 'wp_rest' ) ) {
			return new WP_REST_Response( array( 'success' => false, 'message' => __( 'Invalid or missing nonce.', 'course-flow' ) ), 403 );
		}

		return rest_ensure_response( array( 'success' => true, 'secret' => $secret ) );
	}
}

/**
 * Save settings via REST.
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response
 */
if ( ! function_exists( 'courseflow_rest_save_settings' ) ) {
	function courseflow_rest_save_settings( WP_REST_Request $request ) {
		if ( ! current_user_can( 'manage_options' ) ) {
			return new WP_REST_Response( array( 'success' => false, 'message' => __( 'Permission denied.', 'course-flow' ) ), 403 );
		}

		$nonce = courseflow_extract_nonce_from_request( $request );
		if ( false === $nonce || ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
			return new WP_REST_Response( array( 'success' => false, 'message' => __( 'Invalid or missing nonce.', 'course-flow' ) ), 403 );
		}

		$params = $request->get_json_params();
		if ( ! is_array( $params ) ) {
			return new WP_REST_Response( array( 'success' => false, 'message' => __( 'Invalid request body.', 'course-flow' ) ), 400 );
		}

		$allowed_keys = array(
			'courseflow_stripe_publishable_key',
			'courseflow_stripe_secret_key',
			'courseflow_stripe_endpoint_secret',
			'courseflow_allow_url_collection',
			'courseflow_auto_create_account',
			'courseflow_success_page_id',
			'courseflow_auto_payment_methods',
			'courseflow_default_currency',
		);

		$updated = array();

		foreach ( $allowed_keys as $key ) {
			if ( !  array_key_exists( $key, $params ) ) {
				continue;
			}

			$value = $params[ $key ];

			switch ( $key ) {
				case 'courseflow_allow_url_collection':
				case 'courseflow_auto_create_account':
				case 'courseflow_auto_payment_methods':
				case 'courseflow_success_page_id':
					$sanitized = absint( $value );
					update_option( $key, $sanitized );
					$updated[] = $key;
					break;

				case 'courseflow_default_currency':
					$sanitized = sanitize_text_field( strtoupper( (string) $value ) );
					$sanitized = substr( $sanitized, 0, 3 );
					update_option( $key, $sanitized );
					$updated[] = $key;
					break;

				case 'courseflow_stripe_secret_key':
					$sanitized = sanitize_text_field( (string) $value );
					$trimmed   = trim( $sanitized );

					if ( '' === $trimmed ) {
						break;
					}

					if ( preg_match( '/^[*]+$/', $trimmed ) ) {
						break;
					}

					$store_res = courseflow_store_stripe_secret_key( $trimmed );
					if ( is_wp_error( $store_res ) ) {
						return new WP_REST_Response(
							array(
								'success' => false,
								'message' => $store_res->get_error_message(),
							),
							500
						);
					}

					$updated[] = $key;
					break;

				default:
					$sanitized = sanitize_text_field( (string) $value );
					update_option( $key, $sanitized );
					$updated[] = $key;
					break;
			}
		}

		$has_after = ( '' !== courseflow_get_stored_stripe_secret_key() );

		return rest_ensure_response(
			array(
				'success'               => true,
				'message'               => __( 'Settings saved.', 'course-flow' ),
				'updated'               => $updated,
				'has_secret_after_save' => $has_after,
			)
		);
	}
}

/**
 * Test Stripe connection via REST.
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response
 */
if ( ! function_exists( 'courseflow_rest_test_connection' ) ) {
	function courseflow_rest_test_connection( WP_REST_Request $request ) {
		if ( ! current_user_can( 'manage_options' ) ) {
			return new WP_REST_Response( array( 'success' => false, 'message' => __( 'Permission denied.', 'course-flow' ) ), 403 );
		}

		$nonce = courseflow_extract_nonce_from_request( $request );
		if ( false === $nonce || ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
			return new WP_REST_Response( array( 'success' => false, 'message' => __( 'Invalid or missing nonce.', 'course-flow' ) ), 403 );
		}

		$params = $request->get_json_params();
		if ( ! is_array( $params ) ) {
			$params = array();
		}

		$publishable_key = isset( $params['courseflow_stripe_publishable_key'] ) ? sanitize_text_field( (string) $params['courseflow_stripe_publishable_key'] ) : sanitize_text_field( (string) get_option( 'courseflow_stripe_publishable_key', '' ) );

		$secret_key = '';
		$received_secret = false;
		if ( isset( $params['courseflow_stripe_secret_key'] ) ) {
			$secret_key = sanitize_text_field( (string) $params['courseflow_stripe_secret_key'] );
			$received_secret = true;
		}
		$secret_key = trim( $secret_key );

		if ( $received_secret && '' !== $secret_key && preg_match( '/^sk_(test|live)_[A-Za-z0-9]+$/', $secret_key ) ) {
			$store_res = courseflow_store_stripe_secret_key( $secret_key );
			if ( is_wp_error( $store_res ) ) {
				return new WP_REST_Response( array( 'success' => false, 'message' => $store_res->get_error_message() ), 500 );
			}
		}

		if ( '' === $secret_key ) {
			$secret_key = trim( courseflow_get_stored_stripe_secret_key() );
		}

		$endpoint_secret = isset( $params['courseflow_stripe_endpoint_secret'] ) ? sanitize_text_field( (string) $params['courseflow_stripe_endpoint_secret'] ) : sanitize_text_field( (string) get_option( 'courseflow_stripe_endpoint_secret', '' ) );

		$allow_collection = isset( $params['courseflow_allow_url_collection'] ) ? absint( $params['courseflow_allow_url_collection'] ) : absint( get_option( 'courseflow_allow_url_collection', 0 ) );

		$data = array();

		$data['publishable_key'] = array(
			'status'  => (bool) preg_match( '/^pk_(test|live)_[A-Za-z0-9]+$/', $publishable_key ),
			'message' => '',
		);
		$data['publishable_key']['message'] = $data['publishable_key']['status'] ? __( 'Stripe public key valid.', 'course-flow' ) : __( 'Stripe public key format invalid.', 'course-flow' );

		if ( '' === $secret_key ) {
			$data['secret_key'] = array( 'status' => false, 'message' => __( 'No Stripe secret key. ', 'course-flow' ) );
		} else {
			$is_sk = (bool) preg_match( '/^sk_(test|live)_[A-Za-z0-9]+$/', $secret_key );
			$data['secret_key'] = array( 'status' => $is_sk, 'message' => $is_sk ? __( 'Stripe secret key is correct.', 'course-flow' ) : __( 'Stripe secret key format invalid.', 'course-flow' ) );
		}

		if ( '' === trim( $endpoint_secret ) ) {
			$data['endpoint_secret'] = array( 'status' => false, 'message' => __( 'No Stripe webhook secret.', 'course-flow' ) );
		} else {
			$is_whsec = (bool) preg_match( '/^whsec_[A-Za-z0-9]+$/', $endpoint_secret );
			$data['endpoint_secret'] = array( 'status' => $is_whsec, 'message' => $is_whsec ? __( 'Stripe webhook key format is valid.', 'course-flow' ) : __( 'Stripe webhook key format invalid.', 'course-flow' ) );
		}

		$webhook_url = esc_url_raw( rest_url( 'course-flow/v1/webhook' ) );
		$response    = wp_remote_get( $webhook_url, array( 'timeout' => 8, 'redirection' => 3, 'headers' => array( 'Cache-Control' => 'no-cache' ) ) );

		$ok = false;
		if ( !  is_wp_error( $response ) ) {
			$code = (int) wp_remote_retrieve_response_code( $response );
			$ok   = ( 200 <= $code && $code < 300 );
			$data['webhook_url'] = array( 'status' => $ok, 'message' => $ok ? __( 'Webhook URL is valid.', 'course-flow' ) : sprintf( __( 'Webhook URL returned unexpected HTTP status code:  %d', 'course-flow' ), $code ) );
		} else {
			$data['webhook_url'] = array( 'status' => false, 'message' => __( 'Webhook URL check failed.', 'course-flow' ) );
		}

		$data['data_collection'] = array( 'status' => (bool) $allow_collection, 'message' => $allow_collection ? __( 'Data sharing is enabled.', 'course-flow' ) : __( 'Data sharing is currently disabled.  No anonymous usage data is being collected.', 'course-flow' ) );

		$success = true;
		foreach ( $data as $item ) {
			if ( empty( $item['status'] ) ) {
				$success = false;
				break;
			}
		}

		return rest_ensure_response( array( 'success' => $success, 'data' => $data, 'message' => __( 'Connection test completed.', 'course-flow' ) ) );
	}
}

/**
 * Webhook handler.
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response
 */
if ( ! function_exists( 'courseflow_rest_webhook_handler' ) ) {
	function courseflow_rest_webhook_handler( WP_REST_Request $request ) {
		$method = strtoupper( $request->get_method() );

		if ( 'GET' === $method || 'HEAD' === $method ) {
			return rest_ensure_response( array( 'success' => true, 'message' => __( 'Webhook endpoint reachable.', 'course-flow' ) ) );
		}

		if ( 'POST' !== $method ) {
			return new WP_REST_Response( array( 'success' => false, 'message' => __( 'Method not allowed.', 'course-flow' ) ), 405 );
		}

		$payload         = $request->get_body();
		$sig_header      = $request->get_header( 'stripe-signature' );
		$endpoint_secret = (string) get_option( 'courseflow_stripe_endpoint_secret', '' );

		if ( ! empty( $endpoint_secret ) ) {
			if ( empty( $sig_header ) ) {
				return new WP_REST_Response( array( 'success' => false, 'message' => __( 'Missing Stripe-Signature header.', 'course-flow' ) ), 400 );
			}

			$autoloader = untrailingslashit( COURSEFLOW_PATH ) . '/vendor/autoload.php';
			if ( file_exists( $autoloader ) ) {
				require_once $autoloader;
			}

			if ( ! class_exists( '\Stripe\Webhook' ) ) {
				return new WP_REST_Response( array( 'success' => false, 'message' => __( 'Server misconfiguration:  stripe-php SDK not available.', 'course-flow' ) ), 500 );
			}

			try {
				\Stripe\Webhook::constructEvent( $payload, $sig_header, $endpoint_secret );
			} catch ( \Stripe\Exception\SignatureVerificationException $e ) {
				return new WP_REST_Response( array( 'success' => false, 'message' => __( 'Invalid Stripe signature.', 'course-flow' ) ), 400 );
			} catch ( \UnexpectedValueException $e ) {
				return new WP_REST_Response( array( 'success' => false, 'message' => __( 'Invalid webhook payload.', 'course-flow' ) ), 400 );
			} catch ( \Exception $e ) {
				return new WP_REST_Response( array( 'success' => false, 'message' => __( 'Webhook processing error.', 'course-flow' ) ), 500 );
			}
		}

		return rest_ensure_response( array( 'success' => true ) );
	}
}

/**
 * Register all REST routes in one place.
 *
 * @return void
 */
function courseflow_register_all_rest_routes() {
	register_rest_route( 'course-flow/v1', '/pages', array( 'methods' => array( 'GET' ), 'callback' => 'courseflow_rest_get_pages', 'permission_callback' => function () { return current_user_can( 'manage_options' ); } ) );

	register_rest_route( 'course-flow/v1', '/get-secret', array(
		array( 'methods' => array( 'GET' ), 'callback' => 'courseflow_rest_get_secret', 'permission_callback' => function () { return current_user_can( 'manage_options' ); } ),
		array( 'methods' => array( 'POST' ), 'callback' => 'courseflow_rest_get_secret', 'permission_callback' => function () { return current_user_can( 'manage_options' ); } ),
	) );

	register_rest_route( 'course-flow/v1', '/settings', array( 'methods' => array( 'GET' ), 'callback' => 'courseflow_rest_get_settings', 'permission_callback' => function () { return current_user_can( 'manage_options' ); } ) );

	register_rest_route( 'course-flow/v1', '/save-settings', array( 'methods' => array( 'POST' ), 'callback' => 'courseflow_rest_save_settings', 'permission_callback' => function () { return current_user_can( 'manage_options' ); } ) );

	register_rest_route( 'course-flow/v1', '/test-connection', array( 'methods' => array( 'POST' ), 'callback' => 'courseflow_rest_test_connection', 'permission_callback' => function () { return current_user_can( 'manage_options' ); } ) );

	register_rest_route( 'course-flow/v1', '/webhook', array( array( 'methods' => array( 'GET', 'HEAD', 'POST' ), 'callback' => 'courseflow_rest_webhook_handler', 'permission_callback' => '__return_true' ) ) );
}
add_action( 'rest_api_init', 'courseflow_register_all_rest_routes', 20 );
