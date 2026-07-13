<?php /* Template Name: Reportes Automáticos */ get_header(); ?>
<main class="site-main">

<div class="page-hero">
  <div class="container text-center">
    <span class="hero-eyebrow">Funciones · Reportes</span>
    <h1>Tomá decisiones<br>con datos reales</h1>
    <p>Reportes automáticos de ventas, conversión y actividad del equipo, siempre disponibles y actualizados.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/register')); ?>" class="btn btn-primary btn-lg">Probar gratis</a>
    </div>
  </div>
</div>

<section class="section section--sm" style="background:var(--g50)">
  <div class="container">
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-number">8+</div><div class="stat-label">Tipos de reportes incluidos</div></div>
      <div class="stat-card"><div class="stat-number">Diario</div><div class="stat-label">Frecuencia automática disponible</div></div>
      <div class="stat-card"><div class="stat-number">PDF/XLS</div><div class="stat-label">Formatos de exportación</div></div>
      <div class="stat-card"><div class="stat-number">Email</div><div class="stat-label">Entrega automática a tu bandeja</div></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-header centered"><h2>Reportes disponibles</h2></div>
    <div class="grid-3">
      <?php foreach([
        ['📈','Ventas por período','Total de ventas, ticket promedio y comparación contra el período anterior.'],
        ['🏆','Ranking de asesores','Rendimiento de cada miembro del equipo comercial con KPIs individuales.'],
        ['🔄','Tasa de conversión','De lead a contacto, de contacto a propuesta, de propuesta a cierre.'],
        ['📊','Pipeline snapshot','Estado actual de todos los deals activos con valor potencial total.'],
        ['⏱️','Tiempo de respuesta','Velocidad de atención del equipo, desde la consulta hasta la primera respuesta.'],
        ['📋','Actividad del equipo','Llamadas, emails, reuniones y tareas completadas por período y por asesor.'],
        ['💰','Proyección de ingresos','Estimación de cierre de deals según probabilidad y fecha esperada.'],
        ['🤖','Resumen del chatbot','Consultas atendidas, leads generados y derivaciones del bot de WhatsApp.'],
      ] as $r): ?>
      <div class="feature-card">
        <div class="card-icon" style="background:#fff7ed"><?php echo $r[0]; ?></div>
        <h3><?php echo esc_html($r[1]); ?></h3>
        <p><?php echo esc_html($r[2]); ?></p>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section class="cta-section">
  <div class="container text-center">
    <h2>Empezá a medir tu negocio hoy</h2>
    <p>Los reportes se configuran en minutos y se generan solos.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/register')); ?>" class="btn btn-green btn-lg">Probar gratis 14 días</a>
    </div>
  </div>
</section>
</main>
<?php get_footer(); ?>
