<?php
/**
 * Prospector REST Controller.
 *
 * Handles deal CRUD and AI generation (ICP, prospects, MEDDIC, outreach).
 *
 * @package WPSpace\AiMarketingExpert\Modules\Prospector
 */

namespace WPSpace\AiMarketingExpert\Modules\Prospector;

use WPSpace\AiMarketingExpert\AiProvider;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class ProspectorRestController {

	private const NS = 'aime/v1';

	public function register_routes(): void {
		// Deal CRUD.
		register_rest_route( self::NS, '/prospector/deals', array(
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'list_deals' ),
				'permission_callback' => array( $this, 'auth' ),
			),
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'create_deal' ),
				'permission_callback' => array( $this, 'auth' ),
			),
		) );

		register_rest_route( self::NS, '/prospector/deals/(?P<id>\d+)', array(
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_deal' ),
				'permission_callback' => array( $this, 'auth' ),
				'args'                => array( 'id' => array( 'type' => 'integer', 'required' => true ) ),
			),
			array(
				'methods'             => \WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'update_deal' ),
				'permission_callback' => array( $this, 'auth' ),
				'args'                => array( 'id' => array( 'type' => 'integer', 'required' => true ) ),
			),
			array(
				'methods'             => \WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'delete_deal' ),
				'permission_callback' => array( $this, 'auth' ),
				'args'                => array( 'id' => array( 'type' => 'integer', 'required' => true ) ),
			),
		) );

		// AI generation.
		register_rest_route( self::NS, '/prospector/generate', array(
			'methods'             => \WP_REST_Server::CREATABLE,
			'callback'            => array( $this, 'generate' ),
			'permission_callback' => array( $this, 'auth' ),
		) );

		// Export pipeline CSV.
		register_rest_route( self::NS, '/prospector/export', array(
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => array( $this, 'export_csv' ),
			'permission_callback' => array( $this, 'auth' ),
		) );
	}

	public function auth(): bool {
		return current_user_can( 'manage_options' );
	}

	// ── Deal CRUD ──────────────────────────────────────────────────────── //

	public function list_deals( \WP_REST_Request $req ): \WP_REST_Response {
		global $wpdb;
		$table = $wpdb->prefix . 'aime_prospector_deals';

		$stage = sanitize_text_field( $req->get_param( 'stage' ) ?? '' );
		$where = $stage ? $wpdb->prepare( ' WHERE stage = %s', $stage ) : '';

		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
		$rows = $wpdb->get_results( "SELECT * FROM {$table}{$where} ORDER BY created_at DESC", ARRAY_A );

		return new \WP_REST_Response( array_map( array( $this, 'format_deal' ), $rows ?: array() ) );
	}

	public function get_deal( \WP_REST_Request $req ): \WP_REST_Response {
		global $wpdb;
		$table = $wpdb->prefix . 'aime_prospector_deals';
		$row   = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table} WHERE id = %d", (int) $req['id'] ), ARRAY_A );

		if ( ! $row ) {
			return new \WP_REST_Response( array( 'message' => 'Not found' ), 404 );
		}
		return new \WP_REST_Response( $this->format_deal( $row ) );
	}

	public function create_deal( \WP_REST_Request $req ): \WP_REST_Response {
		global $wpdb;
		$table = $wpdb->prefix . 'aime_prospector_deals';
		$data  = $this->extract_deal_fields( $req->get_json_params() ?? array() );

		$wpdb->insert( $table, $data );

		if ( ! $wpdb->insert_id ) {
			return new \WP_REST_Response( array( 'message' => 'Insert failed' ), 500 );
		}

		$row = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table} WHERE id = %d", $wpdb->insert_id ), ARRAY_A );
		return new \WP_REST_Response( $this->format_deal( $row ), 201 );
	}

	public function update_deal( \WP_REST_Request $req ): \WP_REST_Response {
		global $wpdb;
		$table = $wpdb->prefix . 'aime_prospector_deals';
		$id    = (int) $req['id'];
		$data  = $this->extract_deal_fields( $req->get_json_params() ?? array() );

		$wpdb->update( $table, $data, array( 'id' => $id ) );

		$row = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table} WHERE id = %d", $id ), ARRAY_A );
		if ( ! $row ) {
			return new \WP_REST_Response( array( 'message' => 'Not found' ), 404 );
		}
		return new \WP_REST_Response( $this->format_deal( $row ) );
	}

	public function delete_deal( \WP_REST_Request $req ): \WP_REST_Response {
		global $wpdb;
		$table = $wpdb->prefix . 'aime_prospector_deals';
		$wpdb->delete( $table, array( 'id' => (int) $req['id'] ) );
		return new \WP_REST_Response( array( 'deleted' => true ) );
	}

	// ── AI Generation ──────────────────────────────────────────────────── //

	public function generate( \WP_REST_Request $req ): \WP_REST_Response {
		$body   = $req->get_json_params() ?? array();
		$action = sanitize_text_field( $body['action'] ?? '' );

		switch ( $action ) {
			case 'buildICP':
				return $this->build_icp( $body );
			case 'prospectLeads':
				return $this->prospect_leads( $body );
			case 'generateOutreach':
				return $this->generate_outreach( $body );
			case 'researchProspect':
				return $this->research_prospect( $body );
			default:
				return new \WP_REST_Response( array( 'message' => 'Unknown action' ), 400 );
		}
	}

	// ── AI: ICP Builder ───────────────────────────────────────────────── //

	private function build_icp( array $body ): \WP_REST_Response {
		$industry = sanitize_text_field( $body['industry'] ?? 'Distribuidora Mayorista' );
		$acv      = sanitize_text_field( $body['acv'] ?? '$180.000 ARS/mes' );

		$prompt = "Sos un experto en ventas B2B para PyMEs argentinas en Patagonia (Río Negro y Neuquén).
Generá un Ideal Customer Profile (ICP) completo y estructurado para vender el sistema Clientum (CRM + chatbot WhatsApp + automatizaciones) al rubro: {$industry}.
Valor de contrato promedio: {$acv}.

Respondé ÚNICAMENTE con un JSON válido con esta estructura exacta (sin markdown, sin ```json):
{
  \"industry\": \"string\",
  \"arrRange\": \"string (ej: $2M-$8M ARS/año)\",
  \"employeeCount\": \"string (ej: 5-25 empleados)\",
  \"stage\": \"string (ej: Crecimiento acelerado)\",
  \"growthRate\": \"string (ej: 15-30% anual)\",
  \"decisionMakerRole\": \"string\",
  \"decisionMakerSeniority\": \"string\",
  \"budgetAuthority\": \"string\",
  \"painPoints\": [\"string\", \"string\", \"string\"],
  \"avgContractValue\": \"string\",
  \"salesCycle\": \"string (ej: 7-14 días)\",
  \"winRatePotential\": \"string (ej: 35-50%)\",
  \"ltvToCac\": \"string (ej: 8:1)\",
  \"regions\": [\"string\"],
  \"timeZones\": [\"string\"],
  \"meddicMetrics\": \"string\",
  \"meddicEconomicBuyer\": \"string\",
  \"meddicDecisionCriteria\": \"string\",
  \"meddicDecisionProcess\": \"string\",
  \"meddicIdentifyPain\": \"string\",
  \"meddicChampion\": \"string\"
}";

		$result = AiProvider::generate( $prompt, 'text', 1024 );

		if ( ! $result['success'] ) {
			// Fallback ICP.
			return new \WP_REST_Response( array(
				'industry'              => $industry,
				'arrRange'              => '$1.5M–$6M ARS/año',
				'employeeCount'         => '5–20 empleados',
				'stage'                 => 'Crecimiento estable',
				'growthRate'            => '10–25% anual',
				'decisionMakerRole'     => 'Dueño / Socio Gerente',
				'decisionMakerSeniority'=> 'C-Level / Fundador',
				'budgetAuthority'       => 'Decisión unilateral < $300K ARS',
				'painPoints'            => array(
					'Pérdida de consultas por WhatsApp sin respuesta inmediata',
					'Sin seguimiento estructurado de ventas',
					'Proceso de cobranza manual y lento',
				),
				'avgContractValue'      => $acv,
				'salesCycle'            => '5–14 días',
				'winRatePotential'      => '30–45%',
				'ltvToCac'              => '7:1',
				'regions'               => array( 'General Roca', 'Neuquén Capital', 'Cipolletti', 'Bariloche' ),
				'timeZones'             => array( 'UTC-3 (Argentina)' ),
				'meddicMetrics'         => 'Reducción de consultas sin respuesta en 70%, aumento de ventas en 25%',
				'meddicEconomicBuyer'   => 'Socio Gerente o Dueño con acceso al presupuesto',
				'meddicDecisionCriteria'=> 'Facilidad de implementación, soporte local, precio en pesos',
				'meddicDecisionProcess' => 'Demo → Aprobación dueño → Firma contrato → Onboarding 5 días',
				'meddicIdentifyPain'    => 'Pérdida de $150K–$300K ARS/mes en ventas por atención tardía',
				'meddicChampion'        => 'Coordinador de ventas o encargado administrativo',
				'_fallback'             => true,
			) );
		}

		$content = trim( $result['content'] );
		// Strip possible markdown fences.
		$content = preg_replace( '/^```json\s*/i', '', $content );
		$content = preg_replace( '/```\s*$/', '', $content );
		$parsed  = json_decode( $content, true );

		if ( ! $parsed ) {
			return new \WP_REST_Response( array( 'message' => 'AI response could not be parsed', 'raw' => $content ), 422 );
		}

		return new \WP_REST_Response( $parsed );
	}

	// ── AI: Prospect Leads ────────────────────────────────────────────── //

	private function prospect_leads( array $body ): \WP_REST_Response {
		$city     = sanitize_text_field( $body['city']     ?? 'General Roca' );
		$industry = sanitize_text_field( $body['industry'] ?? 'Distribuidora Mayorista' );

		$prompt = "Sos un experto en prospección B2B para Patagonia argentina.
Generá una lista de 8 prospectos simulados pero REALISTAS de negocios del rubro \"{$industry}\" ubicados en {$city}, Patagonia (Río Negro o Neuquén).

Respondé ÚNICAMENTE con un JSON array válido (sin markdown, sin ```json):
[
  {
    \"company\": \"string (nombre realista de negocio local)\",
    \"industry\": \"{$industry}\",
    \"amount\": número entre 120000 y 350000,
    \"city\": \"{$city}\",
    \"address\": \"string (dirección realista de {$city})\",
    \"phone\": \"string (número con prefijo local de Patagonia)\",
    \"contact\": \"string (nombre y apellido + rol, ej: María Zapata - Dueña)\",
    \"painPoint\": \"string (dolor específico del negocio, 1 oración)\",
    \"score\": número entre 6 y 10,
    \"rating\": \"string (ej: 4.2)\",
    \"priceLevel\": \"string (uno de: $, $$, $$$)\",
    \"distance\": número entre 0.5 y 12.0,
    \"guiacoresUrl\": \"string (URL inventada de guiacores.com.ar)\"
  }
]

Generá exactamente 8 prospectos. Usá nombres de negocios, calles y contactos que suenen auténticos para la Patagonia argentina.";

		$result = AiProvider::generate( $prompt, 'text', 2048 );

		if ( ! $result['success'] ) {
			return new \WP_REST_Response( $this->fallback_prospects( $city, $industry ) );
		}

		$content = trim( $result['content'] );
		$content = preg_replace( '/^```json\s*/i', '', $content );
		$content = preg_replace( '/```\s*$/', '', $content );
		$parsed  = json_decode( $content, true );

		if ( ! is_array( $parsed ) ) {
			return new \WP_REST_Response( $this->fallback_prospects( $city, $industry ) );
		}

		return new \WP_REST_Response( array( 'prospects' => $parsed, '_source' => 'ai' ) );
	}

	private function fallback_prospects( string $city, string $industry ): array {
		return array(
			'prospects' => array(
				array( 'company' => "Distribuidora {$city} SRL", 'industry' => $industry, 'amount' => 185000, 'city' => $city, 'address' => 'Av. Roca 1240', 'phone' => '+54 298 4421890', 'contact' => 'Carlos Muñoz - Dueño', 'painPoint' => 'Pierde consultas por WhatsApp sin respuesta automática', 'score' => 8, 'rating' => '4.1', 'priceLevel' => '$$', 'distance' => 1.2, 'guiacoresUrl' => 'https://www.guiacores.com.ar/comercio/distribucion/' . sanitize_title( $city ) ),
				array( 'company' => "Comercial Patagónica {$industry}", 'industry' => $industry, 'amount' => 220000, 'city' => $city, 'address' => 'Belgrano 567', 'phone' => '+54 299 4432120', 'contact' => 'Laura Gómez - Socia', 'painPoint' => 'Sin CRM para seguimiento de clientes frecuentes', 'score' => 7, 'rating' => '3.8', 'priceLevel' => '$$', 'distance' => 3.5, 'guiacoresUrl' => 'https://www.guiacores.com.ar/comercio/' . sanitize_title( $city ) ),
				array( 'company' => "Negocios del Sur SA", 'industry' => $industry, 'amount' => 300000, 'city' => $city, 'address' => 'San Martín 890', 'phone' => '+54 298 4455678', 'contact' => 'Roberto Ibáñez - Gerente', 'painPoint' => 'Cobros manuales y facturación lenta', 'score' => 9, 'rating' => '4.5', 'priceLevel' => '$$$', 'distance' => 0.8, 'guiacoresUrl' => 'https://www.guiacores.com.ar/negocios-del-sur' ),
				array( 'company' => "Casa Central {$city}", 'industry' => $industry, 'amount' => 165000, 'city' => $city, 'address' => 'Mitre 322', 'phone' => '+54 298 4467890', 'contact' => 'Andrea Vázquez - Encargada', 'painPoint' => 'No tiene presencia digital ni sistema de turnos', 'score' => 7, 'rating' => '4.0', 'priceLevel' => '$', 'distance' => 2.1, 'guiacoresUrl' => 'https://www.guiacores.com.ar/casa-central' ),
			),
			'_source' => 'fallback',
		);
	}

	// ── AI: Generate Outreach ─────────────────────────────────────────── //

	private function generate_outreach( array $body ): \WP_REST_Response {
		$company   = sanitize_text_field( $body['company']   ?? 'la empresa' );
		$contact   = sanitize_text_field( $body['contact']   ?? 'el contacto' );
		$industry  = sanitize_text_field( $body['industry']  ?? 'el rubro' );
		$painPoint = sanitize_text_field( $body['painPoint'] ?? 'mejora de procesos' );

		$prompt = "Sos un experto en ventas B2B para Clientum, plataforma CRM + chatbot WhatsApp para PyMEs argentinas.
Generá una campaña de outreach personalizada para: Empresa: {$company}, Contacto: {$contact}, Rubro: {$industry}, Dolor: {$painPoint}.

Respondé ÚNICAMENTE con JSON válido (sin markdown):
{
  \"email1Subject\": \"string (asunto email de apertura)\",
  \"email1Body\": \"string (email de apertura, 3-4 párrafos, tono consultivo, mencionar {$company} y su dolor)\",
  \"email2Subject\": \"string (asunto seguimiento)\",
  \"email2Body\": \"string (email de seguimiento con dato de conversión, 2-3 párrafos)\",
  \"email3Subject\": \"string (asunto cierre)\",
  \"email3Body\": \"string (email de cierre/break-up, 1-2 párrafos directos)\",
  \"linkedinSequence\": [
    {\"day\": 0, \"type\": \"connection\", \"message\": \"string (nota de conexión ≤300 chars)\"},
    {\"day\": 2, \"type\": \"value\", \"message\": \"string (contenido de valor)\"},
    {\"day\": 4, \"type\": \"pitch\", \"message\": \"string (propuesta directa)\"},
    {\"day\": 7, \"type\": \"followup\", \"message\": \"string (seguimiento final)\"}
  ],
  \"phoneScript\": \"string (guion telefónico completo de 60 segundos, include apertura, pregunta dolor, propuesta y cierre)\"
}";

		$result = AiProvider::generate( $prompt, 'text', 2048 );

		if ( ! $result['success'] ) {
			return new \WP_REST_Response( $this->fallback_outreach( $company, $contact, $painPoint ) );
		}

		$content = trim( $result['content'] );
		$content = preg_replace( '/^```json\s*/i', '', $content );
		$content = preg_replace( '/```\s*$/', '', $content );
		$parsed  = json_decode( $content, true );

		if ( ! $parsed ) {
			return new \WP_REST_Response( $this->fallback_outreach( $company, $contact, $painPoint ) );
		}

		return new \WP_REST_Response( $parsed );
	}

	private function fallback_outreach( string $company, string $contact, string $painPoint ): array {
		$first = explode( ' ', $contact )[0];
		return array(
			'email1Subject' => "Consulta rápida para {$company} — Automatización WhatsApp",
			'email1Body'    => "Hola {$first},\n\nSé que en {$company} el tiempo vale. Por eso voy directo al punto: ¿cuántas consultas por WhatsApp queda sin respuesta hoy por falta de tiempo o personal?\n\nClientum instala un bot inteligente que responde al instante, califica leads y los pasa al CRM sin que tengas que hacer nada manual. Se activa en 5 días y el retorno se ve en el primer mes.\n\n¿Podemos hablar 15 minutos esta semana?\n\nSaludos,\nEquipo Clientum\ninfo@clientum.com.ar | +54 9 298 451-0883",
			'email2Subject' => "Re: Consulta para {$company} — Un dato de conversión",
			'email2Body'    => "Hola {$first},\n\nLos negocios de tu rubro que implementaron el bot de WhatsApp de Clientum aumentaron sus ventas un 40% el primer mes, respondiendo consultas en menos de 2 minutos.\n\n¿Agendamos una demo rápida de 15 minutos para mostrarte cómo funciona para {$company}?\n\nSaludos,\nEquipo Clientum",
			'email3Subject' => "Último intento — Solución para {$company}",
			'email3Body'    => "Hola {$first},\n\nNo quiero insistir si no es el momento. Pero si el tema de {$painPoint} sigue siendo un desafío, Clientum se instala en 5 días y se paga solo con 2 ventas ganadas.\n\n¿Lo hablamos?\n\nSaludos,\nEquipo Clientum",
			'linkedinSequence' => array(
				array( 'day' => 0, 'type' => 'connection', 'message' => "Hola {$first}, vi que manejás {$company}. Me dedico a ayudar a PyMEs de la Patagonia a automatizar su atención y ventas por WhatsApp. ¿Te parece si conectamos?" ),
				array( 'day' => 2, 'type' => 'value', 'message' => "Compartí un artículo sobre cómo los negocios locales reducen el tiempo de respuesta a leads en un 80% con automatización de WhatsApp. Muy aplicable al rubro {$company}." ),
				array( 'day' => 4, 'type' => 'pitch', 'message' => "Hola {$first}, quería comentarte que Clientum ya trabaja con negocios similares a {$company} en Roca y Neuquén. ¿Tenés 15 minutos para ver si puede ayudarte con {$painPoint}?" ),
				array( 'day' => 7, 'type' => 'followup', 'message' => "Un último mensaje, {$first}. Si no es el momento, lo entiendo. Pero si querés ver cómo otros negocios como {$company} están cerrando más ventas con menos esfuerzo, aquí estoy." ),
			),
			'phoneScript' => "Hola {$first}, ¿cómo estás? Te habla [Tu nombre] de Clientum. Tengo una pregunta rápida: ¿en {$company} están dando abasto con las consultas que entran por WhatsApp, o se les van clientes por no responder a tiempo?\n\n[Pausa — escuchar]\n\nEntiendo. Nosotros ayudamos a negocios de tu rubro a resolver exactamente eso con un bot que responde al instante y organiza todo en un CRM. Se instala en 5 días, sin código. ¿Podemos hacer una demo rápida de 15 minutos esta semana?",
			'_fallback' => true,
		);
	}

	// ── AI: Deep Research ─────────────────────────────────────────────── //

	private function research_prospect( array $body ): \WP_REST_Response {
		$company  = sanitize_text_field( $body['company']  ?? '' );
		$industry = sanitize_text_field( $body['industry'] ?? '' );
		$city     = sanitize_text_field( $body['city']     ?? '' );

		$prompt = "Sos un investigador de prospección B2B para Patagonia argentina.
Investigá el prospecto: Empresa: {$company}, Rubro: {$industry}, Ciudad: {$city}.

Respondé ÚNICAMENTE con JSON válido (sin markdown):
{
  \"keyContacts\": [
    {\"name\": \"string\", \"email\": \"string\", \"linkedin\": \"string\", \"title\": \"string\"}
  ],
  \"buyingSignals\": [\"string\", \"string\", \"string\"],
  \"fitScore\": número entre 6 y 10,
  \"fitReasoning\": \"string (1-2 oraciones explicando el fit)\",
  \"phone\": \"string\",
  \"address\": \"string\",
  \"revenueEstimate\": \"string\",
  \"employeeEstimate\": \"string\",
  \"techStack\": [\"string\"],
  \"socialPresence\": \"string\"
}";

		$result = AiProvider::generate( $prompt, 'text', 1024 );

		if ( ! $result['success'] ) {
			return new \WP_REST_Response( array(
				'keyContacts'     => array( array( 'name' => 'Contacto Principal', 'email' => 'info@' . sanitize_title( $company ) . '.com.ar', 'linkedin' => '', 'title' => 'Dueño/a' ) ),
				'buyingSignals'   => array( 'Negocio activo con presencia en guia local', 'Sin presencia digital automatizada detectada', 'Rubro con alta demanda de atención al cliente' ),
				'fitScore'        => 7,
				'fitReasoning'    => "El negocio {$company} en {$city} tiene perfil compatible con Clientum por su tamaño y rubro.",
				'phone'           => '+54 298 4400000',
				'address'         => "{$city}, Patagonia",
				'revenueEstimate' => '$1.5M–$5M ARS/año',
				'employeeEstimate'=> '5–15 personas',
				'techStack'       => array( 'WhatsApp Business', 'Excel', 'Sin CRM detectado' ),
				'socialPresence'  => 'Perfil de Instagram con actividad moderada',
				'_fallback'       => true,
			) );
		}

		$content = trim( $result['content'] );
		$content = preg_replace( '/^```json\s*/i', '', $content );
		$content = preg_replace( '/```\s*$/', '', $content );
		$parsed  = json_decode( $content, true );

		if ( ! $parsed ) {
			return new \WP_REST_Response( array( 'message' => 'Parse error', 'raw' => substr( $content, 0, 300 ) ), 422 );
		}

		return new \WP_REST_Response( $parsed );
	}

	// ── Export CSV ─────────────────────────────────────────────────────── //

	public function export_csv(): void {
		global $wpdb;
		$table = $wpdb->prefix . 'aime_prospector_deals';
		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
		$rows  = $wpdb->get_results( "SELECT * FROM {$table} ORDER BY created_at DESC", ARRAY_A );

		header( 'Content-Type: text/csv; charset=utf-8' );
		header( 'Content-Disposition: attachment; filename="ai_client_prospector_pipeline.csv"' );

		$out = fopen( 'php://output', 'w' );
		fputcsv( $out, array( 'ID', 'Empresa', 'Monto_ARS', 'Etapa_CRM', 'Rubro', 'Ciudad', 'Direccion', 'Telefono', 'Contacto', 'Dolor_Atencion', 'MEDDIC_Score', 'Fit_Score', 'Creado' ) );

		foreach ( $rows as $row ) {
			fputcsv( $out, array(
				$row['id'], $row['company'], $row['amount'], $row['stage'],
				$row['industry'], $row['city'], $row['address'], $row['phone'],
				$row['contact'], $row['pain_point'], $row['meddic_score'],
				$row['fit_score'], $row['created_at'],
			) );
		}

		fclose( $out );
		exit;
	}

	// ── Helpers ────────────────────────────────────────────────────────── //

	private function extract_deal_fields( array $data ): array {
		$text  = fn( $k, $d = '' ) => sanitize_text_field( $data[ $k ] ?? $d );
		$int   = fn( $k, $d = 0 )  => (int) ( $data[ $k ] ?? $d );
		$float = fn( $k, $d = 0.0 ) => (float) ( $data[ $k ] ?? $d );
		$json  = fn( $k )           => wp_json_encode( $data[ $k ] ?? null );

		return array_filter( array(
			'company'             => isset( $data['company'] )            ? $text( 'company' ) : null,
			'amount'              => isset( $data['amount'] )             ? $float( 'amount', 180000 ) : null,
			'stage'               => isset( $data['stage'] )              ? $text( 'stage', 'leads' ) : null,
			'industry'            => isset( $data['industry'] )           ? $text( 'industry' ) : null,
			'city'                => isset( $data['city'] )               ? $text( 'city' ) : null,
			'address'             => isset( $data['address'] )            ? $text( 'address' ) : null,
			'phone'               => isset( $data['phone'] )              ? $text( 'phone' ) : null,
			'contact'             => isset( $data['contact'] )            ? $text( 'contact' ) : null,
			'contact_email'       => isset( $data['contactEmail'] )       ? sanitize_email( $data['contactEmail'] ) : null,
			'contact_linkedin'    => isset( $data['contactLinkedin'] )    ? esc_url_raw( $data['contactLinkedin'] ) : null,
			'contact_title'       => isset( $data['contactTitle'] )       ? $text( 'contactTitle' ) : null,
			'pain_point'          => isset( $data['painPoint'] )          ? sanitize_textarea_field( $data['painPoint'] ) : null,
			'buying_signals'      => isset( $data['buyingSignals'] )      ? $json( 'buyingSignals' ) : null,
			'fit_score'           => isset( $data['fitScore'] )           ? $int( 'fitScore', 5 ) : null,
			'fit_reasoning'       => isset( $data['fitReasoning'] )       ? sanitize_textarea_field( $data['fitReasoning'] ) : null,
			'guiacores_url'       => isset( $data['guiacoresUrl'] )       ? esc_url_raw( $data['guiacoresUrl'] ) : null,
			'rating'              => isset( $data['rating'] )             ? $text( 'rating' ) : null,
			'price_level'         => isset( $data['priceLevel'] )         ? $text( 'priceLevel' ) : null,
			'distance_km'         => isset( $data['distance'] )           ? $float( 'distance' ) : null,
			'meddic_metrics'      => isset( $data['meddicMetrics'] )      ? $int( 'meddicMetrics', 3 ) : null,
			'meddic_buyer'        => isset( $data['meddicBuyer'] )        ? $int( 'meddicBuyer', 3 ) : null,
			'meddic_criteria'     => isset( $data['meddicCriteria'] )     ? $int( 'meddicCriteria', 3 ) : null,
			'meddic_process'      => isset( $data['meddicProcess'] )      ? $int( 'meddicProcess', 3 ) : null,
			'meddic_pain'         => isset( $data['meddicPain'] )         ? $int( 'meddicPain', 3 ) : null,
			'meddic_champion'     => isset( $data['meddicChampion'] )     ? $int( 'meddicChampion', 3 ) : null,
			'meddic_score'        => isset( $data['meddicScore'] )        ? $int( 'meddicScore', 40 ) : null,
			'meddic_red_flags'    => isset( $data['meddicRedFlags'] )     ? sanitize_textarea_field( $data['meddicRedFlags'] ) : null,
			'meddic_next_actions' => isset( $data['meddicNextActions'] )  ? $json( 'meddicNextActions' ) : null,
			'outreach_email1'     => isset( $data['outreachEmail1'] )     ? wp_kses_post( $data['outreachEmail1'] ) : null,
			'outreach_email2'     => isset( $data['outreachEmail2'] )     ? wp_kses_post( $data['outreachEmail2'] ) : null,
			'outreach_email3'     => isset( $data['outreachEmail3'] )     ? wp_kses_post( $data['outreachEmail3'] ) : null,
			'outreach_linkedin'   => isset( $data['outreachLinkedin'] )   ? $json( 'outreachLinkedin' ) : null,
			'outreach_phone_script' => isset( $data['outreachPhoneScript'] ) ? sanitize_textarea_field( $data['outreachPhoneScript'] ) : null,
		), fn( $v ) => $v !== null );
	}

	private function format_deal( array $row ): array {
		return array(
			'id'                 => (int) $row['id'],
			'company'            => $row['company'],
			'amount'             => (float) $row['amount'],
			'stage'              => $row['stage'],
			'industry'           => $row['industry'],
			'city'               => $row['city'],
			'address'            => $row['address'],
			'phone'              => $row['phone'],
			'contact'            => $row['contact'],
			'contactEmail'       => $row['contact_email'],
			'contactLinkedin'    => $row['contact_linkedin'],
			'contactTitle'       => $row['contact_title'],
			'painPoint'          => $row['pain_point'],
			'buyingSignals'      => json_decode( $row['buying_signals'] ?? 'null' ),
			'fitScore'           => (int) $row['fit_score'],
			'fitReasoning'       => $row['fit_reasoning'],
			'guiacoresUrl'       => $row['guiacores_url'],
			'rating'             => $row['rating'],
			'priceLevel'         => $row['price_level'],
			'distance'           => $row['distance_km'] !== null ? (float) $row['distance_km'] : null,
			'meddicMetrics'      => (int) $row['meddic_metrics'],
			'meddicBuyer'        => (int) $row['meddic_buyer'],
			'meddicCriteria'     => (int) $row['meddic_criteria'],
			'meddicProcess'      => (int) $row['meddic_process'],
			'meddicPain'         => (int) $row['meddic_pain'],
			'meddicChampion'     => (int) $row['meddic_champion'],
			'meddicScore'        => (int) $row['meddic_score'],
			'meddicRedFlags'     => $row['meddic_red_flags'],
			'meddicNextActions'  => json_decode( $row['meddic_next_actions'] ?? 'null' ),
			'outreachEmail1'     => $row['outreach_email1'],
			'outreachEmail2'     => $row['outreach_email2'],
			'outreachEmail3'     => $row['outreach_email3'],
			'outreachLinkedin'   => json_decode( $row['outreach_linkedin'] ?? 'null' ),
			'outreachPhoneScript'=> $row['outreach_phone_script'],
			'createdAt'          => $row['created_at'],
			'updatedAt'          => $row['updated_at'],
		);
	}
}
