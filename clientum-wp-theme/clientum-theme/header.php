<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="profile" href="https://gmpg.org/xfn/11">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<header class="site-header" id="site-header">
  <div class="header-inner">

    <!-- Logo -->
    <a href="<?php echo esc_url(home_url('/')); ?>" class="site-logo" aria-label="<?php bloginfo('name'); ?> — Inicio">
      <div class="logo-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        </svg>
      </div>
      <div class="logo-text">
        <span class="logo-name">CLIENTUM</span>
        <span class="logo-sub">CRM, Chatbots &amp; Tecnología PyME</span>
      </div>
    </a>

    <!-- Primary Nav -->
    <nav class="primary-nav" aria-label="Menú principal">

      <!-- Inicio -->
      <div class="nav-item">
        <a href="<?php echo esc_url(home_url('/')); ?>" class="nav-link <?php echo is_front_page() ? 'active' : ''; ?>">INICIO</a>
      </div>

      <!-- Soluciones dropdown -->
      <div class="nav-item">
        <button class="nav-link" aria-haspopup="true" aria-expanded="false">
          SOLUCIONES
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="nav-dropdown ultra-wide" role="menu">
          <?php
          $soluciones = [
            ['href'=>'chatbot',         'icon'=>'bot',       'bg'=>'rgba(16,185,129,.12)', 'color'=>'#10b981', 'label'=>'Chatbot WhatsApp',  'desc'=>'Atención 24/7 automatizada'],
            ['href'=>'crm_inteligente', 'icon'=>'briefcase', 'bg'=>'rgba(59,130,246,.12)', 'color'=>'#3b82f6', 'label'=>'CRM Inteligente',   'desc'=>'Pipeline y seguimiento de clientes'],
            ['href'=>'asistente_ia',    'icon'=>'sparkles',  'bg'=>'rgba(139,92,246,.12)', 'color'=>'#8b5cf6', 'label'=>'Asistente IA',      'desc'=>'Copiloto de ventas con IA'],
            ['href'=>'reportes',        'icon'=>'bar-chart', 'bg'=>'rgba(249,115,22,.12)', 'color'=>'#f97316', 'label'=>'Reportes',          'desc'=>'Business Intelligence en tiempo real'],
            ['href'=>'automatizacion',  'icon'=>'zap',       'bg'=>'rgba(245,158,11,.12)', 'color'=>'#f59e0b', 'label'=>'Automatización',    'desc'=>'Flujos de trabajo automáticos'],
            ['href'=>'portal_cliente',  'icon'=>'layout',    'bg'=>'rgba(20,184,166,.12)', 'color'=>'#14b8a6', 'label'=>'Portal del Cliente','desc'=>'Autogestión para tus clientes'],
            ['href'=>'desarrollo_web',  'icon'=>'code',      'bg'=>'rgba(100,116,139,.12)','color'=>'#64748b', 'label'=>'Desarrollo Web',    'desc'=>'Sitios y apps a medida'],
            ['href'=>'integraciones',   'icon'=>'link',      'bg'=>'rgba(245,158,11,.12)', 'color'=>'#f59e0b', 'label'=>'Integraciones',     'desc'=>'Conectá con tus herramientas'],
            ['href'=>'catalogo',        'icon'=>'grid',      'bg'=>'rgba(99,102,241,.12)', 'color'=>'#6366f1', 'label'=>'Catálogo Completo', 'desc'=>'2,147+ servicios disponibles'],
            ['href'=>'erp',             'icon'=>'database',  'bg'=>'rgba(59,130,246,.12)', 'color'=>'#3b82f6', 'label'=>'ERP & Consultoría', 'desc'=>'Gestión empresarial integral'],
            ['href'=>'servicios',       'icon'=>'package',   'bg'=>'rgba(16,185,129,.12)', 'color'=>'#10b981', 'label'=>'Todos los Servicios','desc'=>'Ver catálogo completo'],
            ['href'=>'casos',           'icon'=>'star',      'bg'=>'rgba(244,63,94,.12)',  'color'=>'#f43f5e', 'label'=>'Casos de Éxito',    'desc'=>'Proyectos realizados'],
          ];
          foreach ($soluciones as $s):
            $page = get_page_by_path($s['href']);
            $url  = $page ? get_permalink($page) : '#';
          ?>
          <a href="<?php echo esc_url($url); ?>" class="dropdown-item" role="menuitem">
            <div class="dropdown-icon" style="background:<?php echo esc_attr($s['bg']); ?>">
              <?php echo clientum_get_icon($s['icon'], $s['color']); ?>
            </div>
            <div>
              <div class="dropdown-label"><?php echo esc_html($s['label']); ?></div>
              <div class="dropdown-desc"><?php echo esc_html($s['desc']); ?></div>
            </div>
          </a>
          <?php endforeach; ?>
        </div>
      </div>

      <!-- Precios -->
      <div class="nav-item">
        <?php
        $precios = get_page_by_path('precios');
        $precios_url = $precios ? get_permalink($precios) : '#';
        ?>
        <a href="<?php echo esc_url($precios_url); ?>" class="nav-link">PRECIOS</a>
      </div>

      <!-- Ecosistema dropdown -->
      <div class="nav-item">
        <button class="nav-link" aria-haspopup="true" aria-expanded="false">
          ECOSISTEMA
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="nav-dropdown" role="menu">
          <?php
          $ecosistema = [
            ['href'=>'academia',  'icon'=>'book-open', 'bg'=>'rgba(99,102,241,.12)', 'color'=>'#6366f1', 'label'=>'Academia',       'desc'=>'377 cursos de negocio y tecnología'],
            ['href'=>'asociacion','icon'=>'users',     'bg'=>'rgba(16,185,129,.12)', 'color'=>'#10b981', 'label'=>'Asociación',      'desc'=>'Programa de partners y revendedores'],
            ['href'=>'blog',      'icon'=>'file-text', 'bg'=>'rgba(100,116,139,.12)','color'=>'#64748b', 'label'=>'Blog',            'desc'=>'Novedades, guías y casos de uso'],
          ];
          foreach ($ecosistema as $s):
            $page = get_page_by_path($s['href']);
            $url  = $page ? get_permalink($page) : '#';
          ?>
          <a href="<?php echo esc_url($url); ?>" class="dropdown-item" role="menuitem">
            <div class="dropdown-icon" style="background:<?php echo esc_attr($s['bg']); ?>">
              <?php echo clientum_get_icon($s['icon'], $s['color']); ?>
            </div>
            <div>
              <div class="dropdown-label"><?php echo esc_html($s['label']); ?></div>
              <div class="dropdown-desc"><?php echo esc_html($s['desc']); ?></div>
            </div>
          </a>
          <?php endforeach; ?>
        </div>
      </div>

      <!-- Nosotros -->
      <div class="nav-item">
        <?php
        $nosotros = get_page_by_path('sobre-nosotros');
        $nosotros_url = $nosotros ? get_permalink($nosotros) : '#';
        ?>
        <a href="<?php echo esc_url($nosotros_url); ?>" class="nav-link">NOSOTROS</a>
      </div>

      <!-- Soporte dropdown -->
      <div class="nav-item">
        <button class="nav-link" aria-haspopup="true" aria-expanded="false">
          SOPORTE
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="nav-dropdown" role="menu">
          <?php
          $soporte = [
            ['href'=>'ayuda',    'icon'=>'help-circle','bg'=>'rgba(59,130,246,.12)', 'color'=>'#3b82f6', 'label'=>'Centro de Ayuda','desc'=>'Documentación y tutoriales'],
            ['href'=>'contacto', 'icon'=>'mail',       'bg'=>'rgba(16,185,129,.12)', 'color'=>'#10b981', 'label'=>'Contacto',       'desc'=>'Hablá con nuestro equipo'],
          ];
          foreach ($soporte as $s):
            $page = get_page_by_path($s['href']);
            $url  = $page ? get_permalink($page) : '#';
          ?>
          <a href="<?php echo esc_url($url); ?>" class="dropdown-item" role="menuitem">
            <div class="dropdown-icon" style="background:<?php echo esc_attr($s['bg']); ?>">
              <?php echo clientum_get_icon($s['icon'], $s['color']); ?>
            </div>
            <div>
              <div class="dropdown-label"><?php echo esc_html($s['label']); ?></div>
              <div class="dropdown-desc"><?php echo esc_html($s['desc']); ?></div>
            </div>
          </a>
          <?php endforeach; ?>
        </div>
      </div>

    </nav><!-- /.primary-nav -->

    <!-- Actions -->
    <div class="nav-actions">
      <!-- AI Client Prospector link -->
      <a href="<?php echo esc_url(home_url('/app')); ?>" class="btn-prospector">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        IR AL AI CLIENT PROSPECTOR
      </a>

      <!-- User info or login -->
      <?php if (is_user_logged_in()):
        $user = wp_get_current_user();
        $app_page = get_page_by_path('app');
        $app_url  = $app_page ? get_permalink($app_page) : home_url('/app');
      ?>
      <div class="btn-user">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
        <?php echo esc_html($user->user_login); ?>
      </div>
      <a href="<?php echo esc_url(wp_logout_url(home_url())); ?>" class="btn btn-ghost btn-sm">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      </a>
      <?php else: ?>
      <a href="<?php echo esc_url(wp_login_url()); ?>" class="btn btn-ghost btn-sm">Iniciar sesión</a>
      <?php endif; ?>

      <!-- Solicitar Demo -->
      <?php
      $contacto = get_page_by_path('contacto');
      $demo_url = $contacto ? get_permalink($contacto) : '#';
      ?>
      <a href="<?php echo esc_url($demo_url); ?>" class="btn-nav-demo">SOLICITAR DEMO</a>
    </div>

    <!-- Hamburger -->
    <button class="hamburger" id="hamburger-btn" aria-label="Abrir menú" aria-expanded="false">
      <svg id="hamburger-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      <svg id="close-icon" class="hidden" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>

  </div><!-- /.header-inner -->
</header>

<!-- Mobile Nav -->
<nav class="mobile-nav" id="mobile-nav" aria-label="Menú móvil" aria-hidden="true">
  <div class="mobile-nav-section">
    <div class="mobile-nav-title">Soluciones</div>
    <a href="<?php echo esc_url(home_url('/chatbot')); ?>"         class="mobile-nav-link">Chatbot WhatsApp</a>
    <a href="<?php echo esc_url(home_url('/crm-inteligente')); ?>" class="mobile-nav-link">CRM Inteligente</a>
    <a href="<?php echo esc_url(home_url('/asistente-ia')); ?>"    class="mobile-nav-link">Asistente IA</a>
    <a href="<?php echo esc_url(home_url('/reportes')); ?>"        class="mobile-nav-link">Reportes Automáticos</a>
    <a href="<?php echo esc_url(home_url('/automatizacion')); ?>"  class="mobile-nav-link">Automatización</a>
    <a href="<?php echo esc_url(home_url('/portal-cliente')); ?>"  class="mobile-nav-link">Portal del Cliente</a>
    <a href="<?php echo esc_url(home_url('/desarrollo-web')); ?>"  class="mobile-nav-link">Desarrollo Web</a>
    <a href="<?php echo esc_url(home_url('/catalogo')); ?>"        class="mobile-nav-link">Catálogo Completo</a>
  </div>
  <div class="mobile-nav-section">
    <div class="mobile-nav-title">Empresa</div>
    <a href="<?php echo esc_url(home_url('/precios')); ?>"          class="mobile-nav-link">Precios</a>
    <a href="<?php echo esc_url(home_url('/sobre-nosotros')); ?>"   class="mobile-nav-link">Nosotros</a>
    <a href="<?php echo esc_url(home_url('/casos')); ?>"            class="mobile-nav-link">Casos de Éxito</a>
    <a href="<?php echo esc_url(home_url('/academia')); ?>"         class="mobile-nav-link">Academia</a>
    <a href="<?php echo esc_url(home_url('/blog')); ?>"             class="mobile-nav-link">Blog</a>
  </div>
  <div class="mobile-nav-section">
    <div class="mobile-nav-title">Soporte</div>
    <a href="<?php echo esc_url(home_url('/ayuda')); ?>"    class="mobile-nav-link">Centro de Ayuda</a>
    <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="mobile-nav-link">Contacto</a>
  </div>
  <div style="margin-top:24px;display:flex;flex-direction:column;gap:10px;">
    <a href="<?php echo esc_url(home_url('/app')); ?>"     class="btn btn-emerald btn-lg" style="justify-content:center;">IR AL AI CLIENT PROSPECTOR</a>
    <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-primary btn-lg" style="justify-content:center;">SOLICITAR DEMO</a>
    <?php if (!is_user_logged_in()): ?>
    <a href="<?php echo esc_url(wp_login_url()); ?>" class="btn btn-ghost btn-lg" style="justify-content:center;">Iniciar sesión</a>
    <?php endif; ?>
  </div>
</nav>

<div class="site-main">
