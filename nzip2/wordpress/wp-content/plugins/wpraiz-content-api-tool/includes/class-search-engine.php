<?php
namespace WPRaiz\ContentAPI;

if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Search engine — similar posts, categories, content discovery.
 */
class Search_Engine {

    public function __construct() {
        add_action( 'rest_api_init', [ $this, 'register_routes' ] );
    }

    public function register_routes() {
        // Search similar posts
        register_rest_route( 'wpraiz/v2', '/search-similar', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'search_similar' ],
            'permission_callback' => '__return_true',
            'args'                => [
                'title' => [
                    'required'          => true,
                    'type'              => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
                'limit' => [
                    'type'    => 'integer',
                    'default' => 10,
                    'minimum' => 1,
                    'maximum' => 50,
                ],
                'post_type' => [
                    'type'    => 'string',
                    'default' => 'post',
                ],
            ],
        ]);

        // Get categories
        register_rest_route( 'wpraiz/v2', '/categories', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'get_categories' ],
            'permission_callback' => '__return_true',
        ]);

        // ── Legacy v1 ──
        register_rest_route( 'api-post-creator/v1', '/search-similar-posts', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'search_similar' ],
            'permission_callback' => '__return_true',
        ]);
        register_rest_route( 'api-post-creator/v1', '/get-categories', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'get_categories' ],
            'permission_callback' => '__return_true',
        ]);
    }

    /**
     * Search similar posts using Levenshtein distance + WP_Query pre-filter.
     *
     * Strategy:
     * 1. Extract keywords from query title
     * 2. WP_Query with 's' param to get candidates from DB (LIKE)
     * 3. Score each candidate with levenshtein()
     * 4. Sort by score, return top N
     */
    public function search_similar( \WP_REST_Request $request ) {
        $query_title = sanitize_text_field( $request->get_param( 'title' ) );
        $limit       = (int) ( $request->get_param( 'limit' ) ?? 10 );
        $post_type   = sanitize_key( $request->get_param( 'post_type' ) ?? 'post' );

        if ( empty( $query_title ) ) {
            return new \WP_Error( 'missing_title', __( 'Parameter "title" is required.', 'wpraiz-content-api' ), [ 'status' => 400 ] );
        }

        // Check cache
        $cache_key = 'wpraiz_sim_' . md5( $query_title . $post_type . $limit );
        $cached    = get_transient( $cache_key );
        if ( false !== $cached ) {
            return new \WP_REST_Response( $cached, 200 );
        }

        // Extract keywords for pre-filter (words with 3+ chars)
        $words    = preg_split( '/\s+/', $query_title );
        $keywords = array_filter( $words, fn( $w ) => mb_strlen( $w ) >= 3 );
        $search_q = implode( ' ', array_slice( $keywords, 0, 5 ) );

        // Get candidates via WP_Query
        $args = [
            'post_type'      => $post_type,
            'post_status'    => 'publish',
            'posts_per_page' => 200,
            'fields'         => 'ids',
            'no_found_rows'  => true,
        ];

        if ( ! empty( $search_q ) ) {
            $args['s'] = $search_q;
        }

        $query = new \WP_Query( $args );
        $post_ids = $query->posts;

        // If keyword search returned few results, do a broader search
        if ( count( $post_ids ) < 20 ) {
            $broad_args = [
                'post_type'      => $post_type,
                'post_status'    => 'publish',
                'posts_per_page' => 500,
                'fields'         => 'ids',
                'no_found_rows'  => true,
                'orderby'        => 'date',
                'order'          => 'DESC',
            ];
            $broad_query = new \WP_Query( $broad_args );
            $post_ids    = array_unique( array_merge( $post_ids, $broad_query->posts ) );
        }

        // Score each post
        $query_lower = mb_strtolower( $query_title );
        $query_len   = mb_strlen( $query_lower );
        $results     = [];

        foreach ( $post_ids as $pid ) {
            $post_title  = get_the_title( $pid );
            $title_lower = mb_strtolower( $post_title );

            // Levenshtein (capped at 255 chars)
            $lev_distance = levenshtein(
                mb_substr( $query_lower, 0, 255 ),
                mb_substr( $title_lower, 0, 255 )
            );

            // Normalize to 0-100 score (100 = identical)
            $max_len = max( $query_len, mb_strlen( $title_lower ), 1 );
            $score   = round( ( 1 - $lev_distance / $max_len ) * 100, 2 );

            // Bonus for substring match
            if ( str_contains( $title_lower, $query_lower ) || str_contains( $query_lower, $title_lower ) ) {
                $score = min( 100, $score + 15 );
            }

            // Word overlap bonus
            $title_words   = array_filter( preg_split( '/\s+/', $title_lower ), fn( $w ) => mb_strlen( $w ) >= 3 );
            $query_words   = array_filter( preg_split( '/\s+/', $query_lower ), fn( $w ) => mb_strlen( $w ) >= 3 );
            $common_words  = array_intersect( $query_words, $title_words );
            $overlap_ratio = count( $query_words ) > 0 ? count( $common_words ) / count( $query_words ) : 0;
            $score         = min( 100, $score + ( $overlap_ratio * 20 ) );

            $categories = get_the_category( $pid );

            $results[] = [
                'post_id'            => $pid,
                'title'              => $post_title,
                'score'              => round( $score, 2 ),
                'url'                => get_permalink( $pid ),
                'primary_category'   => $categories[0]->name ?? '',
                'secondary_category' => $categories[1]->name ?? '',
                'date'               => get_the_date( 'Y-m-d', $pid ),
            ];
        }

        // Sort by score DESC
        usort( $results, fn( $a, $b ) => $b['score'] <=> $a['score'] );

        $results = array_slice( $results, 0, $limit );

        // Cache for 1 hour
        set_transient( $cache_key, $results, HOUR_IN_SECONDS );

        return new \WP_REST_Response( $results, 200 );
    }

    /**
     * Get all categories.
     */
    public function get_categories() {
        $categories = get_categories( [
            'taxonomy'   => 'category',
            'hide_empty' => false,
        ]);

        $list = [];
        foreach ( $categories as $cat ) {
            $list[] = [
                'id'          => $cat->term_id,
                'name'        => $cat->name,
                'slug'        => $cat->slug,
                'description' => $cat->description,
                'count'       => $cat->count,
                'parent'      => $cat->parent,
            ];
        }

        return new \WP_REST_Response( $list, 200 );
    }

    /**
     * Get or create a category by name.
     */
    public static function get_or_create_category( string $name ) {
        $term = get_term_by( 'name', $name, 'category' );
        if ( $term ) {
            return $term->term_id;
        }

        $new_term = wp_insert_term( $name, 'category' );
        if ( is_wp_error( $new_term ) ) {
            return $new_term;
        }

        return $new_term['term_id'];
    }
}
