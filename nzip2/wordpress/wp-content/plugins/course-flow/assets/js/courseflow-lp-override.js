/* global Stripe */

/**
 * Course Flow - LearnPress Override Script
 *
 * Overrides LearnPress purchase buttons to integrate with Stripe via Course Flow.
 *
 * @since 1.0.0
 * @package
 */

'use strict';

jQuery(document).ready(function () {
	// Exit early if Stripe data is unavailable
	if (typeof window.courseflowStripeData === 'undefined') {
		return;
	}

	// Delegated click event for LearnPress purchase buttons
	jQuery(document).on('click', 'button.button-purchase-course', function (e) {
		e.preventDefault();
		e.stopPropagation();

		const $button = jQuery(this);
		const $form = $button.closest('form.purchase-course');

		// Remove any existing LearnPress handlers
		$form.off('submit');
		$button.off('click');

		// Extract course ID
		const courseId = $form.find('input[name="purchase-course"]').val();
		if (!courseId) {
			return false;
		}

		// Parse price
		const $priceEl = jQuery('.course-price .price');
		const priceText = $priceEl.length
			? $priceEl
					.text()
					.trim()
					.replace(/[^\d.]/g, '')
			: '1.0';
		let price = parseFloat(priceText);
		if (isNaN(price) || price <= 0) {
			price = 1.0;
		}

		// Currency fallback
		const currency = window.courseflowStripeData.currency || 'USD';

		// Disable button and show processing state
		$button.prop('disabled', true).text('Processing...');

		// Create Stripe checkout session
		jQuery.ajax({
			url: window.courseflowStripeData.restUrl,
			type: 'POST',
			headers: {
				'X-WP-Nonce': window.courseflowStripeData.nonce,
			},
			data: {
				course_id: courseId,
				course_type: 'courseflow_lp_course',
				price,
				currency,
			},
			success(response) {
				if (
					response &&
					response.success &&
					response.sessionId &&
					typeof Stripe !== 'undefined'
				) {
					const stripe = Stripe(
						window.courseflowStripeData.publishableKey
					);
					stripe.redirectToCheckout({
						sessionId: response.sessionId,
					});
				} else {
					$button.prop('disabled', false).text('Buy Course');
				}
			},
			error() {
				$button.prop('disabled', false).text('Buy Course');
			},
		});

		return false;
	});
});
