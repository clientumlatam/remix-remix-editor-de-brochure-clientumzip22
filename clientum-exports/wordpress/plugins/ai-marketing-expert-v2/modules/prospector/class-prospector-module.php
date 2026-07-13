<?php
/**
 * AI Client Prospector Module.
 *
 * B2B prospecting, MEDDIC qualification and outreach automation
 * for the Patagonia region (Río Negro & Neuquén).
 *
 * @package WPSpace\AiMarketingExpert\Modules\Prospector
 */

namespace WPSpace\AiMarketingExpert\Modules\Prospector;

use WPSpace\AiMarketingExpert\Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class ProspectorModule extends Module {

	// ── Identity ─────────────────────────────────────────────────────── //

	public function get_id(): string        { return 'prospector'; }
	public function get_name(): string      { return __( 'AI Client Prospector', 'ai-marketing-expert' ); }
	public function get_description(): string {
		return __( 'B2B prospecting, MEDDIC qualification and outreach automation for Patagonia.', 'ai-marketing-expert' );
	}
	public function get_icon(): string    { return 'search'; }
	public function get_version(): string { return '2.0.0'; }

	// ── Bootstrap ────────────────────────────────────────────────────── //

	public function init(): void {
		add_action( 'admin_menu',             array( $this, 'add_admin_page' ), 20 );
		add_action( 'admin_enqueue_scripts',  array( $this, 'enqueue_assets' ) );
		add_action( 'rest_api_init',          array( $this, 'register_routes' ) );
	}

	// ── Admin page ───────────────────────────────────────────────────── //

	public function add_admin_page(): void {
		add_submenu_page(
			'ai-marketing-expert',
			__( 'AI Client Prospector', 'ai-marketing-expert' ),
			__( '🔍 Prospector B2B', 'ai-marketing-expert' ),
			'manage_options',
			'aime-prospector',
			array( $this, 'render_page' )
		);
	}

	public function enqueue_assets( string $hook ): void {
		if ( 'ai-marketing-expert_page_aime-prospector' !== $hook ) {
			return;
		}

		$base = plugin_dir_url( dirname( dirname( __FILE__ ) ) );

		wp_enqueue_style(
			'aime-prospector',
			$base . 'assets/prospector/prospector.css',
			array(),
			'2.0.0'
		);

		wp_enqueue_script(
			'aime-prospector',
			$base . 'assets/prospector/prospector.js',
			array( 'wp-api-fetch' ),
			'2.0.0',
			true
		);

		wp_localize_script(
			'aime-prospector',
			'aimeProspector',
			array(
				'restUrl'   => esc_url_raw( rest_url( 'aime/v1/prospector/' ) ),
				'nonce'     => wp_create_nonce( 'wp_rest' ),
				'adminUrl'  => admin_url(),
				'username'  => wp_get_current_user()->display_name,
				'geminiKey' => defined( 'GEMINI_API_KEY' ) ? GEMINI_API_KEY : ( getenv( 'GEMINI_API_KEY' ) ?: '' ),
			)
		);
	}

	public function render_page(): void {
		require_once __DIR__ . '/views/page-prospector.php';
	}

	// ── REST routes (delegated to controller) ────────────────────────── //

	public function register_routes(): void {
		$controller = new ProspectorRestController();
		$controller->register_routes();
	}

	// ── Database ─────────────────────────────────────────────────────── //

	public function create_tables( string $charset_collate ): void {
		global $wpdb;

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		$sql = "CREATE TABLE {$wpdb->prefix}aime_prospector_deals (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			company varchar(255) NOT NULL DEFAULT '',
			amount decimal(15,2) NOT NULL DEFAULT 180000,
			stage varchar(50) NOT NULL DEFAULT 'leads',
			industry varchar(100) NOT NULL DEFAULT '',
			city varchar(100) NOT NULL DEFAULT '',
			address varchar(255) NOT NULL DEFAULT '',
			phone varchar(100) NOT NULL DEFAULT '',
			contact varchar(255) NOT NULL DEFAULT '',
			contact_email varchar(255) NOT NULL DEFAULT '',
			contact_linkedin varchar(255) NOT NULL DEFAULT '',
			contact_title varchar(255) NOT NULL DEFAULT '',
			pain_point text,
			buying_signals longtext,
			fit_score tinyint(2) NOT NULL DEFAULT 5,
			fit_reasoning text,
			guiacores_url varchar(500) NOT NULL DEFAULT '',
			rating varchar(10) NOT NULL DEFAULT '',
			price_level varchar(10) NOT NULL DEFAULT '',
			distance_km decimal(5,2) DEFAULT NULL,
			meddic_metrics tinyint(1) NOT NULL DEFAULT 3,
			meddic_buyer tinyint(1) NOT NULL DEFAULT 3,
			meddic_criteria tinyint(1) NOT NULL DEFAULT 3,
			meddic_process tinyint(1) NOT NULL DEFAULT 3,
			meddic_pain tinyint(1) NOT NULL DEFAULT 3,
			meddic_champion tinyint(1) NOT NULL DEFAULT 3,
			meddic_score tinyint(3) NOT NULL DEFAULT 40,
			meddic_red_flags text,
			meddic_next_actions longtext,
			outreach_email1 longtext,
			outreach_email2 longtext,
			outreach_email3 longtext,
			outreach_linkedin longtext,
			outreach_phone_script longtext,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY (id),
			KEY idx_stage (stage),
			KEY idx_industry (industry),
			KEY idx_city (city),
			KEY idx_created (created_at)
		) {$charset_collate};";

		dbDelta( $sql );
	}
}

// Self-register via the module-load hook.
add_action(
	'aime_load_module_prospector',
	function ( \WPSpace\AiMarketingExpert\ModuleManager $manager ) {
		$manager->register( new ProspectorModule() );
	}
);
