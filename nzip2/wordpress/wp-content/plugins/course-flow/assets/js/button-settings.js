/**
 * Course Flow – Button Preview Live Renderer
 * Manages button settings in admin with localization support via wp.i18n.
 *
 * @version 1.0.0
 * @package
 * @param {jQuery} $ - jQuery instance passed by WordPress
 */

(function ($) {
	'use strict';

	/**
	 * Safe reference to wp.i18n with fallback
	 *
	 * @type {Object}
	 */
	const i18n = window.wp?.i18n || {
		__: (text) => text,
	};

	// Only import what we actually use
	const { __ } = i18n;

	/**
	 * Update the live preview of button settings.
	 *
	 * @since 1.9.23
	 * @return {void}
	 */
	function updatePreview() {
		const text =
			$('#courseflow_course_button_text').val() ||
			__('Buy Now', 'course-flow');

		const fontFamily =
			$('#courseflow_button_font_family').val() || 'Poppins';
		const fontSizeInput = $('#courseflow_button_font_size').val();
		let fontSize = '16px';

		if (fontSizeInput && !isNaN(fontSizeInput) && fontSizeInput > 0) {
			fontSize = `${fontSizeInput}px`;
		}

		const textColor = $('#courseflow_button_text_color').val() || '#ffffff';
		const bgColor =
			$('#courseflow_button_background_color').val() || '#5469d4';
		const borderColor =
			$('#courseflow_button_border_color').val() || '#5469d4';
		const height = `${$('#courseflow_button_height').val() || 40}px`;
		const widthValue =
			parseInt($('#courseflow_button_width').val(), 10) || 150;
		const borderRadius = `${$('#courseflow_button_border_radius').val() || 5}px`;
		const borderWidth = `${$('#courseflow_button_border_width').val() || 1}px`;
		const borderStyle =
			$('#courseflow_button_border_style').val() || 'solid';
		const shadowX = `${$('#courseflow_button_shadow_x').val() || 0}px`;
		const shadowY = `${$('#courseflow_button_shadow_y').val() || 0}px`;
		const shadowBlur = `${$('#courseflow_button_shadow_blur').val() || 0}px`;
		const shadowSpread = `${$('#courseflow_button_shadow_spread').val() || 0}px`;
		const shadowColor =
			$('#courseflow_button_shadow_color').val() || '#000000';
		const bgColorHover =
			$('#courseflow_button_background_color_hover').val() || '#5469d4';
		const textColorHover =
			$('#courseflow_button_text_color_hover').val() || '#ffffff';

		// Build shadow CSS property
		const shadow = `${shadowX} ${shadowY} ${shadowBlur} ${shadowSpread} ${shadowColor}`;

		// Responsive width max 90%
		const viewportWidth = window.innerWidth;
		const maxWidth = viewportWidth * 0.9;
		const adjustedWidth = Math.min(widthValue, maxWidth);

		// Apply main styles
		$('#courseflow-preview-button')
			.text(text)
			.css({
				'font-family': fontFamily,
				'font-size': fontSize,
				color: textColor,
				'background-color': bgColor,
				'border-color': borderColor,
				height,
				width: `${adjustedWidth}px`,
				'border-radius': borderRadius,
				'border-width': borderWidth,
				'border-style': borderStyle,
				'box-shadow': shadow,
				display: 'flex',
				'align-items': 'center',
				'justify-content': 'center',
				padding: '0 10px',
				'box-sizing': 'border-box',
				cursor: 'pointer',
				'font-weight': '500',
				transition: 'all 0.3s ease',
			});

		// Store original colors for hover effects
		const $button = $('#courseflow-preview-button');
		$button.data('original-bg-color', bgColor);
		$button.data('original-text-color', textColor);

		// Set hover styles as CSS custom properties
		$button.css({
			'--cf-hover-bg-color': bgColorHover,
			'--cf-hover-text-color': textColorHover,
		});
	}

	/**
	 * Apply hover effects using CSS custom properties.
	 *
	 * @since 1.9.24
	 * @return {void}
	 */
	function setupHoverEffects() {
		const $button = $('#courseflow-preview-button');

		// Use CSS transitions for smoother hover effects
		$button
			.off('mouseenter mouseleave')
			.on('mouseenter', function () {
				$(this).css({
					'background-color': 'var(--cf-hover-bg-color)',
					color: 'var(--cf-hover-text-color)',
				});
			})
			.on('mouseleave', function () {
				$(this).css({
					'background-color': $(this).data('original-bg-color'),
					color: $(this).data('original-text-color'),
				});
			});
	}

	/**
	 * Initialize Select2 for font family dropdown.
	 *
	 * @since 1.9.24
	 * @return {void}
	 */
	function initializeSelect2() {
		const $fontFamilySelect = $('#courseflow_button_font_family');

		if ($.fn.select2 && $fontFamilySelect.length) {
			$fontFamilySelect.select2({
				minimumResultsForSearch: Infinity,
				width: '100%',
				dropdownParent: $fontFamilySelect.parent(),
			});
		}
	}

	/**
	 * Initialize WordPress color pickers.
	 *
	 * @since 1.9.24
	 * @return {void}
	 */
	function initializeColorPickers() {
		const $colorPickers = $('.courseflow-color-picker');

		if ($.fn.wpColorPicker && $colorPickers.length) {
			$colorPickers.each(function () {
				const $picker = $(this);

				// Check if color picker is already initialized
				if (!$picker.hasClass('wp-color-picker')) {
					$picker.wpColorPicker({
						change: function () {
							// Use debounce to prevent excessive preview updates
							clearTimeout($picker.data('colorTimer'));
							$picker.data(
								'colorTimer',
								setTimeout(updatePreview, 100)
							);
						},
						clear: function () {
							updatePreview();
						},
					});
				}
			});
		}
	}

	/**
	 * Set up input event listeners with debouncing.
	 *
	 * @since 1.9.24
	 * @return {void}
	 */
	function setupInputListeners() {
		const $inputs = $('.courseflow-input');
		let previewTimer;

		/**
		 * Debounced preview update.
		 */
		function debouncedUpdatePreview() {
			clearTimeout(previewTimer);
			previewTimer = setTimeout(updatePreview, 50);
		}

		// Update preview on any change with debouncing
		$inputs.on('input change keyup', debouncedUpdatePreview);

		// Special handling for font size with immediate feedback
		$('#courseflow_button_font_size').on('input change', function () {
			const value = $(this).val();
			const size =
				value && !isNaN(value) && value > 0 ? `${value}px` : '16px';
			$('#courseflow-preview-button').css('font-size', size);
		});
	}

	/**
	 * Handle window resize with debouncing.
	 *
	 * @since 1.9.24
	 * @return {void}
	 */
	function setupResizeHandler() {
		let resizeTimer;

		$(window).on('resize', function () {
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(updatePreview, 100);
		});
	}

	/**
	 * Initialize button settings page functionality.
	 *
	 * @since 1.9.23
	 * @return {void}
	 */
	function initializeButtonSettings() {
		// Initialize all components
		initializeSelect2();
		initializeColorPickers();
		setupInputListeners();
		setupResizeHandler();

		// Initial render and hover setup
		updatePreview();
		setupHoverEffects();

		// Re-initialize hover effects after preview updates
		$(document).on('cf-preview-updated', setupHoverEffects);
	}

	/**
	 * Trigger custom event when preview is updated.
	 *
	 * @since 1.9.24
	 * @return {void}
	 */
	const originalUpdatePreview = updatePreview;
	updatePreview = function () {
		originalUpdatePreview();
		$(document).trigger('cf-preview-updated');
	};

	// Initialize when document is ready
	$(function () {
		// Check if we're on the correct admin page
		if ($('#courseflow-preview-button').length) {
			initializeButtonSettings();
		}
	});
})(jQuery);
