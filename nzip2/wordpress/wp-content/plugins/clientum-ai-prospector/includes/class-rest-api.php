<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class CAP_REST_API {

    const NS = 'clientum/v1';

    public static function register_routes() {
        /* ── Auth ───────────────────────────────────────────────────────── */
        register_rest_route( self::NS, '/auth/register', [
            'methods'             => 'POST',
            'callback'            => [ __CLASS__, 'auth_register' ],
            'permission_callback' => '__return_true',
        ] );
        register_rest_route( self::NS, '/auth/login', [
            'methods'             => 'POST',
            'callback'            => [ __CLASS__, 'auth_login' ],
            'permission_callback' => '__return_true',
        ] );
        register_rest_route( self::NS, '/auth/logout', [
            'methods'             => 'POST',
            'callback'            => [ __CLASS__, 'auth_logout' ],
            'permission_callback' => '__return_true',
        ] );
        register_rest_route( self::NS, '/auth/me', [
            'methods'             => 'GET',
            'callback'            => [ __CLASS__, 'auth_me' ],
            'permission_callback' => '__return_true',
        ] );

        /* ── Generate (Gemini AI) ──────────────────────────────────────── */
        register_rest_route( self::NS, '/generate', [
            'methods'             => 'POST',
            'callback'            => [ __CLASS__, 'generate' ],
            'permission_callback' => [ __CLASS__, 'require_auth' ],
        ] );

        /* ── Scrape ─────────────────────────────────────────────────────── */
        register_rest_route( self::NS, '/scrape-places', [
            'methods'             => 'POST',
            'callback'            => [ __CLASS__, 'scrape_places' ],
            'permission_callback' => [ __CLASS__, 'require_auth' ],
        ] );

        /* ── Deals ──────────────────────────────────────────────────────── */
        register_rest_route( self::NS, '/deals', [
            [ 'methods' => 'GET',  'callback' => [ __CLASS__, 'deals_list' ],   'permission_callback' => [ __CLASS__, 'require_auth' ] ],
            [ 'methods' => 'POST', 'callback' => [ __CLASS__, 'deals_create' ], 'permission_callback' => [ __CLASS__, 'require_auth' ] ],
        ] );
        register_rest_route( self::NS, '/deals/(?P<id>\d+)', [
            [ 'methods' => 'GET',    'callback' => [ __CLASS__, 'deals_get' ],    'permission_callback' => [ __CLASS__, 'require_auth' ] ],
            [ 'methods' => 'PUT',    'callback' => [ __CLASS__, 'deals_update' ], 'permission_callback' => [ __CLASS__, 'require_auth' ] ],
            [ 'methods' => 'DELETE', 'callback' => [ __CLASS__, 'deals_delete' ], 'permission_callback' => [ __CLASS__, 'require_auth' ] ],
        ] );

        /* ── Activities ─────────────────────────────────────────────────── */
        register_rest_route( self::NS, '/activities', [
            [ 'methods' => 'GET',  'callback' => [ __CLASS__, 'activities_list' ],   'permission_callback' => [ __CLASS__, 'require_auth' ] ],
            [ 'methods' => 'POST', 'callback' => [ __CLASS__, 'activities_create' ], 'permission_callback' => [ __CLASS__, 'require_auth' ] ],
        ] );
        register_rest_route( self::NS, '/activities/(?P<id>\d+)', [
            [ 'methods' => 'PUT',    'callback' => [ __CLASS__, 'activities_update' ], 'permission_callback' => [ __CLASS__, 'require_auth' ] ],
            [ 'methods' => 'DELETE', 'callback' => [ __CLASS__, 'activities_delete' ], 'permission_callback' => [ __CLASS__, 'require_auth' ] ],
        ] );

        /* ── Contacts ───────────────────────────────────────────────────── */
        register_rest_route( self::NS, '/contacts', [
            [ 'methods' => 'GET',  'callback' => [ __CLASS__, 'contacts_list' ],   'permission_callback' => [ __CLASS__, 'require_auth' ] ],
            [ 'methods' => 'POST', 'callback' => [ __CLASS__, 'contacts_create' ], 'permission_callback' => [ __CLASS__, 'require_auth' ] ],
        ] );
        register_rest_route( self::NS, '/contacts/(?P<id>\d+)', [
            [ 'methods' => 'GET',    'callback' => [ __CLASS__, 'contacts_get' ],    'permission_callback' => [ __CLASS__, 'require_auth' ] ],
            [ 'methods' => 'PUT',    'callback' => [ __CLASS__, 'contacts_update' ], 'permission_callback' => [ __CLASS__, 'require_auth' ] ],
            [ 'methods' => 'DELETE', 'callback' => [ __CLASS__, 'contacts_delete' ], 'permission_callback' => [ __CLASS__, 'require_auth' ] ],
        ] );

        /* ── Templates ──────────────────────────────────────────────────── */
        register_rest_route( self::NS, '/templates', [
            [ 'methods' => 'GET',  'callback' => [ __CLASS__, 'templates_list' ],   'permission_callback' => [ __CLASS__, 'require_auth' ] ],
            [ 'methods' => 'POST', 'callback' => [ __CLASS__, 'templates_save' ],   'permission_callback' => [ __CLASS__, 'require_auth' ] ],
        ] );
        register_rest_route( self::NS, '/templates/(?P<id>\d+)', [
            [ 'methods' => 'DELETE', 'callback' => [ __CLASS__, 'templates_delete' ], 'permission_callback' => [ __CLASS__, 'require_auth' ] ],
        ] );

        /* ── Leads (Patagonia Explorer saved) ──────────────────────────── */
        register_rest_route( self::NS, '/leads', [
            [ 'methods' => 'GET',  'callback' => [ __CLASS__, 'leads_list' ],   'permission_callback' => [ __CLASS__, 'require_auth' ] ],
            [ 'methods' => 'POST', 'callback' => [ __CLASS__, 'leads_create' ], 'permission_callback' => [ __CLASS__, 'require_auth' ] ],
        ] );
        register_rest_route( self::NS, '/leads/(?P<id>\d+)', [
            [ 'methods' => 'PUT',    'callback' => [ __CLASS__, 'leads_update' ], 'permission_callback' => [ __CLASS__, 'require_auth' ] ],
            [ 'methods' => 'DELETE', 'callback' => [ __CLASS__, 'leads_delete' ], 'permission_callback' => [ __CLASS__, 'require_auth' ] ],
        ] );

        /* ── API Keys (por usuario) ─────────────────────────────────────── */
        register_rest_route( self::NS, '/api-keys/(?P<service>[a-z_]+)', [
            [ 'methods' => 'GET', 'callback' => [ __CLASS__, 'apikey_get' ],  'permission_callback' => [ __CLASS__, 'require_auth' ] ],
            [ 'methods' => 'POST','callback' => [ __CLASS__, 'apikey_save' ], 'permission_callback' => [ __CLASS__, 'require_auth' ] ],
        ] );

        /* ── Enrich contact (Hunter.io) ───────────────────────────────────── */
        register_rest_route( self::NS, '/enrich-contact', [
            'methods'             => 'POST',
            'callback'            => [ __CLASS__, 'enrich_contact' ],
            'permission_callback' => [ __CLASS__, 'require_auth' ],
        ] );

        /* ── Products (Productos) ──────────────────────────────────────── */
        register_rest_route( self::NS, '/products', [
            [ 'methods' => 'GET',  'callback' => [ __CLASS__, 'products_list' ],   'permission_callback' => [ __CLASS__, 'require_auth' ] ],
            [ 'methods' => 'POST', 'callback' => [ __CLASS__, 'products_create' ], 'permission_callback' => [ __CLASS__, 'require_auth' ] ],
        ] );
        register_rest_route( self::NS, '/products/(?P<id>\d+)', [
            [ 'methods' => 'PUT',    'callback' => [ __CLASS__, 'products_update' ], 'permission_callback' => [ __CLASS__, 'require_auth' ] ],
            [ 'methods' => 'DELETE', 'callback' => [ __CLASS__, 'products_delete' ], 'permission_callback' => [ __CLASS__, 'require_auth' ] ],
        ] );

        /* ── Sellers (Vendedores) ─────────────────────────────────────────── */
        register_rest_route( self::NS, '/sellers', [
            [ 'methods' => 'GET',  'callback' => [ __CLASS__, 'sellers_list' ],   'permission_callback' => [ __CLASS__, 'require_auth' ] ],
            [ 'methods' => 'POST', 'callback' => [ __CLASS__, 'sellers_create' ], 'permission_callback' => [ __CLASS__, 'require_auth' ] ],
        ] );
        register_rest_route( self::NS, '/sellers/(?P<id>\d+)', [
            [ 'methods' => 'PUT',    'callback' => [ __CLASS__, 'sellers_update' ], 'permission_callback' => [ __CLASS__, 'require_auth' ] ],
            [ 'methods' => 'DELETE', 'callback' => [ __CLASS__, 'sellers_delete' ], 'permission_callback' => [ __CLASS__, 'require_auth' ] ],
        ] );

        /* ── Branches (Sucursales) ────────────────────────────────────────── */
        register_rest_route( self::NS, '/branches', [
            [ 'methods' => 'GET',  'callback' => [ __CLASS__, 'branches_list' ],   'permission_callback' => [ __CLASS__, 'require_auth' ] ],
            [ 'methods' => 'POST', 'callback' => [ __CLASS__, 'branches_create' ], 'permission_callback' => [ __CLASS__, 'require_auth' ] ],
        ] );
        register_rest_route( self::NS, '/branches/(?P<id>\d+)', [
            [ 'methods' => 'PUT',    'callback' => [ __CLASS__, 'branches_update' ], 'permission_callback' => [ __CLASS__, 'require_auth' ] ],
            [ 'methods' => 'DELETE', 'callback' => [ __CLASS__, 'branches_delete' ], 'permission_callback' => [ __CLASS__, 'require_auth' ] ],
        ] );

        /* ── Conversations (Bot WhatsApp) ────────────────────────────────── */
        register_rest_route( self::NS, '/conversations', [
            [ 'methods' => 'GET',  'callback' => [ __CLASS__, 'conversations_list' ],   'permission_callback' => [ __CLASS__, 'require_auth' ] ],
            [ 'methods' => 'POST', 'callback' => [ __CLASS__, 'conversations_create' ], 'permission_callback' => [ __CLASS__, 'require_auth' ] ],
        ] );
        register_rest_route( self::NS, '/conversations/(?P<id>\d+)', [
            [ 'methods' => 'PUT',    'callback' => [ __CLASS__, 'conversations_update' ], 'permission_callback' => [ __CLASS__, 'require_auth' ] ],
            [ 'methods' => 'DELETE', 'callback' => [ __CLASS__, 'conversations_delete' ], 'permission_callback' => [ __CLASS__, 'require_auth' ] ],
        ] );

        /* ── Bot settings ───────────────────────────────────────────────── */
        register_rest_route( self::NS, '/bot-settings', [
            [ 'methods' => 'GET',  'callback' => [ __CLASS__, 'bot_settings_get' ],  'permission_callback' => [ __CLASS__, 'require_auth' ] ],
            [ 'methods' => 'POST', 'callback' => [ __CLASS__, 'bot_settings_save' ], 'permission_callback' => [ __CLASS__, 'require_auth' ] ],
        ] );
    }

    /* ════════════════════════════════════════════════════════════════════════
       PERMISSION
    ════════════════════════════════════════════════════════════════════════ */

    public static function require_auth( WP_REST_Request $req ) {
        return is_user_logged_in();
    }

    /* ════════════════════════════════════════════════════════════════════════
       AUTH
    ════════════════════════════════════════════════════════════════════════ */

    public static function auth_register( WP_REST_Request $req ) {
        $body     = $req->get_json_params();
        $username = sanitize_user( $body['username'] ?? '' );
        $password = $body['password'] ?? '';

        if ( strlen( $username ) < 3 || strlen( $username ) > 32 ) {
            return self::error( 'El username debe tener entre 3 y 32 caracteres', 400 );
        }
        if ( strlen( $password ) < 6 ) {
            return self::error( 'La contraseña debe tener al menos 6 caracteres', 400 );
        }
        if ( username_exists( $username ) || email_exists( $username . '@clientum.local' ) ) {
            return self::error( 'El username ya está en uso', 409 );
        }

        $user_count = (int) count_users()['total_users'];
        $role       = ( $user_count === 0 ) ? 'administrator' : 'subscriber';

        $user_id = wp_create_user( $username, $password, $username . '@clientum.local' );
        if ( is_wp_error( $user_id ) ) return self::wp_err( $user_id );

        $user = new WP_User( $user_id );
        $user->set_role( $role );

        // Login automático tras registro
        wp_set_auth_cookie( $user_id, true );

        return self::ok( [
            'user' => [
                'username' => $username,
                'role'     => cap_wp_role_to_cap( $user->roles ),
            ]
        ], 201 );
    }

    public static function auth_login( WP_REST_Request $req ) {
        $body     = $req->get_json_params();
        $username = sanitize_user( $body['username'] ?? '' );
        $password = $body['password'] ?? '';

        $user = wp_authenticate( $username, $password );
        if ( is_wp_error( $user ) ) return self::error( 'Credenciales incorrectas', 401 );

        wp_set_auth_cookie( $user->ID, true );

        return self::ok( [
            'user' => [
                'username' => $user->user_login,
                'role'     => cap_wp_role_to_cap( $user->roles ),
            ],
            'nonce' => wp_create_nonce( 'wp_rest' ),
        ] );
    }

    public static function auth_logout( WP_REST_Request $req ) {
        wp_logout();
        return self::ok( [ 'ok' => true ] );
    }

    public static function auth_me( WP_REST_Request $req ) {
        if ( ! is_user_logged_in() ) return self::error( 'No autenticado', 401 );
        $u = wp_get_current_user();
        return self::ok( [
            'user' => [
                'username' => $u->user_login,
                'role'     => cap_wp_role_to_cap( $u->roles ),
                'id'       => $u->ID,
            ]
        ] );
    }

    /* ════════════════════════════════════════════════════════════════════════
       GENERATE (AI)
    ════════════════════════════════════════════════════════════════════════ */

    public static function generate( WP_REST_Request $req ) {
        $body    = $req->get_json_params();
        $action  = sanitize_text_field( $body['action']  ?? '' );
        $payload = $body['payload'] ?? [];

        $result = match ( $action ) {
            'generateIndustryCopy' => CAP_AI_Handler::handle_generate_industry_copy( $payload ),
            'optimizeCopy'         => CAP_AI_Handler::handle_optimize_copy( $payload ),
            'generateImage'        => CAP_AI_Handler::handle_generate_image_prompt( $payload ),
            'translateBrochure'    => CAP_AI_Handler::handle_translate_brochure( $payload ),
            'icp'                  => CAP_AI_Handler::handle_icp( $payload ),
            'meddic'               => CAP_AI_Handler::handle_meddic( $payload ),
            'outreach'             => CAP_AI_Handler::handle_outreach( $payload ),
            'copilot'              => CAP_AI_Handler::handle_copilot( $payload ),
            'prospectLeads'        => CAP_AI_Handler::handle_prospect_leads( $payload ),
            default                => new WP_Error( 'unknown_action', "Acción desconocida: $action" ),
        };

        if ( is_wp_error( $result ) ) return self::wp_err( $result, 400 );

        $text = $result['text'] ?? '';

        // Si esperamos JSON, intentar parsear
        $json_actions = [ 'generateIndustryCopy', 'translateBrochure', 'icp', 'meddic', 'outreach', 'prospectLeads' ];
        if ( in_array( $action, $json_actions, true ) ) {
            $parsed = json_decode( $text, true );
            if ( $parsed !== null ) return self::ok( [ 'result' => $parsed ] );
        }

        return self::ok( [ 'result' => $text ] );
    }

    /* ════════════════════════════════════════════════════════════════════════
       SCRAPE PLACES
    ════════════════════════════════════════════════════════════════════════ */

    public static function scrape_places( WP_REST_Request $req ) {
        $body  = $req->get_json_params();
        $query = sanitize_text_field( $body['query'] ?? '' );
        $max   = min( intval( $body['max'] ?? 20 ), 50 );
        $lang  = sanitize_text_field( $body['language'] ?? 'es' );

        if ( ! $query ) return self::error( 'query requerido', 400 );

        $result = CAP_Scraper::scrape_places( $query, $max, $lang );
        if ( is_wp_error( $result ) ) return self::wp_err( $result, 500 );

        return self::ok( [ 'places' => $result ] );
    }

    /* ════════════════════════════════════════════════════════════════════════
       ENRICH CONTACT (Hunter.io)
    ════════════════════════════════════════════════════════════════════════ */

    public static function enrich_contact( WP_REST_Request $req ) {
        $body   = $req->get_json_params();
        $domain = sanitize_text_field( $body['domain'] ?? '' );
        if ( ! $domain ) return self::error( 'domain requerido', 400 );

        $api_key = get_option( 'cap_hunter_api_key', '' );
        if ( empty( $api_key ) ) {
            return self::ok( [ 'contacts' => [], 'organization' => null, 'source' => 'none' ] );
        }

        $clean = strtolower( trim( preg_replace( '#^https?://(www\.)?#', '', $domain ) ) );
        $clean = explode( '/', $clean )[0];
        $clean = explode( '?', $clean )[0];
        if ( strlen( $clean ) < 3 ) {
            return self::ok( [ 'contacts' => [], 'organization' => null, 'source' => 'none' ] );
        }

        $url = 'https://api.hunter.io/v2/domain-search?domain=' . rawurlencode( $clean )
             . '&limit=5&api_key=' . rawurlencode( $api_key );

        $response = wp_remote_get( $url, [ 'timeout' => 8 ] );
        if ( is_wp_error( $response ) || wp_remote_retrieve_response_code( $response ) !== 200 ) {
            return self::ok( [ 'contacts' => [], 'organization' => null, 'source' => 'none' ] );
        }

        $data = json_decode( wp_remote_retrieve_body( $response ), true );
        if ( empty( $data['data'] ) ) {
            return self::ok( [ 'contacts' => [], 'organization' => null, 'source' => 'none' ] );
        }

        $emails   = $data['data']['emails'] ?? [];
        $contacts = [];
        foreach ( $emails as $e ) {
            if ( empty( $e['first_name'] ) && empty( $e['last_name'] ) ) continue;
            $contacts[] = [
                'name'       => trim( ( $e['first_name'] ?? '' ) . ' ' . ( $e['last_name'] ?? '' ) ),
                'email'      => $e['value'] ?? '',
                'position'   => $e['position'] ?? 'Contacto',
                'confidence' => $e['confidence'] ?? 0,
                'linkedin'   => $e['linkedin'] ?? null,
            ];
        }

        return self::ok( [
            'contacts'     => $contacts,
            'organization' => $data['data']['organization'] ?? null,
            'source'       => 'hunter',
        ] );
    }

    /* ════════════════════════════════════════════════════════════════════════
       DEALS
    ════════════════════════════════════════════════════════════════════════ */

    public static function deals_list( WP_REST_Request $req ) {
        global $wpdb;
        $uid = get_current_user_id();
        $rows = $wpdb->get_results( $wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}cap_deals WHERE user_id = %d ORDER BY updated_at DESC",
            $uid
        ), ARRAY_A );
        return self::ok( [ 'deals' => $rows ] );
    }

    public static function deals_create( WP_REST_Request $req ) {
        global $wpdb;
        $uid  = get_current_user_id();
        $body = $req->get_json_params();
        $data = self::sanitize_deal( $body, $uid );
        $wpdb->insert( "{$wpdb->prefix}cap_deals", $data );
        $id = $wpdb->insert_id;
        return self::ok( [ 'deal' => array_merge( $data, [ 'id' => $id ] ) ], 201 );
    }

    public static function deals_get( WP_REST_Request $req ) {
        global $wpdb;
        $uid = get_current_user_id();
        $id  = intval( $req['id'] );
        $row = $wpdb->get_row( $wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}cap_deals WHERE id = %d AND user_id = %d",
            $id, $uid
        ), ARRAY_A );
        if ( ! $row ) return self::error( 'No encontrado', 404 );
        return self::ok( [ 'deal' => $row ] );
    }

    public static function deals_update( WP_REST_Request $req ) {
        global $wpdb;
        $uid  = get_current_user_id();
        $id   = intval( $req['id'] );
        $body = $req->get_json_params();
        $data = self::sanitize_deal( $body, $uid );
        $wpdb->update( "{$wpdb->prefix}cap_deals", $data, [ 'id' => $id, 'user_id' => $uid ] );
        return self::ok( [ 'deal' => array_merge( $data, [ 'id' => $id ] ) ] );
    }

    public static function deals_delete( WP_REST_Request $req ) {
        global $wpdb;
        $uid = get_current_user_id();
        $id  = intval( $req['id'] );
        $wpdb->delete( "{$wpdb->prefix}cap_deals", [ 'id' => $id, 'user_id' => $uid ] );
        return self::ok( [ 'deleted' => true ] );
    }

    private static function sanitize_deal( array $b, int $uid ): array {
        return [
            'user_id'     => $uid,
            'company'     => sanitize_text_field( $b['company']     ?? '' ),
            'contact'     => sanitize_text_field( $b['contact']     ?? '' ),
            'amount'      => floatval( $b['amount']      ?? 0 ),
            'currency'    => sanitize_text_field( $b['currency']    ?? 'ARS' ),
            'stage'       => sanitize_text_field( $b['stage']       ?? 'lead' ),
            'industry'    => sanitize_text_field( $b['industry']    ?? '' ),
            'notes'       => sanitize_textarea_field( $b['notes']   ?? '' ),
            'probability' => min( 100, max( 0, intval( $b['probability'] ?? 0 ) ) ),
            'close_date'  => ! empty( $b['close_date'] ) ? sanitize_text_field( $b['close_date'] ) : null,
        ];
    }

    /* ════════════════════════════════════════════════════════════════════════
       ACTIVITIES
    ════════════════════════════════════════════════════════════════════════ */

    public static function activities_list( WP_REST_Request $req ) {
        global $wpdb;
        $uid  = get_current_user_id();
        $rows = $wpdb->get_results( $wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}cap_activities WHERE user_id = %d ORDER BY created_at DESC LIMIT 200",
            $uid
        ), ARRAY_A );
        return self::ok( [ 'activities' => $rows ] );
    }

    public static function activities_create( WP_REST_Request $req ) {
        global $wpdb;
        $uid  = get_current_user_id();
        $body = $req->get_json_params();
        $data = [
            'user_id'   => $uid,
            'type'      => sanitize_text_field( $body['type']      ?? 'note' ),
            'title'     => sanitize_text_field( $body['title']     ?? '' ),
            'notes'     => sanitize_textarea_field( $body['notes'] ?? '' ),
            'deal_id'   => ! empty( $body['deal_id'] ) ? intval( $body['deal_id'] ) : null,
            'contact'   => sanitize_text_field( $body['contact']   ?? '' ),
            'completed' => ! empty( $body['completed'] ) ? 1 : 0,
            'due_date'  => ! empty( $body['due_date'] ) ? sanitize_text_field( $body['due_date'] ) : null,
        ];
        $wpdb->insert( "{$wpdb->prefix}cap_activities", $data );
        $id = $wpdb->insert_id;
        return self::ok( [ 'activity' => array_merge( $data, [ 'id' => $id ] ) ], 201 );
    }

    public static function activities_update( WP_REST_Request $req ) {
        global $wpdb;
        $uid  = get_current_user_id();
        $id   = intval( $req['id'] );
        $body = $req->get_json_params();
        $data = [
            'type'      => sanitize_text_field( $body['type']      ?? 'note' ),
            'title'     => sanitize_text_field( $body['title']     ?? '' ),
            'notes'     => sanitize_textarea_field( $body['notes'] ?? '' ),
            'completed' => ! empty( $body['completed'] ) ? 1 : 0,
            'due_date'  => ! empty( $body['due_date'] ) ? sanitize_text_field( $body['due_date'] ) : null,
        ];
        $wpdb->update( "{$wpdb->prefix}cap_activities", $data, [ 'id' => $id, 'user_id' => $uid ] );
        return self::ok( [ 'activity' => array_merge( $data, [ 'id' => $id ] ) ] );
    }

    public static function activities_delete( WP_REST_Request $req ) {
        global $wpdb;
        $uid = get_current_user_id();
        $id  = intval( $req['id'] );
        $wpdb->delete( "{$wpdb->prefix}cap_activities", [ 'id' => $id, 'user_id' => $uid ] );
        return self::ok( [ 'deleted' => true ] );
    }

    /* ════════════════════════════════════════════════════════════════════════
       CONTACTS
    ════════════════════════════════════════════════════════════════════════ */

    public static function contacts_list( WP_REST_Request $req ) {
        global $wpdb;
        $uid  = get_current_user_id();
        $rows = $wpdb->get_results( $wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}cap_contacts WHERE user_id = %d ORDER BY name ASC",
            $uid
        ), ARRAY_A );
        return self::ok( [ 'contacts' => $rows ] );
    }

    public static function contacts_create( WP_REST_Request $req ) {
        global $wpdb;
        $uid  = get_current_user_id();
        $body = $req->get_json_params();
        $data = self::sanitize_contact( $body, $uid );
        $wpdb->insert( "{$wpdb->prefix}cap_contacts", $data );
        $id = $wpdb->insert_id;
        return self::ok( [ 'contact' => array_merge( $data, [ 'id' => $id ] ) ], 201 );
    }

    public static function contacts_get( WP_REST_Request $req ) {
        global $wpdb;
        $uid = get_current_user_id();
        $id  = intval( $req['id'] );
        $row = $wpdb->get_row( $wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}cap_contacts WHERE id = %d AND user_id = %d",
            $id, $uid
        ), ARRAY_A );
        if ( ! $row ) return self::error( 'No encontrado', 404 );
        return self::ok( [ 'contact' => $row ] );
    }

    public static function contacts_update( WP_REST_Request $req ) {
        global $wpdb;
        $uid  = get_current_user_id();
        $id   = intval( $req['id'] );
        $body = $req->get_json_params();
        $data = self::sanitize_contact( $body, $uid );
        $wpdb->update( "{$wpdb->prefix}cap_contacts", $data, [ 'id' => $id, 'user_id' => $uid ] );
        return self::ok( [ 'contact' => array_merge( $data, [ 'id' => $id ] ) ] );
    }

    public static function contacts_delete( WP_REST_Request $req ) {
        global $wpdb;
        $uid = get_current_user_id();
        $id  = intval( $req['id'] );
        $wpdb->delete( "{$wpdb->prefix}cap_contacts", [ 'id' => $id, 'user_id' => $uid ] );
        return self::ok( [ 'deleted' => true ] );
    }

    private static function sanitize_contact( array $b, int $uid ): array {
        return [
            'user_id'  => $uid,
            'name'     => sanitize_text_field( $b['name']     ?? '' ),
            'email'    => sanitize_email( $b['email']         ?? '' ),
            'phone'    => sanitize_text_field( $b['phone']    ?? '' ),
            'company'  => sanitize_text_field( $b['company']  ?? '' ),
            'position' => sanitize_text_field( $b['position'] ?? '' ),
            'industry' => sanitize_text_field( $b['industry'] ?? '' ),
            'notes'    => sanitize_textarea_field( $b['notes'] ?? '' ),
            'tags'     => sanitize_text_field( $b['tags']     ?? '' ),
            'score'    => min( 100, max( 0, intval( $b['score'] ?? 0 ) ) ),
        ];
    }

    /* ════════════════════════════════════════════════════════════════════════
       TEMPLATES (Brochure)
    ════════════════════════════════════════════════════════════════════════ */

    public static function templates_list( WP_REST_Request $req ) {
        global $wpdb;
        $uid  = get_current_user_id();
        $rows = $wpdb->get_results( $wpdb->prepare(
            "SELECT id, name, industry, color_theme, hide_prices, hide_chatbot, created_at FROM {$wpdb->prefix}cap_templates WHERE user_id = %d ORDER BY name ASC",
            $uid
        ), ARRAY_A );
        return self::ok( [ 'templates' => $rows ] );
    }

    public static function templates_save( WP_REST_Request $req ) {
        global $wpdb;
        $uid  = get_current_user_id();
        $body = $req->get_json_params();
        $name = sanitize_text_field( $body['name'] ?? '' );
        if ( ! $name ) return self::error( 'name requerido', 400 );

        $data = [
            'user_id'       => $uid,
            'name'          => $name,
            'industry'      => sanitize_text_field( $body['industry']    ?? '' ),
            'color_theme'   => sanitize_text_field( $body['colorTheme']  ?? 'navy' ),
            'hide_prices'   => ! empty( $body['hidePrices'] )   ? 1 : 0,
            'hide_chatbot'  => ! empty( $body['hideChatbot'] )  ? 1 : 0,
            'brochure_data' => wp_json_encode( $body['brochureData'] ?? [] ),
        ];

        // Upsert por nombre
        $existing = $wpdb->get_var( $wpdb->prepare(
            "SELECT id FROM {$wpdb->prefix}cap_templates WHERE user_id = %d AND name = %s",
            $uid, $name
        ) );

        if ( $existing ) {
            $wpdb->update( "{$wpdb->prefix}cap_templates", $data, [ 'id' => $existing, 'user_id' => $uid ] );
            $id = $existing;
        } else {
            $wpdb->insert( "{$wpdb->prefix}cap_templates", $data );
            $id = $wpdb->insert_id;
        }

        return self::ok( [ 'template' => array_merge( $data, [ 'id' => $id ] ) ], 201 );
    }

    public static function templates_delete( WP_REST_Request $req ) {
        global $wpdb;
        $uid = get_current_user_id();
        $id  = intval( $req['id'] );
        $wpdb->delete( "{$wpdb->prefix}cap_templates", [ 'id' => $id, 'user_id' => $uid ] );
        return self::ok( [ 'deleted' => true ] );
    }

    /* ════════════════════════════════════════════════════════════════════════
       LEADS (Patagonia Explorer saved results)
    ════════════════════════════════════════════════════════════════════════ */

    public static function leads_list( WP_REST_Request $req ) {
        global $wpdb;
        $uid  = get_current_user_id();
        $rows = $wpdb->get_results( $wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}cap_leads WHERE user_id = %d ORDER BY created_at DESC",
            $uid
        ), ARRAY_A );
        return self::ok( [ 'leads' => $rows ] );
    }

    public static function leads_create( WP_REST_Request $req ) {
        global $wpdb;
        $uid  = get_current_user_id();
        $body = $req->get_json_params();
        $data = [
            'user_id'    => $uid,
            'name'       => sanitize_text_field( $body['name']     ?? '' ),
            'address'    => sanitize_text_field( $body['address']  ?? '' ),
            'phone'      => sanitize_text_field( $body['phone']    ?? '' ),
            'website'    => esc_url_raw( $body['website']          ?? '' ),
            'rating'     => floatval( $body['rating']              ?? 0 ),
            'reviews'    => intval( $body['reviews']               ?? 0 ),
            'industry'   => sanitize_text_field( $body['industry'] ?? '' ),
            'city'       => sanitize_text_field( $body['city']     ?? '' ),
            'province'   => sanitize_text_field( $body['province'] ?? '' ),
            'meddic_data'=> wp_json_encode( $body['meddicData']    ?? [] ),
            'status'     => sanitize_text_field( $body['status']   ?? 'new' ),
        ];
        $wpdb->insert( "{$wpdb->prefix}cap_leads", $data );
        $id = $wpdb->insert_id;
        return self::ok( [ 'lead' => array_merge( $data, [ 'id' => $id ] ) ], 201 );
    }

    public static function leads_update( WP_REST_Request $req ) {
        global $wpdb;
        $uid  = get_current_user_id();
        $id   = intval( $req['id'] );
        $body = $req->get_json_params();
        $data = [
            'status'      => sanitize_text_field( $body['status']   ?? 'new' ),
            'meddic_data' => wp_json_encode( $body['meddicData']    ?? [] ),
        ];
        $wpdb->update( "{$wpdb->prefix}cap_leads", $data, [ 'id' => $id, 'user_id' => $uid ] );
        return self::ok( [ 'lead' => array_merge( $data, [ 'id' => $id ] ) ] );
    }

    public static function leads_delete( WP_REST_Request $req ) {
        global $wpdb;
        $uid = get_current_user_id();
        $id  = intval( $req['id'] );
        $wpdb->delete( "{$wpdb->prefix}cap_leads", [ 'id' => $id, 'user_id' => $uid ] );
        return self::ok( [ 'deleted' => true ] );
    }

    /* ════════════════════════════════════════════════════════════════════════
       PRODUCTS (Catálogo)
    ════════════════════════════════════════════════════════════════════════ */

    public static function products_list( WP_REST_Request $req ) {
        global $wpdb;
        $uid  = get_current_user_id();
        $rows = $wpdb->get_results( $wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}cap_products WHERE user_id = %d ORDER BY category ASC, code ASC",
            $uid
        ), ARRAY_A );
        return self::ok( [ 'products' => $rows ] );
    }

    public static function products_create( WP_REST_Request $req ) {
        global $wpdb;
        $uid  = get_current_user_id();
        $data = self::sanitize_product( $req->get_json_params(), $uid );
        $wpdb->insert( "{$wpdb->prefix}cap_products", $data );
        return self::ok( [ 'product' => array_merge( $data, [ 'id' => $wpdb->insert_id ] ) ], 201 );
    }

    public static function products_update( WP_REST_Request $req ) {
        global $wpdb;
        $uid  = get_current_user_id();
        $id   = intval( $req['id'] );
        $data = self::sanitize_product( $req->get_json_params(), $uid );
        $wpdb->update( "{$wpdb->prefix}cap_products", $data, [ 'id' => $id, 'user_id' => $uid ] );
        return self::ok( [ 'product' => array_merge( $data, [ 'id' => $id ] ) ] );
    }

    public static function products_delete( WP_REST_Request $req ) {
        global $wpdb;
        $uid = get_current_user_id();
        $id  = intval( $req['id'] );
        $wpdb->delete( "{$wpdb->prefix}cap_products", [ 'id' => $id, 'user_id' => $uid ] );
        return self::ok( [ 'deleted' => true ] );
    }

    private static function sanitize_product( array $b, int $uid ): array {
        return [
            'user_id'     => $uid,
            'code'        => sanitize_text_field( $b['code']        ?? '' ),
            'name'        => sanitize_text_field( $b['name']        ?? '' ),
            'price'       => isset( $b['price'] ) && $b['price'] !== '' ? floatval( $b['price'] ) : null,
            'category'    => sanitize_text_field( $b['category']    ?? '' ),
            'subcategory' => sanitize_text_field( $b['subcategory'] ?? '' ),
            'unit'        => sanitize_text_field( $b['unit']        ?? '' ),
            'active'      => ! isset( $b['active'] ) || $b['active'] ? 1 : 0,
        ];
    }

    /* ════════════════════════════════════════════════════════════════════════
       SELLERS (Vendedores)
    ════════════════════════════════════════════════════════════════════════ */

    public static function sellers_list( WP_REST_Request $req ) {
        global $wpdb;
        $uid  = get_current_user_id();
        $rows = $wpdb->get_results( $wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}cap_sellers WHERE user_id = %d ORDER BY name ASC",
            $uid
        ), ARRAY_A );
        return self::ok( [ 'sellers' => $rows ] );
    }

    public static function sellers_create( WP_REST_Request $req ) {
        global $wpdb;
        $uid  = get_current_user_id();
        $data = self::sanitize_seller( $req->get_json_params(), $uid );
        $wpdb->insert( "{$wpdb->prefix}cap_sellers", $data );
        return self::ok( [ 'seller' => array_merge( $data, [ 'id' => $wpdb->insert_id ] ) ], 201 );
    }

    public static function sellers_update( WP_REST_Request $req ) {
        global $wpdb;
        $uid  = get_current_user_id();
        $id   = intval( $req['id'] );
        $data = self::sanitize_seller( $req->get_json_params(), $uid );
        $wpdb->update( "{$wpdb->prefix}cap_sellers", $data, [ 'id' => $id, 'user_id' => $uid ] );
        return self::ok( [ 'seller' => array_merge( $data, [ 'id' => $id ] ) ] );
    }

    public static function sellers_delete( WP_REST_Request $req ) {
        global $wpdb;
        $uid = get_current_user_id();
        $id  = intval( $req['id'] );
        $wpdb->delete( "{$wpdb->prefix}cap_sellers", [ 'id' => $id, 'user_id' => $uid ] );
        return self::ok( [ 'deleted' => true ] );
    }

    private static function sanitize_seller( array $b, int $uid ): array {
        return [
            'user_id'   => $uid,
            'name'      => sanitize_text_field( $b['name']      ?? '' ),
            'phone'     => sanitize_text_field( $b['phone']     ?? '' ),
            'email'     => sanitize_email( $b['email']          ?? '' ),
            'specialty' => sanitize_text_field( $b['specialty'] ?? 'general' ),
            'branch'    => sanitize_text_field( $b['branch']    ?? '' ),
            'active'    => ! isset( $b['active'] ) || $b['active'] ? 1 : 0,
        ];
    }

    /* ════════════════════════════════════════════════════════════════════════
       BRANCHES (Sucursales)
    ════════════════════════════════════════════════════════════════════════ */

    public static function branches_list( WP_REST_Request $req ) {
        global $wpdb;
        $uid  = get_current_user_id();
        $rows = $wpdb->get_results( $wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}cap_branches WHERE user_id = %d ORDER BY name ASC",
            $uid
        ), ARRAY_A );
        return self::ok( [ 'branches' => $rows ] );
    }

    public static function branches_create( WP_REST_Request $req ) {
        global $wpdb;
        $uid  = get_current_user_id();
        $data = self::sanitize_branch( $req->get_json_params(), $uid );
        $wpdb->insert( "{$wpdb->prefix}cap_branches", $data );
        return self::ok( [ 'branch' => array_merge( $data, [ 'id' => $wpdb->insert_id ] ) ], 201 );
    }

    public static function branches_update( WP_REST_Request $req ) {
        global $wpdb;
        $uid  = get_current_user_id();
        $id   = intval( $req['id'] );
        $data = self::sanitize_branch( $req->get_json_params(), $uid );
        $wpdb->update( "{$wpdb->prefix}cap_branches", $data, [ 'id' => $id, 'user_id' => $uid ] );
        return self::ok( [ 'branch' => array_merge( $data, [ 'id' => $id ] ) ] );
    }

    public static function branches_delete( WP_REST_Request $req ) {
        global $wpdb;
        $uid = get_current_user_id();
        $id  = intval( $req['id'] );
        $wpdb->delete( "{$wpdb->prefix}cap_branches", [ 'id' => $id, 'user_id' => $uid ] );
        return self::ok( [ 'deleted' => true ] );
    }

    private static function sanitize_branch( array $b, int $uid ): array {
        return [
            'user_id'  => $uid,
            'name'     => sanitize_text_field( $b['name']     ?? '' ),
            'address'  => sanitize_text_field( $b['address']  ?? '' ),
            'city'     => sanitize_text_field( $b['city']     ?? '' ),
            'phone'    => sanitize_text_field( $b['phone']    ?? '' ),
            'schedule' => sanitize_text_field( $b['schedule'] ?? '' ),
            'active'   => ! isset( $b['active'] ) || $b['active'] ? 1 : 0,
        ];
    }

    /* ════════════════════════════════════════════════════════════════════════
       CONVERSATIONS (Bot WhatsApp)
    ════════════════════════════════════════════════════════════════════════ */

    public static function conversations_list( WP_REST_Request $req ) {
        global $wpdb;
        $uid  = get_current_user_id();
        $rows = $wpdb->get_results( $wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}cap_conversations WHERE user_id = %d ORDER BY created_date DESC LIMIT 200",
            $uid
        ), ARRAY_A );
        return self::ok( [ 'conversations' => $rows ] );
    }

    public static function conversations_create( WP_REST_Request $req ) {
        global $wpdb;
        $uid  = get_current_user_id();
        $data = self::sanitize_conversation( $req->get_json_params(), $uid );
        $wpdb->insert( "{$wpdb->prefix}cap_conversations", $data );
        return self::ok( [ 'conversation' => array_merge( $data, [ 'id' => $wpdb->insert_id ] ) ], 201 );
    }

    public static function conversations_update( WP_REST_Request $req ) {
        global $wpdb;
        $uid  = get_current_user_id();
        $id   = intval( $req['id'] );
        $data = self::sanitize_conversation( $req->get_json_params(), $uid );
        $wpdb->update( "{$wpdb->prefix}cap_conversations", $data, [ 'id' => $id, 'user_id' => $uid ] );
        return self::ok( [ 'conversation' => array_merge( $data, [ 'id' => $id ] ) ] );
    }

    public static function conversations_delete( WP_REST_Request $req ) {
        global $wpdb;
        $uid = get_current_user_id();
        $id  = intval( $req['id'] );
        $wpdb->delete( "{$wpdb->prefix}cap_conversations", [ 'id' => $id, 'user_id' => $uid ] );
        return self::ok( [ 'deleted' => true ] );
    }

    private static function sanitize_conversation( array $b, int $uid ): array {
        return [
            'user_id'         => $uid,
            'customer_name'   => sanitize_text_field( $b['customer_name']   ?? '' ),
            'customer_phone'  => sanitize_text_field( $b['customer_phone']  ?? '' ),
            'channel'         => sanitize_text_field( $b['channel']         ?? 'whatsapp' ),
            'status'          => sanitize_text_field( $b['status']         ?? 'activa' ),
            'query_type'      => sanitize_text_field( $b['query_type']     ?? 'otro' ),
            'summary'         => sanitize_textarea_field( $b['summary']    ?? '' ),
            'assigned_seller' => sanitize_text_field( $b['assigned_seller'] ?? '' ),
        ];
    }

    /* ════════════════════════════════════════════════════════════════════════
       BOT SETTINGS
    ════════════════════════════════════════════════════════════════════════ */

    public static function bot_settings_get( WP_REST_Request $req ) {
        $uid      = get_current_user_id();
        $settings = get_user_meta( $uid, 'cap_bot_settings', true );
        return self::ok( [ 'settings' => $settings ?: new stdClass() ] );
    }

    public static function bot_settings_save( WP_REST_Request $req ) {
        $uid  = get_current_user_id();
        $body = $req->get_json_params();
        update_user_meta( $uid, 'cap_bot_settings', $body );
        return self::ok( [ 'settings' => $body ] );
    }

    /* ════════════════════════════════════════════════════════════════════════
       API KEYS (por usuario)
    ════════════════════════════════════════════════════════════════════════ */

    public static function apikey_get( WP_REST_Request $req ) {
        global $wpdb;
        $uid     = get_current_user_id();
        $service = sanitize_key( $req['service'] );
        $row     = $wpdb->get_row( $wpdb->prepare(
            "SELECT id FROM {$wpdb->prefix}cap_api_keys WHERE user_id = %d AND service = %s",
            $uid, $service
        ), ARRAY_A );
        // No devolvemos la key real, solo si existe
        return self::ok( [ 'exists' => ! empty( $row ) ] );
    }

    public static function apikey_save( WP_REST_Request $req ) {
        global $wpdb;
        $uid     = get_current_user_id();
        $service = sanitize_key( $req['service'] );
        $body    = $req->get_json_params();
        $raw_key = $body['apiKey'] ?? '';
        if ( ! $raw_key ) return self::error( 'apiKey requerido', 400 );

        $enc = CAP_Database::encrypt( $raw_key );

        $existing = $wpdb->get_var( $wpdb->prepare(
            "SELECT id FROM {$wpdb->prefix}cap_api_keys WHERE user_id = %d AND service = %s",
            $uid, $service
        ) );

        if ( $existing ) {
            $wpdb->update( "{$wpdb->prefix}cap_api_keys", [ 'api_key_enc' => $enc ], [ 'id' => $existing ] );
        } else {
            $wpdb->insert( "{$wpdb->prefix}cap_api_keys", [
                'user_id'     => $uid,
                'service'     => $service,
                'api_key_enc' => $enc,
            ] );
        }

        return self::ok( [ 'saved' => true ] );
    }

    /* ════════════════════════════════════════════════════════════════════════
       HELPERS
    ════════════════════════════════════════════════════════════════════════ */

    private static function ok( array $data, int $status = 200 ): WP_REST_Response {
        return new WP_REST_Response( $data, $status );
    }

    private static function error( string $msg, int $status = 400 ): WP_REST_Response {
        return new WP_REST_Response( [ 'error' => $msg ], $status );
    }

    private static function wp_err( WP_Error $err, int $status = 400 ): WP_REST_Response {
        return new WP_REST_Response( [ 'error' => $err->get_error_message() ], $status );
    }
}
