<?php /* Template Name: Desarrollo Web Personalizado */ get_header(); ?>
<main class="site-main">

<div class="page-hero" style="background:linear-gradient(135deg,#0e7490 0%,#1A3461 100%)">
  <div class="container text-center">
    <span class="hero-eyebrow" style="background:rgba(255,255,255,.15);color:white">Desarrollo Web Personalizado</span>
    <h1 style="color:white">Tu sitio, tu app, tu tienda —<br><span style="color:#67e8f9">conectado directo al CRM</span></h1>
    <p style="color:rgba(255,255,255,.8);max-width:560px;margin:0 auto 32px">Diseño + desarrollo + integración en una sola propuesta. Cada lead que llega al sitio va automáticamente al pipeline de tu CRM.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-primary btn-lg">Ver portfolio y cotizar</a>
      <a href="#planes" class="btn btn-ghost btn-lg" style="color:white;border-color:rgba(255,255,255,.3)">Ver precios</a>
    </div>
  </div>
</div>

<!-- Tipos de proyecto -->
<section class="section">
  <div class="container">
    <div class="section-header text-center">
      <span class="hero-eyebrow">Qué construimos</span>
      <h2>Proyectos web que generan negocios</h2>
    </div>
    <div class="grid-3">
      <?php
      $types = [
        ['🏢','Sitios institucionales','Presencia profesional con integración de formularios directo al CRM. SEO técnico desde el inicio.'],
        ['🛒','Tiendas e-commerce','WooCommerce o custom: stock sincronizado con ERP, pagos y facturación AFIP integrados.'],
        ['📱','Landing pages','Páginas de conversión diseñadas para capturar leads y enviarlos al CRM automáticamente.'],
        ['⚡','Apps web progresivas','PWA con offline mode, notificaciones push y rendimiento nativo para cualquier dispositivo.'],
        ['🔧','Desarrollo a medida','Módulos, paneles, portales y sistemas internos construidos sobre tus procesos reales.'],
        ['🎨','Rediseño y migración','Modernizamos tu sitio actual con mejoras de UX, velocidad y SEO sin perder el contenido.'],
      ];
      foreach ($types as $t): ?>
      <div class="service-detail-card">
        <div class="service-icon" style="background:#0e7490"><span style="font-size:1.6rem"><?php echo $t[0]; ?></span></div>
        <h3><?php echo esc_html($t[1]); ?></h3>
        <p><?php echo esc_html($t[2]); ?></p>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- Planes -->
<section class="section section--sm" style="background:var(--g50)" id="planes">
  <div class="container">
    <div class="section-header text-center">
      <span class="hero-eyebrow">Precios de referencia</span>
      <h2>Planes Desarrollo Web Personalizado</h2>
      <p>Valores orientativos en pesos argentinos. Cada proyecto se cotiza según el alcance, diseño y funcionalidades.</p>
    </div>
    <?php
    $plans = [
      ['Basic',    '$800.000 – $1.500.000',  '48 hs','Desarrollo web básico','Ideal para PyMEs que necesitan presencia profesional rápida.',false,[
        'Sitio institucional hasta 8 páginas','Diseño UX/UI incluido','Formulario de contacto → CRM','Optimización SEO básica','Certificado SSL','Soporte 30 días post-lanzamiento',
      ]],
      ['Standard', '$1.500.000 – $2.000.000','36 hs','Desarrollo web estándar','Para empresas que quieren capturar y convertir leads.',false,[
        'Hasta 20 páginas + blog','Integración CRM completa','E-commerce básico (hasta 100 productos)','SEO técnico avanzado','Analytics y tracking','Panel de administración',
      ]],
      ['Pro',      '$2.000.000 – $3.000.000','24 hs','Desarrollo web profesional','La solución completa para empresas que venden online.',true,[
        'Páginas ilimitadas','E-commerce completo','Integración ERP + CRM + stock','Pasarelas de pago múltiples','Facturación AFIP integrada','Soporte 6 meses','Performance optimizada',
      ]],
      ['Advanced', '$3.000.000 – $4.000.000','18 hs','Desarrollo web avanzado','Módulos a medida y arquitectura escalable.',false,[
        'Todo lo de Pro','Módulos personalizados','PWA o app móvil básica','Integraciones complejas','Tests automatizados','CDN y caché avanzado',
      ]],
      ['Enterprise','$4.000.000 – $5.000.000','12 hs','Desarrollo web empresarial','Plataforma digital completa con equipo dedicado.',false,[
        'Todo lo de Advanced','Arquitectura escalable','Equipo full-stack dedicado','SLA de mantenimiento','Capacitación del equipo','Gerente de proyecto asignado',
      ]],
    ];
    ?>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-top:32px">
      <?php foreach ($plans as $plan): ?>
      <div style="background:<?php echo $plan[5] ? '#0e7490' : 'white'; ?>;border:2px solid <?php echo $plan[5] ? '#0e7490' : 'var(--g200)'; ?>;border-radius:16px;padding:24px;display:flex;flex-direction:column;position:relative">
        <?php if ($plan[5]): ?><div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:#0e7490;color:white;font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;padding:4px 14px;border-radius:100px">Más vendido</div><?php endif; ?>
        <div style="font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:<?php echo $plan[5] ? '#67e8f9' : '#0e7490'; ?>;margin-bottom:8px"><?php echo esc_html($plan[0]); ?></div>
        <div style="font-size:1.1rem;font-weight:800;color:<?php echo $plan[5] ? 'white' : 'var(--g900)'; ?>;margin-bottom:4px"><?php echo esc_html($plan[1]); ?></div>
        <div style="font-size:.72rem;color:<?php echo $plan[5] ? 'rgba(255,255,255,.5)' : 'var(--g400)'; ?>;margin-bottom:12px">Entrega en <?php echo esc_html($plan[2]); ?> hábiles</div>
        <p style="font-size:.78rem;color:<?php echo $plan[5] ? 'rgba(255,255,255,.7)' : 'var(--g500)'; ?>;margin-bottom:16px"><?php echo esc_html($plan[4]); ?></p>
        <ul style="list-style:none;padding:0;margin:0 0 20px;flex:1">
          <?php foreach ($plan[6] as $feat): ?>
          <li style="font-size:.78rem;color:<?php echo $plan[5] ? 'rgba(255,255,255,.8)' : 'var(--g600)'; ?>;padding:4px 0;display:flex;gap:8px">
            <span style="color:<?php echo $plan[5] ? '#67e8f9' : '#0e7490'; ?>;font-weight:700;flex-shrink:0">✓</span><?php echo esc_html($feat); ?>
          </li>
          <?php endforeach; ?>
        </ul>
        <a href="<?php echo esc_url(home_url('/contacto')); ?>" style="display:block;text-align:center;padding:10px;border-radius:8px;font-size:.82rem;font-weight:600;background:<?php echo $plan[5] ? 'white' : '#0e7490'; ?>;color:<?php echo $plan[5] ? '#0e7490' : 'white'; ?>;text-decoration:none">Cotizar este plan</a>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- Stack tecnológico -->
<section class="section">
  <div class="container">
    <h2 class="text-center" style="margin-bottom:8px">Tecnologías que usamos</h2>
    <p class="text-center" style="color:var(--g500);margin-bottom:28px">Elegimos la herramienta correcta para cada proyecto</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px">
      <?php
      $stack = [
        ['WordPress','CMS y e-commerce','#21759b'],
        ['WooCommerce','Tiendas online','#7f54b3'],
        ['React / Next.js','Apps web modernas','#61dafb'],
        ['Laravel / PHP','Backends robustos','#ff2d20'],
        ['PostgreSQL','Base de datos','#336791'],
        ['Node.js','APIs y servicios','#68a063'],
        ['Tailwind CSS','Diseño rápido','#38bdf8'],
        ['Vercel / AWS','Hosting escalable','#000'],
      ];
      foreach ($stack as $s): ?>
      <div style="text-align:center;padding:16px;border:1px solid var(--g200);border-radius:10px;background:white">
        <div style="width:8px;height:8px;border-radius:50%;background:<?php echo esc_attr($s[2]); ?>;margin:0 auto 8px"></div>
        <strong style="font-size:.82rem;display:block"><?php echo esc_html($s[0]); ?></strong>
        <span style="font-size:.72rem;color:var(--g400)"><?php echo esc_html($s[1]); ?></span>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- Servicios complementarios -->
<section class="section section--sm" style="background:var(--g50)">
  <div class="container">
    <h2 class="text-center" style="margin-bottom:8px">Servicios adicionales</h2>
    <p class="text-center" style="color:var(--g500);margin-bottom:24px">Se agregan al plan elegido según necesidad</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px">
      <?php
      $extras = [
        ['⚙️','Implementación','Instalación, configuración y despliegue en producción.','$240.000 – $1.500.000'],
        ['🔧','Mantenimiento','Actualizaciones, backups y mejoras continuas del sitio.','$160.000 – $1.000.000'],
        ['📞','Soporte Técnico','Asistencia ante problemas y modificaciones urgentes.','$120.000 – $750.000'],
        ['🎨','Customización','Nuevas funcionalidades, módulos y cambios de diseño.','$200.000 – $1.250.000'],
        ['🔒','Seguridad Web','Hardening, WAF, análisis de vulnerabilidades y SSL.','$240.000 – $1.500.000'],
        ['📡','Monitoreo y performance','Uptime monitoring, Core Web Vitals y optimización continua.','$160.000 – $1.000.000'],
      ];
      foreach ($extras as $e): ?>
      <div style="display:flex;gap:14px;align-items:flex-start;padding:16px;border:1px solid var(--g200);border-radius:10px;background:white">
        <span style="font-size:1.3rem"><?php echo $e[0]; ?></span>
        <div style="flex:1">
          <strong style="font-size:.85rem"><?php echo esc_html($e[1]); ?></strong>
          <p style="font-size:.75rem;color:var(--g500);margin:4px 0 6px"><?php echo esc_html($e[2]); ?></p>
          <span style="font-size:.72rem;color:#0e7490;font-weight:600"><?php echo esc_html($e[3]); ?></span>
        </div>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section class="cta-section" style="background:linear-gradient(135deg,#0e7490,#1A3461)">
  <div class="container text-center">
    <h2 style="color:white">¿Tenés un proyecto web en mente?</h2>
    <p style="color:rgba(255,255,255,.8)">Contanos qué necesitás y en 48 horas te mandamos una propuesta con presupuesto.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-green btn-lg">Pedir propuesta sin costo</a>
    </div>
  </div>
</section>

</main>
<?php get_footer(); ?>
