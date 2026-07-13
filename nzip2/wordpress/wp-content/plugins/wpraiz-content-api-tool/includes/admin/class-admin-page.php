<?php
namespace WPRaiz\ContentAPI\Admin;

if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Admin page with tabs: Endpoints, Settings, MCP.
 */
class Admin_Page {

    public function __construct() {
        add_action( 'admin_menu', [ $this, 'add_menu' ] );
        add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_assets' ] );
        add_action( 'wp_ajax_wpraiz_save_settings', [ $this, 'ajax_save_settings' ] );
    }

    public function add_menu() {
        add_submenu_page(
            'tools.php',
            'WPRaiz Content API',
            'WPRaiz Content API',
            'manage_options',
            'wpraiz-content-api',
            [ $this, 'render_page' ]
        );
    }

    public function enqueue_assets( $hook ) {
        if ( $hook !== 'tools_page_wpraiz-content-api' ) return;

        wp_enqueue_style( 'wpraiz-admin', WPRAIZ_PLUGIN_URL . 'assets/css/admin.css', [], WPRAIZ_VERSION );
        wp_enqueue_script( 'wpraiz-admin', WPRAIZ_PLUGIN_URL . 'assets/js/admin.js', [ 'jquery' ], WPRAIZ_VERSION, true );

        wp_localize_script( 'wpraiz-admin', 'wpraizAdmin', [
            'ajaxUrl' => admin_url( 'admin-ajax.php' ),
            'nonce'   => wp_create_nonce( 'wpraiz_admin_nonce' ),
            'restUrl' => rest_url( 'wpraiz/v2/' ),
            'mcpUrl'  => rest_url( 'wpraiz-mcp/v1/mcp' ),
            'siteUrl' => get_site_url(),
            'isPro'   => wpraiz_is_pro(),
        ] );
    }

    public function render_page() {
        $settings   = wpraiz_get_settings();
        $is_pro     = wpraiz_is_pro();
        $license    = get_option( 'wpraiz_license_key', '' );
        $site_url   = get_site_url();
        $seo_plugin = \WPRaiz\ContentAPI\SEO_Handler::detect_plugin();
        $wp_path    = ABSPATH;
        ?>
        <div class="wrap wpraiz-wrap">
            <div class="wpraiz-header">
                <img src="<?php echo esc_url( WPRAIZ_PLUGIN_URL . 'assets/images/logo_wpraiz.png' ); ?>" width="200" alt="WPRaiz" />
                <h1>Content API Tool <span class="wpraiz-version">v<?php echo esc_html( WPRAIZ_VERSION ); ?></span></h1>
                <?php if ( $is_pro ): ?>
                    <span class="wpraiz-pro-badge">PRO</span>
                <?php endif; ?>
            </div>

            <!-- TABS -->
            <nav class="wpraiz-tabs">
                <a href="#endpoints" class="wpraiz-tab active" data-tab="endpoints">Endpoints</a>
                <a href="#settings" class="wpraiz-tab" data-tab="settings">Settings</a>
                <a href="#mcp" class="wpraiz-tab" data-tab="mcp">MCP Server</a>
                <a href="#license" class="wpraiz-tab" data-tab="license">License</a>
            </nav>

            <!-- TAB: ENDPOINTS -->
            <div class="wpraiz-panel" id="panel-endpoints">
                <h2>REST API Endpoints</h2>
                <p>Base URL: <code><?php echo esc_html( rest_url( 'wpraiz/v2/' ) ); ?></code></p>

                <table class="widefat fixed striped">
                    <thead><tr><th>Endpoint</th><th>Method</th><th>Auth</th><th>Tier</th><th>URL</th><th></th></tr></thead>
                    <tbody>
                        <?php
                        $endpoints = [
                            [ 'Create Post', 'POST', 'JWT/Basic', 'Free', 'create-post' ],
                            [ 'Update Post', 'POST', 'JWT/Basic', 'Free', 'update-post' ],
                            [ 'Bulk Create', 'POST', 'JWT/Basic', 'Pro', 'create-posts' ],
                            [ 'Generate Content (AI)', 'POST', 'JWT/Basic', 'Pro', 'generate-content' ],
                            [ 'Rewrite Post (AI)', 'POST', 'JWT/Basic', 'Pro', 'rewrite-post' ],
                            [ 'Search Similar', 'GET', 'Public', 'Free', 'search-similar?title=Example' ],
                            [ 'Categories', 'GET', 'Public', 'Free', 'categories' ],
                            [ 'Check Status', 'GET', 'Public', 'Free', 'check-status' ],
                            [ 'Auth Token (JWT)', 'POST', 'Credentials', 'Free', 'auth/token' ],
                            [ 'MCP Server', 'POST', 'JWT/Basic', 'Pro', '../wpraiz-mcp/v1/mcp' ],
                        ];
                        foreach ( $endpoints as $ep ):
                            $full_url = rest_url( 'wpraiz/v2/' . $ep[4] );
                            $tier_class = $ep[3] === 'Pro' ? 'wpraiz-tier-pro' : 'wpraiz-tier-free';
                        ?>
                        <tr>
                            <td><strong><?php echo esc_html( $ep[0] ); ?></strong></td>
                            <td><code><?php echo esc_html( $ep[1] ); ?></code></td>
                            <td><?php echo esc_html( $ep[2] ); ?></td>
                            <td><span class="<?php echo $tier_class; ?>"><?php echo esc_html( $ep[3] ); ?></span></td>
                            <td><input type="text" value="<?php echo esc_url( $full_url ); ?>" readonly class="wpraiz-url-input" /></td>
                            <td><button class="button wpraiz-copy-btn" data-url="<?php echo esc_url( $full_url ); ?>">Copy</button></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>

                <h3 style="margin-top:24px;">Legacy v1 Endpoints (backward compatible)</h3>
                <p><code><?php echo esc_html( rest_url( 'api-post-creator/v1/' ) ); ?></code> — Still supported.</p>

                <h3 style="margin-top:24px;">Example Payload (create-post)</h3>
                <pre>{
    "title": "My Article Title",
    "content": "&lt;h2&gt;Introduction&lt;/h2&gt;&lt;p&gt;Content here...&lt;/p&gt;",
    "status": "draft",
    "post_type": "post",
    "primary_category": "Technology",
    "tags": ["ai", "wordpress", "automation"],
    "excerpt": "A brief summary of the article.",
    "seo_title": "SEO Optimized Title (max 60 chars)",
    "seo_desc": "Meta description for search engines (max 155 chars)",
    "image_url": "https://example.com/image.jpg",
    "custom_meta": { "custom_field": "value" },
    "auto_seo": true
}</pre>
            </div>

            <!-- TAB: SETTINGS -->
            <div class="wpraiz-panel" id="panel-settings" style="display:none;">
                <h2>Settings</h2>
                <form id="wpraiz-settings-form">
                    <table class="form-table">
                        <tr>
                            <th>AI Provider</th>
                            <td>
                                <select name="ai_provider" id="wpraiz-ai-provider">
                                    <option value="" <?php selected( $settings['ai_provider'], '' ); ?>>Auto-detect</option>
                                    <option value="openrouter" <?php selected( $settings['ai_provider'], 'openrouter' ); ?>>OpenRouter (Free models available!)</option>
                                    <option value="deepseek" <?php selected( $settings['ai_provider'], 'deepseek' ); ?>>DeepSeek (Low cost)</option>
                                    <option value="claude" <?php selected( $settings['ai_provider'], 'claude' ); ?>>Claude (Anthropic)</option>
                                    <option value="openai" <?php selected( $settings['ai_provider'], 'openai' ); ?>>OpenAI (GPT)</option>
                                </select>
                                <p class="description">OpenRouter offers free models — no API key needed to start!</p>
                            </td>
                        </tr>
                        <tr>
                            <th>Claude API Key</th>
                            <td><input type="password" name="claude_api_key" value="<?php echo esc_attr( $settings['claude_api_key'] ); ?>" class="regular-text" placeholder="sk-ant-..." /></td>
                        </tr>
                        <tr>
                            <th>OpenAI API Key</th>
                            <td><input type="password" name="openai_api_key" value="<?php echo esc_attr( $settings['openai_api_key'] ); ?>" class="regular-text" placeholder="sk-..." /></td>
                        </tr>
                        <tr>
                            <th>DeepSeek API Key</th>
                            <td><input type="password" name="deepseek_api_key" value="<?php echo esc_attr( $settings['deepseek_api_key'] ?? '' ); ?>" class="regular-text" placeholder="sk-..." />
                            <p class="description"><a href="https://platform.deepseek.com/api_keys" target="_blank">Get DeepSeek API key</a> — ~$0.28/1M tokens</p></td>
                        </tr>
                        <tr>
                            <th>OpenRouter API Key</th>
                            <td><input type="password" name="openrouter_api_key" value="<?php echo esc_attr( $settings['openrouter_api_key'] ?? '' ); ?>" class="regular-text" placeholder="sk-or-..." />
                            <p class="description">Optional — free models work without key. <a href="https://openrouter.ai/keys" target="_blank">Get key for higher limits</a></p></td>
                        </tr>
                        <tr>
                            <th>Auto-SEO</th>
                            <td><label><input type="checkbox" name="auto_seo" value="1" <?php checked( $settings['auto_seo'] ); ?> /> Generate SEO title/description via AI when not provided</label></td>
                        </tr>
                        <tr>
                            <th>Webhook URL</th>
                            <td><input type="url" name="webhook_url" value="<?php echo esc_url( $settings['webhook_url'] ); ?>" class="regular-text" placeholder="https://..." /></td>
                        </tr>
                        <tr>
                            <th>Webhook Events</th>
                            <td>
                                <?php
                                $all_events = [ 'post_created', 'bulk_completed', 'post_rewritten' ];
                                foreach ( $all_events as $evt ):
                                ?>
                                <label style="display:block;margin-bottom:4px;">
                                    <input type="checkbox" name="webhook_events[]" value="<?php echo esc_attr( $evt ); ?>"
                                        <?php checked( in_array( $evt, $settings['webhook_events'] ?? [] ) ); ?> />
                                    <?php echo esc_html( $evt ); ?>
                                </label>
                                <?php endforeach; ?>
                            </td>
                        </tr>
                        <tr>
                            <th>Rate Limit</th>
                            <td><input type="number" name="rate_limit" value="<?php echo (int) $settings['rate_limit']; ?>" min="0" max="1000" /> <span class="description">requests per minute (0 = unlimited)</span></td>
                        </tr>
                    </table>
                    <p><button type="submit" class="button button-primary">Save Settings</button> <span id="wpraiz-save-status"></span></p>
                </form>

                <h3 style="margin-top:24px;">Status</h3>
                <ul>
                    <li>SEO Plugin: <strong><?php echo esc_html( $seo_plugin ?: 'None detected' ); ?></strong></li>
                    <li>WordPress: <strong><?php echo esc_html( get_bloginfo( 'version' ) ); ?></strong></li>
                    <li>PHP: <strong><?php echo esc_html( PHP_VERSION ); ?></strong></li>
                    <li>Pro: <strong><?php echo $is_pro ? 'Active' : 'Inactive'; ?></strong></li>
                </ul>
            </div>

            <!-- TAB: MCP -->
            <div class="wpraiz-panel" id="panel-mcp" style="display:none;">
                <h2>MCP Server — Model Context Protocol</h2>
                <p>Connect AI agents (Claude Desktop, Cursor, etc.) directly to your WordPress site.</p>

                <h3>HTTP Transport</h3>
                <p>Endpoint: <code id="mcp-http-url"><?php echo esc_url( rest_url( 'wpraiz-mcp/v1/mcp' ) ); ?></code>
                    <button class="button wpraiz-copy-btn" data-url="<?php echo esc_url( rest_url( 'wpraiz-mcp/v1/mcp' ) ); ?>">Copy</button>
                </p>
                <p>Authenticate with JWT Bearer token or Basic Auth (Application Password).</p>

                <h3>STDIO Transport (WP-CLI)</h3>
                <p>Run: <code>wp wpraiz-mcp serve --path=<?php echo esc_html( $wp_path ); ?> --user=1</code></p>

                <h3>Claude Desktop Config</h3>
                <p>Add to <code>claude_desktop_config.json</code>:</p>
                <pre id="mcp-config">{
    "mcpServers": {
        "wpraiz": {
            "command": "wp",
            "args": ["wpraiz-mcp", "serve", "--path=<?php echo esc_html( $wp_path ); ?>", "--user=1"]
        }
    }
}</pre>
                <button class="button wpraiz-copy-btn" data-url="" onclick="wpraizCopyText(document.getElementById('mcp-config').textContent)">Copy Config</button>

                <h3 style="margin-top:24px;">Available Tools</h3>
                <ul>
                    <li><code>create_post</code> — Create posts with full metadata</li>
                    <li><code>update_post</code> — Update existing posts</li>
                    <li><code>search_similar</code> — Find similar content</li>
                    <li><code>get_categories</code> — List all categories</li>
                    <li><code>generate_content</code> — AI content generation (Pro)</li>
                    <li><code>rewrite_post</code> — AI content rewrite (Pro)</li>
                    <li><code>bulk_create</code> — Batch post creation (Pro)</li>
                </ul>

                <h3>Available Prompts (Workflows)</h3>
                <ul>
                    <li><code>publish_seo_article</code> — Full article generation + publish</li>
                    <li><code>content_series</code> — Generate a series of related articles</li>
                    <li><code>seo_audit</code> — Audit posts for SEO issues</li>
                    <li><code>refresh_old_content</code> — Rewrite old posts</li>
                    <li><code>internal_linking</code> — Suggest internal links for a post</li>
                </ul>
            </div>

            <!-- TAB: LICENSE -->
            <div class="wpraiz-panel" id="panel-license" style="display:none;">
                <h2>License</h2>
                <?php if ( $is_pro ): ?>
                    <div class="notice notice-success inline"><p>Pro license active: <code><?php echo esc_html( $license ); ?></code></p></div>
                    <p><button class="button" id="wpraiz-deactivate-license">Deactivate</button></p>
                <?php else: ?>
                    <p>Enter your WPRaiz Pro license key to unlock AI features, MCP server, bulk creation, and more.</p>
                    <p>
                        <input type="text" id="wpraiz-license-input" placeholder="Your license key" class="regular-text" />
                        <button class="button button-primary" id="wpraiz-activate-license">Activate</button>
                    </p>
                    <p><a href="<?php echo esc_url( apply_filters( 'wpraiz_pro_url', 'https://wpraiz.lemonsqueezy.com' ) ); ?>" target="_blank" class="button">Get WPRaiz Pro →</a></p>
                    <p class="description">Don't have a store yet? Set the URL via <code>add_filter('wpraiz_pro_url', ...)</code> or update it in the plugin code.</p>
                <?php endif; ?>
            </div>

            <div class="wpraiz-footer">
                <a href="https://wpraiz.com.br" target="_blank">WPRaiz</a> ·
                <a href="https://youtube.com/wpraiz" target="_blank">YouTube</a> ·
                <a href="https://github.com/wpraiz" target="_blank">GitHub</a>
            </div>
        </div>
        <?php
    }

    /**
     * Save settings via AJAX.
     */
    public function ajax_save_settings() {
        check_ajax_referer( 'wpraiz_admin_nonce', 'nonce' );

        if ( ! current_user_can( 'manage_options' ) ) {
            wp_send_json_error( [ 'message' => 'Unauthorized.' ] );
        }

        $settings = [
            'ai_provider'        => sanitize_key( $_POST['ai_provider'] ?? '' ),
            'openai_api_key'     => sanitize_text_field( $_POST['openai_api_key'] ?? '' ),
            'claude_api_key'     => sanitize_text_field( $_POST['claude_api_key'] ?? '' ),
            'deepseek_api_key'   => sanitize_text_field( $_POST['deepseek_api_key'] ?? '' ),
            'openrouter_api_key' => sanitize_text_field( $_POST['openrouter_api_key'] ?? '' ),
            'auto_seo'           => ! empty( $_POST['auto_seo'] ),
            'webhook_url'        => esc_url_raw( $_POST['webhook_url'] ?? '' ),
            'webhook_events'     => array_map( 'sanitize_key', (array) ( $_POST['webhook_events'] ?? [] ) ),
            'rate_limit'         => (int) ( $_POST['rate_limit'] ?? 60 ),
        ];

        update_option( 'wpraiz_settings', $settings );

        wp_send_json_success( [ 'message' => 'Settings saved!' ] );
    }
}
