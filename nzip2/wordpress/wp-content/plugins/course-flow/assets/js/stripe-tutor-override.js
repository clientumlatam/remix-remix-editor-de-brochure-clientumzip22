/**
 * Course Flow – Tutor LMS Buy Now Override
 * Blocks Tutor LMS login modal and redirects "Buy Now" to Stripe Checkout.
 *
 * @package
 * @since 1.0.0
 */

/**
 * @param {Window}   window   Global window object.
 * @param {Document} document DOM document reference.
 * @param {jQuery}   $        jQuery instance.
 */
(function (window, document, $) {
	'use strict';

	if (typeof $ === 'undefined') {
		return;
	}

	$(function () {
		// Ensure Stripe.js and plugin configuration exist.
		if (
			typeof window.Stripe === 'undefined' ||
			typeof window.courseflowStripeData === 'undefined' ||
			!window.courseflowStripeData.publishableKey
		) {
			return;
		}

		const stripe = window.Stripe(
			window.courseflowStripeData.publishableKey
		);

		/**
		 * Create Stripe Checkout session and redirect.
		 *
		 * @param {string|number} courseId   Course ID.
		 * @param {string}        courseType Course type slug.
		 * @param {number}        price      Course price.
		 * @param {string}        currency   Currency code.
		 */
		function handleCourseFlowCheckout(
			courseId,
			courseType,
			price,
			currency
		) {
			if (!courseId || !window.courseflowStripeData.restUrl) {
				return;
			}

			$.ajax({
				url: window.courseflowStripeData.restUrl,
				type: 'POST',
				headers: {
					'X-WP-Nonce': window.courseflowStripeData.nonce,
				},
				data: {
					course_id: courseId,
					course_type: courseType || 'courses',
					price: price || 0,
					currency: (
						currency ||
						window.courseflowStripeData.currency ||
						'usd'
					).toLowerCase(),
				},
				success(response) {
					if (response && response.success && response.sessionId) {
						stripe.redirectToCheckout({
							sessionId: response.sessionId,
						});
					}
				},
			});
		}

		/**
		 * Remove Tutor LMS login modal triggers from buttons.
		 *
		 * @return {void}
		 */
		function cleanTutorButtons() {
			$('.tutor-btn, .tutor-course-list-btn').each(function () {
				const $btn = $(this);

				if ($btn.hasClass('tutor-open-login-modal')) {
					$btn.removeClass('tutor-open-login-modal').off(
						'click.tutor'
					);
				}
			});
		}

		// Initial cleanup.
		cleanTutorButtons();

		// Observe for dynamic changes in course list.
		if ('MutationObserver' in window) {
			const observer = new MutationObserver(function (mutations) {
				mutations.forEach(function (mutation) {
					if (mutation.addedNodes.length) {
						cleanTutorButtons();
					}
				});
			});

			observer.observe(document.body, { childList: true, subtree: true });
		}

		/**
		 * Capture and override Tutor LMS "Buy Now" clicks.
		 */
		document.addEventListener(
			'click',
			function (event) {
				const target = event.target.closest(
					'a.tutor-btn[data-cy="tutor-buy-now"], ' +
						'a.tutor-course-list-btn, ' +
						'a.tutor-btn-primary'
				);

				if (!target) {
					return;
				}

				event.preventDefault();
				event.stopImmediatePropagation();

				// Extract course ID.
				let courseId = null;

				const href = target.getAttribute('href') || '';
				const match = href.match(/course_id=([0-9]+)/);

				if (match) {
					courseId = match[1];
				} else if (target.dataset.courseId) {
					courseId = target.dataset.courseId;
				}

				if (!courseId) {
					return;
				}

				const price =
					parseFloat(target.getAttribute('data-course-price')) || 0;
				const currency =
					target.getAttribute('data-currency') ||
					window.courseflowStripeData.currency;

				handleCourseFlowCheckout(courseId, 'courses', price, currency);
			},
			true
		); // Capture phase
	});
})(window, document, jQuery);
