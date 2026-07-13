<?php
/**
 * Template Name: Login
 */
?>
<?php
// Ensure theme CSS is enqueued for this standalone template
add_action('wp_enqueue_scripts', function() {
    $v = wp_get_theme()->get('Version');
    wp_enqueue_style('clientum-fonts', 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap', [], null);
    wp_enqueue_style('clientum-main', get_template_directory_uri() . '/assets/css/main.css', ['clientum-fonts'], $v);
    wp_dequeue_style('wp-block-library');
    wp_dequeue_style('wp-block-library-theme');
    wp_dequeue_style('classic-theme-styles');
    wp_dequeue_style('global-styles');
}, 5);
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo('charset'); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Iniciar sesión — <?php bloginfo('name'); ?></title>
<?php wp_head(); ?>
<style id="clientum-auth-critical">
/* ─── DESIGN TOKENS ──────────────────────────────────────────── */
:root {
  --navy:       #1A3461;
  --navy-dark:  #0f1e38;
  --navy-mid:   #1e3d72;
  --navy-light: #2e5299;
  --green:      #25d366;
  --green-dark: #1aaa50;
  --purple:     #6d28d9;
  --orange:     #ea580c;
  --amber:      #b45309;
  --cyan:       #0e7490;
  --g900: #111827;
  --g700: #374151;
  --g500: #6b7280;
  --g400: #9ca3af;
  --g300: #d1d5db;
  --g200: #e5e7eb;
  --g100: #f3f4f6;
  --g50:  #f9fafb;
  --white: #ffffff;
  --radius:    8px;
  --radius-lg: 16px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,.08);
  --shadow:    0 4px 16px rgba(0,0,0,.10);
  --shadow-lg: 0 12px 40px rgba(0,0,0,.14);
  --transition: .2s ease;
  --header-h:  68px;
  --container: 1140px;
  --font: 'Inter', system-ui, -apple-system, sans-serif;
}


/* ═══════════════════════════════════════════════════════════════
   AUTH PAGES — Split panel layout (Login / Registro / Recuperar)
   ═══════════════════════════════════════════════════════════════ */

/* Reset for auth pages */
body.auth-page {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  overflow-x: hidden;
}

/* Split container */
.auth-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
}

/* ── Left panel ──────────────────────────────────────────────── */
.auth-panel--left {
  background: linear-gradient(160deg, #0d1f3c 0%, #1A3461 55%, #0f2650 100%);
  position: relative;
  overflow: hidden;
}
.auth-panel--left::before {
  content: '';
  position: absolute;
  top: -30%;
  left: -20%;
  width: 70%;
  height: 70%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(46,82,153,.35) 0%, transparent 70%);
  pointer-events: none;
}
.auth-panel--left::after {
  content: '';
  position: absolute;
  bottom: -20%;
  right: -15%;
  width: 60%;
  height: 60%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(37,211,102,.06) 0%, transparent 65%);
  pointer-events: none;
}
.auth-left-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 36px 48px 40px;
}

/* Logo */
.auth-logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #fff;
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: -.01em;
  flex-shrink: 0;
}
.auth-logo img { width: 34px; height: 34px; border-radius: 6px; }
.auth-logo .custom-logo { width: 34px; height: 34px; border-radius: 6px; object-fit: contain; }

/* Left body — pushed to bottom with flex */
.auth-left-body {
  margin-top: auto;
  padding-bottom: 32px;
}
.auth-headline {
  font-size: clamp(1.75rem, 3vw, 2.4rem);
  font-weight: 800;
  color: #fff;
  line-height: 1.15;
  letter-spacing: -.03em;
  margin-bottom: 16px;
}
.auth-tagline {
  font-size: .9375rem;
  color: rgba(255,255,255,.65);
  line-height: 1.65;
  max-width: 380px;
  margin-bottom: 32px;
}

/* Feature list */
.auth-features {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 0;
}
.auth-features li {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: .9rem;
  color: rgba(255,255,255,.8);
  font-weight: 500;
}
.auth-feat-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: .9rem;
  flex-shrink: 0;
}
.auth-feat-check {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(37,211,102,.2);
  border: 1.5px solid rgba(37,211,102,.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: .7rem;
  font-weight: 800;
  color: #25d366;
  flex-shrink: 0;
}

/* Social proof */
.auth-social-proof {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 28px;
  border-top: 1px solid rgba(255,255,255,.1);
  margin-top: 28px;
  flex-shrink: 0;
}
.auth-avatars {
  display: flex;
}
.auth-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: .72rem;
  font-weight: 700;
  color: #fff;
  margin-left: -8px;
  flex-shrink: 0;
}
.auth-avatars .auth-avatar:first-child { margin-left: 0; }
.auth-proof-text {
  font-size: .84rem;
  color: rgba(255,255,255,.6);
}
.auth-proof-text strong { color: rgba(255,255,255,.9); }

/* ── Right panel ─────────────────────────────────────────────── */
.auth-panel--right {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 40px;
}
.auth-form-wrap {
  width: 100%;
  max-width: 360px;
}

/* Form header */
.auth-form-header {
  margin-bottom: 32px;
}
.auth-form-header h2 {
  font-size: 1.6rem;
  font-weight: 800;
  color: #111827;
  letter-spacing: -.025em;
  margin-bottom: 4px;
}
.auth-form-header p {
  font-size: .9rem;
  color: #6b7280;
  margin: 0;
}

/* Form fields */
.auth-form { display: flex; flex-direction: column; gap: 0; }
.auth-field { margin-bottom: 18px; }
.auth-label {
  display: block;
  font-size: .8125rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}
.auth-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.auth-label-row .auth-label { margin-bottom: 0; }
.auth-link {
  font-size: .8125rem;
  font-weight: 600;
  color: #2563eb;
  text-decoration: none;
}
.auth-link:hover { text-decoration: underline; }
.auth-input {
  width: 100%;
  padding: 11px 14px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: .9375rem;
  color: #111827;
  background: #fff;
  transition: border-color .15s, box-shadow .15s;
  outline: none;
  box-sizing: border-box;
}
.auth-input:focus {
  border-color: #1A3461;
  box-shadow: 0 0 0 3px rgba(26,52,97,.1);
}
.auth-input::placeholder { color: #9ca3af; }

/* Password input */
.auth-input--password { letter-spacing: .05em; }
.auth-input--password::placeholder { letter-spacing: 0; }

/* Icon input wrapper */
.auth-input-wrap { position: relative; }
.auth-input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: .9rem;
  color: #9ca3af;
  pointer-events: none;
}
.auth-input--icon { padding-left: 36px; }

/* Buttons */
.auth-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: .9375rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  border: none;
  transition: background .15s, box-shadow .15s, transform .1s;
  margin-bottom: 12px;
  box-sizing: border-box;
}
.auth-btn:last-child { margin-bottom: 0; }
.auth-btn:hover { transform: translateY(-1px); }
.auth-btn:active { transform: translateY(0); }
.auth-btn--primary {
  background: #2563eb;
  color: #fff;
  box-shadow: 0 1px 3px rgba(37,99,235,.3);
}
.auth-btn--primary:hover {
  background: #1d4ed8;
  box-shadow: 0 4px 14px rgba(37,99,235,.4);
}
.auth-btn--outline {
  background: #f0f4ff;
  color: #1A3461;
  border: 1.5px solid #dbeafe;
}
.auth-btn--outline:hover {
  background: #dbeafe;
  border-color: #93c5fd;
}

/* Divider */
.auth-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 4px 0 12px;
  color: #9ca3af;
  font-size: .8125rem;
}
.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}

/* Helper texts */
.auth-switch-text {
  text-align: center;
  font-size: .875rem;
  color: #6b7280;
  margin: 8px 0 0;
}
.auth-fine-print {
  text-align: center;
  font-size: .78rem;
  color: #9ca3af;
  margin: 10px 0 0;
}
.auth-error {
  background: #fee2e2;
  color: #991b1b;
  border-radius: 7px;
  padding: 10px 14px;
  font-size: .875rem;
  margin-bottom: 14px;
}

/* Back link */
.auth-back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: .8125rem;
  font-weight: 600;
  color: #6b7280;
  text-decoration: none;
  margin-bottom: 28px;
}
.auth-back-link:hover { color: #1A3461; }

/* Success box */
.auth-success-box {
  text-align: center;
  padding: 24px 0;
}
.auth-success-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #dcfce7;
  color: #16a34a;
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 20px;
}
.auth-success-box h2 { font-size: 1.5rem; color: #111827; margin-bottom: 8px; }
.auth-success-box p  { color: #6b7280; font-size: .9375rem; line-height: 1.6; }
.auth-success-box .auth-btn { margin-top: 24px; }

/* ── Responsive ──────────────────────────────────────────────── */
@media (max-width: 768px) {
  .auth-split {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
  .auth-panel--left {
    padding: 24px;
    min-height: auto;
  }
  .auth-left-inner { padding: 0; }
  .auth-left-body { margin-top: 24px; padding-bottom: 0; }
  .auth-headline { font-size: 1.5rem; }
  .auth-tagline { font-size: .875rem; margin-bottom: 20px; }
  .auth-features { gap: 8px; }
  .auth-social-proof { margin-top: 20px; padding-top: 20px; }
  .auth-panel--right { padding: 32px 20px; align-items: flex-start; }
  .auth-form-wrap { max-width: 100%; }
}

</style>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

</head>
<body class="auth-page">

<div class="auth-split">

  <!-- ── Panel izquierdo ───────────────────────────────────── -->
  <div class="auth-panel auth-panel--left">
    <div class="auth-left-inner">

      <a href="<?php echo esc_url(home_url('/')); ?>" class="auth-logo">
        <?php if (has_custom_logo()):
          the_custom_logo();
        else: ?>
          <img src="<?php echo esc_url(get_template_directory_uri()); ?>/assets/images/logo-icon.png" alt="Clientum" width="36" height="36">
        <?php endif; ?>
        <span>Clientum</span>
      </a>

      <div class="auth-left-body">
        <h1 class="auth-headline">Tu PyME, organizada<br>y automatizada.</h1>
        <p class="auth-tagline">CRM, facturación electrónica y atención al cliente por WhatsApp — todo en una sola plataforma.</p>

        <ul class="auth-features">
          <li>
            <span class="auth-feat-icon" style="background:rgba(37,211,102,.15)">💬</span>
            Chatbot WhatsApp 24/7
          </li>
          <li>
            <span class="auth-feat-icon" style="background:rgba(37,211,102,.15)">🧾</span>
            Facturación electrónica AFIP
          </li>
          <li>
            <span class="auth-feat-icon" style="background:rgba(37,211,102,.15)">📊</span>
            Pipeline de ventas y CRM
          </li>
        </ul>
      </div>

      <div class="auth-social-proof">
        <div class="auth-avatars">
          <span class="auth-avatar" style="background:#3b82f6">M</span>
          <span class="auth-avatar" style="background:#8b5cf6">S</span>
          <span class="auth-avatar" style="background:#ec4899">A</span>
          <span class="auth-avatar" style="background:#f59e0b">R</span>
        </div>
        <span class="auth-proof-text"><strong>+500 PyMEs</strong> confían en Clientum</span>
      </div>

    </div>
  </div>

  <!-- ── Panel derecho ─────────────────────────────────────── -->
  <div class="auth-panel auth-panel--right">
    <div class="auth-form-wrap">

      <div class="auth-form-header">
        <h2>Bienvenido de vuelta</h2>
        <p>Ingresá con tu cuenta de Clientum</p>
      </div>

      <form class="auth-form" id="login-form" method="post" action="">
        <?php wp_nonce_field('clientum_login', 'clientum_login_nonce'); ?>

        <div class="auth-field">
          <label class="auth-label" for="login-email">Email</label>
          <input class="auth-input" id="login-email" name="log" type="email" placeholder="tu@empresa.com" required autocomplete="email">
        </div>

        <div class="auth-field">
          <div class="auth-label-row">
            <label class="auth-label" for="login-password">Contraseña</label>
            <a href="<?php echo esc_url(home_url('/recuperar-contrasena')); ?>" class="auth-link">¿Olvidaste tu contraseña?</a>
          </div>
          <input class="auth-input auth-input--password" id="login-password" name="pwd" type="password" placeholder="••••••••" required autocomplete="current-password">
        </div>

        <?php
        $login_errors = [
            'invalid'  => 'Email o contraseña incorrectos. Verificá tus datos.',
            'security' => 'Error de seguridad. Por favor recargá la página.',
        ];
        $err = sanitize_text_field($_GET['error'] ?? '');
        if ($err && isset($login_errors[$err])):
        ?>
        <div class="auth-error"><?php echo esc_html($login_errors[$err]); ?></div>
        <?php endif; ?>

        <button type="submit" class="auth-btn auth-btn--primary">Ingresar</button>

        <div class="auth-divider"><span>¿Nuevo en Clientum?</span></div>

        <a href="<?php echo esc_url(home_url('/registro')); ?>" class="auth-btn auth-btn--outline">Crear cuenta gratis</a>

        <p class="auth-fine-print">Sin tarjeta de crédito · Operativo en una semana</p>
      </form>

    </div>
  </div>

</div>

<?php wp_footer(); ?>
</body>
</html>
