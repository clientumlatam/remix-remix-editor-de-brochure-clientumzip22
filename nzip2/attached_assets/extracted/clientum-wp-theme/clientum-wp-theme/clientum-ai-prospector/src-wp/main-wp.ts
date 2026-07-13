/**
 * main-wp.ts
 *
 * Bootstrap de la app React para el entorno WordPress.
 * Recibe la configuración PHP y arranca React en #clientum-prospector-root.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';

// Importar App normal — las llamadas a la API se redirigen via wp-api.ts
import App from '../../../src/App';
import '../../../src/index.css';

interface WPConfig {
  apiBase: string;
  nonce: string;
  siteUrl: string;
  pluginUrl: string;
  currentUser: { username: string; role: string; id: number } | null;
}

export default function startApp(config: WPConfig) {
  // Parchear fetch globalmente para inyectar la base URL y el nonce de WP
  const originalFetch = window.fetch.bind(window);

  window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
    let url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    let options = { ...(init ?? {}) };

    // Reemplazar /api/ → WP REST API base
    if (url.startsWith('/api/')) {
      url = config.apiBase + url.replace('/api', '');
    }

    // Inyectar nonce en todos los requests a la WP REST API
    if (url.includes('/wp-json/clientum/') || url.includes(config.apiBase)) {
      options.headers = {
        ...(options.headers ?? {}),
        'X-WP-Nonce': config.nonce,
      };
    }

    return originalFetch(url, options);
  };

  // Montar React en el div del shortcode / template
  const rootEl = document.getElementById('clientum-prospector-root');
  if (!rootEl) {
    console.error('[Clientum] No se encontró #clientum-prospector-root');
    return;
  }

  const root = ReactDOM.createRoot(rootEl);
  root.render(
    React.createElement(React.StrictMode, null,
      React.createElement(App)
    )
  );
}
