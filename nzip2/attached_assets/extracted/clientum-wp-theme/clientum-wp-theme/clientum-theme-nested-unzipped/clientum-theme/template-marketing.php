<?php
/**
 * Template Name: Marketing Digital
 */
get_header(); ?>

<main class="site-main">

<!-- HERO -->
<section class="page-hero">
  <div class="container">
    <span class="hero-eyebrow">Servicios</span>
    <h1>Marketing Digital</h1>
    <p>Estrategias de marketing integradas para PyMEs argentinas. Más visibilidad, más clientes, mejor retorno de inversión.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-green btn-lg">Hablar con un estratega</a>
      <a href="<?php echo esc_url(home_url('/casos-de-exito')); ?>" class="btn btn-outline-white btn-lg">Ver resultados</a>
    </div>
  </div>
</section>

<!-- SERVICIOS -->
<section class="section">
  <div class="container">
    <div class="section-header centered">
      <span class="section-label">Lo que hacemos</span>
      <h2 class="section-title">Marketing que genera resultados reales</h2>
      <p class="section-subtitle">No vendemos likes. Vendemos clientes, ventas y crecimiento medible.</p>
    </div>
    <div class="grid-3">
      <?php
      $services = [
        ['🎨','Branding e Identidad','Identidad visual coherente, voz de marca y posicionamiento que te diferencia en el mercado argentino.'],
        ['📱','Redes Sociales','Gestión de Instagram, Facebook y LinkedIn. Contenido que conecta con tu audiencia y genera conversaciones reales.'],
        ['🔍','SEO y Contenidos','Posicionamiento orgánico en Google. Tu empresa aparece cuando tus clientes buscan lo que vendés.'],
        ['💰','Publicidad Paga','Google Ads y Meta Ads optimizados para maximizar el retorno de inversión. Cada peso en publicidad bien gastado.'],
        ['✉️','Email Marketing','Campañas de email automatizadas integradas con Clientum CRM. El canal de mayor ROI, bien ejecutado.'],
        ['📊','Analítica y Reportes','Dashboards claros con métricas que importan. Sabés exactamente qué funciona y qué no.'],
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

<!-- INTEGRACIÓN CRM -->
<section class="section" style="background:var(--g50)">
  <div class="container">
    <div class="grid-2" style="align-items:center;gap:64px">
      <div>
        <span class="section-label">Ventaja Clientum</span>
        <h2>Marketing integrado con tu CRM</h2>
        <p>Cuando el marketing y el CRM trabajan juntos, sabés exactamente qué campañas generan clientes reales y cuánto vale cada uno.</p>
        <ul class="auth-features" style="margin-top:20px">
          <li><span class="auth-feat-check" style="color:#25d366">✓</span> Leads de formularios → CRM en tiempo real</li>
          <li><span class="auth-feat-check" style="color:#25d366">✓</span> WhatsApp automatizado para nurturing</li>
          <li><span class="auth-feat-check" style="color:#25d366">✓</span> Segmentación de contactos por etapa de compra</li>
          <li><span class="auth-feat-check" style="color:#25d366">✓</span> ROI por canal medido con exactitud</li>
        </ul>
        <a href="<?php echo esc_url(home_url('/registro')); ?>" class="btn btn-primary mt-6">Probar Clientum gratis →</a>
      </div>
      <div class="card card--white" style="padding:36px">
        <div class="section-label" style="margin-bottom:16px">Resultados típicos de nuestros clientes</div>
        <div style="display:flex;flex-direction:column;gap:16px">
          <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--g200)">
            <span style="font-size:.9rem;color:var(--g700)">Costo por lead</span>
            <span style="font-weight:700;color:var(--green-dark)">↓ 40%</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--g200)">
            <span style="font-size:.9rem;color:var(--g700)">Tasa de conversión</span>
            <span style="font-weight:700;color:var(--green-dark)">↑ 35%</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--g200)">
            <span style="font-size:.9rem;color:var(--g700)">Tiempo de respuesta a leads</span>
            <span style="font-weight:700;color:var(--green-dark)">↓ 90%</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0">
            <span style="font-size:.9rem;color:var(--g700)">ROI de campañas</span>
            <span style="font-weight:700;color:var(--green-dark)">↑ 60%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="cta-section">
  <div class="container">
    <h2>Tu marketing merece mejores resultados</h2>
    <p>Hablemos 30 minutos y te mostramos un plan de acción concreto para tu empresa.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-green btn-lg">Agendar reunión</a>
      <a href="<?php echo esc_url(clientum_whatsapp()); ?>" target="_blank" rel="noopener" class="btn btn-outline-white btn-lg">💬 WhatsApp</a>
    </div>
  </div>
</section>

</main>

<?php get_footer(); ?>
