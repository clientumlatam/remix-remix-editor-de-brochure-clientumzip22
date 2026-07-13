<?php
/**
 * Admin React App Loader for Course Flow (whitelisted pages).
 * Author: Pawel Borowiec
 * Text Domain: course-flow
 *
 * Enqueues the built React admin app (assets/build/) and injects a root container
 * into the WP admin content area. Localizes a minimal safe settings object
 * for the frontend, including webhook URL and privacy policy URL for admin UI.
 *
 * PHP version 7.4+
 *
 * @package CourseFlow
 */

defined( 'ABSPATH' ) || exit;

/**
 * Return sanitized admin 'page' parameter.
 *
 * @return string
 */
function courseflow_get_current_admin_page() {
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only GET parameter in admin context, no state modification.
	$page = isset( $_GET['page'] ) ? sanitize_text_field( wp_unslash( $_GET['page'] ) ) : '';
	return (string) $page;
}

/**
 * Return default whitelisted Course Flow admin pages.
 *
 * Filterable via 'courseflow_react_whitelisted_pages'.
 *
 * @return array<string>
 */
function courseflow_get_default_whitelisted_pages() {
	$pages = array(
		'courseflow-settings',
		'courseflow-courses',
		'courseflow-image-button-settings',
		'courseflow-button-settings',
		'courseflow-pro-upgrade',
	);

	/**
	 * Filter the list of Course Flow admin pages where the React app will be loaded.
	 *
	 * @since 1.0.0
	 *
	 * @param array $pages Array of page slugs.
	 */
	return (array) apply_filters( 'courseflow_react_whitelisted_pages', $pages );
}

/**
 * Check whether the current admin screen corresponds to a whitelisted Course Flow page.
 *
 * @return bool
 */
function courseflow_is_whitelisted_courseflow_screen() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return false;
	}

	$page = courseflow_get_current_admin_page();
	if ( '' === $page ) {
		return false;
	}

	$whitelist = courseflow_get_default_whitelisted_pages();
	if ( ! in_array( $page, $whitelist, true ) ) {
		return false;
	}

	if ( ! function_exists( 'get_current_screen' ) ) {
		return true;
	}

	$screen = get_current_screen();
	if ( ! $screen || empty( $screen->id ) ) {
		return false;
	}

	if ( false !== strpos( $screen->id, $page ) ) {
		return true;
	}

	$possible_patterns = array(
		'toplevel_page_' . $page,
		'course-flow_page_' . $page,
		'courseflow_page_' . $page,
	);

	foreach ( $possible_patterns as $pattern ) {
		if ( false !== strpos( $screen->id, $pattern ) ) {
			return true;
		}
	}

	return false;
}

/**
 * Print root DOM element for the React app.
 *
 * @return void
 */
function courseflow_react_print_root() {
	if ( ! is_admin() ) {
		return;
	}

	if ( ! courseflow_is_whitelisted_courseflow_screen() ) {
		return;
	}

	/* phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static markup */
	echo '<div id="courseflow-admin-root" data-courseflow-root="1"></div>';
}
add_action( 'admin_footer', 'courseflow_react_print_root', 20 );

/**
 * Get privacy policy URL for admin UI.
 *
 * @return string
 */
function courseflow_get_privacy_policy_url() {
	$url = 'https://dev.pawelborowiec.com/course-flow/privacy-policy.html';

	/**
	 * Filter privacy policy URL used in Course Flow admin UI.
	 *
	 * @since 1.2.0
	 *
	 * @param string $url Default privacy policy URL.
	 */
	$url = (string) apply_filters( 'courseflow_privacy_policy_url', $url );

	return esc_url_raw( $url );
}

/**
 * Collect a minimal safe subset of settings to pass to the React app.
 *
 * @return array<string,mixed>
 */
function courseflow_react_get_public_settings() {
	return array(
		'publishable_key'      => sanitize_text_field( get_option( 'courseflow_stripe_publishable_key', '' ) ),
		'default_currency'     => sanitize_text_field( get_option( 'courseflow_default_currency', 'USD' ) ),
		'allow_url_collection' => (bool) absint( get_option( 'courseflow_allow_url_collection', 0 ) ),
		'endpoint_secret'      => sanitize_text_field( get_option( 'courseflow_stripe_endpoint_secret', '' ) ),
		'webhook_url'          => esc_url_raw( rest_url( 'course-flow/v1/webhook' ) ),
		'privacy_policy_url'   => courseflow_get_privacy_policy_url(),
		'courseflow_success_page_id' => absint( get_option( 'courseflow_success_page_id', 0 ) ),
		'auto_create_account'        => absint( get_option( 'courseflow_auto_create_account', 1 ) ),
		'auto_payment_methods'       => absint( get_option( 'courseflow_auto_payment_methods', 1 ) ),
	);
}

/**
 * Return minimal current user info.
 *
 * @return array<string,mixed>
 */
function courseflow_react_get_current_user_data() {
	$user = wp_get_current_user();
	if ( ! $user || 0 === $user->ID ) {
		return array();
	}

	return array(
		'ID'           => absint( $user->ID ),
		'user_email'   => sanitize_email( $user->user_email ),
		'display_name' => sanitize_text_field( $user->display_name ),
		'roles'        => array_map( 'sanitize_text_field', (array) $user->roles ),
	);
}

/**
 * Return capability map for current user.
 *
 * @return array<string,bool>
 */
function courseflow_react_get_capabilities() {
	return array(
		'manage_options' => current_user_can( 'manage_options' ),
	);
}

/**
 * Localize small translations map.
 *
 * @return array<string,string>
 */
function courseflow_react_get_i18n() {
	return array(
		'appTitle'                => esc_html__( 'Course Flow Admin', 'course-flow' ),
		'connectionTestBtn'       => esc_html__( 'Test Connection', 'course-flow' ),
		'saveBtn'                 => esc_html__( 'Save Changes', 'course-flow' ),
		'installBuildNotice'      => esc_html__( 'React admin build files not found. Run the build process.', 'course-flow' ),
		'openSettings'            => esc_html__( 'Open Settings Page', 'course-flow' ),
		'coursesTitle'            => esc_html__( 'Courses', 'course-flow' ),
		'noCourses'               => esc_html__( 'No courses found', 'course-flow' ),
		'loading'                 => esc_html__( 'Loading...', 'course-flow' ),
		'copyUrl'                 => esc_html__( 'Copy URL', 'course-flow' ),
		'urlCopied'               => esc_html__( 'URL copied to clipboard!', 'course-flow' ),
		'searchCourses'           => esc_html__( 'Search courses...', 'course-flow' ),
		'filterByLms'             => esc_html__( 'Filter by LMS', 'course-flow' ),
		'allLms'                  => esc_html__( 'All LMS', 'course-flow' ),
		'gridLayout'              => esc_html__( 'Grid Layout', 'course-flow' ),
		'oneColumn'               => esc_html__( '1 Column', 'course-flow' ),
		'twoColumns'              => esc_html__( '2 Columns', 'course-flow' ),
		'threeColumns'            => esc_html__( '3 Columns', 'course-flow' ),
		'imageButtonTitle'        => esc_html__( 'Image Button Settings', 'course-flow' ),
		'imageSettings'           => esc_html__( 'Image Settings', 'course-flow' ),
		'altText'                 => esc_html__( 'Alternative Text', 'course-flow' ),
		'altTextPlaceholder'      => esc_html__( 'Enter alt text for accessibility', 'course-flow' ),
		'altTextHelp'             => esc_html__( 'Alternative text for the image (for accessibility and SEO).', 'course-flow' ),
		'imageWidth'              => esc_html__( 'Image Width (px)', 'course-flow' ),
		'imageWidthHelp'          => esc_html__( 'Set the width of the image button (1-5000 px).', 'course-flow' ),
		'imageHeight'             => esc_html__( 'Image Height (px)', 'course-flow' ),
		'imageHeightHelp'         => esc_html__( 'Set the height of the image button (1-2000 px).', 'course-flow' ),
		'useOriginalSize'         => esc_html__( 'Use Original Size', 'course-flow' ),
		'useOriginalSizeHelp'     => esc_html__( 'Check to display the image in its original size, ignoring the width and height settings.', 'course-flow' ),
		'maintainAspectRatio'     => esc_html__( 'Maintain Aspect Ratio', 'course-flow' ),
		'maintainAspectRatioHelp' => esc_html__( "Check to maintain the image's aspect ratio when adjusting width or height.", 'course-flow' ),
		'saveChanges'             => esc_html__( 'Save Changes', 'course-flow' ),
		'saving'                  => esc_html__( 'Saving...', 'course-flow' ),
		'saveSuccess'             => esc_html__( 'Settings saved successfully.', 'course-flow' ),
		'saveError'               => esc_html__( 'Failed to save settings.', 'course-flow' ),
		'loadError'               => esc_html__( 'Failed to load settings.', 'course-flow' ),
		'buttonPreview'           => esc_html__( 'Button Preview', 'course-flow' ),
		'currentSize'             => esc_html__( 'Current Size', 'course-flow' ),
		'originalSize'            => esc_html__( 'Original Size', 'course-flow' ),
		'aspectRatioMaintained'   => esc_html__( 'Aspect ratio is maintained', 'course-flow' ),
		'noImagePreview'          => esc_html__( 'No image selected', 'course-flow' ),
		'selectImageHint'         => esc_html__( 'Select an image to see the preview', 'course-flow' ),
		'imageButton'             => esc_html__( 'Image Button', 'course-flow' ),
		'noImageSelected'         => esc_html__( 'No image selected', 'course-flow' ),
		'selectImage'             => esc_html__( 'Select Image', 'course-flow' ),
		'useImage'                => esc_html__( 'Use this image', 'course-flow' ),
		'removeImage'             => esc_html__( 'Remove Image', 'course-flow' ),
		'imageButtonHelp'         => esc_html__( 'Select an image from the media library (recommended formats: PNG, JPEG, WebP, max. 2 MB).', 'course-flow' ),
		'availableShortcodes'     => esc_html__( 'Available Shortcodes', 'course-flow' ),
		'shortcodesDescription'   => esc_html__( 'Copy the shortcode for the desired course to insert the image button on a page.', 'course-flow' ),
		'courseName'              => esc_html__( 'Course Name', 'course-flow' ),
		'courseId'                => esc_html__( 'Course ID', 'course-flow' ),
		'lmsType'                 => esc_html__( 'LMS Type', 'course-flow' ),
		'shortcode'               => esc_html__( 'Shortcode', 'course-flow' ),
		'copyShortcode'           => esc_html__( 'Copy shortcode', 'course-flow' ),
		'shortcodeCopied'         => esc_html__( 'Shortcode copied to clipboard!', 'course-flow' ),
		'noCoursesFound'          => esc_html__( 'No courses found matching your filters.', 'course-flow' ),
		'clearFilters'            => esc_html__( 'Clear Filters', 'course-flow' ),
	);
}

/**
 * Get cache busting version string based on file modification time.
 *
 * @param string $file_path Full path to the file.
 * @return string Version string for cache busting.
 */
function courseflow_get_asset_version( $file_path ) {
	if ( file_exists( $file_path ) ) {
		$filemtime = filemtime( $file_path );
		if ( false !== $filemtime ) {
			return COURSEFLOW_VERSION . '-' . $filemtime;
		}
	}
	return COURSEFLOW_VERSION . '-' . time();
}

/**
 * Enqueue the React admin app and localize settings.
 *
 * CRITICAL FIX v1.0.1: Added PRO plugin and license status detection.
 * Now passes to React:
 * - isProPluginActive: Whether Course Flow PRO plugin is active.
 * - pro_license_active: Whether Course Flow PRO license is active.
 *
 * This enables conditional rendering of PRO menu tabs in React based on:
 * 1. PRO plugin activation status
 * 2. PRO license activation status
 *
 * @param string $hook Current admin hook.
 * @return void
 */
function courseflow_react_admin_enqueue( $hook ) {
	if ( ! courseflow_is_whitelisted_courseflow_screen() ) {
		return;
	}

	$build_dir   = COURSEFLOW_PATH . 'assets/build/';
	$script_file = $build_dir . 'admin-app.js';
	$style_file  = $build_dir . 'admin-app.css';

	if ( ! file_exists( $script_file ) ) {
		wp_register_script( 'courseflow-react-missing', '' );
		wp_enqueue_script( 'courseflow-react-missing' );
		wp_add_inline_script(
			'courseflow-react-missing',
			'console.warn("Course Flow: React admin build files not found. Run the build process.");'
		);
		return;
	}

	$js_url  = COURSEFLOW_URL . 'assets/build/admin-app.js';
	$css_url = COURSEFLOW_URL . 'assets/build/admin-app.css';

	// Get dynamic version for cache busting based on file modification time.
	$js_version  = courseflow_get_asset_version( $script_file );
	$css_version = courseflow_get_asset_version( $style_file );

	wp_enqueue_script(
		'courseflow-react-admin',
		$js_url,
		array(),
		$js_version,
		true
	);

	if ( file_exists( $style_file ) ) {
		wp_enqueue_style(
			'courseflow-react-admin-css',
			$css_url,
			array(),
			$css_version
		);
	}

	// Enqueue WordPress Media Library.
	wp_enqueue_media();

	$mover_js = <<<'JS'
(function(){
  'use strict';
  function moveReactRoot() {
    var root = document.getElementById('courseflow-admin-root');
    if (!root) return;
    var wrap = document.querySelector('.wrap.courseflow-settings-wrapper, .wrap.courseflow-courses-wrapper, .wrap.courseflow-image-button-settings-wrapper');
    if (!wrap) return;
    wrap.appendChild(root);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', moveReactRoot);
  } else {
    moveReactRoot();
  }
})();
JS;

	wp_add_inline_script( 'courseflow-react-admin', $mover_js, 'before' );

	$page = courseflow_get_current_admin_page();

	// CRITICAL FIX: Check if Course Flow PRO plugin is active.
	$is_pro_plugin_active = false;
	if ( ! function_exists( 'is_plugin_active' ) ) {
		require_once ABSPATH . 'wp-admin/includes/plugin.php';
	}
	if ( function_exists( 'is_plugin_active' ) ) {
		$is_pro_plugin_active = is_plugin_active( 'course-flow-pro/course-flow-pro.php' );
	}

	// CRITICAL FIX: Check if PRO license is active.
	$pro_license_active = false;
	if ( function_exists( 'courseflow_pro_get_status_cached' ) ) {
		$status             = courseflow_pro_get_status_cached();
		$pro_license_active = ( is_array( $status ) && ! empty( $status['active'] ) );
	}

	$localized = array(
		'apiUrl'             => esc_url_raw( rest_url( 'course-flow/v1' ) ),
		'nonce'              => wp_create_nonce( 'wp_rest' ),
		'settings'           => courseflow_react_get_public_settings(),
		'currentUser'        => courseflow_react_get_current_user_data(),
		'capabilities'       => courseflow_react_get_capabilities(),
		'i18n'               => courseflow_react_get_i18n(),
		'version'            => COURSEFLOW_VERSION,
		'currentPage'        => sanitize_text_field( $page ),
		'webhookUrl'         => esc_url_raw( rest_url( 'course-flow/v1/webhook' ) ),
		'privacyPolicyUrl'   => courseflow_get_privacy_policy_url(),
		'isProPluginActive'  => $is_pro_plugin_active,
		'pro_license_active' => $pro_license_active,
	);

	// Add pages list for settings page dropdown.
	if ( 'courseflow-settings' === $page ) {
		$pages = get_pages(
			array(
				'post_status' => 'publish',
				'sort_column' => 'post_title',
				'sort_order'  => 'ASC',
			)
		);

		$pages_data = array();
		if ( ! empty( $pages ) && is_array( $pages ) ) {
			foreach ( $pages as $wp_page ) {
				$pages_data[] = array(
					'id'    => absint( $wp_page->ID ),
					'title' => sanitize_text_field( $wp_page->post_title ),
				);
			}
		}
		$localized['pages'] = $pages_data;
	}

	wp_localize_script( 'courseflow-react-admin', 'courseflowAppData', $localized );
}
add_action( 'admin_enqueue_scripts', 'courseflow_react_admin_enqueue', 40 );

/**
 * Helper: return proper assets URL for the plugin.
 *
 * @param string $relative_path Relative path under assets/.
 * @return string
 */
function courseflow_get_assets_url( $relative_path ) {
	$relative_path = ltrim( $relative_path, '/' );
	return untrailingslashit( COURSEFLOW_URL ) . '/assets/' . $relative_path;
}
