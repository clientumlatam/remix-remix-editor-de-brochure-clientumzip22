/**
 * Course Flow – Stripe Connection Test
 * Professional UX with consistent data sharing messaging.
 * Uses WordPress i18n system for translations.
 *
 * @param {Object} $  jQuery instance.
 * @param {Object} wp WordPress global object.
 * @package
 * @since 1.0.0
 * @version 1.0.0
 */

(function ($, wp) {
	'use strict';

	// Exit early if not on Course Flow settings page.
	if (window.location.href.indexOf('page=courseflow-settings') === -1) {
		return;
	}

	/**
	 * i18n wrapper ensuring safe fallback if wp.i18n is unavailable.
	 *
	 * @return {Function} Translation function.
	 */
	const i18n = (function () {
		if (
			typeof wp !== 'undefined' &&
			wp.i18n &&
			typeof wp.i18n.__ === 'function'
		) {
			return wp.i18n.__;
		}
		return function (text) {
			return text;
		};
	})();

	// Emoji constants (not translatable).
	const EMOJI = {
		CHECK: '✅',
		CROSS: '❌',
		WARNING: '❌',
		BULB: '💡',
	};

	// Exit early if required config is missing.
	if (typeof window.courseflowTestConnection === 'undefined') {
		const $errorDiv = $('#courseflow-test-result');
		if ($errorDiv.length) {
			$errorDiv.html(
				'<p style="color:#d63638;">' +
					i18n(
						'Error: Could not load connection test configuration. Please reload the page.',
						'course-flow'
					) +
					'</p>'
			);
		}
		return;
	}

	// Cache DOM elements.
	const $button = $('#courseflow-test-stripe-connection');
	const $existing = $('#courseflow-test-result');
	const $resultDiv = $existing.length
		? $existing
		: $('<div>', {
				id: 'courseflow-test-result',
				css: {
					'margin-top': '10px',
					display: 'block',
					'background-color': '#f8f8f8',
					padding: '10px',
					border: '1px solid #ddd',
					'border-radius': '4px',
				},
			}).insertAfter($button);

	$resultDiv.css({ display: 'block', visibility: 'visible', opacity: 1 });

	/**
	 * Simple HTML escaping for safe output.
	 *
	 * @since 1.2.37
	 * @param {string} str Input string.
	 * @return {string} Escaped HTML string.
	 */
	function escHtml(str) {
		if (typeof str !== 'string') {
			return '';
		}
		const div = document.createElement('div');
		div.textContent = str;
		return div.innerHTML;
	}

	/**
	 * Get emoji for status.
	 *
	 * @param {string}         type   Status category (secret, webhook, data).
	 * @param {string|boolean} status Status code.
	 * @return {string} Emoji representing the status.
	 */
	function getStatusEmoji(type, status) {
		if (type === 'data') {
			return status === true ? EMOJI.CHECK : EMOJI.CROSS;
		}
		if (status === 'success' || status === true) {
			return EMOJI.CHECK;
		}
		if (status === 'error' || status === false) {
			return EMOJI.CROSS;
		}
		return EMOJI.WARNING;
	}

	/**
	 * Get label for status.
	 *
	 * @param {string}         type   Status category (secret, webhook, data).
	 * @param {string|boolean} status Status code.
	 * @return {string} Translated label.
	 */
	function getStatusLabel(type, status) {
		if (type === 'data') {
			return status === true
				? i18n('Enabled', 'course-flow')
				: i18n('Disabled', 'course-flow');
		}
		if (status === 'success' || status === true) {
			return i18n('Passed', 'course-flow');
		}
		if (status === 'error' || status === false) {
			return i18n('Failed', 'course-flow');
		}
		return i18n('Warning', 'course-flow');
	}

	/**
	 * Process Stripe secret key message.
	 *
	 * @param {string} secretMessage Raw Stripe message.
	 * @param {string} secretStatus  Status code.
	 * @return {string} Sanitized display message.
	 */
	function processSecretMessage(secretMessage, secretStatus) {
		let message = secretMessage;

		const stripeApiError = i18n(
			'This API call cannot be made with a publishable API key. Please use a secret API key. You can find a list of your API keys at',
			'course-flow'
		);

		if (secretMessage.includes(stripeApiError)) {
			message = secretMessage;
		} else if (secretMessage.includes('Invalid API Key provided:')) {
			message =
				i18n('Invalid API Key provided:', 'course-flow') +
				' ' +
				secretMessage.replace('Invalid API Key provided:', '');
		} else if (secretStatus === 'success') {
			message = i18n('Stripe secret key is correct.', 'course-flow');
		} else if (secretStatus === 'error' && secretMessage) {
			message =
				i18n('Stripe secret key error:', 'course-flow') +
				' ' +
				secretMessage;
		} else if (secretStatus === 'error') {
			message = i18n('Stripe secret key error:', 'course-flow');
		}

		if (message.includes('https://dashboard.stripe.com/account/apikeys')) {
			const parts = message.split(
				'https://dashboard.stripe.com/account/apikeys'
			);
			message =
				escHtml(parts[0]) +
				'<a href="https://dashboard.stripe.com/account/apikeys" target="_blank" rel="noopener noreferrer" style="text-decoration:underline;color:#dba617;font-weight:500;">' +
				'https://dashboard.stripe.com/account/apikeys' +
				'</a>' +
				escHtml(parts[1] || '');
		} else {
			message = escHtml(message);
		}

		return message;
	}

	/**
	 * Process webhook message.
	 *
	 * @param {string} webhookMessage Raw webhook message.
	 * @param {string} webhookStatus  Status code.
	 * @return {string} Sanitized output message.
	 */
	function processWebhookMessage(webhookMessage, webhookStatus) {
		let message = webhookMessage;

		if (webhookStatus === 'success') {
			message = i18n(
				'Stripe webhook key format is valid.',
				'course-flow'
			);
		} else if (webhookStatus === 'error') {
			message = i18n(
				'Invalid Stripe webhook key format. Webhooks will not work.',
				'course-flow'
			);
		} else if (webhookStatus === 'warning') {
			message = i18n(
				'Webhook key is not set. Stripe webhooks will not work until you add a webhook secret.',
				'course-flow'
			);
		}

		return escHtml(message);
	}

	/**
	 * Render test results.
	 *
	 * @param {Object} data    All structured Stripe test data.
	 * @param {string} message Status message from server.
	 * @return {void}
	 */
	function renderTestResults(data, message) {
		let html = '<ul style="list-style:none;padding-left:0;margin:0;">';

		try {
			if (
				data &&
				data.secret_key &&
				data.endpoint_secret &&
				data.data_collection
			) {
				const secretStatus =
					data.secret_key.status === true ? 'success' : 'error';
				const secretEmoji = getStatusEmoji('secret', secretStatus);
				const secretLabel = getStatusLabel('secret', secretStatus);

				const processedSecretMessage = processSecretMessage(
					data.secret_key.message || '',
					secretStatus
				);

				html +=
					'<li style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid #eee;">' +
					'<strong>' +
					escHtml(i18n('Secret Key:', 'course-flow')) +
					'</strong> ' +
					secretEmoji +
					' ' +
					'<span style="font-weight:600;text-transform:uppercase;font-size:0.9em;letter-spacing:0.5px;">' +
					escHtml(secretLabel) +
					'</span> - ' +
					processedSecretMessage +
					'</li>';

				const webhookStatus = data.endpoint_secret.status || 'warning';
				const webhookEmoji = getStatusEmoji('webhook', webhookStatus);
				const webhookLabel = getStatusLabel('webhook', webhookStatus);

				const webhookMessage = processWebhookMessage(
					data.endpoint_secret.message || '',
					webhookStatus
				);

				html +=
					'<li style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid #eee;">' +
					'<strong>' +
					escHtml(i18n('Stripe Webhook Secret:', 'course-flow')) +
					'</strong> ' +
					webhookEmoji +
					' ' +
					'<span style="font-weight:600;text-transform:uppercase;font-size:0.9em;letter-spacing:0.5px;">' +
					escHtml(webhookLabel) +
					'</span> - ' +
					webhookMessage;

				if (webhookStatus === 'success' || webhookStatus === 'error') {
					html +=
						' ' +
						escHtml(
							i18n(
								'(format only, without full verification)',
								'course-flow'
							)
						);
				} else {
					html +=
						' <span style="color:#dba617;font-style:italic;">(' +
						escHtml(
							i18n('Not set - webhooks disabled', 'course-flow')
						) +
						')</span>';
				}

				html += '</li>';

				const dataStatus = data.data_collection.status === true;
				const dataEmoji = getStatusEmoji('data', dataStatus);
				const dataLabel = getStatusLabel('data', dataStatus);
				let dataMessage = data.data_collection.message || '';

				if (!dataMessage && dataStatus) {
					dataMessage = i18n(
						'Thank you for helping improve Course Flow! Your anonymous data helps us make the plugin even better.',
						'course-flow'
					);
				}

				html +=
					'<li style="margin-bottom:10px;padding-bottom:10px;' +
					(dataStatus
						? 'border-bottom:1px solid #eee;'
						: 'border-bottom:1px solid #eee;background-color:#fff8e1;padding:12px 15px;border-radius:4px;') +
					'">' +
					'<strong>' +
					escHtml(i18n('Data sharing:', 'course-flow')) +
					'</strong> ' +
					dataEmoji +
					' ' +
					'<span style="font-weight:600;text-transform:uppercase;font-size:0.9em;letter-spacing:0.5px;">' +
					escHtml(dataLabel) +
					'</span> - ' +
					escHtml(dataMessage);

				if (!dataStatus) {
					html +=
						'<div style="margin-top:8px;font-size:0.9em;color:#555;">' +
						'<em>' +
						EMOJI.BULB +
						' ' +
						escHtml(
							i18n(
								'Tip: Enabling data sharing helps us improve Course Flow for everyone. No personal data is collected.',
								'course-flow'
							)
						) +
						'</em>' +
						'</div>';
				}

				html += '</li>';

				if (message) {
					let processedMessage = message;
					if (
						message.includes(
							'Settings saved and connection tested.'
						)
					) {
						processedMessage = i18n(
							'Settings saved and connection tested.',
							'course-flow'
						);
					}
					html +=
						'<li style="margin-top:10px;padding-top:10px;">' +
						'<strong>' +
						escHtml(processedMessage) +
						':</strong> ' +
						EMOJI.CHECK +
						'</li>';
				}

				if (webhookStatus === 'warning') {
					html +=
						'<li style="margin-top:15px;padding:12px 15px;background-color:#fff8e1;border-left:4px solid #ffb300;border-radius:3px;font-size:0.95em;">' +
						'<strong>' +
						EMOJI.WARNING +
						' ' +
						escHtml(i18n('Important:', 'course-flow')) +
						'</strong> ' +
						escHtml(
							i18n(
								'Stripe webhooks require a webhook secret to function. Without it, automatic enrollment and payment confirmation will not work.',
								'course-flow'
							)
						) +
						' ' +
						'<a href="https://dashboard.stripe.com/webhooks" target="_blank" rel="noopener noreferrer" style="text-decoration:underline;color:#dba617;font-weight:500;">' +
						escHtml(
							i18n(
								'Configure webhooks in Stripe Dashboard',
								'course-flow'
							)
						) +
						'</a>' +
						'</li>';
				}
			} else {
				throw new Error(
					i18n('Invalid response structure', 'course-flow')
				);
			}
		} catch (err) {
			html +=
				'<li><p style="color:#d63638;">' +
				EMOJI.CROSS +
				' ' +
				escHtml(i18n('Incorrect server response:', 'course-flow')) +
				' ' +
				escHtml(err.message) +
				'</p></li>';
		}

		html += '</ul>';
		$resultDiv.html(html);
	}

	/**
	 * Render error message.
	 *
	 * @param {string} msg Error message.
	 * @return {void}
	 */
	function renderError(msg) {
		$resultDiv.html(
			'<p style="color:#d63638;">' +
				EMOJI.CROSS +
				' ' +
				escHtml(msg) +
				'</p>'
		);
	}

	// Main click handler.
	$button.on('click', function (evt) {
		evt.preventDefault();

		const $this = $(this);
		$this.prop('disabled', true).text(i18n('Testing…', 'course-flow'));

		$resultDiv.html(
			'<p>' +
				escHtml(
					i18n('Testing connection in progress…', 'course-flow')
				) +
				'</p>'
		);

		const publishableKey = (
			$('#courseflow_stripe_publishable_key').val() || ''
		).trim();
		const secretKey = (
			$('#courseflow_stripe_secret_key').val() || ''
		).trim();
		const endpointSecret = (
			$('#courseflow_stripe_endpoint_secret').val() || ''
		).trim();
		const allowUrlCollection = $('#courseflow_allow_url_collection').is(
			':checked'
		)
			? 1
			: 0;
		const autoCreateAccount = $('#courseflow_auto_create_account').is(
			':checked'
		)
			? 1
			: 0;
		const successPageId =
			parseInt($('#courseflow_success_page_id').val() || '0', 10) || 0;

		if (!publishableKey || !secretKey) {
			renderError(
				i18n(
					'Please fill in your Stripe Publishable Key and Secret Key before testing.',
					'course-flow'
				)
			);
			$this
				.prop('disabled', false)
				.text(i18n('TEST CONNECTION', 'course-flow'));
			return;
		}

		if (
			!window.courseflowTestConnection.restUrl ||
			!window.courseflowTestConnection.nonce
		) {
			renderError(i18n('Configuration error.', 'course-flow'));
			$this
				.prop('disabled', false)
				.text(i18n('TEST CONNECTION', 'course-flow'));
			return;
		}

		$.ajax({
			url: window.courseflowTestConnection.restUrl,
			method: 'POST',
			data: {
				publishable_key: publishableKey,
				secret_key: secretKey,
				endpoint_secret: endpointSecret,
				allow_url_collection: allowUrlCollection,
				courseflow_stripe_publishable_key: publishableKey,
				courseflow_stripe_secret_key: secretKey,
				courseflow_stripe_endpoint_secret: endpointSecret,
				courseflow_allow_url_collection: allowUrlCollection,
				courseflow_auto_create_account: autoCreateAccount,
				courseflow_success_page_id: successPageId,
			},
			/**
			 * Set request headers.
			 *
			 * @param {Object} xhr XHR object.
			 * @return {void}
			 */
			beforeSend(xhr) {
				xhr.setRequestHeader(
					'X-WP-Nonce',
					window.courseflowTestConnection.nonce
				);
			},
			/**
			 * AJAX success handler.
			 *
			 * @param {Object} response Parsed JSON response.
			 * @return {void}
			 */
			success(response) {
				try {
					if (
						response &&
						typeof response === 'object' &&
						'data' in response &&
						response.data
					) {
						renderTestResults(response.data, response.message);
					} else {
						throw new Error(
							i18n('Invalid response', 'course-flow')
						);
					}
				} catch (err) {
					renderError(
						i18n('Incorrect server response:', 'course-flow') +
							' ' +
							err.message
					);
				}
			},
			/**
			 * AJAX error handler.
			 *
			 * @param {Object} xhr XHR response.
			 * @return {void}
			 */
			error(xhr) {
				let errorMsg = i18n('Connection test error:', 'course-flow');
				try {
					const resp = xhr.responseJSON || {};
					if (resp.data) {
						renderTestResults(resp.data, resp.message);
						return;
					}
				} catch (xhrErr) {
					errorMsg += ' ' + (xhr.responseText || xhrErr.message);
				}
				renderError(errorMsg);
			},
			/**
			 * AJAX completion handler.
			 *
			 * @return {void}
			 */
			complete() {
				$this
					.prop('disabled', false)
					.text(i18n('TEST CONNECTION', 'course-flow'));
			},
		});
	});
})(jQuery, window.wp);
