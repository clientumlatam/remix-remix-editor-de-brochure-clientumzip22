/* global Stripe */
/**
 * Course Flow – Stripe Checkout Integration for Tutor LMS
 * Intercepts Tutor LMS "Buy Now" buttons and redirects to Stripe Checkout.
 *
 * @package
 * @since   1.0.0
 */

/**
 * @param {Window}   window   Global window object.
 * @param {Document} document Global document object.
 * @param {jQuery}   $        jQuery instance.
 */
(function (window, document, $) {
	'use strict';

	if (typeof $ === 'undefined') {
		return;
	}

	$(function () {
		// Exit early if required data is missing.
		if (
			typeof courseflowStripeData === 'undefined' ||
			!courseflowStripeData.publishableKey
		) {
			return;
		}

		// Initialize Stripe.js.
		let stripe;
		try {
			stripe = Stripe(courseflowStripeData.publishableKey);
		} catch (err) {
			return;
		}

		/**
		 * Create Stripe Checkout session via REST API.
		 *
		 * @param {string|number} courseId   Course ID.
		 * @param {string}        courseType Course type.
		 * @param {number}        price      Course price.
		 * @param {string}        currency   Currency code.
		 * @return {void}
		 */
		function handleCourseFlowStripeCheckout(
			courseId,
			courseType,
			price,
			currency
		) {
			if (!courseId || !courseflowStripeData.restUrl) {
				return;
			}

			const data = {
				course_id: courseId,
				course_type: courseType || 'courses',
				price: price || 0,
				currency: (
					currency ||
					courseflowStripeData.currency ||
					'USD'
				).toLowerCase(),
			};

			$.ajax({
				url: courseflowStripeData.restUrl,
				type: 'POST',
				headers: {
					'X-WP-Nonce': courseflowStripeData.nonce,
				},
				data,
				success(response) {
					if (
						response &&
						response.success &&
						response.sessionId &&
						stripe
					) {
						stripe.redirectToCheckout({
							sessionId: response.sessionId,
						});
					} else {
						showToast(
							courseflowStripeData.errorMessage ||
								wp.i18n.__(
									'Unable to process payment.',
									'course-flow'
								)
						);
					}
				},
				error() {
					showToast(
						courseflowStripeData.errorMessage ||
							wp.i18n.__(
								'Unable to process payment.',
								'course-flow'
							)
					);
				},
			});
		}

		/**
		 * Extract course ID from element or its attributes.
		 *
		 * @param {HTMLElement} el Element to scan.
		 * @return {string|null} Extracted course ID or null.
		 */
		function extractCourseId(el) {
			if (!el) {
				return null;
			}

			if (el.dataset && el.dataset.courseId) {
				return el.dataset.courseId;
			}

			const attr = el.getAttribute && el.getAttribute('data-course-id');
			if (attr) {
				return attr;
			}

			const href = el.getAttribute && el.getAttribute('href');
			if (href) {
				try {
					const params = new URLSearchParams(href.split('?')[1]);
					if (params.has('course_id')) {
						return params.get('course_id');
					}
					if (params.has('id')) {
						return params.get('id');
					}
				} catch (e) {
					const match = href.match(/[?&]course_id=(\d+)/);
					if (match) {
						return match[1];
					}
				}
			}

			const parent = el.closest && el.closest('[data-course-id]');
			if (parent) {
				return parent.getAttribute('data-course-id');
			}

			return null;
		}

		/**
		 * Remove Tutor LMS login modal triggers from buttons.
		 *
		 * @return {void}
		 */
		function cleanTutorButtons() {
			const $buttons = $(
				'a.tutor-btn[data-cy="tutor-buy-now"], ' +
					'a.tutor-course-list-btn, ' +
					'a.tutor-btn-primary, ' +
					'button.tutor-btn[data-cy="tutor-buy-now"]'
			);

			$buttons.each(function () {
				const $btn = $(this);
				$btn.removeClass('tutor-open-login-modal')
					.off('click.tutor')
					.off('click');
			});
		}

		/**
		 * Display non-intrusive toast notification.
		 *
		 * @param {string} message Text message.
		 * @return {void}
		 */
		function showToast(message) {
			$('.courseflow-stripe-toast').remove();

			const $toast = $('<div>')
				.addClass('courseflow-stripe-toast')
				.text(message)
				.appendTo('body');

			$toast.hide().fadeIn(300);

			setTimeout(function () {
				$toast.fadeOut(300, function () {
					$(this).remove();
				});
			}, 2000);
		}

		// Run once and observe DOM changes.
		cleanTutorButtons();

		if ('MutationObserver' in window) {
			const observer = new MutationObserver(cleanTutorButtons);
			observer.observe(document.body || document.documentElement, {
				childList: true,
				subtree: true,
			});
		}

		// Course Flow native buttons.
		$(document).on(
			'click',
			'.courseflow-stripe-button, .courseflow-stripe-image-button',
			function (e) {
				e.preventDefault();

				const $btn = $(this);
				handleCourseFlowStripeCheckout(
					$btn.data('course-id'),
					$btn.data('course-type'),
					parseFloat($btn.data('course-price')) || 0,
					$btn.data('currency') || courseflowStripeData.currency
				);
			}
		);

		// Tutor LMS button interception.
		const tutorSelector =
			'a.tutor-btn[data-cy="tutor-buy-now"], a.tutor-course-list-btn, a.tutor-btn-primary, button.tutor-btn[data-cy="tutor-buy-now"]';
		const events = ['pointerdown', 'mousedown', 'touchstart', 'click'];

		/**
		 * Capture handler for Tutor LMS buy buttons.
		 *
		 * @param {Event} evt DOM event.
		 * @return {void}
		 */
		function tutorCaptureHandler(evt) {
			if (evt.button && evt.button !== 0) {
				return;
			}
			if (evt.metaKey || evt.ctrlKey || evt.shiftKey || evt.altKey) {
				return;
			}

			const target =
				evt.target &&
				evt.target.closest &&
				evt.target.closest(tutorSelector);
			if (!target) {
				return;
			}

			evt.preventDefault();

			if (evt.stopImmediatePropagation) {
				evt.stopImmediatePropagation();
			}
			if (evt.stopPropagation) {
				evt.stopPropagation();
			}

			if (evt.type === 'click') {
				const courseId = extractCourseId(target);
				if (!courseId) {
					return;
				}

				const price =
					parseFloat(target.getAttribute('data-course-price')) || 0;
				const currency =
					target.getAttribute('data-currency') ||
					courseflowStripeData.currency;

				handleCourseFlowStripeCheckout(
					courseId,
					'courses',
					price,
					currency
				);
			}
		}

		// Attach listeners in capture phase.
		events.forEach(function (eventName) {
			document.addEventListener(eventName, tutorCaptureHandler, true);
		});
	});
})(window, document, jQuery);
