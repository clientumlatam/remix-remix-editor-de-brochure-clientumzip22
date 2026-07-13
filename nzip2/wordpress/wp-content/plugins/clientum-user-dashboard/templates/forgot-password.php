<?php
/**
 * Página de recuperación de contraseña autocontenida. Ruta: /recuperar-contrasena
 */
if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'wp_enqueue_scripts', function () {
    wp_enqueue_style( 'clientum-fonts', 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap', [], null );
    wp_enqueue_style( 'clntm-ud-auth', CLNTM_UD_URL . 'assets/css/auth.css', [ 'clientum-fonts' ], CLNTM_UD_VERSION );
}, 5 );

$sent = ! empty( $_GET['sent'] );
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo('charset'); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Recuperar contraseña — <?php bloginfo('name'); ?></title>
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
        <h1 class="auth-headline">¿Olvidaste tu<br>contraseña?</h1>
        <p class="auth-tagline">No te preocupes, te enviamos un enlace para crear una nueva.</p>
      </div>

    </div>
  </div>

  <div class="auth-panel auth-panel--right">
    <div class="auth-form-wrap">

      <a href="<?php echo esc_url( home_url( '/login' ) ); ?>" class="auth-back-link">← Volver a iniciar sesión</a>

      <?php if ( $sent ) : ?>

        <div class="auth-success-box">
          <div class="auth-success-icon">✓</div>
          <h2>Revisá tu email</h2>
          <p>Si existe una cuenta con ese email, te enviamos un enlace para restablecer tu contraseña. El enlace expira en 24 horas.</p>
          <a href="<?php echo esc_url( home_url( '/login' ) ); ?>" class="auth-btn auth-btn--primary">Volver a iniciar sesión</a>
        </div>

      <?php else : ?>

        <div class="auth-form-header">
          <h2>Recuperar contraseña</h2>
          <p>Ingresá tu email y te enviamos un enlace de recuperación</p>
        </div>

        <form class="auth-form" id="forgot-form" method="post" action="">
          <?php wp_nonce_field( 'clientum_forgot', 'clientum_forgot_nonce' ); ?>

          <div class="auth-field">
            <label class="auth-label" for="forgot-email">Email</label>
            <input class="auth-input" id="forgot-email" name="user_login" type="email" placeholder="tu@empresa.com" required autocomplete="email">
          </div>

          <?php
          $forgot_errors = [
              'invalid_email' => 'El email ingresado no es válido.',
              'security'      => 'Error de seguridad. Por favor recargá la página.',
          ];
          $err = sanitize_text_field( $_GET['error'] ?? '' );
          if ( $err && isset( $forgot_errors[ $err ] ) ) :
          ?>
          <div class="auth-error"><?php echo esc_html( $forgot_errors[ $err ] ); ?></div>
          <?php endif; ?>

          <button type="submit" class="auth-btn auth-btn--primary">Enviar enlace de recuperación</button>
        </form>

      <?php endif; ?>

    </div>
  </div>

</div>

<?php wp_footer(); ?>
</body>
</html>
