<?php
/**
 * Uninstall handler for the Course Flow plugin.
 *
 * This file is executed only when the plugin is deleted from WordPress.
 * It securely removes all plugin-created options and leaves no data behind.
 *
 * @package CourseFlow
 */

// Exit if accessed directly or not uninstalling.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) || ! WP_UNINSTALL_PLUGIN ) {
	exit;
}

// Double check we're being called correctly.
if ( ! current_user_can( 'activate_plugins' ) ) {
	exit;
}

/**
 * List of all plugin options to remove.
 * These options are created across:
 * - Stripe settings
 * - General settings
 * - Button Settings
 * - Image Button Settings
 */
$courseflow_options = array(
	// Stripe & core settings.
	'courseflow_stripe_publishable_key',
	'courseflow_stripe_secret_key',
	'courseflow_stripe_endpoint_secret',
	'courseflow_auto_create_account',
	'courseflow_allow_url_collection',
	'courseflow_success_page_id',
	'courseflow_auto_payment_methods',
	'courseflow_default_currency',
	// Button Settings.
	'courseflow_course_button_text',
	'courseflow_button_font_family',
	'courseflow_button_font_size',
	'courseflow_button_text_color',
	'courseflow_button_background_color',
	'courseflow_button_border_color',
	'courseflow_button_height',
	'courseflow_button_width',
	'courseflow_button_border_radius',
	'courseflow_button_border_width',
	'courseflow_button_border_style',
	'courseflow_button_shadow_x',
	'courseflow_button_shadow_y',
	'courseflow_button_shadow_blur',
	'courseflow_button_shadow_spread',
	'courseflow_button_shadow_color',
	'courseflow_button_background_color_hover',
	'courseflow_button_text_color_hover',
	// Image Button Settings.
	'courseflow_image_button_url',
	'courseflow_image_button_alt',
	'courseflow_image_button_width',
	'courseflow_image_button_height',
	'courseflow_image_button_original_size',
	'courseflow_image_button_maintain_aspect_ratio',
);

/**
 * Remove all single-site and multisite options.
 */
foreach ( $courseflow_options as $courseflow_option ) {
	delete_option( $courseflow_option );
	delete_site_option( $courseflow_option );
}
