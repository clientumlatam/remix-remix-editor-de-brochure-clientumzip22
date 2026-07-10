<?php /* Template Name: AI Copilot */ get_header(); ?>
<main class="site-main">

<div class="page-hero" style="background:linear-gradient(135deg,#4c1d95 0%,#7c3aed 60%,#1A3461 100%)">
  <div class="container text-center">
    <span class="hero-eyebrow" style="background:rgba(255,255,255,.15);color:white">Viaweb AI Copilot</span>
    <h1 style="color:white">IA y automatización<br><span style="color:#c4b5fd">aplicada a tu negocio</span></h1>
    <p style="color:rgba(255,255,255,.8);max-width:560px;margin:0 auto 32px">Predicciones, flujos automáticos, análisis inteligente y asistentes conversacionales a medida — integrado directamente con tu CRM.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-primary btn-lg">Solicitar demo</a>
      <a href="#planes" class="btn btn-ghost btn-lg" style="color:white;border-color:rgba(255,255,255,.3)">Ver planes</a>
    </div>
  </div>
</div>

<!-- Stats -->
<section style="background:#faf5ff;padding:40px 0;border-bottom:1px solid #ede9fe">
  <div class="container">
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:24px;text-align:center">
      <div><div style="font-size:2rem;font-weight:800;color:#7c3aed">+60%</div><div style="font-size:.82rem;color:var(--g500)">reducción de tareas manuales</div></div>
      <div><div style="font-size:2rem;font-weight:800;color:#7c3aed">24/7</div><div style="font-size:.82rem;color:var(--g500)">asistente activo sin parar</div></div>
      <div><div style="font-size:2rem;font-weight:800;color:#7c3aed">3x</div><div style="font-size:.82rem;color:var(--g500)">velocidad de respuesta al cliente</div></div>
      <div><div style="font-size:2rem;font-weight:800;color:#7c3aed">100%</div><div style="font-size:.82rem;color:var(--g500)">integrado con tu CRM</div></div>
    </div>
  </div>
</section>

<!-- Capacidades -->
<section class="section">
  <div class="container">
    <div class="section-header text-center">
      <span class="hero-eyebrow">Qué puede hacer</span>
      <h2>La IA que trabaja mientras vos descansás</h2>
    </div>
    <div class="grid-3">
      <?php
      $caps = [
        ['🤖','Chatbots conversacionales','Asistentes por WhatsApp, web y email que responden, califican leads y agendan reuniones de forma autónoma.'],
        ['🔮','Predicciones y recomendaciones','Predecí qué clientes van a comprar, qué leads van a cerrar y qué productos van a rotar más.'],
        ['⚡','Automatización de flujos','Definís una regla, la IA la ejecuta: mails automáticos, notificaciones, asignaciones y seguimientos.'],
        ['📊','Análisis de datos con IA','Analizá conversaciones, tickets y métricas para detectar patrones y oportunidades sin analistas.'],
        ['🌐','Integración nativa con CRM','Todo lo que hace la IA queda registrado en el CRM: actividades, contactos y oportunidades actualizados.'],
        ['🎨','Personalización a medida','Cada Copilot se entrena con los datos y procesos de tu empresa — no es una solución genérica.'],
      ];
      foreach ($caps as $c): ?>
      <div class="service-detail-card">
        <div class="service-icon" style="background:#7c3aed"><span style="font-size:1.6rem"><?php echo $c[0]; ?></span></div>
        <h3><?php echo esc_html($c[1]); ?></h3>
        <p><?php echo esc_html($c[2]); ?></p>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- Planes -->
<section class="section section--sm" style="background:#faf5ff" id="planes">
  <div class="container">
    <div class="section-header text-center">
      <span class="hero-eyebrow">Precios de referencia</span>
      <h2>Planes Viaweb AI Copilot</h2>
      <p>Valores orientativos en pesos argentinos. Cada implementación se cotiza a medida.</p>
    </div>
    <?php
    $plans = [
      ['Basic',    '$600.000 – $900.000',   '48 hs','IA básica y automatización','Automatizá los procesos más repetitivos de tu equipo.',false,['Chatbot básico por WhatsApp','3 flujos automatizados','Integración con CRM básica','Reportes mensuales','Soporte por email']],
      ['Standard', '$900.000 – $1.300.000', '36 hs','IA estándar y predicciones básicas','Empezá a tomar decisiones con datos reales.',false,['Chatbot multicanal (WA + web)','10 flujos automatizados','Predicciones básicas de ventas','Dashboard de métricas','Soporte prioritario']],
      ['Pro',      '$1.300.000 – $1.800.000','24 hs','IA profesional y predicciones avanzadas','La solución más elegida por PyMEs en crecimiento.',true, ['Chatbot con NLP avanzado','Flujos ilimitados','Predicciones avanzadas','Análisis de sentimiento','Entrenamiento con tus datos','Soporte dedicado']],
      ['Advanced', '$1.800.000 – $2.300.000','18 hs','IA avanzada y automatización completa','Para empresas que quieren escalar con IA como ventaja.',false,['Todo lo de Pro','Agentes IA autónomos','Modelos custom entrenados','Integración ERP+CRM+IA','SLA garantizado','Arquitecto de IA asignado']],
      ['Enterprise','$2.300.000 – $3.000.000','12 hs','IA empresarial personalizada','Plataforma de IA completa con equipo dedicado.',false,['Todo lo de Advanced','LLM propio fine-tuned','On-premise o cloud privado','Equipo de IA dedicado','Capacitación full equipo','Gerente de proyecto']],
    ];
    ?>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-top:32px">
      <?php foreach ($plans as $plan): ?>
      <div style="background:<?php echo $plan[5] ? '#4c1d95' : 'white'; ?>;border:2px solid <?php echo $plan[5] ? '#7c3aed' : 'var(--g200)'; ?>;border-radius:16px;padding:24px;display:flex;flex-direction:column;position:relative">
        <?php if ($plan[5]): ?><div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:#7c3aed;color:white;font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;padding:4px 14px;border-radius:100px">Más elegido</div><?php endif; ?>
        <div style="font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:<?php echo $plan[5] ? '#c4b5fd' : '#7c3aed'; ?>;margin-bottom:8px"><?php echo esc_html($plan[0]); ?></div>
        <div style="font-size:1.1rem;font-weight:800;color:<?php echo $plan[5] ? 'white' : 'var(--g900)'; ?>;margin-bottom:4px"><?php echo esc_html($plan[1]); ?></div>
        <div style="font-size:.72rem;color:<?php echo $plan[5] ? 'rgba(255,255,255,.5)' : 'var(--g400)'; ?>;margin-bottom:12px">Respuesta en <?php echo esc_html($plan[2]); ?> hábiles</div>
        <p style="font-size:.78rem;color:<?php echo $plan[5] ? 'rgba(255,255,255,.7)' : 'var(--g500)'; ?>;margin-bottom:16px"><?php echo esc_html($plan[4]); ?></p>
        <ul style="list-style:none;padding:0;margin:0 0 20px;flex:1">
          <?php foreach ($plan[6] as $feat): ?>
          <li style="font-size:.78rem;color:<?php echo $plan[5] ? 'rgba(255,255,255,.8)' : 'var(--g600)'; ?>;padding:4px 0;display:flex;gap:8px">
            <span style="color:<?php echo $plan[5] ? '#c4b5fd' : '#7c3aed'; ?>;font-weight:700;flex-shrink:0">✓</span><?php echo esc_html($feat); ?>
          </li>
          <?php endforeach; ?>
        </ul>
        <a href="<?php echo esc_url(home_url('/contacto')); ?>" style="display:block;text-align:center;padding:10px;border-radius:8px;font-size:.82rem;font-weight:600;background:<?php echo $plan[5] ? 'white' : '#7c3aed'; ?>;color:<?php echo $plan[5] ? '#4c1d95' : 'white'; ?>;text-decoration:none">Cotizar este plan</a>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- Servicios complementarios -->
<section class="section">
  <div class="container">
    <h2 class="text-center" style="margin-bottom:8px">Servicios adicionales del Copilot</h2>
    <p class="text-center" style="color:var(--g500);margin-bottom:28px">Se suman al plan base elegido</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px">
      <?php
      $extras = [
        ['⚙️','Implementación','Configuración e integración del Copilot en tu stack actual.','$180.000 – $900.000'],
        ['🔧','Mantenimiento','Ajustes, re-entrenamiento y mejoras continuas del modelo.','$120.000 – $600.000'],
        ['📞','Soporte Técnico','Asistencia ante problemas y consultas sobre el Copilot.','$90.000 – $450.000'],
        ['🎓','Capacitación del equipo','Formación para que tu equipo saque el máximo provecho de la IA.','$60.000 – $300.000'],
        ['🎨','Customización','Ajustes de personalidad, tono y flujos específicos de tu negocio.','$150.000 – $750.000'],
        ['🔒','Seguridad y privacidad','Auditoría, GDPR/protección de datos y controles de acceso.','$180.000 – $690.000'],
      ];
      foreach ($extras as $e): ?>
      <div style="display:flex;gap:14px;align-items:flex-start;padding:16px;border:1px solid #ede9fe;border-radius:10px;background:white">
        <span style="font-size:1.3rem"><?php echo $e[0]; ?></span>
        <div style="flex:1">
          <strong style="font-size:.85rem"><?php echo esc_html($e[1]); ?></strong>
          <p style="font-size:.75rem;color:var(--g500);margin:4px 0 6px"><?php echo esc_html($e[2]); ?></p>
          <span style="font-size:.72rem;color:#7c3aed;font-weight:600"><?php echo esc_html($e[3]); ?></span>
        </div>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section class="cta-section" style="background:linear-gradient(135deg,#4c1d95,#7c3aed)">
  <div class="container text-center">
    <h2 style="color:white">¿Listo para automatizar tu empresa?</h2>
    <p style="color:rgba(255,255,255,.8)">Mostramos en 30 minutos cómo la IA puede transformar tu operación.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-green btn-lg">Pedir demo gratuita</a>
    </div>
  </div>
</section>

</main>
<?php get_footer(); ?>
