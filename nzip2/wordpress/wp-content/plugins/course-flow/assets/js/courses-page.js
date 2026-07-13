/**
 * Course Flow – Shortcode Copy to Clipboard Handler
 * Handles copying shortcodes with modern Clipboard API and legacy fallback.
 *
 * @param {jQuery} $ - jQuery object
 * @package
 * @version 1.0.0
 */

(function ($) {
	'use strict';

	// Track copy operations to prevent multiple simultaneous copies
	let isCopying = false;

	/**
	 * Safely get the translation function from wp.i18n with proper fallback
	 *
	 * @return {Function} Translation function
	 */
	const getTranslationFunction = function () {
		// Check if wp.i18n and wp.i18n.__ exist using optional chaining
		if (window.wp?.i18n?.__ && typeof window.wp.i18n.__ === 'function') {
			return window.wp.i18n.__;
		}

		// Fallback: Return text as-is
		return function (text) {
			return text;
		};
	};

	const __ = getTranslationFunction();

	/**
	 * Fallback copy method using document.execCommand
	 *
	 * @param {string} text - Text to copy
	 * @return {void}
	 */
	const fallbackCopy = function (text) {
		// Create temporary input element
		const $tempInput = $('<input>')
			.val(text)
			.css({
				position: 'absolute',
				left: '-9999px',
			})
			.appendTo('body');

		try {
			// Select and copy
			$tempInput[0].select();
			$tempInput[0].setSelectionRange(0, 99999); // For mobile devices

			const successful = document.execCommand('copy');
			if (successful) {
				showToastSuccess();
			} else {
				showToastError();
			}
		} catch (error) {
			showToastError();
		} finally {
			// Clean up temporary element
			$tempInput.remove();
		}
	};

	/**
	 * Displays a success toast message
	 *
	 * @return {void}
	 */
	const showToastSuccess = function () {
		const defaultMessage = __(
			'Shortcode copied to clipboard!',
			'course-flow'
		);
		const message =
			window.courseflowCoursesPageData?.copySuccess || defaultMessage;
		showToast(message);
	};

	/**
	 * Displays an error toast message
	 *
	 * @return {void}
	 */
	const showToastError = function () {
		const message = __(
			'Failed to copy shortcode. Please try again.',
			'course-flow'
		);
		showToast(message);
	};

	/**
	 * Generic toast notification renderer
	 *
	 * @param {string} message - Notification text
	 * @return {void}
	 */
	const showToast = function (message) {
		// Remove existing notifications
		$('.courseflow-copy-notification').remove();

		// Create notification element
		const $toast = $('<div>')
			.addClass('courseflow-copy-notification')
			.text(message)
			.appendTo('body');

		// Animate show/hide
		$toast.hide().fadeIn(300);

		// Auto-remove after delay
		setTimeout(function () {
			$toast.fadeOut(300, function () {
				$(this).remove();
			});
		}, 2000);
	};

	/**
	 * Click handler for shortcode copy buttons
	 *
	 * @param {jQuery.Event} event - Event object
	 * @return {void}
	 */
	$(document).on('click', '.courseflow-copy-button', function (event) {
		event.preventDefault();

		// Prevent multiple simultaneous copy operations
		if (isCopying) {
			return;
		}

		const $button = $(this);
		const text = $button.data('clipboard-text') || '';

		if (!text.trim()) {
			return;
		}

		isCopying = true;

		// Modern Clipboard API
		if (navigator.clipboard && navigator.clipboard.writeText) {
			navigator.clipboard
				.writeText(text)
				.then(function () {
					showToastSuccess();
				})
				.catch(function () {
					fallbackCopy(text);
				})
				.finally(function () {
					isCopying = false;
				});
		} else {
			// Fallback for older browsers
			fallbackCopy(text);
			isCopying = false;
		}
	});
})(jQuery);
