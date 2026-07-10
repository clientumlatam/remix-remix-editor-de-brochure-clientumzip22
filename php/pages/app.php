<?php
$user = currentUser();
$isLoggedIn = $user !== null;
?>
<!DOCTYPE html>
<html lang="es" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Clientum CRM — IA para PyMEs</title>
  <meta name="description" content="CRM inteligente con IA para PyMEs argentinas. Chatbot WhatsApp 24/7, pipeline Kanban, MEDDIC y brochure IA." />
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: { DEFAULT: '#2563eb', dark: '#1d4ed8', light: '#3b82f6' }
          }
        }
      }
    }
  </script>
  <link rel="stylesheet" href="/assets/css/app.css" />
  <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.3/Sortable.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js"></script>
</head>
<body class="bg-slate-950 text-white min-h-screen" x-data="clientumApp()" x-init="init()">

<!-- AUTH GATE (shown when not logged in and trying to access dashboard) -->
<div id="auth-gate" class="hidden min-h-screen w-full flex items-center justify-center bg-slate-950 px-4">
  <div class="w-full max-w-sm">
    <div class="text-center mb-8">
      <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 mb-4">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
      </div>
      <h1 class="text-2xl font-semibold text-white">Clientum CRM</h1>
      <p id="auth-subtitle" class="text-slate-400 text-sm mt-1">Iniciá sesión para acceder al panel.</p>
    </div>
    <form id="auth-form" class="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
      <div>
        <label class="block text-xs font-medium text-slate-400 mb-1.5">Usuario</label>
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          <input id="auth-username" type="text" required minlength="3" maxlength="32" autocomplete="username"
            class="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="tu_usuario" />
        </div>
      </div>
      <div>
        <label class="block text-xs font-medium text-slate-400 mb-1.5">Contraseña</label>
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          <input id="auth-password" type="password" required minlength="8" autocomplete="current-password"
            class="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="••••••••" />
        </div>
      </div>
      <div id="auth-confirm-wrap" class="hidden">
        <label class="block text-xs font-medium text-slate-400 mb-1.5">Confirmar contraseña</label>
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          <input id="auth-confirm" type="password" minlength="8" autocomplete="new-password"
            class="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="••••••••" />
        </div>
      </div>
      <div id="auth-error" class="hidden text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-lg px-3 py-2"></div>
      <button type="submit" id="auth-btn" class="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg py-2.5 text-sm transition-colors">
        <span id="auth-btn-text">Ingresar</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
      </button>
    </form>
    <p class="text-center text-sm text-slate-500 mt-4">
      <span id="auth-toggle-text">¿No tenés cuenta?</span>
      <button id="auth-toggle" onclick="toggleAuthMode()" class="text-blue-400 hover:text-blue-300 font-medium ml-1">Registrate</button>
    </p>
  </div>
</div>

<!-- PUBLIC WEBSITE -->
<div id="public-website" class="hidden">
  <?php include ROOT . '/pages/website.php'; ?>
</div>

<!-- DASHBOARD -->
<div id="dashboard" class="hidden min-h-screen flex">
  <?php include ROOT . '/pages/dashboard.php'; ?>
</div>

<!-- TOAST NOTIFICATION -->
<div id="toast" class="fixed bottom-4 right-4 z-50 hidden">
  <div id="toast-inner" class="bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-4 py-3 shadow-xl flex items-center gap-2">
    <span id="toast-msg"></span>
  </div>
</div>

<script>
// ─── App State ───────────────────────────────────────────────────────────────
let APP = {
  view: 'website',   // 'website' | 'auth' | 'dashboard'
  user: <?= $isLoggedIn ? json_encode($user) : 'null' ?>,
  activeTab: 'pipeline',
  deals: [],
  products: [],
  sellers: [],
  branches: [],
  conversations: [],
  brochureData: null,
  colorTheme: localStorage.getItem('clientum_color_theme') || 'navy',
  contactInfo: JSON.parse(localStorage.getItem('clientum_contact_info') || '{"website":"clientum.com.ar","email":"info@clientum.com.ar","phone":"+54 9 298 451-0883","address":"General Roca, Río Negro, Argentina"}'),
  hidePrices: localStorage.getItem('clientum_hide_prices') === 'true',
  hideChatbot: localStorage.getItem('clientum_hide_chatbot') === 'true',
};

const DEFAULT_BROCHURE = {
  cover: { slogan: 'Tecnología real para PyMEs reales.', sub: 'CRM inteligente, Chatbot WhatsApp 24/7, Facturación AFIP y Asistente IA — todo en una plataforma.' },
  chatbot: {
    title: 'Tu negocio atiende solo, las 24 horas.',
    features: [
      { title: 'Respuesta instantánea', desc: 'Responde preguntas frecuentes al instante.' },
      { title: 'Agendamiento automático', desc: 'El bot agenda citas según tu disponibilidad.' },
      { title: 'Cotizaciones automáticas', desc: 'Genera presupuestos personalizados al instante.' },
      { title: 'Calificación de leads', desc: 'Clasifica consultas según intención de compra.' }
    ],
    flowSteps: [
      'El cliente escribe al WhatsApp y el bot responde al instante',
      'La IA califica, cotiza y agenda automáticamente',
      'Si necesita asesor, el lead llega al CRM con historial',
      'Tu equipo interviene solo en el momento justo'
    ]
  },
  crm: {
    title: 'Nunca más pierdas una venta.',
    features: [
      { title: 'Pipeline drag & drop', desc: 'Mové deals entre etapas visualmente.' },
      { title: 'Contactos y empresas', desc: 'Base de datos centralizada con historial completo.' },
      { title: 'Seguimiento automático', desc: 'Tareas y recordatorios post-venta automáticos.' },
      { title: 'Acceso desde el celular', desc: 'Consultás tu CRM desde cualquier dispositivo.' }
    ]
  },
  services: [
    { title: 'Desarrollo Web & E-Commerce', desc: 'Tiendas de alto rendimiento con MercadoPago integrado.', bullets: ['Tiendas WooCommerce y Shopify', 'Diseño UX/UI responsivo', 'Control unificado de stock'] },
    { title: 'Implementación CRM + Chatbot', desc: 'Bot WhatsApp 24/7 + CRM drag-drop + Facturación AFIP.', bullets: ['Conversaciones ilimitadas', 'Pipeline Kanban', 'Factura electrónica AFIP'] },
    { title: 'Consultoría en IA & BI', desc: 'IA y Business Intelligence para PyMEs.', bullets: ['Modelos IA a medida', 'Tableros BI y analítica', 'Automatización de flujos'] }
  ],
  testimonial: {
    text: 'Implementamos Clientum en 5 días. El bot generó 40% más consultas sin contratar nadie.',
    author: 'Martín R.',
    company: 'Distribuidora del Sur S.A. — Neuquén'
  }
};

APP.brochureData = JSON.parse(localStorage.getItem('clientum_brochure_data') || 'null') || DEFAULT_BROCHURE;

// ─── View Management ──────────────────────────────────────────────────────────
function showView(view) {
  document.getElementById('public-website').classList.add('hidden');
  document.getElementById('auth-gate').classList.add('hidden');
  document.getElementById('dashboard').classList.add('hidden');

  if (view === 'website') document.getElementById('public-website').classList.remove('hidden');
  else if (view === 'auth') document.getElementById('auth-gate').classList.remove('hidden');
  else if (view === 'dashboard') document.getElementById('dashboard').classList.remove('hidden');
  APP.view = view;
}

function goToDashboard() {
  if (!APP.user) { showView('auth'); return; }
  showView('dashboard');
  loadDeals();
}

function goToWebsite() { showView('website'); }

// ─── Auth ─────────────────────────────────────────────────────────────────────
let authMode = 'login';
function toggleAuthMode() {
  authMode = authMode === 'login' ? 'register' : 'login';
  document.getElementById('auth-subtitle').textContent = authMode === 'login' ? 'Iniciá sesión para acceder al panel.' : 'Creá una cuenta para acceder al panel.';
  document.getElementById('auth-btn-text').textContent = authMode === 'login' ? 'Ingresar' : 'Crear cuenta';
  document.getElementById('auth-toggle-text').textContent = authMode === 'login' ? '¿No tenés cuenta?' : '¿Ya tenés cuenta?';
  document.getElementById('auth-toggle').textContent = authMode === 'login' ? 'Registrate' : 'Iniciá sesión';
  document.getElementById('auth-confirm-wrap').classList.toggle('hidden', authMode === 'login');
  document.getElementById('auth-error').classList.add('hidden');
}

document.getElementById('auth-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('auth-username').value.trim();
  const password = document.getElementById('auth-password').value;
  const confirm = document.getElementById('auth-confirm').value;
  const errEl = document.getElementById('auth-error');
  errEl.classList.add('hidden');

  if (authMode === 'register' && password !== confirm) {
    errEl.textContent = 'Las contraseñas no coinciden.';
    errEl.classList.remove('hidden');
    return;
  }

  const btn = document.getElementById('auth-btn');
  btn.disabled = true;
  btn.innerHTML = '<svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>';

  try {
    const url = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error inesperado.');
    APP.user = data.user;
    showView('dashboard');
    loadDeals();
    renderDashboardHeader();
    toast('¡Bienvenido, ' + data.user.username + '!');
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span id="auth-btn-text">' + (authMode === 'login' ? 'Ingresar' : 'Crear cuenta') + '</span><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>';
  }
});

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  APP.user = null;
  showView('website');
}

// ─── Toast ───────────────────────────────────────────────────────────────────
function toast(msg, duration = 3000) {
  const el = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), duration);
}

// ─── Init ─────────────────────────────────────────────────────────────────────
async function init() {
  // Check session
  try {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      const data = await res.json();
      APP.user = data.user;
    }
  } catch(e) {}

  showView('website');
  renderPublicWebsite();
}

init();
</script>

<script src="/assets/js/website.js"></script>
<script src="/assets/js/dashboard.js"></script>
<script src="/assets/js/kanban.js"></script>
<script src="/assets/js/brochure.js"></script>
<script src="/assets/js/ai.js"></script>
</body>
</html>
