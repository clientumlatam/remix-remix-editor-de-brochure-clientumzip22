/**
 * Course Flow – Image Button Settings JavaScript
 * Handles image upload, dimensions detection, aspect ratio, preview and shortcode copy.
 *
 * @package
 * @version 1.0.0
 */

/**
 * @param {jQuery} $    jQuery instance.
 * @param {Object} i18n wp.i18n module.
 */
(function ($, i18n) {
	'use strict';

	const { __ } = i18n;

	let mediaUploader;

	/**
	 * Shows error toast notification.
	 *
	 * @param {string} message Error message.
	 */
	function showNotificationError(message) {
		$('.courseflow-copy-notification, .courseflow-overlay').remove();

		const $overlay = $('<div>').addClass('courseflow-overlay');
		$('body').append($overlay);

		const $notification = $('<div>')
			.addClass('courseflow-copy-notification error')
			.text(message)
			.appendTo('body');

		$notification
			.fadeIn(300)
			.delay(2500)
			.fadeOut(300, function () {
				$(this).add($overlay).remove();
			});
	}

	/**
	 * Initializes original image dimensions from metadata or fallback.
	 */
	function initializeOriginalDimensions() {
		const savedWidth = parseInt(
			$('#courseflow_image_button_width').val(),
			10
		);
		const savedHeight = parseInt(
			$('#courseflow_image_button_height').val(),
			10
		);
		const imageUrl = $('#courseflow_image_button_url').val();
		const isOriginal = $('#courseflow_image_button_original_size').is(
			':checked'
		);

		if (imageUrl) {
			getAttachmentDimensions(imageUrl, function (dimensions) {
				const oWidth = dimensions.width || savedWidth || 150;
				const oHeight = dimensions.height || savedHeight || 40;

				$('#courseflow_image_button_width').data(
					'original-width',
					oWidth
				);
				$('#courseflow_image_button_height').data(
					'original-height',
					oHeight
				);

				if (isOriginal) {
					$('#courseflow_image_button_width').val('');
					$('#courseflow_image_button_height').val('');
				} else if (!savedWidth && !savedHeight) {
					$('#courseflow_image_button_width').val('');
					$('#courseflow_image_button_height').val('');
				} else {
					if (!savedWidth) {
						$('#courseflow_image_button_width').val(oWidth);
					}
					if (!savedHeight) {
						$('#courseflow_image_button_height').val(oHeight);
					}
				}

				updateImagePreview();
			});
		} else {
			$('#courseflow_image_button_width').data(
				'original-width',
				savedWidth || 150
			);
			$('#courseflow_image_button_height').data(
				'original-height',
				savedHeight || 40
			);
			updateImagePreview();
		}
	}

	/**
	 * Gets image dimensions via AJAX (for WP uploads) or fallback to direct load.
	 *
	 * @param {string}   url      Image URL.
	 * @param {Function} callback Callback returning {width, height}.
	 */
	function getAttachmentDimensions(url, callback) {
		if (!url) {
			callback({ width: 150, height: 40 });
			return;
		}

		$.ajax({
			url: ajaxurl,
			method: 'POST',
			data: {
				action: 'courseflow_get_attachment_dimensions',
				url,
				_ajax_nonce: courseflowImageButtonData.nonce,
			},
			success(response) {
				if (
					response.success &&
					response.data.width &&
					response.data.height
				) {
					callback(response.data);
				} else {
					fetchImageDimensions(url, callback);
				}
			},
			error() {
				fetchImageDimensions(url, callback);
			},
		});
	}

	/**
	 * Fallback: loads image directly to read natural dimensions.
	 *
	 * @param {string}   url      Image URL.
	 * @param {Function} callback Callback.
	 */
	function fetchImageDimensions(url, callback) {
		const img = new Image();
		img.onload = function () {
			callback({ width: img.width, height: img.height });
		};
		img.onerror = function () {
			callback({ width: 150, height: 40 });
		};
		img.src = url;
	}

	/**
	 * Updates the live preview of the image button.
	 */
	function updateImagePreview() {
		const imageUrl = $('#courseflow_image_button_url').val();
		const widthInput = parseInt(
			$('#courseflow_image_button_width').val(),
			10
		);
		const heightInput = parseInt(
			$('#courseflow_image_button_height').val(),
			10
		);
		const oWidth =
			$('#courseflow_image_button_width').data('original-width') || 150;
		const oHeight =
			$('#courseflow_image_button_height').data('original-height') || 40;
		const altText = $('#courseflow_image_button_alt').val() || '';

		if (!imageUrl) {
			$('#courseflow-preview-image-button').remove();
			return;
		}

		const width = isNaN(widthInput) ? oWidth : widthInput;
		const height = isNaN(heightInput) ? oHeight : heightInput;

		let $preview = $('#courseflow-preview-image-button');
		if ($preview.length === 0) {
			$preview = $('<img />', { id: 'courseflow-preview-image-button' });
			$('.courseflow-button-settings-preview').append($preview);
		}

		$preview.attr({
			src: imageUrl,
			width,
			height,
			alt: altText,
		});
	}

	/**
	 * Maintains aspect ratio.
	 *
	 * @param {string} changedField "width" or "height".
	 */
	function maintainAspectRatio(changedField) {
		if (
			!$('#courseflow_image_button_maintain_aspect_ratio').is(':checked')
		) {
			updateImagePreview();
			return;
		}

		const oWidth =
			parseInt(
				$('#courseflow_image_button_width').data('original-width'),
				10
			) || 150;
		const oHeight =
			parseInt(
				$('#courseflow_image_button_height').data('original-height'),
				10
			) || 40;
		const ratio = oWidth / oHeight;

		if (changedField === 'width') {
			const newW = parseInt(
				$('#courseflow_image_button_width').val(),
				10
			);
			if (!isNaN(newW) && newW > 0) {
				$('#courseflow_image_button_height').val(
					Math.round(newW / ratio)
				);
			}
		} else if (changedField === 'height') {
			const newH = parseInt(
				$('#courseflow_image_button_height').val(),
				10
			);
			if (!isNaN(newH) && newH > 0) {
				$('#courseflow_image_button_width').val(
					Math.round(newH * ratio)
				);
			}
		}

		updateImagePreview();
	}

	/**
	 * Shows success notification.
	 */
	function showNotification() {
		$('.courseflow-copy-notification, .courseflow-overlay').remove();

		const $overlay = $('<div>').addClass('courseflow-overlay');
		$('body').append($overlay);

		const message =
			courseflowImageButtonData.copySuccess ||
			__('Shortcode copied!', 'course-flow');

		const $notification = $('<div>')
			.addClass('courseflow-copy-notification')
			.text(message)
			.appendTo('body');

		$notification
			.fadeIn(300)
			.delay(2000)
			.fadeOut(300, function () {
				$(this).add($overlay).remove();
			});
	}

	/**
	 * Fallback copy method.
	 *
	 * @param {string} textToCopy Text to copy.
	 */
	function fallbackCopy(textToCopy) {
		const $temp = $('<input>').val(textToCopy).appendTo('body').select();

		try {
			const successful = document.execCommand('copy');
			if (successful) {
				showNotification();
			} else {
				showNotificationError(
					__(
						'Failed to copy shortcode. Please try again.',
						'course-flow'
					)
				);
			}
		} catch (err) {
			showNotificationError(
				__('Failed to copy shortcode. Please try again.', 'course-flow')
			);
		}

		$temp.remove();
	}

	// ======================
	//        HANDLERS
	// ======================

	$('.courseflow-upload-button').on('click', function (e) {
		e.preventDefault();

		if (mediaUploader) {
			mediaUploader.open();
			return;
		}

		mediaUploader = wp.media({
			title: courseflowImageButtonData.mediaTitle,
			button: { text: courseflowImageButtonData.mediaButtonText },
			multiple: false,
		});

		mediaUploader.on('select', function () {
			const attachment = mediaUploader
				.state()
				.get('selection')
				.first()
				.toJSON();
			$('#courseflow_image_button_url').val(attachment.url);
			$('#courseflow_image_button_alt').val(
				attachment.alt || courseflowImageButtonData.defaultAlt
			);
			$('#courseflow_image_button_original_size').prop('checked', true);
			initializeOriginalDimensions();
		});

		mediaUploader.open();
	});

	$('.courseflow-remove-button').on('click', function (e) {
		e.preventDefault();
		$(
			'#courseflow_image_button_url, #courseflow_image_button_alt, #courseflow_image_button_width, #courseflow_image_button_height'
		).val('');
		$('#courseflow_image_button_original_size').prop('checked', false);
		updateImagePreview();
	});

	$('#courseflow_image_button_width').on('input', function () {
		maintainAspectRatio('width');
	});

	$('#courseflow_image_button_height').on('input', function () {
		maintainAspectRatio('height');
	});

	$('#courseflow_image_button_url, #courseflow_image_button_alt').on(
		'input',
		updateImagePreview
	);

	$('#courseflow_image_button_original_size').on('change', function () {
		const checked = $(this).is(':checked');
		const $width = $('#courseflow_image_button_width');
		const $height = $('#courseflow_image_button_height');

		if (checked) {
			$('#courseflow_image_button_maintain_aspect_ratio').prop(
				'checked',
				false
			);
			$width.val('').prop('disabled', true);
			$height.val('').prop('disabled', true);
		} else {
			const oWidth = $width.data('original-width') || 150;
			const oHeight = $height.data('original-height') || 40;
			$width.val(oWidth).prop('disabled', false);
			$height.val(oHeight).prop('disabled', false);
		}
		updateImagePreview();
	});

	$('#courseflow_image_button_maintain_aspect_ratio').on(
		'change',
		function () {
			if ($(this).is(':checked')) {
				$('#courseflow_image_button_original_size').prop(
					'checked',
					false
				);
				$(
					'#courseflow_image_button_width, #courseflow_image_button_height'
				).prop('disabled', false);

				const oWidth =
					$('#courseflow_image_button_width').data(
						'original-width'
					) || 150;
				const oHeight =
					$('#courseflow_image_button_height').data(
						'original-height'
					) || 40;

				$('#courseflow_image_button_width').val(oWidth);
				$('#courseflow_image_button_height').val(oHeight);
			}
			updateImagePreview();
		}
	);

	$(document).on('click', '.courseflow-copy-button', function (e) {
		e.preventDefault();

		const textToCopy = $(this).data('clipboard-text');
		if (!textToCopy) {
			return;
		}

		if (navigator.clipboard && navigator.clipboard.writeText) {
			navigator.clipboard
				.writeText(textToCopy)
				.then(showNotification)
				.catch(function () {
					fallbackCopy(textToCopy);
				});
		} else {
			fallbackCopy(textToCopy);
		}
	});

	initializeOriginalDimensions();
})(jQuery, wp.i18n);
