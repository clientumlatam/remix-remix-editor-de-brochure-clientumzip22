# Clientum AI Prospector — Plugin WordPress

Sistema integral de prospección B2B, calificación MEDDIC, CRM Pipeline, Brochure con IA y automatización de outreach. Plugin independiente de WordPress.

---

## 📋 Requisitos

- WordPress 6.0+
- PHP 8.1+ (se usa `match` y `openssl`)
- MySQL 5.7+ / MariaDB 10.3+
- Node.js 18+ (solo para compilar el frontend)
- Permalinks habilitados (Ajustes → Enlaces permanentes → cualquier opción excepto "Predeterminado")

---

## ⚡ Instalación rápida

### Opción A — ZIP instalable (recomendada)

1. Compilar el bundle React (ver sección abajo)
2. Plugins → Añadir nuevo → Subir plugin
3. Subir `clientum-wp-theme/clientum-ai-prospector.zip`
4. Activar — las tablas se crean automáticamente

### Opción B — Copiar carpeta

```bash
cp -r clientum-wp-theme/clientum-ai-prospector/ /ruta/a/wp-content/plugins/
```

Activar desde el panel de WordPress.

---

## 🔨 Compilar el bundle React

El plugin necesita el bundle compilado de React para funcionar. Solo hace falta hacerlo una vez (o cuando cambie el código frontend).

### Desde la raíz del proyecto:

```bash
# Opción 1: script automático (recomendado)
bash clientum-wp-theme/clientum-ai-prospector/build-for-wp.sh

# Opción 2: npm script (si lo agregaste a package.json)
npm run build:wp
```

El script compila la app, copia los archivos a `assets/js/` y `assets/css/`, y genera el ZIP.

### Agregar a package.json (opcional):

```json
{
  "scripts": {
    "build:wp": "vite build --config clientum-wp-theme/clientum-ai-prospector/vite.wp.config.ts && bash clientum-wp-theme/clientum-ai-prospector/build-for-wp.sh"
  }
}
```

---

## ⚙️ Configuración

### 1. API Keys (requeridas)

Ir a **Clientum → Configuración** en el admin de WordPress:

| Campo | Descripción | Dónde obtenerla |
|-------|-------------|-----------------|
| Gemini API Key | Para generación de contenido con IA | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| Apify Token | Para búsqueda real de leads en Google Maps | [Apify Console](https://console.apify.com/account/integrations) |
| Google Maps API Key | Opcional, para mapa interactivo | [Google Cloud Console](https://console.cloud.google.com/) |

### 2. Instalar el importador WP (si usás el XML)

Herramientas → Importar → WordPress → Instalar

---

## 🗂️ Cómo mostrar la app

### Opción A — Shortcode en cualquier página

```
[clientum_prospector]
```

### Opción B — URL directa

La app está disponible en `tudominio.com/prospector/`

*(Requiere Permalinks habilitados y hacer Ajustes → Enlaces permanentes → Guardar para regenerar las reglas.)*

### Opción C — Elegir página en Configuración

En **Clientum → Configuración**, seleccioná la página donde pusiste el shortcode.

---

## 🗄️ Base de datos

El plugin crea 6 tablas al activarse:

| Tabla | Descripción |
|-------|-------------|
| `wp_cap_deals` | Deals/negocios del CRM Pipeline |
| `wp_cap_activities` | Log de actividades (llamadas, mails, reuniones) |
| `wp_cap_contacts` | Contactos y empresas |
| `wp_cap_templates` | Plantillas de brochure guardadas |
| `wp_cap_api_keys` | API keys por usuario (cifradas con AES-256) |
| `wp_cap_leads` | Leads guardados desde Patagonia Explorer |

---

## 🔗 API REST completa

Base URL: `https://tudominio.com/wp-json/clientum/v1/`

### Auth
```
POST /auth/register   — Registro de usuario
POST /auth/login      — Login (devuelve nonce WP)
POST /auth/logout     — Cerrar sesión
GET  /auth/me         — Usuario actual
```

### IA (requiere auth)
```
POST /generate        — Generación con Gemini AI
  body: { action: "generateIndustryCopy" | "optimizeCopy" | "generateImage" |
          "translateBrochure" | "icp" | "meddic" | "outreach" | "copilot",
          payload: { ... } }
```

### Scraping (requiere auth)
```
POST /scrape-places   — Búsqueda en Google Maps via Apify
  body: { query: string, max?: number, language?: string }
```

### CRM (requiere auth)
```
GET|POST         /deals
GET|PUT|DELETE   /deals/:id

GET|POST         /activities
PUT|DELETE       /activities/:id

GET|POST         /contacts
GET|PUT|DELETE   /contacts/:id

GET|POST         /templates
DELETE           /templates/:id

GET|POST         /leads
PUT|DELETE       /leads/:id
```

### API Keys de usuario
```
GET  /api-keys/:service   — Verifica si existe (no devuelve el valor)
POST /api-keys/:service   — Guarda (cifrado AES-256)
  body: { apiKey: string }
```

---

## 🛡️ Seguridad

- Todas las rutas CRM/AI requieren sesión activa (WordPress auth cookie)
- Las API keys de usuario se cifran con AES-256-CBC usando `SECURE_AUTH_KEY` de wp-config.php
- El nonce WP REST se renueva en cada carga de página
- Sanitización de inputs con funciones nativas de WP (`sanitize_text_field`, `sanitize_email`, etc.)
- Prepared statements en todas las queries SQL

---

## 📁 Estructura del plugin

```
clientum-ai-prospector/
├── clientum-ai-prospector.php   # Main plugin file
├── includes/
│   ├── class-database.php       # Creación de tablas + helpers de cifrado
│   ├── class-rest-api.php       # Todos los endpoints WP REST
│   ├── class-admin.php          # Panel de configuración en el admin
│   ├── class-ai-handler.php     # Integración con Gemini AI
│   └── class-scraper.php        # Integración con Apify (Google Maps)
├── src-wp/
│   ├── wp-adapter.ts            # Entry point React para WP
│   └── main-wp.ts               # Bootstrap de la app en WP
├── vite.wp.config.ts            # Config de Vite para build WP
├── build-for-wp.sh              # Script de build + ZIP
├── assets/
│   ├── js/
│   │   └── clientum-prospector.js   # ← Generado por build-for-wp.sh
│   └── css/
│       └── clientum-prospector.css  # ← Generado por build-for-wp.sh
└── README.md
```

---

## ❗ Nota sobre conflictos con clientum-user-dashboard

Si tenés activo el plugin `clientum-user-dashboard` (el panel de usuario anterior), podría haber conflicto en las rutas `/login`, `/registro`, `/app`. Se recomienda usar uno u otro.

`clientum-ai-prospector` usa la ruta `/prospector/` que es independiente.

---

## 🐛 Troubleshooting

| Problema | Solución |
|----------|----------|
| La app muestra pantalla en blanco | Revisar **Estado** en Clientum → Estado. Falta compilar el JS. |
| Error 401 en la API | Los permalinks no están configurados. Ir a Ajustes → Enlaces permanentes y guardar. |
| IA no genera contenido | Verificar Gemini API Key en Configuración. |
| Patagonia Explorer muestra datos demo | Normal sin Apify Token. Agregar token en Configuración. |
| Error al activar el plugin | Verificar PHP 8.1+ (`php -v` en terminal). |
