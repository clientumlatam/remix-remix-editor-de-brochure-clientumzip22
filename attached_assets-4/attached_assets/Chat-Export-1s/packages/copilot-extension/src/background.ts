/**
 * Clientum Copilot — Background Service Worker (MV3)
 * Handles: auth state, API calls to Clientum backend, message routing.
 */
import type { AuthState, BgMessage, SuggestResponse } from "./types";

async function getAuth(): Promise<AuthState | null> {
  const s = await chrome.storage.local.get(["token", "apiUrl", "tenantName", "email", "hasApiKey"]);
  if (!s.token || !s.apiUrl) return null;
  return {
    token: s.token,
    apiUrl: (s.apiUrl as string).replace(/\/$/, ""),
    tenantName: s.tenantName ?? "Clientum",
    email: s.email ?? "",
    hasApiKey: s.hasApiKey ?? false,
  };
}

async function setAuth(data: Partial<AuthState> & { token: string; apiUrl: string }) {
  await chrome.storage.local.set({
    token: data.token,
    apiUrl: data.apiUrl.replace(/\/$/, ""),
    tenantName: data.tenantName ?? "Clientum",
    email: data.email ?? "",
    hasApiKey: data.hasApiKey ?? false,
  });
}

chrome.runtime.onMessage.addListener((msg: BgMessage, _sender, sendResponse) => {
  // ----------------------------------------------------------------
  if (msg.type === "GET_STATUS") {
    getAuth().then((auth) => {
      sendResponse({
        connected: !!auth,
        tenantName: auth?.tenantName,
        email: auth?.email,
        hasApiKey: auth?.hasApiKey,
      });
    });
    return true;
  }

  // ----------------------------------------------------------------
  if (msg.type === "LOGIN") {
    const { apiUrl, email, password } = msg.payload;
    const base = apiUrl.replace(/\/$/, "");

    fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then((r) => r.json())
      .then(async (data) => {
        if (!data.token) {
          sendResponse({ error: data.error ?? "Credenciales incorrectas" });
          return;
        }

        // Fetch copilot/me to confirm API key status
        const meRes = await fetch(`${base}/api/copilot/me`, {
          headers: { Authorization: `Bearer ${data.token}` },
        }).then((r) => r.json()).catch(() => ({}));

        await setAuth({
          token: data.token,
          apiUrl: base,
          tenantName: data.tenant?.name ?? meRes?.tenantName ?? "Clientum",
          email: data.user?.email ?? email,
          hasApiKey: meRes?.hasApiKey ?? false,
        });

        sendResponse({
          ok: true,
          tenantName: data.tenant?.name ?? meRes?.tenantName ?? "Clientum",
          hasApiKey: meRes?.hasApiKey ?? false,
        });
      })
      .catch(() => sendResponse({ error: "No se pudo conectar al servidor. Verificá la URL." }));

    return true;
  }

  // ----------------------------------------------------------------
  if (msg.type === "LOGOUT") {
    chrome.storage.local.clear().then(() => sendResponse({ ok: true }));
    return true;
  }

  // ----------------------------------------------------------------
  if (msg.type === "COPILOT_SUGGEST") {
    const { phone, messages } = msg.payload;

    getAuth().then(async (auth) => {
      if (!auth) {
        sendResponse({
          error: "No estás conectado a Clientum. Abrí el ícono de la extensión para iniciar sesión.",
        } as SuggestResponse);
        return;
      }

      try {
        const res = await fetch(`${auth.apiUrl}/api/copilot/suggest`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify({ phone, messages }),
        });

        const data = (await res.json()) as SuggestResponse;

        if (!res.ok) {
          sendResponse({ error: data.error ?? `Error ${res.status}` });
          return;
        }

        sendResponse(data);
      } catch {
        sendResponse({
          error: "No se pudo conectar al servidor. Verificá la URL en la extensión.",
        });
      }
    });

    return true;
  }
});
