<?php
if ( ! defined( 'ABSPATH' ) ) exit;

if ( class_exists( 'Clntm_Rest_Api' ) ) {
    return;
}

class Clntm_Rest_Api {

    private $ns = 'clientum/v1';

    public function __construct() {
        add_action( 'rest_api_init', [ $this, 'register_routes' ] );
    }

    public function register_routes() {
        // Dashboard
        register_rest_route( $this->ns, '/dashboard/stats',    [ 'methods' => 'GET', 'callback' => [ $this, 'dashboard_stats' ],    'permission_callback' => [ $this, 'can_access' ] ] );
        register_rest_route( $this->ns, '/dashboard/pipeline', [ 'methods' => 'GET', 'callback' => [ $this, 'dashboard_pipeline' ], 'permission_callback' => [ $this, 'can_access' ] ] );
        register_rest_route( $this->ns, '/dashboard/activity', [ 'methods' => 'GET', 'callback' => [ $this, 'dashboard_activity' ], 'permission_callback' => [ $this, 'can_access' ] ] );

        // WhatsApp (conexión por usuario — número + API key, guardado en user_meta)
        register_rest_route( $this->ns, '/whatsapp/status',     [ 'methods' => 'GET',  'callback' => [ $this, 'whatsapp_status' ],     'permission_callback' => [ $this, 'can_access' ] ] );
        register_rest_route( $this->ns, '/whatsapp/connect',    [ 'methods' => 'POST', 'callback' => [ $this, 'whatsapp_connect' ],    'permission_callback' => [ $this, 'can_access' ] ] );
        register_rest_route( $this->ns, '/whatsapp/disconnect', [ 'methods' => 'POST', 'callback' => [ $this, 'whatsapp_disconnect' ], 'permission_callback' => [ $this, 'can_access' ] ] );

        // CRUD entities
        $entities = [
            'contacts'   => [ 'name', 'email', 'phone', 'company', 'status', 'source', 'notes' ],
            'companies'  => [ 'name', 'industry', 'website', 'email', 'phone', 'address', 'notes' ],
            'leads'      => [ 'name', 'email', 'phone', 'company', 'source', 'status', 'value', 'notes', 'contact_id' ],
            'deals'      => [ 'title', 'contact_id', 'company', 'value', 'stage', 'notes', 'expected_close' ],
            'activities' => [ 'title', 'type', 'contact_id', 'lead_id', 'deal_id', 'notes', 'activity_date', 'completed' ],
            'products'   => [ 'name', 'description', 'price', 'stock', 'sku', 'category' ],
            'invoices'   => [ 'number', 'contact_id', 'contact_name', 'status', 'items', 'subtotal', 'tax', 'total', 'due_date', 'notes' ],
            'quotes'     => [ 'number', 'contact_id', 'contact_name', 'status', 'items', 'subtotal', 'tax', 'total', 'valid_until', 'notes' ],
        ];

        foreach ( $entities as $entity => $fields ) {
            $this->register_crud( $entity, $fields );
        }
    }

    private function register_crud( $entity, $fields ) {
        $perm = [ $this, 'can_access' ];

        register_rest_route( $this->ns, "/{$entity}", [
            [ 'methods' => 'GET',  'callback' => $this->list_fn( $entity ),            'permission_callback' => $perm ],
            [ 'methods' => 'POST', 'callback' => $this->create_fn( $entity, $fields ), 'permission_callback' => $perm ],
        ]);

        register_rest_route( $this->ns, "/{$entity}/(?P<id>\d+)", [
            [ 'methods' => 'GET',    'callback' => $this->get_fn( $entity ),             'permission_callback' => $perm ],
            [ 'methods' => 'PUT',    'callback' => $this->update_fn( $entity, $fields ), 'permission_callback' => $perm ],
            [ 'methods' => 'DELETE', 'callback' => $this->delete_fn( $entity ),          'permission_callback' => $perm ],
        ]);
    }

    // ── CRUD closures ──────────────────────────────────────────────────────────

    // Per-entity searchable columns
    private $search_cols = [
        'contacts'   => [ 'name', 'email', 'phone', 'company' ],
        'companies'  => [ 'name', 'email', 'industry', 'website' ],
        'leads'      => [ 'name', 'email', 'phone', 'company' ],
        'deals'      => [ 'title', 'company' ],
        'activities' => [ 'title', 'notes' ],
        'products'   => [ 'name', 'sku', 'category' ],
        'invoices'   => [ 'number', 'contact_name' ],
        'quotes'     => [ 'number', 'contact_name' ],
    ];

    private function list_fn( $entity ) {
        return function( WP_REST_Request $req ) use ( $entity ) {
            global $wpdb;
            $table   = $wpdb->prefix . 'clntm_' . $entity;
            $uid     = get_current_user_id();
            $search  = sanitize_text_field( $req->get_param('search') ?? '' );
            $limit   = absint( $req->get_param('limit')  ?? 500 );
            $offset  = absint( $req->get_param('offset') ?? 0 );

            if ( $search ) {
                $like  = '%' . $wpdb->esc_like( $search ) . '%';
                $cols  = $this->search_cols[ $entity ] ?? [ 'name' ];
                $where = implode( ' OR ', array_map( fn( $c ) => "`{$c}` LIKE %s", $cols ) );
                $args  = array_fill( 0, count( $cols ), $like );
                $args  = array_merge( [ $uid ], $args, [ $limit, $offset ] );
                // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
                $rows  = $wpdb->get_results(
                    $wpdb->prepare( "SELECT * FROM `{$table}` WHERE user_id = %d AND ({$where}) ORDER BY id DESC LIMIT %d OFFSET %d", ...$args ),
                    ARRAY_A
                );
            } else {
                $rows = $wpdb->get_results( $wpdb->prepare(
                    "SELECT * FROM `{$table}` WHERE user_id = %d ORDER BY id DESC LIMIT %d OFFSET %d",
                    $uid, $limit, $offset
                ), ARRAY_A );
            }

            return rest_ensure_response( $rows ?: [] );
        };
    }

    private function get_fn( $entity ) {
        return function( WP_REST_Request $req ) use ( $entity ) {
            global $wpdb;
            $table = $wpdb->prefix . 'clntm_' . $entity;
            $row   = $wpdb->get_row( $wpdb->prepare(
                "SELECT * FROM `{$table}` WHERE id = %d AND user_id = %d",
                (int) $req['id'], get_current_user_id()
            ), ARRAY_A );
            if ( ! $row ) return new WP_Error( 'not_found', 'No encontrado', [ 'status' => 404 ] );
            return rest_ensure_response( $row );
        };
    }

    private function create_fn( $entity, $fields ) {
        return function( WP_REST_Request $req ) use ( $entity, $fields ) {
            global $wpdb;
            $table = $wpdb->prefix . 'clntm_' . $entity;
            $data  = $this->extract_fields( $req, $fields );
            if ( empty( $data ) ) return new WP_Error( 'bad_request', 'Sin datos', [ 'status' => 400 ] );

            $data['user_id'] = get_current_user_id();

            $result = $wpdb->insert( $table, $data );
            if ( false === $result ) return new WP_Error( 'db_error', $wpdb->last_error, [ 'status' => 500 ] );

            $row = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM `{$table}` WHERE id = %d", $wpdb->insert_id ), ARRAY_A );
            return new WP_REST_Response( $row, 201 );
        };
    }

    private function update_fn( $entity, $fields ) {
        return function( WP_REST_Request $req ) use ( $entity, $fields ) {
            global $wpdb;
            $table = $wpdb->prefix . 'clntm_' . $entity;
            $id    = (int) $req['id'];
            $uid   = get_current_user_id();
            $data  = $this->extract_fields( $req, $fields );
            if ( empty( $data ) ) return new WP_Error( 'bad_request', 'Sin datos', [ 'status' => 400 ] );

            $wpdb->update( $table, $data, [ 'id' => $id, 'user_id' => $uid ] );
            $row = $wpdb->get_row( $wpdb->prepare(
                "SELECT * FROM `{$table}` WHERE id = %d AND user_id = %d",
                $id, $uid
            ), ARRAY_A );
            if ( ! $row ) return new WP_Error( 'not_found', 'No encontrado', [ 'status' => 404 ] );
            return rest_ensure_response( $row );
        };
    }

    private function delete_fn( $entity ) {
        return function( WP_REST_Request $req ) use ( $entity ) {
            global $wpdb;
            $table = $wpdb->prefix . 'clntm_' . $entity;
            $id    = (int) $req['id'];
            $uid   = get_current_user_id();
            $row   = $wpdb->get_row( $wpdb->prepare(
                "SELECT id FROM `{$table}` WHERE id = %d AND user_id = %d",
                $id, $uid
            ), ARRAY_A );
            if ( ! $row ) return new WP_Error( 'not_found', 'No encontrado', [ 'status' => 404 ] );
            $wpdb->delete( $table, [ 'id' => $id, 'user_id' => $uid ] );
            return rest_ensure_response( [ 'deleted' => true, 'id' => $id ] );
        };
    }

    // ── Field extractor ────────────────────────────────────────────────────────

    private function extract_fields( WP_REST_Request $req, array $fields ): array {
        $body   = $req->get_json_params() ?: [];
        $result = [];
        foreach ( $fields as $f ) {
            if ( array_key_exists( $f, $body ) ) {
                $val = $body[ $f ];
                if ( is_array( $val ) ) {
                    $result[ $f ] = wp_json_encode( $val );
                } elseif ( in_array( $f, [ 'items' ], true ) ) {
                    $result[ $f ] = wp_kses_post( $val );
                } elseif ( in_array( $f, [ 'notes', 'description', 'address' ], true ) ) {
                    $result[ $f ] = sanitize_textarea_field( $val );
                } elseif ( in_array( $f, [ 'price', 'value', 'subtotal', 'tax', 'total' ], true ) ) {
                    $result[ $f ] = (float) $val;
                } elseif ( in_array( $f, [ 'stock', 'contact_id', 'lead_id', 'deal_id', 'completed' ], true ) ) {
                    $result[ $f ] = (int) $val;
                } else {
                    $result[ $f ] = sanitize_text_field( (string) $val );
                }
            }
        }
        return $result;
    }

    // ── Dashboard (filtrado por user_id) ───────────────────────────────────────

    public function dashboard_stats() {
        global $wpdb;
        $p   = $wpdb->prefix;
        $uid = get_current_user_id();

        $stats = [
            'totalContacts'  => (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$p}clntm_contacts WHERE user_id = %d", $uid ) ),
            'totalLeads'     => (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$p}clntm_leads WHERE user_id = %d", $uid ) ),
            'openDeals'      => (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$p}clntm_deals WHERE user_id = %d AND stage NOT IN ('Ganado','Perdido')", $uid ) ),
            'openDealsValue' => (float) $wpdb->get_var( $wpdb->prepare( "SELECT COALESCE(SUM(value),0) FROM {$p}clntm_deals WHERE user_id = %d AND stage NOT IN ('Ganado','Perdido')", $uid ) ),
            'totalRevenue'   => (float) $wpdb->get_var( $wpdb->prepare( "SELECT COALESCE(SUM(total),0) FROM {$p}clntm_invoices WHERE user_id = %d AND status = 'paid'", $uid ) ),
            'activitiesThisWeek' => (int) $wpdb->get_var( $wpdb->prepare(
                "SELECT COUNT(*) FROM {$p}clntm_activities WHERE user_id = %d AND created_at >= %s",
                $uid, date( 'Y-m-d', strtotime( '-7 days' ) )
            ) ),
            'conversionRate' => 0,
        ];

        if ( $stats['totalLeads'] > 0 ) {
            $won = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$p}clntm_leads WHERE user_id = %d AND status = 'won'", $uid ) );
            $stats['conversionRate'] = round( ( $won / $stats['totalLeads'] ) * 100, 1 );
        }

        return rest_ensure_response( $stats );
    }

    public function dashboard_pipeline() {
        global $wpdb;
        $uid    = get_current_user_id();
        $stages = [ 'Descubrimiento', 'Propuesta', 'Negociación', 'Contrato', 'Ganado', 'Perdido' ];
        $data   = [];
        foreach ( $stages as $stage ) {
            $row = $wpdb->get_row( $wpdb->prepare(
                "SELECT COUNT(*) as cnt, COALESCE(SUM(value),0) as val FROM {$wpdb->prefix}clntm_deals WHERE user_id = %d AND stage = %s",
                $uid, $stage
            ), ARRAY_A );
            $data[] = [ 'stage' => $stage, 'count' => (int) $row['cnt'], 'value' => (float) $row['val'] ];
        }
        return rest_ensure_response( $data );
    }

    public function dashboard_activity() {
        global $wpdb;
        $uid  = get_current_user_id();
        $rows = $wpdb->get_results( $wpdb->prepare(
            "SELECT a.*, c.name as contact_name
             FROM {$wpdb->prefix}clntm_activities a
             LEFT JOIN {$wpdb->prefix}clntm_contacts c ON c.id = a.contact_id AND c.user_id = %d
             WHERE a.user_id = %d
             ORDER BY a.id DESC LIMIT 10",
            $uid, $uid
        ), ARRAY_A );
        return rest_ensure_response( $rows ?: [] );
    }

    // ── WhatsApp ───────────────────────────────────────────────────────────────
    // Estado de conexión por usuario, guardado en user_meta (sin credenciales
    // en texto plano en la respuesta — solo se devuelve el número enmascarado).

    public function whatsapp_status() {
        $uid  = get_current_user_id();
        $data = get_user_meta( $uid, 'clntm_whatsapp', true );
        $data = is_array( $data ) ? $data : [];

        $phone = $data['phone'] ?? '';
        return rest_ensure_response([
            'connected' => ! empty( $data['connected'] ),
            'phone'     => $phone ? substr( $phone, 0, 4 ) . '••••' . substr( $phone, -2 ) : '',
            'updatedAt' => $data['updated_at'] ?? null,
        ]);
    }

    public function whatsapp_connect( WP_REST_Request $req ) {
        $uid    = get_current_user_id();
        $phone  = sanitize_text_field( $req->get_param( 'phone' ) ?? '' );
        $apiKey = sanitize_text_field( $req->get_param( 'apiKey' ) ?? '' );

        if ( ! $phone ) {
            return new WP_Error( 'clntm_whatsapp_missing_phone', 'El número de WhatsApp es obligatorio.', [ 'status' => 400 ] );
        }

        update_user_meta( $uid, 'clntm_whatsapp', [
            'phone'      => $phone,
            'api_key'    => $apiKey,
            'connected'  => true,
            'updated_at' => current_time( 'mysql' ),
        ] );

        return rest_ensure_response([ 'connected' => true, 'phone' => substr( $phone, 0, 4 ) . '••••' . substr( $phone, -2 ) ]);
    }

    public function whatsapp_disconnect() {
        $uid  = get_current_user_id();
        $data = get_user_meta( $uid, 'clntm_whatsapp', true );
        $data = is_array( $data ) ? $data : [];
        $data['connected']  = false;
        $data['updated_at'] = current_time( 'mysql' );
        update_user_meta( $uid, 'clntm_whatsapp', $data );

        return rest_ensure_response([ 'connected' => false ]);
    }

    // ── Permission ─────────────────────────────────────────────────────────────

    public function can_access( WP_REST_Request $req ) {
        return is_user_logged_in() && current_user_can( 'read' );
    }
}
