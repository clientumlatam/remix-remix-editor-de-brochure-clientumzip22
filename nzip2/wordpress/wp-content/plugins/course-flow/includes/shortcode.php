<?php
/**
 * File: shortcode.php
 * Description: Defines shortcodes for Stripe payment buttons in the Course Flow plugin.
 * Version: 1.0.2
 * Author: Pawel Borowiec
 * Text Domain: course-flow
 *
 * @package CourseFlow
 */

defined( 'ABSPATH' ) || exit;

/**
 * Register shortcodes.
 *
 * Registers shortcodes for displaying course information and purchase buttons.
 *
 * @since 1.0.0
 */
function courseflow_register_shortcodes() {
	add_shortcode( 'courseflow_course', 'courseflow_course_shortcode' );
	add_shortcode( 'courseflow_buycourse', 'courseflow_buycourse_shortcode' );
	add_shortcode( 'courseflow_imagebuycourse', 'courseflow_imagebuycourse_shortcode' );
}
add_action( 'init', 'courseflow_register_shortcodes' );

/**
 * Maps post type to LMS type for compatibility with courseflow_is_lms_active.
 *
 * @since 1.9.11
 *
 * @param string $post_type The post type of the course.
 * @return string
 */
function courseflow_map_post_type_to_lms_type( $post_type ) {
	$post_type = sanitize_text_field( $post_type );

	switch ( $post_type ) {
		case 'courses':
			return 'tutor';
		case 'courseflow_lp_course':
		case 'lp_course':
			return 'courseflow_lp';
		case 'sfwd-courses':
			return 'learndash';
		default:
			return '';
	}
}

/**
 * Enqueue frontend stylesheet, inline styles and required scripts for shortcodes.
 *
 * Uses existing assets/css/frontend.css and assets/js/stripe-checkout.js.
 * Also enqueues Stripe.js SDK and localizes courseflowStripeData.
 *
 * @return void
 */
function courseflow_enqueue_frontend_for_shortcode() {
	$style_handle  = 'courseflow-frontend-styles';
	$script_handle = 'courseflow-stripe-checkout';
	$stripe_handle = 'stripe-js';

	// Register and enqueue frontend stylesheet.
	if ( ! wp_style_is( $style_handle, 'registered' ) ) {
		wp_register_style(
			$style_handle,
			COURSEFLOW_ASSETS_URL . 'css/frontend.css',
			array(),
			defined( 'COURSEFLOW_VERSION' ) ? COURSEFLOW_VERSION : false
		);
	}
	if ( ! wp_style_is( $style_handle, 'enqueued' ) ) {
		wp_enqueue_style( $style_handle );
	}

	// Build inline CSS derived from admin Button Settings (same logic as original).
	$custom_css  = '.courseflow-stripe-button {';
	$custom_css .= 'font-family: ' . esc_attr( get_option( 'courseflow_button_font_family', '\'Arial\', Helvetica, sans-serif' ) ) . ';';
	$custom_css .= 'font-size: ' . esc_attr( absint( get_option( 'courseflow_button_font_size', 16 ) ) ) . 'px;';
	$custom_css .= 'color: ' . esc_attr( get_option( 'courseflow_button_text_color', '#ffffff' ) ) . ';';
	$custom_css .= 'background-color: ' . esc_attr( get_option( 'courseflow_button_background_color', '#6772e5' ) ) . ';';
	$custom_css .= 'border-color: ' . esc_attr( get_option( 'courseflow_button_border_color', '#6772e5' ) ) . ';';
	$custom_css .= 'height: ' . esc_attr( absint( get_option( 'courseflow_button_height', 40 ) ) ) . 'px;';
	$custom_css .= 'width: ' . esc_attr( absint( get_option( 'courseflow_button_width', 150 ) ) ) . 'px;';
	$custom_css .= 'border-radius: ' . esc_attr( absint( get_option( 'courseflow_button_border_radius', 5 ) ) ) . 'px;';
	$custom_css .= 'border-width: ' . esc_attr( absint( get_option( 'courseflow_button_border_width', 1 ) ) ) . 'px;';
	$custom_css .= 'border-style: ' . esc_attr( get_option( 'courseflow_button_border_style', 'solid' ) ) . ';';
	$custom_css .= 'box-shadow: ' . esc_attr( intval( get_option( 'courseflow_button_shadow_x', 0 ) ) ) . 'px ' . esc_attr( intval( get_option( 'courseflow_button_shadow_y', 0 ) ) ) . 'px ' . esc_attr( intval( get_option( 'courseflow_button_shadow_blur', 0 ) ) ) . 'px ' . esc_attr( intval( get_option( 'courseflow_button_shadow_spread', 0 ) ) ) . 'px ' . esc_attr( get_option( 'courseflow_button_shadow_color', '#000000' ) ) . ';';
	$custom_css .= 'display: flex; align-items: center; justify-content: center; text-decoration: none !important; transition: all 0.3s ease;';
	$custom_css .= '}';
	$custom_css .= '.courseflow-stripe-button:hover {background-color: ' . esc_attr( get_option( 'courseflow_button_background_color_hover', '#5469d4' ) ) . '; color: ' . esc_attr( get_option( 'courseflow_button_text_color_hover', '#ffffff' ) ) . '; text-decoration: none !important;}';
	$custom_css .= '.courseflow-stripe-button:active, .courseflow-stripe-button:focus {background-color: ' . esc_attr( get_option( 'courseflow_button_background_color_hover', '#5469d4' ) ) . '; color: ' . esc_attr( get_option( 'courseflow_button_text_color_hover', '#ffffff' ) ) . '; outline: none; text-decoration: none !important;}';
	$custom_css .= '.courseflow-stripe-image-button {cursor: pointer; transition: opacity 0.3s ease;';
	if ( ! get_option( 'courseflow_image_button_original_size', 0 ) ) {
		$custom_css .= 'width: ' . esc_attr( absint( get_option( 'courseflow_image_button_width', 150 ) ) ) . 'px;';
		$custom_css .= 'height: ' . esc_attr( absint( get_option( 'courseflow_image_button_height', 40 ) ) ) . 'px;';
	}
	$custom_css .= '}';
	$custom_css .= '.courseflow-stripe-image-button:hover {opacity: 0.8;}';

	// Attach inline style.
	wp_add_inline_style( $style_handle, $custom_css );

	// Enqueue Stripe SDK (only once).
	if ( ! wp_script_is( $stripe_handle, 'registered' ) ) {
		wp_register_script( $stripe_handle, 'https://js.stripe.com/v3/', array(), '1.0.0', true );
	}
	if ( ! wp_script_is( $stripe_handle, 'enqueued' ) ) {
		wp_enqueue_script( $stripe_handle );
	}

	// Enqueue plugin checkout script.
	if ( ! wp_script_is( $script_handle, 'registered' ) ) {
		wp_register_script(
			$script_handle,
			COURSEFLOW_ASSETS_URL . 'js/stripe-checkout.js',
			array( 'jquery', $stripe_handle ),
			defined( 'COURSEFLOW_VERSION' ) ? COURSEFLOW_VERSION : false,
			true
		);
	}

	if ( ! wp_script_is( $script_handle, 'enqueued' ) ) {
		wp_enqueue_script( $script_handle );
	}

	// Localize data required by stripe-checkout.js (safe and sanitized).
	$default_currency = 'USD';
	if ( courseflow_is_lms_active( 'tutor' ) && function_exists( 'tutor_utils' ) ) {
		$default_currency = strtoupper( tutor_utils()->get_option( 'currency_code', 'USD' ) );
	} else {
		$default_currency = strtoupper( get_option( 'courseflow_default_currency', 'USD' ) );
	}

	$localized_data = array(
		'publishableKey' => sanitize_text_field( get_option( 'courseflow_stripe_publishable_key', '' ) ),
		'restUrl'        => esc_url_raw( rest_url( 'course-flow/v1/create-checkout-session' ) ),
		'nonce'          => wp_create_nonce( 'wp_rest' ),
		'currency'       => strtoupper( $default_currency ),
		'debugLogUrl'    => esc_url_raw( rest_url( 'course-flow/v1/debug-log' ) ),
		'isAdmin'        => current_user_can( 'manage_options' ),
	);

	// Ensure localization only once per request.
	wp_localize_script( $script_handle, 'courseflowStripeData', $localized_data );
}

/**
 * Shortcode to display a buy button for a course.
 *
 * @since 1.0.0
 * @param array $atts Shortcode attributes.
 * @return string HTML output or message.
 */
function courseflow_course_shortcode( $atts ) {
	$atts = shortcode_atts(
		array(
			'id' => 0,
		),
		$atts,
		'course'
	);

	$course_id = absint( $atts['id'] );
	if ( $course_id <= 0 ) {
		return esc_html__( 'Invalid course ID.', 'course-flow' );
	}

	$course = get_post( $course_id );
	if ( ! $course ) {
		return esc_html__( 'Course not found.', 'course-flow' );
	}

	$course_type = $course->post_type;
	$lms_type    = courseflow_map_post_type_to_lms_type( $course_type );

	if ( ! courseflow_is_lms_active( $lms_type ) ) {
		return esc_html__( 'LMS not active for this course.', 'course-flow' );
	}

	// Get price and currency based on LMS.
	$price    = 0.0;
	$currency = get_option( 'courseflow_default_currency', 'USD' );

	if ( 'sfwd-courses' === $course_type && function_exists( 'courseflow_get_learndash_course_price' ) ) {
		$price_data = courseflow_get_learndash_course_price( $course_id );
		$price      = isset( $price_data['price'] ) ? floatval( $price_data['price'] ) : 0.0;
		$currency   = isset( $price_data['currency'] ) ? strtoupper( sanitize_text_field( $price_data['currency'] ) ) : $currency;
	} elseif ( 'courses' === $course_type && function_exists( 'courseflow_get_tutor_course_price' ) ) {
		$price    = courseflow_get_tutor_course_price( $course_id );
		$currency = courseflow_get_tutor_course_currency( $course_id );
	} elseif ( ( 'courseflow_lp_course' === $course_type || 'lp_course' === $course_type ) && function_exists( 'courseflow_get_lp_course_price' ) ) {
		$price    = courseflow_get_lp_course_price( $course_id );
		$currency = courseflow_get_lp_course_currency();
	}

	if ( $price <= 0 ) {
		$price = 0.0;
	}

	// Check access.
	$has_access = false;
	if ( is_user_logged_in() ) {
		$user_id = get_current_user_id();

		if ( 'sfwd-courses' === $course_type && function_exists( 'ld_get_mycourses' ) ) {
			$user_courses = ld_get_mycourses( $user_id );
			$has_access   = in_array( $course_id, $user_courses, true );
		} elseif ( 'courses' === $course_type && function_exists( 'tutor_utils' ) ) {
			$has_access = tutor_utils()->is_enrolled( $course_id, $user_id );
		} elseif ( ( 'courseflow_lp_course' === $course_type || 'lp_course' === $course_type ) && function_exists( 'learn_press_is_enrolled_course' ) ) {
			$has_access = learn_press_is_enrolled_course( $course_id, $user_id );
		}
	}

	if ( $has_access ) {
		return '';
	}

	// Ensure frontend styles and scripts required for checkout are available.
	courseflow_enqueue_frontend_for_shortcode();

	$button_text = esc_html( get_option( 'courseflow_course_button_text', __( 'Buy Now', 'course-flow' ) ) );
	$url         = courseflow_get_course_purchase_url( $course_id );

	$output = sprintf(
		'<a href="%1$s" class="courseflow-stripe-button courseflow-button-primary" data-course-id="%2$d" data-course-type="%3$s" data-course-price="%4$s" data-currency="%5$s">%6$s</a>',
		esc_url( $url ),
		absint( $course_id ),
		esc_attr( $course_type ),
		esc_attr( $price ),
		esc_attr( $currency ),
		$button_text
	);

	return $output;
}

/**
 * Shortcode to display a buy button for a course with Stripe integration.
 *
 * @since 1.0.0
 * @param array $atts Shortcode attributes.
 * @return string HTML output or message.
 */
function courseflow_buycourse_shortcode( $atts ) {
	$atts = shortcode_atts(
		array(
			'id' => 0,
		),
		$atts,
		'buycourse'
	);

	$course_id = absint( $atts['id'] );
	if ( $course_id <= 0 ) {
		return esc_html__( 'Invalid course ID.', 'course-flow' );
	}

	$course = get_post( $course_id );
	if ( ! $course ) {
		return esc_html__( 'Course not found.', 'course-flow' );
	}

	$course_type = $course->post_type;
	$lms_type    = courseflow_map_post_type_to_lms_type( $course_type );

	if ( ! courseflow_is_lms_active( $lms_type ) ) {
		return esc_html__( 'LMS not active for this course.', 'course-flow' );
	}

	// Get price and currency based on LMS.
	$price    = 0.0;
	$currency = get_option( 'courseflow_default_currency', 'USD' );

	if ( 'sfwd-courses' === $course_type && function_exists( 'courseflow_get_learndash_course_price' ) ) {
		$price_data = courseflow_get_learndash_course_price( $course_id );
		$price      = isset( $price_data['price'] ) ? floatval( $price_data['price'] ) : 0.0;
		$currency   = isset( $price_data['currency'] ) ? strtoupper( sanitize_text_field( $price_data['currency'] ) ) : $currency;
	} elseif ( 'courses' === $course_type && function_exists( 'courseflow_get_tutor_course_price' ) ) {
		$price    = courseflow_get_tutor_course_price( $course_id );
		$currency = courseflow_get_tutor_course_currency( $course_id );
	} elseif ( ( 'courseflow_lp_course' === $course_type || 'lp_course' === $course_type ) && function_exists( 'courseflow_get_lp_course_price' ) ) {
		$price    = courseflow_get_lp_course_price( $course_id );
		$currency = courseflow_get_lp_course_currency( $course_id );
	}

	if ( $price <= 0 ) {
		$price = 1.0;
	}

	// Check access.
	$has_access = false;
	if ( is_user_logged_in() ) {
		$user_id = get_current_user_id();

		if ( 'sfwd-courses' === $course_type && function_exists( 'ld_get_mycourses' ) ) {
			$user_courses = ld_get_mycourses( $user_id );
			$has_access   = in_array( $course_id, $user_courses, true );
		} elseif ( 'courses' === $course_type && function_exists( 'tutor_utils' ) ) {
			$has_access = tutor_utils()->is_enrolled( $course_id, $user_id );
		} elseif ( ( 'courseflow_lp_course' === $course_type || 'lp_course' === $course_type ) && function_exists( 'learn_press_is_enrolled_course' ) ) {
			$has_access = learn_press_is_enrolled_course( $course_id, $user_id );
		}
	}

	if ( $has_access ) {
		return '';
	}

	// Ensure frontend styles and scripts required for checkout are available.
	courseflow_enqueue_frontend_for_shortcode();

	$button_text = esc_html( get_option( 'courseflow_course_button_text', __( 'Buy Now', 'course-flow' ) ) );
	$url         = courseflow_get_course_purchase_url( $course_id );

	$output = sprintf(
		'<a href="%1$s" class="courseflow-stripe-button courseflow-button-primary" data-course-id="%2$d" data-course-type="%3$s" data-course-price="%4$s" data-currency="%5$s">%6$s</a>',
		esc_url( $url ),
		absint( $course_id ),
		esc_attr( $course_type ),
		esc_attr( $price ),
		esc_attr( $currency ),
		$button_text
	);

	return $output;
}

/**
 * Image Buy Course shortcode to display an image-based purchase button.
 *
 * @since 1.0.0
 *
 * @param array $atts Shortcode attributes.
 * @return string HTML output.
 */
function courseflow_imagebuycourse_shortcode( $atts ) {
	$atts = shortcode_atts(
		array(
			'id' => 0,
		),
		$atts,
		'imagebuycourse'
	);

	$course_id = absint( $atts['id'] );
	if ( $course_id <= 0 ) {
		return esc_html__( 'Invalid course ID', 'course-flow' );
	}

	$course = get_post( $course_id );
	if ( ! $course || ! in_array( $course->post_type, array( 'sfwd-courses', 'lp_course', 'courses' ), true ) ) {
		return esc_html__( 'Course not found', 'course-flow' );
	}

	$course_type = $course->post_type;
	$lms_type    = courseflow_map_post_type_to_lms_type( $course_type );

	// Check access.
	$has_access = false;
	if ( is_user_logged_in() ) {
		$user_id = get_current_user_id();

		if ( 'sfwd-courses' === $course_type && function_exists( 'ld_get_mycourses' ) ) {
			$user_courses = ld_get_mycourses( $user_id );
			$has_access   = in_array( $course_id, $user_courses, true );
		} elseif ( 'courses' === $course_type && function_exists( 'tutor_utils' ) ) {
			$has_access = tutor_utils()->is_enrolled( $course_id, $user_id );
		} elseif ( ( 'courseflow_lp_course' === $course_type || 'lp_course' === $course_type ) && function_exists( 'learn_press_is_enrolled_course' ) ) {
			$has_access = learn_press_is_enrolled_course( $course_id, $user_id );
		}
	}

	if ( $has_access ) {
		return '';
	}

	$price     = 0.0;
	$currency  = 'USD';
	$image_url = get_option( 'courseflow_image_button_url', '' );

	if ( 'sfwd-courses' === $course_type && function_exists( 'courseflow_get_learndash_course_price' ) && courseflow_is_lms_active( 'learndash' ) ) {
		$price_data = courseflow_get_learndash_course_price( $course_id );
		$price      = isset( $price_data['price'] ) ? floatval( $price_data['price'] ) : 0.0;
		$currency   = isset( $price_data['currency'] ) ? strtoupper( sanitize_text_field( $price_data['currency'] ) ) : 'USD';
	} elseif ( 'courses' === $course_type && function_exists( 'courseflow_get_tutor_course_price' ) && courseflow_is_lms_active( 'tutor' ) ) {
		$price    = courseflow_get_tutor_course_price( $course_id );
		$currency = courseflow_get_tutor_course_currency( $course_id );
	} elseif ( ( 'courseflow_lp_course' === $course_type || 'lp_course' === $course_type ) && function_exists( 'courseflow_get_lp_course_price' ) && courseflow_is_lms_active( 'courseflow_lp' ) ) {
		$price    = courseflow_get_lp_course_price( $course_id );
		$currency = courseflow_get_lp_course_currency( $course_id );
	} else {
		return esc_html__( 'LMS not active for this course', 'course-flow' );
	}

	if ( empty( $image_url ) ) {
		return esc_html__( 'No image URL configured', 'course-flow' );
	}

	// Enqueue frontend styles and scripts.
	courseflow_enqueue_frontend_for_shortcode();

	ob_start();
	?>
	<img src="<?php echo esc_url( $image_url ); ?>" class="courseflow-stripe-image-button" data-course-id="<?php echo esc_attr( $course_id ); ?>" data-course-type="<?php echo esc_attr( $course_type ); ?>" data-course-price="<?php echo esc_attr( $price ); ?>" data-currency="<?php echo esc_attr( $currency ); ?>" alt="<?php echo esc_attr__( 'Buy Course', 'course-flow' ); ?>" style="cursor: pointer;" />
	<?php
	return ob_get_clean();
}

/**
 * Helper: return purchase URL for course (simple implementation).
 *
 * @param int $course_id Course ID.
 * @return string
 */
function courseflow_get_course_purchase_url( $course_id ) {
	$base = get_option( 'courseflow_purchase_page', '' );
	if ( $base ) {
		if ( is_numeric( $base ) ) {
			$base = get_permalink( (int) $base );
		}
		if ( ! empty( $base ) ) {
			return esc_url_raw( add_query_arg( array( 'course_id' => $course_id ), $base ) );
		}
	}
	return esc_url_raw( add_query_arg( array( 'courseflow_buy' => $course_id ), site_url( '/' ) ) );
}
