<?php
/**
 * Template Name: Implementación y Soporte
 */
get_header(); ?>

<main class="site-main">

<!-- HERO -->
<section class="page-hero">
  <div class="container">
    <span class="hero-eyebrow">Servicios</span>
    <h1>Implementación y Soporte</h1>
    <p>Te acompañamos desde el día cero hasta que tu equipo opera con total autonomía. Hacemos la diferencia.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/registro')); ?>" class="btn btn-green btn-lg">Empezar ahora</a>
      <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-outline-white btn-lg">Hablar con un especialista</a>
    </div>
  </div>
</section>

<!-- INTRO -->
<section class="section">
  <div class="container">
    <div class="grid-2" style="align-items:center;gap:64px">
      <div>
        <span class="section-label">Nuestra diferencia</span>
        <h2>Ayudamos a los innovadores a construir negocios valiosos</h2>
        <p>En Clientum, cada implementación es tratada como un proyecto único. Analizamos tu contexto, diseñamos el flujo ideal para tu empresa y te capacitamos hasta que el sistema sea parte natural de tu operación diaria.</p>
        <p>Nuestro equipo habla tu idioma — español rioplatense, precios en pesos, procesos argentinos.</p>
        <a href="<?php echo esc_url(home_url('/casos-de-exito')); ?>" class="btn btn-outline mt-4">Ver casos de éxito →</a>
      </div>
      <div>
        <div class="stats-grid" style="grid-template-columns:repeat(2,1fr)">
          <div class="stat-card"><div class="stat-number">365</div><div class="stat-label">Días de servicio al año</div></div>
          <div class="stat-card"><div class="stat-number">1.750+</div><div class="stat-label">PyMEs implementadas</div></div>
          <div class="stat-card"><div class="stat-number">&lt;7d</div><div class="stat-label">Tiempo promedio de setup</div></div>
          <div class="stat-card"><div class="stat-number">4h</div><div class="stat-label">Tiempo de respuesta soporte</div></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- METODOLOGÍA -->
<section class="section" style="background:var(--g50)">
  <div class="container">
    <div class="section-header centered">
      <span class="section-label">Cómo trabajamos</span>
      <h2 class="section-title">Un vistazo a nuestra metodología</h2>
    </div>
    <div class="grid-2" style="gap:20px">
      <?php
      $steps = [
        ['🔍','Investigación inicial','Analizamos en detalle las necesidades de tu negocio: procesos actuales, equipo, herramientas que ya usás y puntos de dolor. Nada se asume; todo se valida.'],
        ['✅','Validación','Implementamos un enfoque de validación continua. Cada etapa cumple con criterios de calidad antes de avanzar. Usamos casos de éxito reales para medir el impacto.'],
        ['🚀','Agilidad','Metodologías ágiles que se adaptan rápido a cambios de requisitos. Entregamos resultados en semanas, no meses.'],
        ['🏆','Liderazgo','Un equipo experimentado guía cada proyecto. Nuestros valores — compromiso, innovación, claridad — se reflejan en cada entrega.'],
      ];
      foreach ($steps as $s): ?>
        <div class="feature-card">
          <div class="card-icon" style="background:var(--g100);font-size:1.5rem"><?php echo $s[0]; ?></div>
          <h3><?php echo esc_html($s[1]); ?></h3>
          <p><?php echo esc_html($s[2]); ?></p>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="cta-section">
  <div class="container">
    <h2>¿Listo para construir algo valioso?</h2>
    <p>Trabajemos juntos. Primera sesión de implementación sin cargo.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/registro')); ?>" class="btn btn-green btn-lg">Empezar gratis</a>
      <a href="<?php echo esc_url(clientum_whatsapp()); ?>" target="_blank" rel="noopener" class="btn btn-outline-white btn-lg">💬 WhatsApp</a>
    </div>
  </div>
</section>

</main>

<?php get_footer(); ?>
