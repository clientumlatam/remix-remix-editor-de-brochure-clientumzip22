<?php
/**
 * Template Name: Implementación y Soporte (Alternativa)
 */
get_header(); ?>

<main class="site-main">

<section class="page-hero">
  <div class="container">
    <span class="hero-eyebrow">Servicios</span>
    <h1>De cero a operativo en una semana</h1>
    <p>Ingeniería de software de pila completa. Implementamos, capacitamos y acompañamos hasta que tu equipo opera con autonomía total.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/registro')); ?>" class="btn btn-green btn-lg">Empezar ahora</a>
      <a href="<?php echo esc_url(clientum_whatsapp()); ?>" target="_blank" rel="noopener" class="btn btn-outline-white btn-lg">💬 Hablar por WhatsApp</a>
    </div>
  </div>
</section>

<!-- INTRO -->
<section class="section">
  <div class="container">
    <div class="section-header centered">
      <span class="section-label">Nuestra cultura</span>
      <h2>Un vistazo a cómo trabajamos</h2>
      <p class="section-subtitle">En Clientum, cada implementación es un proyecto único. Nos comprometemos con la excelencia y el crecimiento sostenible de tu empresa.</p>
    </div>
    <div class="grid-2" style="gap:20px">
      <?php
      $values = [
        ['🔍','Investigación inicial','Analizamos en detalle las necesidades de tu negocio antes de avanzar. Ningún detalle se asume: entendemos tu contexto, tu equipo y tus procesos actuales.'],
        ['✅','Validación continua','Cada etapa del proceso cumple con criterios de calidad antes de avanzar. Usamos métricas y casos de éxito para medir el impacto real de cada cambio.'],
        ['⚡','Agilidad','Metodologías ágiles que se adaptan rápido a los cambios de requisitos. Entregamos resultados en días, no en meses. Tu negocio no puede esperar.'],
        ['🏆','Liderazgo experimentado','Un equipo con años de experiencia en implementaciones PyME en Argentina guía cada proyecto. Nuestros valores: compromiso, innovación y transparencia.'],
      ];
      foreach ($values as $v): ?>
        <div class="feature-card">
          <div class="card-icon" style="background:var(--g100);font-size:1.5rem"><?php echo $v[0]; ?></div>
          <h3><?php echo esc_html($v[1]); ?></h3>
          <p><?php echo esc_html($v[2]); ?></p>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- PROCESO -->
<section class="section" style="background:var(--g50)">
  <div class="container">
    <div class="section-header centered">
      <span class="section-label">El proceso</span>
      <h2>Tu implementación, paso a paso</h2>
    </div>
    <div class="steps" style="max-width:680px;margin:0 auto">
      <div class="step"><div class="step-num">1</div><div class="step-content"><h3>Kick-off (Día 1)</h3><p>Reunión de inicio para relevar procesos, definir usuarios, módulos y configuración inicial.</p></div></div>
      <div class="step"><div class="step-num">2</div><div class="step-content"><h3>Configuración (Días 2-3)</h3><p>Setup completo de la plataforma: pipeline de ventas, productos, usuarios y reglas de automatización.</p></div></div>
      <div class="step"><div class="step-num">3</div><div class="step-content"><h3>Migración de datos (Días 4-5)</h3><p>Importamos tus contactos, productos y datos históricos. Verificamos la integridad de toda la información.</p></div></div>
      <div class="step"><div class="step-num">4</div><div class="step-content"><h3>Capacitación (Día 6)</h3><p>Entrenamos a tu equipo en las herramientas que van a usar. Grabamos tutoriales personalizados para consulta futura.</p></div></div>
      <div class="step"><div class="step-num">5</div><div class="step-content"><h3>Go-live (Día 7)</h3><p>Tu empresa opera con Clientum. Monitoreo activo durante los primeros 30 días para asegurar la adopción.</p></div></div>
    </div>
  </div>
</section>

<!-- STATS -->
<section class="section--sm">
  <div class="container">
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-number">7</div><div class="stat-label">Días promedio hasta go-live</div></div>
      <div class="stat-card"><div class="stat-number">1.750+</div><div class="stat-label">Implementaciones exitosas</div></div>
      <div class="stat-card"><div class="stat-number">98%</div><div class="stat-label">Tasa de adopción a 30 días</div></div>
      <div class="stat-card"><div class="stat-number">4h</div><div class="stat-label">Tiempo de respuesta soporte</div></div>
    </div>
  </div>
</section>

<section class="cta-section">
  <div class="container">
    <h2>¿Listo para construir algo valioso?</h2>
    <p>Trabajemos juntos. La primera sesión de implementación no tiene costo.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/registro')); ?>" class="btn btn-green btn-lg">Empezar gratis</a>
      <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-outline-white btn-lg">Hablar con el equipo</a>
    </div>
  </div>
</section>

</main>
<?php get_footer(); ?>
