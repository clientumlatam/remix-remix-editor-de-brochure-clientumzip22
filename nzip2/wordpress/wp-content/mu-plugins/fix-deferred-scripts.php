<?php
/**
 * Plugin Name: Fix Deferred Scripts (Replit)
 * Description: Removes defer/async loading strategy from scripts that have
 *              inline "after" scripts, preventing "wp/jQuery is not defined"
 *              errors caused by inline scripts running before deferred ones.
 */
add_action( 'wp_print_scripts', 'replit_fix_deferred_scripts', 1 );
add_action( 'admin_print_scripts', 'replit_fix_deferred_scripts', 1 );

function replit_fix_deferred_scripts() {
    global $wp_scripts;
    if ( ! isset( $wp_scripts ) ) {
        return;
    }
    foreach ( $wp_scripts->registered as $handle => $script ) {
        // If there's an inline "after" script, the deferred external script
        // would execute after the inline one — remove defer/async strategy.
        if ( ! empty( $script->extra['after'] ) ) {
            unset( $wp_scripts->registered[ $handle ]->extra['strategy'] );
        }
    }
}
