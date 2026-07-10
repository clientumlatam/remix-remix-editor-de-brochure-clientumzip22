/**
 * Clientum Copilot — Popup UI
 * Shows login form or connected state.
 */

async function sendMsg(msg: object): Promise<any> {
  return new Promise((resolve) =>
    chrome.runtime.sendMessage(msg, (res) => resolve(res ?? {}))
  );
}

// ------------------------------------------------------------------
// Connected state
// ------------------------------------------------------------------
function showConnected(tenantName: string, email: string, hasApiKey: boolean) {
  const app = document.getElementById("app")!;
  app.innerHTML = `
    <div class="status-badge">
      <div class="status-dot"></div>
      Conectado
    </div>
    <div class="tenant-card">
      <div class="tenant-name">${escHtml(tenantName)}</div>
      <div class="tenant-email">${escHtml(email)}</div>
    </div>
    <div class="hint">
      Abrí <strong>WhatsApp Web</strong> y usá el botón
      <strong>✨ Sugerir</strong> en cualquier conversación.
    </div>
    ${
      !hasApiKey
        ? `<div class="no-key-warn">
          ⚠️ No hay API key de OpenRouter configurada.<br>
          Agregala en Clientum → Configuración → IA.
        </div>`
        : ""
    }
    <button id="logoutBtn" class="btn-secondary">Desconectar</button>
  `;

  document.getElementById("logoutBtn")?.addEventListener("click", async () => {
    await sendMsg({ type: "LOGOUT" });
    showLogin();
  });
}

// ------------------------------------------------------------------
// Login form
// ------------------------------------------------------------------
function showLogin() {
  const app = document.getElementById("app")!;
  app.innerHTML = `
    <form id="loginForm" autocomplete="on">
      <div class="field">
        <label>URL de Clientum</label>
        <input id="apiUrl" type="url" name="url"
               placeholder="https://tu-app.replit.app" required
               autocomplete="url" />
      </div>
      <div class="field">
        <label>Email</label>
        <input id="emailInput" type="email" name="email"
               placeholder="vos@empresa.com" required
               autocomplete="username email" />
      </div>
      <div class="field">
        <label>Contraseña</label>
        <input id="password" type="password" name="password"
               required autocomplete="current-password" />
      </div>
      <div id="errMsg" class="error hidden"></div>
      <button type="submit" class="btn-primary" id="loginBtn">
        Iniciar sesión
      </button>
    </form>
  `;

  // Pre-fill stored URL
  chrome.storage.local.get("apiUrl", ({ apiUrl }) => {
    if (apiUrl) {
      (document.getElementById("apiUrl") as HTMLInputElement).value = apiUrl;
    }
  });

  document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const apiUrl = (document.getElementById("apiUrl") as HTMLInputElement).value.trim().replace(/\/$/, "");
    const email = (document.getElementById("emailInput") as HTMLInputElement).value.trim();
    const password = (document.getElementById("password") as HTMLInputElement).value;
    const loginBtn = document.getElementById("loginBtn") as HTMLButtonElement;
    const errEl = document.getElementById("errMsg")!;

    loginBtn.textContent = "Conectando...";
    loginBtn.disabled = true;
    errEl.classList.add("hidden");

    const res = await sendMsg({ type: "LOGIN", payload: { apiUrl, email, password } });

    if (res?.ok) {
      showConnected(res.tenantName ?? "Clientum", email, res.hasApiKey ?? false);
    } else {
      errEl.textContent = res?.error ?? "Error al conectar";
      errEl.classList.remove("hidden");
      loginBtn.textContent = "Iniciar sesión";
      loginBtn.disabled = false;
    }
  });
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
function escHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ------------------------------------------------------------------
// Init
// ------------------------------------------------------------------
async function init() {
  const status = await sendMsg({ type: "GET_STATUS" });
  if (status?.connected) {
    showConnected(status.tenantName ?? "Clientum", status.email ?? "", status.hasApiKey ?? false);
  } else {
    showLogin();
  }
}

init();
