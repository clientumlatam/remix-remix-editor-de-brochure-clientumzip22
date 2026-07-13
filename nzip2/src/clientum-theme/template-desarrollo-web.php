<?php
/**
 * Template Name: Desarrollo Web
 */
get_header(); ?>

<main class="site-main">

<!-- HERO -->
<section class="page-hero">
  <div class="container">
    <span class="hero-eyebrow">Servicios</span>
    <h1>Desarrollo Web y E-Commerce</h1>
    <p>Soluciones digitales personalizadas para tu negocio. Desde tiendas online hasta sistemas a medida.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-green btn-lg">Solicitar presupuesto</a>
      <a href="<?php echo esc_url(home_url('/casos-de-exito')); ?>" class="btn btn-outline-white btn-lg">Ver proyectos</a>
    </div>
  </div>
</section>

<!-- STATS -->
<section class="section--sm" style="background:var(--g50)">
  <div class="container">
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-number">100+</div><div class="stat-label">Proyectos entregados</div></div>
      <div class="stat-card"><div class="stat-number">200+</div><div class="stat-label">Clientes activos</div></div>
      <div class="stat-card"><div class="stat-number">15</div><div class="stat-label">Años de experiencia</div></div>
      <div class="stat-card"><div class="stat-number">30+</div><div class="stat-label">E-commerce lanzados</div></div>
    </div>
  </div>
</section>

<!-- SERVICIOS -->
<section class="section">
  <div class="container">
    <div class="section-header centered">
      <span class="section-label">Lo que hacemos</span>
      <h2 class="section-title">Soluciones web completas</h2>
      <p class="section-subtitle">Construimos la presencia digital que tu PyME necesita para crecer.</p>
    </div>
    <div class="grid-3">
      <?php
      $services = [
        ['🌐','Desarrollo Personalizado','Sitios web y sistemas a medida, construidos sobre tu marca y tus procesos. Sin plantillas genéricas.'],
        ['🛒','E-Commerce','Tiendas online integradas con MercadoPago, stock, envíos y facturación AFIP. Listas para vender desde el día uno.'],
        ['📱','Apps Móviles','Aplicaciones para Android e iOS que conectan a tu equipo y tus clientes con tu negocio desde cualquier lugar.'],
        ['🔍','Optimización SEO','Posicionamiento orgánico en Google para que tus clientes te encuentren sin pagar publicidad.'],
        ['🔧','Mantenimiento y Soporte','Actualizaciones, seguridad, backups y soporte técnico continuo. Tu sitio siempre en línea.'],
        ['⚡','Integración de Sistemas','Conectamos tu web con Clientum CRM, facturación AFIP, WhatsApp y cualquier sistema que ya uses.'],
      ];
      foreach ($services as $s): ?>
        <div class="feature-card">
          <div class="card-icon" style="background:var(--g100);font-size:1.5rem"><?php echo $s[0]; ?></div>
          <h3><?php echo esc_html($s[1]); ?></h3>
          <p><?php echo esc_html($s[2]); ?></p>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- HIGHLIGHT -->
<section class="section" style="background:var(--g50)">
  <div class="container">
    <div class="highlight-box">
      <div>
        <h3>Integrado con Clientum desde el día uno</h3>
        <p>Tu sitio web o tienda online se conecta directamente con el CRM, la facturación y el chatbot de WhatsApp. Un ecosistema digital completo, sin fricciones.</p>
        <ul>
          <li>Pedidos del e-commerce → CRM automáticamente</li>
          <li>Consultas web → chatbot WhatsApp</li>
          <li>Ventas → facturación AFIP en un clic</li>
          <li>Todo centralizado en un solo panel</li>
        </ul>
      </div>
      <div>
        <a href="<?php echo esc_url(home_url('/registro')); ?>" class="btn btn-green btn-lg" style="margin-bottom:12px;width:100%">Probar Clientum gratis 14 días</a>
        <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-outline-white" style="width:100%">Hablar con un especialista</a>
      </div>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="cta-section">
  <div class="container">
    <h2>Tu presencia digital, a medida</h2>
    <p>Presupuesto sin cargo. Te respondemos en menos de 24 horas hábiles.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-green btn-lg">Pedir presupuesto</a>
      <a href="<?php echo esc_url(clientum_whatsapp()); ?>" target="_blank" rel="noopener" class="btn btn-outline-white btn-lg">💬 WhatsApp</a>
    </div>
  </div>
</section>

</main>

<?php get_footer(); ?>
