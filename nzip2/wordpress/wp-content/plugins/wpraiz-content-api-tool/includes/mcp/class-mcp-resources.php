<?php
namespace WPRaiz\ContentAPI\MCP;

if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * MCP Resources — read-only data sources for AI agent context.
 */
class MCP_Resources {

    /**
     * Get resource definitions.
     */
    public static function get_definitions(): array {
        return [
            [
                'uri'         => 'wpraiz://site-info',
                'name'        => 'Site Information',
                'description' => 'Basic site information: name, URL, WordPress version, active SEO plugin, WPRaiz version and Pro status.',
                'mimeType'    => 'application/json',
            ],
            [
                'uri'         => 'wpraiz://recent-posts',
                'name'        => 'Recent Posts',
                'description' => 'The 20 most recent published posts with title, URL, date, categories, and excerpt.',
                'mimeType'    => 'application/json',
            ],
            [
                'uri'         => 'wpraiz://categories',
                'name'        => 'Categories Tree',
                'description' => 'All post categories with hierarchy, post counts, and descriptions.',
                'mimeType'    => 'application/json',
            ],
            [
                'uri'         => 'wpraiz://content-stats',
                'name'        => 'Content Statistics',
                'description' => 'Content overview: total posts, posts per month, top categories, recent activity, and publishing trends.',
                'mimeType'    => 'application/json',
            ],
            [
                'uri'         => 'wpraiz://seo-config',
                'name'        => 'SEO Configuration',
                'description' => 'Active SEO plugin details and supported meta fields.',
                'mimeType'    => 'application/json',
            ],
        ];
    }

    /**
     * Read a resource by URI.
     */
    public static function read( string $uri ) {
        return match ( $uri ) {
            'wpraiz://site-info'     => self::get_site_info(),
            'wpraiz://recent-posts'  => self::get_recent_posts(),
            'wpraiz://categories'    => self::get_categories(),
            'wpraiz://content-stats' => self::get_content_stats(),
            'wpraiz://seo-config'    => self::get_seo_config(),
            default                  => [ 'error' => 'Unknown resource URI.' ],
        };
    }

    private static function get_site_info(): array {
        return [
            'name'       => get_bloginfo( 'name' ),
            'url'        => get_site_url(),
            'description'=> get_bloginfo( 'description' ),
            'wp_version' => get_bloginfo( 'version' ),
            'php_version'=> PHP_VERSION,
            'wpraiz'     => [
                'version' => WPRAIZ_VERSION,
                'pro'     => wpraiz_is_pro(),
            ],
            'seo_plugin' => \WPRaiz\ContentAPI\SEO_Handler::detect_plugin() ?: 'none',
            'timezone'   => wp_timezone_string(),
            'language'   => get_locale(),
        ];
    }

    private static function get_recent_posts(): array {
        $posts = get_posts( [
            'numberposts' => 20,
            'post_status' => 'publish',
            'post_type'   => 'post',
            'orderby'     => 'date',
            'order'       => 'DESC',
        ] );

        return array_map( function ( $post ) {
            $cats = get_the_category( $post->ID );
            return [
                'id'         => $post->ID,
                'title'      => $post->post_title,
                'url'        => get_permalink( $post->ID ),
                'date'       => get_the_date( 'Y-m-d', $post ),
                'excerpt'    => wp_trim_words( $post->post_excerpt ?: $post->post_content, 30 ),
                'categories' => array_map( fn( $c ) => $c->name, $cats ),
                'status'     => $post->post_status,
            ];
        }, $posts );
    }

    private static function get_categories(): array {
        $cats = get_categories( [
            'hide_empty' => false,
            'orderby'    => 'count',
            'order'      => 'DESC',
        ] );

        return array_map( fn( $c ) => [
            'id'          => $c->term_id,
            'name'        => $c->name,
            'slug'        => $c->slug,
            'count'       => $c->count,
            'parent'      => $c->parent,
            'description' => $c->description,
        ], $cats );
    }

    private static function get_content_stats(): array {
        global $wpdb;

        $total = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_status='publish' AND post_type='post'" );
        $drafts = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_status='draft' AND post_type='post'" );

        // Posts per month (last 6 months)
        $monthly = $wpdb->get_results(
            "SELECT DATE_FORMAT(post_date, '%Y-%m') as month, COUNT(*) as count
             FROM {$wpdb->posts}
             WHERE post_status='publish' AND post_type='post'
             AND post_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
             GROUP BY month ORDER BY month DESC",
            ARRAY_A
        );

        // Top categories
        $top_cats = get_categories( [
            'orderby'    => 'count',
            'order'      => 'DESC',
            'number'     => 10,
            'hide_empty' => true,
        ] );

        return [
            'total_published' => $total,
            'total_drafts'    => $drafts,
            'monthly_trend'   => $monthly ?: [],
            'top_categories'  => array_map( fn( $c ) => [
                'name'  => $c->name,
                'count' => $c->count,
            ], $top_cats ),
            'avg_per_month'   => $monthly ? round( array_sum( array_column( $monthly, 'count' ) ) / count( $monthly ), 1 ) : 0,
        ];
    }

    private static function get_seo_config(): array {
        $plugin = \WPRaiz\ContentAPI\SEO_Handler::detect_plugin();

        $meta_fields = match ( $plugin ) {
            'seopress'  => [ 'title' => '_seopress_titles_title', 'desc' => '_seopress_titles_desc' ],
            'yoastseo'  => [ 'title' => '_yoast_wpseo_title', 'desc' => '_yoast_wpseo_metadesc' ],
            'rankmath'  => [ 'title' => 'rank_math_title', 'desc' => 'rank_math_description' ],
            default     => [ 'title' => 'none', 'desc' => 'none' ],
        };

        return [
            'active_plugin' => $plugin ?: 'none',
            'meta_fields'   => $meta_fields,
            'note'          => 'WPRaiz writes to all three SEO plugins simultaneously for maximum compatibility.',
        ];
    }
}
