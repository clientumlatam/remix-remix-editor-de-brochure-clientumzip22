/**
 * wp-adapter.ts
 *
 * Punto de entrada alternativo a main.tsx para el build de WordPress.
 * - Lee window.clientumConfig (inyectado por PHP) en lugar de usar rutas Express.
 * - Reemplaza todas las llamadas a /api/* con /wp-json/clientum/v1/*.
 * - Agrega el nonce de WP a cada request para autenticación.
 *
 * Para el build de WordPress, Vite usa vite.wp.config.ts que apunta
 * a este archivo como entry point en lugar de src/main.tsx.
 */

// Exponer la configuración globalmente antes de que React arranque
declare global {
  interface Window {
    clientumConfig?: {
      apiBase: string;
      nonce: string;
      siteUrl: string;
      pluginUrl: string;
      currentUser: { username: string; role: string; id: number } | null;
    };
  }
}

// Cargar el config desde PHP o usar fallback de desarrollo
const config = window.clientumConfig ?? {
  apiBase:     '/wp-json/clientum/v1',
  nonce:       '',
  siteUrl:     window.location.origin,
  pluginUrl:   '',
  currentUser: null,
};

// Exportar para que wp-api.ts lo use
export { config };

// Arrancar la app React
import('./main-wp').then(({ default: startApp }) => {
  startApp(config);
});
