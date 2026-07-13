<?php
namespace WPRaiz\ContentAPI;

if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * SEO metadata handler — supports SEOPress, Yoast SEO, Rank Math.
 */
class SEO_Handler {

    /**
     * Detect active SEO plugin.
     */
    public static function detect_plugin(): ?string {
        if ( defined( 'SEOPRESS_VERSION' ) ) {
            return 'seopress';
        }
        if ( defined( 'WPSEO_VERSION' ) ) {
            return 'yoastseo';
        }
        if ( defined( 'RANK_MATH_VERSION' ) ) {
            return 'rankmath';
        }
        return null;
    }

    /**
     * Save SEO fields for a post. Writes to all supported plugins for maximum compat.
     *
     * @param int    $post_id
     * @param string $seo_title
     * @param string $seo_desc
     */
    public static function save_meta( int $post_id, string $seo_title = '', string $seo_desc = '' ): void {
        if ( ! empty( $seo_title ) ) {
            $title = sanitize_text_field( $seo_title );
            update_post_meta( $post_id, '_seopress_titles_title', $title );
            update_post_meta( $post_id, '_yoast_wpseo_title', $title );
            update_post_meta( $post_id, 'rank_math_title', $title );
        }

        if ( ! empty( $seo_desc ) ) {
            $desc = sanitize_text_field( $seo_desc );
            update_post_meta( $post_id, '_seopress_titles_desc', $desc );
            update_post_meta( $post_id, '_yoast_wpseo_metadesc', $desc );
            update_post_meta( $post_id, 'rank_math_description', $desc );
        }
    }

    /**
     * Get SEO fields for a post.
     */
    public static function get_meta( int $post_id ): array {
        $plugin = self::detect_plugin();

        switch ( $plugin ) {
            case 'seopress':
                return [
                    'seo_title' => get_post_meta( $post_id, '_seopress_titles_title', true ),
                    'seo_desc'  => get_post_meta( $post_id, '_seopress_titles_desc', true ),
                ];
            case 'yoastseo':
                return [
                    'seo_title' => get_post_meta( $post_id, '_yoast_wpseo_title', true ),
                    'seo_desc'  => get_post_meta( $post_id, '_yoast_wpseo_metadesc', true ),
                ];
            case 'rankmath':
                return [
                    'seo_title' => get_post_meta( $post_id, 'rank_math_title', true ),
                    'seo_desc'  => get_post_meta( $post_id, 'rank_math_description', true ),
                ];
            default:
                return [ 'seo_title' => '', 'seo_desc' => '' ];
        }
    }
}
