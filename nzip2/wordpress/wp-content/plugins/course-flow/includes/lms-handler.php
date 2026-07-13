<?php
/**
 * File: lms-handler.php
 * Description: Handles integration with various LMS systems (Tutor, LearnPress, LearnDash) for the Course Flow plugin.
 * Author: Pawel Borowiec
 * Text Domain: course-flow
 *
 * @since 1.0.0
 * @package CourseFlow
 */

defined( 'ABSPATH' ) || exit;

// Include integration files with updated Course Flow prefixes.
require_once COURSEFLOW_PATH . 'includes/tutor-integration.php';
require_once COURSEFLOW_PATH . 'includes/courseflow-lp-integration.php';
require_once COURSEFLOW_PATH . 'includes/learndash-integration.php';

/**
 * Check if a specific LMS is active.
 *
 * @since 1.4.36
 *
 * @param string $lms_type The LMS type to check ('tutor', 'courseflow_lp', 'learndash').
 * @return bool True if the LMS is active, false otherwise.
 */
function courseflow_is_lms_active( $lms_type ) {
	$lms_type = sanitize_text_field( $lms_type );
	$active   = false;

	switch ( $lms_type ) {
		case 'tutor':
			$active = function_exists( 'tutor' );
			break;
		case 'courseflow_lp':
			$active = class_exists( 'LearnPress' );
			break;
		case 'learndash':
			$active = class_exists( 'SFWD_LMS' );
			break;
	}

	return $active;
}

/**
 * Get the price of a course based on LMS type.
 *
 * @since 1.4.36
 *
 * @param int    $course_id The course ID.
 * @param string $lms_type  The LMS type ('tutor', 'courseflow_lp', 'learndash').
 * @return float The course price.
 */
function courseflow_get_course_price( $course_id, $lms_type ) {
	$course_id = absint( $course_id );
	$lms_type  = sanitize_text_field( $lms_type );
	$price     = 0.0;

	switch ( $lms_type ) {
		case 'tutor':
			$sale_price    = get_post_meta( $course_id, 'tutor_course_sale_price', true );
			$regular_price = get_post_meta( $course_id, 'tutor_course_price', true );
			$price         = $sale_price ? (float) $sale_price : (float) $regular_price;
			break;
		case 'courseflow_lp':
			$price = courseflow_get_lp_course_price( $course_id );
			break;
		case 'learndash':
			$meta  = get_post_meta( $course_id, '_sfwd-courses', true );
			$price = isset( $meta['sfwd-courses_course_price'] ) ? (float) $meta['sfwd-courses_course_price'] : 0.0;
			break;
	}

	// Fallback: minimum 1.0 for Stripe.
	if ( $price <= 0 ) {
		$price = 1.0;
	}

	return $price;
}

/**
 * Retrieves the course currency based on the LMS type.
 *
 * @since 1.4.36
 * @param int $course_id The course ID.
 * @return string The course currency code (e.g., 'USD').
 */
function courseflow_get_course_currency( $course_id ) {
	$course_id = absint( $course_id );

	if ( $course_id <= 0 ) {
		return 'USD';
	}

	$post_type = get_post_type( $course_id );

	if ( ! $post_type ) {
		return 'USD';
	}

	switch ( $post_type ) {
		case 'courses': // Tutor LMS.
			return courseflow_get_tutor_course_currency( $course_id );
		case 'lp_course': // LearnPress (original post type).
			return courseflow_get_lp_course_currency();
		case 'sfwd-courses': // LearnDash.
			if ( function_exists( 'courseflow_get_learndash_course_currency' ) ) {
				return courseflow_get_learndash_course_currency( $course_id );
			}
			return get_option( 'courseflow_default_currency', 'USD' );
		default:
			return get_option( 'courseflow_default_currency', 'USD' );
	}
}

/**
 * Grants access to the course for the specified user based on the LMS type.
 *
 * @since 1.4.36
 * @param int    $course_id  The ID of the course.
 * @param string $user_email The email of the user.
 * @param string $session_id The Stripe session ID.
 * @param string $lms_type   The type of LMS ('learndash', 'courseflow_lp', 'tutor').
 * @param string $currency   The currency code from the payment.
 * @return bool True on success, false on failure.
 */
function courseflow_grant_course_access( $course_id, $user_email, $session_id, $lms_type, $currency = 'USD' ) {
	$course_id  = absint( $course_id );
	$user_email = sanitize_email( $user_email );
	$session_id = sanitize_text_field( $session_id );
	$lms_type   = sanitize_text_field( $lms_type );
	$currency   = strtoupper( sanitize_text_field( $currency ) );

	// Validate inputs.
	if ( $course_id <= 0 || ! is_email( $user_email ) || empty( $lms_type ) ) {
		return false;
	}

	// Create or get user.
	$user_id = courseflow_create_wp_user( $user_email );
	if ( ! $user_id ) {
		return false;
	}

	// Optional auto-login.
	if ( get_option( 'courseflow_auto_create_account', 1 ) ) {
		courseflow_login_user( $user_id );
	}

	// Grant access based on LMS type.
	switch ( $lms_type ) {
		case 'learndash':
			if ( ! function_exists( 'ld_update_course_access' ) ) {
				return false;
			}

			ld_update_course_access( $user_id, $course_id, false );

			// Idempotency check: Ensure transaction doesn't already exist for this session using options.
			$processed_transactions = get_option( 'courseflow_processed_transactions', array() );
			if ( in_array( $session_id, $processed_transactions, true ) ) {
				// Transaction already processed, skip creation.
				return true;
			}

			$transaction_id = wp_insert_post(
				array(
					'post_title'  => esc_html__( 'Transaction', 'course-flow' ) . ' ' . $session_id,
					'post_type'   => 'sfwd-transactions',
					'post_status' => 'publish',
					'post_author' => $user_id,
					'post_parent' => $course_id,
				)
			);

			if ( is_wp_error( $transaction_id ) ) {
				return false;
			}

			// Mark transaction as processed.
			$processed_transactions[] = $session_id;
			update_option( 'courseflow_processed_transactions', $processed_transactions );

			update_post_meta( $transaction_id, 'stripe_session_id', $session_id );
			update_post_meta(
				$transaction_id,
				'courseflow_transaction_details',
				array(
					'stripe_session_id' => $session_id,
					'currency'          => $currency,
				)
			);

			return true;
		case 'courseflow_lp':
			// Delegate to Course Flow LearnPress integration.
			return courseflow_grant_lp_course_access( $course_id, $user_email, $session_id, $currency );
		case 'tutor':
			// Delegate to Tutor integration.
			return courseflow_grant_tutor_course_access( $course_id, $user_email, $session_id );
		default:
			return false;
	}
}
