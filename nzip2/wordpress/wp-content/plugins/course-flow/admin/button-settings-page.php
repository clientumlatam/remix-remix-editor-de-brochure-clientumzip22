<?php
/**
 * File: admin/button-settings-page.php
 * Description: Renders the Button Settings admin page and handles REST API endpoints.
 * Author: Pawel Borowiec
 * Text Domain: course-flow
 *
 * @package CourseFlow
 */

defined( 'ABSPATH' ) || exit;

/**
 * Render the Button Settings admin page container for React.
 *
 * This function must use the standard WordPress admin layout (.wrap)
 * to prevent the admin sidebar from overlapping the content.
 *
 * @since 2.0.0
 * @return void
 */
function courseflow_button_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die(
			esc_html__( 'You do not have sufficient permissions to access this page.', 'course-flow' )
		);
	}
	?>
	<div class="wrap course-flow-admin course-flow-button-settings">

		<h1 class="wp-heading-inline">
			<?php echo esc_html( '', 'course-flow' ); ?>
		</h1>

		<hr class="wp-header-end">

		<div id="courseflow-admin-root"></div>

	</div>
	<?php
}

/**
 * REST API endpoint to get button settings.
 *
 * @since 2.0.0
 * @param WP_REST_Request $request REST request object.
 * @return WP_REST_Response Response with settings data.
 */
function courseflow_rest_get_button_settings( WP_REST_Request $request ) {
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
		'button_text'            => sanitize_text_field( get_option( 'courseflow_course_button_text', 'Buy Now' ) ),
		'font_family'            => sanitize_text_field( get_option( 'courseflow_button_font_family', 'Poppins' ) ),
		'font_size'              => absint( get_option( 'courseflow_button_font_size', 16 ) ),
		'text_color'             => sanitize_hex_color( get_option( 'courseflow_button_text_color', '#ffffff' ) ),
		'background_color'       => sanitize_hex_color( get_option( 'courseflow_button_background_color', '#5469d4' ) ),
		'border_color'           => sanitize_hex_color( get_option( 'courseflow_button_border_color', '#5469d4' ) ),
		'button_height'          => absint( get_option( 'courseflow_button_height', 40 ) ),
		'button_width'           => absint( get_option( 'courseflow_button_width', 150 ) ),
		'border_radius'          => absint( get_option( 'courseflow_button_border_radius', 5 ) ),
		'border_width'           => absint( get_option( 'courseflow_button_border_width', 1 ) ),
		'border_style'           => sanitize_text_field( get_option( 'courseflow_button_border_style', 'solid' ) ),
		'shadow_x'               => intval( get_option( 'courseflow_button_shadow_x', 0 ) ),
		'shadow_y'               => intval( get_option( 'courseflow_button_shadow_y', 0 ) ),
		'shadow_blur'            => absint( get_option( 'courseflow_button_shadow_blur', 0 ) ),
		'shadow_spread'          => absint( get_option( 'courseflow_button_shadow_spread', 0 ) ),
		'shadow_color'           => sanitize_hex_color( get_option( 'courseflow_button_shadow_color', '#000000' ) ),
		'background_color_hover' => sanitize_hex_color( get_option( 'courseflow_button_background_color_hover', '#5469d4' ) ),
		'text_color_hover'       => sanitize_hex_color( get_option( 'courseflow_button_text_color_hover', '#ffffff' ) ),
	);

	return rest_ensure_response(
		array(
			'success'  => true,
			'settings' => $settings,
		)
	);
}

/**
 * REST API endpoint to save button settings.
 *
 * @since 2.0.0
 * @param WP_REST_Request $request REST request object.
 * @return WP_REST_Response Response with save status.
 */
function courseflow_rest_save_button_settings( WP_REST_Request $request ) {
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

	$sanitized = array(
		'courseflow_course_button_text'            => sanitize_text_field( $params['button_text'] ?? 'Buy Now' ),
		'courseflow_button_font_family'            => sanitize_text_field( $params['font_family'] ?? 'Poppins' ),
		'courseflow_button_font_size'              => absint( $params['font_size'] ?? 16 ),
		'courseflow_button_text_color'             => sanitize_hex_color( $params['text_color'] ?? '#ffffff' ),
		'courseflow_button_background_color'       => sanitize_hex_color( $params['background_color'] ?? '#5469d4' ),
		'courseflow_button_border_color'           => sanitize_hex_color( $params['border_color'] ?? '#5469d4' ),
		'courseflow_button_height'                 => absint( $params['button_height'] ?? 40 ),
		'courseflow_button_width'                  => absint( $params['button_width'] ?? 150 ),
		'courseflow_button_border_radius'          => absint( $params['border_radius'] ?? 5 ),
		'courseflow_button_border_width'           => absint( $params['border_width'] ?? 1 ),
		'courseflow_button_border_style'           => sanitize_text_field( $params['border_style'] ?? 'solid' ),
		'courseflow_button_shadow_x'               => intval( $params['shadow_x'] ?? 0 ),
		'courseflow_button_shadow_y'               => intval( $params['shadow_y'] ?? 0 ),
		'courseflow_button_shadow_blur'            => absint( $params['shadow_blur'] ?? 0 ),
		'courseflow_button_shadow_spread'          => absint( $params['shadow_spread'] ?? 0 ),
		'courseflow_button_shadow_color'           => sanitize_hex_color( $params['shadow_color'] ?? '#000000' ),
		'courseflow_button_background_color_hover' => sanitize_hex_color( $params['background_color_hover'] ?? '#5469d4' ),
		'courseflow_button_text_color_hover'       => sanitize_hex_color( $params['text_color_hover'] ?? '#ffffff' ),
	);

	foreach ( $sanitized as $option => $value ) {
		update_option( $option, $value );
	}

	return rest_ensure_response(
		array(
			'success' => true,
			'message' => __( 'Settings saved successfully.', 'course-flow' ),
		)
	);
}

/**
 * Register REST API routes for Button Settings.
 *
 * @since 2.0.0
 * @return void
 */
function courseflow_register_button_settings_rest_routes() {
	register_rest_route(
		'course-flow/v1',
		'/button-settings',
		array(
			'methods'             => 'GET',
			'callback'            => 'courseflow_rest_get_button_settings',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);

	register_rest_route(
		'course-flow/v1',
		'/button-settings',
		array(
			'methods'             => 'POST',
			'callback'            => 'courseflow_rest_save_button_settings',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
}
add_action( 'rest_api_init', 'courseflow_register_button_settings_rest_routes', 27 );

