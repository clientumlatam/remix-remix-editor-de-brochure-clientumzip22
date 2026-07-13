<?php
/**
 * File: courseflow-lp-integration.php
 * Description: Handles integration with LearnPress for the Course Flow plugin using custom post type courseflow_lp_course.
 * Version: 1.0.0
 * Author: Pawel Borowiec
 * Text Domain: course-flow
 *
 * @package CourseFlow
 */

defined( 'ABSPATH' ) || exit;

/**
 * Register custom post type for LearnPress courses to avoid conflict with original lp_course.
 *
 * This allows Course Flow to safely handle LearnPress courses without modifying core LearnPress.
 *
 * @since 1.2.33
 */
function courseflow_register_lp_course_type() {
	if ( ! class_exists( 'LearnPress' ) ) {
		return;
	}

	register_post_type(
		'courseflow_lp_course',
		array(
			'labels'       => array(
				'name'          => __( 'Course Flow LP Courses', 'course-flow' ),
				'singular_name' => __( 'Course Flow LP Course', 'course-flow' ),
			),
			'public'       => false,
			'show_ui'      => false,
			'show_in_menu' => false,
			'rewrite'      => false,
			'supports'     => array(),
		)
	);
}
add_action( 'init', 'courseflow_register_lp_course_type', 100 );

/**
 * Retrieve the price of a LearnPress course.
 *
 * Fetches price via LearnPress API. Returns 1.0 fallback if unavailable.
 *
 * @since 1.2.33
 * @param int $course_id The ID of the original LearnPress course.
 * @return float The course price.
 */
function courseflow_get_lp_course_price( $course_id ) {
	if ( ! in_array( 'learnpress/learnpress.php', (array) get_option( 'active_plugins', array() ), true ) || ! class_exists( 'LP_Course' ) ) {
		return 1.0;
	}

	$course = learn_press_get_course( absint( $course_id ) );
	if ( ! $course ) {
		return 1.0;
	}

	$price = floatval( $course->get_price() );
	return $price > 0 ? $price : 1.0;
}

/**
 * Retrieve the currency used for LearnPress courses.
 *
 * Returns currency from LearnPress settings or defaults to plugin default.
 *
 * @since 1.2.33
 * @return string The currency code.
 */
function courseflow_get_lp_course_currency() {
	$currency = get_option( 'courseflow_default_currency', 'USD' );

	if ( in_array( 'learnpress/learnpress.php', (array) get_option( 'active_plugins', array() ), true ) && class_exists( 'LP_Settings' ) ) {
		$lp_currency = LP_Settings::instance()->get( 'currency', 'USD' );
		if ( ! empty( $lp_currency ) && courseflow_validate_currency( $lp_currency ) ) {
			$currency = sanitize_text_field( $lp_currency );
		}
	}

	return strtoupper( $currency );
}

/**
 * Get table columns with caching to avoid repeated queries.
 *
 * Retrieves column names from learnpress_user_items table using WordPress APIs where possible.
 * Falls back to INFORMATION_SCHEMA only when necessary.
 *
 * @since 1.2.35
 * @return array Array of column names.
 */
function courseflow_get_lp_user_items_columns() {
	$cache_key = 'courseflow_lp_user_items_columns';
	$columns   = wp_cache_get( $cache_key );

	if ( false !== $columns ) {
		return is_array( $columns ) ? $columns : array();
	}

	// Try to get columns from LearnPress API first.
	if ( function_exists( 'LP_Database' ) && method_exists( 'LP_Database', 'get_table_columns' ) ) {
		$columns = LP_Database::get_table_columns( 'learnpress_user_items' );
	}

	// Fallback to default known columns.
	if ( empty( $columns ) ) {
		$columns = array(
			'user_item_id',
			'user_id',
			'item_id',
			'item_type',
			'start_time',
			'end_time',
			'status',
			'graduation',
			'access_level',
			'ref_id',
			'ref_type',
			'parent_id',
		);
	}

	// Cache for 1 hour.
	wp_cache_set( $cache_key, $columns, '', HOUR_IN_SECONDS );

	return is_array( $columns ) ? $columns : array();
}

/**
 * Check if order exists by session ID using optimized query.
 *
 * Uses direct query with caching for performance. This is acceptable
 * as we're querying our own managed data structure.
 *
 * @since 1.2.35
 * @param string $session_id Stripe session ID.
 * @return int|false Order ID if exists, false otherwise.
 */
function courseflow_lp_order_exists_by_session( $session_id ) {
	$session_id = sanitize_text_field( $session_id );
	$cache_key  = 'courseflow_lp_order_' . md5( $session_id );
	$cached     = wp_cache_get( $cache_key );

	if ( false !== $cached ) {
		return ( 'none' === $cached ) ? false : absint( $cached );
	}

	// Use get_posts with proper caching instead of direct query.
	$orders = get_posts(
		array(
			'post_type'      => 'lp_order',
			'post_status'    => 'any',
			'posts_per_page' => 1,
			'fields'         => 'ids',
			'no_found_rows'  => true,
			'meta_key'       => '_payment_session', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
			'meta_value'     => $session_id, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
		)
	);

	if ( ! empty( $orders ) ) {
		$order_id = absint( $orders[0] );
		wp_cache_set( $cache_key, $order_id, '', HOUR_IN_SECONDS );
		return $order_id;
	}

	wp_cache_set( $cache_key, 'none', '', MINUTE_IN_SECONDS * 5 );
	return false;
}

/**
 * Grant user access to a LearnPress course and create an order.
 *
 * Creates a LearnPress order, enrolls the user, marks order as completed.
 * Uses courseflow_lp_course as internal reference to avoid conflicts.
 *
 * @since 1.2.33
 * @param int    $course_id   The original LearnPress course ID.
 * @param string $user_email  The user's email address.
 * @param string $session_id  The Stripe Checkout session ID.
 * @param string $currency  Optional currency code.
 * @return bool True on success, false on failure.
 */
function courseflow_grant_lp_course_access( $course_id, $user_email, $session_id, $currency = '' ) {
	global $wpdb;

	$course_id  = absint( $course_id );
	$user_email = sanitize_email( $user_email );
	$session_id = sanitize_text_field( $session_id );
	$currency   = strtoupper( sanitize_text_field( $currency ) );

	// Validate currency.
	if ( empty( $currency ) || ! courseflow_validate_currency( $currency ) ) {
		$currency = courseflow_get_lp_course_currency();
	}

	// Input validation.
	if ( $course_id <= 0 || ! is_email( $user_email ) ) {
		return false;
	}

	// Check LearnPress activation.
	if ( ! in_array( 'learnpress/learnpress.php', (array) get_option( 'active_plugins', array() ), true ) || ! class_exists( 'LP_Course' ) ) {
		return false;
	}

	// Check for existing order using optimized function.
	$existing_order = courseflow_lp_order_exists_by_session( $session_id );
	if ( $existing_order ) {
		return true;
	}

	// Get or create user.
	$user = get_user_by( 'email', $user_email );
	if ( ! $user && get_option( 'courseflow_auto_create_account', 1 ) ) {
		$user_id = courseflow_create_wp_user( $user_email );
		if ( ! $user_id ) {
			return false;
		}
		$user = get_user_by( 'id', $user_id );
	} elseif ( ! $user ) {
		return false;
	}

	$user_id = absint( $user->ID );

	// Validate course.
	$course = learn_press_get_course( $course_id );
	if ( ! $course ) {
		return false;
	}

	$price = floatval( $course->get_price() );
	if ( $price <= 0 ) {
		$price = 1.0;
	}

	// Create LearnPress order.
	$order_data = array(
		'post_type'   => 'lp_order',
		'post_status' => 'lp-pending',
		'post_author' => $user_id,
		'post_date'   => current_time( 'mysql' ),
		'meta_input'  => array(
			'_user_id'              => $user_id,
			'_order_currency'       => $currency,
			'_order_total'          => $price,
			'_payment_method'       => 'stripe',
			'_payment_method_title' => esc_html__( 'Stripe', 'course-flow' ),
			'_payment_session'      => $session_id,
		),
	);

	$order_id = wp_insert_post( $order_data );
	if ( is_wp_error( $order_id ) || $order_id <= 0 ) {
		return false;
	}

	// Add course item to order.
	$order = learn_press_get_order( $order_id );
	if ( ! $order ) {
		wp_delete_post( $order_id, true );
		return false;
	}

	$order->add_item(
		array(
			'item_id'  => $course_id,
			'quantity' => 1,
			'subtotal' => $price,
			'total'    => $price,
		)
	);

	// Enroll user using LearnPress API or direct insert if API unavailable.
	$enrollment_success = courseflow_enroll_user_in_lp_course( $user_id, $course_id, $order_id );

	if ( ! $enrollment_success ) {
		wp_delete_post( $order_id, true );
		return false;
	}

	// Update order status.
	if ( function_exists( 'learn_press_update_order_status' ) ) {
		learn_press_update_order_status( $order_id, 'completed' );
	}

	// Trigger Course Flow prefixed hooks.
	do_action( 'courseflow_lp_checkout_order_processed', $order_id, $order );
	do_action( 'courseflow_lp_order_status_completed', $order_id );
	do_action( 'courseflow_lp_user_enrolled_course', $user_id, $course_id, $order_id );
	do_action( 'courseflow_lp_order_completed', $order_id, $order );

	// Clear caches.
	wp_cache_delete( 'courseflow_lp_order_' . md5( $session_id ) );
	wp_cache_delete( 'courseflow_lp_user_items_columns' );

	$transients = array(
		"learn_press_user_course_{$user_id}_{$course_id}",
		"learn_press_order_{$order_id}",
		'lp_user_items_cache',
		'lp_order_cache',
	);
	foreach ( $transients as $transient ) {
		delete_transient( $transient );
	}

	if ( function_exists( 'learn_press_clear_user_items_cache' ) ) {
		learn_press_clear_user_items_cache( $user_id, $course_id );
	}

	return true;
}

/**
 * Enroll user in LearnPress course.
 *
 * Handles user enrollment using LearnPress API when available,
 * with fallback to direct database insertion.
 *
 * @since 1.2.35
 * @param int $user_id   User ID.
 * @param int $course_id Course ID.
 * @param int $order_id  Order ID.
 * @return bool True on success, false on failure.
 */
function courseflow_enroll_user_in_lp_course( $user_id, $course_id, $order_id ) {
	global $wpdb;

	$user_id   = absint( $user_id );
	$course_id = absint( $course_id );
	$order_id  = absint( $order_id );

	// Prepare enrollment data.
	$user_item_data = array(
		'user_id'      => $user_id,
		'item_id'      => $course_id,
		'item_type'    => 'lp_course',
		'start_time'   => current_time( 'mysql' ),
		'end_time'     => '0000-00-00 00:00:00',
		'status'       => 'enrolled',
		'graduation'   => '',
		'access_level' => 50,
		'ref_id'       => $order_id,
		'ref_type'     => 'lp_order',
		'parent_id'    => 0,
	);

	// Try LearnPress API first.
	if ( function_exists( 'learn_press_update_user_item_field' ) ) {
		$result = learn_press_update_user_item_field( $user_item_data );
		if ( $result ) {
			return true;
		}
	}

	// Fallback: direct insert with proper sanitization.
	// Direct query is used as a fallback when LearnPress API fails or is unavailable in certain versions,
	// ensuring reliable enrollment without modifying LearnPress core, while maintaining performance and compatibility.
	$columns = courseflow_get_lp_user_items_columns();

	// Filter only existing columns.
	foreach ( $user_item_data as $key => $value ) {
		if ( ! in_array( $key, $columns, true ) ) {
			unset( $user_item_data[ $key ] );
		}
	}

	// Prepare format array for wpdb.
	$format = array();
	foreach ( $user_item_data as $key => $value ) {
		$format[] = in_array( $key, array( 'user_id', 'item_id', 'access_level', 'ref_id', 'parent_id' ), true ) ? '%d' : '%s';
	}

	$table  = $wpdb->prefix . 'learnpress_user_items';
	$result = $wpdb->insert( $table, $user_item_data, $format ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery

	return false !== $result;
}

/**
 * Bridge Course Flow hooks to LearnPress hooks for backward compatibility.
 *
 * This allows existing LearnPress integrations to continue working
 * while using Course Flow's prefixed hooks as the primary system.
 *
 * @since 1.2.35
 */
function courseflow_bridge_lp_hooks() {
	// Only bridge if LearnPress compatibility is enabled.
	if ( ! get_option( 'courseflow_lp_hook_bridge', true ) ) {
		return;
	}

	// Bridge: checkout order processed.
	add_action(
		'courseflow_lp_checkout_order_processed',
		function ( $order_id, $order ) {
			if ( has_action( 'learn_press_checkout_order_processed' ) ) {
				do_action( 'learn_press_checkout_order_processed', $order_id, $order ); // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound
			}
		},
		10,
		2
	);

	// Bridge: order status completed.
	add_action(
		'courseflow_lp_order_status_completed',
		function ( $order_id ) {
			if ( has_action( 'learn_press_order_status_completed' ) ) {
				do_action( 'learn_press_order_status_completed', $order_id ); // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound
			}
		},
		10,
		1
	);

	// Bridge: user enrolled in course.
	add_action(
		'courseflow_lp_user_enrolled_course',
		function ( $user_id, $course_id, $order_id ) {
			if ( has_action( 'learn_press_user_enrolled_course' ) ) {
				do_action( 'learn_press_user_enrolled_course', $user_id, $course_id, $order_id ); // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound
			}
			if ( has_action( 'learn_press_user_course_enrolled' ) ) {
				do_action( 'learn_press_user_course_enrolled', $user_id, $course_id ); // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound
			}
		},
		10,
		3
	);

	// Bridge: order completed.
	add_action(
		'courseflow_lp_order_completed',
		function ( $order_id, $order ) {
			if ( has_action( 'learn_press_order_completed' ) ) {
				do_action( 'learn_press_order_completed', $order_id, $order ); // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound
			}
		},
		10,
		2
	);
}
add_action( 'init', 'courseflow_bridge_lp_hooks', 999 );

/**
 * Enqueue LearnPress override script on single course pages.
 *
 * Loads courseflow-lp-override.js only on LearnPress course pages.
 *
 * @since 1.2.33
 */
function courseflow_enqueue_lp_stripe_scripts() {
	if ( ! class_exists( 'LearnPress' ) || ! is_singular( 'lp_course' ) ) {
		return;
	}

	wp_enqueue_script( 'stripe-js', 'https://js.stripe.com/v3/', array(), '3.0', true );

	wp_enqueue_script(
		'courseflow-lp-override',
		COURSEFLOW_ASSETS_URL . 'js/courseflow-lp-override.js',
		array( 'jquery', 'stripe-js' ),
		COURSEFLOW_VERSION,
		true
	);

	$course_id = get_the_ID();
	$price     = courseflow_get_lp_course_price( $course_id );
	$currency  = courseflow_get_lp_course_currency();

	wp_localize_script(
		'courseflow-lp-override',
		'courseflowStripeData',
		array(
			'publishableKey' => get_option( 'courseflow_stripe_publishable_key', '' ),
			'nonce'          => wp_create_nonce( 'wp_rest' ),
			'restUrl'        => rest_url( 'course-flow/v1/create-checkout' ),
			'currency'       => $currency,
			'debugLogUrl'    => rest_url( 'course-flow/v1/debug-log' ),
			'isAdmin'        => current_user_can( 'manage_options' ),
		)
	);
}
add_action( 'wp_enqueue_scripts', 'courseflow_enqueue_lp_stripe_scripts', 100 );
