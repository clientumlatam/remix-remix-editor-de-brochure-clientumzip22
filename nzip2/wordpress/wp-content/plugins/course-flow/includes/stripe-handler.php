<?php
/**
 * File: stripe-handler.php
 * Description: Handles Stripe checkout session creation and webhook processing for all supported LMS systems with dynamic currency and payment methods.
 * Version: 1.0.1
 * Author: Pawel Borowiec
 * Text Domain: course-flow
 *
 * @package CourseFlow
 */

defined( 'ABSPATH' ) || exit;

/**
 * Retrieves active payment methods from Stripe API using account capabilities and caches the result.
 *
 * @since 1.9.29
 * @return array List of active payment method types for the Stripe account.
 */
function courseflow_get_active_payment_methods() {
	$cached_methods = get_transient( 'courseflow_active_payment_methods' );
	if ( false !== $cached_methods ) {
		return $cached_methods;
	}

	$secret_key = sanitize_text_field( get_option( 'courseflow_stripe_secret_key', '' ) );
	if ( empty( $secret_key ) ) {
		return array( 'card' );
	}

	try {
		require_once COURSEFLOW_PATH . 'vendor/autoload.php';
		\Stripe\Stripe::setApiKey( $secret_key );
		\Stripe\Stripe::setApiVersion( '2024-04-10' );

		$account      = \Stripe\Account::retrieve();
		$capabilities = isset( $account->capabilities ) ? $account->capabilities : new \stdClass();

		$capability_to_method = array(
			'card_payments'                => 'card',
			'affirm_payments'              => 'affirm',
			'afterpay_clearpay_payments'   => 'afterpay_clearpay',
			'link_payments'                => 'link',
			'us_bank_account_ach_payments' => 'us_bank_account',
			'acss_debit_payments'          => 'acss_debit',
			'bancontact_payments'          => 'bancontact',
			'boleto_payments'              => 'boleto',
			'eps_payments'                 => 'eps',
			'fpx_payments'                 => 'fpx',
			'giropay_payments'             => 'giropay',
			'grabpay_payments'             => 'grabpay',
			'ideal_payments'               => 'ideal',
			'klarna_payments'              => 'klarna',
			'konbini_payments'             => 'konbini',
			'oxxo_payments'                => 'oxxo',
			'p24_payments'                 => 'p24',
			'paynow_payments'              => 'paynow',
			'pix_payments'                 => 'pix',
			'promptpay_payments'           => 'promptpay',
			'sepa_debit_payments'          => 'sepa_debit',
			'sofort_payments'              => 'sofort',
			'swish_payments'               => 'swish',
			'twint_payments'               => 'twint',
			'upi_payments'                 => 'upi',
			'wechat_pay_payments'          => 'wechat_pay',
			'zip_payments'                 => 'zip',
		);

		$active_methods = array();
		foreach ( $capability_to_method as $cap_key => $method ) {
			if ( isset( $capabilities->{$cap_key} ) && 'active' === $capabilities->{$cap_key} ) {
				$active_methods[] = $method;
			}
		}

		if ( ! in_array( 'card', $active_methods, true ) && isset( $capabilities->card_payments ) && 'active' === $capabilities->card_payments ) {
			$active_methods[] = 'card';
		}

		$active_methods = array_unique( $active_methods );
		sort( $active_methods );

		if ( empty( $active_methods ) ) {
			$active_methods = array( 'card' );
		}

		set_transient( 'courseflow_active_payment_methods', $active_methods, 24 * HOUR_IN_SECONDS );
		return $active_methods;
	} catch ( \Exception $e ) {
		// Handle exception silently and return default.
		return array( 'card' );
	}
}

/**
 * Gets payment methods supported by Stripe for a given currency, filtered by active methods.
 *
 * @since 1.9.12
 * @param string $currency The currency code (e.g., 'USD').
 * @return array List of supported payment method types.
 */
function courseflow_get_payment_methods_by_currency( $currency ) {
	$currency = strtoupper( $currency );

	$potential_methods = array(
		'USD' => array(
			'card',
			'affirm',
			'afterpay_clearpay',
			'link',
			'us_bank_account',
		),
		'CAD' => array(
			'card',
			'acss_debit',
			'affirm',
			'afterpay_clearpay',
		),
		'MXN' => array(
			'card',
			'oxxo',
		),
		'EUR' => array(
			'card',
			'sepa_debit',
			'ideal',
			'bancontact',
			'eps',
			'giropay',
			'p24',
			'sofort',
			'klarna',
			'multibanco',
		),
		'GBP' => array(
			'card',
			'sepa_debit',
			'afterpay_clearpay',
			'klarna',
		),
		'PLN' => array(
			'card',
			'p24',
		),
		'CHF' => array(
			'card',
			'twint',
		),
		'SEK' => array(
			'card',
			'swish',
			'klarna',
		),
		'DKK' => array(
			'card',
			'klarna',
		),
		'NOK' => array(
			'card',
			'klarna',
		),
		'AUD' => array(
			'card',
			'becs_debit',
			'afterpay_clearpay',
			'zip',
		),
		'NZD' => array(
			'card',
			'afterpay_clearpay',
			'zip',
		),
		'JPY' => array(
			'card',
			'konbini',
		),
		'SGD' => array(
			'card',
			'paynow',
			'grabpay',
		),
		'MYR' => array(
			'card',
			'fpx',
			'grabpay',
		),
		'INR' => array(
			'card',
			'upi',
			'netbanking',
		),
		'BRL' => array(
			'card',
			'boleto',
			'pix',
		),
		'CNY' => array(
			'card',
			'alipay',
			'wechat_pay',
		),
		// Zero-decimal currencies.
		'BIF' => array(
			'card',
		),
		'CLP' => array(
			'card',
		),
		'DJF' => array(
			'card',
		),
		'GNF' => array(
			'card',
		),
		'KMF' => array(
			'card',
		),
		'KRW' => array(
			'card',
		),
		'MGA' => array(
			'card',
		),
		'PYG' => array(
			'card',
		),
		'RWF' => array(
			'card',
		),
		'UGX' => array(
			'card',
		),
		'VND' => array(
			'card',
		),
		'VUV' => array(
			'card',
		),
		'XAF' => array(
			'card',
		),
		'XOF' => array(
			'card',
		),
		'XPF' => array(
			'card',
		),
	);

	$active_methods    = courseflow_get_active_payment_methods();
	$supported_methods = isset( $potential_methods[ $currency ] ) ? array_intersect( $potential_methods[ $currency ], $active_methods ) : array( 'card' );
	$supported_methods = array_values( $supported_methods );

	if ( empty( $supported_methods ) ) {
		$supported_methods = array( 'card' );
	}

	return $supported_methods;
}

/**
 * Validates if the provided currency code is supported by Stripe.
 *
 * @since 1.9.2
 * @param string $currency The currency code to validate.
 * @return bool True if valid, false otherwise.
 */
function courseflow_validate_currency( $currency ) {
	$valid_currencies = array(
		'AED',
		'AFN',
		'ALL',
		'AMD',
		'ANG',
		'AOA',
		'ARS',
		'AUD',
		'AWG',
		'AZN',
		'BAM',
		'BBD',
		'BDT',
		'BGN',
		'BIF',
		'BMD',
		'BND',
		'BOB',
		'BRL',
		'BSD',
		'BWP',
		'BYN',
		'BZD',
		'CAD',
		'CDF',
		'CHF',
		'CLP',
		'CNY',
		'COP',
		'CRC',
		'CVE',
		'CZK',
		'DJF',
		'DKK',
		'DOP',
		'DZD',
		'EGP',
		'ETB',
		'EUR',
		'FJD',
		'FKP',
		'GBP',
		'GEL',
		'GHS',
		'GIP',
		'GMD',
		'GNF',
		'GTQ',
		'GYD',
		'HKD',
		'HNL',
		'HRK',
		'HTG',
		'HUF',
		'IDR',
		'ILS',
		'INR',
		'ISK',
		'JMD',
		'JPY',
		'KES',
		'KGS',
		'KHR',
		'KMF',
		'KRW',
		'KYD',
		'KZT',
		'LAK',
		'LBP',
		'LKR',
		'LRD',
		'LSL',
		'MAD',
		'MDL',
		'MGA',
		'MKD',
		'MMK',
		'MNT',
		'MOP',
		'MUR',
		'MVR',
		'MWK',
		'MXN',
		'MYR',
		'MZN',
		'NAD',
		'NGN',
		'NIO',
		'NOK',
		'NPR',
		'NZD',
		'PAB',
		'PEN',
		'PGK',
		'PHP',
		'PKR',
		'PLN',
		'PYG',
		'QAR',
		'RON',
		'RSD',
		'RUB',
		'RWF',
		'SAR',
		'SBD',
		'SCR',
		'SEK',
		'SGD',
		'SHP',
		'SLE',
		'SOS',
		'SRD',
		'SSP',
		'STN',
		'SVC',
		'SZL',
		'THB',
		'TJS',
		'TND',
		'TOP',
		'TRY',
		'TTD',
		'TWD',
		'TZS',
		'UAH',
		'UGX',
		'USD',
		'UYU',
		'UZS',
		'VES',
		'VND',
		'VUV',
		'WST',
		'XAF',
		'XCD',
		'XOF',
		'XPF',
		'YER',
		'ZAR',
		'ZMW',
	);

	return in_array( strtoupper( $currency ), $valid_currencies, true );
}

/**
 * Checks if the currency is a zero-decimal currency.
 *
 * @since 1.9.29
 * @param string $currency The currency code (uppercase).
 * @return bool True if zero-decimal, false otherwise.
 */
function courseflow_is_zero_decimal_currency( $currency ) {
	$zero_decimal_currencies = array(
		'BIF',
		'CLP',
		'DJF',
		'GNF',
		'JPY',
		'KMF',
		'KRW',
		'MGA',
		'PYG',
		'RWF',
		'UGX',
		'VND',
		'VUV',
		'XAF',
		'XOF',
		'XPF',
	);

	return in_array( strtoupper( $currency ), $zero_decimal_currencies, true );
}

/**
 * Handles Stripe Checkout session creation for a course with dynamic currency.
 *
 * @since 1.9.50
 * @param WP_REST_Request $request REST API request object.
 * @return WP_REST_Response Stripe session response.
 */
function courseflow_create_checkout_session( WP_REST_Request $request ) {
	$course_id         = absint( $request->get_param( 'course_id' ) );
	$course_type_param = sanitize_text_field( $request->get_param( 'course_type' ) );
	$frontend_price    = floatval( $request->get_param( 'price' ) );
	$frontend_currency = strtoupper( sanitize_text_field( $request->get_param( 'currency' ) ) );

	if ( $course_id <= 0 ) {
		return new WP_REST_Response(
			array(
				'success' => false,
				'message' => esc_html__( 'Missing course ID.', 'course-flow' ),
			),
			400
		);
	}

	$course = get_post( $course_id );
	if ( ! $course ) {
		return new WP_REST_Response(
			array(
				'success' => false,
				'message' => esc_html__( 'Invalid course.', 'course-flow' ),
			),
			400
		);
	}

	$valid_course_types = array( 'sfwd-courses', 'lp_course', 'courses' );
	$course_type        = $course->post_type;

	if ( $course_type_param && in_array( $course_type_param, $valid_course_types, true ) ) {
		$course_type = $course_type_param;
	}

	if ( ! in_array( $course_type, $valid_course_types, true ) ) {
		return new WP_REST_Response(
			array(
				'success' => false,
				'message' => esc_html__( 'Unsupported course type.', 'course-flow' ),
			),
			400
		);
	}

	$price    = 0.0;
	$currency = 'USD';

	if ( 'sfwd-courses' === $course_type && courseflow_is_lms_active( 'learndash' ) ) {
		$price    = courseflow_get_course_price( $course_id, 'learndash' );
		$currency = courseflow_get_course_currency( $course_id );
	} elseif ( 'courses' === $course_type && courseflow_is_lms_active( 'tutor' ) ) {
		$price    = courseflow_get_course_price( $course_id, 'tutor' );
		$currency = courseflow_get_course_currency( $course_id );
	} elseif ( 'lp_course' === $course_type && courseflow_is_lms_active( 'courseflow_lp' ) ) {
		$price    = courseflow_get_lp_course_price( $course_id );
		$currency = courseflow_get_lp_course_currency();
	} else {
		$price    = 1.0;
		$currency = get_option( 'courseflow_default_currency', 'USD' );
	}

	// Use frontend price and currency if provided and valid.
	if ( $frontend_price > 0 ) {
		$price = $frontend_price;
	}

	if ( $frontend_currency && courseflow_validate_currency( $frontend_currency ) ) {
		$currency = $frontend_currency;
	}

	if ( $price <= 0 ) {
		$price    = 1.0;
		$currency = get_option( 'courseflow_default_currency', 'USD' );
	}

	$amount = (int) round( $price * 100 );

	$autoload_path = realpath( COURSEFLOW_PATH . 'vendor' . DIRECTORY_SEPARATOR . 'autoload.php' );
	if ( ! $autoload_path || ! file_exists( $autoload_path ) ) {
		return new WP_REST_Response(
			array(
				'success' => false,
				'message' => esc_html__( 'Stripe PHP library not found. Please reinstall the plugin.', 'course-flow' ),
			),
			500
		);
	}

	require_once $autoload_path;

	$secret_key = sanitize_text_field( get_option( 'courseflow_stripe_secret_key', '' ) );
	if ( empty( $secret_key ) ) {
		return new WP_REST_Response(
			array(
				'success' => false,
				'message' => esc_html__( 'Stripe secret key not configured.', 'course-flow' ),
			),
			500
		);
	}

	try {
		\Stripe\Stripe::setApiKey( $secret_key );

		$product_name = get_the_title( $course_id );
		if ( empty( $product_name ) ) {
			/* translators: %d: Course ID number */
			$product_name = sprintf( esc_html__( 'Course #%d', 'course-flow' ), $course_id );
		}

		$success_url = get_option( 'courseflow_success_page_id' )
			? get_permalink( absint( get_option( 'courseflow_success_page_id' ) ) )
			: home_url( '/thank-you' );

		$cancel_url = $request->get_param( 'cancel_url' )
			? esc_url_raw( $request->get_param( 'cancel_url' ) )
			: ( isset( $_SERVER['HTTP_REFERER'] ) ? esc_url_raw( wp_unslash( $_SERVER['HTTP_REFERER'] ) ) : home_url() );

		$payment_methods = courseflow_get_payment_methods_by_currency( $currency );

		$plugin_language = get_option( 'courseflow_plugin_language', 'en_us_us' );
		$locale_map      = array(
			'pl_pl'    => 'pl',
			'en_us_us' => 'en',
			'en_us_uk' => 'en-GB',
			'en_us_au' => 'en',
			'es_es'    => 'es',
			'de_de'    => 'de',
			'fr_fr'    => 'fr',
			'ru_ru'    => 'ru',
			'jp'       => 'ja',
			'it_it'    => 'it',
			'pt_pt'    => 'pt',
			'sv_se'    => 'sv',
			'nl_nl'    => 'nl',
			'el'       => 'el',
			'cs_cz'    => 'cs',
			'hr'       => 'hr',
		);

		$stripe_locale = $locale_map[ $plugin_language ] ?? 'en';

		$session = \Stripe\Checkout\Session::create(
			array(
				'payment_method_types' => $payment_methods,
				'line_items'           => array(
					array(
						'price_data' => array(
							'currency'     => strtolower( $currency ),
							'product_data' => array(
								'name' => wp_strip_all_tags( $product_name ),
							),
							'unit_amount'  => $amount,
						),
						'quantity'   => 1,
					),
				),
				'mode'                 => 'payment',
				'success_url'          => esc_url_raw( $success_url ) . '?session_id={CHECKOUT_SESSION_ID}',
				'cancel_url'           => esc_url_raw( $cancel_url ),
				'locale'               => $stripe_locale,
				'metadata'             => array(
					'course_id'   => $course_id,
					'course_type' => $course_type,
					'currency'    => $currency,
				),
			)
		);

		return new WP_REST_Response(
			array(
				'success'   => true,
				'sessionId' => $session->id,
			),
			200
		);
	} catch ( \Exception $e ) {
		return new WP_REST_Response(
			array(
				'success' => false,
				'message' => esc_html__( 'Stripe error: ', 'course-flow' ) . esc_html( $e->getMessage() ),
			),
			500
		);
	}
}

/**
 * Handles Stripe webhook events.
 *
 * Verifies the webhook signature and processes completed checkout sessions.
 * Grants course access upon successful payment verification.
 *
 * @since 1.9.50
 * @param WP_REST_Request $request REST request object.
 * @return WP_REST_Response Response object.
 */
function courseflow_handle_stripe_webhook( WP_REST_Request $request ) {
	$autoload_path = realpath( COURSEFLOW_PATH . 'vendor' . DIRECTORY_SEPARATOR . 'autoload.php' );
	if ( ! $autoload_path || ! file_exists( $autoload_path ) ) {
		return new WP_REST_Response(
			array(
				'success' => false,
				'message' => esc_html__( 'Stripe PHP library not found. Please reinstall the plugin.', 'course-flow' ),
			),
			500
		);
	}
	require_once $autoload_path;
	$secret_key      = sanitize_text_field( get_option( 'courseflow_stripe_secret_key', '' ) );
	$endpoint_secret = sanitize_text_field( get_option( 'courseflow_stripe_endpoint_secret', '' ) );
	if ( empty( $secret_key ) ) {
		return new WP_REST_Response(
			array(
				'success' => false,
				'message' => esc_html__( 'Missing Stripe API key.', 'course-flow' ),
			),
			500
		);
	}
	if ( empty( $endpoint_secret ) ) {
		return new WP_REST_Response(
			array(
				'success' => false,
				'message' => esc_html__( 'Webhook secret is required for secure processing.', 'course-flow' ),
			),
			400
		);
	}
	\Stripe\Stripe::setApiKey( $secret_key );
	$payload    = $request->get_body();
	$sig_header = isset( $_SERVER['HTTP_STRIPE_SIGNATURE'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_STRIPE_SIGNATURE'] ) ) : '';
	$event      = null;
	try {
		$event = \Stripe\Webhook::constructEvent(
			$payload,
			$sig_header,
			$endpoint_secret,
			300 // Tolerance in seconds for timestamp verification.
		);
	} catch ( \UnexpectedValueException $e ) {
		return new WP_REST_Response(
			array(
				'success' => false,
				'message' => esc_html__( 'Invalid webhook payload.', 'course-flow' ),
			),
			400
		);
	} catch ( \Stripe\Exception\SignatureVerificationException $e ) {
		return new WP_REST_Response(
			array(
				'success' => false,
				'message' => esc_html__( 'Invalid webhook signature.', 'course-flow' ),
			),
			400
		);
	}
	if ( 'checkout.session.completed' === $event->type ) {
		$session     = $event->data->object;
		$course_id   = isset( $session->metadata->course_id ) ? absint( $session->metadata->course_id ) : 0;
		$course_type = isset( $session->metadata->course_type ) ? sanitize_text_field( $session->metadata->course_type ) : '';
		$user_email  = isset( $session->customer_details->email ) ? sanitize_email( $session->customer_details->email ) : '';
		if ( ! is_email( $user_email ) ) {
			return new WP_REST_Response(
				array(
					'success' => false,
					'message' => esc_html__( 'Invalid email address.', 'course-flow' ),
				),
				400
			);
		}
		$session_id = sanitize_text_field( $session->id );
		$currency   = isset( $session->currency ) ? strtoupper( sanitize_text_field( $session->currency ) ) : 'USD';
		if ( empty( $user_email ) && ! empty( $session->customer ) ) {
			try {
				$customer   = \Stripe\Customer::retrieve( $session->customer );
				$user_email = isset( $customer->email ) ? sanitize_email( $customer->email ) : '';
			} catch ( \Exception $e ) {
				// Trigger action hook for external error handling and logging.
				do_action(
					'courseflow_stripe_customer_retrieval_failed',
					$session->customer,
					$e->getMessage(),
					array(
						'session_id' => $session_id,
						'course_id'  => $course_id,
					)
				);
				// Continue execution with empty email - fallback logic will handle it below.
			}
		}
		if ( empty( $user_email ) && get_option( 'courseflow_auto_create_account', true ) ) {
			$user_email = sanitize_email( 'user_' . substr( $session_id, 0, 10 ) . '@example.com' );
		} elseif ( empty( $user_email ) ) {
			return new WP_REST_Response(
				array(
					'success' => false,
					'message' => esc_html__( 'Customer email address is required. Please ensure your Stripe Checkout collects email addresses.', 'course-flow' ),
				),
				400
			);
		}
		if ( $course_id <= 0 ) {
			return new WP_REST_Response(
				array(
					'success' => false,
					'message' => esc_html__( 'Invalid course ID.', 'course-flow' ),
				),
				400
			);
		}
		$course = get_post( $course_id );
		if ( ! $course || ! in_array( $course->post_type, array( 'sfwd-courses', 'lp_course', 'courses' ), true ) ) {
			return new WP_REST_Response(
				array(
					'success' => false,
					'message' => esc_html__( 'Invalid course.', 'course-flow' ),
				),
				400
			);
		}
		if ( $course_type && $course_type !== $course->post_type ) {
			$course_type = $course->post_type;
		} elseif ( empty( $course_type ) ) {
			$course_type = $course->post_type;
		}
		$lms_type_map = array(
			'sfwd-courses' => 'learndash',
			'lp_course'    => 'courseflow_lp',
			'courses'      => 'tutor',
		);
		$lms_type     = $lms_type_map[ $course_type ] ?? '';
		if ( empty( $lms_type ) || ! courseflow_is_lms_active( $lms_type ) ) {
			return new WP_REST_Response(
				array(
					'success' => false,
					'message' => esc_html__( 'LMS not active or unsupported.', 'course-flow' ),
				),
				400
			);
		}
		// Idempotency check: Prevent processing the same session multiple times.
		$processed_sessions = get_option( 'courseflow_processed_sessions', array() );
		if ( in_array( $session_id, $processed_sessions, true ) ) {
			return rest_ensure_response( array( 'status' => 'already_processed' ) );
		}
		// Mark session as processed and limit array size to prevent database bloat.
		$processed_sessions[] = $session_id;
		if ( count( $processed_sessions ) > 1000 ) {
			array_shift( $processed_sessions );
		}
		update_option( 'courseflow_processed_sessions', $processed_sessions );
		$result = courseflow_grant_course_access( $course_id, $user_email, $session_id, $lms_type, $currency );
		if ( ! $result ) {
			return new WP_REST_Response(
				array(
					'success' => false,
					'message' => esc_html__( 'Failed to grant course access.', 'course-flow' ),
				),
				500
			);
		}
		if ( 'learndash' === $lms_type ) {
			$user         = get_user_by( 'email', $user_email );
			$user_id      = $user ? $user->ID : 0;
			$transactions = get_posts(
				array(
					'post_type'      => 'sfwd-transactions',
					'post_parent'    => $course_id,
					'author'         => $user_id,
					'posts_per_page' => 1,
					'orderby'        => 'ID',
					'order'          => 'DESC',
					'fields'         => 'ids',
				)
			);
			if ( ! empty( $transactions ) ) {
				$order_id = $transactions[0];
				$price    = isset( $session->amount_total ) ? $session->amount_total / 100 : 0;

				// === NAPRAWA: ustawiamy właściwy klucz meta używany przez LearnDash ===
				update_post_meta( $order_id, 'price', floatval( $price ) );
				update_post_meta( $order_id, '_price', floatval( $price ) );
				update_post_meta( $order_id, 'ld_price', floatval( $price ) );

				// Zachowujemy stare meta dla wstecznej kompatybilności
				update_post_meta( $order_id, 'stripe_currency', sanitize_text_field( $currency ) );
				update_post_meta( $order_id, 'stripe_price', floatval( $price ) );
				update_post_meta( $order_id, 'stripe_session_id', sanitize_text_field( $session_id ) );
			}
		}
		return rest_ensure_response( array( 'status' => 'success' ) );
	}
	return rest_ensure_response( array( 'status' => 'ignored' ) );
}

// Register REST API endpoints.
add_action(
	'rest_api_init',
	function () {
		register_rest_route(
			'course-flow/v1',
			'/create-checkout-session',
			array(
				'methods'             => 'POST',
				'callback'            => 'courseflow_create_checkout_session',
				'permission_callback' => '__return_true',
			)
		);

		register_rest_route(
			'course-flow/v1',
			'/webhook',
			array(
				'methods'             => 'POST',
				'callback'            => 'courseflow_handle_stripe_webhook',
				'permission_callback' => '__return_true',
			)
		);
	}
);
