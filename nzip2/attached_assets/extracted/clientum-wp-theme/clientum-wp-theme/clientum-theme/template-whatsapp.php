<?php /* Template Name: Chatbot WhatsApp */ get_header(); ?>
<main class="site-main">

<div class="page-hero">
  <div class="container text-center">
    <span class="hero-eyebrow">Funciones · WhatsApp</span>
    <h1>Tu negocio atiende solo,<br>las 24 horas</h1>
    <p>Chatbot inteligente en WhatsApp que califica leads, agenda citas y responde consultas sin que vos intervengas.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/register')); ?>" class="btn btn-green btn-lg">Probarlo gratis</a>
      <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-outline-white btn-lg">Ver demo</a>
    </div>
  </div>
</div>

<section class="section section--sm" style="background:var(--g50)">
  <div class="container">
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-number">24/7</div><div class="stat-label">Atención sin pausas</div></div>
      <div class="stat-card"><div class="stat-number">&lt; 1s</div><div class="stat-label">Tiempo de respuesta</div></div>
      <div class="stat-card"><div class="stat-number">+60%</div><div class="stat-label">Más consultas respondidas</div></div>
      <div class="stat-card"><div class="stat-number">0</div><div class="stat-label">Personal extra necesario</div></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-header centered">
      <span class="section-label">Cómo funciona</span>
      <h2>De consulta a cliente, sin intervención humana</h2>
    </div>
    <div class="steps" style="max-width:640px;margin-inline:auto">
      <?php foreach([
        ['El cliente escribe a tu WhatsApp','El bot responde al instante, a cualquier hora del día o la noche, con el tono y el estilo de tu marca.'],
        ['La IA califica y responde','Responde preguntas frecuentes, cotiza, agenda turnos y recopila datos del cliente automáticamente.'],
        ['El lead llega al CRM','Si la consulta necesita un asesor, el bot deriva con todo el historial ya cargado en el CRM.'],
        ['Tu equipo cierra la venta','Tu asesor solo interviene en el momento justo, con toda la información del cliente ya disponible.'],
      ] as $s): ?>
      <div class="step">
        <div class="step-num" style="background:var(--green);min-width:40px">💬</div>
        <div class="step-content"><h3><?php echo esc_html($s[0]); ?></h3><p><?php echo esc_html($s[1]); ?></p></div>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section class="section" style="background:var(--g50)">
  <div class="container">
    <div class="section-header centered"><h2>Todo lo que puede hacer el bot</h2></div>
    <div class="grid-3">
      <?php foreach([
        ['💬','Respuesta instantánea','Responde preguntas frecuentes al instante, en cualquier momento, sin demoras.'],
        ['📅','Agendamiento automático','El bot agenda citas según tu disponibilidad y las confirma por WhatsApp.'],
        ['💰','Cotizaciones automáticas','Genera y envía presupuestos personalizados sin que vos toques nada.'],
        ['🏷️','Calificación de leads','Clasifica cada consulta según su intención de compra y la prioriza en el CRM.'],
        ['📋','Recopilación de datos','Obtiene nombre, empresa, email y necesidad del cliente automáticamente.'],
        ['🔁','Seguimiento post-consulta','Si el cliente no responde, el bot hace seguimiento automático a las 24 y 48 horas.'],
      ] as $f): ?>
      <div class="feature-card">
        <div class="card-icon" style="background:#dcfce7"><?php echo $f[0]; ?></div>
        <h3><?php echo esc_html($f[1]); ?></h3>
        <p><?php echo esc_html($f[2]); ?></p>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section class="cta-section">
  <div class="container text-center">
    <h2>Activá tu bot en menos de una semana</h2>
    <p>Sin código. Sin IT. Solo tu número de WhatsApp y Clientum.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/register')); ?>" class="btn btn-green btn-lg">Probar gratis 14 días</a>
    </div>
  </div>
</section>
</main>
<?php get_footer(); ?>
