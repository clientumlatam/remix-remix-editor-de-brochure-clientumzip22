/**
 * Background Service Worker — Clientum Copilot MV3
 * Handles: auth token storage, API calls, CDP text injection
 */
import type {
  StoredConfig,
  MessageToBackground,
  MessageFromBackground,
  SuggestRequest,
} from "./types";

// ── Helpers ────────────────────────────────────────────────────────────────

async function getConfig(): Promise<StoredConfig | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get(["apiUrl", "token"], (items) => {
      if (items["apiUrl"] && items["token"]) {
        resolve({ apiUrl: items["apiUrl"] as string, token: items["token"] as string });
      } else {
        resolve(null);
      }
    });
  });
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const config = await getConfig();
  if (!config) throw new Error("No configurado. Abrí el popup de la extensión para conectarte.");

  const url = config.apiUrl.replace(/\/$/, "") + path;
  const resp = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.token}`,
      ...(options.headers ?? {}),
    },
  });

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({ error: resp.statusText }));
    throw new Error((body as any).error ?? `HTTP ${resp.status}`);
  }
  return resp.json() as Promise<T>;
}

// ── CDP Text Insertion ─────────────────────────────────────────────────────

async function insertTextViaCDP(tabId: number, text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const target = { tabId };

    chrome.debugger.attach(target, "1.3", () => {
      if (chrome.runtime.lastError) {
        // Already attached — try direct insert
        chrome.debugger.sendCommand(target, "Input.insertText", { text }, () => {
          if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
          else resolve();
        });
        return;
      }

      chrome.debugger.sendCommand(target, "Input.insertText", { text }, () => {
        const err = chrome.runtime.lastError;
        chrome.debugger.detach(target, () => {
          if (err) reject(new Error(err.message));
          else resolve();
        });
      });
    });
  });
}

// ── Message Handler ────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener(
  (rawMsg: unknown, sender, sendResponse: (resp: MessageFromBackground) => void) => {
    const msg = rawMsg as MessageToBackground;

    (async () => {
      try {
        switch (msg.type) {
          case "GET_CONFIG": {
            const config = await getConfig();
            sendResponse({ type: "CONFIG_OK", data: config });
            break;
          }

          case "SUGGEST": {
            const data = await apiFetch<import("./types").SuggestResponse>(
              "/api/copilot/suggest",
              { method: "POST", body: JSON.stringify(msg.payload as SuggestRequest) }
            );
            sendResponse({ type: "SUGGEST_OK", data });
            break;
          }

          case "GET_STATUS": {
            const phone = encodeURIComponent(msg.payload.phone);
            const data = await apiFetch<import("./types").ChatStatus>(
              `/api/copilot/chats/${phone}/status`
            );
            sendResponse({ type: "STATUS_OK", data });
            break;
          }

          case "TOGGLE_BOT": {
            const phone = encodeURIComponent(msg.payload.phone);
            await apiFetch<unknown>(`/api/copilot/chats/${phone}/toggle-bot`, {
              method: "PUT",
              body: JSON.stringify({ paused: msg.payload.paused }),
            });
            sendResponse({ type: "TOGGLE_BOT_OK", data: { botPaused: msg.payload.paused } });
            break;
          }

          case "INSERT_TEXT": {
            await insertTextViaCDP(msg.payload.tabId, msg.payload.text);
            sendResponse({ type: "INSERT_TEXT_OK" });
            break;
          }

          default:
            sendResponse({ type: "ERROR", error: "Mensaje desconocido" });
        }
      } catch (err: any) {
        sendResponse({ type: "ERROR", error: err?.message ?? "Error desconocido" });
      }
    })();

    return true; // keep message channel open for async sendResponse
  }
);

// Keep service worker alive during long CDP sessions
chrome.runtime.onInstalled.addListener(() => {
  console.log("[Clientum Copilot] Extension instalada/actualizada.");
});
