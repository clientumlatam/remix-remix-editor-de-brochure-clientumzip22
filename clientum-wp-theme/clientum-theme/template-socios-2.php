<?php
/**
 * Template Name: Programa de Socios (Alternativa)
 */
get_header(); ?>

<main class="site-main">

<section class="page-hero">
  <div class="container">
    <span class="hero-eyebrow">Partners</span>
    <h1>Asóciate con Clientum y llevá tu negocio al siguiente nivel</h1>
    <p>Creemos en la colaboración para generar valor y crecer juntos. Tu éxito es nuestro éxito.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-green btn-lg">¡Hablemos de asociación!</a>
      <a href="<?php echo esc_url(home_url('/programa-de-socios')); ?>" class="btn btn-outline-white btn-lg">Ver niveles del programa</a>
    </div>
  </div>
</section>

<!-- TIPOS DE PARTNERSHIP -->
<section class="section">
  <div class="container">
    <div class="section-header centered">
      <span class="section-label">Partnerships</span>
      <h2>Socios Estratégicos de Clientum</h2>
      <p class="section-subtitle">Colaboramos con empresas que comparten nuestra visión y valores. Hay un lugar para vos en nuestro ecosistema.</p>
    </div>
    <div class="grid-3">
      <?php
      $types = [
        ['🤝','Referidor','Recomendás Clientum a tus contactos y cobrás comisión por cada cliente que se suscribe. Sin compromiso operativo.','10% comisión'],
        ['🔧','Implementador','Implementás Clientum en empresas clientes, brindás soporte y customizaciones. Ingresos recurrentes por cada cuenta activa.','20% comisión'],
        ['🎯','Socio Estratégico','Integrás Clientum en tu oferta de servicios. Acceso a descuentos especiales, co-marketing y recursos dedicados.','30% comisión'],
      ];
      foreach ($types as $t): ?>
        <div class="card card--white" style="text-align:center">
          <div class="card-icon" style="margin:0 auto 16px;background:var(--g50);font-size:1.5rem"><?php echo $t[0]; ?></div>
          <h3><?php echo esc_html($t[1]); ?></h3>
          <p><?php echo esc_html($t[2]); ?></p>
          <div style="background:var(--navy);color:#fff;border-radius:100px;padding:4px 16px;font-size:.8rem;font-weight:700;display:inline-block;margin-top:12px"><?php echo esc_html($t[3]); ?></div>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- BENEFICIOS -->
<section class="section" style="background:var(--g50)">
  <div class="container">
    <div class="section-header centered">
      <span class="section-label">¿Por qué asociarse?</span>
      <h2>Beneficios de ser Partner Clientum</h2>
    </div>
    <div class="grid-2" style="gap:20px">
      <?php
      $benefits = [
        ['💰','Ingresos recurrentes','Comisiones mes a mes mientras tu cliente sigue activo en Clientum. Un negocio predecible y escalable.'],
        ['🎓','Capacitación gratuita','Acceso a todos los recursos de formación, certificaciones y materiales de ventas del programa de partners.'],
        ['📣','Co-marketing','Tu empresa aparece en nuestro directorio de partners y materiales de marketing. Visibilidad para tu negocio.'],
        ['🚀','Soporte prioritario','Canal dedicado de soporte técnico y comercial. Tus clientes siempre tienen respuesta rápida.'],
      ];
      foreach ($benefits as $b): ?>
        <div class="feature-card" style="display:flex;gap:16px;align-items:flex-start">
          <div class="card-icon" style="background:var(--g100);font-size:1.4rem;flex-shrink:0"><?php echo $b[0]; ?></div>
          <div><h3><?php echo esc_html($b[1]); ?></h3><p><?php echo esc_html($b[2]); ?></p></div>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- CÓMO CONVERTIRSE -->
<section class="section">
  <div class="container" style="max-width:700px">
    <div class="section-header centered">
      <span class="section-label">El proceso</span>
      <h2>Cómo convertirse en Partner</h2>
    </div>
    <div class="steps">
      <div class="step"><div class="step-num">1</div><div class="step-content"><h3>Completá el formulario</h3><p>Contanos sobre tu empresa, tu modelo de negocio y qué tipo de partnership te interesa.</p></div></div>
      <div class="step"><div class="step-num">2</div><div class="step-content"><h3>Reunión de presentación</h3><p>Agendamos una videollamada de 30 minutos para conocernos y presentarte el programa en detalle.</p></div></div>
      <div class="step"><div class="step-num">3</div><div class="step-content"><h3>Onboarding de partner</h3><p>Capacitación, acceso a materiales y activación de tu cuenta de partner con comisiones activas.</p></div></div>
      <div class="step"><div class="step-num">4</div><div class="step-content"><h3>Empezás a ganar</h3><p>Referís tus primeros clientes, cobrás tus primeras comisiones y escalás el negocio juntos.</p></div></div>
    </div>
  </div>
</section>

<section class="cta-section">
  <div class="container">
    <h2>Exploremos oportunidades juntos</h2>
    <p>Estamos listos para colaborar. Contáctanos y discutamos cómo podemos crecer juntos.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-green btn-lg">¡Hablemos de asociación!</a>
      <a href="<?php echo esc_url(clientum_whatsapp()); ?>" target="_blank" rel="noopener" class="btn btn-outline-white btn-lg">💬 WhatsApp</a>
    </div>
  </div>
</section>

</main>
<?php get_footer(); ?>
