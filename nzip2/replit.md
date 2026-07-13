# Clientum Platform — Replit Workspace

Plataforma all-in-one para PyMEs argentinas: CRM, Chatbot WhatsApp con IA, E-Commerce y Business Intelligence sobre WordPress.

---

## Estructura del proyecto

```
wordpress/               ← WordPress core (PHP 8.2 + SQLite)
  wp-config.php          ← configurado para SQLite y URL dinámica de Replit
  router.php             ← router del servidor built-in de PHP
  wp-content/
    themes/
      clientum-theme/    ← tema activo del sitio
    plugins/
      ai-marketing-expert/       ← plugin IA: email marketing, chatbot, SEO
      clientum-user-dashboard/   ← plugin: panel de usuario / CRM
      clientum-ai-prospector/    ← plugin: prospección con IA
      woocommerce/               ← tienda online
      learnpress/                ← academia / cursos
      sqlite-database-integration/  ← reemplaza MySQL por SQLite
    database/            ← archivo SQLite (se crea al primer arranque)
    debug.log            ← log de errores WP_DEBUG

src/                     ← copias fuente para desarrollo
  clientum-theme/        ← fuente del tema
  ai-marketing-expert/   ← fuente del plugin IA
  clientum-user-dashboard/  ← fuente del plugin dashboard

whatsapp-bridge/         ← puente WhatsApp ↔ WordPress (Node.js)
  index.js               ← servidor Express + Baileys (puerto 3300)
  auth/session/          ← credenciales de sesión WhatsApp (no commitear)

crm-express/             ← CRM Express (Node.js / TypeScript)
  artifacts/             ← mockup sandbox (canvas)

attached_assets/         ← datos e insumos del proyecto
  csv/                   ← catálogos y productos
    catalogo-completo-2147-servicios.csv   ← 2146 servicios con categorías
    textos-paginas.csv                     ← textos de las 20 páginas del sitio
    woocommerce-509-productos-limpio.csv   ← base limpia de productos
    woocommerce-541-productos.csv          ← versión extendida
    woocommerce-completo-fusionado.csv     ← 509 + 32 extras = 541 únicos
  html/
    catalogo.html        ← catálogo completo en HTML
  images/
    imagen.png           ← logo / imagen de referencia
  zips/                  ← archivos ZIP originales
  logs/                  ← logs y notas de sesiones anteriores
  extracted/
    clientum-wp-theme/   ← contenido extraído del ZIP principal

node_modules/            ← dependencias Node (whatsapp-bridge)
package.json             ← deps: @whiskeysockets/baileys, express, qrcode
```

---

## Servicios y puertos

| Servicio           | Comando                                  | Puerto |
|--------------------|------------------------------------------|--------|
| WordPress          | `cd wordpress && php -S 0.0.0.0:5000 router.php` | 5000 (→ 80) |
| WhatsApp Bridge    | `cd whatsapp-bridge && node index.js`    | 3300   |
| CRM Express        | `cd crm-express && npx tsx server.ts`    | 3001 (→ 3003) |

---

## Variables de entorno (configuradas en Replit)

| Variable                | Descripción                              |
|-------------------------|------------------------------------------|
| `WHATSAPP_BRIDGE_URL`   | URL interna del puente (`http://127.0.0.1:3300`) |
| `WHATSAPP_BRIDGE_TOKEN` | Token de autenticación del puente        |
| `WP_WEBHOOK_URL`        | Endpoint WP que recibe mensajes entrantes|
| `WP_WEBHOOK_SECRET`     | Secreto de validación del webhook        |
| `CRM_EXPRESS_URL`       | URL interna del CRM (`http://127.0.0.1:3001`) |
| `CRM_INTERNAL_TOKEN`    | Token interno CRM ↔ WordPress            |
| `GEMINI_API_KEY`        | API Key de Google Gemini (secret)        |
| `SESSION_SECRET`        | Secreto de sesión (secret)               |

---

## Primer arranque (WordPress nuevo)

1. Abrir el preview → aparece el instalador de WordPress
2. Completar: idioma, título del sitio, usuario admin, contraseña, email
3. WordPress crea la base SQLite automáticamente (no se necesita MySQL)
4. **Apariencia → Temas** → activar **clientum-theme**
5. **Plugins** → activar **ai-marketing-expert**, **clientum-user-dashboard**, **WooCommerce**, **LearnPress**

---

## Notas técnicas

- `wp-config.php` setea `WP_HOME` / `WP_SITEURL` dinámicamente desde el host de la request → funciona en preview y en deploy sin cambios.
- `WP_DEBUG` está activado; los errores van a `wordpress/wp-content/debug.log`.
- El puente WhatsApp usa Baileys (multidevice); la sesión se guarda en `whatsapp-bridge/auth/session/` — **no commitear esa carpeta**.
- `src/` contiene copias de desarrollo de los plugins/tema. Los archivos activos están en `wordpress/wp-content/`.

---

## User preferences

- Idioma de comunicación: español
- Reorganización: archivos agrupados por tipo/función, sin timestamps en nombres
