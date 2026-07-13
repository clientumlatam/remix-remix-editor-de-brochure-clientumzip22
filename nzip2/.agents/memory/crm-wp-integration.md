---
name: CRM–WordPress Integration Architecture
description: How the React CRM app is integrated into WordPress — auth, routing, build, and internal API.
---

# CRM–WordPress Integration

## Architecture
- **WordPress** (port 5000) is the public-facing app. All auth is done by WP.
- **CRM Express** (port 3001, internal only) handles AI generation (`/api/generate`) and prospecting (`/api/scrape-places`). Not publicly reachable.
- **React SPA** is built into `wordpress/wp-content/plugins/ai-marketing-expert/assets/crm/` and served by the WordPress page template.

## Auth flow
- `window.WP_CRM_CONFIG` is injected by `template-crm-app.php` (PHP template on the CRM page).
- The fetch interceptor (`src/lib/fetch-interceptor.ts`) reroutes `/api/generate` → `/wp-json/aime/v1/crm/generate` when in WP context.
- `class-crm-proxy.php` proxies WP REST → Express, adding `X-CRM-Token` header.
- React components are zero-changes — only the interceptor and App.tsx auth useEffect change.

## Key files
- WP page template: `wordpress/wp-content/themes/clientum-theme/template-crm-app.php`
- WP REST proxy: `wordpress/wp-content/plugins/ai-marketing-expert/includes/class-crm-proxy.php`
- CRM page: page_id=104, slug `/crm/`, template `template-crm-app.php`
- Vite config: `build.manifest: true` → `.vite/manifest.json` used by the PHP template
- Express server: `remix-remix-editor-de-brochure-clientumzip/server.ts`

## Critical gotcha: CrmProxy registration timing
`CrmProxy::__construct()` must call `$this->register_routes()` **directly**, NOT via `add_action('rest_api_init', ...)`.
**Why:** The constructor is called from inside `on_rest_api_init()` which is itself the `rest_api_init` callback — adding another `rest_api_init` action at that point is too late; it never fires.

## Env vars required
- `CRM_INTERNAL_TOKEN` — secret, shared between Express and WP proxy
- `CRM_EXPRESS_URL` — `http://127.0.0.1:3001` (non-secret)
- `GEMINI_API_KEY` — secret, used by Express `/api/generate`
- `WHATSAPP_BRIDGE_TOKEN`, `WP_WEBHOOK_SECRET`, `WHATSAPP_BRIDGE_URL`, `WP_WEBHOOK_URL` — WhatsApp bridge

## WordPress SQLite DB
- Main DB: `wordpress/wp-content/database/wordpress.db` (PDO SQLite)
- `sqlite3` CLI not available — use `php -r "new PDO('sqlite:...')"` for DB queries
- `.ht.sqlite` is not a valid SQLite file
- Permalink structure set to `/%postname%/`; router.php routes all non-file requests to `index.php`
