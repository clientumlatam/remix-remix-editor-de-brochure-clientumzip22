<?php
/**
 * Admin Page: Course Flow PRO License / Upgrade to Pro (React version).
 * Author: Pawel Borowiec
 * Text Domain: course-flow
 *
 * @package CourseFlow
 * @since   2.1.0
 * @version 2.4.0
 */

defined( 'ABSPATH' ) || exit;

/* ====================================================================
 * DEBUG LOGGING HELPER
 * ==================================================================== */

if ( ! function_exists( 'cfpro_debug_log' ) ) {
	/**
	 * Enhanced debug logging for PRO license operations.
	 *
	 * @since 2.1.3
	 * @param string $message Log message.
	 * @param mixed  $data    Optional data to log.
	 * @param string $level   Log level.
	 * @return void
	 */
	function cfpro_debug_log( $message, $data = null, $level = 'INFO' ) {
		if ( ! defined( 'WP_DEBUG' ) || ! WP_DEBUG ) {
			if ( ! defined( 'COURSEFLOW_DEBUG' ) || ! COURSEFLOW_DEBUG ) {
				return;
			}
		}

		$timestamp = gmdate( 'Y-m-d H:i:s' );
		$user_id   = get_current_user_id();
		
		$log_entry = sprintf(
			'[%s] [CourseFlow PRO] [%s] [User:%d] %s',
			$timestamp,
			$level,
			$user_id,
			$message
		);

		if ( null !== $data ) {
			if ( is_array( $data ) || is_object( $data ) ) {
				$log_entry .= ' | Data: ' . wp_json_encode( $data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE );
			} else {
				$log_entry .= ' | Data: ' . (string) $data;
			}
		}

		// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log
		error_log( $log_entry );
	}
}

/* ====================================================================
 * CONSTANTS & CONFIGURATION
 * ==================================================================== */

if ( ! defined( 'CFPRO_VENDOR_DOWNLOAD_URL' ) ) {
	define( 'CFPRO_VENDOR_DOWNLOAD_URL', CFPRO_VENDOR_BASE . 'download-pro.php' );
}

cfpro_debug_log( 'PRO License admin page loaded.' );

/* ====================================================================
 * SIMPLIFIED REDIRECT HANDLER
 * Just redirect to clean URL, let JavaScript handle everything
 * ==================================================================== */

/**
 * Handle payment success redirect - simplified version.
 *
 * This function ONLY redirects to clean URL with payment_return flag.
 * All license checking and React refresh is handled by JavaScript.
 *
 * @since 2.3.0
 * @return void
 */
function courseflow_pro_handle_payment_success_redirect() {
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	if ( ! isset( $_GET['page'] ) || 'courseflow-pro-upgrade' !== $_GET['page'] ) {
		return;
	}

	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	$payment_success = isset( $_GET['payment'] ) && 'success' === $_GET['payment'];
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	$force_refresh   = isset( $_GET['force_refresh'] ) && '1' === $_GET['force_refresh'];

	if ( ! $payment_success || ! $force_refresh ) {
		return;
	}

	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log
	error_log( '[CourseFlow PRO] PAYMENT SUCCESS - Redirecting to clean URL with payment_return flag' );

	// Clear all caches.
	delete_transient( 'courseflow_pro_cached_status' );
	if ( function_exists( 'wp_cache_delete' ) ) {
		wp_cache_delete( 'courseflow_pro_cached_status', 'options' );
	}

	// Redirect to clean URL with ONLY payment_return flag.
	// JavaScript will handle ALL checking and refreshing.
	$clean_url = add_query_arg(
		array(
			'page'           => 'courseflow-pro-upgrade',
			'payment_return' => '1',
		),
		admin_url( 'admin.php' )
	);

	wp_safe_redirect( $clean_url );
	exit;
}
add_action( 'admin_init', 'courseflow_pro_handle_payment_success_redirect', 1 );

/* ====================================================================
 * HELPER FUNCTIONS
 * ==================================================================== */

if ( ! function_exists( 'cfpf_ensure_rsa_keys' ) ) {
	/**
	 * Ensure RSA keys exist.
	 *
	 * @return bool True on success, false on failure.
	 */
	function cfpf_ensure_rsa_keys() {
		if ( function_exists( 'courseflow_pro_generate_rsa_keys' ) ) {
			return courseflow_pro_generate_rsa_keys();
		}
		return false;
	}
}

if ( ! function_exists( 'cfpf_register_client' ) ) {
	/**
	 * Register client with vendor.
	 *
	 * @return string|false Client ID on success, false on failure.
	 */
	function cfpf_register_client() {
		if ( function_exists( 'courseflow_pro_register_client_if_needed' ) ) {
			return courseflow_pro_register_client_if_needed();
		}
		return false;
	}
}

if ( ! function_exists( 'cfpf_sign_payload' ) ) {
	/**
	 * Sign payload with private key.
	 *
	 * @param string $payload_json JSON payload.
	 * @return string|false Signature on success, false on failure.
	 */
	function cfpf_sign_payload( $payload_json ) {
		if ( function_exists( 'courseflow_pro_sign_payload' ) ) {
			return courseflow_pro_sign_payload( $payload_json );
		}
		return false;
	}
}

if ( ! function_exists( 'cfpf_post_signed_with_retry' ) ) {
	/**
	 * Post signed payload to vendor with retry.
	 *
	 * @param string $endpoint Endpoint URL.
	 * @param array  $payload Payload array.
	 * @return array|false Response on success, false on failure.
	 */
	function cfpf_post_signed_with_retry( $endpoint, array $payload ) {
		if ( function_exists( 'courseflow_pro_post_signed_with_retry' ) ) {
			return courseflow_pro_post_signed_with_retry( $endpoint, $payload );
		}
		return false;
	}
}

if ( ! function_exists( 'cfpf_fetch_license_status' ) ) {
	/**
	 * Fetch license status from vendor.
	 *
	 * @return array|false Status array on success, false on failure.
	 */
	function cfpf_fetch_license_status() {
		$site_url = untrailingslashit( home_url( '/' ) );
		$payload  = array(
			'site_url'  => $site_url,
			'timestamp' => time(),
		);

		if ( function_exists( 'courseflow_pro_post_signed_with_retry' ) && defined( 'CFPRO_VENDOR_LICENSE_STATUS_ENDPOINT' ) ) {
			$res = courseflow_pro_post_signed_with_retry( CFPRO_VENDOR_LICENSE_STATUS_ENDPOINT, $payload );

			if ( ! is_array( $res ) || empty( $res['success'] ) ) {
				return false;
			}

			return array(
				'active'          => ! empty( $res['active'] ),
				'expires_at'      => ! empty( $res['expires_at'] ) ? (string) $res['expires_at'] : '',
				'subscription_id' => ! empty( $res['subscription_id'] ) ? (string) $res['subscription_id'] : '',
				'customer_email'  => ! empty( $res['customer_email'] ) ? (string) $res['customer_email'] : '',
				'message'         => ! empty( $res['message'] ) ? (string) $res['message'] : '',
			);
		}

		return false;
	}
}

if ( ! function_exists( 'cfpf_request_download_token' ) ) {
	/**
	 * Request download token from vendor.
	 *
	 * @return array|false Token data on success, false on failure.
	 */
	function cfpf_request_download_token() {
		$site_url = untrailingslashit( home_url( '/' ) );
		$payload  = array(
			'site_url'  => $site_url,
			'timestamp' => time(),
		);

		if ( function_exists( 'courseflow_pro_post_signed_with_retry' ) && defined( 'CFPRO_VENDOR_CREATE_DOWNLOAD_ENDPOINT' ) ) {
			$res = courseflow_pro_post_signed_with_retry( CFPRO_VENDOR_CREATE_DOWNLOAD_ENDPOINT, $payload );

			if ( ! is_array( $res ) || empty( $res['success'] ) ) {
				return false;
			}

			if ( ! empty( $res['token'] ) ) {
				update_option( CFPRO_OPTION_DOWNLOAD_TOKEN, sanitize_text_field( $res['token'] ) );
				update_option( CFPRO_OPTION_DOWNLOAD_TOKEN_TIME, gmdate( 'Y-m-d H:i:s' ) );
			}

			return $res;
		}

		return false;
	}
}

/* ====================================================================
 * AJAX ENDPOINTS
 * ==================================================================== */

/**
 * AJAX endpoint for polling license status.
 *
 * @since 2.1.0
 * @return void
 */
function courseflow_pro_ajax_poll_status() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_send_json_error( array( 'message' => __( 'Access denied.', 'course-flow' ) ), 403 );
	}

	check_ajax_referer( 'courseflow_pro_ajax', 'nonce' );

	$pending = function_exists( 'courseflow_pro_is_activation_pending' ) ? courseflow_pro_is_activation_pending() : false;

	// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log
	error_log( '[CourseFlow PRO] ajax_poll: user=' . get_current_user_id() . ' pending=' . ( $pending ? '1' : '0' ) );

	delete_transient( 'courseflow_pro_cached_status' );

	$status = false;
	if ( function_exists( 'courseflow_pro_get_status_cached' ) ) {
		$status = courseflow_pro_get_status_cached();
	}

	if ( is_array( $status ) ) {
		wp_send_json_success(
			array(
				'active'          => ! empty( $status['active'] ),
				'expires_at'      => isset( $status['expires_at'] ) ? (string) $status['expires_at'] : '',
				'subscription_id' => isset( $status['subscription_id'] ) ? (string) $status['subscription_id'] : '',
				'customer_email'  => isset( $status['customer_email'] ) ? (string) $status['customer_email'] : '',
				'message'         => isset( $status['message'] ) ? (string) $status['message'] : '',
				'pending'         => $pending,
			)
		);
	}

	wp_send_json_error( array( 'message' => __( 'Unable to fetch license status.', 'course-flow' ) ), 500 );
}
add_action( 'wp_ajax_courseflow_pro_poll_status', 'courseflow_pro_ajax_poll_status' );

/**
 * AJAX endpoint for debug logging.
 *
 * @since 2.1.0
 * @return void
 */
function courseflow_pro_ajax_debug_ping() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_send_json_error( array( 'message' => __( 'Access denied.', 'course-flow' ) ), 403 );
	}

	check_ajax_referer( 'courseflow_pro_ajax', 'nonce' );

	// phpcs:ignore WordPress.Security.NonceVerification.Missing
	$msg  = isset( $_POST['message'] ) ? sanitize_text_field( wp_unslash( $_POST['message'] ) ) : 'no-message';
	// phpcs:ignore WordPress.Security.NonceVerification.Missing
	$meta = isset( $_POST['meta'] ) ? wp_json_encode( $_POST['meta'] ) : '';

	// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
	$remote = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
	$user   = get_current_user_id();

	// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log
	error_log( '[CourseFlow PRO] debug_ping: user=' . intval( $user ) . ' ip=' . $remote . ' msg=' . $msg . ' meta=' . $meta );

	wp_send_json_success( array( 'logged' => true ) );
}
add_action( 'wp_ajax_courseflow_pro_debug_ping', 'courseflow_pro_ajax_debug_ping' );

/* ====================================================================
 * PAGE RENDER FUNCTION
 * ==================================================================== */

/**
 * Render PRO License page (React container).
 *
 * CRITICAL FIX v6: Added React root container for FREE application.
 *
 * @since 2.1.0
 * @return void
 */
function courseflow_pro_upgrade_page_callback() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( esc_html__( 'Access denied.', 'course-flow' ) );
	}

	// CRITICAL FIX: Prevent browser caching of this page.
	nocache_headers();

	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	$payment_return = isset( $_GET['payment_return'] ) && '1' === $_GET['payment_return'];

	// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log
	error_log( '[CourseFlow PRO] render_upgrade_page: payment_return=' . ( $payment_return ? '1' : '0' ) );

	if ( function_exists( 'courseflow_pro_generate_rsa_keys' ) ) {
		courseflow_pro_generate_rsa_keys();
	}

	?>
	<div class="wrap courseflow-pro-license-wrapper">
		<h1><?php echo esc_html( '', 'course-flow' ); ?></h1>

		<?php if ( $payment_return ) : ?>
			<div class="notice notice-success" id="courseflow-payment-return-notice" style="position: relative;">
				<p>
					<strong><?php esc_html_e( 'Payment successful!', 'course-flow' ); ?></strong>
					<?php esc_html_e( 'Activating your PRO license...', 'course-flow' ); ?>
					<span class="spinner is-active" style="float: none; margin: 0 0 0 10px;"></span>
				</p>
			</div>
		<?php endif; ?>

		<!-- ================================================ -->
		<!-- CRITICAL FIX: React root container for FREE app -->
		<!-- ================================================ -->
		<div id="courseflow-admin-root"></div>

		<!-- Legacy comment – kept for reference -->
		<!-- React root will be injected by react-app-loader.php (deprecated) -->
	</div>
	<?php
}

/* ====================================================================
 * ENQUEUE SCRIPTS & LOCALIZATION - CRITICAL FIX v4
 * ==================================================================== */

/**
 * Enqueue JavaScript for PRO License page.
 *
 * CRITICAL FIX v4: ALWAYS pass current license status to React.
 * This ensures React has correct data on every page load, including
 * when user returns from Settings page.
 *
 * @since 2.1.0
 * @param string $hook_suffix The current admin page hook suffix.
 * @return void
 */
function courseflow_pro_admin_enqueue_script( $hook_suffix ) {
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	$page = isset( $_GET['page'] ) ? sanitize_text_field( wp_unslash( $_GET['page'] ) ) : '';

	if ( 'courseflow-pro-upgrade' !== $page && false === strpos( (string) $hook_suffix, 'courseflow' ) ) {
		return;
	}

	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	$payment_return = isset( $_GET['payment_return'] ) && '1' === $_GET['payment_return'];

	// CRITICAL FIX: Get current license status from persistent storage.
	$license_status = array(
		'active'          => false,
		'expires_at'      => '',
		'subscription_id' => '',
		'customer_email'  => '',
		'message'         => '',
	);

	if ( function_exists( 'courseflow_pro_get_status_cached' ) ) {
		$status = courseflow_pro_get_status_cached();
		if ( is_array( $status ) ) {
			$license_status = array(
				'active'          => ! empty( $status['active'] ),
				'expires_at'      => isset( $status['expires_at'] ) ? (string) $status['expires_at'] : '',
				'subscription_id' => isset( $status['subscription_id'] ) ? (string) $status['subscription_id'] : '',
				'customer_email'  => isset( $status['customer_email'] ) ? (string) $status['customer_email'] : '',
				'message'         => isset( $status['message'] ) ? (string) $status['message'] : '',
			);
		}
	}

	// Log what we're passing to React for debugging.
	if ( function_exists( 'courseflow_pro_debug' ) ) {
		courseflow_pro_debug(
			'ENQUEUE SCRIPT: Passing license status to React',
			array(
				'active'         => $license_status['active'],
				'payment_return' => $payment_return,
			)
		);
	}

	// Pass data to React via wp_localize_script.
	wp_localize_script(
		'courseflow-admin',
		'courseflowProUpgrade',
		array(
			'restUrl'         => esc_url_raw( rest_url( 'course-flow/v1' ) ),
			'nonce'           => wp_create_nonce( 'wp_rest' ),
			'ajaxUrl'         => esc_url_raw( admin_url( 'admin-ajax.php' ) ),
			'ajaxNonce'       => wp_create_nonce( 'courseflow_pro_ajax' ),
			'paymentReturn'   => $payment_return,
			'pollIntervalMs'  => 500,
			'pollMaxAttempts' => 120,
			'licenseStatus'   => $license_status, // â† CRITICAL FIX: Pass license status!
			'dataVersion'     => time(), // â† CACHE BUSTER: Force React to see fresh data!
			'pageLoadTime'    => microtime( true ), // â† Additional timestamp for debugging
		)
	);

	// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log
	error_log( '[CourseFlow PRO] enqueue_script: payment_return=' . ( $payment_return ? '1' : '0' ) . ' active=' . ( $license_status['active'] ? '1' : '0' ) );
}
add_action( 'admin_enqueue_scripts', 'courseflow_pro_admin_enqueue_script' );

/**
 * Add custom CSS to fix WordPress default padding on PRO License page.
 * 
 * WordPress applies padding-bottom: 65px to #wpbody-content by default.
 * This creates unwanted spacing that pushes content down.
 * We need to remove it ONLY on the PRO License page.
 * 
 * @since 2.1.5
 * @return void
 */
function courseflow_pro_add_page_styles() {
	$screen = get_current_screen();
	
	// Only apply on PRO License page.
	if ( null === $screen || 'course-flow_page_courseflow-pro-upgrade' !== $screen->id ) {
		return;
	}
	
	?>
	<style id="courseflow-pro-page-fix">
		/*
		 * Remove WordPress default padding-bottom on PRO License page.
		 * WordPress adds padding-bottom: 65px to #wpbody-content by default.
		 */
		.course-flow_page_courseflow-pro-upgrade #wpbody-content {
			padding-bottom: 0 !important;
		}
	</style>
	<?php
}
add_action( 'admin_head', 'courseflow_pro_add_page_styles' );

/* ====================================================================
 * MANDATORY REFRESH SCRIPT
 * ALWAYS triggers React refresh when payment_return=1
 * ==================================================================== */

/**
 * Add mandatory React refresh script for payment returns.
 *
 * This script ALWAYS runs when payment_return=1 is detected.
 * It will:
 * 1. Immediately call REST API to check license status
 * 2. Start aggressive polling (500ms) if not active yet
 * 3. Force React to refresh by clicking "Refresh Status" button
 * 4. Clean URL after successful activation
 *
 * @since 2.3.0
 * @return void
 */
function courseflow_pro_add_mandatory_refresh_script() {
	$screen = get_current_screen();
	if ( null === $screen || 'course-flow_page_courseflow-pro-upgrade' !== $screen->id ) {
		return;
	}

	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	$payment_return = isset( $_GET['payment_return'] ) && '1' === $_GET['payment_return'];

	if ( ! $payment_return ) {
		return;
	}

	$rest_url   = rest_url( 'course-flow/v1/pro-refresh-status' );
	$nonce      = wp_create_nonce( 'wp_rest' );
	$ajax_nonce = wp_create_nonce( 'courseflow_pro_ajax' );

	?>
	<script type="text/javascript">
	(function() {
		'use strict';

		console.log('[CourseFlow PRO] ================================================');
		console.log('[CourseFlow PRO] ADVANCED REFRESH SCRIPT v3.0 LOADED');
		console.log('[CourseFlow PRO] Payment return detected - forcing React refresh');
		console.log('[CourseFlow PRO] ================================================');

		var pollAttempts = 0;
		var maxAttempts = 120;
		var pollInterval = 500;
		var isActive = false;
		var refreshButtonClicked = false;

		// STEP 1: Immediate status check
		function immediateStatusCheck() {
			console.log('[CourseFlow PRO] STEP 1: Immediate status check via REST API');

			fetch('<?php echo esc_url_raw( $rest_url ); ?>', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-WP-Nonce': '<?php echo esc_js( $nonce ); ?>'
				},
				credentials: 'same-origin'
			})
			.then(function(response) { return response.json(); })
			.then(function(data) {
				console.log('[CourseFlow PRO] Immediate check response:', data);

				if (data && data.success && data.active) {
					console.log('[CourseFlow PRO] âœ“ License ALREADY ACTIVE!');
					isActive = true;
					forceReactRefresh();
				} else {
					console.log('[CourseFlow PRO] License not active yet, starting polling...');
				}
			})
			.catch(function(error) {
				console.error('[CourseFlow PRO] Immediate check error:', error);
			});
		}

		// STEP 2: Aggressive polling
		function startAggressivePolling() {
			console.log('[CourseFlow PRO] STEP 2: Starting aggressive polling (500ms interval)');

			var intervalId = setInterval(function() {
				if (isActive) {
					clearInterval(intervalId);
					return;
				}

				pollAttempts++;
				console.log('[CourseFlow PRO] Poll attempt ' + pollAttempts + '/' + maxAttempts);

				var formData = new FormData();
				formData.append('action', 'courseflow_pro_poll_status');
				formData.append('nonce', '<?php echo esc_js( $ajax_nonce ); ?>');

				fetch(ajaxurl, {
					method: 'POST',
					body: formData,
					credentials: 'same-origin'
				})
				.then(function(response) { return response.json(); })
				.then(function(data) {
					if (data && data.success && data.data && data.data.active) {
						console.log('[CourseFlow PRO] âœ“ License ACTIVE on poll #' + pollAttempts);
						isActive = true;
						clearInterval(intervalId);
						forceReactRefresh();
					} else if (pollAttempts >= maxAttempts) {
						console.log('[CourseFlow PRO] Max polling attempts reached');
						clearInterval(intervalId);
						showManualRefreshPrompt();
					}
				})
				.catch(function(error) {
					console.error('[CourseFlow PRO] Poll error:', error);
					if (pollAttempts >= maxAttempts) {
						clearInterval(intervalId);
						showManualRefreshPrompt();
					}
				});

			}, pollInterval);
		}

		// STEP 3: Advanced button finding with multiple strategies
		function forceReactRefresh() {
			if (refreshButtonClicked) {
				console.log('[CourseFlow PRO] Refresh already triggered');
				return;
			}

			console.log('[CourseFlow PRO] STEP 3: Advanced React refresh strategy');

			var attempts = 0;
			var maxButtonAttempts = 30;

			var buttonInterval = setInterval(function() {
				attempts++;
				console.log('[CourseFlow PRO] Button search attempt ' + attempts + '/' + maxButtonAttempts);

				// STRATEGY 1: Find by specific class combination
				var btn = findRefreshButtonByClass();
				if (btn) {
					console.log('[CourseFlow PRO] âœ“ Found button via CLASS strategy');
					triggerButtonClick(btn);
					clearInterval(buttonInterval);
					return;
				}

				// STRATEGY 2: Find by text content
				btn = findRefreshButtonByText();
				if (btn) {
					console.log('[CourseFlow PRO] âœ“ Found button via TEXT strategy');
					triggerButtonClick(btn);
					clearInterval(buttonInterval);
					return;
				}

				// STRATEGY 3: Find by SVG pattern
				btn = findRefreshButtonBySVG();
				if (btn) {
					console.log('[CourseFlow PRO] âœ“ Found button via SVG strategy');
					triggerButtonClick(btn);
					clearInterval(buttonInterval);
					return;
				}

				if (attempts >= maxButtonAttempts) {
					console.log('[CourseFlow PRO] âš  Button not found after ' + maxButtonAttempts + ' attempts');
					console.log('[CourseFlow PRO] Using fallback reload strategy...');
					clearInterval(buttonInterval);
					cleanUrlAndReload();
				}

			}, 200);
		}

		// Strategy 1: Find by class name
		function findRefreshButtonByClass() {
			var buttons = document.querySelectorAll('button.courseflow-btn.courseflow-btn-secondary');
			
			for (var i = 0; i < buttons.length; i++) {
				var btn = buttons[i];
				var span = btn.querySelector('span');
				
				if (span && span.textContent.trim().toLowerCase().indexOf('refresh') !== -1) {
					console.log('[CourseFlow PRO]   Class match: courseflow-btn-secondary with "refresh" text');
					return btn;
				}
			}
			
			return null;
		}

		// Strategy 2: Find by text content
		function findRefreshButtonByText() {
			var buttons = document.querySelectorAll('button');
			
			for (var i = 0; i < buttons.length; i++) {
				var btn = buttons[i];
				var text = btn.textContent || btn.innerText || '';
				
				if (text.toLowerCase().indexOf('refresh status') !== -1) {
					console.log('[CourseFlow PRO]   Text match: "Refresh Status"');
					return btn;
				}
			}
			
			return null;
		}

		// Strategy 3: Find by SVG refresh icon
		function findRefreshButtonBySVG() {
			var buttons = document.querySelectorAll('button');
			
			for (var i = 0; i < buttons.length; i++) {
				var btn = buttons[i];
				var svg = btn.querySelector('svg');
				
				if (svg) {
					var polylines = svg.querySelectorAll('polyline');
					if (polylines.length >= 2) {
						var span = btn.querySelector('span');
						if (span && span.textContent.trim().toLowerCase().indexOf('refresh') !== -1) {
							console.log('[CourseFlow PRO]   SVG match: polylines + refresh text');
							return btn;
						}
					}
				}
			}
			
			return null;
		}

		// Trigger button click with full React event simulation
		function triggerButtonClick(button) {
			console.log('[CourseFlow PRO] Triggering button click with full event simulation');
			console.log('[CourseFlow PRO] Button HTML:', button.outerHTML.substring(0, 200));
			
			refreshButtonClicked = true;

			button.focus();
			console.log('[CourseFlow PRO]   1. Focused button');

			var mousedownEvent = new MouseEvent('mousedown', {
				view: window,
				bubbles: true,
				cancelable: true,
				buttons: 1
			});
			button.dispatchEvent(mousedownEvent);
			console.log('[CourseFlow PRO]   2. Dispatched mousedown');

			var mouseupEvent = new MouseEvent('mouseup', {
				view: window,
				bubbles: true,
				cancelable: true,
				buttons: 1
			});
			button.dispatchEvent(mouseupEvent);
			console.log('[CourseFlow PRO]   3. Dispatched mouseup');

			var clickEvent = new MouseEvent('click', {
				view: window,
				bubbles: true,
				cancelable: true,
				buttons: 1
			});
			button.dispatchEvent(clickEvent);
			console.log('[CourseFlow PRO]   4. Dispatched click');

			setTimeout(function() {
				button.click();
				console.log('[CourseFlow PRO]   5. Called native click()');
			}, 50);

			if (typeof button._reactProps !== 'undefined') {
				console.log('[CourseFlow PRO]   6. React props detected');
			}

			console.log('[CourseFlow PRO] âœ“ All click events dispatched successfully');

			setTimeout(cleanUrlOnly, 2000);
		}

		// Clean URL without reload
		function cleanUrlOnly() {
			console.log('[CourseFlow PRO] Cleaning URL without page reload...');

			var notice = document.getElementById('courseflow-payment-return-notice');
			if (notice) {
				notice.className = 'notice notice-success';
				notice.innerHTML = '<p><strong>Success!</strong> Your PRO license is active.</p>';
				
				setTimeout(function() {
					notice.style.transition = 'opacity 0.5s';
					notice.style.opacity = '0';
					setTimeout(function() {
						notice.style.display = 'none';
					}, 500);
				}, 3000);
			}

			var cleanUrl = window.location.pathname + '?page=courseflow-pro-upgrade';
			
			console.log('[CourseFlow PRO] Cleaning URL to:', cleanUrl);
			
			if (window.history && window.history.replaceState) {
				window.history.replaceState({}, document.title, cleanUrl);
				console.log('[CourseFlow PRO] âœ“ URL cleaned successfully');
			}

			console.log('[CourseFlow PRO] ================================================');
			console.log('[CourseFlow PRO] SUCCESS: License active and view updated!');
			console.log('[CourseFlow PRO] ================================================');
		}

		// Clean URL and reload
		function cleanUrlAndReload() {
			console.log('[CourseFlow PRO] Cleaning URL and reloading page...');
			window.location.href = window.location.pathname + '?page=courseflow-pro-upgrade';
		}

		// Show manual refresh prompt
		function showManualRefreshPrompt() {
			console.log('[CourseFlow PRO] Showing manual refresh prompt');

			var notice = document.getElementById('courseflow-payment-return-notice');
			if (notice) {
				notice.className = 'notice notice-warning';
				notice.innerHTML = '<p><strong>License activation is taking longer than expected.</strong> ' +
					'Please click the "Refresh Status" button manually, or ' +
					'<button type="button" class="button button-primary" onclick="location.reload()">Reload Page</button></p>';
			}
		}

		// EXECUTE
		console.log('[CourseFlow PRO] Starting activation process...');

		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', function() {
				console.log('[CourseFlow PRO] DOM ready, executing...');
				immediateStatusCheck();
				startAggressivePolling();
			});
		} else {
			console.log('[CourseFlow PRO] DOM already ready, executing...');
			immediateStatusCheck();
			startAggressivePolling();
		}

	})();
	</script>
	<?php
}
add_action( 'admin_footer', 'courseflow_pro_add_mandatory_refresh_script' );

/* ====================================================================
 * REST API ENDPOINTS REGISTRATION
 * ==================================================================== */

/**
 * Register REST API endpoints for PRO License.
 *
 * @since 2.1.0
 * @return void
 */
function courseflow_pro_register_rest_endpoints() {
	cfpro_debug_log( 'Admin page: Checking REST API endpoint registration...' );

	// Get existing routes to check if endpoints already exist.
	$routes = rest_get_server()->get_routes( 'course-flow/v1' );

	// Register pro-download endpoint if not exists.
	if ( ! isset( $routes['/course-flow/v1/pro-download'] ) ) {
		register_rest_route(
			'course-flow/v1',
			'/pro-download',
			array(
				'methods'             => 'POST',
				'callback'            => 'courseflow_pro_rest_download',
				'permission_callback' => function () {
					return current_user_can( 'manage_options' );
				},
			)
		);
	}

	// Register pro-request-token endpoint if not exists.
	if ( ! isset( $routes['/course-flow/v1/pro-request-token'] ) ) {
		register_rest_route(
			'course-flow/v1',
			'/pro-request-token',
			array(
				'methods'             => 'POST',
				'callback'            => 'courseflow_pro_rest_request_token',
				'permission_callback' => function () {
					return current_user_can( 'manage_options' );
				},
			)
		);
	}

	cfpro_debug_log( 'Admin page: REST API endpoint registration check complete.' );
}
add_action( 'rest_api_init', 'courseflow_pro_register_rest_endpoints', 20 );

/**
 * REST endpoint: Initiate PRO plugin download.
 *
 * @since 2.1.0
 * @param WP_REST_Request $request REST request object.
 * @return WP_REST_Response Response with download info or error.
 */
function courseflow_pro_rest_download( WP_REST_Request $request ) {
	// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log
	error_log( '[CourseFlow PRO] rest_download: user=' . get_current_user_id() );

	$token         = get_option( CFPRO_OPTION_DOWNLOAD_TOKEN, '' );
	$token_time    = get_option( CFPRO_OPTION_DOWNLOAD_TOKEN_TIME, '' );
	$hours_elapsed = 0;

	if ( $token_time ) {
		$ts = strtotime( $token_time );
		if ( false !== $ts ) {
			$hours_elapsed = ( time() - $ts ) / HOUR_IN_SECONDS;
		}
	}

	// Request new token if none exists or if older than 48 hours.
	if ( empty( $token ) || $hours_elapsed >= 48 ) {
		$token_response = cfpf_request_download_token();

		if ( ! is_array( $token_response ) || empty( $token_response['success'] ) || empty( $token_response['token'] ) ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log
			error_log( '[CourseFlow PRO] rest_download: failed to create token: ' . wp_json_encode( $token_response ) );
			return new WP_REST_Response(
				array(
					'success' => false,
					'message' => __( 'Unable to create download token. Please try again.', 'course-flow' ),
				),
				500
			);
		}

		$token = sanitize_text_field( $token_response['token'] );
	}

	// Mark activation as pending during download.
	if ( function_exists( 'courseflow_pro_mark_activation_pending' ) ) {
		courseflow_pro_mark_activation_pending( 600 );
	}
	delete_transient( 'courseflow_pro_cached_status' );

	$download_url = CFPRO_VENDOR_DOWNLOAD_URL . '?token=' . rawurlencode( $token );
	$download_url = esc_url_raw( $download_url );

	return new WP_REST_Response(
		array(
			'success'      => true,
			'redirect_url' => $download_url,
			'message'      => __( 'Download initiated.', 'course-flow' ),
		),
		200
	);
}

/**
 * REST endpoint: Request download token generation.
 *
 * @since 2.1.0
 * @param WP_REST_Request $request REST request object.
 * @return WP_REST_Response Response with success status or error.
 */
function courseflow_pro_rest_request_token( WP_REST_Request $request ) {
	// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log
	error_log( '[CourseFlow PRO] rest_request_token: user=' . get_current_user_id() );

	$response = cfpf_request_download_token();

	if ( ! is_array( $response ) || empty( $response['success'] ) ) {
		// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log
		error_log( '[CourseFlow PRO] rest_request_token: failed: ' . wp_json_encode( $response ) );
		return new WP_REST_Response(
			array(
				'success' => false,
				'message' => isset( $response['message'] ) ? $response['message'] : __( 'Failed to create download token.', 'course-flow' ),
			),
			500
		);
	}

	delete_transient( 'courseflow_pro_cached_status' );

	return new WP_REST_Response(
		array(
			'success' => true,
			'message' => __( 'Download token created successfully.', 'course-flow' ),
		),
		200
	);
}

/**
 * Auto-click "Refresh Status" button on page load - SILENT VERSION.
 *
 * ENHANCEMENT: Suppresses toast notifications during automatic refresh.
 * Toast only appears when user manually clicks the button.
 *
 * @since 2.4.3
 * @return void
 */
function courseflow_pro_auto_refresh_on_load() {
	$screen = get_current_screen();
	if ( null === $screen || 'course-flow_page_courseflow-pro-upgrade' !== $screen->id ) {
		return;
	}

	?>
	<script type="text/javascript">
	(function() {
		'use strict';
		
		console.log('[CourseFlow PRO Auto-Refresh] Initializing silent mode...');
		
		/**
		 * Temporarily suppress toast notifications.
		 */
		function suppressToasts() {
			console.log('[CourseFlow PRO Auto-Refresh] Suppressing toast notifications...');
			
			// Flag to prevent toast from showing
			window._courseflowAutoRefreshInProgress = true;
			
			// Remove flag after 3 seconds (safety timeout)
			setTimeout(function() {
				delete window._courseflowAutoRefreshInProgress;
				console.log('[CourseFlow PRO Auto-Refresh] Toast suppression ended');
			}, 3000);
		}
		
		/**
		 * CRITICAL: Clear WordPress cache BEFORE checking status.
		 * This ensures we get fresh data from vendor, not stale cache.
		 */
		function clearCacheAndRefresh() {
			console.log('[CourseFlow PRO Auto-Refresh] Step 1: Clearing cache...');
			
			// Get REST URL and nonce from localized data
			var restUrl = '';
			var restNonce = '';
			
			if (window.courseflowProUpgrade) {
				restUrl = window.courseflowProUpgrade.restUrl + '/pro-refresh-status';
				restNonce = window.courseflowProUpgrade.nonce;
			} else if (window.courseflowAppData) {
				restUrl = window.courseflowAppData.apiUrl + '/pro-refresh-status';
				restNonce = window.courseflowAppData.nonce;
			}
			
			if (restUrl && restNonce) {
				console.log('[CourseFlow PRO Auto-Refresh] Calling REST API to clear cache...');
				
				// CRITICAL: Suppress toasts BEFORE making the request
				suppressToasts();
				
				fetch(restUrl, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'X-WP-Nonce': restNonce
					},
					credentials: 'same-origin'
				})
				.then(function(response) { return response.json(); })
				.then(function(data) {
					console.log('[CourseFlow PRO Auto-Refresh] Cache cleared, fresh data:', data);
					
					// Wait a moment for React to process, then click button silently
					setTimeout(function() {
						findAndClickRefreshButton();
					}, 200);
				})
				.catch(function(error) {
					console.error('[CourseFlow PRO Auto-Refresh] Cache clear error:', error);
					// Still try to click button even if cache clear failed
					setTimeout(function() {
						findAndClickRefreshButton();
					}, 200);
				});
			} else {
				console.warn('[CourseFlow PRO Auto-Refresh] No REST URL found, skipping cache clear');
				// Still try to click button
				suppressToasts();
				setTimeout(function() {
					findAndClickRefreshButton();
				}, 200);
			}
		}
		
		/**
		 * Find and click the "Refresh Status" button.
		 */
		function findAndClickRefreshButton() {
			console.log('[CourseFlow PRO Auto-Refresh] Step 2: Finding Refresh button...');
			
			// Strategy 1: Find by button text
			var buttons = document.querySelectorAll('button');
			for (var i = 0; i < buttons.length; i++) {
				var btn = buttons[i];
				var text = btn.textContent || btn.innerText || '';
				
				if (text.toLowerCase().indexOf('refresh status') !== -1) {
					console.log('[CourseFlow PRO Auto-Refresh] âœ“ Found "Refresh Status" button (text strategy)');
					clickButtonSilently(btn);
					return true;
				}
			}
			
			// Strategy 2: Find by class combination
			var secondaryButtons = document.querySelectorAll('.courseflow-btn.courseflow-btn-secondary');
			for (var j = 0; j < secondaryButtons.length; j++) {
				var secBtn = secondaryButtons[j];
				var span = secBtn.querySelector('span');
				
				if (span && span.textContent.toLowerCase().indexOf('refresh') !== -1) {
					console.log('[CourseFlow PRO Auto-Refresh] âœ“ Found button (class strategy)');
					clickButtonSilently(secBtn);
					return true;
				}
			}
			
			// Strategy 3: Find by SVG pattern (refresh icon with 2 polylines)
			var allButtons = document.querySelectorAll('button');
			for (var k = 0; k < allButtons.length; k++) {
				var svgBtn = allButtons[k];
				var svg = svgBtn.querySelector('svg');
				
				if (svg) {
					var polylines = svg.querySelectorAll('polyline');
					if (polylines.length === 2) {
						var span = svgBtn.querySelector('span');
						if (span && span.textContent.toLowerCase().indexOf('refresh') !== -1) {
							console.log('[CourseFlow PRO Auto-Refresh] âœ“ Found button (SVG strategy)');
							clickButtonSilently(svgBtn);
							return true;
						}
					}
				}
			}
			
			console.warn('[CourseFlow PRO Auto-Refresh] âš  Refresh button not found');
			// Remove suppression flag if button not found
			delete window._courseflowAutoRefreshInProgress;
			return false;
		}
		
		/**
		 * Click button with full event simulation (silently - no toast).
		 */
		function clickButtonSilently(button) {
			console.log('[CourseFlow PRO Auto-Refresh] Clicking button silently (toast suppressed)...');
			
			// Ensure toast suppression is active
			window._courseflowAutoRefreshInProgress = true;
			
			// Focus button
			button.focus();
			
			// Dispatch mousedown
			var mousedownEvent = new MouseEvent('mousedown', {
				view: window,
				bubbles: true,
				cancelable: true,
				buttons: 1
			});
			button.dispatchEvent(mousedownEvent);
			
			// Dispatch mouseup
			var mouseupEvent = new MouseEvent('mouseup', {
				view: window,
				bubbles: true,
				cancelable: true,
				buttons: 1
			});
			button.dispatchEvent(mouseupEvent);
			
			// Dispatch click
			var clickEvent = new MouseEvent('click', {
				view: window,
				bubbles: true,
				cancelable: true,
				buttons: 1
			});
			button.dispatchEvent(clickEvent);
			
			// Also call native click
			button.click();
			
			console.log('[CourseFlow PRO Auto-Refresh] âœ“ Button clicked silently (no toast will appear)');
			
			// Remove suppression flag after a delay
			setTimeout(function() {
				delete window._courseflowAutoRefreshInProgress;
				console.log('[CourseFlow PRO Auto-Refresh] Toast suppression ended, normal operation resumed');
			}, 2000);
		}
		
		/**
		 * Try to find and click the button with retries.
		 */
		function tryClickWithRetries() {
			var attempts = 0;
			var maxAttempts = 50; // 50 attempts Ã— 100ms = 5 seconds max
			
			var intervalId = setInterval(function() {
				attempts++;
				
				// Check if React root exists and has content
				var root = document.getElementById('courseflow-admin-root');
				if (!root || !root.innerHTML || root.innerHTML.trim() === '') {
					if (attempts >= maxAttempts) {
						console.warn('[CourseFlow PRO Auto-Refresh] âš  React root empty after ' + maxAttempts + ' attempts');
						clearInterval(intervalId);
					}
					return;
				}
				
				// Check if we can find the button
				var buttons = document.querySelectorAll('button');
				var foundAnyButton = false;
				
				for (var i = 0; i < buttons.length; i++) {
					var text = buttons[i].textContent || buttons[i].innerText || '';
					if (text.toLowerCase().indexOf('refresh') !== -1) {
						foundAnyButton = true;
						break;
					}
				}
				
				if (foundAnyButton) {
					console.log('[CourseFlow PRO Auto-Refresh] Found buttons after ' + attempts + ' attempts');
					clearInterval(intervalId);
					
					// CRITICAL: Clear cache BEFORE clicking
					clearCacheAndRefresh();
				} else if (attempts >= maxAttempts) {
					console.warn('[CourseFlow PRO Auto-Refresh] âš  Button not found after ' + maxAttempts + ' attempts');
					clearInterval(intervalId);
				}
				
			}, 100); // Check every 100ms
		}
		
		/**
		 * Initialize auto-click.
		 */
		function init() {
			// Wait for DOM to be ready
			if (document.readyState === 'loading') {
				document.addEventListener('DOMContentLoaded', function() {
					console.log('[CourseFlow PRO Auto-Refresh] DOM ready, starting silent refresh...');
					tryClickWithRetries();
				});
			} else {
				console.log('[CourseFlow PRO Auto-Refresh] DOM already ready, starting silent refresh...');
				tryClickWithRetries();
			}
		}
		
		// Start
		init();
		
	})();
	</script>
	<?php
}
add_action( 'admin_footer', 'courseflow_pro_auto_refresh_on_load', 100 );
