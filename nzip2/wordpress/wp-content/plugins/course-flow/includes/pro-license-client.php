<?php
/**
 * PRO License client helpers with resilient registration and ajax fallback.
 * Author: Pawel Borowiec
 * Text Domain: course-flow
 *
 * @package CourseFlow
 * @since   1.5.4
 * @version 1.6.1
 */

defined( 'ABSPATH' ) || exit;

/**
 * ====================================================================
 * DEBUG LOGGING
 * ==================================================================== */

if ( ! function_exists( 'courseflow_pro_debug' ) ) {
	/**
	 * Enhanced debug logging for license operations.
	 *
	 * @since 1.6.1
	 * @param string $message Log message.
	 * @param array  $context Additional context data.
	 * @return void
	 */
	function courseflow_pro_debug( $message, $context = array() ) {
		if ( ! defined( 'WP_DEBUG' ) || ! WP_DEBUG ) {
			return;
		}

		$timestamp = gmdate( 'Y-m-d H:i:s' );
		$user_id   = get_current_user_id();
		$caller    = 'unknown';

		$log = sprintf(
			'[%s] [CourseFlow PRO] [User:%d] [%s] %s',
			$timestamp,
			$user_id,
			$caller,
			$message
		);

		if ( ! empty( $context ) ) {
			$log .= ' | Context: ' . wp_json_encode( $context, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT );
		}
	}
}

/*
 * ====================================================================
 * CONSTANTS & OPTIONS
 * ====================================================================
 */

/* Option names. */
if ( ! defined( 'CFPRO_OPTION_CLIENT_ID' ) ) {
	define( 'CFPRO_OPTION_CLIENT_ID', 'courseflow_pro_client_id' );
}
if ( ! defined( 'CFPRO_OPTION_PUBLIC_KEY' ) ) {
	define( 'CFPRO_OPTION_PUBLIC_KEY', 'courseflow_pro_public_key' );
}
if ( ! defined( 'CFPRO_OPTION_PRIVATE_KEY' ) ) {
	define( 'CFPRO_OPTION_PRIVATE_KEY', 'courseflow_pro_private_key' );
}
if ( ! defined( 'CFPRO_OPTION_DOWNLOAD_TOKEN' ) ) {
	define( 'CFPRO_OPTION_DOWNLOAD_TOKEN', 'courseflow_pro_download_token' );
}
if ( ! defined( 'CFPRO_OPTION_DOWNLOAD_TOKEN_TIME' ) ) {
	define( 'CFPRO_OPTION_DOWNLOAD_TOKEN_TIME', 'courseflow_pro_download_token_created' );
}
if ( ! defined( 'CFPRO_OPTION_PENDING_UNTIL' ) ) {
	define( 'CFPRO_OPTION_PENDING_UNTIL', 'courseflow_pro_pending_activation_until' );
}
if ( ! defined( 'CFPRO_OPTION_LICENSE_STATUS' ) ) {
	define( 'CFPRO_OPTION_LICENSE_STATUS', 'courseflow_pro_license_status_persistent' );
}
if ( ! defined( 'CFPRO_OPTION_LICENSE_LAST_CHECK' ) ) {
	define( 'CFPRO_OPTION_LICENSE_LAST_CHECK', 'courseflow_pro_license_last_check' );
}

/* Vendor endpoints. */
if ( ! defined( 'CFPRO_VENDOR_BASE' ) ) {
	define( 'CFPRO_VENDOR_BASE', 'https://dev.pawelborowiec.com/cfpro/' );
}
if ( ! defined( 'CFPRO_VENDOR_REGISTER_ENDPOINT' ) ) {
	define( 'CFPRO_VENDOR_REGISTER_ENDPOINT', CFPRO_VENDOR_BASE . 'register-client.php' );
}
if ( ! defined( 'CFPRO_VENDOR_CREATE_ENDPOINT' ) ) {
	define( 'CFPRO_VENDOR_CREATE_ENDPOINT', CFPRO_VENDOR_BASE . 'create-checkout-session.php' );
}
if ( ! defined( 'CFPRO_VENDOR_LICENSE_STATUS_ENDPOINT' ) ) {
	define( 'CFPRO_VENDOR_LICENSE_STATUS_ENDPOINT', CFPRO_VENDOR_BASE . 'license-status.php' );
}
if ( ! defined( 'CFPRO_VENDOR_CREATE_DOWNLOAD_ENDPOINT' ) ) {
	define( 'CFPRO_VENDOR_CREATE_DOWNLOAD_ENDPOINT', CFPRO_VENDOR_BASE . 'create-download-token.php' );
}

courseflow_pro_debug( 'PRO License client loaded, constants defined' );

/**
 * ====================================================================
 * PERSISTENT LICENSE STORAGE - CRITICAL FIX
 * ==================================================================== */

/**
 * Save license status to persistent storage with atomic operation.
 *
 * CRITICAL: Uses update_option with autoload=false for performance.
 * CRITICAL: Validates data structure before saving.
 * CRITICAL: Returns success/failure for error handling.
 *
 * @since 1.6.1
 * @param array $status License status array.
 * @return bool True on success, false on failure.
 */
function courseflow_pro_save_license_status_persistent( $status ) {
	courseflow_pro_debug( 'SAVE PERSISTENT: Starting save operation', array( 'input' => $status ) );

	if ( ! is_array( $status ) ) {
		courseflow_pro_debug( 'SAVE PERSISTENT: FAILED - not an array' );
		return false;
	}

	// Validate and sanitize structure.
	$persistent_data = array(
		'active'          => ! empty( $status['active'] ) ? true : false,
		'expires_at'      => isset( $status['expires_at'] ) ? sanitize_text_field( $status['expires_at'] ) : '',
		'subscription_id' => isset( $status['subscription_id'] ) ? sanitize_text_field( $status['subscription_id'] ) : '',
		'customer_email'  => isset( $status['customer_email'] ) ? sanitize_email( $status['customer_email'] ) : '',
		'message'         => isset( $status['message'] ) ? sanitize_text_field( $status['message'] ) : '',
		'last_updated'    => time(),
		'saved_by'        => get_current_user_id(),
	);

	courseflow_pro_debug( 'SAVE PERSISTENT: Prepared data structure', array( 'data' => $persistent_data ) );

	// Save with autoload=false to prevent loading on every page load.
	$result = update_option( CFPRO_OPTION_LICENSE_STATUS, $persistent_data, false );

	if ( $result ) {
		courseflow_pro_debug(
			'SAVE PERSISTENT: SUCCESS - Status saved to wp_options',
			array(
				'active'      => $persistent_data['active'],
				'option_name' => CFPRO_OPTION_LICENSE_STATUS,
			)
		);

		// Verify save by reading back.
		$verification = get_option( CFPRO_OPTION_LICENSE_STATUS, false );
		if ( is_array( $verification ) && $verification['active'] === $persistent_data['active'] ) {
			courseflow_pro_debug( 'SAVE PERSISTENT: VERIFIED - Read-back successful' );
		} else {
			courseflow_pro_debug(
				'SAVE PERSISTENT: WARNING - Read-back verification failed',
				array(
					'expected' => $persistent_data,
					'got'      => $verification,
				)
			);
		}
	} else {
		courseflow_pro_debug( 'SAVE PERSISTENT: FAILED - update_option returned false' );
	}

	// Also update last check timestamp.
	update_option( CFPRO_OPTION_LICENSE_LAST_CHECK, time(), false );

	return $result;
}

/**
 * Get license status from persistent storage.
 *
 * CRITICAL: Direct database read, bypasses all caches.
 * CRITICAL: Returns false if not found or invalid.
 *
 * @since 1.6.1
 * @return array|false License status array on success, false if not found.
 */
function courseflow_pro_get_license_status_persistent() {
	courseflow_pro_debug( 'GET PERSISTENT: Starting retrieval' );

	// Direct option read - no cache.
	$stored = get_option( CFPRO_OPTION_LICENSE_STATUS, false );

	courseflow_pro_debug(
		'GET PERSISTENT: Raw result from database',
		array(
			'found'    => ( false !== $stored ),
			'is_array' => is_array( $stored ),
			'data'     => $stored,
		)
	);

	if ( ! is_array( $stored ) ) {
		courseflow_pro_debug( 'GET PERSISTENT: FAILED - No persistent data found' );
		return false;
	}

	// Validate structure.
	if ( ! isset( $stored['active'] ) || ! isset( $stored['last_updated'] ) ) {
		courseflow_pro_debug( 'GET PERSISTENT: FAILED - Invalid data structure', array( 'keys' => array_keys( $stored ) ) );
		return false;
	}

	$age_seconds = time() - (int) $stored['last_updated'];
	courseflow_pro_debug(
		'GET PERSISTENT: SUCCESS - Data retrieved',
		array(
			'active'      => $stored['active'],
			'age_seconds' => $age_seconds,
			'expires_at'  => isset( $stored['expires_at'] ) ? $stored['expires_at'] : 'none',
		)
	);

	return $stored;
}

/**
 * Clear persistent license status.
 *
 * Used when license is deactivated or needs full reset.
 *
 * @since 1.6.1
 * @return bool True on success, false on failure.
 */
function courseflow_pro_clear_license_status_persistent() {
	courseflow_pro_debug( 'CLEAR PERSISTENT: Removing license data from wp_options' );
	$result = delete_option( CFPRO_OPTION_LICENSE_STATUS );

	if ( $result ) {
		courseflow_pro_debug( 'CLEAR PERSISTENT: SUCCESS' );
	} else {
		courseflow_pro_debug( 'CLEAR PERSISTENT: FAILED or already empty' );
	}

	return $result;
}

/**
 * ====================================================================
 * SUCCESS URL INTERCEPTOR
 * ====================================================================
 */

/**
 * Intercept vendor success URL and redirect to admin upgrade page.
 *
 * ENHANCED: Now adds ALL required parameters for automatic polling.
 *
 * @since 1.5.6
 * @return void
 */
function courseflow_pro_intercept_success_url() {
	// Only run on frontend, not in admin.
	if ( is_admin() ) {
		return;
	}

	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	if ( ! isset( $_GET['courseflow_pro'] ) || 'success' !== $_GET['courseflow_pro'] ) {
		return;
	}

	courseflow_pro_debug( 'SUCCESS INTERCEPTOR: Detected vendor redirect' );

	// Mark activation as pending (15 minutes).
	courseflow_pro_mark_activation_pending( 900 );

	// Clear all caches.
	delete_transient( 'courseflow_pro_cached_status' );
	wp_cache_delete( 'courseflow_pro_cached_status', 'options' );

	// Build admin redirect URL.
	$redirect_params = array(
		'page'          => 'courseflow-pro-upgrade',
		'payment'       => 'success',
		'auto_poll'     => '1',
		'force_refresh' => '1',
		'ts'            => time(),
	);

	$redirect_url = add_query_arg( $redirect_params, admin_url( 'admin.php' ) );

	courseflow_pro_debug( 'SUCCESS INTERCEPTOR: Redirecting', array( 'url' => $redirect_url ) );

	wp_safe_redirect( $redirect_url );
	exit;
}
add_action( 'template_redirect', 'courseflow_pro_intercept_success_url', 1 );

/**
 * ====================================================================
 * RSA KEY MANAGEMENT
 * ====================================================================
 */

/**
 * Generate RSA keypair if not present.
 *
 * @return bool True on success, false on failure.
 */
function courseflow_pro_generate_rsa_keys() {
	courseflow_pro_debug( 'RSA: Checking keys' );

	$private = get_option( CFPRO_OPTION_PRIVATE_KEY, '' );
	$public  = get_option( CFPRO_OPTION_PUBLIC_KEY, '' );

	if ( ! empty( $private ) && ! empty( $public ) ) {
		courseflow_pro_debug( 'RSA: Keys already exist' );
		return true;
	}

	courseflow_pro_debug( 'RSA: Generating new keypair' );

	$config = array(
		'digest_alg'       => 'sha256',
		'private_key_bits' => 2048,
		'private_key_type' => OPENSSL_KEYTYPE_RSA,
	);

	$res = openssl_pkey_new( $config );
	if ( false === $res ) {
		courseflow_pro_debug( 'RSA: Generation FAILED', array( 'error' => openssl_error_string() ) );
		return false;
	}

	$private_key = '';
	$export_ok   = openssl_pkey_export( $res, $private_key );
	$details     = openssl_pkey_get_details( $res );

	if ( false === $export_ok || ! isset( $details['key'] ) || empty( $private_key ) ) {
		courseflow_pro_debug( 'RSA: Export FAILED' );
		return false;
	}

	update_option( CFPRO_OPTION_PRIVATE_KEY, $private_key, false );
	update_option( CFPRO_OPTION_PUBLIC_KEY, $details['key'], false );

	courseflow_pro_debug( 'RSA: Keys generated successfully' );
	return true;
}

/**
 * Reset local client id.
 *
 * @return void
 */
function courseflow_pro_reset_client_id() {
	courseflow_pro_debug( 'CLIENT: Resetting client_id' );
	delete_option( CFPRO_OPTION_CLIENT_ID );
}

/**
 * Register client with vendor.
 *
 * @return string|false Client ID on success, false on failure.
 */
function courseflow_pro_register_client_if_needed() {
	$client_id = get_option( CFPRO_OPTION_CLIENT_ID, '' );
	if ( ! empty( $client_id ) ) {
		courseflow_pro_debug( 'CLIENT: Already registered', array( 'id' => $client_id ) );
		return $client_id;
	}

	courseflow_pro_debug( 'CLIENT: Starting registration' );

	$public_key = get_option( CFPRO_OPTION_PUBLIC_KEY, '' );
	if ( empty( $public_key ) ) {
		if ( ! courseflow_pro_generate_rsa_keys() ) {
			courseflow_pro_debug( 'CLIENT: RSA generation failed' );
			return false;
		}
		$public_key = get_option( CFPRO_OPTION_PUBLIC_KEY, '' );
	}

	$site_url = untrailingslashit( home_url( '/' ) );

	$response = wp_remote_post(
		CFPRO_VENDOR_REGISTER_ENDPOINT,
		array(
			'headers'   => array( 'Content-Type' => 'application/json' ),
			'body'      => wp_json_encode(
				array(
					'site_url'   => $site_url,
					'public_key' => $public_key,
				)
			),
			'timeout'   => 20,
			'sslverify' => true,
		)
	);

	if ( is_wp_error( $response ) ) {
		courseflow_pro_debug( 'CLIENT: Registration failed', array( 'error' => $response->get_error_message() ) );
		return false;
	}

	$code = (int) wp_remote_retrieve_response_code( $response );
	$raw  = (string) wp_remote_retrieve_body( $response );
	$data = json_decode( $raw, true );

	if ( 200 !== $code || ! is_array( $data ) || empty( $data['success'] ) || empty( $data['client_id'] ) ) {
		courseflow_pro_debug(
			'CLIENT: Invalid response',
			array(
				'code' => $code,
				'body' => $raw,
			)
		);
		return false;
	}

	$client_id = sanitize_text_field( (string) $data['client_id'] );
	update_option( CFPRO_OPTION_CLIENT_ID, $client_id, false );

	courseflow_pro_debug( 'CLIENT: Registered successfully', array( 'id' => $client_id ) );
	return $client_id;
}

/**
 * Sign JSON payload with private key.
 *
 * @param string $payload JSON string.
 * @return string|false Base64 signature on success, false on failure.
 */
function courseflow_pro_sign_payload( $payload ) {
	$private_key = get_option( CFPRO_OPTION_PRIVATE_KEY, '' );
	if ( empty( $private_key ) ) {
		courseflow_pro_debug( 'SIGN: Private key not found' );
		return false;
	}

	$pkeyid = openssl_pkey_get_private( $private_key );
	if ( false === $pkeyid ) {
		courseflow_pro_debug( 'SIGN: Failed to get private key' );
		return false;
	}

	$signed = '';
	$ok     = openssl_sign( $payload, $signed, $pkeyid, OPENSSL_ALGO_SHA256 );
	unset( $pkeyid );

	if ( ! $ok ) {
		courseflow_pro_debug( 'SIGN: openssl_sign failed' );
		return false;
	}

	// phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode
	return base64_encode( $signed );
}

/**
 * Post signed payload to vendor with retry.
 *
 * @param string $endpoint URL.
 * @param array  $payload_array Payload.
 * @return array|false Response or false.
 */
function courseflow_pro_post_signed_with_retry( $endpoint, array $payload_array ) {
	courseflow_pro_debug( 'VENDOR POST: Starting', array( 'endpoint' => $endpoint ) );

	$client_id = courseflow_pro_register_client_if_needed();
	if ( empty( $client_id ) ) {
		courseflow_pro_debug( 'VENDOR POST: No client_id' );
		return false;
	}

	$max_tries = 2;
	for ( $try = 1; $try <= $max_tries; $try++ ) {
		courseflow_pro_debug( "VENDOR POST: Attempt {$try}/{$max_tries}" );

		$payload_json = wp_json_encode( $payload_array, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE );
		if ( ! is_string( $payload_json ) ) {
			courseflow_pro_debug( 'VENDOR POST: JSON encode failed' );
			return false;
		}

		$signature = courseflow_pro_sign_payload( $payload_json );
		if ( false === $signature ) {
			courseflow_pro_debug( 'VENDOR POST: Signing failed' );
			return false;
		}

		$body = wp_json_encode(
			array(
				'client_id' => $client_id,
				'payload'   => $payload_json,
				'signature' => $signature,
			)
		);

		$response = wp_remote_post(
			$endpoint,
			array(
				'headers'   => array( 'Content-Type' => 'application/json' ),
				'body'      => $body,
				'timeout'   => 20,
				'sslverify' => true,
			)
		);

		if ( is_wp_error( $response ) ) {
			courseflow_pro_debug( 'VENDOR POST: Request failed', array( 'error' => $response->get_error_message() ) );
			return false;
		}

		$code = (int) wp_remote_retrieve_response_code( $response );
		$raw  = (string) wp_remote_retrieve_body( $response );
		$data = json_decode( $raw, true );

		courseflow_pro_debug(
			'VENDOR POST: Response received',
			array(
				'code'        => $code,
				'body_length' => strlen( $raw ),
			)
		);

		if ( 403 === $code && is_array( $data ) && ! empty( $data['message'] ) && false !== stripos( (string) $data['message'], 'Unknown client' ) ) {
			courseflow_pro_debug( 'VENDOR POST: Unknown client, re-registering' );
			courseflow_pro_reset_client_id();
			$client_id = courseflow_pro_register_client_if_needed();
			if ( empty( $client_id ) ) {
				return false;
			}
			continue;
		}

		if ( 200 === $code && is_array( $data ) ) {
			courseflow_pro_debug( 'VENDOR POST: SUCCESS' );
			return $data;
		}

		courseflow_pro_debug( 'VENDOR POST: Failed', array( 'code' => $code ) );
		return is_array( $data ) ? $data : false;
	}

	courseflow_pro_debug( 'VENDOR POST: All retries exhausted' );
	return false;
}

/**
 * ====================================================================
 * LICENSE STATUS FUNCTIONS - CRITICAL FIX
 * ====================================================================
 */

if ( ! function_exists( 'cfpf_fetch_license_status' ) ) {
	/**
	 * Fetch license status from vendor.
	 *
	 * CRITICAL FIX: Immediately saves to persistent storage after fetch.
	 *
	 * @since 1.6.11
	 * @return array|false Status data on success, false on failure.
	 */
	function cfpf_fetch_license_status() {
		courseflow_pro_debug( 'FETCH STATUS: Starting vendor request' );

		$site_url = untrailingslashit( home_url( '/' ) );
		$payload  = array(
			'site_url'  => $site_url,
			'timestamp' => time(),
		);

		$res = courseflow_pro_post_signed_with_retry( CFPRO_VENDOR_LICENSE_STATUS_ENDPOINT, $payload );

		if ( ! is_array( $res ) || empty( $res['success'] ) ) {
			courseflow_pro_debug( 'FETCH STATUS: Vendor request failed', array( 'response' => $res ) );
			return false;
		}

		$status = array(
			'active'          => ! empty( $res['active'] ),
			'expires_at'      => ! empty( $res['expires_at'] ) ? (string) $res['expires_at'] : '',
			'subscription_id' => ! empty( $res['subscription_id'] ) ? (string) $res['subscription_id'] : '',
			'customer_email'  => ! empty( $res['customer_email'] ) ? (string) $res['customer_email'] : '',
			'message'         => ! empty( $res['message'] ) ? (string) $res['message'] : '',
		);

		courseflow_pro_debug( 'FETCH STATUS: Success from vendor', array( 'active' => $status['active'] ) );

		// CRITICAL: Save immediately to persistent storage.
		$save_result = courseflow_pro_save_license_status_persistent( $status );

		if ( ! $save_result ) {
			courseflow_pro_debug( 'FETCH STATUS: WARNING - Persistent save failed!' );
		}

		return $status;
	}
}

/**
 * Check if activation is pending.
 *
 * @since 1.6.11
 * @return bool True if pending.
 */
function courseflow_pro_is_activation_pending() {
	$until   = (int) get_option( CFPRO_OPTION_PENDING_UNTIL, 0 );
	$pending = ( $until > time() );

	courseflow_pro_debug(
		'PENDING CHECK: Result',
		array(
			'pending' => $pending,
			'until'   => $until,
		)
	);

	return $pending;
}

/**
 * Mark activation as pending.
 *
 * @since 1.6.11
 * @param int $ttl_seconds TTL in seconds.
 * @return void
 */
function courseflow_pro_mark_activation_pending( $ttl_seconds = 900 ) {
	$ttl_seconds = (int) $ttl_seconds;
	if ( $ttl_seconds < 60 ) {
		$ttl_seconds = 60;
	}
	update_option( CFPRO_OPTION_PENDING_UNTIL, time() + $ttl_seconds, false );
	courseflow_pro_debug( 'PENDING: Marked for seconds', array( 'ttl' => $ttl_seconds ) );
}

/**
 * Clear pending flag.
 *
 * @since 1.6.11
 * @return void
 */
function courseflow_pro_clear_activation_pending() {
	delete_option( CFPRO_OPTION_PENDING_UNTIL );
	courseflow_pro_debug( 'PENDING: Cleared' );
}

if ( ! function_exists( 'courseflow_pro_get_status_cached' ) ) {
	/**
	 * Get license status with intelligent caching.
	 *
	 * CRITICAL FIX v2: Multiple fallback layers to guarantee status persistence.
	 *
	 * Priority order:
	 * 1. Transient cache (if not pending)
	 * 2. Persistent storage (if active and recent)
	 * 3. Fetch from vendor
	 * 4. Persistent storage (fallback if fetch fails)
	 *
	 * @since 1.6.11
	 * @return array|false Status data.
	 */
	function courseflow_pro_get_status_cached() {
		courseflow_pro_debug( 'GET STATUS: ========== START ==========' );

		$pending = courseflow_pro_is_activation_pending();

		// LAYER 1: Check transient cache (fast path).
		if ( ! $pending ) {
			$cached = get_transient( 'courseflow_pro_cached_status' );
			if ( is_array( $cached ) ) {
				courseflow_pro_debug( 'GET STATUS: LAYER 1 - Using transient cache', array( 'active' => $cached['active'] ?? false ) );
				return $cached;
			}
			courseflow_pro_debug( 'GET STATUS: LAYER 1 - Transient cache empty' );
		} else {
			courseflow_pro_debug( 'GET STATUS: LAYER 1 - Skipped (pending)' );
			delete_transient( 'courseflow_pro_cached_status' );
		}

		// LAYER 2: Check persistent storage (before expensive vendor call).
		if ( ! $pending ) {
			$persistent = courseflow_pro_get_license_status_persistent();

			if ( is_array( $persistent ) ) {
				$age_seconds = time() - ( isset( $persistent['last_updated'] ) ? (int) $persistent['last_updated'] : 0 );
				$is_active   = ! empty( $persistent['active'] );

				courseflow_pro_debug(
					'GET STATUS: LAYER 2 - Persistent found',
					array(
						'active'      => $is_active,
						'age_seconds' => $age_seconds,
					)
				);

				// If active and less than 5 minutes old, use it.
				if ( $is_active && $age_seconds < 300 ) {
					courseflow_pro_debug( 'GET STATUS: LAYER 2 - Using persistent (fresh & active)' );

					// Refresh transient for next call.
					set_transient( 'courseflow_pro_cached_status', $persistent, 60 );

					courseflow_pro_debug( 'GET STATUS: ========== END (PERSISTENT) ==========' );
					return $persistent;
				}

				courseflow_pro_debug( 'GET STATUS: LAYER 2 - Persistent too old or inactive, will fetch fresh' );
			} else {
				courseflow_pro_debug( 'GET STATUS: LAYER 2 - No persistent data' );
			}
		} else {
			courseflow_pro_debug( 'GET STATUS: LAYER 2 - Skipped (pending)' );
		}

		// LAYER 3: Fetch fresh from vendor.
		courseflow_pro_debug( 'GET STATUS: LAYER 3 - Fetching from vendor' );
		$status = cfpf_fetch_license_status();

		if ( is_array( $status ) ) {
			courseflow_pro_debug( 'GET STATUS: LAYER 3 - Vendor fetch success', array( 'active' => $status['active'] ) );

			// Set transient cache.
			$ttl = $pending ? 5 : 60;
			set_transient( 'courseflow_pro_cached_status', $status, $ttl );

			// Clear pending if active.
			if ( ! empty( $status['active'] ) ) {
				courseflow_pro_clear_activation_pending();
			}

			courseflow_pro_debug( 'GET STATUS: ========== END (VENDOR) ==========' );
			return $status;
		}

		courseflow_pro_debug( 'GET STATUS: LAYER 3 - Vendor fetch failed' );

		// LAYER 4: Fallback to persistent storage (even if old).
		$persistent = courseflow_pro_get_license_status_persistent();
		if ( is_array( $persistent ) ) {
			courseflow_pro_debug( 'GET STATUS: LAYER 4 - Using persistent as fallback', array( 'active' => $persistent['active'] ) );
			courseflow_pro_debug( 'GET STATUS: ========== END (FALLBACK) ==========' );
			return $persistent;
		}

		courseflow_pro_debug( 'GET STATUS: LAYER 4 - No fallback available' );
		courseflow_pro_debug( 'GET STATUS: ========== END (FAILED) ==========' );
		return false;
	}
}

/**
 * ====================================================================
 * DOWNLOAD TOKEN MANAGEMENT
 * ====================================================================
 */

if ( ! function_exists( 'cfpf_request_download_token' ) ) {
	/**
	 * Request download token from vendor.
	 *
	 * @since 1.6.11
	 * @return array|false Token data.
	 */
	function cfpf_request_download_token() {
		courseflow_pro_debug( 'DOWNLOAD TOKEN: Requesting' );

		$site_url = untrailingslashit( home_url( '/' ) );
		$payload  = array(
			'site_url'  => $site_url,
			'timestamp' => time(),
		);

		$res = courseflow_pro_post_signed_with_retry( CFPRO_VENDOR_CREATE_DOWNLOAD_ENDPOINT, $payload );

		if ( ! is_array( $res ) || empty( $res['success'] ) ) {
			courseflow_pro_debug( 'DOWNLOAD TOKEN: Request failed' );
			return false;
		}

		if ( ! empty( $res['token'] ) ) {
			update_option( CFPRO_OPTION_DOWNLOAD_TOKEN, sanitize_text_field( $res['token'] ) );
			update_option( CFPRO_OPTION_DOWNLOAD_TOKEN_TIME, gmdate( 'Y-m-d H:i:s' ) );
			courseflow_pro_debug( 'DOWNLOAD TOKEN: Saved' );
		}

		return $res;
	}
}

/**
 * ====================================================================
 * REST API ENDPOINTS
 * ====================================================================
 */

/**
 * REST endpoint: create checkout session.
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response Response.
 */
function courseflow_pro_rest_create_checkout_session( WP_REST_Request $request ) {
	courseflow_pro_debug( 'REST CREATE CHECKOUT: ========== START ==========' );

	if ( ! current_user_can( 'manage_options' ) ) {
		courseflow_pro_debug( 'REST CREATE CHECKOUT: Permission denied' );
		return rest_unauthorized();
	}

	$nonce = $request->get_header( 'X-WP-Nonce' );
	if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
		courseflow_pro_debug( 'REST CREATE CHECKOUT: Nonce failed' );
		return new WP_REST_Response(
			array(
				'success' => false,
				'message' => __( 'Invalid nonce.', 'course-flow' ),
			),
			403
		);
	}

	$payload = array(
		'site_url'  => untrailingslashit( home_url( '/' ) ),
		'timestamp' => time(),
	);

	$vendor_response = courseflow_pro_post_signed_with_retry( CFPRO_VENDOR_CREATE_ENDPOINT, $payload );

	if ( ! is_array( $vendor_response ) || empty( $vendor_response['success'] ) ) {
		$msg = is_array( $vendor_response ) && ! empty( $vendor_response['message'] ) ? $vendor_response['message'] : __( 'Vendor error.', 'course-flow' );
		courseflow_pro_debug( 'REST CREATE CHECKOUT: Vendor error', array( 'msg' => $msg ) );
		return new WP_REST_Response(
			array(
				'success' => false,
				'message' => $msg,
			),
			500
		);
	}

	$checkout_url = '';
	if ( ! empty( $vendor_response['checkout_url'] ) ) {
		$checkout_url = $vendor_response['checkout_url'];
	} elseif ( ! empty( $vendor_response['sessionUrl'] ) ) {
		$checkout_url = $vendor_response['sessionUrl'];
	}

	if ( empty( $checkout_url ) ) {
		courseflow_pro_debug( 'REST CREATE CHECKOUT: No checkout URL' );
		return new WP_REST_Response(
			array(
				'success' => false,
				'message' => __( 'No checkout URL.', 'course-flow' ),
			),
			500
		);
	}

	courseflow_pro_mark_activation_pending( 900 );

	$result = array(
		'success'      => true,
		'checkout_url' => esc_url_raw( $checkout_url ),
	);

	if ( ! empty( $vendor_response['sessionId'] ) ) {
		$result['sessionId'] = sanitize_text_field( $vendor_response['sessionId'] );
	}

	courseflow_pro_debug( 'REST CREATE CHECKOUT: ========== SUCCESS ==========' );
	return new WP_REST_Response( $result, 200 );
}

/**
 * Admin-ajax fallback for create checkout.
 *
 * @return void
 */
function courseflow_pro_ajax_create_checkout() {
	courseflow_pro_debug( 'AJAX CREATE CHECKOUT: Called' );

	if ( ! current_user_can( 'manage_options' ) ) {
		wp_send_json_error( array( 'message' => __( 'Permission denied', 'course-flow' ) ), 403 );
	}

	check_ajax_referer( 'courseflow_pro_ajax', 'nonce' );

	$request = new WP_REST_Request( 'POST', '/course-flow/v1/pro-create-checkout' );
	$request->set_header( 'X-WP-Nonce', wp_create_nonce( 'wp_rest' ) );

	$response = courseflow_pro_rest_create_checkout_session( $request );
	$status   = $response instanceof WP_REST_Response ? $response->get_status() : 500;
	$body     = $response instanceof WP_REST_Response ? $response->get_data() : array(
		'success' => false,
		'message' => __( 'Unknown error', 'course-flow' ),
	);

	wp_send_json( $body, $status );
}
add_action( 'wp_ajax_courseflow_pro_create_checkout', 'courseflow_pro_ajax_create_checkout' );

/**
 * REST endpoint: Refresh license status.
 *
 * CRITICAL FIX v2: Forces fresh fetch by clearing ALL caches INCLUDING persistent storage.
 * This ensures deactivated licenses are properly detected.
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response Response.
 */
function courseflow_pro_rest_refresh_status( WP_REST_Request $request ) {
	courseflow_pro_debug( 'REST REFRESH STATUS: ========== START ==========' );

	if ( ! current_user_can( 'manage_options' ) ) {
		courseflow_pro_debug( 'REST REFRESH STATUS: Permission denied' );
		return new WP_REST_Response(
			array(
				'success' => false,
				'message' => __( 'Access denied.', 'course-flow' ),
			),
			403
		);
	}

	$nonce = $request->get_header( 'X-WP-Nonce' );
	if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
		courseflow_pro_debug( 'REST REFRESH STATUS: Nonce failed' );
		return new WP_REST_Response(
			array(
				'success' => false,
				'message' => __( 'Invalid nonce.', 'course-flow' ),
			),
			403
		);
	}

	// CRITICAL FIX: Clear ALL caches INCLUDING persistent storage to force fresh fetch.
	delete_transient( 'courseflow_pro_cached_status' );
	wp_cache_delete( 'courseflow_pro_cached_status', 'options' );

	// CRITICAL: Also clear persistent storage so get_status_cached() is forced to fetch from vendor.
	courseflow_pro_clear_license_status_persistent();

	courseflow_pro_debug( 'REST REFRESH STATUS: All caches cleared (transient, wp_cache, persistent)' );

	// Get status (will fetch fresh from vendor and save to persistent storage).
	$status = courseflow_pro_get_status_cached();

	if ( ! is_array( $status ) ) {
		courseflow_pro_debug( 'REST REFRESH STATUS: Failed to get status' );
		return new WP_REST_Response(
			array(
				'success' => false,
				'message' => __( 'Unable to fetch status.', 'course-flow' ),
			),
			500
		);
	}

	$pending = courseflow_pro_is_activation_pending();

	courseflow_pro_debug(
		'REST REFRESH STATUS: ========== SUCCESS ==========',
		array(
			'active'  => ! empty( $status['active'] ),
			'pending' => $pending,
		)
	);

	return new WP_REST_Response(
		array(
			'success'         => true,
			'active'          => ! empty( $status['active'] ),
			'expires_at'      => isset( $status['expires_at'] ) ? (string) $status['expires_at'] : '',
			'subscription_id' => isset( $status['subscription_id'] ) ? (string) $status['subscription_id'] : '',
			'customer_email'  => isset( $status['customer_email'] ) ? (string) $status['customer_email'] : '',
			'message'         => isset( $status['message'] ) ? (string) $status['message'] : '',
			'pending'         => $pending,
		),
		200
	);
}

/**
 * Register REST API routes.
 *
 * @since 1.0.0
 * @return void
 */
function courseflow_pro_register_rest_route() {
	courseflow_pro_debug( 'REST: Registering routes' );

	register_rest_route(
		'course-flow/v1',
		'/pro-create-checkout',
		array(
			'methods'             => 'POST',
			'callback'            => 'courseflow_pro_rest_create_checkout_session',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);

	register_rest_route(
		'course-flow/v1',
		'/pro-refresh-status',
		array(
			'methods'             => 'POST',
			'callback'            => 'courseflow_pro_rest_refresh_status',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);

	courseflow_pro_debug( 'REST: Routes registered' );
}
add_action( 'rest_api_init', 'courseflow_pro_register_rest_route' );
