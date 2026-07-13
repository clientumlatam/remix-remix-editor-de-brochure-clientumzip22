/**
 * Course Flow – Toggle Stripe Secret Key Visibility
 * Switches the Stripe secret key input between password and text type.
 *
 * @package
 */

jQuery(document).ready(function ($) {
	'use strict';

	/**
	 * Toggle visibility of the Stripe secret key field.
	 *
	 * @return {void}
	 */
	$('#courseflow_toggle_secret_key').on('click', function () {
		const $button = $(this);
		const $input = $('#courseflow_stripe_secret_key');
		const isPassword = $input.attr('type') === 'password';

		if (isPassword) {
			$input.attr('type', 'text');
			$button.text(courseflowToggleSecretKey.hideText);
		} else {
			$input.attr('type', 'password');
			$button.text(courseflowToggleSecretKey.showText);
		}
	});
});
