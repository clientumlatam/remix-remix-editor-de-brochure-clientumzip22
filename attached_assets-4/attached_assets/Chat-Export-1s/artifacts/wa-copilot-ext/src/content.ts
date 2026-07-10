/**
 * Content Script — Clientum Copilot
 * Injected into https://web.whatsapp.com/*
 *
 * Responsibilities:
 * 1. MutationObserver — detect active chat changes
 * 2. Extract phone number from active chat
 * 3. Extract last N messages from visible bubbles
 * 4. Inject floating Copilot panel into WhatsApp's footer
 * 5. Request AI suggestions via background service worker
 * 6. Insert suggestion via CDP (fallback: keyboard simulation)
 * 7. Bot toggle button
 * 8. Debt alert banner
 */

import type { SuggestResponse, DebtAlert } from "./types";

// ── Constants ──────────────────────────────────────────────────────────────

const PANEL_ID = "clm-copilot-panel";
const DEBT_BANNER_ID = "clm-debt-banner";
const MAX_MESSAGES = 15;
const WHATSAPP_TEAL = "#00a884";

const SEL = {
  // Chat list pane
  chatList: "#pane-side",
  // Active chat header — phone JID is on the list item [data-id]
  chatListActiveRow: '#pane-side [aria-selected="true"]',
  // Alternative: conversation header
  convHeader: '[data-testid="conversation-header"]',
  // Input box (Lexical/contenteditable)
  input: '[data-testid="conversation-compose-box-input"]',
  // Footer bar
  footer: 'footer[data-testid="conversation-compose-box"]',
  // Message bubbles
  msgIn: '.message-in [data-testid="msg-container"]',
  msgOut: '.message-out [data-testid="msg-container"]',
  // Text within bubbles
  msgText: "span.selectable-text > span",
  // Main chat pane
  main: "#main",
};

// ── State ──────────────────────────────────────────────────────────────────

let currentPhone = "";
let botPaused = false;
let panelVisible = false;
let lastSuggestion = "";
let currentDebtAlert: DebtAlert | null = null;

// ── CSS ────────────────────────────────────────────────────────────────────

const CSS = `
  #${PANEL_ID} {
    all: initial;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    position: relative;
    background: #1a2433;
    border-top: 1px solid #2a3a4a;
    padding: 10px 14px;
    z-index: 100;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  #${PANEL_ID} * { box-sizing: border-box; }
  .clm-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .clm-label {
    font-size: 11px;
    font-weight: 700;
    color: #64b5f6;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    white-space: nowrap;
  }
  .clm-contact {
    font-size: 11px;
    color: #90a4ae;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .clm-select {
    background: #243447;
    border: 1px solid #37474f;
    border-radius: 6px;
    color: #cfd8dc;
    font-size: 12px;
    padding: 4px 8px;
    cursor: pointer;
    outline: none;
  }
  .clm-btn {
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    padding: 6px 12px;
    transition: opacity 0.15s, transform 0.1s;
    white-space: nowrap;
  }
  .clm-btn:hover { opacity: 0.85; transform: translateY(-1px); }
  .clm-btn:active { transform: translateY(0); }
  .clm-btn:disabled { opacity: 0.45; cursor: default; transform: none; }
  .clm-btn-suggest {
    background: linear-gradient(135deg, #1565c0, #6a1b9a);
    color: #fff;
  }
  .clm-btn-insert {
    background: ${WHATSAPP_TEAL};
    color: #fff;
    display: none;
  }
  .clm-btn-bot-on {
    background: #1b5e20;
    color: #a5d6a7;
    font-size: 11px;
    padding: 4px 10px;
  }
  .clm-btn-bot-off {
    background: #b71c1c;
    color: #ef9a9a;
    font-size: 11px;
    padding: 4px 10px;
  }
  .clm-suggestion-box {
    background: #243447;
    border: 1px solid #37474f;
    border-radius: 8px;
    color: #eceff1;
    font-size: 13px;
    line-height: 1.5;
    max-height: 80px;
    overflow-y: auto;
    padding: 8px 10px;
    display: none;
    cursor: text;
    user-select: text;
  }
  .clm-suggestion-box.active { display: block; }
  .clm-spinner {
    display: none;
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.2);
    border-top-color: #fff;
    border-radius: 50%;
    animation: clm-spin 0.7s linear infinite;
  }
  .clm-spinner.active { display: inline-block; }
  @keyframes clm-spin { to { transform: rotate(360deg); } }
  .clm-status-dot {
    width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
  }
  .clm-status-dot.on { background: #4caf50; }
  .clm-status-dot.off { background: #f44336; }

  /* Debt Alert Banner */
  #${DEBT_BANNER_ID} {
    all: initial;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    position: relative;
    background: linear-gradient(135deg, #7b1fa2, #880e4f);
    border-bottom: 1px solid rgba(255,255,255,0.1);
    padding: 8px 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 99;
  }
  #${DEBT_BANNER_ID} * { box-sizing: border-box; }
  .clm-debt-icon { font-size: 18px; flex-shrink: 0; }
  .clm-debt-text { flex: 1; }
  .clm-debt-title {
    font-size: 12px; font-weight: 700; color: #fff;
  }
  .clm-debt-sub {
    font-size: 11px; color: rgba(255,255,255,0.75); margin-top: 1px;
  }
  .clm-debt-btn {
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.3);
    border-radius: 6px;
    color: #fff;
    cursor: pointer;
    font-size: 11px;
    font-weight: 600;
    padding: 5px 10px;
    white-space: nowrap;
    transition: background 0.15s;
  }
  .clm-debt-btn:hover { background: rgba(255,255,255,0.25); }
`;

// ── Utilities ──────────────────────────────────────────────────────────────

function injectCSS() {
  if (document.getElementById("clm-styles")) return;
  const style = document.createElement("style");
  style.id = "clm-styles";
  style.textContent = CSS;
  document.head.appendChild(style);
}

function sendToBackground<T>(msg: any): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(msg, (resp) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      if (resp?.type === "ERROR") {
        reject(new Error(resp.error));
        return;
      }
      resolve(resp);
    });
  });
}

function digitsOnly(s: string) {
  return s.replace(/\D/g, "");
}

/** Extract phone from WhatsApp JID (e.g., "5491112345678@c.us" → "5491112345678") */
function jidToPhone(jid: string): string {
  return jid.split("@")[0] ?? jid;
}

/** Try to find the active chat's phone/JID from the DOM. */
function getActivePhone(): string {
  // Method 1: Selected list item with data-id attribute
  const selectedRow = document.querySelector(SEL.chatListActiveRow);
  if (selectedRow) {
    const dataId = selectedRow.getAttribute("data-id");
    if (dataId && dataId.includes("@c.us")) {
      return jidToPhone(dataId);
    }
  }

  // Method 2: Scan chat list items for the selected/active one
  const listItems = document.querySelectorAll(`${SEL.chatList} [role="row"]`);
  for (const item of listItems) {
    if (item.getAttribute("aria-selected") === "true") {
      const id = item.getAttribute("data-id") ?? "";
      if (id.includes("@c.us")) return jidToPhone(id);
    }
  }

  // Method 3: Try to extract from contact info in header aria label
  const header = document.querySelector(SEL.convHeader);
  if (header) {
    const spans = header.querySelectorAll("span[title]");
    for (const span of spans) {
      const title = span.getAttribute("title") ?? "";
      const digits = digitsOnly(title);
      if (digits.length >= 10) return digits;
    }
  }

  return "";
}

/** Extract last N messages from the visible chat. */
function extractMessages(): { from: "me" | "them"; text: string }[] {
  const results: { from: "me" | "them"; text: string }[] = [];

  const allBubbles = document.querySelectorAll(
    `${SEL.main} .message-in, ${SEL.main} .message-out`
  );

  for (const bubble of allBubbles) {
    const isMe = bubble.classList.contains("message-out");

    // Find the text span within the bubble
    const textEl =
      bubble.querySelector('span[data-testid="msg-container"] span.selectable-text > span') ??
      bubble.querySelector("span.selectable-text > span") ??
      bubble.querySelector('span[class*="copyable-text"] > span');

    const text = textEl?.textContent?.trim();
    if (text && text.length > 0 && text.length < 4000) {
      results.push({ from: isMe ? "me" : "them", text });
    }
  }

  // Return last MAX_MESSAGES only
  return results.slice(-MAX_MESSAGES);
}

// ── Panel Build ────────────────────────────────────────────────────────────

function buildPanel(): HTMLElement {
  const panel = document.createElement("div");
  panel.id = PANEL_ID;

  panel.innerHTML = `
    <div class="clm-row">
      <span class="clm-label">✨ Copilot</span>
      <span class="clm-contact" id="clm-contact-name">—</span>
      <div class="clm-spinner" id="clm-spinner"></div>
      <div class="clm-status-dot" id="clm-bot-dot"></div>
      <button class="clm-btn clm-btn-bot-on" id="clm-btn-bot" title="Estado del bot automático"></button>
      <select class="clm-select" id="clm-tone">
        <option value="amigable">😊 Amigable</option>
        <option value="formal">🎩 Formal</option>
        <option value="persuasivo">💼 Persuasivo</option>
        <option value="directo">⚡ Directo</option>
      </select>
      <button class="clm-btn clm-btn-suggest" id="clm-btn-suggest">Sugerir respuesta</button>
    </div>
    <div class="clm-suggestion-box" id="clm-suggestion-box"></div>
    <div class="clm-row" id="clm-action-row" style="display:none;">
      <button class="clm-btn clm-btn-insert" id="clm-btn-insert" style="display:inline-flex;align-items:center;gap:6px;">
        ↑ Insertar en chat
      </button>
      <button class="clm-btn" style="background:#243447;color:#90a4ae;font-size:11px;padding:5px 10px;" id="clm-btn-clear">✕ Limpiar</button>
    </div>
  `;

  return panel;
}

function buildDebtBanner(debt: DebtAlert, contactName: string): HTMLElement {
  const banner = document.createElement("div");
  banner.id = DEBT_BANNER_ID;

  const amountStr = debt.amount.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  });

  banner.innerHTML = `
    <span class="clm-debt-icon">⚠️</span>
    <div class="clm-debt-text">
      <div class="clm-debt-title">Deuda pendiente: ${amountStr}</div>
      <div class="clm-debt-sub">${contactName} — ${debt.invoiceCount} comprobante${debt.invoiceCount !== 1 ? "s" : ""} sin cobrar</div>
    </div>
    <button class="clm-debt-btn" id="clm-debt-msg-btn" title="Copiar mensaje de cobro">💬 Mensaje de cobro</button>
    <button class="clm-debt-btn" id="clm-debt-mp-btn" title="Ir a MercadoPago Cobrar">💳 Cobrar por MP</button>
  `;

  return banner;
}

// ── Panel Logic ────────────────────────────────────────────────────────────

function getPanel(): HTMLElement | null {
  return document.getElementById(PANEL_ID);
}

function setContactName(name: string | null) {
  const el = document.getElementById("clm-contact-name");
  if (el) el.textContent = name ? `📇 ${name}` : currentPhone ? `📱 +${currentPhone}` : "—";
}

function setLoading(loading: boolean) {
  const spinner = document.getElementById("clm-spinner");
  const btn = document.getElementById("clm-btn-suggest") as HTMLButtonElement | null;
  if (spinner) spinner.className = `clm-spinner${loading ? " active" : ""}`;
  if (btn) btn.disabled = loading;
}

function setSuggestion(text: string) {
  const box = document.getElementById("clm-suggestion-box");
  const actionRow = document.getElementById("clm-action-row");
  const insertBtn = document.getElementById("clm-btn-insert") as HTMLButtonElement | null;

  lastSuggestion = text;

  if (!box || !actionRow || !insertBtn) return;

  if (text) {
    box.textContent = text;
    box.className = "clm-suggestion-box active";
    actionRow.style.display = "flex";
    insertBtn.style.display = "inline-flex";
  } else {
    box.className = "clm-suggestion-box";
    actionRow.style.display = "none";
  }
}

function updateBotButton() {
  const btn = document.getElementById("clm-btn-bot");
  const dot = document.getElementById("clm-bot-dot");

  if (!btn || !dot) return;

  if (botPaused) {
    btn.textContent = "🤖 Bot pausado";
    btn.className = "clm-btn clm-btn-bot-off";
    dot.className = "clm-status-dot off";
    btn.title = "El bot automático está pausado. Hacé clic para reactivarlo.";
  } else {
    btn.textContent = "🤖 Bot activo";
    btn.className = "clm-btn clm-btn-bot-on";
    dot.className = "clm-status-dot on";
    btn.title = "El bot automático está activo. Hacé clic para pausarlo.";
  }
}

async function refreshBotStatus() {
  if (!currentPhone) return;
  try {
    const resp = await sendToBackground<{ type: string; data: any }>({
      type: "GET_STATUS",
      payload: { phone: currentPhone },
    });
    if (resp.type === "STATUS_OK") {
      botPaused = resp.data.botPaused;
      updateBotButton();
    }
  } catch {
    // silently ignore
  }
}

function showDebtBanner(debt: DebtAlert, contactName: string) {
  // Remove old banner
  document.getElementById(DEBT_BANNER_ID)?.remove();

  const main = document.querySelector(SEL.main);
  if (!main) return;

  const banner = buildDebtBanner(debt, contactName);

  // Insert banner at the top of the main chat area
  main.insertBefore(banner, main.firstChild);

  banner.querySelector("#clm-debt-msg-btn")?.addEventListener("click", () => {
    navigator.clipboard.writeText(debt.suggestedMessage).catch(() => {});
    const btn = banner.querySelector("#clm-debt-msg-btn") as HTMLButtonElement;
    btn.textContent = "✓ Copiado";
    setTimeout(() => { btn.textContent = "💬 Mensaje de cobro"; }, 2000);
  });

  banner.querySelector("#clm-debt-mp-btn")?.addEventListener("click", () => {
    window.open("https://www.mercadopago.com.ar/herramientas/cobrar", "_blank");
  });
}

function clearDebtBanner() {
  document.getElementById(DEBT_BANNER_ID)?.remove();
  currentDebtAlert = null;
}

// ── Insert Text ────────────────────────────────────────────────────────────

async function insertText(text: string): Promise<void> {
  const inputEl = document.querySelector<HTMLElement>(SEL.input);
  if (!inputEl) return;

  inputEl.focus();

  // Method 1: CDP via background
  try {
    const tabs = await new Promise<chrome.tabs.Tab[]>((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, resolve);
    });
    const tabId = tabs[0]?.id;
    if (tabId) {
      await sendToBackground({ type: "INSERT_TEXT", payload: { text, tabId } });
      return;
    }
  } catch {
    // Fall through to keyboard simulation
  }

  // Method 2: execCommand (may or may not work depending on React version)
  if (document.execCommand) {
    try {
      document.execCommand("insertText", false, text);
      // Trigger React input event
      inputEl.dispatchEvent(new InputEvent("input", { bubbles: true, cancelable: true, inputType: "insertText", data: text }));
      return;
    } catch {
      // Fall through
    }
  }

  // Method 3: Direct DOM + events fallback
  const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLElement.prototype, "innerText")?.set;
  if (nativeSetter) {
    nativeSetter.call(inputEl, text);
  } else {
    inputEl.innerText = text;
  }

  const events = ["keydown", "keypress", "input", "keyup", "change"];
  for (const evtType of events) {
    inputEl.dispatchEvent(new Event(evtType, { bubbles: true }));
  }
}

// ── Suggestion Flow ────────────────────────────────────────────────────────

async function handleSuggest() {
  const messages = extractMessages();

  if (messages.length === 0) {
    setSuggestion("No encontré mensajes en la conversación activa.");
    return;
  }

  const tone = (document.getElementById("clm-tone") as HTMLSelectElement | null)?.value as any ?? "amigable";

  setLoading(true);

  try {
    const resp = await sendToBackground<{ type: string; data: SuggestResponse }>({
      type: "SUGGEST",
      payload: { phone: currentPhone, messages, tone },
    });

    if (resp.type === "SUGGEST_OK") {
      const { suggestion, contactName, handoffActive, debtAlert } = resp.data;
      setSuggestion(suggestion || "(La IA no generó una respuesta.)");
      setContactName(contactName);

      // Update bot state from suggest response
      botPaused = handoffActive;
      updateBotButton();

      // Debt alert
      clearDebtBanner();
      if (debtAlert && debtAlert.amount > 0) {
        currentDebtAlert = debtAlert;
        showDebtBanner(debtAlert, contactName ?? currentPhone);
      }
    } else {
      setSuggestion(`Error: ${(resp as any).error ?? "Respuesta inesperada"}`);
    }
  } catch (err: any) {
    setSuggestion(`Error: ${err?.message ?? "No se pudo conectar con Clientum."}`);
  } finally {
    setLoading(false);
  }
}

// ── Panel Injection ────────────────────────────────────────────────────────

function injectPanel() {
  if (document.getElementById(PANEL_ID)) return;

  const footer = document.querySelector(SEL.footer);
  if (!footer || !footer.parentElement) return;

  injectCSS();
  const panel = buildPanel();

  // Insert the panel just before the footer
  footer.parentElement.insertBefore(panel, footer);
  panelVisible = true;

  // Wire up buttons
  document.getElementById("clm-btn-suggest")?.addEventListener("click", handleSuggest);

  document.getElementById("clm-btn-insert")?.addEventListener("click", async () => {
    if (!lastSuggestion) return;
    const btn = document.getElementById("clm-btn-insert") as HTMLButtonElement;
    btn.disabled = true;
    btn.textContent = "Insertando...";
    try {
      await insertText(lastSuggestion);
      btn.textContent = "✓ Insertado";
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = "↑ Insertar en chat";
      }, 1500);
    } catch {
      btn.disabled = false;
      btn.textContent = "↑ Insertar en chat";
    }
  });

  document.getElementById("clm-btn-clear")?.addEventListener("click", () => {
    setSuggestion("");
    clearDebtBanner();
  });

  document.getElementById("clm-btn-bot")?.addEventListener("click", async () => {
    if (!currentPhone) return;
    const newPaused = !botPaused;
    const btn = document.getElementById("clm-btn-bot") as HTMLButtonElement;
    btn.disabled = true;
    try {
      await sendToBackground({
        type: "TOGGLE_BOT",
        payload: { phone: currentPhone, paused: newPaused },
      });
      botPaused = newPaused;
      updateBotButton();
    } catch {
      // silently ignore
    } finally {
      btn.disabled = false;
    }
  });

  updateBotButton();
}

function removePanel() {
  document.getElementById(PANEL_ID)?.remove();
  clearDebtBanner();
  panelVisible = false;
}

// ── Chat Change Detection ──────────────────────────────────────────────────

let lastPhone = "";
let chatChangeDebounce: ReturnType<typeof setTimeout> | null = null;

function onChatChange() {
  const phone = getActivePhone();
  if (phone === lastPhone) return;

  lastPhone = phone;
  currentPhone = phone;

  // Reset state for new conversation
  setSuggestion("");
  clearDebtBanner();
  setContactName(null);

  if (phone) {
    refreshBotStatus();
  }
}

function scheduleCheck() {
  if (chatChangeDebounce) clearTimeout(chatChangeDebounce);
  chatChangeDebounce = setTimeout(() => {
    onChatChange();
    ensurePanel();
  }, 300);
}

function ensurePanel() {
  const footer = document.querySelector(SEL.footer);
  if (footer && !document.getElementById(PANEL_ID)) {
    injectPanel();
  } else if (!footer && document.getElementById(PANEL_ID)) {
    removePanel();
  }
}

// ── MutationObserver ───────────────────────────────────────────────────────

function startObserver() {
  const observer = new MutationObserver((mutations) => {
    for (const mut of mutations) {
      // Check for footer appearing (when user opens a chat)
      if (mut.type === "childList") {
        scheduleCheck();
      }
      // Check for attribute changes that signal active chat switch
      if (mut.type === "attributes" && mut.attributeName === "aria-selected") {
        scheduleCheck();
      }
    }
  });

  // Observe the full app for structure changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["aria-selected", "class"],
  });

  // Initial check
  scheduleCheck();
}

// ── Bootstrap ──────────────────────────────────────────────────────────────

function boot() {
  // Wait for WhatsApp to fully render
  const wait = setInterval(() => {
    if (document.querySelector(SEL.chatList)) {
      clearInterval(wait);
      injectCSS();
      startObserver();
    }
  }, 500);
}

boot();
