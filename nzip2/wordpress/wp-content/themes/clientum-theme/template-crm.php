<?php /* Template Name: CRM Inteligente */ get_header(); ?>
<main class="site-main">

<div class="page-hero">
  <div class="container text-center">
    <span class="hero-eyebrow">Funciones · CRM</span>
    <h1>Nunca más perdas<br>una venta</h1>
    <p>Pipeline visual de ventas, seguimiento automático de clientes y gestión de oportunidades desde un solo panel.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/register')); ?>" class="btn btn-primary btn-lg">Probar gratis</a>
      <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-outline-white btn-lg">Ver demo</a>
    </div>
  </div>
</div>

<section class="section section--sm" style="background:var(--g50)">
  <div class="container">
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-number">+35%</div><div class="stat-label">Tasa de cierre promedio</div></div>
      <div class="stat-card"><div class="stat-number">0</div><div class="stat-label">Oportunidades perdidas por olvido</div></div>
      <div class="stat-card"><div class="stat-number">100%</div><div class="stat-label">Visibilidad del pipeline</div></div>
      <div class="stat-card"><div class="stat-number">1 panel</div><div class="stat-label">Para todo tu equipo comercial</div></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-header centered"><h2>Un CRM que trabaja por vos</h2></div>
    <div class="grid-3">
      <?php foreach([
        ['📊','Pipeline visual','Drag & drop para mover deals entre etapas. Tu equipo ve el estado de cada venta en tiempo real.'],
        ['👥','Contactos y empresas','Base de datos centralizada con historial completo de cada cliente, conversación y documento.'],
        ['⚡','Seguimiento automático','Tareas, recordatorios y seguimientos post-venta que se generan solos según las reglas que definís.'],
        ['🤝','Gestión de deals','Valor, probabilidad, fecha estimada de cierre y responsable, todo en un solo lugar.'],
        ['📱','Acceso desde el celular','Consultá y actualizás tu CRM desde cualquier dispositivo, sin instalar nada.'],
        ['🔗','Integrado con WhatsApp','Cada conversación del bot queda registrada automáticamente como actividad en el deal correspondiente.'],
      ] as $f): ?>
      <div class="feature-card">
        <div class="card-icon" style="background:#dbeafe"><?php echo $f[0]; ?></div>
        <h3><?php echo esc_html($f[1]); ?></h3>
        <p><?php echo esc_html($f[2]); ?></p>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section class="section" style="background:var(--g50)">
  <div class="container">
    <div class="section-header centered"><h2>Casos de uso del CRM</h2></div>
    <div class="grid-3">
      <?php foreach([
        ['Comercio y distribución','Seguimiento de presupuestos, historial de pedidos y gestión de clientes recurrentes.'],
        ['Servicios profesionales','Gestión de propuestas, seguimiento de proyectos y facturación integrada.'],
        ['Agro y ganadería','Trazabilidad de lotes, historial de operaciones y gestión de proveedores.'],
      ] as $c): ?>
      <div class="card card--white">
        <h3><?php echo esc_html($c[0]); ?></h3>
        <p><?php echo esc_html($c[1]); ?></p>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section class="cta-section">
  <div class="container text-center">
    <h2>Empezá a usar tu CRM hoy</h2>
    <p>Importamos tus contactos actuales. Operativo en menos de una semana.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/register')); ?>" class="btn btn-green btn-lg">Probar gratis 14 días</a>
    </div>
  </div>
</section>
</main>
<?php get_footer(); ?>
