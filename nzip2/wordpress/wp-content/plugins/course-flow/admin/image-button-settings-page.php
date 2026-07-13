<?php
/**
 * File: admin/image-button-settings-page.php
 * Description: Renders the Image Button Settings page with React integration.
 * Version: 2.0.3
 * Author: Pawel Borowiec
 * Text Domain: course-flow
 *
 * @package CourseFlow
 */

defined( 'ABSPATH' ) || exit;

/**
 * Render the Image Button Settings page container for React.
 *
 * @since 2.0.0
 * @return void
 */
function courseflow_image_button_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'course-flow' ) );
	}

	?>
	<div class="wrap courseflow-image-button-settings-wrapper">
		<h1></h1>
		<!-- React root will be injected by react-app-loader.php -->
	</div>
	<?php
}

// phpcs:ignore WordPress.CodeAnalysis.UnusedMethodParameters -- Required by WP REST API callback signature.
/**
 * REST API endpoint to get image button settings.
 *
 * @since 2.0.0
 * @param WP_REST_Request $request REST request object.
 * @return WP_REST_Response Response with settings data.
 */
function courseflow_rest_get_image_button_settings( WP_REST_Request $request ) {
	if ( ! current_user_can( 'manage_options' ) ) {
		return new WP_REST_Response(
			array(
				'success' => false,
				'message' => __( 'Insufficient permissions.', 'course-flow' ),
			),
			403
		);
	}

	$settings = array(
		'image_url'             => sanitize_text_field( get_option( 'courseflow_image_button_url', '' ) ),
		'image_alt'             => sanitize_text_field( get_option( 'courseflow_image_button_alt', '' ) ),
		'image_width'           => absint( get_option( 'courseflow_image_button_width', 150 ) ),
		'image_height'          => absint( get_option( 'courseflow_image_button_height', 40 ) ),
		'use_original_size'     => absint( get_option( 'courseflow_image_button_original_size', 0 ) ),
		'maintain_aspect_ratio' => absint( get_option( 'courseflow_image_button_maintain_aspect_ratio', 1 ) ),
	);

	return rest_ensure_response(
		array(
			'success'  => true,
			'settings' => $settings,
		)
	);
}

// phpcs:ignore WordPress.CodeAnalysis.UnusedMethodParameters -- Required by WP REST API callback signature.
/**
 * REST API endpoint to save image button settings.
 *
 * @since 2.0.0
 * @param WP_REST_Request $request REST request object.
 * @return WP_REST_Response Response with save status.
 */
function courseflow_rest_save_image_button_settings( WP_REST_Request $request ) {
	if ( ! current_user_can( 'manage_options' ) ) {
		return new WP_REST_Response(
			array(
				'success' => false,
				'message' => __( 'Insufficient permissions.', 'course-flow' ),
			),
			403
		);
	}

	$params = $request->get_json_params();
	if ( ! is_array( $params ) ) {
		return new WP_REST_Response(
			array(
				'success' => false,
				'message' => __( 'Invalid request data.', 'course-flow' ),
			),
			400
		);
	}

	// Sanitize and validate input.
	$image_url             = isset( $params['image_url'] ) ? esc_url_raw( $params['image_url'] ) : '';
	$image_alt             = isset( $params['image_alt'] ) ? sanitize_text_field( $params['image_alt'] ) : '';
	$image_width           = isset( $params['image_width'] ) ? absint( $params['image_width'] ) : 150;
	$image_height          = isset( $params['image_height'] ) ? absint( $params['image_height'] ) : 40;
	$use_original_size     = isset( $params['use_original_size'] ) ? absint( $params['use_original_size'] ) : 0;
	$maintain_aspect_ratio = isset( $params['maintain_aspect_ratio'] ) ? absint( $params['maintain_aspect_ratio'] ) : 1;

	// Validate dimensions.
	if ( $image_width < 1 || $image_width > 5000 ) {
		$image_width = 150;
	}
	if ( $image_height < 1 || $image_height > 2000 ) {
		$image_height = 40;
	}

	// Save options.
	update_option( 'courseflow_image_button_url', $image_url );
	update_option( 'courseflow_image_button_alt', $image_alt );
	update_option( 'courseflow_image_button_width', $image_width );
	update_option( 'courseflow_image_button_height', $image_height );
	update_option( 'courseflow_image_button_original_size', $use_original_size );
	update_option( 'courseflow_image_button_maintain_aspect_ratio', $maintain_aspect_ratio );

	return rest_ensure_response(
		array(
			'success' => true,
			'message' => __( 'Settings saved successfully.', 'course-flow' ),
		)
	);
}

// phpcs:ignore WordPress.CodeAnalysis.UnusedMethodParameters -- Required by WP REST API callback signature.
/**
 * REST API endpoint to get courses for shortcodes.
 *
 * @since 2.0.0
 * @param WP_REST_Request $request REST request object.
 * @return WP_REST_Response Response with courses data.
 */
function courseflow_rest_get_image_button_courses( WP_REST_Request $request ) {
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

	// Tutor LMS Courses.
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
			$course_id = absint( $course->ID );
			$courses[] = array(
				'id'        => $course_id,
				'title'     => sanitize_text_field( $course->post_title ),
				'shortcode' => '[courseflow_imagebuycourse id="' . $course_id . '"]',
				'lms_type'  => 'Tutor LMS',
			);
		}
	}

	// LearnPress Courses.
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
			$course_id = absint( $course->ID );
			$courses[] = array(
				'id'        => $course_id,
				'title'     => sanitize_text_field( $course->post_title ),
				'shortcode' => '[courseflow_imagebuycourse id="' . $course_id . '"]',
				'lms_type'  => 'LearnPress',
			);
		}
	}

	// LearnDash Courses.
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
			$course_id = absint( $course->ID );
			$courses[] = array(
				'id'        => $course_id,
				'title'     => sanitize_text_field( $course->post_title ),
				'shortcode' => '[courseflow_imagebuycourse id="' . $course_id . '"]',
				'lms_type'  => 'LearnDash',
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
 * Register REST API routes for Image Button Settings page.
 *
 * @since 2.0.0
 * @return void
 */
function courseflow_register_image_button_rest_routes() {
	register_rest_route(
		'course-flow/v1',
		'/image-button-settings',
		array(
			'methods'             => 'GET',
			'callback'            => 'courseflow_rest_get_image_button_settings',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);

	register_rest_route(
		'course-flow/v1',
		'/image-button-settings',
		array(
			'methods'             => 'POST',
			'callback'            => 'courseflow_rest_save_image_button_settings',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);

	register_rest_route(
		'course-flow/v1',
		'/image-button-courses',
		array(
			'methods'             => 'GET',
			'callback'            => 'courseflow_rest_get_image_button_courses',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
}
add_action( 'rest_api_init', 'courseflow_register_image_button_rest_routes', 26 );
