<?php
/**
 * Template Name: Consultoría Empresarial
 */
get_header(); ?>

<main class="site-main">

<!-- HERO -->
<section class="page-hero">
  <div class="container">
    <span class="hero-eyebrow">Servicios</span>
    <h1>Consultoría Empresarial</h1>
    <p>Tu aliado estratégico en soluciones empresariales. Diagnóstico, estrategia e implementación a medida.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/registro')); ?>" class="btn btn-green btn-lg">Solicitar consulta</a>
      <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-outline-white btn-lg">Contáctanos</a>
    </div>
  </div>
</section>

<!-- MÉTRICAS -->
<section class="section--sm" style="background:var(--g50)">
  <div class="container">
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-number">100+</div><div class="stat-label">Proyectos completados</div></div>
      <div class="stat-card"><div class="stat-number">50+</div><div class="stat-label">Clientes satisfechos</div></div>
      <div class="stat-card"><div class="stat-number">10+</div><div class="stat-label">Años de experiencia</div></div>
      <div class="stat-card"><div class="stat-number">80%</div><div class="stat-label">ROI promedio</div></div>
    </div>
  </div>
</section>

<!-- METODOLOGÍA -->
<section class="section">
  <div class="container">
    <div class="section-header centered">
      <span class="section-label">Nuestra metodología</span>
      <h2 class="section-title">Cómo trabajamos con tu empresa</h2>
      <p class="section-subtitle">Un proceso probado para transformar tu negocio con resultados medibles.</p>
    </div>
    <div class="steps" style="max-width:680px;margin:0 auto">
      <div class="step">
        <div class="step-num">1</div>
        <div class="step-content">
          <h3>Diagnóstico</h3>
          <p>Realizamos un análisis exhaustivo de tu empresa: procesos, tecnología, equipo y mercado. Identificamos oportunidades de mejora con datos reales.</p>
        </div>
      </div>
      <div class="step">
        <div class="step-num">2</div>
        <div class="step-content">
          <h3>Estrategia</h3>
          <p>Desarrollamos un plan de acción personalizado, alineado con tus objetivos de negocio y presupuesto. Priorizamos impacto y velocidad de implementación.</p>
        </div>
      </div>
      <div class="step">
        <div class="step-num">3</div>
        <div class="step-content">
          <h3>Implementación</h3>
          <p>Acompañamos la ejecución de las estrategias en cada etapa, midiendo resultados y ajustando para asegurar resultados tangibles y sostenibles.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- SERVICIOS -->
<section class="section" style="background:var(--g50)">
  <div class="container">
    <div class="section-header centered">
      <span class="section-label">Qué hacemos</span>
      <h2 class="section-title">Áreas de consultoría</h2>
    </div>
    <div class="grid-2" style="gap:20px">
      <?php
      $services = [
        ['🎯','Consultoría Estratégica','Planificación de largo plazo, modelo de negocio, posicionamiento competitivo y hoja de ruta hacia tus objetivos.'],
        ['⚙️','Optimización de Procesos','Análisis y rediseño de procesos internos para eliminar fricciones, reducir costos y mejorar la velocidad operativa.'],
        ['🔄','Gestión del Cambio','Acompañamiento organizacional para que tu equipo adopte nuevas herramientas y metodologías con éxito.'],
        ['🎓','Formación y Capacitación','Programas de capacitación en herramientas digitales, CRM, facturación AFIP y automatización para PyMEs.'],
      ];
      foreach ($services as $s): ?>
        <div class="feature-card" style="display:flex;gap:20px;align-items:flex-start">
          <div class="card-icon" style="background:var(--g100);font-size:1.5rem;flex-shrink:0"><?php echo $s[0]; ?></div>
          <div>
            <h3><?php echo esc_html($s[1]); ?></h3>
            <p><?php echo esc_html($s[2]); ?></p>
          </div>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="cta-section">
  <div class="container">
    <h2>¿Listo para transformar tu empresa?</h2>
    <p>Primera consulta gratuita. Te mostramos el camino en menos de 60 minutos.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/registro')); ?>" class="btn btn-green btn-lg">Solicitar consulta gratis</a>
      <a href="<?php echo esc_url(clientum_whatsapp()); ?>" target="_blank" rel="noopener" class="btn btn-outline-white btn-lg">💬 WhatsApp</a>
    </div>
  </div>
</section>

</main>

<?php get_footer(); ?>
