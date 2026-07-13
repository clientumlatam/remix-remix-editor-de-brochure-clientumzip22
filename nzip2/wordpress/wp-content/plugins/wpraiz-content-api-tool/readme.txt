=== WPRaiz Content API Tool ===
Contributors: zeicaro
Tags: rest-api, content-automation, ai-content, mcp, claude
Requires at least: 5.8
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 2.0.2
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

REST API + MCP Server for WordPress. Create, update, and manage posts programmatically. AI content generation with your own API keys (BYOK).

== Description ==

**WPRaiz Content API Tool** turns your WordPress site into a powerful content API. Create posts, manage categories, generate AI content, and connect AI agents — all via REST API or Model Context Protocol (MCP).

= What You Can Do =

* **Create & Update Posts** — Full control over title, content, status, categories, tags, excerpt, featured images, and custom meta fields via REST API.
* **Bulk Creation** — Create up to 50 posts in a single request (Pro).
* **AI Content Generation** — Generate full articles from a topic using Claude or OpenAI with your own API keys (Pro).
* **AI Rewrite** — Improve SEO, fix grammar, change tone, expand, or summarize existing posts (Pro).
* **Auto-SEO** — Automatically generate SEO titles and meta descriptions when not provided. Supports SEOPress, Yoast SEO, and Rank Math.
* **MCP Server** — Connect AI agents (Claude Desktop, Cursor, Windsurf) directly to your site via Model Context Protocol.
* **Similar Post Search** — Find duplicate or related content using intelligent Levenshtein-based scoring.
* **Webhooks** — Get notified when posts are created or bulk operations complete, with HMAC signature verification.
* **JWT Authentication** — Secure token-based auth with configurable rate limiting.

= Free vs Pro =

**Free** (this plugin):

* Create and update single posts via REST API
* Search similar posts
* List and manage categories
* JWT and Basic Auth (Application Passwords)
* SEO plugin auto-detection and meta writing
* Featured image upload from URL
* Rate limiting
* Legacy v1 endpoint compatibility

**Pro** ($49/year at [wpraiz.com.br/pro](https://wpraiz.com.br/pro)):

* Everything in Free, plus:
* Bulk post creation (up to 50 per batch)
* AI content generation (BYOK — Claude or OpenAI)
* AI post rewriting (5 modes)
* Auto-SEO via AI
* MCP Server (HTTP + STDIO transports)
* Webhook notifications with HMAC signing
* Priority support

= MCP Server =

The Model Context Protocol server lets AI agents interact with your WordPress site natively. Available via HTTP (REST API) or STDIO (WP-CLI).

**Tools:** create_post, update_post, search_similar, get_categories, generate_content, rewrite_post, bulk_create

**Resources:** site-info, recent-posts, categories, content-stats, seo-config

**Prompts:** publish_seo_article, content_series, seo_audit, refresh_old_content, internal_linking

Add to your `claude_desktop_config.json`:

`
{
    "mcpServers": {
        "wpraiz": {
            "command": "wp",
            "args": ["wpraiz-mcp", "serve", "--path=/path/to/wordpress", "--user=1"]
        }
    }
}
`

= REST API Endpoints =

Base URL: `https://yoursite.com/wp-json/wpraiz/v2/`

| Endpoint | Method | Auth | Tier |
|---|---|---|---|
| create-post | POST | JWT/Basic | Free |
| update-post | POST | JWT/Basic | Free |
| create-posts | POST | JWT/Basic | Pro |
| generate-content | POST | JWT/Basic | Pro |
| rewrite-post | POST | JWT/Basic | Pro |
| search-similar | GET | Public | Free |
| categories | GET | Public | Free |
| check-status | GET | Public | Free |
| auth/token | POST | Credentials | Free |

= Authentication =

**JWT Token:**
1. POST to `auth/token` with `username` and `password`
2. Use the returned token as `Authorization: Bearer <token>`

**Basic Auth:**
Use WordPress Application Passwords with standard HTTP Basic authentication.

= Requirements =

* WordPress 5.8+
* PHP 7.4+
* For AI features: Claude API key or OpenAI API key
* For MCP STDIO: WP-CLI installed

== Installation ==

1. Upload the plugin files to `/wp-content/plugins/wpraiz-content-api-tool/` or install through the WordPress plugins screen.
2. Activate the plugin through the 'Plugins' screen in WordPress.
3. Go to **Tools > WPRaiz Content API** to configure settings.
4. (Optional) Add your AI API keys for content generation features.
5. (Optional) Configure webhook URL for notifications.

== Frequently Asked Questions ==

= Do I need an AI API key to use the plugin? =

No. The free version works without any API keys. AI features (content generation, rewriting, auto-SEO) require a Claude or OpenAI API key and a Pro license.

= Which SEO plugins are supported? =

SEOPress, Yoast SEO, and Rank Math. The plugin auto-detects which one is active and writes meta data accordingly. It also writes to all three for maximum compatibility.

= Is the REST API secure? =

Yes. All write endpoints require JWT or Basic Auth. Rate limiting is configurable. Read-only endpoints (search, categories, status) are public by design.

= Can I use custom post types? =

Yes. Both `create-post` and `search-similar` accept a `post_type` parameter. Any registered public post type is supported.

= What is MCP? =

Model Context Protocol is an open standard for connecting AI models to external tools. With our MCP server, Claude Desktop, Cursor, and other AI agents can create posts, search content, and generate articles directly on your WordPress site.

= Are v1 endpoints still supported? =

Yes. Legacy endpoints under `api-post-creator/v1/` continue to work for backward compatibility.

== Screenshots ==

1. Admin page — Endpoints tab with copy-to-clipboard URLs
2. Admin page — Settings with AI provider configuration
3. Admin page — MCP Server setup with Claude Desktop config
4. Admin page — License activation

== Changelog ==

= 2.0.2 =
* Fix: License client agora aponta para license server self-hosted (wpraiz.com.br/Hotmart) em vez de LemonSqueezy
* Cleanup: Removidas referências a api.lemonsqueezy.com
* Add: URL do license server filtrável via 'wpraiz_license_server_url'

= 2.0.1 =
* Fix: Race condition no rate limiting (TTL nunca negativo)
* Fix: KSES filter sempre restaurado após wp_update_post (try/finally)
* Fix: JWT Authorization propagado corretamente em chamadas REST internas do MCP
* Fix: OpenRouter e DeepSeek retornam WP_Error em vez de string vazia em falhas
* Fix: WP_Filesystem null check antes de put_contents

= 2.0.0 =
* **Major rewrite** — Complete architecture overhaul with PSR-4 namespacing
* **New:** AI content generation with Claude and OpenAI (BYOK)
* **New:** AI post rewriting (improve SEO, fix grammar, change tone, expand, summarize)
* **New:** Auto-SEO — generate title and meta description via AI
* **New:** MCP Server with HTTP and STDIO transports
* **New:** MCP Tools, Resources, and Prompts for AI agents
* **New:** WP-CLI command `wp wpraiz-mcp serve` for Claude Desktop
* **New:** Bulk post creation (up to 50 per batch)
* **New:** Post update endpoint
* **New:** JWT authentication with configurable rate limiting
* **New:** Webhook system with HMAC signing and retry logic
* **New:** Admin UI with tabs (Endpoints, Settings, MCP, License)
* **Improved:** Similar post search using Levenshtein distance scoring
* **Improved:** SEO handler supports SEOPress, Yoast SEO, and Rank Math simultaneously
* **Improved:** Media handler with content-type validation
* **Improved:** Category auto-creation
* Backward compatible with v1 endpoints

= 1.5 =
* Added organized endpoints interface on admin page.
* New `search-similar-posts` endpoint for content similarity scoring.
* Compatibility with WordPress 6.7.2.
* SEO fields now written directly to all supported plugins.

= 1.4 =
* Added SEO metadata integration for SEOPress, Yoast SEO, and Rank Math.
* Introduced `/check-status` endpoint.
* Enhanced error handling and response messages.

= 1.3 =
* Improved compatibility with WordPress 6.6.
* Added support for automatic category creation.
* Enhanced image upload functionality.

= 1.2 =
* Added support for SEO metadata (SEOPress compatibility).
* Fixed image upload issues.

= 1.1 =
* Initial public release with basic post creation via REST API.

== Upgrade Notice ==

= 2.0.0 =
Major update with AI features, MCP server, and complete rewrite. All v1 endpoints remain compatible. Review the new Settings page after upgrading.

== Support ==
Visit [wpraiz.com.br](https://wpraiz.com.br) or open an issue on [GitHub](https://github.com/wpraiz/wpraiz-content-api-tool).
