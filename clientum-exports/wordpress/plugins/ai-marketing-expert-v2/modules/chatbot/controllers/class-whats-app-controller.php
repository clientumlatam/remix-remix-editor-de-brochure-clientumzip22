<?php
/**
 * WhatsApp Controller — bridges the Node.js Baileys service with the
 * existing AI chatbot, plus admin-facing pairing/status endpoints.
 *
 * @package WPSpace\AiMarketingExpert\Modules\Chatbot\Controllers
 */

// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching

namespace WPSpace\AiMarketingExpert\Modules\Chatbot\Controllers;

use WPSpace\AiMarketingExpert\Modules\Chatbot\Services\ChatService;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WhatsAppController {

	private const SETTINGS_OPTION = 'aime_whatsapp_settings';

	/* ══════════════════════════════════════════════════════
	 *  ADMIN: bridge status / QR pairing / connect / logout
	 * ══════════════════════════════════════════════════════ */

	public function status( \WP_REST_Request $request ): \WP_REST_Response {
		$result = $this->bridge_request( 'GET', '/status' );
		if ( is_wp_error( $result ) ) {
			return new \WP_REST_Response( array( 'status' => 'unreachable', 'message' => $result->get_error_message() ), 200 );
		}
		return new \WP_REST_Response( $result );
	}

	public function qr( \WP_REST_Request $request ): \WP_REST_Response {
		$result = $this->bridge_request( 'GET', '/qr' );
		if ( is_wp_error( $result ) ) {
			return new \WP_REST_Response( array( 'status' => 'unreachable', 'message' => $result->get_error_message() ), 200 );
		}
		return new \WP_REST_Response( $result );
	}

	public function connect( \WP_REST_Request $request ): \WP_REST_Response {
		$result = $this->bridge_request( 'POST', '/connect' );
		if ( is_wp_error( $result ) ) {
			return new \WP_REST_Response( array( 'message' => $result->get_error_message() ), 502 );
		}
		return new \WP_REST_Response( $result );
	}

	public function logout( \WP_REST_Request $request ): \WP_REST_Response {
		$result = $this->bridge_request( 'POST', '/logout' );
		if ( is_wp_error( $result ) ) {
			return new \WP_REST_Response( array( 'message' => $result->get_error_message() ), 502 );
		}
		return new \WP_REST_Response( $result );
	}

	/* ── Settings: which bot answers WhatsApp messages ──── */

	public function get_settings( \WP_REST_Request $request ): \WP_REST_Response {
		return new \WP_REST_Response( $this->get_whatsapp_settings() );
	}

	public function save_settings( \WP_REST_Request $request ): \WP_REST_Response {
		$params = $request->get_json_params();
		$bot_id = absint( $params['bot_id'] ?? 0 );

		if ( $bot_id ) {
			global $wpdb;
			$exists = $wpdb->get_var( $wpdb->prepare(
				"SELECT id FROM {$wpdb->prefix}aime_chatbot_bots WHERE id = %d",
				$bot_id
			) );
			if ( ! $exists ) {
				return new \WP_REST_Response( array( 'message' => __( 'Bot not found.', 'ai-marketing-expert' ) ), 404 );
			}
		}

		update_option( self::SETTINGS_OPTION, array( 'bot_id' => $bot_id ), false );

		return new \WP_REST_Response( $this->get_whatsapp_settings() );
	}

	private function get_whatsapp_settings(): array {
		$settings = get_option( self::SETTINGS_OPTION, array() );
		return array( 'bot_id' => absint( $settings['bot_id'] ?? 0 ) );
	}

	/* ══════════════════════════════════════════════════════
	 *  WEBHOOK: inbound WhatsApp message from the bridge
	 * ══════════════════════════════════════════════════════ */

	public function incoming( \WP_REST_Request $request ) {
		$secret = (string) $request->get_header( 'x-webhook-secret' );
		$expected = (string) getenv( 'WP_WEBHOOK_SECRET' );

		if ( ! $expected || ! hash_equals( $expected, $secret ) ) {
			return new \WP_REST_Response( array( 'error' => 'Unauthorized' ), 401 );
		}

		$params  = $request->get_json_params();
		$phone   = $this->sanitize_phone( $params['phone'] ?? '' );
		$name    = sanitize_text_field( $params['name'] ?? '' );
		$message = sanitize_textarea_field( $params['message'] ?? '' );

		if ( ! $phone || '' === $message ) {
			return new \WP_REST_Response( array( 'error' => 'phone and message are required' ), 400 );
		}

		$bot = $this->resolve_whatsapp_bot();
		if ( ! $bot ) {
			aime_log( 'WhatsApp message received but no active chatbot is configured to answer it.', 'warning', 'chatbot' );
			return new \WP_REST_Response( array( 'reply' => null ) );
		}

		global $wpdb;
		$p                   = $wpdb->prefix;
		$conversations_table = "{$p}aime_chatbot_conversations";
		$messages_table      = "{$p}aime_chatbot_messages";
		$now                 = current_time( 'mysql', true );

		// One ongoing conversation per (bot, WhatsApp phone) — phone is a stable,
		// non-guessable visitor_id here (unlike the web widget's client-generated ID),
		// so there is no token/ownership check to perform.
		$conversation_id = (int) $wpdb->get_var( $wpdb->prepare(
			"SELECT id FROM {$conversations_table}
			 WHERE bot_id = %d AND visitor_id = %s AND source = 'whatsapp' AND status IN ('active','human_takeover')
			 ORDER BY created_at DESC LIMIT 1",
			$bot->id,
			$phone
		) );

		if ( ! $conversation_id ) {
			$wpdb->insert( $conversations_table, array(
				'bot_id'       => $bot->id,
				'visitor_id'   => $phone,
				'visitor_name' => $name,
				'status'       => 'active',
				'source'       => 'whatsapp',
				'started_at'   => $now,
				'created_at'   => $now,
				'updated_at'   => $now,
			) );
			$conversation_id = (int) $wpdb->insert_id;
		} elseif ( $name ) {
			$wpdb->update( $conversations_table, array( 'visitor_name' => $name ), array( 'id' => $conversation_id ) );
		}

		$wpdb->insert( $messages_table, array(
			'conversation_id' => $conversation_id,
			'sender_type'     => 'visitor',
			'sender_id'       => $phone,
			'content'         => $message,
			'content_type'    => 'text',
			'created_at'      => $now,
		) );

		$wpdb->update( $conversations_table, array( 'updated_at' => $now ), array( 'id' => $conversation_id ) );

		// Reload with bot columns joined, the same shape ChatService expects.
		$conversation = $wpdb->get_row( $wpdb->prepare(
			"SELECT c.*, b.system_prompt, b.banned_words, b.knowledge_config, b.name AS bot_name
			 FROM {$conversations_table} c
			 LEFT JOIN {$p}aime_chatbot_bots b ON b.id = c.bot_id
			 WHERE c.id = %d",
			$conversation_id
		) );

		if ( ! $conversation ) {
			return new \WP_REST_Response( array( 'reply' => null ), 200 );
		}

		if ( 'human_takeover' === $conversation->status ) {
			return new \WP_REST_Response( array( 'reply' => null ) );
		}

		$chat_service = new ChatService();
		$ai_result    = $chat_service->process_message( $conversation, $message );

		if ( empty( $ai_result['success'] ) ) {
			return new \WP_REST_Response( array(
				'reply' => __( "Sorry, I'm having trouble right now. Please try again shortly.", 'ai-marketing-expert' ),
			) );
		}

		return new \WP_REST_Response( array( 'reply' => $ai_result['content'] ) );
	}

	/* ── Resolve which bot answers WhatsApp ─────────────── */

	private function resolve_whatsapp_bot() {
		global $wpdb;
		$settings = $this->get_whatsapp_settings();

		if ( $settings['bot_id'] ) {
			$bot = $wpdb->get_row( $wpdb->prepare(
				"SELECT * FROM {$wpdb->prefix}aime_chatbot_bots WHERE id = %d AND status = 'active'",
				$settings['bot_id']
			) );
			if ( $bot ) {
				return $bot;
			}
		}

		// Fall back to the first active bot so WhatsApp works out of the box.
		return $wpdb->get_row( "SELECT * FROM {$wpdb->prefix}aime_chatbot_bots WHERE status = 'active' ORDER BY id ASC LIMIT 1" );
	}

	/* ── Bridge HTTP client ──────────────────────────────── */

	private function bridge_request( string $method, string $path, array $body = array() ) {
		$base  = getenv( 'WHATSAPP_BRIDGE_URL' ) ?: 'http://127.0.0.1:3300';
		$token = getenv( 'WHATSAPP_BRIDGE_TOKEN' ) ?: '';

		$args = array(
			'method'  => $method,
			'timeout' => 10,
			'headers' => array( 'X-Bridge-Token' => $token ),
		);

		if ( 'GET' !== $method ) {
			$args['headers']['Content-Type'] = 'application/json';
			$args['body'] = wp_json_encode( $body );
		}

		$response = wp_remote_request( $base . $path, $args );

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$code = wp_remote_retrieve_response_code( $response );
		$data = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( $code >= 400 ) {
			return new \WP_Error( 'bridge_error', $data['error'] ?? __( 'WhatsApp bridge error.', 'ai-marketing-expert' ) );
		}

		return is_array( $data ) ? $data : array();
	}

	private function sanitize_phone( $value ): string {
		return preg_replace( '/[^0-9]/', '', (string) $value );
	}
}
