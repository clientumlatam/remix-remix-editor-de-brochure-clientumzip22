/**
 * Popup script — Clientum Copilot
 * Handles: login/logout, status display, config persistence
 */

const $ = (id: string) => document.getElementById(id)!;

async function getConfig() {
  return new Promise<{ apiUrl?: string; token?: string }>((resolve) => {
    chrome.storage.local.get(["apiUrl", "token"], resolve as any);
  });
}

function showMsg(text: string, type: "error" | "success") {
  const el = $("msg");
  el.textContent = text;
  el.className = `msg ${type}`;
}

function clearMsg() {
  const el = $("msg");
  el.textContent = "";
  el.className = "msg";
}

function showView(view: "login" | "connected") {
  $("view-login").className = view === "login" ? "active" : "";
  $("view-connected").className = view === "connected" ? "active" : "";
}

async function verifyAndConnect(apiUrl: string, token: string) {
  const url = apiUrl.replace(/\/$/, "");
  const resp = await fetch(`${url}/api/copilot/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) {
    const body = await resp.json().catch(() => ({ error: `HTTP ${resp.status}` }));
    throw new Error((body as any).error ?? `HTTP ${resp.status}`);
  }
  return resp.json() as Promise<{
    tenantName: string;
    email: string;
    hasApiKey: boolean;
  }>;
}

async function init() {
  const cfg = await getConfig();

  if (cfg.apiUrl && cfg.token) {
    try {
      const me = await verifyAndConnect(cfg.apiUrl, cfg.token);
      showConnected(me.tenantName, me.email, me.hasApiKey);
    } catch {
      // Token expired or invalid — show login
      showView("login");
      ($("input-url") as HTMLInputElement).value = cfg.apiUrl ?? "";
    }
  } else {
    showView("login");
  }
}

function showConnected(tenantName: string, email: string, hasApiKey: boolean) {
  showView("connected");
  $("tenant-name").textContent = `⚡ ${tenantName}`;
  $("user-email").textContent = email;
  $("api-key-warning").style.display = hasApiKey ? "none" : "block";
}

// Connect button
$("btn-connect").addEventListener("click", async () => {
  clearMsg();
  const apiUrl = ($("input-url") as HTMLInputElement).value.trim();
  const token = ($("input-token") as HTMLInputElement).value.trim();

  if (!apiUrl || !token) {
    showMsg("Completá la URL y el token.", "error");
    return;
  }

  const btn = $("btn-connect") as HTMLButtonElement;
  btn.innerHTML = '<span class="spinner"></span>Verificando...';
  btn.disabled = true;

  try {
    const me = await verifyAndConnect(apiUrl, token);
    await chrome.storage.local.set({ apiUrl, token });
    showConnected(me.tenantName, me.email, me.hasApiKey);
  } catch (err: any) {
    showMsg(err?.message ?? "No se pudo conectar. Verificá la URL y el token.", "error");
    btn.innerHTML = "Conectar";
    btn.disabled = false;
  }
});

// Logout button
$("btn-logout").addEventListener("click", async () => {
  await chrome.storage.local.remove(["apiUrl", "token"]);
  ($("input-url") as HTMLInputElement).value = "";
  ($("input-token") as HTMLInputElement).value = "";
  showView("login");
});

// Dashboard link
$("link-dashboard").addEventListener("click", async (e) => {
  e.preventDefault();
  const cfg = await getConfig();
  const url = cfg.apiUrl ? `${cfg.apiUrl}/app/settings` : "https://clientum.replit.app/app/settings";
  chrome.tabs.create({ url });
});

init();
