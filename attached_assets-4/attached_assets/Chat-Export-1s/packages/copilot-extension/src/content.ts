/**
 * Clientum Copilot — Content Script
 * Injected into https://web.whatsapp.com/*
 *
 * Injects a "✨ Sugerir" button in the compose toolbar.
 * On click: extracts conversation messages → calls background → gets AI suggestion
 * → copies to clipboard and tries direct DOM insertion → shows toast.
 */
import type { WaMessage, SuggestResponse } from "./types";

const BTN_ID = "clientum-copilot-btn";
const TOAST_ID = "clientum-copilot-toast";

// ------------------------------------------------------------------
// Styles
// ------------------------------------------------------------------
(function injectStyles() {
  if (document.getElementById("clientum-copilot-styles")) return;
  const el = document.createElement("style");
  el.id = "clientum-copilot-styles";
  el.textContent = `
    #${BTN_ID} {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: #25D366;
      color: #fff;
      border: none;
      border-radius: 18px;
      padding: 5px 13px;
      font-size: 13px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: background 0.18s, opacity 0.18s;
      white-space: nowrap;
      flex-shrink: 0;
      align-self: center;
      margin: 0 6px;
      line-height: 1;
      height: 32px;
    }
    #${BTN_ID}:hover { background: #1da851; }
    #${BTN_ID}.loading { opacity: 0.65; cursor: wait; pointer-events: none; }

    #${TOAST_ID} {
      position: fixed;
      bottom: 88px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(17,24,39,0.92);
      color: #fff;
      padding: 9px 18px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 500;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      z-index: 99999;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.25s;
      max-width: 320px;
      text-align: center;
      line-height: 1.4;
    }
    #${TOAST_ID}.show { opacity: 1; }
  `;
  (document.head || document.documentElement).appendChild(el);
})();

// ------------------------------------------------------------------
// Toast
// ------------------------------------------------------------------
let toastTimer: ReturnType<typeof setTimeout> | null = null;

function showToast(text: string, ms = 4000) {
  let el = document.getElementById(TOAST_ID);
  if (!el) {
    el = document.createElement("div");
    el.id = TOAST_ID;
    document.body.appendChild(el);
  }
  el.textContent = text;
  el.classList.add("show");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el?.classList.remove("show"), ms);
}

// ------------------------------------------------------------------
// Phone extraction — try several strategies
// ------------------------------------------------------------------
function extractPhone(): string {
  // Strategy 1: data-id on messages — format <hash>_<phone>@c.us
  const msgs = document.querySelectorAll("[data-id]");
  for (const m of msgs) {
    const id = m.getAttribute("data-id") ?? "";
    const match = id.match(/_(\d{7,15})@c\.us/);
    if (match) return match[1];
  }

  // Strategy 2: URL hash (some WhatsApp Web versions)
  const hashMatch = window.location.href.match(/[/#](\d{7,15})@/);
  if (hashMatch) return hashMatch[1];

  return "";
}

// ------------------------------------------------------------------
// Message extraction from DOM
// ------------------------------------------------------------------
function extractMessages(): WaMessage[] {
  const results: WaMessage[] = [];

  // WhatsApp Web renders messages as rows; look for the text containers
  // They are inside .message-in / .message-out (older) or via data-testid
  const rows = document.querySelectorAll<HTMLElement>(
    "[data-testid='msg-container']"
  );

  rows.forEach((row) => {
    const textEl = row.querySelector<HTMLElement>(
      "[data-testid='msg-text'], .selectable-text span"
    );
    const text = textEl?.innerText?.trim();
    if (!text) return;

    // Outbound messages have a double-check or single-check icon
    const isMe =
      !!row.querySelector("[data-testid='msg-dblcheck'], [data-testid='msg-check'], [data-testid='msg-dblcheckread']") ||
      !!row.closest("[class*='message-out']");

    results.push({ from: isMe ? "me" : "them", text });
  });

  // Fallback: class-based selector (older WhatsApp Web)
  if (results.length === 0) {
    document.querySelectorAll<HTMLElement>(".message-in, .message-out").forEach((el) => {
      const textEl = el.querySelector<HTMLElement>(".selectable-text");
      const text = textEl?.innerText?.trim();
      if (!text) return;
      results.push({ from: el.classList.contains("message-out") ? "me" : "them", text });
    });
  }

  // Cap at last 20 messages to keep the prompt manageable
  return results.slice(-20);
}

// ------------------------------------------------------------------
// Try to inject text into the WhatsApp compose input
// ------------------------------------------------------------------
function tryInjectText(text: string): boolean {
  const input = document.querySelector<HTMLElement>(
    "[contenteditable='true'][data-tab], [data-testid='conversation-compose-box-input']"
  );
  if (!input) return false;

  input.focus();

  // execCommand works in some browsers / WhatsApp Web versions
  try {
    if (document.execCommand("insertText", false, text)) return true;
  } catch { /* ignore */ }

  // Fallback: direct innerHTML manipulation (last resort)
  // This breaks Lexical's internal state but is visible to the user
  try {
    const p = document.createElement("p");
    p.textContent = text;
    input.innerHTML = "";
    input.appendChild(p);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    return true;
  } catch { /* ignore */ }

  return false;
}

// ------------------------------------------------------------------
// Button injection
// ------------------------------------------------------------------
function removeButton() {
  document.getElementById(BTN_ID)?.remove();
}

function injectButton() {
  if (document.getElementById(BTN_ID)) return;

  // Find the compose footer
  const footer = document.querySelector<HTMLElement>("footer");
  if (!footer) return;

  // Find the send / voice button as anchor point
  const sendBtn = footer.querySelector<HTMLElement>(
    "[data-testid='send'], [data-testid='audio-note'], [data-testid='send-button']"
  );
  if (!sendBtn) return;

  const anchor = sendBtn.parentElement;
  if (!anchor) return;

  const btn = document.createElement("button");
  btn.id = BTN_ID;
  btn.textContent = "✨ Sugerir";
  btn.title = "Clientum Copilot — sugerir respuesta con IA";

  btn.addEventListener("click", async () => {
    if (btn.classList.contains("loading")) return;

    const messages = extractMessages();
    if (messages.length === 0) {
      showToast("⚠️ No se encontraron mensajes en la conversación");
      return;
    }

    const phone = extractPhone();

    btn.classList.add("loading");
    btn.textContent = "⏳ Generando...";

    try {
      const res: SuggestResponse = await chrome.runtime.sendMessage({
        type: "COPILOT_SUGGEST",
        payload: { phone, messages },
      });

      if (res?.error) {
        showToast(`❌ ${res.error}`, 6000);
        return;
      }

      if (!res?.suggestion) {
        showToast("⚠️ No se pudo generar una sugerencia. Intentá de nuevo.");
        return;
      }

      // 1. Try to paste directly into compose input
      const injected = tryInjectText(res.suggestion);

      // 2. Always copy to clipboard as fallback
      try {
        await navigator.clipboard.writeText(res.suggestion);
      } catch { /* clipboard may be blocked */ }

      const who = res.contactName ? ` para ${res.contactName}` : "";
      if (injected) {
        showToast(`✅ Sugerencia${who} lista en el cuadro de texto`);
      } else {
        showToast(`✅ Sugerencia${who} copiada al portapapeles — pegá con Ctrl+V`);
      }
    } catch {
      showToast("❌ Error al conectar con Clientum. Verificá la extensión.", 6000);
    } finally {
      btn.classList.remove("loading");
      btn.textContent = "✨ Sugerir";
    }
  });

  // Insert just before the send button
  anchor.insertBefore(btn, sendBtn);
}

// ------------------------------------------------------------------
// Observe DOM changes — WhatsApp Web is a SPA
// ------------------------------------------------------------------
const observer = new MutationObserver(() => {
  const hasFooter = !!document.querySelector("footer [data-testid='send'], footer [data-testid='audio-note']");
  const hasBtn = !!document.getElementById(BTN_ID);

  if (hasFooter && !hasBtn) {
    // Small delay to let WhatsApp finish rendering the footer
    setTimeout(injectButton, 150);
  } else if (!hasFooter && hasBtn) {
    removeButton();
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial attempt
setTimeout(injectButton, 1000);
