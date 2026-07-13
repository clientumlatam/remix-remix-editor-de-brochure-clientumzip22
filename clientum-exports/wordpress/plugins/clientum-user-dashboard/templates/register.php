<?php
/**
 * Página de registro autocontenida. Ruta: /registro
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
<title>Crear cuenta gratis — <?php bloginfo('name'); ?></title>
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
        <h1 class="auth-headline">Comenzá gratis.<br>Configurá tu panel en minutos.</h1>
        <p class="auth-tagline">Creá tu cuenta y empezá a gestionar tu negocio desde ya.</p>

        <ul class="auth-features">
          <li><span class="auth-feat-check">✓</span> Sin tarjeta de crédito</li>
          <li><span class="auth-feat-check">✓</span> Configuración instantánea</li>
          <li><span class="auth-feat-check">✓</span> Cancelá cuando quieras</li>
        </ul>
      </div>

    </div>
  </div>

  <div class="auth-panel auth-panel--right">
    <div class="auth-form-wrap">

      <div class="auth-form-header">
        <h2>Crear cuenta</h2>
        <p>Registrá tu empresa</p>
      </div>

      <form class="auth-form" id="register-form" method="post" action="">
        <?php wp_nonce_field( 'clientum_register', 'clientum_register_nonce' ); ?>

        <div class="auth-field">
          <label class="auth-label" for="reg-company">Nombre de la empresa</label>
          <input class="auth-input" id="reg-company" name="company_name" type="text" placeholder="Mi Empresa S.A." required autocomplete="organization">
        </div>

        <div class="auth-field">
          <label class="auth-label" for="reg-name">Tu nombre</label>
          <input class="auth-input" id="reg-name" name="first_name" type="text" placeholder="Juan García" required autocomplete="given-name">
        </div>

        <div class="auth-field">
          <label class="auth-label" for="reg-email">Email</label>
          <input class="auth-input" id="reg-email" name="user_email" type="email" placeholder="juan@miempresa.com" required autocomplete="email">
        </div>

        <div class="auth-field">
          <label class="auth-label" for="reg-password">Contraseña</label>
          <input class="auth-input auth-input--password" id="reg-password" name="user_pass" type="password" placeholder="Mínimo 8 caracteres" required autocomplete="new-password" minlength="8">
        </div>

        <?php
        $reg_errors = [
            'missing_fields' => 'Por favor completá todos los campos requeridos.',
            'weak_password'  => 'La contraseña debe tener al menos 8 caracteres.',
            'invalid_email'  => 'El email ingresado no es válido.',
            'email_exists'   => 'Ya existe una cuenta con ese email. ¿Querés iniciar sesión?',
            'create_failed'  => 'Ocurrió un error al crear la cuenta. Intentá de nuevo.',
            'security'       => 'Error de seguridad. Por favor recargá la página.',
        ];
        $err = sanitize_text_field( $_GET['error'] ?? '' );
        if ( $err && isset( $reg_errors[ $err ] ) ) :
        ?>
        <div class="auth-error"><?php echo esc_html( $reg_errors[ $err ] ); ?></div>
        <?php endif; ?>

        <button type="submit" class="auth-btn auth-btn--primary">Crear cuenta gratis</button>

        <p class="auth-switch-text">¿Ya tenés cuenta? <a href="<?php echo esc_url( home_url( '/login' ) ); ?>" class="auth-link">Iniciá sesión</a></p>
      </form>

    </div>
  </div>

</div>

<?php wp_footer(); ?>
</body>
</html>
