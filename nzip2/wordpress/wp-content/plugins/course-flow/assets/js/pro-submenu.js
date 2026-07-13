/* global courseflowProSubmenu */
/**
 * PRO Submenu helper (client-side label synchronization and DOM reordering).
 *
 *
 * This file is safe to load on Course Flow admin pages only.
 *
 * @package CourseFlow
 * @since 2.5.1
 */
(function () {
  'use strict';

  /**
   * Safe helper to query a single element.
   *
   * @param {string} sel CSS selector.
   * @return {Element|null} Element or null.
   */
  function q(sel) {
    try {
      return document.querySelector(sel);
    } catch (e) {
      return null;
    }
  }

  /**
   * Move element 'from' before element 'to' in the DOM if both exist.
   *
   * CRITICAL: Moves PRO menu item above Settings for visual prominence.
   * This is essential for UX - PRO should be the first submenu item.
   *
   * @param {Element} from Element to move.
   * @param {Element} to Element before which 'from' will be inserted.
   * @return {void}
   */
  function moveBefore(from, to) {
    if (!from || !to) {
      return;
    }

    var parent = to.parentNode;
    if (!parent) {
      return;
    }

    // Avoid unnecessary DOM operations if already in correct position.
    if (parent.firstElementChild === from) {
      return;
    }

    // Insert 'from' before 'to'.
    parent.insertBefore(from, to);
  }

  /**
   * Update menu label while preserving star icon prefix.
   *
   * CRITICAL: This function detects if the menu item already has a star icon
   * and preserves it when updating the label text.
   *
   * @param {Element} anchor Menu anchor element.
   * @param {string} newLabel New label text (without icon).
   * @return {void}
   */
  function updateLabelPreservingStar(anchor, newLabel) {
    if (!anchor || !newLabel) {
      return;
    }

    var currentText = (anchor.textContent || '').trim();
    
    // Check if current text starts with star emoji.
    var hasStarIcon = currentText.indexOf('⭐') === 0;
    
    // Check if new label already has star (sent from server).
    var newLabelHasStar = newLabel.indexOf('⭐') === 0;
    
    // Build final label.
    var finalLabel;
    
    if (newLabelHasStar) {
      // New label already has star, use as-is.
      finalLabel = newLabel;
    } else if (hasStarIcon) {
      // Current has star, new label doesn't - preserve star.
      finalLabel = '⭐ ' + newLabel;
    } else {
      // Neither has star - use new label as-is.
      finalLabel = newLabel;
    }
    
    // Only update if different to avoid unnecessary DOM operations.
    if (currentText !== finalLabel) {
      anchor.textContent = finalLabel;
      
      // Log update for debugging.
      if (window.console && console.log) {
        console.log('[CourseFlow PRO Menu] Label updated:', currentText, '→', finalLabel);
      }
    }
  }

  /**
   * Fetch fresh menu label from server and update DOM.
   *
   * CRITICAL FIX v13: New function for dynamic updates.
   * Can be called by React when license status changes.
   *
   * @return {Promise<boolean>} Promise resolving to true on success.
   */
  function updateMenuLabelFromServer() {
    return new Promise(function (resolve, reject) {
      // Check if REST API URL is available.
      if (typeof courseflowProSubmenu === 'undefined' || !courseflowProSubmenu.restUrl) {
        if (window.console && console.error) {
          console.error('[CourseFlow PRO Menu] REST URL not available');
        }
        reject(new Error('REST URL not available'));
        return;
      }

      var restUrl = courseflowProSubmenu.restUrl + '/pro-menu-label';
      var nonce = courseflowProSubmenu.nonce || '';

      // Fetch fresh label from server.
      fetch(restUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonce
        },
        credentials: 'same-origin'
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          if (data && data.success && data.label) {
            // Find PRO menu anchor.
            var proAnchorSel = '#adminmenu .wp-submenu a[href*="page=courseflow-pro-upgrade"]';
            var proAnchor = q(proAnchorSel);

            if (proAnchor) {
              // Update label preserving star icon.
              updateLabelPreservingStar(proAnchor, data.label);
              
              if (window.console && console.log) {
                console.log('[CourseFlow PRO Menu] Successfully updated to:', data.label);
              }
              
              resolve(true);
            } else {
              if (window.console && console.warn) {
                console.warn('[CourseFlow PRO Menu] PRO menu anchor not found');
              }
              reject(new Error('PRO menu anchor not found'));
            }
          } else {
            if (window.console && console.error) {
              console.error('[CourseFlow PRO Menu] Invalid server response:', data);
            }
            reject(new Error('Invalid server response'));
          }
        })
        .catch(function (error) {
          if (window.console && console.error) {
            console.error('[CourseFlow PRO Menu] Failed to fetch label:', error);
          }
          reject(error);
        });
    });
  }

  /**
   * Initialize menu helper on page load.
   *
   * @return {void}
   */
  function init() {
    try {
      // Check if configuration object exists.
      if (typeof courseflowProSubmenu === 'undefined') {
        return;
      }

      // Selectors for submenu anchors.
      var proAnchorSel = '#adminmenu .wp-submenu a[href*="page=courseflow-pro-upgrade"]';
      var settingsAnchorSel = '#adminmenu .wp-submenu a[href*="page=courseflow-settings"]';
      
      var proAnchor = q(proAnchorSel);
      var settingsAnchor = q(settingsAnchorSel);

      if (!proAnchor) {
        // PRO menu item not found, nothing to do.
        return;
      }

      // STEP 1: Update label if provided by server (preserving star icon).
      var expectedLabel = String(courseflowProSubmenu.label || '').trim();
      if (expectedLabel) {
        updateLabelPreservingStar(proAnchor, expectedLabel);
      }

      // STEP 2: Move PRO menu item ABOVE Settings for visual prominence.
      // CRITICAL: This is essential for UX - PRO should be the FIRST submenu item.
      if (settingsAnchor) {
        // Get parent <li> elements.
        var proLi = proAnchor.closest('li');
        var settingsLi = settingsAnchor.closest('li');
        
        // Only move if both exist and share the same parent (submenu UL).
        if (proLi && settingsLi && proLi.parentNode === settingsLi.parentNode) {
          // Move PRO before Settings.
          moveBefore(proLi, settingsLi);
        } else if (proLi && settingsLi && proLi.parentNode !== settingsLi.parentNode) {
          // Fallback for unusual DOM structure.
          var submenuContainer = settingsLi.parentNode;
          if (submenuContainer) {
            try {
              submenuContainer.insertBefore(proLi, settingsLi);
            } catch (e) {
              // Silent failure - UI enhancement is best-effort.
            }
          }
        }
      }

      // STEP 3: Expose global function for React to call.
      // CRITICAL FIX v13: Allow React to trigger label updates.
      window.courseflowUpdateProMenuLabel = updateMenuLabelFromServer;

      if (window.console && console.log) {
        console.log('[CourseFlow PRO Menu] Helper initialized, update function exposed');
      }

    } catch (e) {
      // Fail silently; UI enhancement is best-effort and must not break admin.
      if (window.console && console.error) {
        console.error('[CourseFlow PRO Menu] Initialization error:', e);
      }
    }
  }

  // Initialize when DOM is ready.
  document.addEventListener('DOMContentLoaded', init);
}());
