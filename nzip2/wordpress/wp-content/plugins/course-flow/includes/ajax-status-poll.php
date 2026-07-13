<?php
/**
 * Admin AJAX endpoint: courseflow_pro_status_poll
 *
 * Returns the current license status for the site as JSON.
 * Author: Pawel Borowiec
 * Text Domain: course-flow
 *
 * @package CourseFlow
 * @since   1.0.0
 */

defined( 'ABSPATH' ) || exit;

/**
 * AJAX handler: return license status.
 *
 * @return void
 */
function courseflow_pro_ajax_status_poll() {
	// Permission + nonce checks.
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_send_json_error( array( 'message' => __( 'Permission denied', 'course-flow' ) ), 403 );
	}

	check_ajax_referer( 'courseflow_pro_ajax', 'nonce' );

	// Try official function first.
	if ( function_exists( 'courseflow_pro_get_remote_license_status' ) ) {
		$status = courseflow_pro_get_remote_license_status();
	} elseif ( function_exists( 'courseflow_pro_get_status_cached' ) ) {
		$status = courseflow_pro_get_status_cached();
	} elseif ( function_exists( 'cfpf_fetch_license_status' ) ) {
		// fallback from admin-local implementations used earlier.
		$status = cfpf_fetch_license_status();
	} else {
		wp_send_json_error( array( 'message' => __( 'Status function unavailable.', 'course-flow' ) ), 500 );
	}

	if ( ! is_array( $status ) ) {
		wp_send_json_error( array( 'message' => __( 'Unable to fetch license status from vendor.', 'course-flow' ) ), 500 );
	}

	wp_send_json_success( array( 'status' => $status ) );
}
add_action( 'wp_ajax_courseflow_pro_status_poll', 'courseflow_pro_ajax_status_poll' );
