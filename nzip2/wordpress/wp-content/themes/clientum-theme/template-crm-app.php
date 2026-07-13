<?php
/**
 * Template Name: CRM App
 *
 * Serves the compiled Clientum CRM React SPA.
 * Requires the user to be logged in — redirects to the WP login page otherwise.
 * Injects window.WP_CRM_CONFIG so the React app can use WordPress auth and APIs.
 */

// Require authentication.
if ( ! is_user_logged_in() ) {
	wp_redirect( wp_login_url( get_permalink() ) );
	exit;
}

$current_user = wp_get_current_user();

// Determine the user's primary role.
$role = ! empty( $current_user->roles ) ? $current_user->roles[0] : 'subscriber';

// Build the config object injected into the page.
$crm_config = array(
	'nonce'      => wp_create_nonce( 'wp_rest' ),
	'restUrl'    => esc_url_raw( get_rest_url( null, '/' ) ),
	'loginUrl'   => wp_login_url( get_permalink() ),
	'logoutUrl'  => wp_logout_url( home_url() ),
	'user'       => array(
		'id'          => $current_user->ID,
		'username'    => $current_user->user_login,
		'displayName' => $current_user->display_name,
		'email'       => $current_user->user_email,
		'role'        => $role,
	),
);

// Asset base — the built CRM files are in the ai-marketing-expert plugin assets.
$asset_base = plugins_url( 'assets/crm/', 'ai-marketing-expert/ai-marketing-expert.php' );
$crm_dir    = WP_PLUGIN_DIR . '/ai-marketing-expert/assets/crm';

// Locate the hashed JS/CSS entry files from the Vite manifest.
$manifest_path = $crm_dir . '/.vite/manifest.json';
$js_file  = '';
$css_file = '';

if ( file_exists( $manifest_path ) ) {
	$manifest = json_decode( file_get_contents( $manifest_path ), true );
	foreach ( $manifest as $entry ) {
		if ( ! empty( $entry['isEntry'] ) ) {
			$js_file  = $entry['file'] ?? '';
			$css_file = ! empty( $entry['css'] ) ? $entry['css'][0] : '';
			break;
		}
	}
}

?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?php wp_title( '|', true, 'right' ); ?><?php bloginfo( 'name' ); ?></title>
<?php if ( $css_file ) : ?>
<link rel="stylesheet" href="<?php echo esc_url( $asset_base . $css_file ); ?>">
<?php endif; ?>
<style>
  body { margin: 0; padding: 0; background: #020617; }
  #root { min-height: 100vh; }
</style>
<script>
window.WP_CRM_CONFIG = <?php echo wp_json_encode( $crm_config ); ?>;
</script>
</head>
<body>
<div id="root"></div>
<?php if ( $js_file ) : ?>
<script type="module" src="<?php echo esc_url( $asset_base . $js_file ); ?>"></script>
<?php else : ?>
<div style="color:#fff;padding:2rem;font-family:sans-serif;">
  <h2>CRM no compilado todavía</h2>
  <p>Ejecutá <code>npm run build</code> dentro de <code>remix-remix-editor-de-brochure-clientumzip/</code>
     y luego copiá la carpeta <code>dist/</code> a
     <code>wordpress/wp-content/plugins/ai-marketing-expert/assets/crm/</code>.</p>
</div>
<?php endif; ?>
</body>
</html>
