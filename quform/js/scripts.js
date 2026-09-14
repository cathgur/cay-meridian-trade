jQuery(document).ready(function($) {
	var whatsappNumber = ['1', '915', '003', '6874'].join('');
	var whatsappMessage = encodeURIComponent("Hello Cay Meridian Trade, I'd like to enquire about sourcing a product.");
	$('.cm-whatsapp-link').attr('href', 'https://wa.me/' + whatsappNumber + '?text=' + whatsappMessage);

	$('form.quform[action^="quform/"]').Quform();

	$('form.quform[action^="https://formspree.io/f/"]').on('submit', function(event) {
		event.preventDefault();

		var form = this;
		var submitButton = $(form).find('button[type="submit"]');
		var successMessage = $(form).find('.quform-success-message');
		var errorMessage = $(form).find('.quform-errors');

		submitButton.prop('disabled', true);
		successMessage.hide();
		errorMessage.hide();

		fetch(form.action, {
			method: 'POST',
			body: new FormData(form),
			headers: {
				Accept: 'application/json'
			}
		})
			.then(function(response) {
				if (!response.ok) {
					throw new Error('Form submission failed');
				}

				return response.json();
			})
			.then(function() {
				form.reset();
				successMessage.stop(true, true).fadeIn(200);
			})
			.catch(function() {
				errorMessage.stop(true, true).fadeIn(200);
			})
			.finally(function() {
				submitButton.prop('disabled', false);
			});
	});

	// Tooltip settings
	if ($.isFunction($.fn.qtip)) {
		$('.quform-tooltip').qtip({
			content: {
				text: false
			},
			style: {
				classes: 'qtip-default qtip-shadow quform-tt',
				width: '180px'
			},
			position: {
				my: 'left center',
				at: 'right center',
				viewport: $(window),
				adjust: {
					method: 'shift'
				}
			}
		});
	}

	// Changes subject to a text field when 'Other' is chosen
	$('#subject').replaceSelectWithTextInput({onValue: 'Other'});
}); // End document ready

(function ($) {
	$(window).on('load', function () {
		// Preload images
		var images = [
			'quform/images/close.png',
			'quform/images/success.png',
			'quform/images/error.png',
			'quform/images/default-loading.gif'
		];

		// Preload images for any active themes
		if ($('.quform-theme-light-light, .quform-theme-light-rounded').length) {
			images = images.concat([
				'quform/themes/light/images/button-active-bg-rep.png',
				'quform/themes/light/images/close.png',
				'quform/themes/light/images/input-active-bg-rep.png'
			]);
		}

		if ($('.quform-theme-dark-dark, .quform-theme-dark-rounded').length) {
			images = images.concat([
				'quform/themes/dark/images/button-active-bg-rep.png',
				'quform/themes/dark/images/close.png',
				'quform/themes/dark/images/input-active-bg-rep.png',
				'quform/themes/dark/images/loading.gif'
			]);
		}

		if ($('.quform-theme-minimal-light').length) {
			images = images.concat([
				'quform/themes/minimal/images/close-light.png'
			]);
		}

		if ($('.quform-theme-minimal-dark').length) {
			images = images.concat([
				'quform/themes/minimal/images/close-dark.png',
				'quform/themes/minimal/images/loading-dark.gif'
			]);
		}

		$.preloadImages(images);
	});
})(jQuery);