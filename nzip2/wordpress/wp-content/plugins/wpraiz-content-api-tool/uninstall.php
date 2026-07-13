<?php
/**
 * WPRaiz Content API Tool — Uninstall
 *
 * Fired when the plugin is deleted via WordPress admin.
 * Cleans up all plugin data from the database.
 *
 * @package WPRaiz\ContentAPI
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
    exit;
}

// Remove plugin options
delete_option( 'wpraiz_settings' );
delete_option( 'wpraiz_license_key' );
delete_option( 'wpraiz_license_status' );
delete_option( 'wpraiz_webhook_log' );
delete_option( 'wpraiz_db_version' );

// Remove transients (rate limit + search cache)
global $wpdb;
$wpdb->query(
    "DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_wpraiz_%' OR option_name LIKE '_transient_timeout_wpraiz_%'"
);

// Clean up cron events
wp_clear_scheduled_hook( 'wpraiz_webhook_delivery' );
wp_clear_scheduled_hook( 'wpraiz_webhook_retry' );
