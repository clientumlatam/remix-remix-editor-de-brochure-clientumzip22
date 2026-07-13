<?php /* Template Name: Programa de Socios */ get_header(); ?>
<main class="site-main">

<div class="page-hero">
  <div class="container text-center">
    <span class="hero-eyebrow">Programa de Socios</span>
    <h1>Generá ingresos recurrentes<br>con Clientum</h1>
    <p>Recomendá o implementá Clientum en otras PyMEs y recibí comisiones mensuales mientras esas empresas usen la plataforma.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-primary btn-lg">Quiero ser socio</a>
    </div>
  </div>
</div>

<section class="section">
  <div class="container">
    <div class="section-header centered">
      <h2>Elegí el nivel que mejor te queda</h2>
      <p class="section-subtitle">Tres modalidades según tu dedicación y expertise en tecnología.</p>
    </div>
    <div class="partner-grid">
      <div class="partner-card">
        <div class="partner-commission">10%</div>
        <p style="color:var(--g400);font-size:.8rem;margin-bottom:12px">de comisión mensual recurrente</p>
        <div class="partner-tier-name">Referidor</div>
        <p style="color:var(--g500);font-size:.875rem">Referís empresas de tu red y nosotros hacemos el resto.</p>
        <ul>
          <?php foreach(['Sin costo de ingreso al programa','Material de ventas y demos incluidos','Comisiones mensuales recurrentes','Panel de seguimiento de referidos'] as $b): ?>
          <li><?php echo esc_html($b); ?></li>
          <?php endforeach; ?>
        </ul>
        <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-outline" style="width:100%;justify-content:center;margin-top:20px">Empezar como Referidor</a>
      </div>

      <div class="partner-card partner-card--featured">
        <div class="partner-commission">20%</div>
        <p style="color:rgba(255,255,255,.5);font-size:.8rem;margin-bottom:12px">de comisión mensual recurrente</p>
        <div class="partner-tier-name">Implementador</div>
        <p style="color:rgba(255,255,255,.7);font-size:.875rem">Implementás Clientum en las PyMEs de tus clientes.</p>
        <ul>
          <?php foreach(['Capacitación técnica completa incluida','Acceso a sandbox y entorno de pruebas','Co-branding y directorio de socios','Soporte dedicado para implementaciones','Comisiones más altas por implementación'] as $b): ?>
          <li><?php echo esc_html($b); ?></li>
          <?php endforeach; ?>
        </ul>
        <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-green" style="width:100%;justify-content:center;margin-top:20px">Ser Implementador</a>
      </div>

      <div class="partner-card">
        <div class="partner-commission">30%</div>
        <p style="color:var(--g400);font-size:.8rem;margin-bottom:12px">de comisión mensual recurrente</p>
        <div class="partner-tier-name">Estratégico</div>
        <p style="color:var(--g500);font-size:.875rem">Integramos Clientum en tu oferta de servicios completa.</p>
        <ul>
          <?php foreach(['Account manager dedicado','Acceso completo a la API','Roadmap conjunto con el equipo Clientum','White-label disponible','Condiciones comerciales exclusivas'] as $b): ?>
          <li><?php echo esc_html($b); ?></li>
          <?php endforeach; ?>
        </ul>
        <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-outline" style="width:100%;justify-content:center;margin-top:20px">Ser Socio Estratégico</a>
      </div>
    </div>
  </div>
</section>

<section class="section" style="background:var(--g50)">
  <div class="container">
    <div class="section-header centered"><h2>¿Cómo funciona el programa?</h2></div>
    <div class="steps" style="max-width:640px;margin-inline:auto">
      <?php foreach([
        ['Te registrás','Completás el formulario y te contactamos para definir tu nivel de participación.'],
        ['Recibís tu material','Te damos acceso a demos, presentaciones, caso de estudio y tu link de referido único.'],
        ['Referís o implementás','Cada vez que una empresa se suma por tu gestión, comienza a generar comisión.'],
        ['Cobrás cada mes','Las comisiones se acreditan mensualmente mientras el cliente siga activo en Clientum.'],
      ] as $i => $s): ?>
      <div class="step">
        <div class="step-num"><?php echo $i+1; ?></div>
        <div class="step-content"><h3><?php echo esc_html($s[0]); ?></h3><p><?php echo esc_html($s[1]); ?></p></div>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section class="cta-section">
  <div class="container text-center">
    <h2>Empezá a generar ingresos recurrentes</h2>
    <p>Sin inversión inicial. Sin límite de clientes que podés referir.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-green btn-lg">Registrarme como socio</a>
    </div>
  </div>
</section>
</main>
<?php get_footer(); ?>
