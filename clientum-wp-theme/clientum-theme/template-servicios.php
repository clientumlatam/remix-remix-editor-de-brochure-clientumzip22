<?php /* Template Name: Servicios */ get_header(); ?>
<main class="site-main">

<div class="page-hero">
  <div class="container text-center">
    <span class="hero-eyebrow">Servicios</span>
    <h1>Acompañamiento integral<br>para tu PyME</h1>
    <p>Consultoría, implementación, IA, BI y desarrollo web — todo integrado con Clientum CRM.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-primary btn-lg">Consultar disponibilidad</a>
    </div>
  </div>
</div>

<!-- Service cards -->
<?php
$services = [
  ['🔌','Integración API Gateway','var(--navy)','Conectá sistemas, apps y plataformas externas sin código. Automatizá el flujo de datos entre tus herramientas.',
    ['Integración entre múltiples sistemas','API REST y webhooks','Mapeo y transformación de datos','Monitoreo en tiempo real']],
  ['🤖','Viaweb AI Copilot','var(--purple)','IA y automatización aplicada a tu negocio. Predicciones, flujos automáticos y análisis inteligente.',
    ['Automatización de procesos repetitivos','Predicciones y recomendaciones','IA conversacional a medida','Integración con el CRM']],
  ['💻','Desarrollo Web Personalizado','var(--cyan)','Sitios, landing pages y apps a medida que capturan leads y los envían directo al CRM.',
    ['Landing pages con integración CRM','E-commerce con sincronización de stock','Apps web progresivas (PWA)','Diseño y UX incluidos']],
  ['📦','Pack Integrado','var(--green)','CRM + API + IA + Web en una sola propuesta. La solución más completa para empresas que quieren escalar.',
    ['Todo incluido en un precio','Implementación coordinada','Un solo punto de contacto','Soporte unificado']],
  ['📊','Business Intelligence','var(--orange)','Dashboards y analytics para tomar decisiones con datos reales. Conectamos tus fuentes y construimos el tablero.',
    ['Dashboards en tiempo real','KPIs y métricas de negocio','Predicciones y tendencias','Reportes automáticos']],
  ['⚙️','Consultoría Empresarial','var(--navy)','Diagnóstico de procesos y plan de mejora con KPIs medibles para tu empresa.',
    ['Diagnóstico sin costo inicial','Plan de acción 90 días','Seguimiento de resultados','Gestión del cambio']],
];
?>
<section class="section">
  <div class="container">
    <div class="grid-3">
      <?php foreach ($services as $s): ?>
      <div class="service-detail-card">
        <div class="service-icon" style="background:<?php echo $s[2]; ?>">
          <span style="font-size:1.6rem"><?php echo $s[0]; ?></span>
        </div>
        <h3><?php echo esc_html($s[1]); ?></h3>
        <p><?php echo esc_html($s[3]); ?></p>
        <ul class="feature-list">
          <?php foreach ($s[4] as $f): ?>
          <li><?php echo esc_html($f); ?></li>
          <?php endforeach; ?>
        </ul>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- Pricing catalog -->
<section class="section section--sm" style="background:var(--g50)">
  <div class="container">
    <h2 class="text-center" style="margin-bottom:12px">Catálogo de precios de referencia</h2>
    <p class="text-center text-sm" style="color:var(--g500);margin-bottom:36px">Valores orientativos en pesos argentinos. Cada proyecto se cotiza a medida.</p>

    <?php
    $catalog = [
      ['🔌','Integración API Gateway','Conectá sistemas y apps sin código',[
        ['Basic','$400.000 – $800.000','48 hs','Integración básica entre 2 sistemas'],
        ['Pro','$800.000 – $1.400.000','24 hs','Integración múltiples sistemas'],
        ['Enterprise','$1.400.000 – $2.000.000','12 hs','Integración empresarial completa'],
      ]],
      ['🤖','Viaweb AI Copilot','IA y automatización para tu negocio',[
        ['Basic','$600.000 – $1.000.000','48 hs','IA básica y automatización'],
        ['Advanced','$1.000.000 – $1.800.000','24 hs','IA avanzada y predicciones'],
        ['Enterprise','$1.800.000 – $2.500.000','12 hs','IA empresarial completa'],
      ]],
      ['💻','Desarrollo Web','Sitios y apps a medida con CRM',[
        ['Basic','$800.000 – $1.500.000','48 hs','Desarrollo web básico'],
        ['Advanced','$1.500.000 – $2.500.000','24 hs','Desarrollo web avanzado'],
        ['Enterprise','$2.500.000 – $4.000.000','12 hs','Desarrollo web empresarial'],
      ]],
      ['📦','Pack Integrado','Solución completa CRM+API+IA+Web',[
        ['Starter','$960.000 – $1.250.000','48 hs','Pack básico integrado'],
        ['Business','$1.750.000 – $2.000.000','24 hs','Pack empresarial completo'],
        ['Enterprise','$2.450.000 – $3.000.000','12 hs','Pack corporativo total'],
      ]],
      ['📊','Business Intelligence','Dashboards y analytics con datos reales',[
        ['Basic','$800.000 – $1.500.000','48 hs','Análisis de datos básico'],
        ['Advanced','$1.500.000 – $2.500.000','24 hs','BI y predicciones avanzadas'],
        ['Enterprise','$2.500.000 – $4.000.000','12 hs','BI empresarial completo'],
      ]],
    ];
    foreach ($catalog as $cat):
    ?>
    <div style="background:white;border:1px solid var(--g200);border-radius:12px;overflow:hidden;margin-bottom:16px">
      <div style="padding:14px 20px;background:var(--g50);border-bottom:1px solid var(--g200);display:flex;align-items:center;gap:10px">
        <span style="font-size:1.2rem"><?php echo $cat[0]; ?></span>
        <strong style="font-size:.9rem"><?php echo esc_html($cat[1]); ?></strong>
        <span style="margin-left:auto;font-size:.78rem;color:var(--g500)"><?php echo esc_html($cat[2]); ?></span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr)">
        <?php foreach ($cat[3] as $i => $tier): ?>
        <div style="padding:16px 20px;<?php echo $i < 2 ? 'border-right:1px solid var(--g100);' : ''; ?>">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <strong style="font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;color:var(--navy)"><?php echo esc_html($tier[0]); ?></strong>
            <span style="font-size:.68rem;background:var(--g50);border-radius:100px;padding:2px 8px;color:var(--g500)"><?php echo esc_html($tier[2]); ?></span>
          </div>
          <div style="font-size:.9rem;font-weight:800;color:var(--g900)"><?php echo esc_html($tier[1]); ?></div>
          <p style="font-size:.72rem;color:var(--g500);margin:4px 0 0"><?php echo esc_html($tier[3]); ?></p>
        </div>
        <?php endforeach; ?>
      </div>
    </div>
    <?php endforeach; ?>

    <p class="text-center text-sm" style="color:var(--g500);margin-top:20px">
      Precios en ARS · Cada proyecto se cotiza según alcance real ·
      <a href="<?php echo esc_url(home_url('/contacto')); ?>" style="color:var(--navy);font-weight:600">Solicitá propuesta sin costo</a>
    </p>
  </div>
</section>

<!-- Industries -->
<section class="section">
  <div class="container">
    <h2 class="text-center" style="margin-bottom:36px">Sectores que atendemos</h2>
    <div class="grid-3">
      <?php
      $industries = [
        ['🛒','Minoristas','Gestión de stock multicanal, ventas por WhatsApp y facturación integrada.'],
        ['🏭','Manufactura','Control de producción, trazabilidad de materiales y presupuestos conectados al ERP.'],
        ['🌾','Agroindustria','Trazabilidad de lote desde el campo hasta la entrega, costos por campaña.'],
        ['🚚','Distribuidores','Ruteo de entregas, inventario en tiempo real y cobranzas automáticas.'],
        ['💼','Servicios','CRM para seguimiento de clientes y automatización del flujo de atención.'],
        ['🔐','Tecnología','Gestión de proyectos, incidentes y clientes para consultoras IT.'],
      ];
      foreach ($industries as $ind):
      ?>
      <div style="padding:24px;border:1px solid var(--g200);border-radius:12px">
        <div style="font-size:1.8rem;margin-bottom:12px"><?php echo $ind[0]; ?></div>
        <h3 style="font-size:1rem;margin-bottom:8px"><?php echo esc_html($ind[1]); ?></h3>
        <p style="font-size:.82rem;color:var(--g500)"><?php echo esc_html($ind[2]); ?></p>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section class="cta-section">
  <div class="container text-center">
    <h2>¿No sabés por dónde empezar?</h2>
    <p>30 minutos sin costo y te decimos exactamente qué necesita tu empresa.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-green btn-lg">Agendar asesoría gratuita</a>
    </div>
  </div>
</section>

</main>
<?php get_footer(); ?>
