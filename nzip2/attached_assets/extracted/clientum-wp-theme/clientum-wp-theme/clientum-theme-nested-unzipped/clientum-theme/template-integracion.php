<?php
/**
 * Template Name: Integración de Tecnología
 */
get_header(); ?>

<main class="site-main">

<!-- HERO -->
<section class="page-hero">
  <div class="container">
    <span class="hero-eyebrow">Servicios</span>
    <h1>Integración de Tecnología</h1>
    <p>Conectamos tus sistemas, herramientas y datos en un ecosistema digital que funciona solo. Elegancia y tecnología al servicio de tu PyME.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/registro')); ?>" class="btn btn-green btn-lg">Probar gratis 14 días</a>
      <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-outline-white btn-lg">Consultar</a>
    </div>
  </div>
</section>

<!-- STATS -->
<section class="section--sm" style="background:var(--g50)">
  <div class="container">
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-number">365</div><div class="stat-label">Días de servicio al año</div></div>
      <div class="stat-card"><div class="stat-number">1.750+</div><div class="stat-label">Clientes satisfechos</div></div>
      <div class="stat-card"><div class="stat-number">145+</div><div class="stat-label">Soluciones disponibles</div></div>
      <div class="stat-card"><div class="stat-number">99.9%</div><div class="stat-label">Uptime garantizado</div></div>
    </div>
  </div>
</section>

<!-- SOLUCIONES -->
<section class="section">
  <div class="container">
    <div class="section-header centered">
      <span class="section-label">Qué integramos</span>
      <h2 class="section-title">Soluciones tecnológicas para PyMEs</h2>
      <p class="section-subtitle">Implementamos tecnologías avanzadas para optimizar tus procesos empresariales con el máximo rendimiento.</p>
    </div>
    <div class="grid-3">
      <?php
      $integrations = [
        ['🔗','ERP + CRM','Conectamos tu sistema de gestión interno con el CRM de ventas. Un solo lugar para todo tu negocio.'],
        ['🤖','Inteligencia Artificial','Chatbots, análisis predictivo y automatización inteligente. La IA trabajando para tu PyME, no al revés.'],
        ['☁️','Cloud','Migración y gestión en la nube. Google Cloud, AWS y Azure configurados y monitoreados por nuestro equipo.'],
        ['📦','E-Commerce + ERP','Tu tienda online sincronizada con stock, precios, clientes y facturación en tiempo real.'],
        ['💬','WhatsApp Business API','Integración oficial con la API de Meta. Respuestas automáticas, notificaciones y atención al cliente 24/7.'],
        ['🧾','AFIP + Sistemas de cobro','Facturación electrónica integrada con MercadoPago, transferencias y cobranza automática.'],
      ];
      foreach ($integrations as $i): ?>
        <div class="feature-card">
          <div class="card-icon" style="background:var(--g100);font-size:1.5rem"><?php echo $i[0]; ?></div>
          <h3><?php echo esc_html($i[1]); ?></h3>
          <p><?php echo esc_html($i[2]); ?></p>
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
        <h3>Además ofrecemos formación y capacitación</h3>
        <p>Que tu equipo adopte la tecnología es tan importante como implementarla. Formamos a tu personal en cada herramienta para que la usen con confianza desde el primer día.</p>
        <ul>
          <li>Capacitación en Clientum CRM y ERP</li>
          <li>Uso de WhatsApp Business API</li>
          <li>Facturación AFIP y gestión de cobranza</li>
          <li>Reportes y analítica de datos</li>
        </ul>
      </div>
      <div>
        <p style="color:rgba(255,255,255,.8);margin-bottom:24px">Tu comodidad es nuestra única prioridad. Acompañamos hasta que tu equipo opera con total autonomía.</p>
        <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-green btn-lg" style="width:100%;margin-bottom:12px">Consultar integración</a>
        <a href="<?php echo esc_url(home_url('/registro')); ?>" class="btn btn-outline-white" style="width:100%">Probar gratis 14 días</a>
      </div>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="cta-section">
  <div class="container">
    <h2>¿Tenés alguna pregunta?</h2>
    <p>Nuestros especialistas te explican cómo conectar tus sistemas en menos de 30 minutos.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-green btn-lg">Hablar con un especialista</a>
      <a href="<?php echo esc_url(clientum_whatsapp()); ?>" target="_blank" rel="noopener" class="btn btn-outline-white btn-lg">💬 WhatsApp</a>
    </div>
  </div>
</section>

</main>

<?php get_footer(); ?>
