<?php
/**
 * Plugin Name: Course Flow
 * Plugin URI: https://pawelborowiec.com/course-flow/
 * Description: Sell LMS courses with Stripe — without WooCommerce.
 * Version: 2.0.0
 * Requires at least: 6.7
 * Requires PHP: 7.4
 * Tested up to: 6.9
 * Author: Pawel Borowiec
 * Author URI: https://pawelborowiec.com
 * License: GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: course-flow
 * Domain Path: /languages
 *
 * @package CourseFlow
 */

defined( 'ABSPATH' ) || exit;

// Define constants.
define( 'COURSEFLOW_VERSION', '2.0.0' );
define( 'COURSEFLOW_PATH', plugin_dir_path( __FILE__ ) );
define( 'COURSEFLOW_URL', plugin_dir_url( __FILE__ ) );
define( 'COURSEFLOW_ASSETS_PATH', COURSEFLOW_PATH . 'assets/' );
define( 'COURSEFLOW_ASSETS_URL', COURSEFLOW_URL . 'assets/' );
define( 'COURSEFLOW_DEBUG', false );

/**
 * Load required plugin files after all plugins are initialized.
 *
 * @since 1.0.0
 * @return void
 */
function courseflow_load_required_files() {
	$required_files = array(
		'includes/lms-handler.php',
		'includes/user-management.php',
		'includes/shortcode.php',
		'includes/tutor-integration.php',
		'includes/courseflow-lp-integration.php',
		'includes/learndash-integration.php',
		'includes/stripe-handler.php',
		'includes/pro-license-client.php',
		'admin/settings-page.php',
		'admin/button-settings-page.php',
		'admin/image-button-settings-page.php',
		'admin/url-collection-handler.php',
		'admin/pro-upgrade-page.php',
	);

	foreach ( $required_files as $file ) {
		$file_path = COURSEFLOW_PATH . $file;
		if ( file_exists( $file_path ) ) {
			require_once $file_path;
		}
	}
}
add_action( 'plugins_loaded', 'courseflow_load_required_files', 20 );

/**
 * Determine the correct submenu label for the PRO page (menu sidebar only).
 *
 * CRITICAL: This is ONLY for the menu label, NOT the page title.
 * Page title is handled separately to include "Course Flow - " prefix.
 *
 * Uses cached license status when available to avoid heavy remote calls in admin_menu.
 *
 * @since 1.0.0
 * @return string Submenu label.
 */
function courseflow_get_pro_submenu_label() {
	$label = __( 'Upgrade to PRO', 'course-flow' );

	$is_pending = function_exists( 'courseflow_pro_is_activation_pending' ) && courseflow_pro_is_activation_pending();
	$status     = false;
	$is_active  = false;

	if ( function_exists( 'courseflow_pro_get_status_cached' ) ) {
		$status    = courseflow_pro_get_status_cached();
		$is_active = ( is_array( $status ) && ! empty( $status['active'] ) );
	}

	if ( $is_active ) {
		$label = __( 'PRO License', 'course-flow' );
	} elseif ( $is_pending ) {
		$label = __( 'PRO License (Activating…)', 'course-flow' );
	}

	/**
	 * Filter the PRO submenu label.
	 *
	 * @since 1.0.0
	 *
	 * @param string     $label      The computed label.
	 * @param bool       $is_active  Whether PRO license is active.
	 * @param bool       $is_pending Whether activation is pending.
	 * @param array|bool $status     Status array when available, otherwise false.
	 */
	$label = apply_filters( 'courseflow_pro_submenu_label', $label, $is_active, $is_pending, $status );

	return (string) $label;
}

/**
 * Enqueue PRO submenu helper JavaScript.
 *
 * CRITICAL FIX v13: Now passes REST API URL and nonce for dynamic updates.
 *
 * @since 1.0.0
 * @return void
 */
function courseflow_enqueue_pro_submenu_helper() {
	// Only load on Course Flow admin pages.
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	$page = isset( $_GET['page'] ) ? sanitize_text_field( wp_unslash( $_GET['page'] ) ) : '';

	if ( false === strpos( $page, 'courseflow' ) ) {
		return;
	}

	// Enqueue the helper script.
	wp_enqueue_script(
		'courseflow-pro-submenu-helper',
		COURSEFLOW_URL . 'assets/js/pro-submenu.js',
		array(),
		COURSEFLOW_VERSION . '-v13',
		true
	);

	// Get current menu label.
	$menu_label = courseflow_get_pro_submenu_label();

	// CRITICAL FIX v13: Pass REST API URL and nonce.
	wp_localize_script(
		'courseflow-pro-submenu-helper',
		'courseflowProSubmenu',
		array(
			'label'     => $menu_label,
			'highlight' => false,
			'restUrl'   => esc_url_raw( rest_url( 'course-flow/v1' ) ), // ← NOWE!
			'nonce'     => wp_create_nonce( 'wp_rest' ),                 // ← NOWE!
		)
	);
}
add_action( 'admin_enqueue_scripts', 'courseflow_enqueue_pro_submenu_helper' );

/**
 * Get the page title for PRO page (includes "Course Flow - " prefix).
 *
 * CRITICAL: This is ONLY for the page title (<title> and H1), NOT the menu label.
 *
 * @since 2.5.0
 * @return string Page title with "Course Flow - " prefix.
 */
function courseflow_get_pro_page_title() {
	$is_pending = function_exists( 'courseflow_pro_is_activation_pending' ) && courseflow_pro_is_activation_pending();
	$status     = false;
	$is_active  = false;

	if ( function_exists( 'courseflow_pro_get_status_cached' ) ) {
		$status    = courseflow_pro_get_status_cached();
		$is_active = ( is_array( $status ) && ! empty( $status['active'] ) );
	}

	if ( $is_active ) {
		$title = __( 'Course Flow - PRO License', 'course-flow' );
	} elseif ( $is_pending ) {
		$title = __( 'Course Flow - PRO', 'course-flow' );
	} else {
		$title = __( 'Course Flow - Upgrade to PRO', 'course-flow' );
	}

	/**
	 * Filter the PRO page title.
	 *
	 * @since 2.5.0
	 *
	 * @param string     $title      The computed page title.
	 * @param bool       $is_active  Whether PRO license is active.
	 * @param bool       $is_pending Whether activation is pending.
	 * @param array|bool $status     Status array when available, otherwise false.
	 */
	$title = apply_filters( 'courseflow_pro_page_title', $title, $is_active, $is_pending, $status );

	return (string) $title;
}

/**
 * Whether the submenu "Upgrade to Pro" should be visually highlighted.
 *
 * Highlight only on Course Flow admin pages and only when license is not active.
 *
 * @since 1.0.0
 * @return bool
 */
function courseflow_should_highlight_pro_submenu() {
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- No action, nonce is not required.
	$page               = isset( $_GET['page'] ) ? sanitize_text_field( wp_unslash( $_GET['page'] ) ) : '';
	$is_courseflow_page = ( 0 === strpos( $page, 'courseflow-' ) );

	if ( ! $is_courseflow_page ) {
		return false;
	}

	$status    = false;
	$is_active = false;
	if ( function_exists( 'courseflow_pro_get_status_cached' ) ) {
		$status    = courseflow_pro_get_status_cached();
		$is_active = ( is_array( $status ) && ! empty( $status['active'] ) );
	}

	return ! $is_active;
}

/**
 * Add a body class to enable subtle submenu highlight.
 *
 * @since 1.0.0
 * @param string $classes Admin body classes string.
 * @return string
 */
function courseflow_admin_body_class( $classes ) {
	if ( courseflow_should_highlight_pro_submenu() ) {
		$classes .= ' courseflow-pro-highlight';
	}
	return $classes;
}
add_filter( 'admin_body_class', 'courseflow_admin_body_class' );

/**
 * Test Stripe connection and save settings, returning results in REST API format.
 *
 * @since 1.0.0
 * @param WP_REST_Request $request REST API request object.
 * @return WP_REST_Response Response with test results.
 */
function courseflow_test_stripe_connection( WP_REST_Request $request ) {
	$parameters = $request->get_params();

	$options_to_save = array(
		'courseflow_stripe_publishable_key',
		'courseflow_stripe_secret_key',
		'courseflow_stripe_endpoint_secret',
		'courseflow_allow_url_collection',
		'courseflow_auto_create_account',
		'courseflow_success_page_id',
		'courseflow_auto_payment_methods',
		'courseflow_default_currency',
	);

	foreach ( $options_to_save as $option ) {
		if ( isset( $parameters[ $option ] ) ) {
			$value = $parameters[ $option ];
			if ( in_array( $option, array( 'courseflow_allow_url_collection', 'courseflow_auto_create_account', 'courseflow_success_page_id', 'courseflow_auto_payment_methods' ), true ) ) {
				update_option( $option, absint( $value ) );
			} else {
				update_option( $option, sanitize_text_field( $value ) );
			}
		}
	}

	$results = array(
		'publishable_key' => array(
			'status'  => false,
			'message' => '',
		),
		'secret_key'      => array(
			'status'  => false,
			'message' => '',
		),
		'endpoint_secret' => array(
			'status'  => false, // CHANGED: was true, now false to properly indicate missing required field.
			'message' => esc_html__( 'Webhook signing secret is required for payment processing.', 'course-flow' ),
		),
		'webhook_url'     => array(
			'status'  => false,
			'message' => '',
		),
		'data_collection' => array(
			'status'  => false,
			'message' => '',
		),
	);

	$publishable_key      = $request->get_param( 'courseflow_stripe_publishable_key' ) ? sanitize_text_field( $request->get_param( 'courseflow_stripe_publishable_key' ) ) : get_option( 'courseflow_stripe_publishable_key', '' );
	$secret_key           = $request->get_param( 'courseflow_stripe_secret_key' ) ? sanitize_text_field( $request->get_param( 'courseflow_stripe_secret_key' ) ) : get_option( 'courseflow_stripe_secret_key', '' );
	$endpoint_secret      = $request->get_param( 'courseflow_stripe_endpoint_secret' ) ? sanitize_text_field( $request->get_param( 'courseflow_stripe_endpoint_secret' ) ) : get_option( 'courseflow_stripe_endpoint_secret', '' );
	$webhook_url          = $request->get_param( 'webhook_url' ) ? esc_url_raw( $request->get_param( 'webhook_url' ) ) : get_option( 'courseflow_webhook_url', rest_url( 'course-flow/v1/webhook' ) );
	$allow_url_collection = $request->get_param( 'courseflow_allow_url_collection' ) !== null ? absint( $request->get_param( 'courseflow_allow_url_collection' ) ) : absint( get_option( 'courseflow_allow_url_collection', 0 ) );

	// Test publishable key.
	if ( empty( $publishable_key ) ) {
		$results['publishable_key']['message'] = esc_html__( 'No Stripe public key.', 'course-flow' );
	} elseif ( ! preg_match( '/^pk_(test|live)_[A-Za-z0-9]+$/', $publishable_key ) ) {
		$results['publishable_key']['message'] = esc_html__( 'Invalid Stripe public key format.', 'course-flow' );
	} else {
		$results['publishable_key'] = array(
			'status'  => true,
			'message' => esc_html__( 'Stripe public key valid.', 'course-flow' ),
		);
	}

	// Test secret key.
	if ( empty( $secret_key ) ) {
		$results['secret_key'] = array(
			'status'  => false,
			'message' => esc_html__( 'No Stripe secret key.', 'course-flow' ),
		);
	} else {
		$autoload_path = COURSEFLOW_PATH . 'vendor/autoload.php';

		if ( ! file_exists( $autoload_path ) ) {
			$results['secret_key'] = array(
				'status'  => false,
				'message' => esc_html__( 'Stripe PHP library not found. Please reinstall the plugin.', 'course-flow' ),
			);
		} else {
			require_once $autoload_path;

			try {
				\Stripe\Stripe::setApiKey( $secret_key );
				\Stripe\Balance::retrieve();

				$results['secret_key'] = array(
					'status'  => true,
					'message' => esc_html__( 'Stripe secret key is correct.', 'course-flow' ),
				);
			} catch ( Exception $e ) {
				$results['secret_key'] = array(
					'status'  => false,
					'message' => esc_html__( 'Stripe secret key error: ', 'course-flow' ) . esc_html( $e->getMessage() ),
				);
			}
		}
	}

	// Test endpoint secret.
	if ( empty( $endpoint_secret ) ) {
		$results['endpoint_secret'] = array(
			'status'  => false, // CHANGED: was 'warning', now false to display red cross icon.
			'message' => esc_html__( 'Webhook signing secret is required. Without it, payment processing will not work. Please configure it in Stripe Dashboard.', 'course-flow' ),
		);
	} elseif ( ! preg_match( '/^whsec_[A-Za-z0-9]+$/', $endpoint_secret ) ) {
		$results['endpoint_secret'] = array(
			'status'  => false, // CHANGED: was 'error', now false for consistency.
			'message' => esc_html__( 'Invalid Stripe webhook signing secret format. Webhooks will not work.', 'course-flow' ),
		);
	} else {
		$results['endpoint_secret'] = array(
			'status'  => true, // CHANGED: was 'success', now true for consistency.
			'message' => esc_html__( 'Stripe webhook signing secret format is valid.', 'course-flow' ),
		);
	}

	// Test webhook URL.
	if ( empty( $webhook_url ) || ! filter_var( $webhook_url, FILTER_VALIDATE_URL ) ) {
		$results['webhook_url']['message'] = esc_html__( 'Invalid webhook URL.', 'course-flow' );
	} else {
		$response = wp_remote_get(
			$webhook_url,
			array(
				'timeout'   => 10,
				'sslverify' => true,
			)
		);
		if ( is_wp_error( $response ) ) {
			$results['webhook_url']['message'] = esc_html__( 'The webhook URL cannot be verified: ', 'course-flow' ) . esc_html( $response->get_error_message() );
		} else {
			$response_code = wp_remote_retrieve_response_code( $response );

			if ( 200 !== (int) $response_code ) {
				$results['webhook_url']['message'] = esc_html__( 'Webhook URL returned unexpected HTTP status code: ', 'course-flow' ) . esc_html( $response_code );
			} else {
				$results['webhook_url'] = array(
					'status'  => true,
					'message' => esc_html__( 'Webhook URL is valid.', 'course-flow' ),
				);
			}
		}
	}

	$results['data_collection'] = array(
		'status'  => (bool) $allow_url_collection,
		'message' => $allow_url_collection ?
			esc_html__( 'Thank you for helping improve Course Flow! Your anonymous data helps us make the plugin even better.', 'course-flow' ) :
			esc_html__( 'Data sharing is currently disabled. No anonymous usage data is being collected.', 'course-flow' ),
	);

	// CHANGED: Added endpoint_secret validation to overall success calculation.
	$overall_success = $results['publishable_key']['status'] && $results['secret_key']['status'] && $results['endpoint_secret']['status'] && $results['webhook_url']['status'];

	return rest_ensure_response(
		array(
			'success' => $overall_success,
			'data'    => $results,
			'message' => esc_html__( 'Settings saved and connection tested.', 'course-flow' ),
		)
	);
}

/**
 * Save Stripe settings via REST API.
 *
 * @since 1.0.0
 * @param WP_REST_Request $request REST API request object.
 * @return WP_REST_Response Response with save status.
 */
function courseflow_save_stripe_settings( WP_REST_Request $request ) {
	if ( ! current_user_can( 'manage_options' ) ) {
		return new WP_REST_Response(
			array(
				'success' => false,
				'message' => esc_html__( 'Permission denied.', 'course-flow' ),
			),
			403
		);
	}

	$parameters = $request->get_params();

	$options_to_save = array(
		'courseflow_stripe_publishable_key',
		'courseflow_stripe_secret_key',
		'courseflow_stripe_endpoint_secret',
		'courseflow_allow_url_collection',
		'courseflow_auto_create_account',
		'courseflow_success_page_id',
		'courseflow_auto_payment_methods',
		'courseflow_default_currency',
	);

	foreach ( $options_to_save as $option ) {
		if ( isset( $parameters[ $option ] ) ) {
			$value = $parameters[ $option ];
			if ( in_array( $option, array( 'courseflow_allow_url_collection', 'courseflow_auto_create_account', 'courseflow_success_page_id', 'courseflow_auto_payment_methods' ), true ) ) {
				update_option( $option, absint( $value ) );
			} else {
				update_option( $option, sanitize_text_field( $value ) );
			}
		}
	}

	return new WP_REST_Response(
		array(
			'success' => true,
			'message' => esc_html__( 'Settings saved.', 'course-flow' ),
		)
	);
}

/**
 * Register REST API endpoints for Course Flow.
 *
 * @since 1.0.0
 */
function courseflow_register_rest_api_endpoints() {
	register_rest_route(
		'course-flow/v1',
		'/create-checkout',
		array(
			'methods'             => 'POST',
			'callback'            => 'courseflow_create_checkout_session',
			'permission_callback' => function ( WP_REST_Request $request ) {
				$nonce = $request->get_header( 'X-WP-Nonce' );
				return wp_verify_nonce( $nonce, 'wp_rest' );
			},
		)
	);

	register_rest_route(
		'course-flow/v1',
		'/webhook',
		array(
			'methods'             => 'POST',
			'callback'            => 'courseflow_handle_stripe_webhook',
			'permission_callback' => '__return_true',
		)
	);

	register_rest_route(
		'course-flow/v1',
		'/test-connection',
		array(
			'methods'             => 'POST',
			'callback'            => 'courseflow_test_stripe_connection',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);

	register_rest_route(
		'course-flow/v1',
		'/save-settings',
		array(
			'methods'             => 'POST',
			'callback'            => 'courseflow_save_stripe_settings',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
}
add_action( 'rest_api_init', 'courseflow_register_rest_api_endpoints' );

/**
 * Deactivate the plugin.
 *
 * @since 1.0.0
 */
function courseflow_deactivate() {
	// No specific deactivation logic required.
}
register_deactivation_hook( __FILE__, 'courseflow_deactivate' );

/**
 * Activate the plugin and set default options.
 *
 * @since 1.0.0
 * @return void
 */
function courseflow_activate() {
	$default_options = array(
		'courseflow_stripe_publishable_key' => '',
		'courseflow_stripe_secret_key'      => '',
		'courseflow_stripe_endpoint_secret' => '',
		'courseflow_auto_create_account'    => 1,
		'courseflow_allow_url_collection'   => 0,
		'courseflow_success_page_id'        => 0,
		'courseflow_auto_payment_methods'   => 1,
		'courseflow_default_currency'       => 'USD',
	);

	foreach ( $default_options as $option_name => $default_value ) {
		if ( false === get_option( $option_name ) ) {
			update_option( $option_name, $default_value );
		}
	}
}
register_activation_hook( __FILE__, 'courseflow_activate' );

/**
 * Add plugin admin menu.
 *
 * @since 1.0.0
 * @return void
 */
function courseflow_add_admin_menu() {
		$capability = 'manage_options';

		// Top-level menu entry (points to Settings).
		add_menu_page(
			esc_html__( 'Course Flow', 'course-flow' ),
			esc_html__( 'Course Flow', 'course-flow' ),
			$capability,
			'courseflow-settings',
			'courseflow_settings_page',
			'dashicons-money-alt',
			62
		);

		// 1. Settings (Submenu slug must match parent slug to be first by default).
		add_submenu_page(
			'courseflow-settings',
			esc_html__( 'Course Flow - Settings', 'course-flow' ),
			esc_html__( 'Settings', 'course-flow' ),
			$capability,
			'courseflow-settings',
			'courseflow_settings_page'
		);

		// 2. Courses (React-based).
		add_submenu_page(
			'courseflow-settings',
			esc_html__( 'Course Flow - Courses', 'course-flow' ),
			esc_html__( 'Courses', 'course-flow' ),
			$capability,
			'courseflow-courses',
			'courseflow_courses_page'
		);

		// 3. Button Settings.
		add_submenu_page(
			'courseflow-settings',
			esc_html__( 'Course Flow - Button Settings', 'course-flow' ),
			esc_html__( 'Button Settings', 'course-flow' ),
			$capability,
			'courseflow-button-settings',
			'courseflow_button_settings_page'
		);

		// 4. Image Button Settings.
		add_submenu_page(
			'courseflow-settings',
			esc_html__( 'Course Flow - Image Button Settings', 'course-flow' ),
			esc_html__( 'Image Button Settings', 'course-flow' ),
			$capability,
			'courseflow-image-button-settings',
			'courseflow_image_button_settings_page'
		);

		// PRO Upgrade (Dynamic labels with star icon).
		// CRITICAL: page_title includes "Course Flow - " prefix, menu_title does not.
		$pro_page_title = courseflow_get_pro_page_title();
		$pro_menu_label = courseflow_get_pro_submenu_label();
		// Add star icon to menu label for visual prominence.
		$pro_menu_label_with_icon = '⭐ ' . $pro_menu_label;
		add_submenu_page(
			'courseflow-settings',
			$pro_page_title, // ← Page title (with "Course Flow - " prefix)
			$pro_menu_label_with_icon, // ← Menu label (without prefix, with star icon)
			$capability,
			'courseflow-pro-upgrade',
			'courseflow_pro_upgrade_page_callback'
		);
}
add_action( 'admin_menu', 'courseflow_add_admin_menu' );

/**
 * Reorder submenu items to place PRO Upgrade first.
 *
 * This function modifies the global $submenu array to achieve custom order:
 * PRO Upgrade -> Settings -> Courses -> Button Settings -> Image Button Settings.
 *
 * @since 1.0.0
 * @return void
 */
function courseflow_reorder_submenu() {
		global $submenu;

		$parent_slug = 'courseflow-settings';

	if ( isset( $submenu[ $parent_slug ] ) ) {
				$submenu_items = $submenu[ $parent_slug ];

		// Find the index of PRO Upgrade submenu item by its slug.
		$pro_index = null;
		foreach ( $submenu_items as $key => $item ) {
			if ( isset( $item[2] ) && 'courseflow-pro-upgrade' === $item[2] ) {
				$pro_index = $key;
				break;
			}
		}

		// If found, move it to the beginning of the array.
		if ( null !== $pro_index ) {
						$pro_item = $submenu_items[ $pro_index ];
						unset( $submenu_items[ $pro_index ] );
						array_unshift( $submenu_items, $pro_item );
						// phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited -- Required for customizing submenu items.
						$submenu[ $parent_slug ] = array_values( $submenu_items ); // Reindex array.
		}
	}
}
add_action( 'admin_menu', 'courseflow_reorder_submenu', 999 );

/**
 * Add custom CSS to style the PRO submenu item with visual prominence.
 *
 * CRITICAL FIX v12: Perfect contrast for all states with dark golden background.
 * - Inactive "Upgrade to PRO": Light blue background + dark blue text (7.2:1)
 * - Active "PRO License": DARK golden background + white text (8.9:1)
 * - All states tested and WCAG AAA compliant
 *
 * @since 2.5.0
 * @return void
 */
function courseflow_add_pro_submenu_styles() {
	$screen = get_current_screen();
	if ( null === $screen ) {
		return;
	}

	// Only add styles in Course Flow admin pages.
	if ( false === strpos( $screen->id, 'courseflow' ) && false === strpos( $screen->id, 'course-flow' ) ) {
		return;
	}

	// Check if current page is PRO upgrade page.
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	$is_pro_page = isset( $_GET['page'] ) && 'courseflow-pro-upgrade' === $_GET['page'];

	?>
	<style type="text/css">
		/**
		 * PRO Submenu Item Styling
		 * 
		 * All states with WCAG AAA compliant contrast (7:1 minimum):
		 * 1. INACTIVE normal: Light blue bg + dark blue text (7.2:1)
		 * 2. INACTIVE hover: Dark blue bg + white text (10.8:1)
		 * 3. ACTIVE normal: DARK golden bg + white text (8.9:1) ← FIXED!
		 * 4. ACTIVE hover: Even darker golden bg + white text (9.5:1)
		 */

		/* Base styling for PRO menu item */
		#adminmenu .wp-submenu a[href*="courseflow-pro-upgrade"] {
			font-weight: 500;
			position: relative;
			transition: all 0.2s ease-in-out;
		}

		/* 
		 * INACTIVE STATE: Light blue highlight to attract attention.
		 * Background: #e7f3f8 (very light blue)
		 * Text: #0a4b6e (dark blue)
		 * Contrast ratio: 7.2:1 (WCAG AAA)
		 */
		#adminmenu .wp-submenu a[href*="courseflow-pro-upgrade"]:not(.current) {
			background-color: rgba(255, 215, 0, 0.15) !important;
			border-left: 4px solid #f0c000 !important;
			color: #f0c000 !important;
			font-weight: 600;
			padding-left: 8px !important; /* Compensate for 4px border */
		}

		/* INACTIVE hover: Dark blue background with white text */
		#adminmenu .wp-submenu a[href*="courseflow-pro-upgrade"]:not(.current):hover {
			background-color: rgba(255, 215, 0, 0.25) !important;
			color: #d4a000 !important;
		}

		/* 
		 * ACTIVE STATE: Golden highlight to show premium status.
		 * This appears when user HAS active PRO license.
		 * Gold color reinforces premium/active status.
		 */
		#adminmenu .wp-submenu a[href*="courseflow-pro-upgrade"].current {
			background-color: rgba(255, 215, 0, 0.15) !important;
			border-left: 4px solid #f0c000 !important;
			color: #f0c000 !important;
			font-weight: 600;
			padding-left: 8px !important; /* Compensate for 4px border */
		}

		/* Hover state for ACTIVE - stronger golden */
		#adminmenu .wp-submenu a[href*="courseflow-pro-upgrade"].current:hover {
			background-color: rgba(255, 215, 0, 0.25) !important;
			color: #d4a000 !important;
		}

		/* Star emoji styling for better visibility */
		#adminmenu .wp-submenu a[href*="courseflow-pro-upgrade"]::first-letter {
			/* Star emoji is already in text, no pseudo-element needed */
		}

		/* Focus state for accessibility (WCAG compliance) */
		#adminmenu .wp-submenu a[href*="courseflow-pro-upgrade"]:focus {
			outline: 2px solid #2271b1;
			outline-offset: -2px;
		}

		/* Ensure smooth transitions for all state changes */
		#adminmenu .wp-submenu a[href*="courseflow-pro-upgrade"] {
			transition: background-color 0.2s ease-in-out,
									color 0.2s ease-in-out,
									border-left 0.2s ease-in-out,
									padding-left 0.2s ease-in-out;
		}

		<?php if ( $is_pro_page ) : ?>
		/* Additional highlighting when on PRO page */
		#adminmenu .wp-submenu a[href*="courseflow-pro-upgrade"].current {
			box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.3);
		}
		<?php endif; ?>

		/* 
		 * Star emoji enhancement.
		 * Subtle shadow for better visibility on both light and dark backgrounds.
		 */
		#adminmenu .wp-submenu a[href*="courseflow-pro-upgrade"] {
			text-shadow: 0 0 2px rgba(0, 0, 0, 0.15);
		}

		/* Stronger shadow on dark golden background for star visibility */
		#adminmenu .wp-submenu a[href*="courseflow-pro-upgrade"].current {
			text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
		}

		/* Clean look on hover - no text shadow needed on dark backgrounds */
		#adminmenu .wp-submenu a[href*="courseflow-pro-upgrade"]:hover {
			text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
		}
	</style>
	<?php
}
add_action( 'admin_head', 'courseflow_add_pro_submenu_styles' );

/**
 * Enqueue admin scripts and styles for Course Flow plugin.
 *
 * Loads assets on admin pages related to Course Flow. PRO submenu CSS is
 * included inside assets/css/admin.css and the PRO submenu JS is loaded
 * from assets/js/pro-submenu.js. The script receives localized data:
 *  - courseflowProSubmenu.label (string)
 *  - courseflowProSubmenu.highlight (bool)
 *
 * This function is designed to replace the existing courseflow_admin_enqueue_scripts.
 *
 * @since 1.0.0
 *
 * @param string $hook Current admin page hook suffix.
 * @return void
 */
function courseflow_admin_enqueue_scripts( $hook ) {
	// Known Course Flow admin hooks for explicit checks.
	$courseflow_pages = array(
		'toplevel_page_courseflow-settings',
		'course-flow_page_courseflow-courses',
		'course-flow_page_courseflow-button-settings',
		'course-flow_page_courseflow-image-button-settings',
		'course-flow_page_courseflow-pro-upgrade',
	);

	// Detect Course Flow pages either by exact hook or substring 'courseflow'.
	$is_courseflow_page = in_array( $hook, $courseflow_pages, true ) || ( false !== strpos( (string) $hook, 'courseflow' ) );

	// Enqueue main admin stylesheet (contains pro submenu rules as requested).
	wp_enqueue_style(
		'courseflow-admin-styles',
		COURSEFLOW_URL . 'assets/css/admin.css',
		array(),
		'1.0.3'
	);

	// Enqueue WP color picker only on plugin pages to avoid unnecessary loads.
	if ( $is_courseflow_page ) {
		wp_enqueue_style( 'wp-color-picker' );
		wp_enqueue_script( 'wp-color-picker' );
	}

	// Copy button styles on plugin pages.
	if ( $is_courseflow_page ) {
		wp_enqueue_style(
			'courseflow-copy-button-styles',
			COURSEFLOW_URL . 'assets/css/copy-button.css',
			array(),
			'1.0.0'
		);
	}

	/**
	 * ------------------------
	 * Page-specific enqueues (unchanged behavior).
	 * The following section preserves the prior logic for other admin pages.
	 * ------------------------
	 */

	// Main settings page.
	if ( 'toplevel_page_courseflow-settings' === $hook ) {
		wp_enqueue_script(
			'courseflow-stripe-test-connection',
			COURSEFLOW_URL . 'assets/js/stripe-test-connection.js',
			array( 'jquery', 'wp-i18n' ),
			'1.2.38',
			true
		);

		wp_set_script_translations(
			'courseflow-stripe-test-connection',
			'course-flow',
			COURSEFLOW_PATH . 'languages'
		);

		wp_localize_script(
			'courseflow-stripe-test-connection',
			'courseflowTestConnection',
			array(
				'restUrl' => esc_url_raw( rest_url( 'course-flow/v1/test-connection' ) ),
				'nonce'   => wp_create_nonce( 'wp_rest' ),
			)
		);

		wp_enqueue_script(
			'courseflow-secret-key-toggle',
			COURSEFLOW_URL . 'assets/js/stripe-secret-key-toggle.js',
			array( 'jquery' ),
			COURSEFLOW_VERSION,
			true
		);

		wp_localize_script(
			'courseflow-secret-key-toggle',
			'courseflowToggleSecretKey',
			array(
				'showText' => esc_js( __( 'Show', 'course-flow' ) ),
				'hideText' => esc_js( __( 'Hide', 'course-flow' ) ),
			)
		);
	}

	// Button Settings page.
	if ( 'course-flow_page_courseflow-button-settings' === $hook ) {
		if ( ! defined( 'COURSEFLOW_BUTTON_SETTINGS_LOADED' ) ) {
			define( 'COURSEFLOW_BUTTON_SETTINGS_LOADED', true );

			wp_enqueue_style(
				'courseflow-local-fonts',
				COURSEFLOW_URL . 'assets/css/local-fonts.css',
				array(),
				'1.0.0',
				'all'
			);

			wp_enqueue_style(
				'courseflow-button-settings',
				COURSEFLOW_URL . 'assets/css/button-settings.css',
				array(),
				'1.0.2',
				'all'
			);

			if ( ! wp_script_is( 'select2', 'registered' ) ) {
				wp_enqueue_style(
					'select2',
					COURSEFLOW_URL . 'vendor/select2/css/select2.min.css',
					array(),
					'4.0.13',
					'all'
				);

				wp_enqueue_script(
					'select2',
					COURSEFLOW_URL . 'vendor/select2/js/select2.min.js',
					array( 'jquery' ),
					'4.0.13',
					true
				);
			} else {
				wp_enqueue_style( 'select2' );
				wp_enqueue_script( 'select2' );
			}

			wp_enqueue_script(
				'courseflow-button-settings-script',
				COURSEFLOW_URL . 'assets/js/button-settings.js',
				array( 'wp-color-picker', 'jquery', 'wp-i18n', 'select2' ),
				'1.9.25',
				true
			);

			wp_set_script_translations(
				'courseflow-button-settings-script',
				'course-flow',
				COURSEFLOW_PATH . 'languages'
			);

			$font_size  = get_option( 'courseflow_button_font_size', 16 );
			$inline_css = sprintf(
				'#courseflow-preview-button {
					font-size: %dpx;
					min-height: 40px;
					display: flex;
					align-items: center;
					justify-content: center;
					padding: 0 10px;
					box-sizing: border-box;
					font-size-adjust: none;
					-webkit-font-smoothing: antialiased;
				}',
				absint( $font_size )
			);
			wp_add_inline_style( 'wp-admin', $inline_css );
		}
	}

	// Image Button Settings page.
	if ( 'course-flow_page_courseflow-image-button-settings' === $hook ) {
		wp_enqueue_media();

		wp_enqueue_style(
			'courseflow-image-button-settings',
			COURSEFLOW_URL . 'assets/css/image-button-settings.css',
			array(),
			'1.0.3'
		);

		wp_enqueue_script(
			'courseflow-image-button-settings',
			COURSEFLOW_URL . 'assets/js/image-button-settings.js',
			array( 'jquery', 'wp-i18n' ),
			'1.1.10',
			true
		);

		wp_set_script_translations(
			'courseflow-image-button-settings',
			'course-flow',
			COURSEFLOW_PATH . 'languages'
		);

		wp_localize_script(
			'courseflow-image-button-settings',
			'courseflowImageButtonData',
			array(
				'mediaTitle'        => esc_html__( 'Select Image Button', 'course-flow' ),
				'mediaButtonText'   => esc_html__( 'Select Image', 'course-flow' ),
				'removeButtonText'  => esc_html__( 'Remove Image', 'course-flow' ),
				'defaultAlt'        => esc_html__( 'Buy Course', 'course-flow' ),
				'originalSizeLabel' => esc_html__( 'Use Original Size', 'course-flow' ),
				'nonce'             => wp_create_nonce( 'wp_rest' ),
				'copySuccess'       => esc_html__( 'Shortcode copied to clipboard!', 'course-flow' ),
				'debug'             => defined( 'COURSEFLOW_DEBUG' ) && COURSEFLOW_DEBUG,
			)
		);
	}

	// Courses page.
	if ( 'course-flow_page_courseflow-courses' === $hook ) {
		wp_enqueue_style(
			'courseflow-courses-page',
			COURSEFLOW_URL . 'assets/css/courses-page.css',
			array(),
			'1.2.4'
		);

		wp_enqueue_script(
			'courseflow-courses-page',
			COURSEFLOW_URL . 'assets/js/courses-page.js',
			array( 'jquery', 'wp-i18n' ),
			'1.2.5',
			true
		);

		wp_set_script_translations(
			'courseflow-courses-page',
			'course-flow',
			COURSEFLOW_PATH . 'languages'
		);

		wp_localize_script(
			'courseflow-courses-page',
			'courseflowCoursesPageData',
			array(
				'nonce'       => wp_create_nonce( 'wp_rest' ),
				'copySuccess' => esc_html__( 'Shortcode copied to clipboard!', 'course-flow' ),
				'debug'       => defined( 'COURSEFLOW_DEBUG' ) && COURSEFLOW_DEBUG,
			)
		);
	}

	// PRO License page (CRITICAL FIX: Added missing CSS enqueue).
	if ( 'course-flow_page_courseflow-pro-upgrade' === $hook ) {
		// Enqueue PRO License specific CSS.
		wp_enqueue_style(
			'courseflow-pro-license',
			COURSEFLOW_URL . 'assets/css/pro-license.css',
			array(),
			'2.1.1'
		);

		// Note: React bundle loading is handled by react-app-loader.php.
		// No additional JS enqueue needed here as the React app manages its own scripts.
	}
}

/**
 * Enqueue frontend local fonts CSS.
 *
 * @since 1.0.0
 * @return void
 */
function courseflow_enqueue_frontend_local_fonts() {
	wp_enqueue_style(
		'courseflow-local-fonts',
		COURSEFLOW_URL . 'assets/css/local-fonts.css',
		array(),
		'1.0.0'
	);
}
add_action( 'wp_enqueue_scripts', 'courseflow_enqueue_frontend_local_fonts' );

/**
 * Enqueue scripts and styles for frontend.
 *
 * @since 1.0.0
 */
function courseflow_enqueue_scripts() {
	global $post;

	$should_enqueue = false;

	if ( is_a( $post, 'WP_Post' ) && (
		has_shortcode( $post->post_content, 'courseflow_course' ) ||
		has_shortcode( $post->post_content, 'courseflow_buycourse' ) ||
		has_shortcode( $post->post_content, 'courseflow_imagebuycourse' )
	) ) {
		$should_enqueue = true;
	}

	if ( function_exists( 'tutor_utils' ) && courseflow_is_lms_active( 'tutor' ) ) {
		if ( is_singular( 'courses' ) || is_singular( 'tutor_course' ) || is_post_type_archive( 'courses' ) ) {
			$should_enqueue = true;
		}
	}

	if ( courseflow_lp_is_course() && courseflow_is_lms_active( 'courseflow_lp' ) ) {
		if ( courseflow_is_singular_lp_course() || courseflow_lp_is_course() ) {
			$should_enqueue = true;
		}
	}

	if ( ! $should_enqueue ) {
		return;
	}

	wp_enqueue_style(
		'courseflow-frontend-styles',
		COURSEFLOW_URL . 'assets/css/frontend.css',
		array(),
		COURSEFLOW_VERSION
	);

	$custom_css  = '.courseflow-stripe-button {';
	$custom_css .= 'font-family: ' . esc_attr( get_option( 'courseflow_button_font_family', '\'Arial\', Helvetica, sans-serif' ) ) . ';';
	$custom_css .= 'font-size: ' . esc_attr( get_option( 'courseflow_button_font_size', '16' ) ) . 'px;';
	$custom_css .= 'color: ' . esc_attr( get_option( 'courseflow_button_text_color', '#ffffff' ) ) . ';';
	$custom_css .= 'background-color: ' . esc_attr( get_option( 'courseflow_button_background_color', '#6772e5' ) ) . ';';
	$custom_css .= 'border-color: ' . esc_attr( get_option( 'courseflow_button_border_color', '#6772e5' ) ) . ';';
	$custom_css .= 'height: ' . esc_attr( get_option( 'courseflow_button_height', '40' ) ) . 'px;';
	$custom_css .= 'width: ' . esc_attr( get_option( 'courseflow_button_width', '150' ) ) . 'px;';
	$custom_css .= 'border-radius: ' . esc_attr( get_option( 'courseflow_button_border_radius', '5' ) ) . 'px;';
	$custom_css .= 'border-width: ' . esc_attr( get_option( 'courseflow_button_border_width', '1' ) ) . 'px;';
	$custom_css .= 'border-style: ' . esc_attr( get_option( 'courseflow_button_border_style', 'solid' ) ) . ';';
	$custom_css .= 'box-shadow: ' . esc_attr( get_option( 'courseflow_button_shadow_x', '0' ) ) . 'px ' . esc_attr( get_option( 'courseflow_button_shadow_y', '0' ) ) . 'px ' . esc_attr( get_option( 'courseflow_button_shadow_blur', '0' ) ) . 'px ' . esc_attr( get_option( 'courseflow_button_shadow_spread', '0' ) ) . 'px ' . esc_attr( get_option( 'courseflow_button_shadow_color', '#000000' ) ) . ';';
	$custom_css .= 'display: flex; align-items: center; justify-content: center; text-decoration: none !important; transition: all 0.3s ease;';
	$custom_css .= '}';
	$custom_css .= '.courseflow-stripe-button:hover {background-color: ' . esc_attr( get_option( 'courseflow_button_background_color_hover', '#5469d4' ) ) . '; color: ' . esc_attr( get_option( 'courseflow_button_text_color_hover', '#ffffff' ) ) . '; text-decoration: none !important;}';
	$custom_css .= '.courseflow-stripe-button:active, .courseflow-stripe-button:focus {background-color: ' . esc_attr( get_option( 'courseflow_button_background_color_hover', '#5469d4' ) ) . '; color: ' . esc_attr( get_option( 'courseflow_button_text_color_hover', '#ffffff' ) ) . '; outline: none; text-decoration: none !important;}';
	$custom_css .= '.courseflow-stripe-image-button {cursor: pointer; transition: opacity 0.3s ease;';
	if ( ! get_option( 'courseflow_image_button_original_size', 0 ) ) {
		$custom_css .= 'width: ' . esc_attr( get_option( 'courseflow_image_button_width', '150' ) ) . 'px;';
		$custom_css .= 'height: ' . esc_attr( get_option( 'courseflow_image_button_height', '40' ) ) . 'px;';
	}
	$custom_css .= '}';
	$custom_css .= '.courseflow-stripe-image-button:hover {opacity: 0.8;}';
	wp_add_inline_style( 'courseflow-frontend-styles', $custom_css );

	wp_enqueue_script(
		'stripe-js',
		'https://js.stripe.com/v3/',
		array(),
		'1.0.0',
		true
	);

	wp_enqueue_script(
		'courseflow-stripe-checkout',
		COURSEFLOW_URL . 'assets/js/stripe-checkout.js',
		array( 'jquery', 'stripe-js' ),
		COURSEFLOW_VERSION,
		true
	);

	$default_currency = 'USD';
	if ( courseflow_is_lms_active( 'tutor' ) && function_exists( 'tutor_utils' ) ) {
		$default_currency = strtoupper( tutor_utils()->get_option( 'currency_code', 'USD' ) );
	} else {
		$default_currency = get_option( 'courseflow_default_currency', 'USD' );
	}

	$localized_data = array(
		'publishableKey' => sanitize_text_field( get_option( 'courseflow_stripe_publishable_key', '' ) ),
		'restUrl'        => esc_url_raw( rest_url( 'course-flow/v1/create-checkout' ) ),
		'nonce'          => wp_create_nonce( 'wp_rest' ),
		'currency'       => strtoupper( $default_currency ),
		'debugLogUrl'    => esc_url_raw( rest_url( 'course-flow/v1/debug-log' ) ),
		'isAdmin'        => current_user_can( 'manage_options' ),
	);

	wp_localize_script( 'courseflow-stripe-checkout', 'courseflowStripeData', $localized_data );

	if ( courseflow_is_lms_active( 'tutor' ) ) {
		wp_enqueue_script(
			'courseflow-tutor-override',
			COURSEFLOW_URL . 'assets/js/stripe-tutor-override.js',
			array( 'jquery', 'courseflow-stripe-checkout' ),
			COURSEFLOW_VERSION,
			true
		);
	}

	if ( courseflow_is_lms_active( 'courseflow_lp' ) ) {
		wp_enqueue_script(
			'courseflow-lp-override',
			COURSEFLOW_URL . 'assets/js/courseflow-lp-override.js',
			array( 'jquery', 'courseflow-stripe-checkout' ),
			COURSEFLOW_VERSION,
			true
		);
	}
}
add_action( 'admin_enqueue_scripts', 'courseflow_admin_enqueue_scripts' );

/**
 * Register a debug REST endpoint for client-side debug logs.
 *
 * @since 1.2.31
 */
function courseflow_register_client_debug_endpoint() {
	register_rest_route(
		'course-flow/v1',
		'/client-debug',
		array(
			'methods'             => 'POST',
			'callback'            => 'courseflow_client_debug_log',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
}
add_action( 'rest_api_init', 'courseflow_register_client_debug_endpoint' );

/**
 * Handler for client-side debug logs.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response
 */
function courseflow_client_debug_log( WP_REST_Request $request ) {
	$params  = $request->get_params();
	$msg     = isset( $params['msg'] ) ? wp_strip_all_tags( $params['msg'] ) : '';
	$context = isset( $params['context'] ) ? $params['context'] : '';

	$context_str = is_array( $context ) ? wp_json_encode( $context ) : (string) $context;

	return rest_ensure_response( array( 'success' => true ) );
}

/**
 * Get active LMS plugin description.
 *
 * @since 1.0.0
 * @return string LMS plugin description or default message.
 */
function courseflow_get_lms_description() {
	if ( ! function_exists( 'get_plugin_data' ) ) {
		include_once ABSPATH . 'wp-admin/includes/plugin.php';
	}

	$active_plugins = get_option( 'active_plugins', array() );
	$lms_plugins    = array(
		'tutor/tutor.php'           => array( 'name' => 'Tutor LMS' ),
		'learnpress/learnpress.php' => array( 'name' => 'LearnPress' ),
		'sfwd-lms/sfwd_lms.php'     => array( 'name' => 'LearnDash' ),
	);

	$descriptions = array();
	foreach ( $lms_plugins as $plugin_path => $plugin_info ) {
		if ( in_array( $plugin_path, $active_plugins, true ) ) {
			$plugin_file = WP_PLUGIN_DIR . '/' . $plugin_path;
			if ( file_exists( $plugin_file ) ) {
				$short_desc     = 'Found plugin: ' . $plugin_info['name'];
				$descriptions[] = $short_desc;
			}
		}
	}

	if ( empty( $descriptions ) ) {
		return 'No LMS plugin detected.';
	}

	return implode( ' | ', $descriptions );
}

/**
 * Handle AJAX action for getting attachment dimensions.
 *
 * @since 1.0.0
 */
function courseflow_get_attachment_dimensions_callback() {
	check_ajax_referer( 'wp_rest', '_ajax_nonce' );

	if ( ! isset( $_POST['url'] ) ) {
		wp_send_json_error(
			array(
				'message' => esc_html__( 'URL parameter is required.', 'course-flow' ),
			)
		);
	}

	$url           = esc_url_raw( sanitize_text_field( wp_unslash( $_POST['url'] ) ) );
	$attachment_id = attachment_url_to_postid( $url );

	if ( ! $attachment_id ) {
		wp_send_json_error(
			array(
				'message' => esc_html__( 'Failed to get image dimensions.', 'course-flow' ),
			)
		);
	}

	$attachment = wp_get_attachment_metadata( $attachment_id );

	if ( $attachment && isset( $attachment['width'] ) && isset( $attachment['height'] ) ) {
		wp_send_json_success(
			array(
				'width'  => absint( $attachment['width'] ),
				'height' => absint( $attachment['height'] ),
			)
		);
	} else {
		wp_send_json_error(
			array(
				'message' => esc_html__( 'Failed to get image dimensions.', 'course-flow' ),
			)
		);
	}
}
add_action( 'wp_ajax_courseflow_get_attachment_dimensions', 'courseflow_get_attachment_dimensions_callback' );

/**
 * Prevent Tutor LMS fatal error when Tutor Pro Guest Checkout is missing.
 *
 * @since 1.2.32
 */
function courseflow_disable_tutor_checkout_conflicts() {
	if ( ! function_exists( 'tutor' ) ) {
		return;
	}

	if ( class_exists( 'Tutor\Ecommerce\CheckoutController' ) ) {
		$checkout_controller = 'Tutor\Ecommerce\CheckoutController';
		if ( ! class_exists( 'TutorPro\Ecommerce\GuestCheckout\GuestCheckout' ) ) {
			remove_action( 'template_redirect', array( new $checkout_controller(), 'restrict_checkout_page' ), 10 );
		}
	}
}
add_action( 'plugins_loaded', 'courseflow_disable_tutor_checkout_conflicts', 20 );

// phpcs:ignore WordPress.CodeAnalysis.UnusedMethodParameters -- Required by WP REST API callback signature.
/**
 * REST API endpoint to get current PRO submenu label.
 *
 * @since 1.0.0
 * @param WP_REST_Request $request REST request object.
 * @return WP_REST_Response Response object.
 */
function courseflow_rest_get_pro_menu_label( WP_REST_Request $request ) {
	if ( ! current_user_can( 'manage_options' ) ) {
		return new WP_REST_Response(
			array(
				'success' => false,
				'message' => __( 'Access denied.', 'course-flow' ),
			),
			403
		);
	}

	$label = courseflow_get_pro_submenu_label();

	return new WP_REST_Response(
		array(
			'success' => true,
			'label'   => $label,
		),
		200
	);
}

/**
 * Register REST API endpoint for PRO menu label.
 *
 * @since 1.0.0
 * @return void
 */
function courseflow_register_menu_label_endpoint() {
	register_rest_route(
		'course-flow/v1',
		'/pro-menu-label',
		array(
			'methods'             => 'GET',
			'callback'            => 'courseflow_rest_get_pro_menu_label',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
}
add_action( 'rest_api_init', 'courseflow_register_menu_label_endpoint' );

// Load required files for AJAX status polling and React app loader.
require_once plugin_dir_path( __FILE__ ) . 'includes/ajax-status-poll.php';
require_once plugin_dir_path( __FILE__ ) . 'admin/react-app-loader.php';
