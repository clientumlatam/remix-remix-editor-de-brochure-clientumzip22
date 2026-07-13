<?php
namespace WPRaiz\ContentAPI;

if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Media upload handler — downloads images from URL and attaches to posts.
 */
class Media_Handler {

    public function __construct() {
        // Ensure media functions are available
        if ( ! function_exists( 'media_handle_sideload' ) ) {
            require_once ABSPATH . 'wp-admin/includes/file.php';
            require_once ABSPATH . 'wp-admin/includes/media.php';
            require_once ABSPATH . 'wp-admin/includes/image.php';
        }
    }

    /**
     * Upload image from URL and attach to a post.
     *
     * @param string $image_url URL of the image.
     * @param int    $post_id   Post to attach to.
     * @return int|\WP_Error Attachment ID or error.
     */
    public static function upload_from_url( string $image_url, int $post_id ) {
        if ( ! filter_var( $image_url, FILTER_VALIDATE_URL ) ) {
            return new \WP_Error( 'invalid_url', __( 'Invalid image URL.', 'wpraiz-content-api' ) );
        }

        // Ensure required functions
        if ( ! function_exists( 'media_handle_sideload' ) ) {
            require_once ABSPATH . 'wp-admin/includes/file.php';
            require_once ABSPATH . 'wp-admin/includes/media.php';
            require_once ABSPATH . 'wp-admin/includes/image.php';
        }

        $response = wp_remote_get( $image_url, [
            'timeout'   => 30,
            'sslverify' => false,
        ]);

        if ( is_wp_error( $response ) ) {
            return new \WP_Error( 'download_failed', __( 'Failed to download image.', 'wpraiz-content-api' ) );
        }

        $http_code = wp_remote_retrieve_response_code( $response );
        if ( $http_code !== 200 ) {
            return new \WP_Error( 'download_failed', sprintf( __( 'Image download returned HTTP %d.', 'wpraiz-content-api' ), $http_code ) );
        }

        $image_data  = wp_remote_retrieve_body( $response );
        $content_type = wp_remote_retrieve_header( $response, 'content-type' );

        // Validate it's actually an image
        $allowed_types = [ 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml' ];
        if ( ! in_array( $content_type, $allowed_types, true ) ) {
            return new \WP_Error( 'invalid_type', __( 'URL does not point to a valid image.', 'wpraiz-content-api' ) );
        }

        // Create temp file
        $tmp_file = wp_tempnam( $image_url );
        global $wp_filesystem;

        if ( ! function_exists( 'WP_Filesystem' ) ) {
            require_once ABSPATH . 'wp-admin/includes/file.php';
        }
        WP_Filesystem();

        if ( empty( $wp_filesystem ) ) {
            return new \WP_Error( 'filesystem_unavailable', __( 'WordPress Filesystem API could not be initialized.', 'wpraiz-content-api' ) );
        }

        $wp_filesystem->put_contents( $tmp_file, $image_data );

        // Extract filename
        $parsed_url = wp_parse_url( $image_url );
        $filename   = basename( $parsed_url['path'] ?? 'image.jpg' );

        // Ensure extension
        if ( ! preg_match( '/\.(jpe?g|png|gif|webp|svg)$/i', $filename ) ) {
            $ext_map  = [
                'image/jpeg' => '.jpg',
                'image/png'  => '.png',
                'image/gif'  => '.gif',
                'image/webp' => '.webp',
            ];
            $filename .= $ext_map[ $content_type ] ?? '.jpg';
        }

        $file_array = [
            'name'     => sanitize_file_name( $filename ),
            'tmp_name' => $tmp_file,
        ];

        $attachment_id = media_handle_sideload( $file_array, $post_id );

        if ( is_wp_error( $attachment_id ) ) {
            wp_delete_file( $tmp_file );
        }

        return $attachment_id;
    }
}
