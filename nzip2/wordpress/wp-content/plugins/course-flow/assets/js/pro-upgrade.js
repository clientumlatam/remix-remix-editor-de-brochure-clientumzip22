/* global courseflowProUpgrade */
/* eslint-env browser */
/* eslint no-unused-vars: "off" */

'use strict'

/**
 * Course Flow PRO - pro-upgrade.js (instrumented with debug pings).
 *
 * Sends debug pings to WP admin-ajax to record client events into debug.log.
 */

/* Utility: send debug ping to server (admin-ajax) */
async function sendDebugPing (message, meta) {
  if (!courseflowProUpgrade || !courseflowProUpgrade.ajaxUrl || !courseflowProUpgrade.ajaxNonce) {
    // Can't send ping
    return
  }
  try {
    var form = new FormData()
    form.append('action', 'courseflow_pro_debug_ping')
    form.append('nonce', courseflowProUpgrade.ajaxNonce)
    form.append('message', message)
    if (meta) form.append('meta', JSON.stringify(meta))

    await fetch(courseflowProUpgrade.ajaxUrl, {
      method: 'POST',
      body: form,
      credentials: 'same-origin'
    })
  } catch (e) {
    // ignore errors - debug ping best-effort
  }
}

/* Ensure overlay */
function ensureOverlay () {
  var id = 'cfpro-activating-overlay'
  var overlay = document.getElementById(id)
  if (overlay) return overlay

  overlay = document.createElement('div')
  overlay.id = id
  overlay.style.position = 'fixed'
  overlay.style.left = '0'
  overlay.style.top = '0'
  overlay.style.width = '100%'
  overlay.style.height = '100%'
  overlay.style.background = 'rgba(0,0,0,0.45)'
  overlay.style.zIndex = '99999'
  overlay.style.display = 'flex'
  overlay.style.alignItems = 'center'
  overlay.style.justifyContent = 'center'

  var panel = document.createElement('div')
  panel.style.background = '#fff'
  panel.style.padding = '18px 22px'
  panel.style.borderRadius = '8px'
  panel.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)'
  panel.style.maxWidth = '520px'
  panel.style.width = '90%'
  panel.style.textAlign = 'center'
  panel.style.fontSize = '15px'
  panel.style.color = '#111'

  var spinner = document.createElement('div')
  spinner.style.width = '36px'
  spinner.style.height = '36px'
  spinner.style.margin = '0 auto 12px'
  spinner.style.border = '4px solid #eee'
  spinner.style.borderTop = '4px solid #2271b1'
  spinner.style.borderRadius = '50%'
  spinner.style.animation = 'cfpro-spin 1s linear infinite'

  var style = document.createElement('style')
  style.type = 'text/css'
  style.textContent = '@keyframes cfpro-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }'
  document.head.appendChild(style)

  var msg = document.createElement('div')
  msg.id = 'cfpro-activating-message'
  msg.textContent = 'Processing payment and activating license...'

  panel.appendChild(spinner)
  panel.appendChild(msg)
  overlay.appendChild(panel)
  document.body.appendChild(overlay)

  return overlay
}

/* Show overlay and send debug ping */
function showOverlay (message) {
  var overlay = ensureOverlay()
  var msg = document.getElementById('cfpro-activating-message')
  if (msg && message) msg.textContent = message
  overlay.style.display = 'flex'
  sendDebugPing('overlay_shown', { message: message || '' })
}

/* Hide overlay */
function hideOverlay () {
  var overlay = document.getElementById('cfpro-activating-overlay')
  if (!overlay) return
  overlay.style.display = 'none'
  sendDebugPing('overlay_hidden')
}

/* Show notice (simple) */
function ensureNoticeBox () {
  var box = document.getElementById('courseflow-pro-notice')
  if (box) return box
  var wrap = document.querySelector('.wrap') || document.body
  box = document.createElement('div')
  box.id = 'courseflow-pro-notice'
  box.className = 'notice'
  box.style.display = 'none'
  box.style.marginBottom = '12px'
  var p = document.createElement('p')
  box.appendChild(p)
  if (wrap.firstChild) {
    wrap.insertBefore(box, wrap.firstChild)
  } else {
    wrap.appendChild(box)
  }
  return box
}

function showNotice (type, message) {
  var box = ensureNoticeBox()
  if (!box) return
  box.className = 'notice notice-' + String(type)
  box.style.display = 'block'
  var p = box.querySelector('p')
  if (p) p.textContent = String(message)
}

/* Busy helper */
function setBusy (btn, busy) {
  if (!btn) return
  btn.disabled = busy
  btn.setAttribute('aria-busy', busy ? 'true' : 'false')
}

/* Start checkout REST call */
async function startCheckout () {
  var btn = document.getElementById('courseflow-pro-upgrade-btn')
  setBusy(btn, true)

  try {
    if (!courseflowProUpgrade || !courseflowProUpgrade.restUrl || !courseflowProUpgrade.nonce) {
      showNotice('error', 'Configuration error: missing REST URL or nonce.')
      sendDebugPing('startCheckout_error', { reason: 'missing_config' })
      return
    }

    var res = await fetch(courseflowProUpgrade.restUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': courseflowProUpgrade.nonce
      },
      body: JSON.stringify({}),
      credentials: 'same-origin'
    })

    var text = await res.text()
    var data = null
    try { data = JSON.parse(text) } catch (e) { data = null }

    if (!res.ok || !data || !data.success) {
      showNotice('error', (data && data.message) ? data.message : ('Checkout failed (HTTP ' + res.status + ').'))
      sendDebugPing('startCheckout_error', { http: res.status, message: (data && data.message) ? data.message : '' })
      return
    }

    if (data.sessionUrl) {
      try {
        var flag = { started: Date.now(), ttl: 1000 * 60 * 60 }
        localStorage.setItem('cfpro_checkout_in_progress', JSON.stringify(flag))
      } catch (e) {
        // ignore
      }
      sendDebugPing('startCheckout_redirect', { sessionUrl: data.sessionUrl })
      window.location.href = data.sessionUrl
      return
    }

    showNotice('error', 'Vendor did not return sessionUrl.')
    sendDebugPing('startCheckout_error', { reason: 'no_session_url' })
  } catch (err) {
    showNotice('error', 'Unexpected error: ' + (err && err.message ? err.message : 'Unknown'))
    sendDebugPing('startCheckout_exception', { message: (err && err.message) ? err.message : '' })
  } finally {
    setBusy(btn, false)
  }
}

/* Aggressive, multi-stage polling with debug pings */
async function pollStatusUntilActive () {
  if (!courseflowProUpgrade || !courseflowProUpgrade.ajaxUrl || !courseflowProUpgrade.ajaxNonce) {
    sendDebugPing('poll_error', { reason: 'missing_ajax_config' })
    return
  }
  var ajaxUrl = courseflowProUpgrade.ajaxUrl
  var ajaxNonce = courseflowProUpgrade.ajaxNonce
  var action = courseflowProUpgrade.pollAction || 'courseflow_pro_poll_status'

  // immediate overlay
  showOverlay('Processing payment and activating license...')

  // sequences: fast -> medium -> slow
  var sequences = [
    { interval: 300, tries: 6 },
    { interval: 1500, tries: 6 },
    { interval: 3000, tries: 4 }
  ]

  sendDebugPing('poll_start', { sequences: sequences })

  var attempt = 0

  for (var s = 0; s < sequences.length; s++) {
    var cfg = sequences[s]
    for (var i = 0; i < cfg.tries; i++) {
      attempt++
      sendDebugPing('poll_attempt', { attempt: attempt, seq: s + 1, seq_try: i + 1 })

      try {
        var form = new FormData()
        form.append('action', action)
        form.append('nonce', ajaxNonce)

        var response = await fetch(ajaxUrl, {
          method: 'POST',
          body: form,
          credentials: 'same-origin'
        })

        var json = null
        try { json = await response.json() } catch (e) { json = null }

        if (response.ok && json && json.success && json.data) {
          var st = json.data
          if (st.active) {
            sendDebugPing('poll_success', { attempt: attempt })
            try { localStorage.removeItem('cfpro_checkout_in_progress') } catch (e) {}
            showNotice('success', 'License is now active. Updating UI...')
            setTimeout(function () { window.location.reload() }, 700)
            return
          } else {
            // update overlay message
            var om = document.getElementById('cfpro-activating-message')
            if (om) om.textContent = (st.message ? st.message : 'Purchase not completed yet.') + ' (Checking... attempt ' + attempt + ')'
          }
        } else {
          sendDebugPing('poll_response_error', { attempt: attempt, http: response.status, server: json })
        }
      } catch (err) {
        sendDebugPing('poll_exception', { attempt: attempt, message: (err && err.message) ? err.message : '' })
      }

      // wait for interval
      if (!(s === sequences.length - 1 && i === cfg.tries - 1)) {
        await new Promise(function (resolve) { setTimeout(resolve, cfg.interval) })
      }
    }
  }

  // exhausted
  hideOverlay()
  sendDebugPing('poll_exhausted', { attempts: attempt })
  showNotice('error', 'License not active after checking. Please click "Refresh status" in a moment.')
  try { localStorage.removeItem('cfpro_checkout_in_progress') } catch (e) {}
}

/* Decide whether to start polling on load */
function maybeStartPollingOnLoad () {
  try {
    if (courseflowProUpgrade && courseflowProUpgrade.pending) {
      sendDebugPing('start_on_load', { source: 'server_pending' })
      pollStatusUntilActive()
      return
    }

    var raw = localStorage.getItem('cfpro_checkout_in_progress')
    if (!raw) return
    var flag = JSON.parse(raw)
    if (!flag || !flag.started) { localStorage.removeItem('cfpro_checkout_in_progress'); return }
    var age = Date.now() - Number(flag.started)
    if (age >= 0 && age < (flag.ttl || 1000 * 60 * 60)) {
      sendDebugPing('start_on_load', { source: 'local_storage', age: age })
      pollStatusUntilActive()
    } else {
      localStorage.removeItem('cfpro_checkout_in_progress')
    }
  } catch (e) {
    // ignore
  }
}

/* DOM ready */
document.addEventListener('DOMContentLoaded', function () {
  sendDebugPing('js_loaded', { pending: (courseflowProUpgrade && courseflowProUpgrade.pending) ? 1 : 0 })

  var btn = document.getElementById('courseflow-pro-upgrade-btn')
  if (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault()
      startCheckout()
    })
  }

  maybeStartPollingOnLoad()
})
