<?php
/**
 * File: tutor-integration.php
 * Description: Handles integration with Tutor LMS for the Course Flow plugin.
 * Version: 1.0.0
 * Author: Pawel Borowiec
 * Text Domain: course-flow
 *
 * @package CourseFlow
 */

defined( 'ABSPATH' ) || exit;

/**
 * Retrieves the course price for Tutor LMS.
 *
 * @since 1.0.0
 * @param int $course_id The course ID.
 * @return float The course price.
 */
function courseflow_get_tutor_course_price( $course_id ) {
	if ( ! function_exists( 'tutor_utils' ) ) {
		return 0.0;
	}

	$price_data    = tutor_utils()->get_raw_course_price( $course_id );
	$regular_price = isset( $price_data->regular_price ) ? floatval( $price_data->regular_price ) : 0.0;
	$sale_price    = isset( $price_data->sale_price ) ? floatval( $price_data->sale_price ) : 0.0;
	$price         = $sale_price > 0 ? $sale_price : $regular_price;

	// Fallback to meta if price is zero.
	if ( 0 === $price ) {
		$meta_price = get_post_meta( $course_id, '_tutor_course_price', true );
		if ( $meta_price ) {
			$price = floatval( $meta_price );
		}
	}

	return $price;
}

/**
 * Retrieves the course currency for Tutor LMS.
 *
 * @since 1.0.0
 * @param int $course_id The course ID.
 * @return string The course currency code.
 */
function courseflow_get_tutor_course_currency( $course_id ) {
	$currency = strtoupper( get_option( 'courseflow_default_currency', 'USD' ) );

	// Check course meta first.
	$meta_currency = get_post_meta( $course_id, '_tutor_course_currency', true );
	if ( $meta_currency ) {
		$currency = strtoupper( sanitize_text_field( $meta_currency ) );
	} elseif ( function_exists( 'tutor_utils' ) ) {
		$monetize_by = tutor_utils()->get_option( 'monetize_by' );
		if ( 'wc' === $monetize_by && function_exists( 'get_woocommerce_currency' ) ) {
			$currency = get_woocommerce_currency();
		} elseif ( 'edd' === $monetize_by && function_exists( 'edd_get_currency' ) ) {
			$currency = edd_get_currency();
		} else {
			$currency = tutor_utils()->get_option( 'currency_code', 'USD' );
		}
	}

	// Simple validation for Stripe currencies (partial list).
	$valid_currencies = array( 'USD', 'EUR', 'GBP', 'PLN', 'JPY' );
	if ( ! in_array( $currency, $valid_currencies, true ) ) {
		$currency = 'USD';
	}

	return strtoupper( $currency );
}

/**
 * Grants course access and inserts fully populated order and earnings records for Tutor LMS.
 * Uses prepared statements and parameterized queries for security.
 *
 * @since 1.3.3
 * @param int    $course_id  The Tutor LMS course ID.
 * @param string $user_email The user email address.
 * @param string $session_id The Stripe session ID.
 * @param string $currency   The currency from the Stripe session.
 * @return bool True on success, false on failure.
 */
function courseflow_grant_tutor_course_access( $course_id, $user_email, $session_id, $currency = 'USD' ) {
	global $wpdb;

	$course_id  = absint( $course_id );
	$user_email = sanitize_email( $user_email );
	$session_id = sanitize_text_field( $session_id );
	$currency   = strtoupper( sanitize_text_field( $currency ) );

	// Get or create user.
	$user = get_user_by( 'email', $user_email );
	if ( ! $user && get_option( 'courseflow_auto_create_account', 1 ) ) {
		$user_id = courseflow_create_wp_user( $user_email );
		$user    = get_user_by( 'id', $user_id );
	}
	if ( ! $user ) {
		return false;
	}
	$user_id = $user->ID;
	$user->add_role( 'student' );

	// Get prices and currency with type coercion.
	$price_data      = function_exists( 'tutor_utils' ) ? tutor_utils()->get_raw_course_price( $course_id ) : new stdClass();
	$regular         = ! empty( $price_data->regular_price ) ? (float) $price_data->regular_price : (float) get_post_meta( $course_id, 'tutor_course_price', true );
	$sale            = ! empty( $price_data->sale_price ) && $price_data->sale_price > 0 ? (float) $price_data->sale_price : 0.0;
	$final_price     = ( $sale > 0 ) ? $sale : $regular;
	$final_price     = ( $final_price > 0 ) ? $final_price : 1.0;
	$instructor_rate = 100.00;
	$commission_type = 'percent';

	// Prepare order data with all fields for Tutor dashboard visibility.
	$order_data = array(
		'parent_id'        => 0,
		'transaction_id'   => $session_id,
		'user_id'          => $user_id,
		'order_type'       => 'single_order',
		'order_status'     => 'completed',
		'payment_status'   => 'paid',
		'subtotal_price'   => $final_price,
		'pre_tax_price'    => $final_price,
		'tax_type'         => '',
		'tax_rate'         => 0.00,
		'tax_amount'       => 0.00,
		'total_price'      => $final_price,
		'net_payment'      => $final_price,
		'coupon_code'      => '',
		'coupon_amount'    => 0.00,
		'discount_type'    => '',
		'discount_amount'  => 0.00,
		'discount_reason'  => '',
		'fees'             => 0.00,
		'earnings'         => 0.00,
		'refund_amount'    => 0.00,
		'payment_method'   => 'stripe',
		'payment_payloads' => '',
		'note'             => '',
		'created_at_gmt'   => current_time( 'mysql', 1 ),
		'created_by'       => $user_id,
		'updated_at_gmt'   => current_time( 'mysql', 1 ),
		'updated_by'       => $user_id,
	);

	// Format specifications for prepared statement.
	$order_format = array(
		'%d', // parent_id.
		'%s', // transaction_id.
		'%d', // user_id.
		'%s', // order_type.
		'%s', // order_status.
		'%s', // payment_status.
		'%f', // subtotal_price.
		'%f', // pre_tax_price.
		'%s', // tax_type.
		'%f', // tax_rate.
		'%f', // tax_amount.
		'%f', // total_price.
		'%f', // net_payment.
		'%s', // coupon_code.
		'%f', // coupon_amount.
		'%s', // discount_type.
		'%f', // discount_amount.
		'%s', // discount_reason.
		'%f', // fees.
		'%f', // earnings.
		'%f', // refund_amount.
		'%s', // payment_method.
		'%s', // payment_payloads.
		'%s', // note.
		'%s', // created_at_gmt.
		'%d', // created_by.
		'%s', // updated_at_gmt.
		'%d', // updated_by.
	);

	// Insert order using prepared query.
	// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
	$inserted = $wpdb->insert(
		$wpdb->prefix . 'tutor_orders',
		$order_data,
		$order_format
	);

	if ( false === $inserted ) {
		return false;
	}

	$order_id = $wpdb->insert_id;

	// Add 'id' key to order_data for Tutor hook compatibility.
	$order_data['id'] = $order_id;

	// Clear relevant caches to ensure data consistency.
	wp_cache_delete( 'tutor_orders_' . $user_id, 'tutor' );

	// Enroll user in course using Tutor API.
	if ( function_exists( 'tutor_utils' ) && method_exists( tutor_utils(), 'do_enroll' ) ) {
		tutor_utils()->do_enroll( $course_id, $order_id, $user_id );
	} elseif ( function_exists( 'tutor_enroll_user' ) ) {
		tutor_enroll_user( $user_id, $course_id );
	}

	// Store currency metadata.
	update_post_meta( $order_id, 'stripe_currency', $currency );

	// Prepare order item data.
	$order_item = array(
		'order_id'       => $order_id,
		'item_id'        => $course_id,
		'regular_price'  => $regular,
		'sale_price'     => $sale,
		'discount_price' => ( $regular > $final_price ) ? $regular - $final_price : 0.0,
		'coupon_code'    => '',
	);

	$item_format = array(
		'%d', // order_id.
		'%d', // item_id.
		'%f', // regular_price.
		'%f', // sale_price.
		'%f', // discount_price.
		'%s', // coupon_code.
	);

	// Insert order item using prepared query.
	// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
	$wpdb->insert(
		$wpdb->prefix . 'tutor_order_items',
		$order_item,
		$item_format
	);

	// Prepare earnings data.
	$earnings_data = array(
		'user_id'                  => $user_id,
		'course_id'                => $course_id,
		'order_id'                 => $order_id,
		'order_status'             => 'completed',
		'course_price_total'       => $final_price,
		'course_price_grand_total' => $final_price,
		'instructor_amount'        => 0.00,
		'instructor_rate'          => 0.00,
		'admin_amount'             => $final_price,
		'admin_rate'               => $instructor_rate,
		'commission_type'          => $commission_type,
		'deduct_fees_amount'       => 0.00,
		'deduct_fees_name'         => '',
		'deduct_fees_type'         => '',
		'process_by'               => 'stripe',
		'created_at'               => current_time( 'mysql' ),
	);

	$earnings_format = array(
		'%d', // user_id.
		'%d', // course_id.
		'%d', // order_id.
		'%s', // order_status.
		'%f', // course_price_total.
		'%f', // course_price_grand_total.
		'%f', // instructor_amount.
		'%f', // instructor_rate.
		'%f', // admin_amount.
		'%f', // admin_rate.
		'%s', // commission_type.
		'%f', // deduct_fees_amount.
		'%s', // deduct_fees_name.
		'%s', // deduct_fees_type.
		'%s', // process_by.
		'%s', // created_at.
	);

	// Insert earnings using prepared query.
	// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
	$wpdb->insert(
		$wpdb->prefix . 'tutor_earnings',
		$earnings_data,
		$earnings_format
	);

	// Update course enrollment metadata.
	$enrolled_ids = get_post_meta( $course_id, '_tutor_course_enrolled_ids', true );
	if ( ! is_array( $enrolled_ids ) ) {
		$enrolled_ids = array();
	}
	if ( ! in_array( $user_id, $enrolled_ids, true ) ) {
		$enrolled_ids[] = $user_id;
		update_post_meta( $course_id, '_tutor_course_enrolled_ids', $enrolled_ids );
	}
	update_post_meta( $course_id, '_tutor_enrolled_user_' . $user_id, current_time( 'mysql', 1 ) );
	update_post_meta( $course_id, '_tutor_course_enrollment_status_' . $user_id, 'completed' );

	// Store order metadata.
	update_post_meta(
		$course_id,
		'_tutor_order_' . $order_id,
		wp_json_encode(
			array(
				'order_post_id'  => $order_id,
				'user_id'        => $user_id,
				'amount'         => $final_price,
				'payment_status' => 'paid',
				'created_at'     => current_time( 'mysql', 1 ),
			)
		)
	);

	// Clear Tutor LMS caches.
	$cache_keys = array(
		'tutor_orders_cache',
		'tutor_students_cache',
		'tutor_order_list_cache',
		'tutor_dashboard_orders',
		'tutor_earnings_cache',
		'tutor_student_list_cache',
		'tutor_order_badge_count',
	);
	foreach ( $cache_keys as $cache_key ) {
		delete_transient( $cache_key );
	}

	// Trigger Tutor LMS hooks for proper integration.
	// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound
	do_action( 'tutor_order_after_create', $order_data );
	do_action( 'tutor_after_enroll', $course_id, true );
	do_action( 'tutor_course_enrolled', $course_id, $user_id );
	do_action( 'tutor_enrollment_after', $course_id, $user_id );
	do_action( 'tutor_new_enrollment', $course_id, $user_id );
	do_action( 'tutor_enrollment_created', $course_id, $user_id );
	do_action( 'tutor_after_enrollment_created', $course_id, $user_id );
	do_action( 'tutor_order_payment_status_changed', $order_id, 'completed', 'pending' );
	do_action( 'tutor_order_completed', $order_data );
	do_action( 'tutor_after_order_completed', $order_data );
	do_action( 'tutor_after_payment_received', $order_data );
	do_action( 'tutor_order_updated', $order_data );
	do_action(
		'tutor_order_placed',
		array(
			'id'             => $order_id,
			'order_id'       => $order_id,
			'user_id'        => $user_id,
			'course_id'      => $course_id,
			'amount'         => $final_price,
			'order_type'     => 'single_order',
			'payment_method' => 'stripe',
			'payment_status' => 'completed',
			'items'          => array(
				array(
					'item_id'  => $course_id,
					'quantity' => 1,
					'price'    => $final_price,
				),
			),
		)
	);
	// phpcs:enable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound

	return true;
}

/**
 * Overrides the Tutor LMS enroll form on single course page to integrate Stripe button.
 *
 * @since 1.2.32
 */
function courseflow_override_tutor_enroll_form() {
	if ( ! function_exists( 'tutor_utils' ) || ! is_singular( 'courses' ) ) {
		return;
	}

	global $post;
	$course_id = absint( $post->ID );
	$price     = courseflow_get_tutor_course_price( $course_id );

	if ( 0 === $price ) {
		// Call the original Tutor form for free courses.
		// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound
		do_action( 'tutor_course_single_enroll_form' );
		return;
	}

	$currency    = courseflow_get_tutor_course_currency( $course_id );
	$button_text = esc_html__( 'Buy Course', 'course-flow' );

	echo '<button class="courseflow-stripe-button tutor-btn tutor-btn-primary tutor-btn-lg tutor-btn-block" data-course-id="' . esc_attr( $course_id ) . '" data-course-type="courses" data-price="' . esc_attr( $price ) . '" data-currency="' . esc_attr( $currency ) . '">';
	echo '<span class="tutor-icon-cart-line tutor-mr-8"></span>';
	echo '<span>' . esc_html( $button_text ) . '</span>';
	echo '</button>';
}

/**
 * Disables Tutor LMS WooCommerce migration process if WooCommerce is not active.
 *
 * @since 1.2.32
 */
function courseflow_disable_tutor_wc_migration() {
	if ( ! function_exists( 'tutor_utils' ) ) {
		return;
	}

	// Check if WooCommerce is active.
	if ( ! function_exists( 'WC' ) ) {
		// Remove the WooCommerce migration hook to prevent errors.
		remove_all_actions( 'process_by_wc_migrator' );
	}
}

/**
 * Replaces the Tutor LMS add to cart button on single course page with Stripe button.
 *
 * @since 1.2.32
 */
function courseflow_replace_tutor_add_to_cart_button() {
	if ( ! function_exists( 'tutor_utils' ) || ! is_singular( 'courses' ) ) {
		return;
	}

	global $post;
	$course_id = absint( $post->ID );
	$price     = courseflow_get_tutor_course_price( $course_id );
	$currency  = courseflow_get_tutor_course_currency( $course_id );

	// Fallback if price is zero.
	if ( 0 === $price ) {
		$price = 1.0;
	}

	$button_text = esc_html__( 'Buy Course', 'course-flow' );

	echo '<button class="courseflow-stripe-button tutor-btn tutor-btn-primary tutor-btn-lg tutor-btn-block" data-course-id="' . esc_attr( $course_id ) . '" data-course-type="courses" data-price="' . esc_attr( $price ) . '" data-currency="' . esc_attr( $currency ) . '">';
	echo '<span class="tutor-icon-cart-line tutor-mr-8"></span>';
	echo '<span>' . esc_html( $button_text ) . '</span>';
	echo '</button>';
}

/**
 * Replaces the Tutor LMS buttons section on single course page with Stripe button.
 *
 * @since 1.2.32
 */
function courseflow_replace_tutor_buttons() {
	if ( ! function_exists( 'tutor_utils' ) || ! is_singular( 'courses' ) ) {
		return;
	}

	global $post;
	$course_id = absint( $post->ID );
	$price     = courseflow_get_tutor_course_price( $course_id );
	$currency  = courseflow_get_tutor_course_currency( $course_id );

	// Fallback if price is zero.
	if ( 0 === $price ) {
		$price = 1.0;
	}

	$button_text = esc_html__( 'Buy Course', 'course-flow' );

	echo '<button class="courseflow-stripe-button tutor-btn tutor-btn-primary tutor-btn-lg tutor-btn-block" data-course-id="' . esc_attr( $course_id ) . '" data-course-type="courses" data-price="' . esc_attr( $price ) . '" data-currency="' . esc_attr( $currency ) . '">';
	echo '<span class="tutor-icon-cart-line tutor-mr-8"></span>';
	echo '<span>' . esc_html( $button_text ) . '</span>';
	echo '</button>';
}

/**
 * Enqueues the Stripe override and checkout scripts for Tutor LMS integration.
 *
 * @since 1.2.52
 */
function courseflow_enqueue_tutor_stripe_scripts() {
	if ( ! function_exists( 'tutor_utils' ) ) {
		return;
	}

	// Check for single course, course archive, or custom course list page.
	$is_tutor_page = is_singular( 'courses' ) || is_post_type_archive( 'courses' ) || is_page( 'course-list' ) || 'courses' === get_query_var( 'post_type' );

	if ( ! $is_tutor_page ) {
		return;
	}

	global $post;
	$course_id         = absint( $post ? $post->ID : 0 );
	$fallback_price    = courseflow_get_tutor_course_price( $course_id );
	$fallback_currency = courseflow_get_tutor_course_currency( $course_id );

	// Fallback if price is zero.
	if ( 0 === $fallback_price ) {
		$fallback_price = 1.0;
	}

	// Enqueue Stripe SDK.
	wp_enqueue_script( 'stripe-js', 'https://js.stripe.com/v3/', array(), '3.0', true );

	// Enqueue stripe-tutor-override.js.
	wp_enqueue_script(
		'courseflow-stripe-tutor-override',
		COURSEFLOW_ASSETS_URL . 'js/stripe-tutor-override.js',
		array( 'jquery', 'stripe-js' ),
		COURSEFLOW_VERSION,
		true
	);

	// Enqueue stripe-checkout.js.
	wp_enqueue_script(
		'courseflow-stripe-checkout',
		COURSEFLOW_ASSETS_URL . 'js/stripe-checkout.js',
		array( 'jquery', 'stripe-js' ),
		COURSEFLOW_VERSION,
		true
	);

	// Localize data for stripe-tutor-override.js.
	wp_localize_script(
		'courseflow-stripe-tutor-override',
		'courseflowStripeData',
		array(
			'publishableKey' => get_option( 'courseflow_stripe_publishable_key', '' ),
			'nonce'          => wp_create_nonce( 'wp_rest' ),
			'restUrl'        => rest_url( 'course-flow/v1/create-checkout' ),
			'debugLogUrl'    => rest_url( 'course-flow/v1/debug-log' ),
			'currency'       => $fallback_currency,
		)
	);

	// Fallback inline JS to block Tutor LMS modal and add Stripe button attributes.
	$inline_js = "
	(function($) {
		$(document).ready(function() {
			var buttons = $('.tutor-btn.tutor-btn-outline-primary.tutor-btn-md.tutor-btn-block');
			buttons.each(function() {
				var btn = $(this);
				var courseId = btn.data('course-id');
				if (courseId) {
					btn.removeClass('tutor-open-login-modal');
					btn.addClass('courseflow-stripe-button');
					btn.off('click');
					if (!btn.data('course-type')) {
						btn.attr('data-course-type', 'courses');
					}
					if (!btn.data('price')) {
						btn.attr('data-price', '" . esc_js( $fallback_price ) . "');
					}
					if (!btn.data('currency')) {
						btn.attr('data-currency', '" . esc_js( $fallback_currency ) . "');
					}
				}
			});
		});
	})(jQuery);
	";

	wp_add_inline_script( 'jquery', $inline_js );
}

/**
 * Replaces the Tutor LMS add to cart button in course loop with Stripe button.
 *
 * @since 1.2.35
 */
function courseflow_replace_tutor_loop_add_to_cart_button() {
	global $post;
	$course_id = absint( $post->ID );
	$price     = courseflow_get_tutor_course_price( $course_id );
	$currency  = courseflow_get_tutor_course_currency( $course_id );

	// Fallback if price is zero.
	if ( 0 === $price ) {
		$price = 1.0;
	}

	$button_text = esc_html__( 'Buy Course', 'course-flow' );

	echo '<button class="courseflow-stripe-button tutor-btn tutor-btn-primary tutor-btn-md tutor-btn-block" data-course-id="' . esc_attr( $course_id ) . '" data-course-type="courses" data-price="' . esc_attr( $price ) . '" data-currency="' . esc_attr( $currency ) . '">';
	echo '<span class="tutor-icon-cart-line tutor-mr-8"></span>';
	echo '<span>' . esc_html( $button_text ) . '</span>';
	echo '</button>';
}

/**
 * Removes the Tutor LMS enroll login modal class for integration with Stripe.
 *
 * @since 1.2.35
 * @param string $login_class The original class.
 * @return string Empty string to remove the modal class.
 */
function courseflow_remove_tutor_enroll_login_class( $login_class ) {
	// Explicitly mark parameter as unused to satisfy PHPCS.
	unset( $login_class );
	return '';
}

/**
 * Replaces the Tutor LMS add to cart button HTML in course loop with Stripe button HTML.
 *
 * @since 1.2.35
 * @param string $html      The original button HTML.
 * @param int    $course_id The course ID.
 * @return string The custom Stripe button HTML.
 */
function courseflow_replace_tutor_add_to_cart_btn_html( $html, $course_id ) {
	$course_id = absint( $course_id );
	$price     = courseflow_get_tutor_course_price( $course_id );
	$currency  = courseflow_get_tutor_course_currency( $course_id );

	// Fallback if price is zero.
	if ( 0 === $price ) {
		$price = 1.0;
	}

	$button_text = esc_html__( 'Buy Course', 'course-flow' );
	$new_html    = '<button class="courseflow-stripe-button tutor-btn tutor-btn-primary tutor-btn-md tutor-btn-block" data-course-id="' . esc_attr( $course_id ) . '" data-course-type="courses" data-price="' . esc_attr( $price ) . '" data-currency="' . esc_attr( $currency ) . '">';
	$new_html   .= '<span class="tutor-icon-cart-line tutor-mr-8"></span>';
	$new_html   .= '<span>' . esc_html( $button_text ) . '</span>';
	$new_html   .= '</button>';

	return $new_html;
}

// Hook to override Tutor enroll form, buttons, and disable migration if needed.
add_action(
	'plugins_loaded',
	function () {
		if ( function_exists( 'tutor_utils' ) ) {
			remove_all_actions( 'tutor_course_single_enroll_form' );
			add_action( 'tutor_course_single_enroll_form', 'courseflow_override_tutor_enroll_form' );

			remove_all_actions( 'tutor_course_single_add_to_cart_form' );
			add_action( 'tutor_course_single_add_to_cart_form', 'courseflow_replace_tutor_add_to_cart_button' );

			remove_all_actions( 'tutor_course_single_buttons' );
			add_action( 'tutor_course_single_buttons', 'courseflow_replace_tutor_buttons' );

			remove_action( 'tutor_course_loop_button', 'tutor_course_loop_add_to_cart', 10 );
			add_action( 'tutor_course_loop_button', 'courseflow_replace_tutor_loop_add_to_cart_button', 10 );

			courseflow_disable_tutor_wc_migration();
		}
	},
	21
);

// Hook to enqueue Stripe scripts for Tutor LMS integration.
add_action( 'wp_enqueue_scripts', 'courseflow_enqueue_tutor_stripe_scripts', 100 );

// Hook to remove Tutor LMS login modal class.
add_filter( 'tutor_enroll_required_login_class', 'courseflow_remove_tutor_enroll_login_class', 99 );

// Hook to replace Tutor LMS add to cart button HTML in course loop.
add_filter( 'tutor_add_to_cart_btn', 'courseflow_replace_tutor_add_to_cart_btn_html', 999, 2 );
