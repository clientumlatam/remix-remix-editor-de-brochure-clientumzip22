<?php
/**
 * File: learndash-integration.php
 * Description: Integration with LearnDash for the Stripe Course Connector plugin, including order creation and admin panel display.
 * Version: 1.0.0
 * Author: Pawel Borowiec
 * Text Domain: course-flow
 *
 * @package CourseFlow
 */

defined( 'ABSPATH' ) || exit;

/**
 * Retrieves the course currency for a LearnDash course.
 *
 * @since 1.2.30
 * @param int $course_id The course ID.
 * @return string The currency code (e.g., 'USD', 'PLN').
 */
function courseflow_get_learndash_course_currency( $course_id ) {
	$course_id = absint( $course_id );
	if ( $course_id <= 0 ) {
		return 'USD';
	}

	// Use LearnDash's native function if available.
	if ( function_exists( 'learndash_get_currency_code' ) ) {
		$currency = strtoupper( sanitize_text_field( learndash_get_currency_code() ) );
	} else {
		$settings = get_option( 'learndash_settings_payments_general', array() );
		$currency = isset( $settings['currency'] ) ? strtoupper( sanitize_text_field( $settings['currency'] ) ) : 'USD';
	}

	// Validate currency code (ISO 4217).
	if ( empty( $currency ) || ! preg_match( '/^[A-Z]{3}$/', $currency ) ) {
		$currency = 'USD';
	}

	return $currency;
}

/**
 * Retrieves the course price and currency for a LearnDash course.
 *
 * @since 1.0.0
 * @param int $course_id The ID of the course.
 * @return array Array with 'price' and 'currency'.
 */
function courseflow_get_learndash_course_price( $course_id ) {
	$course_id = absint( $course_id );
	if ( ! $course_id ) {
		return array(
			'price'    => 0.0,
			'currency' => 'USD',
		);
	}

	$course_meta = get_post_meta( $course_id, '_sfwd-courses', true );
	$price       = isset( $course_meta['sfwd-courses_course_price'] ) ? floatval( $course_meta['sfwd-courses_course_price'] ) : 0.0;
	$currency    = courseflow_get_learndash_course_currency( $course_id );

	return array(
		'price'    => $price,
		'currency' => $currency,
	);
}

/**
 * Force display of all orders in the LearnDash admin panel by modifying the query.
 *
 * @since 1.0.0
 * @param WP_Query $query The WP_Query instance.
 */
function courseflow_force_display_all_orders( $query ) {
	if ( is_admin() && 'sfwd-transactions' === $query->get( 'post_type' ) ) {
		unset( $query->query_vars['meta_query'] );
		unset( $query->query_vars['date_query'] );
		$query->set( 'posts_per_page', -1 );
		$query->set( 'post_status', 'publish' );
		$query->set( 'post_parent', '' );
	}
}
add_action( 'pre_get_posts', 'courseflow_force_display_all_orders', 10, 1 );

/**
 * Modify the LearnDash transactions query in the admin list.
 *
 * @since 1.0.0
 * @param array  $query_args The query arguments.
 * @param string $context The query context.
 * @return array Modified query arguments.
 */
function courseflow_modify_learndash_transactions_query( $query_args, $context ) {
	if ( 'admin_list' === $context ) {
		unset( $query_args['meta_query'] );
		unset( $query_args['date_query'] );
		$query_args['posts_per_page'] = -1;
		$query_args['post_status']    = 'publish';
		$query_args['post_parent']    = '';
	}

	return $query_args;
}
add_filter( 'learndash_transactions_query', 'courseflow_modify_learndash_transactions_query', 10, 2 );

/**
 * Short-circuit the query with cached posts if available.
 *
 * @since 1.0.0
 * @param null|array $posts The posts array (null to continue query).
 * @param WP_Query   $query The WP_Query instance.
 * @return null|array Cached posts or null.
 */
function courseflow_get_cached_transactions( $posts, $query ) {
	if ( is_admin() && 'sfwd-transactions' === $query->get( 'post_type' ) && -1 === $query->get( 'posts_per_page' ) ) {
		$transient_key = 'courseflow_all_transactions';
		$cached_posts  = get_transient( $transient_key );
		if ( false !== $cached_posts ) {
			return $cached_posts;
		}
	}

	return $posts;
}
add_filter( 'posts_pre_query', 'courseflow_get_cached_transactions', 10, 2 );

/**
 * Cache the query results after execution.
 *
 * @since 1.0.0
 * @param array    $posts The posts array.
 * @param WP_Query $query The WP_Query instance.
 * @return array The posts array.
 */
function courseflow_cache_transactions_posts( $posts, $query ) {
	if ( is_admin() && 'sfwd-transactions' === $query->get( 'post_type' ) && -1 === $query->get( 'posts_per_page' ) ) {
		$transient_key = 'courseflow_all_transactions';
		set_transient( $transient_key, $posts, HOUR_IN_SECONDS );
	}

	return $posts;
}
add_filter( 'the_posts', 'courseflow_cache_transactions_posts', 10, 2 );

/**
 * Invalidate the transactions cache on post changes.
 *
 * @since 1.0.0
 * @param int $post_id The post ID.
 */
function courseflow_invalidate_transactions_cache( $post_id ) {
	if ( 'sfwd-transactions' === get_post_type( $post_id ) ) {
		delete_transient( 'courseflow_all_transactions' );
	}
}
add_action( 'save_post', 'courseflow_invalidate_transactions_cache' );
add_action( 'delete_post', 'courseflow_invalidate_transactions_cache' );
add_action( 'trash_post', 'courseflow_invalidate_transactions_cache' );
add_action( 'untrash_post', 'courseflow_invalidate_transactions_cache' );

/**
 * Log SQL queries for debugging LearnDash orders.
 *
 * @since 1.0.0
 * @param string   $request The SQL query.
 * @param WP_Query $query The WP_Query instance.
 * @return string Unmodified SQL query.
 */
function courseflow_log_learndash_sql_query( $request, $query ) {
	// Log the SQL query if it's related to LearnDash orders.
	if ( function_exists( 'wc_get_logger' ) && $query->get( 'post_type' ) === 'sfwd-courses' ) {
		wc_get_logger()->debug( 'LearnDash SQL Query: ' . $request );
	}

	return $request;
}
add_filter( 'posts_request', 'courseflow_log_learndash_sql_query', 10, 2 );

/**
 * Log query results for debugging LearnDash orders.
 *
 * @since 1.0.0
 * @param array    $posts The query results.
 * @param WP_Query $query The WP_Query instance.
 * @return array Unmodified posts.
 */
function courseflow_log_learndash_posts_results( $posts, $query ) {
	// Log the number of posts returned if it's a LearnDash query.
	if ( function_exists( 'wc_get_logger' ) && $query->get( 'post_type' ) === 'sfwd-courses' ) {
		wc_get_logger()->debug( 'LearnDash Query Results: ' . count( $posts ) . ' posts found' );
	}

	return $posts;
}
add_action( 'posts_results', 'courseflow_log_learndash_posts_results', 10, 2 );

/**
 * Block specific LearnDash admin columns.
 *
 * @since 1.0.0
 * @param array  $columns The original columns.
 * @param string $post_type The post type.
 * @return array Modified columns.
 */
function courseflow_block_learndash_admin_columns( $columns, $post_type ) {
	if ( 'sfwd-transactions' === $post_type ) {
		unset( $columns['user'] );
		unset( $columns['customer'] );
	}

	return $columns;
}
add_filter( 'learndash_admin_columns', 'courseflow_block_learndash_admin_columns', 10, 2 );

/**
 * Override the LearnDash payment processor name.
 *
 * @since 1.0.0
 * @param string $processor_name The original processor name.
 * @param string $processor The processor identifier.
 * @return string Modified processor name.
 */
function courseflow_set_payment_processor_name( $processor_name, $processor ) {
	if ( in_array( $processor, array( 'stripe', 'stripe_connect' ), true ) ) {
		return esc_html__( 'Stripe (P24/Card)', 'course-flow' );
	}

	return esc_html( $processor_name );
}
add_filter( 'learndash_get_payment_processor_name', 'courseflow_set_payment_processor_name', 10, 2 );

/**
 * Modify transaction details for LearnDash.
 *
 * @since 1.0.0
 * @param array $details Transaction details.
 * @param int   $transaction_id Transaction ID.
 * @return array Modified details.
 */
function courseflow_modify_transaction_details( $details, $transaction_id ) {
	$user_id = absint( get_post_meta( $transaction_id, '_user_id', true ) );
	if ( ! $user_id ) {
		$post    = get_post( $transaction_id );
		$user_id = $post ? absint( $post->post_author ) : 0;
	}

	$user = get_user_by( 'id', $user_id );
	if ( $user ) {
		$details['customer'] = sprintf(
			'<a href="%1$s" target="_blank" rel="noopener noreferrer">%2$s</a>%3$s',
			esc_url( admin_url( 'user-edit.php?user_id=' . $user->ID ) ),
			esc_html( $user->user_email ),
			esc_html( $user->user_login )
		);
	} else {
		$details['customer'] = esc_html__( 'No user', 'course-flow' );
	}

	return $details;
}
add_filter( 'learndash_transaction_details', 'courseflow_modify_transaction_details', 10, 2 );

/**
 * Replace default LearnDash transaction columns with custom ones in the desired order.
 *
 * @since 1.0.0
 * @param array $columns The original columns.
 * @return array Modified columns.
 */
function courseflow_replace_transaction_columns( $columns ) {
	unset( $columns['title'], $columns['post_id'], $columns['id'], $columns['user'], $columns['author'] );
	$custom_columns = array(
		'cb'       => '<input type="checkbox" />',
		'id'       => esc_html__( 'ID', 'course-flow' ),
		'date'     => esc_html__( 'Date', 'course-flow' ),
		'customer' => esc_html__( 'Customer', 'course-flow' ),
		'item'     => esc_html__( 'Course', 'course-flow' ),
		'price'    => esc_html__( 'Price', 'course-flow' ),
		'gateway'  => esc_html__( 'Payment Method', 'course-flow' ),
	);

	return $custom_columns;
}
add_filter( 'manage_sfwd-transactions_posts_columns', 'courseflow_replace_transaction_columns', 999 );

/**
 * Disable sorting for the ID column to avoid conflicts.
 *
 * @since 1.0.0
 * @param array $sortable_columns The sortable columns.
 * @return array Modified sortable columns.
 */
function courseflow_disable_id_sorting( $sortable_columns ) {
	unset( $sortable_columns['id'] );

	return $sortable_columns;
}
add_filter( 'manage_edit-sfwd-transactions_sortable_columns', 'courseflow_disable_id_sorting', 10, 1 );

/**
 * Custom content for the 'item' column in LearnDash transactions to override default rendering.
 *
 * @since 1.0.0
 * @param string $content The default column content.
 * @param int    $post_id The transaction post ID.
 * @return string The modified column content (only course title).
 */
function courseflow_custom_item_column_content( $content, $post_id ) {
	$course_id = absint( get_post_meta( $post_id, '_ld_transaction_course_id', true ) );
	if ( ! $course_id ) {
		$course_id = absint( get_post_meta( $post_id, '_course_id', true ) );
	}
	if ( ! $course_id ) {
		$post      = get_post( $post_id );
		$course_id = $post ? absint( $post->post_parent ) : 0;
	}

	$course_title = $course_id ? get_the_title( $course_id ) : '';
	if ( ! empty( $course_title ) ) {
		$content = sprintf(
			'<a href="%s">%s</a>',
			esc_url( get_permalink( $course_id ) ),
			esc_html( $course_title )
		);
	} else {
		$content = '';
	}

	return $content;
}
add_filter( 'learndash_admin_column_content_item', 'courseflow_custom_item_column_content', 9999, 2 );

/**
 * Populate custom columns with data for LearnDash transactions.
 *
 * @since 1.0.0
 * @param string $column The current column name.
 * @param int    $post_id The current post ID.
 * @return void
 */
function courseflow_populate_custom_columns( $column, $post_id ) {
	switch ( $column ) {
		case 'id':
			printf(
				'<div><a href="%s">%d</a></div>',
				esc_url( get_edit_post_link( $post_id ) ),
				absint( $post_id )
			);
			break;
		case 'item':
			// Use the filtered content to ensure clean output.
			echo wp_kses_post( courseflow_custom_item_column_content( '', $post_id ) );
			break;
		case 'gateway':
			$payment_method_title = sanitize_text_field( get_post_meta( $post_id, '_payment_method_title', true ) );
			$ld_payment_processor = sanitize_text_field( get_post_meta( $post_id, '_ld_payment_processor', true ) );
			if ( in_array( $ld_payment_processor, array( 'stripe', 'stripe_connect' ), true ) || empty( $ld_payment_processor ) ) {
				echo esc_html__( 'Stripe (P24/Card)', 'course-flow' );
			} elseif ( ! empty( $payment_method_title ) ) {
				echo esc_html( $payment_method_title );
			} else {
				echo esc_html__( 'Unknown', 'course-flow' );
			}
			break;
		case 'price':
			$price    = floatval( get_post_meta( $post_id, '_price', true ) );
			$currency = sanitize_text_field( get_post_meta( $post_id, '_currency', true ) );
			$currency = ! empty( $currency ) ? $currency : 'USD';
			if ( $price && is_numeric( $price ) ) {
				echo esc_html( number_format( $price, 2, ',', '' ) . ' ' . $currency );
			} else {
				$course_id  = absint( get_post_meta( $post_id, '_course_id', true ) );
				$price_data = $course_id ? courseflow_get_learndash_course_price( $course_id ) : array(
					'price'    => 0.0,
					'currency' => 'USD',
				);
				echo $price_data['price'] > 0 ? esc_html( number_format( $price_data['price'], 2, ',', '' ) . ' ' . $price_data['currency'] ) : esc_html__( 'No price', 'course-flow' );
			}
			break;
	}
}
add_action( 'manage_sfwd-transactions_posts_custom_column', 'courseflow_populate_custom_columns', 9999, 2 ); // Increased priority to override LearnDash.

/**
 * Override translations to remove unwanted text.
 *
 * @since 1.0.0
 * @param string $translated The translated text.
 * @param string $text The original text.
 * @param string $domain The translation domain.
 * @return string Modified translated text.
 */
function courseflow_override_learndash_translations( $translated, $text, $domain ) {
	if ( 'learndash' === $domain ) {
		if ( in_array( $text, array( 'Not found', 'Unknown', 'Show more details', 'Show More Details' ), true ) ) {
			return '';
		}
	}

	return $translated;
}
add_filter( 'gettext', 'courseflow_override_learndash_translations', 10, 3 );

/**
 * Handle ngettext for plural translations.
 *
 * @since 1.0.0
 * @param string $translated The translated text.
 * @param string $single The singular form.
 * @param string $plural The plural form.
 * @param int    $number The number.
 * @param string $domain The translation domain.
 * @return string Modified translated text.
 */
function courseflow_override_learndash_ngettext( $translated, $single, $plural, $number, $domain ) {
	if ( 'learndash' === $domain && in_array( $single, array( 'Not found' ), true ) ) {
		return '';
	}

	return $translated;
}
add_filter( 'ngettext', 'courseflow_override_learndash_ngettext', 10, 5 );

/**
 * Grants course access and creates a transaction for a LearnDash course.
 *
 * @since 1.0.0
 * @param int    $course_id The ID of the course.
 * @param string $user_email The user's email address.
 * @param string $session_id The Stripe session ID.
 * @param bool   $auto_create_account Whether to auto-create a user account if it doesn't exist.
 * @return bool True on success, false on failure.
 */
function courseflow_grant_learndash_course_access( $course_id, $user_email, $session_id, $auto_create_account = true ) {
	global $wpdb;

	// Include plugin utilities if needed for is_plugin_active().
	include_once ABSPATH . 'wp-admin/includes/plugin.php';

	$course_id           = absint( $course_id );
	$user_email          = sanitize_email( $user_email );
	$session_id          = sanitize_text_field( $session_id );
	$auto_create_account = (bool) $auto_create_account;

	if ( ! $course_id || ! is_email( $user_email ) || empty( $session_id ) ) {
		return false;
	}

	$course = get_post( $course_id );
	if ( ! $course || 'sfwd-courses' !== $course->post_type || ! in_array( $course->post_status, array( 'publish', 'private' ), true ) ) {
		return false;
	}

	if ( ! is_plugin_active( 'sfwd-lms/sfwd_lms.php' ) ) {
		return false;
	}

	// Get or create user.
	$user = get_user_by( 'email', $user_email );
	if ( ! $user && $auto_create_account ) {
		$username = sanitize_user( str_replace( '@', '_', $user_email ) );
		$password = wp_generate_password();
		$user_id  = wp_insert_user(
			array(
				'user_login' => $username,
				'user_email' => $user_email,
				'user_pass'  => $password,
				'role'       => 'subscriber',
			)
		);
		add_filter( 'wp_new_user_notification_email', '__return_false', 100 );
		add_filter( 'wp_new_user_notification_email_admin', '__return_false', 100 );
		if ( is_wp_error( $user_id ) ) {
			return false;
		}
		$user = get_user_by( 'id', $user_id );
	} elseif ( ! $auto_create_account ) {
		return false;
	}

	if ( ! $user ) {
		return false; // Fallback check in case user creation failed silently.
	}

	$user_id = $user->ID;

	// Check if order already exists for this session.
	// Direct query is used for performance to quickly check existence of a transaction post without loading full WP_Query or get_posts, which would be less efficient for a simple ID retrieval; prepared statements ensure security.
	// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
	$existing_order = $wpdb->get_var(
		$wpdb->prepare(
			"SELECT ID FROM {$wpdb->posts} WHERE post_type = 'sfwd-transactions' AND post_status = 'publish' AND post_author = %d AND post_parent = %d",
			$user_id,
			$course_id
		)
	);

	if ( $existing_order ) {
		// Direct query is used for efficiency to verify a specific meta value without querying and looping through all post meta, reducing database load; sanitized inputs prevent injection.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$existing_session = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT meta_value FROM {$wpdb->postmeta} WHERE post_id = %d AND meta_key = 'stripe_session_id' AND meta_value = %s",
				$existing_order,
				$session_id
			)
		);
		if ( $existing_session ) {
			return true;
		}
	}

	// Retrieve price and currency dynamically.
	$price_data = courseflow_get_learndash_course_price( $course_id );
	$price      = isset( $price_data['price'] ) ? floatval( $price_data['price'] ) : 0.0;
	$currency   = isset( $price_data['currency'] ) ? $price_data['currency'] : 'USD';

	if ( $price <= 0 ) {
		return false;
	}

	// Generate unique post_name.
	$base_post_name = 'order-' . $course_id . '-' . $user_id;
	$post_name      = $base_post_name . '-' . time();

	// Direct query is used to efficiently check for post_name uniqueness directly in the database, avoiding multiple WP insert attempts or full queries; this ensures no duplicates with minimal overhead.
	// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
	$post_name_check = $wpdb->get_var(
		$wpdb->prepare(
			"SELECT post_name FROM {$wpdb->posts} WHERE post_name = %s AND post_type = 'sfwd-transactions'",
			$post_name
		)
	);

	$counter = 1;
	while ( $post_name_check ) {
		$post_name = $base_post_name . '-' . time() . '-' . $counter;
		// Direct query is repeated in loop for performance during uniqueness checks, as it's faster than alternative methods like get_posts for high-volume scenarios; prepared each time for security.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$post_name_check = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT post_name FROM {$wpdb->posts} WHERE post_name = %s AND post_type = 'sfwd-transactions'",
				$post_name
			)
		);
		++$counter;
	}

	// Prepare order data.
	$order_data = array(
		'post_type'     => 'sfwd-transactions',
		'post_status'   => 'publish',
		'post_author'   => $user_id,
		'post_parent'   => $course_id,
		// translators: %1$s is the course title, %2$d is the course ID.
		'post_title'    => sprintf( esc_html__( 'Order for course %1$s (ID %2$d)', 'course-flow' ), esc_html( $course->post_title ), $course_id ),
		'post_name'     => $post_name,
		'post_date'     => current_time( 'mysql' ),
		'post_date_gmt' => current_time( 'mysql', true ),
		'meta_input'    => array(
			'_user_id'              => $user_id,
			'_course_id'            => $course_id,
			'_price'                => $price,
			'_currency'             => $currency,
			'stripe_session_id'     => $session_id,
			'_payment_processor'    => 'stripe',
			'_payment_method_title' => 'Stripe (P24/Card)',
		),
	);

	// Insert order.
	$order_id = wp_insert_post( $order_data );
	if ( ! $order_id || is_wp_error( $order_id ) ) {
		return false;
	}

	// Grant course access.
	$result = ld_update_course_access( $user_id, $course_id, false );
	if ( ! $result ) {
		return false;
	}

	return true;
}
