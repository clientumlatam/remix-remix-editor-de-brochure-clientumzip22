<?php /* Template Name: Automatización */ get_header(); ?>
<main class="site-main">

<div class="page-hero">
  <div class="container text-center">
    <span class="hero-eyebrow">Funciones · Automatización</span>
    <h1>Hacé más con<br>menos esfuerzo</h1>
    <p>Flujos automáticos que trabajan por vos: seguimientos, recordatorios, asignaciones y notificaciones sin tocar un botón.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/register')); ?>" class="btn btn-primary btn-lg">Probar gratis</a>
    </div>
  </div>
</div>

<section class="section">
  <div class="container">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center">
      <div>
        <span class="section-label">Flujo de ejemplo</span>
        <h2>Así funciona la automatización</h2>
        <p style="color:var(--g500);margin-top:16px;margin-bottom:28px">Configurás las reglas una sola vez. El sistema las ejecuta automáticamente para siempre.</p>
        <div class="steps">
          <?php foreach([
            ['Lead entra por WhatsApp','El bot califica y registra los datos en el CRM automáticamente.'],
            ['El sistema asigna al asesor','Según el rubro o zona, el lead se asigna al vendedor correcto.'],
            ['Seguimiento automático','Si no hay respuesta en 24 horas, el bot hace seguimiento sin intervención.'],
            ['Notificación al asesor','El asesor recibe un aviso si el lead pasó a una etapa crítica del pipeline.'],
          ] as $i => $s): ?>
          <div class="step">
            <div class="step-num"><?php echo $i+1; ?></div>
            <div class="step-content">
              <h3><?php echo esc_html($s[0]); ?></h3>
              <p><?php echo esc_html($s[1]); ?></p>
            </div>
          </div>
          <?php endforeach; ?>
        </div>
      </div>
      <div class="grid-2" style="gap:16px">
        <?php foreach([
          ['⚡','Seguimientos automáticos','Nunca más olvidarte de un cliente importante.'],
          ['⏰','Recordatorios de pago','Enviados automáticamente antes del vencimiento.'],
          ['🎯','Asignación de leads','Según zona, rubro o carga del asesor.'],
          ['📣','Notificaciones al equipo','Avisá cuando un deal cambia de estado.'],
        ] as $a): ?>
        <div style="background:var(--g50);border:1px solid var(--g200);border-radius:10px;padding:20px">
          <div style="font-size:1.6rem;margin-bottom:8px"><?php echo $a[0]; ?></div>
          <h4 style="margin-bottom:6px"><?php echo esc_html($a[1]); ?></h4>
          <p style="font-size:.85rem;color:var(--g500)"><?php echo esc_html($a[2]); ?></p>
        </div>
        <?php endforeach; ?>
      </div>
    </div>
  </div>
</section>

<section class="section" style="background:var(--g50)">
  <div class="container">
    <div class="section-header centered"><h2>Automatizaciones disponibles</h2></div>
    <div class="grid-3">
      <?php foreach([
        'Seguimiento post-consulta a las 24 y 48 horas',
        'Recordatorio de pago antes del vencimiento',
        'Asignación automática de leads por criterios',
        'Notificación al asesor de deals sin actividad',
        'Email de bienvenida al registrar un contacto',
        'Alerta cuando un deal supera el tiempo estimado',
        'Resumen diario del pipeline por email',
        'Derivación automática de consultas complejas',
        'Actualización de etapa según actividad registrada',
      ] as $a): ?>
      <div style="display:flex;align-items:center;gap:12px;padding:16px;background:white;border:1px solid var(--g200);border-radius:8px;font-size:.9rem;color:var(--g700)">
        <span style="width:20px;height:20px;border-radius:50%;background:var(--navy);color:white;font-size:.6rem;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0">✓</span>
        <?php echo esc_html($a); ?>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section class="cta-section">
  <div class="container text-center">
    <h2>Automatizá tu proceso de ventas hoy</h2>
    <p>Configurás las reglas una vez. El sistema trabaja siempre.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/register')); ?>" class="btn btn-green btn-lg">Probar gratis 14 días</a>
    </div>
  </div>
</section>
</main>
<?php get_footer(); ?>
