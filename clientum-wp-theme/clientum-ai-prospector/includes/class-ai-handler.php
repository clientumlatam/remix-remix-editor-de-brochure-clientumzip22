<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class CAP_AI_Handler {

    /**
     * Llama a la API de Google Gemini.
     *
     * @param string $prompt
     * @param bool   $json_mode  Si true, fuerza respuesta JSON.
     * @return array|WP_Error
     */
    public static function generate( string $prompt, bool $json_mode = false ) {
        $api_key = get_option( 'cap_gemini_api_key', '' );
        if ( empty( $api_key ) ) {
            return new WP_Error( 'no_api_key', 'Gemini API key no configurada. Andá a Clientum → Configuración.' );
        }

        $model    = 'gemini-2.0-flash-001';
        $endpoint = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key=" . urlencode( $api_key );

        $body = [
            'contents' => [
                [ 'parts' => [ [ 'text' => $prompt ] ] ]
            ],
        ];

        if ( $json_mode ) {
            $body['generationConfig'] = [ 'responseMimeType' => 'application/json' ];
        }

        $response = wp_remote_post( $endpoint, [
            'headers'     => [ 'Content-Type' => 'application/json' ],
            'body'        => wp_json_encode( $body ),
            'timeout'     => 60,
            'data_format' => 'body',
        ] );

        if ( is_wp_error( $response ) ) return $response;

        $code = wp_remote_retrieve_response_code( $response );
        $raw  = wp_remote_retrieve_body( $response );
        $data = json_decode( $raw, true );

        if ( $code !== 200 ) {
            $msg = $data['error']['message'] ?? "HTTP $code";
            return new WP_Error( 'gemini_error', $msg );
        }

        $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
        return [ 'text' => $text ];
    }

    /* ── Acciones de brochure ───────────────────────────────────────────── */

    public static function handle_generate_industry_copy( array $payload ) {
        $industry = sanitize_text_field( $payload['industry'] ?? '' );
        if ( ! $industry ) return new WP_Error( 'missing_industry', 'industry requerido' );

        $prompt = "Eres copywriter experto en SaaS B2B para PyMEs argentinas. "
            . "Genera textos de brochure corporativo de Clientum (CRM + ERP + IA) para la industria: {$industry}. "
            . "Devuelve JSON con: slogan (string), hero_subtitle (string), "
            . "pillar_1_title, pillar_1_desc, pillar_2_title, pillar_2_desc, pillar_3_title, pillar_3_desc (strings), "
            . "industry_headline (string), industry_paragraph (string).";

        return self::generate( $prompt, true );
    }

    public static function handle_optimize_copy( array $payload ) {
        $text = sanitize_textarea_field( $payload['text'] ?? '' );
        $goal = sanitize_text_field( $payload['goal'] ?? 'conversión' );
        if ( ! $text ) return new WP_Error( 'missing_text', 'text requerido' );

        $prompt = "Optimiza el siguiente texto de marketing B2B para el objetivo: {$goal}.\n"
            . "Texto original:\n{$text}\n\n"
            . "Devuelve solo el texto mejorado, sin explicaciones.";

        return self::generate( $prompt );
    }

    public static function handle_generate_image_prompt( array $payload ) {
        $industry   = sanitize_text_field( $payload['industry'] ?? '' );
        $page       = intval( $payload['pageNumber'] ?? 1 );
        $custom     = sanitize_text_field( $payload['customPrompt'] ?? '' );

        $prompt = $custom ?: "Prompt profesional para imagen de brochure corporativo, página {$page}, industria: {$industry}. "
            . "Estilo: fotografía ejecutiva moderna, colores azul marino y verde, formato landscape 16:9.";

        return self::generate( $prompt );
    }

    public static function handle_translate_brochure( array $payload ) {
        $texts  = $payload['texts'] ?? [];
        $lang   = sanitize_text_field( $payload['targetLanguage'] ?? 'en' );
        if ( empty( $texts ) ) return new WP_Error( 'missing_texts', 'texts requerido' );

        $json_in = wp_json_encode( $texts );
        $prompt  = "Traduce los siguientes textos de brochure al idioma '{$lang}'. "
            . "Devuelve exactamente el mismo JSON con los valores traducidos:\n{$json_in}";

        return self::generate( $prompt, true );
    }

    /* ── ICP Builder ────────────────────────────────────────────────────── */

    public static function handle_icp( array $payload ) {
        $industry = sanitize_text_field( $payload['industry'] ?? '' );
        $acv      = sanitize_text_field( $payload['acv'] ?? '' );

        $prompt = "Eres experto en ventas B2B en Argentina. "
            . "Define el ICP (Ideal Customer Profile) para una PyME de la industria '{$industry}' "
            . "con ACV estimado {$acv}. "
            . "Devuelve JSON con: company_size (string), decision_maker_title (string), "
            . "pain_points (array de 5 strings), qualifying_questions (array de 5 strings), "
            . "disqualifiers (array de 3 strings), value_props (array de 4 strings).";

        return self::generate( $prompt, true );
    }

    /* ── MEDDIC ─────────────────────────────────────────────────────────── */

    public static function handle_meddic( array $payload ) {
        $company = sanitize_text_field( $payload['company'] ?? '' );
        $notes   = sanitize_textarea_field( $payload['notes'] ?? '' );

        $prompt = "Eres consultor de ventas MEDDIC experto. "
            . "Analiza el siguiente lead: Empresa: {$company}. Notas: {$notes}. "
            . "Devuelve JSON con puntajes (0-10) y recomendaciones para cada categoría MEDDIC: "
            . "metrics, economic_buyer, decision_criteria, decision_process, identify_pain, champion. "
            . "Estructura: { metrics: { score: number, notes: string }, ... }. "
            . "Agrega también: overall_score (number 0-100), red_flags (array de strings), next_steps (array de strings).";

        return self::generate( $prompt, true );
    }

    /* ── Outreach ───────────────────────────────────────────────────────── */

    public static function handle_outreach( array $payload ) {
        $industry = sanitize_text_field( $payload['industry'] ?? '' );
        $company  = sanitize_text_field( $payload['company'] ?? '' );
        $contact  = sanitize_text_field( $payload['contactName'] ?? '' );
        $channel  = sanitize_text_field( $payload['channel'] ?? 'email' );
        $sequence = intval( $payload['sequence'] ?? 1 );

        $prompt = "Eres experto en outreach B2B para el mercado argentino. "
            . "Escribe un mensaje de prospección {$channel} #{$sequence} para: "
            . "Empresa: {$company}, Industria: {$industry}, Contacto: {$contact}. "
            . "El mensaje debe ser profesional, personalizado y orientado a agendar una reunión. "
            . "Devuelve JSON con: subject (string, solo para email), body (string), "
            . "call_to_action (string).";

        return self::generate( $prompt, true );
    }

    /* ── Copiloto IA ────────────────────────────────────────────────────── */

    public static function handle_copilot( array $payload ) {
        $question = sanitize_textarea_field( $payload['question'] ?? '' );
        $context  = sanitize_textarea_field( $payload['context'] ?? '' );

        if ( ! $question ) return new WP_Error( 'missing_question', 'question requerido' );

        $prompt = "Eres el Copiloto IA de Clientum, asistente de ventas B2B para PyMEs argentinas. "
            . ( $context ? "Contexto del usuario:\n{$context}\n\n" : '' )
            . "Pregunta: {$question}\n\n"
            . "Responde de forma clara, práctica y en español argentino.";

        return self::generate( $prompt );
    }

    /* ── Patagonia Explorer: prospección de leads ─────────────────────────── */

    public static function handle_prospect_leads( array $payload ) {
        $city     = sanitize_text_field( $payload['city']     ?? '' );
        $industry = sanitize_text_field( $payload['industry'] ?? '' );
        if ( ! $city || ! $industry ) return new WP_Error( 'missing_params', 'city e industry requeridos' );

        // 1) Apify Google Maps scraper (datos reales o demo si no hay token)
        $query   = "{$industry} en {$city}";
        $scraped = CAP_Scraper::scrape_places( $query, 20, 'es' );
        if ( ! is_wp_error( $scraped ) && ! empty( $scraped ) ) {
            $is_demo   = ! empty( $scraped[0]['_demo'] );
            $prospects = array_map( function ( $place ) use ( $city, $industry ) {
                $website    = $place['website'] ?? '';
                $rating     = $place['rating']  ?? 0;
                $phone      = $place['phone']   ?: 'Sin teléfono';
                $pain_point = 'Falta de automatización en la respuesta de consultas comerciales.';
                $score      = 7;
                if ( ! $website ) {
                    $pain_point = 'No cuenta con página web institucional ni catálogo digital.';
                    $score = 9;
                } elseif ( $rating && $rating < 4.2 ) {
                    $pain_point = "Calificación de {$rating} estrellas en Google Maps por demoras en atención.";
                    $score = 8;
                }
                return [
                    'company'      => $place['name'] ?? 'Empresa sin nombre',
                    'industry'     => $industry,
                    'amount'       => 180000,
                    'city'         => $city,
                    'address'      => $place['address'] ?: "Dirección en {$city}",
                    'phone'        => $phone,
                    'contact'      => null,
                    'painPoint'    => $pain_point,
                    'score'        => $score,
                    'guiacoresUrl' => 'https://www.google.com/search?q=' . rawurlencode( ( $place['name'] ?? '' ) . ' ' . $city ),
                    'rating'       => $rating,
                    'website'      => $website,
                ];
            }, $scraped );

            return [ 'text' => wp_json_encode( [ 'prospects' => $prospects ] ), 'isRealScraped' => ! $is_demo ];
        }

        // 2) Fallback: buscarlos vía Gemini con Google Search grounding
        $prompt = "Actúa como un agente experto en prospección de datos reales (sales intelligence) en Argentina. "
            . "Busca 10 empresas reales en la ciudad de '{$city}' del rubro '{$industry}'. "
            . "Para cada una devolvé: company, industry, amount (monto mensual estimado en ARS entre 120000 y 480000), "
            . "city, address, phone, contact, painPoint, score (0-10), guiacoresUrl. "
            . "Devuelve exclusivamente un JSON con la forma { \"prospects\": [ ... ] }, sin markdown.";

        return self::generate( $prompt, true );
    }
}
