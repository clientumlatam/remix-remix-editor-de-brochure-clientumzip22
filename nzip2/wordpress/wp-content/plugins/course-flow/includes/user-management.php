<?php
/**
 * File: user-management.php
 * Description: Handles WordPress user creation and login.
 * Version: 1.0.0
 * Author: Pawel Borowiec
 *
 * @package CourseFlow
 */

defined( 'ABSPATH' ) || exit;

/**
 * Creates a new WordPress user with a unique username based on the provided email.
 *
 * Generates a username from the email prefix and ensures uniqueness by appending
 * a numeric suffix if necessary. Sends a notification email upon successful creation.
 *
 * @since 1.0.0
 * @param string $email The user's email address.
 * @return int|false The new user's ID on success, false on failure.
 */
function courseflow_create_wp_user( $email ) {
	$email = sanitize_email( $email );
	if ( ! is_email( $email ) ) {
		return false;
	}

	// Generate base username from email prefix.
	$base_username = sanitize_user( preg_replace( '/@.*$/', '', $email ) );
	$username      = $base_username;
	$counter       = 1;

	// Ensure username is unique by appending a suffix if needed.
	while ( username_exists( $username ) ) {
		$username = $base_username . '-' . $counter;
		++$counter;
	}

	$password = wp_generate_password();
	$user_id  = wp_create_user( $username, $password, $email );

	if ( is_wp_error( $user_id ) ) {
		return false;
	}

	// Send email with login details.
	wp_new_user_notification( $user_id, null, 'both' );

	return $user_id;
}

/**
 * Logs in a WordPress user programmatically.
 *
 * @param int $user_id The ID of the user to log in.
 * @return bool True on success, false on failure.
 */
function courseflow_login_user( $user_id ) {
	$user_id = absint( $user_id );
	$user    = get_user_by( 'id', $user_id );

	if ( ! $user ) {
		return false;
	}

	wp_set_current_user( $user_id );
	wp_set_auth_cookie( $user_id );

	// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound
	do_action( 'wp_login', $user->user_login, $user );

	return true;
}
