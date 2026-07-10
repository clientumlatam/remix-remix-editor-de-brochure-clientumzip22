<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class CAP_Scraper {

    /**
     * Busca negocios en Google Maps vía Apify Actor (crawlee/google-maps-scraper).
     *
     * @param string $query    Ej: "inmobiliarias Neuquén"
     * @param int    $max      Máximo de resultados
     * @param string $language Ej: "es"
     * @return array|WP_Error
     */
    public static function scrape_places( string $query, int $max = 20, string $language = 'es' ) {
        $apify_token = get_option( 'cap_apify_token', '' );

        if ( empty( $apify_token ) ) {
            // Fallback: datos de demostración si no hay token Apify
            return self::demo_results( $query, $max );
        }

        $actor_id = 'apify~google-maps-scraper';
        $endpoint = "https://api.apify.com/v2/acts/{$actor_id}/run-sync-get-dataset-items"
                  . "?token=" . urlencode( $apify_token )
                  . "&timeout=60&maxItems={$max}";

        $body = [
            'searchStringsArray' => [ $query ],
            'maxCrawledPlaces'   => $max,
            'language'           => $language,
            'includeReviews'     => false,
            'exportPlaceUrls'    => false,
        ];

        $response = wp_remote_post( $endpoint, [
            'headers'     => [ 'Content-Type' => 'application/json' ],
            'body'        => wp_json_encode( $body ),
            'timeout'     => 90,
            'data_format' => 'body',
        ] );

        if ( is_wp_error( $response ) ) return $response;

        $code = wp_remote_retrieve_response_code( $response );
        $raw  = wp_remote_retrieve_body( $response );
        $data = json_decode( $raw, true );

        if ( $code !== 200 && $code !== 201 ) {
            return new WP_Error( 'apify_error', "Apify HTTP $code: " . ( $data['error']['message'] ?? $raw ) );
        }

        if ( ! is_array( $data ) ) {
            return new WP_Error( 'apify_parse', 'Respuesta inválida de Apify' );
        }

        return array_map( [ __CLASS__, 'normalize_place' ], $data );
    }

    private static function normalize_place( array $place ): array {
        return [
            'name'    => $place['title']         ?? $place['name'] ?? '',
            'address' => $place['address']       ?? '',
            'phone'   => $place['phone']         ?? '',
            'website' => $place['website']       ?? '',
            'rating'  => floatval( $place['totalScore'] ?? $place['rating'] ?? 0 ),
            'reviews' => intval( $place['reviewsCount'] ?? $place['reviews'] ?? 0 ),
            'lat'     => floatval( $place['location']['lat'] ?? 0 ),
            'lng'     => floatval( $place['location']['lng'] ?? 0 ),
            'category'=> $place['category']      ?? $place['categoryName'] ?? '',
        ];
    }

    /** Datos de demostración cuando no hay token Apify */
    private static function demo_results( string $query, int $max ): array {
        $base = [
            [ 'name' => 'Empresa Demo 1',    'address' => 'Av. San Martín 1234, Neuquén', 'phone' => '299 4XX-XXXX', 'website' => 'https://demo1.com.ar', 'rating' => 4.5, 'reviews' => 38, 'lat' => -38.9516, 'lng' => -68.0591, 'category' => 'Empresa' ],
            [ 'name' => 'Empresa Demo 2',    'address' => 'Ruta 22 km 12, Cipolletti',    'phone' => '299 4XX-XXXX', 'website' => 'https://demo2.com.ar', 'rating' => 4.1, 'reviews' => 15, 'lat' => -38.9345, 'lng' => -67.9968, 'category' => 'Empresa' ],
            [ 'name' => 'Empresa Demo 3',    'address' => 'Mitre 450, Bariloche',          'phone' => '294 4XX-XXXX', 'website' => 'https://demo3.com.ar', 'rating' => 4.8, 'reviews' => 72, 'lat' => -41.1335, 'lng' => -71.3103, 'category' => 'Empresa' ],
            [ 'name' => 'Empresa Demo 4',    'address' => 'San Martín 789, Mendoza',       'phone' => '261 4XX-XXXX', 'website' => '',                      'rating' => 3.9, 'reviews' => 9,  'lat' => -32.8895, 'lng' => -68.8458, 'category' => 'Empresa' ],
            [ 'name' => 'Empresa Demo 5',    'address' => 'Belgrano 321, Córdoba',         'phone' => '351 4XX-XXXX', 'website' => 'https://demo5.com.ar', 'rating' => 4.3, 'reviews' => 44, 'lat' => -31.4201, 'lng' => -64.1888, 'category' => 'Empresa' ],
        ];

        // Nota en la respuesta para que el front sepa que son datos demo
        $results = array_slice( $base, 0, min( $max, count( $base ) ) );
        foreach ( $results as &$r ) {
            $r['_demo'] = true;
        }
        return $results;
    }
}
