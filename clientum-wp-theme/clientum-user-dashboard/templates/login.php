<?php
/**
 * Página de login autocontenida. Ruta: /login
 */
if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'wp_enqueue_scripts', function () {
    wp_enqueue_style( 'clientum-fonts', 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap', [], null );
    wp_enqueue_style( 'clntm-ud-auth', CLNTM_UD_URL . 'assets/css/auth.css', [ 'clientum-fonts' ], CLNTM_UD_VERSION );
}, 5 );
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo('charset'); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Iniciar sesión — <?php bloginfo('name'); ?></title>
<?php wp_head(); ?>
</head>
<body class="auth-page">

<div class="auth-split">

  <div class="auth-panel auth-panel--left">
    <div class="auth-left-inner">

      <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="auth-logo">
        <img src="<?php echo esc_url( CLNTM_UD_URL . 'assets/images/logo-icon.png' ); ?>" alt="<?php bloginfo('name'); ?>" width="36" height="36">
        <span><?php bloginfo('name'); ?></span>
      </a>

      <div class="auth-left-body">
        <h1 class="auth-headline">Tu cuenta,<br>siempre a mano.</h1>
        <p class="auth-tagline">Gestioná tus contactos, negocios y facturación desde tu propio panel.</p>

        <ul class="auth-features">
          <li><span class="auth-feat-icon" style="background:rgba(37,211,102,.15)">📊</span> Pipeline de ventas y CRM</li>
          <li><span class="auth-feat-icon" style="background:rgba(37,211,102,.15)">🧾</span> Facturas y cotizaciones</li>
          <li><span class="auth-feat-icon" style="background:rgba(37,211,102,.15)">✅</span> Actividades y seguimiento</li>
        </ul>
      </div>

    </div>
  </div>

  <div class="auth-panel auth-panel--right">
    <div class="auth-form-wrap">

      <div class="auth-form-header">
        <h2>Bienvenido de vuelta</h2>
        <p>Ingresá con tu cuenta</p>
      </div>

      <form class="auth-form" id="login-form" method="post" action="">
        <?php wp_nonce_field( 'clientum_login', 'clientum_login_nonce' ); ?>
        <?php if ( ! empty( $_GET['redirect_to'] ) ) : ?>
          <input type="hidden" name="redirect_to" value="<?php echo esc_url( wp_unslash( $_GET['redirect_to'] ) ); ?>">
        <?php endif; ?>

        <div class="auth-field">
          <label class="auth-label" for="login-email">Email</label>
          <input class="auth-input" id="login-email" name="log" type="email" placeholder="tu@empresa.com" required autocomplete="email">
        </div>

        <div class="auth-field">
          <div class="auth-label-row">
            <label class="auth-label" for="login-password">Contraseña</label>
            <a href="<?php echo esc_url( home_url( '/recuperar-contrasena' ) ); ?>" class="auth-link">¿Olvidaste tu contraseña?</a>
          </div>
          <input class="auth-input auth-input--password" id="login-password" name="pwd" type="password" placeholder="••••••••" required autocomplete="current-password">
        </div>

        <?php
        $login_errors = [
            'invalid'  => 'Email o contraseña incorrectos. Verificá tus datos.',
            'security' => 'Error de seguridad. Por favor recargá la página.',
        ];
        $err = sanitize_text_field( $_GET['error'] ?? '' );
        if ( $err && isset( $login_errors[ $err ] ) ) :
        ?>
        <div class="auth-error"><?php echo esc_html( $login_errors[ $err ] ); ?></div>
        <?php endif; ?>

        <button type="submit" class="auth-btn auth-btn--primary">Ingresar</button>

        <div class="auth-divider"><span>¿Nuevo por aquí?</span></div>

        <a href="<?php echo esc_url( home_url( '/registro' ) ); ?>" class="auth-btn auth-btn--outline">Crear cuenta gratis</a>
      </form>

    </div>
  </div>

</div>

<?php wp_footer(); ?>
</body>
</html>
