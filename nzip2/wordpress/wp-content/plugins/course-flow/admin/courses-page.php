<?php
/**
 * File: admin/courses-page.php
 * Description: Renders the Courses page with React integration.
 * Version: 2.0.4
 * Author: Pawel Borowiec
 * Text Domain: course-flow
 *
 * @package CourseFlow
 */

defined( 'ABSPATH' ) || exit;

/**
 * Remove old menu registration and patch it for all React views.
 *
 * This function removes the original admin_menu hook and replaces it with a patched version
 * that excludes ALL React-migrated submenus: Courses, Button Settings, and Image Button Settings.
 * These will be re-registered individually with their own React views.
 *
 * @since 2.0.4
 * @return void
 */
function courseflow_patch_admin_menu_for_all_react_views() {
	remove_action( 'admin_menu', 'courseflow_add_admin_menu' );
	add_action( 'admin_menu', 'courseflow_add_admin_menu_patched_for_react', 5 );
}
add_action( 'plugins_loaded', 'courseflow_patch_admin_menu_for_all_react_views', 5 );

/**
 * Patched admin menu WITHOUT React-migrated submenus.
 *
 * This is a patched version of courseflow_add_admin_menu() that excludes:
 * - Courses (React)
 * - Button Settings (React)
 * - Image Button Settings (React)
 *
 * These three submenus will be registered separately with React views.
 *
 * @since 2.0.4
 * @return void
 */
function courseflow_add_admin_menu_patched_for_react() {
	// Top-level menu entry.
	add_menu_page(
		esc_html__( 'Course Flow', 'course-flow' ),
		esc_html__( 'Course Flow', 'course-flow' ),
		'manage_options',
		'courseflow-settings',
		'courseflow_settings_page',
		'dashicons-money-alt',
		62
	);

	// Settings submenu (React view).
	add_submenu_page(
		'courseflow-settings',
		esc_html__( 'Settings', 'course-flow' ),
		esc_html__( 'Settings', 'course-flow' ),
		'manage_options',
		'courseflow-settings',
		'courseflow_settings_page'
	);

	// Courses submenu - REMOVED (will be registered with React view).
	// Button Settings submenu - REMOVED (will be registered with React view).
	// Image Button Settings submenu - REMOVED (will be registered with React view).

	// PRO submenu label is dynamic to improve UX after activation.
	$pro_label = function_exists( 'courseflow_get_pro_submenu_label' )
		? courseflow_get_pro_submenu_label()
		: __( 'Upgrade to Pro', 'course-flow' );

	// PRO License submenu.
	add_submenu_page(
		'courseflow-settings',
		$pro_label,
		$pro_label,
		'manage_options',
		'courseflow-pro-upgrade',
		'courseflow_pro_upgrade_page_callback'
	);
}

/**
 * Render the Courses page container for React.
 *
 * This function only outputs the React root container. The React app
 * handles all rendering via the courseflow-admin-root element.
 *
 * @since 2.0.0
 * @return void
 */
function courseflow_courses_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'course-flow' ) );
	}

	?>
	<div class="wrap courseflow-courses-wrapper">
		<h1></h1>
		<!-- React root will be injected by react-app-loader.php -->
	</div>
	<?php
}

// phpcs:ignore WordPress.CodeAnalysis.UnusedMethodParameters -- Required by WP REST API callback signature.
/**
 * REST API endpoint to fetch all courses from active LMS systems.
 *
 * Fetches courses from Tutor LMS, LearnPress, and LearnDash, returning
 * complete course information including ID, title, price, currency, and purchase URL.
 *
 * @since 2.0.0
 * @param WP_REST_Request $request REST request object.
 * @return WP_REST_Response Response with courses data.
 */
function courseflow_rest_get_courses( WP_REST_Request $request ) {
	if ( ! current_user_can( 'manage_options' ) ) {
		return new WP_REST_Response(
			array(
				'success' => false,
				'message' => __( 'Insufficient permissions.', 'course-flow' ),
			),
			403
		);
	}

	$courses = array();

	// Fetch Tutor LMS courses.
	if ( function_exists( 'tutor_utils' ) ) {
		$tutor_courses = get_posts(
			array(
				'post_type'      => 'courses',
				'posts_per_page' => -1,
				'post_status'    => 'publish',
				'orderby'        => 'title',
				'order'          => 'ASC',
			)
		);

		foreach ( $tutor_courses as $course ) {
			$course_id    = absint( $course->ID );
			$price        = function_exists( 'courseflow_get_tutor_course_price' ) ? courseflow_get_tutor_course_price( $course_id ) : 0.0;
			$currency     = function_exists( 'courseflow_get_tutor_course_currency' ) ? courseflow_get_tutor_course_currency( $course_id ) : 'USD';
			$purchase_url = function_exists( 'courseflow_get_course_purchase_url' ) ? courseflow_get_course_purchase_url( $course_id ) : '';

			$courses[] = array(
				'id'           => $course_id,
				'title'        => sanitize_text_field( $course->post_title ),
				'price'        => floatval( $price ),
				'currency'     => sanitize_text_field( $currency ),
				'purchase_url' => esc_url_raw( $purchase_url ),
				'lms_type'     => 'Tutor LMS',
				'post_type'    => 'courses',
			);
		}
	}

	// Fetch LearnPress courses.
	if ( class_exists( 'LearnPress' ) ) {
		$lp_courses = get_posts(
			array(
				'post_type'      => 'lp_course',
				'posts_per_page' => -1,
				'post_status'    => 'publish',
				'orderby'        => 'title',
				'order'          => 'ASC',
			)
		);

		foreach ( $lp_courses as $course ) {
			$course_id    = absint( $course->ID );
			$price        = function_exists( 'courseflow_get_lp_course_price' ) ? courseflow_get_lp_course_price( $course_id ) : 0.0;
			$currency     = function_exists( 'courseflow_get_lp_course_currency' ) ? courseflow_get_lp_course_currency( $course_id ) : 'USD';
			$purchase_url = function_exists( 'courseflow_get_course_purchase_url' ) ? courseflow_get_course_purchase_url( $course_id ) : '';

			$courses[] = array(
				'id'           => $course_id,
				'title'        => sanitize_text_field( $course->post_title ),
				'price'        => floatval( $price ),
				'currency'     => sanitize_text_field( $currency ),
				'purchase_url' => esc_url_raw( $purchase_url ),
				'lms_type'     => 'LearnPress',
				'post_type'    => 'lp_course',
			);
		}
	}

	// Fetch LearnDash courses.
	if ( class_exists( 'SFWD_LMS' ) ) {
		$ld_courses = get_posts(
			array(
				'post_type'      => 'sfwd-courses',
				'posts_per_page' => -1,
				'post_status'    => 'publish',
				'orderby'        => 'title',
				'order'          => 'ASC',
			)
		);

		foreach ( $ld_courses as $course ) {
			$course_id    = absint( $course->ID );
			$price_data   = function_exists( 'courseflow_get_learndash_course_price' ) ? courseflow_get_learndash_course_price( $course_id ) : array();
			$price        = isset( $price_data['price'] ) ? floatval( $price_data['price'] ) : 0.0;
			$currency     = isset( $price_data['currency'] ) ? sanitize_text_field( $price_data['currency'] ) : 'USD';
			$purchase_url = function_exists( 'courseflow_get_course_purchase_url' ) ? courseflow_get_course_purchase_url( $course_id ) : '';

			$courses[] = array(
				'id'           => $course_id,
				'title'        => sanitize_text_field( $course->post_title ),
				'price'        => floatval( $price ),
				'currency'     => sanitize_text_field( $currency ),
				'purchase_url' => esc_url_raw( $purchase_url ),
				'lms_type'     => 'LearnDash',
				'post_type'    => 'sfwd-courses',
			);
		}
	}

	return rest_ensure_response(
		array(
			'success' => true,
			'courses' => $courses,
			'total'   => count( $courses ),
		)
	);
}

/**
 * Register REST API routes for Courses page.
 *
 * Registers the /courses endpoint for fetching course data from active LMS systems.
 *
 * @since 2.0.0
 * @return void
 */
function courseflow_register_courses_rest_routes() {
	register_rest_route(
		'course-flow/v1',
		'/courses',
		array(
			'methods'             => 'GET',
			'callback'            => 'courseflow_rest_get_courses',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
}
add_action( 'rest_api_init', 'courseflow_register_courses_rest_routes', 25 );
