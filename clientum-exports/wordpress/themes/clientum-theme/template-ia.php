<?php /* Template Name: Asistente IA */ get_header(); ?>
<main class="site-main">

<div class="page-hero">
  <div class="container text-center">
    <span class="hero-eyebrow">Funciones · Inteligencia Artificial</span>
    <h1>Tu analista de negocio,<br>siempre disponible</h1>
    <p>Preguntale en castellano y obtené insights de tus ventas al instante. No necesitás saber de datos ni de tecnología.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/register')); ?>" class="btn btn-primary btn-lg">Probar gratis</a>
    </div>
  </div>
</div>

<section class="section">
  <div class="container">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:start">
      <div>
        <span class="section-label">Cómo funciona</span>
        <h2>Preguntale como si hablaras con un humano</h2>
        <p style="color:var(--g500);margin-top:16px;line-height:1.8">El Asistente IA de Clientum analiza todos tus datos del CRM y te responde en lenguaje natural. Sin fórmulas, sin tablas dinámicas, sin consultores externos.</p>
        <ul class="feature-card" style="border:none;background:var(--g50);margin-top:24px">
          <?php foreach([
            '¿Cuáles son mis 5 mejores clientes este trimestre?',
            '¿Qué deals llevan más de 15 días sin actividad?',
            'Generame un resumen de ventas de esta semana',
            '¿Cuál es mi tasa de conversión por canal?',
            'Redactame un email de seguimiento para el deal de Distribuidora del Sur',
          ] as $q): ?>
          <li style="list-style:none;padding:10px 0;border-bottom:1px solid var(--g200);font-size:.9rem;color:var(--g700);display:flex;gap:10px;align-items:flex-start">
            <span style="color:var(--navy);font-size:.7rem;margin-top:3px">💬</span><?php echo esc_html($q); ?>
          </li>
          <?php endforeach; ?>
        </ul>
      </div>
      <div style="background:linear-gradient(135deg,var(--navy-dark),var(--navy));border-radius:16px;padding:28px">
        <p style="color:rgba(255,255,255,.5);font-size:.75rem;margin-bottom:16px">ASISTENTE IA · CLIENTUM</p>
        <?php $chat = [
          ['user','¿Cuáles fueron mis mejores deals de esta semana?'],
          ['ai','Esta semana cerraste 3 deals por un total de $1.250.000 ARS. El de mayor valor fue Distribuidora del Sur ($680.000). Tu tasa de cierre fue del 67%, 12 puntos por encima del promedio mensual. 📈'],
          ['user','¿Cuántos leads sin seguimiento tengo?'],
          ['ai','Encontré 7 leads sin actividad en los últimos 5 días. ¿Querés que genere recordatorios automáticos para cada uno?'],
        ];
        foreach ($chat as $msg) {
          $isUser = $msg[0] === 'user';
          echo '<div style="display:flex;' . ($isUser ? 'justify-content:flex-end' : '') . ';margin-bottom:12px">
            <div style="max-width:85%;padding:12px 16px;border-radius:12px;font-size:.875rem;line-height:1.5;' . ($isUser ? 'background:rgba(255,255,255,.12);color:white' : 'background:rgba(37,211,102,.12);color:rgba(255,255,255,.9);border:1px solid rgba(37,211,102,.2)') . '">'
            . esc_html($msg[1]) . '</div></div>';
        } ?>
      </div>
    </div>
  </div>
</section>

<section class="section" style="background:var(--g50)">
  <div class="container">
    <div class="section-header centered"><h2>Qué puede hacer el Asistente IA</h2></div>
    <div class="grid-3">
      <?php foreach([
        ['🔍','Análisis de ventas','Responde preguntas sobre tu pipeline, conversión y rendimiento del equipo en segundos.'],
        ['✍️','Redacción automática','Genera emails de seguimiento, propuestas y resúmenes de reuniones con un solo pedido.'],
        ['📊','Reportes express','Crea reportes ejecutivos en segundos, listos para compartir con tu equipo o socios.'],
        ['⚠️','Alertas proactivas','Te avisa cuando un deal lleva mucho tiempo sin actividad o cuando hay una oportunidad de seguimiento.'],
        ['🗓️','Resúmenes diarios','Cada mañana recibís un resumen de lo que pasó ayer y las prioridades del día.'],
        ['🧠','Aprende de tu negocio','Cuanto más lo usás, más contexto tiene sobre tus clientes, productos y procesos.'],
      ] as $f): ?>
      <div class="feature-card">
        <div class="card-icon" style="background:#ede9fe"><?php echo $f[0]; ?></div>
        <h3><?php echo esc_html($f[1]); ?></h3>
        <p><?php echo esc_html($f[2]); ?></p>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section class="cta-section">
  <div class="container text-center">
    <h2>Probá el Asistente IA gratis</h2>
    <p>Incluido en el plan Pro. 14 días sin tarjeta de crédito.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/register')); ?>" class="btn btn-green btn-lg">Probar gratis 14 días</a>
    </div>
  </div>
</section>
</main>
<?php get_footer(); ?>
