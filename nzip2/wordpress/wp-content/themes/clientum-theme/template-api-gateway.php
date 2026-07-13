<?php /* Template Name: API Gateway */ get_header(); ?>
<main class="site-main">

<div class="page-hero" style="background:linear-gradient(135deg,#1A3461 0%,#0f2040 100%)">
  <div class="container text-center">
    <span class="hero-eyebrow" style="background:rgba(255,255,255,.15);color:white">Integración API Gateway</span>
    <h1 style="color:white">Conectá todos tus sistemas<br><span style="color:#60a5fa">sin escribir una línea de código</span></h1>
    <p style="color:rgba(255,255,255,.8);max-width:560px;margin:0 auto 32px">Automatizá el flujo de datos entre tus herramientas, apps y plataformas externas. Integración robusta con monitoreo en tiempo real.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-primary btn-lg">Solicitar propuesta</a>
      <a href="#planes" class="btn btn-ghost btn-lg" style="color:white;border-color:rgba(255,255,255,.3)">Ver planes y precios</a>
    </div>
  </div>
</div>

<!-- Stats -->
<section style="background:#f8fafc;padding:40px 0;border-bottom:1px solid var(--g100)">
  <div class="container">
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:24px;text-align:center">
      <div><div style="font-size:2rem;font-weight:800;color:#1A3461">+200</div><div style="font-size:.82rem;color:var(--g500)">integraciones completadas</div></div>
      <div><div style="font-size:2rem;font-weight:800;color:#1A3461">99.9%</div><div style="font-size:.82rem;color:var(--g500)">uptime garantizado</div></div>
      <div><div style="font-size:2rem;font-weight:800;color:#1A3461">12 hs</div><div style="font-size:.82rem;color:var(--g500)">tiempo de respuesta mínimo</div></div>
      <div><div style="font-size:2rem;font-weight:800;color:#1A3461">0</div><div style="font-size:.82rem;color:var(--g500)">código que necesitás escribir</div></div>
    </div>
  </div>
</section>

<!-- Qué incluye -->
<section class="section">
  <div class="container">
    <div class="section-header text-center">
      <span class="hero-eyebrow">Capacidades</span>
      <h2>Todo lo que incluye cada integración</h2>
    </div>
    <div class="grid-3">
      <?php
      $caps = [
        ['🔗','Conectores listos para usar','+50 conectores preconfigurados: MercadoLibre, AFIP, WhatsApp, Google Sheets, CRMs, ERPs y más.'],
        ['⚡','Automatización de flujos','Definís las reglas y el gateway mueve los datos automáticamente, 24/7, sin intervención.'],
        ['🔄','Transformación de datos','Mapeá campos, convertí formatos y limpiá datos entre sistemas con lógica visual.'],
        ['📊','Monitoreo en tiempo real','Dashboard con logs, alertas, reintentos automáticos y trazabilidad de cada transacción.'],
        ['🔐','Seguridad y autenticación','OAuth2, JWT, API Keys, certificados SSL/TLS y control de acceso por rol.'],
        ['📋','Documentación técnica','Cada integración incluye documentación completa y soporte para el equipo técnico.'],
      ];
      foreach ($caps as $c): ?>
      <div class="service-detail-card">
        <div class="service-icon" style="background:#1A3461"><span style="font-size:1.6rem"><?php echo $c[0]; ?></span></div>
        <h3><?php echo esc_html($c[1]); ?></h3>
        <p><?php echo esc_html($c[2]); ?></p>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- Planes con precios reales -->
<section class="section section--sm" style="background:var(--g50)" id="planes">
  <div class="container">
    <div class="section-header text-center">
      <span class="hero-eyebrow">Precios de referencia</span>
      <h2>Planes Integración API Gateway</h2>
      <p>Valores orientativos en pesos argentinos. Cada proyecto se cotiza según el alcance real.</p>
    </div>
    <?php
    $plans = [
      ['Basic','$400.000 – $600.000','48 hs','Integración básica API Gateway','#e5e7eb','#374151',false,[
        'Hasta 2 sistemas conectados','API REST básica','Webhooks simples','Documentación básica','Soporte por email',
      ]],
      ['Standard','$600.000 – $900.000','36 hs','Integración estándar API Gateway','#dbeafe','#1e40af',false,[
        'Hasta 5 sistemas conectados','API REST + GraphQL','Webhooks y eventos','Transformación de datos básica','Monitoreo básico','Soporte prioritario',
      ]],
      ['Pro','$900.000 – $1.300.000','24 hs','Integración profesional API Gateway','#1A3461','white',true,[
        'Sistemas ilimitados','API REST + GraphQL + gRPC','Lógica condicional avanzada','Transformación compleja de datos','Dashboard de monitoreo','Alertas automáticas','Soporte dedicado',
      ]],
      ['Advanced','$1.300.000 – $1.700.000','18 hs','Integración avanzada API Gateway','#ede9fe','#5b21b6',false,[
        'Todo lo de Pro','Orquestación de microservicios','Caching inteligente','Rate limiting y throttling','SLA garantizado','Arquitectura de alta disponibilidad',
      ]],
      ['Enterprise','$1.700.000 – $2.200.000','12 hs','Integración empresarial completa','#0f2040','white',false,[
        'Todo lo de Advanced','Equipo dedicado','Arquitectura custom','On-premise o cloud privado','SLA 99.9% garantizado','Capacitación del equipo','Gerente de proyecto asignado',
      ]],
    ];
    ?>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-top:32px">
      <?php foreach ($plans as $plan): ?>
      <div style="background:<?php echo $plan[3] === '#1A3461' || $plan[3] === '#0f2040' ? $plan[3] : 'white'; ?>;border:2px solid <?php echo $plan[6] ? '#1A3461' : 'var(--g200)'; ?>;border-radius:16px;padding:24px;display:flex;flex-direction:column;position:relative">
        <?php if ($plan[6]): ?><div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:#1A3461;color:white;font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;padding:4px 14px;border-radius:100px">Más elegido</div><?php endif; ?>
        <div style="margin-bottom:16px">
          <span style="background:<?php echo esc_attr($plan[3]); ?>;color:<?php echo esc_attr($plan[4]); ?>;padding:3px 12px;border-radius:100px;font-size:.72rem;font-weight:700;text-transform:uppercase"><?php echo esc_html($plan[0]); ?></span>
        </div>
        <div style="font-size:1.15rem;font-weight:800;color:<?php echo ($plan[3] === '#1A3461' || $plan[3] === '#0f2040') ? 'white' : 'var(--g900)'; ?>;margin-bottom:4px"><?php echo esc_html($plan[1]); ?></div>
        <div style="font-size:.75rem;color:<?php echo ($plan[3] === '#1A3461' || $plan[3] === '#0f2040') ? 'rgba(255,255,255,.6)' : 'var(--g400)'; ?>;margin-bottom:16px">Respuesta en <?php echo esc_html($plan[2]); ?> hábiles</div>
        <p style="font-size:.78rem;color:<?php echo ($plan[3] === '#1A3461' || $plan[3] === '#0f2040') ? 'rgba(255,255,255,.7)' : 'var(--g500)'; ?>;margin-bottom:16px"><?php echo esc_html($plan[5]); ?></p>
        <ul style="list-style:none;padding:0;margin:0 0 20px;flex:1">
          <?php foreach ($plan[7] as $feat): ?>
          <li style="font-size:.78rem;color:<?php echo ($plan[3] === '#1A3461' || $plan[3] === '#0f2040') ? 'rgba(255,255,255,.8)' : 'var(--g600)'; ?>;padding:4px 0;display:flex;gap:8px;align-items:flex-start">
            <span style="color:<?php echo ($plan[3] === '#1A3461' || $plan[3] === '#0f2040') ? '#60a5fa' : '#1A3461'; ?>;font-weight:700;flex-shrink:0">✓</span>
            <?php echo esc_html($feat); ?>
          </li>
          <?php endforeach; ?>
        </ul>
        <a href="<?php echo esc_url(home_url('/contacto')); ?>" style="display:block;text-align:center;padding:10px;border-radius:8px;font-size:.82rem;font-weight:600;background:<?php echo ($plan[3] === '#1A3461' || $plan[3] === '#0f2040') ? 'white' : '#1A3461'; ?>;color:<?php echo ($plan[3] === '#1A3461' || $plan[3] === '#0f2040') ? '#1A3461' : 'white'; ?>;text-decoration:none">Cotizar este plan</a>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- Servicios complementarios -->
<section class="section">
  <div class="container">
    <h2 class="text-center" style="margin-bottom:8px">Servicios complementarios</h2>
    <p class="text-center" style="color:var(--g500);margin-bottom:32px">Cada componente se cotiza según el plan elegido como base</p>
    <?php
    $subcats = [
      ['⚙️','Implementación','Instalación, configuración y puesta en marcha completa del gateway en tu infraestructura.','$120.000 – $660.000'],
      ['🔧','Mantenimiento','Actualizaciones, ajustes y mejoras continuas del gateway en producción.','$80.000 – $440.000'],
      ['📞','Soporte Técnico','Asistencia técnica ante incidentes, consultas y resolución de problemas.','$60.000 – $330.000'],
      ['🎓','Capacitación','Formación del equipo técnico para operar y administrar el gateway.','$40.000 – $220.000'],
      ['🎨','Customización','Adaptaciones específicas del gateway a los requerimientos de tu negocio.','$100.000 – $550.000'],
      ['💼','Consultoría','Análisis de arquitectura, diseño de solución y recomendaciones técnicas.','$100.000 – $550.000'],
      ['📦','Migración de Datos','Migración segura de datos entre sistemas con validación y rollback plan.','$140.000 – $770.000'],
      ['🔒','Seguridad','Auditoría, hardening y configuración de controles de seguridad avanzados.','$120.000 – $660.000'],
      ['📡','Monitoreo','Configuración de dashboards, alertas y métricas de performance en tiempo real.','$80.000 – $440.000'],
    ];
    ?>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px">
      <?php foreach ($subcats as $s): ?>
      <div style="display:flex;gap:14px;align-items:flex-start;padding:16px;border:1px solid var(--g200);border-radius:10px;background:white">
        <span style="font-size:1.3rem"><?php echo $s[0]; ?></span>
        <div style="flex:1">
          <strong style="font-size:.85rem"><?php echo esc_html($s[1]); ?></strong>
          <p style="font-size:.75rem;color:var(--g500);margin:4px 0 6px"><?php echo esc_html($s[2]); ?></p>
          <span style="font-size:.72rem;color:#1A3461;font-weight:600"><?php echo esc_html($s[3]); ?></span>
        </div>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section class="cta-section">
  <div class="container text-center">
    <h2>¿Qué sistemas necesitás conectar?</h2>
    <p>Contanos los sistemas y te armamos una propuesta en 48 horas.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-green btn-lg">Consultar sin costo</a>
    </div>
  </div>
</section>

</main>
<?php get_footer(); ?>
