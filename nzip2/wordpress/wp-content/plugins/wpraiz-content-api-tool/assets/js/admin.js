/**
 * WPRaiz Content API Tool — Admin JS
 * v2.0.0
 */
(function ($) {
    'use strict';

    /* ── Tab Navigation ── */
    function initTabs() {
        var $tabs   = $('.wpraiz-tab');
        var $panels = $('.wpraiz-panel');

        // Read hash from URL
        var hash = window.location.hash.replace('#', '');
        if (hash && $tabs.filter('[data-tab="' + hash + '"]').length) {
            switchTab(hash);
        }

        $tabs.on('click', function (e) {
            e.preventDefault();
            var tab = $(this).data('tab');
            switchTab(tab);
            history.replaceState(null, '', '#' + tab);
        });

        function switchTab(tab) {
            $tabs.removeClass('active');
            $tabs.filter('[data-tab="' + tab + '"]').addClass('active');
            $panels.hide();
            $('#panel-' + tab).show();
        }
    }

    /* ── Copy to Clipboard ── */
    function initCopyButtons() {
        $(document).on('click', '.wpraiz-copy-btn', function (e) {
            e.preventDefault();
            var $btn = $(this);
            var url  = $btn.data('url');

            if (!url) return; // onclick handler handles it

            copyToClipboard(url).then(function () {
                showCopied($btn);
            });
        });
    }

    function copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text);
        }
        // Fallback
        var $temp = $('<textarea>').val(text).appendTo('body').select();
        document.execCommand('copy');
        $temp.remove();
        return Promise.resolve();
    }

    window.wpraizCopyText = function (text) {
        copyToClipboard(text).then(function () {
            showToast('Copied to clipboard!');
        });
    };

    function showCopied($btn) {
        var original = $btn.text();
        $btn.text('Copied!').addClass('copied');
        setTimeout(function () {
            $btn.text(original).removeClass('copied');
        }, 1500);
    }

    /* ── Toast ── */
    var $toast;
    function showToast(message) {
        if (!$toast) {
            $toast = $('<div class="wpraiz-toast"></div>').appendTo('body');
        }
        $toast.text(message).addClass('show');
        setTimeout(function () {
            $toast.removeClass('show');
        }, 2000);
    }

    /* ── Settings Form ── */
    function initSettings() {
        $('#wpraiz-settings-form').on('submit', function (e) {
            e.preventDefault();

            var $form   = $(this);
            var $status = $('#wpraiz-save-status');
            var $btn    = $form.find('button[type="submit"]');

            $btn.prop('disabled', true).text('Saving...');
            $status.text('').removeClass('success error');

            var data = $form.serializeArray();
            data.push({ name: 'action', value: 'wpraiz_save_settings' });
            data.push({ name: 'nonce', value: wpraizAdmin.nonce });

            $.post(wpraizAdmin.ajaxUrl, data, function (response) {
                $btn.prop('disabled', false).text('Save Settings');

                if (response.success) {
                    $status.text(response.data.message).addClass('success');
                    showToast('Settings saved!');
                } else {
                    $status.text(response.data.message || 'Error saving.').addClass('error');
                }

                setTimeout(function () {
                    $status.css('opacity', 0);
                    setTimeout(function () {
                        $status.text('').css('opacity', 1).removeClass('success error');
                    }, 300);
                }, 3000);
            }).fail(function () {
                $btn.prop('disabled', false).text('Save Settings');
                $status.text('Network error.').addClass('error');
            });
        });
    }

    /* ── License ── */
    function initLicense() {
        $('#wpraiz-activate-license').on('click', function () {
            var $btn    = $(this);
            var license = $('#wpraiz-license-input').val().trim();

            if (!license) {
                showToast('Enter a license key.');
                return;
            }

            $btn.prop('disabled', true).text('Activating...');

            $.post(wpraizAdmin.ajaxUrl, {
                action:  'wpraiz_activate_license',
                nonce:   wpraizAdmin.nonce,
                license: license
            }, function (response) {
                $btn.prop('disabled', false).text('Activate');

                if (response.success) {
                    showToast('License activated!');
                    location.reload();
                } else {
                    showToast(response.data.message || 'Activation failed.');
                }
            }).fail(function () {
                $btn.prop('disabled', false).text('Activate');
                showToast('Network error.');
            });
        });

        $('#wpraiz-deactivate-license').on('click', function () {
            if (!confirm('Deactivate your Pro license?')) return;

            var $btn = $(this);
            $btn.prop('disabled', true).text('Deactivating...');

            $.post(wpraizAdmin.ajaxUrl, {
                action: 'wpraiz_deactivate_license',
                nonce:  wpraizAdmin.nonce
            }, function (response) {
                $btn.prop('disabled', false).text('Deactivate');

                if (response.success) {
                    showToast('License deactivated.');
                    location.reload();
                } else {
                    showToast(response.data.message || 'Error.');
                }
            }).fail(function () {
                $btn.prop('disabled', false).text('Deactivate');
                showToast('Network error.');
            });
        });
    }

    /* ── Init ── */
    $(document).ready(function () {
        initTabs();
        initCopyButtons();
        initSettings();
        initLicense();
    });

})(jQuery);
