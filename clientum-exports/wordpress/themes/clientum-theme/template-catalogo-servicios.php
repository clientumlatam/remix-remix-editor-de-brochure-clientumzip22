<?php /* Template Name: Catálogo de Servicios */ get_header(); ?>
<main class="site-main">

<div class="page-hero">
  <div class="container text-center">
    <span class="hero-eyebrow">Catálogo completo</span>
    <h1>Servicios y precios de referencia</h1>
    <p>Integraciones, IA, desarrollo web y todo lo que tu empresa necesita para escalar — cotizado a medida.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-primary btn-lg">Solicitar propuesta sin costo</a>
      <a href="#catalogo" class="btn btn-ghost btn-lg">Ver catálogo completo</a>
    </div>
  </div>
</div>

<!-- Filtro de categoría -->
<section class="section section--sm" style="background:var(--g50);padding-top:24px;padding-bottom:24px" id="catalogo">
  <div class="container">
    <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">
      <button class="cat-filter active" data-cat="all">Todos los servicios</button>
      <button class="cat-filter" data-cat="api">🔌 Integración API</button>
      <button class="cat-filter" data-cat="ai">🤖 AI Copilot</button>
      <button class="cat-filter" data-cat="web">💻 Desarrollo Web</button>
    </div>
  </div>
</section>

<?php
$categories = [
  'api' => [
    'icon'  => '🔌',
    'name'  => 'Integración API Gateway',
    'color' => '#1A3461',
    'slug'  => 'integracion-api-gateway',
    'desc'  => 'Conectá sistemas, apps y plataformas externas sin código. Automatizá el flujo de datos entre tus herramientas con integraciones robustas.',
    'plans' => [
      ['Basic',    '$400.000 – $600.000',   '$120.000 – $180.000', '$80.000 – $120.000',  '$60.000 – $90.000',   '48 hs', 'Integración básica API Gateway entre 2 sistemas'],
      ['Standard', '$600.000 – $900.000',   '$180.000 – $270.000', '$120.000 – $180.000', '$90.000 – $135.000',  '36 hs', 'Integración estándar con múltiples endpoints'],
      ['Pro',      '$900.000 – $1.300.000', '$270.000 – $390.000', '$180.000 – $260.000', '$135.000 – $195.000', '24 hs', 'Integración profesional para múltiples sistemas'],
      ['Advanced', '$1.300.000 – $1.700.000','$390.000 – $510.000','$260.000 – $340.000','$195.000 – $255.000', '18 hs', 'Integración avanzada con lógica compleja'],
      ['Enterprise','$1.700.000 – $2.200.000','$510.000 – $660.000','$340.000 – $440.000','$255.000 – $330.000','12 hs', 'Integración empresarial completa y personalizada'],
    ],
    'subcats' => ['Implementación','Mantenimiento','Soporte','Capacitación','Customización','Consultoría','Migración de Datos','Seguridad','Monitoreo'],
    'features' => ['API REST y webhooks','Mapeo y transformación de datos','Monitoreo en tiempo real','Autenticación OAuth2/JWT','Documentación técnica incluida','Retry y gestión de errores'],
  ],
  'ai' => [
    'icon'  => '🤖',
    'name'  => 'Viaweb AI Copilot',
    'color' => '#7c3aed',
    'slug'  => 'ai-copilot',
    'desc'  => 'IA y automatización aplicada a tu negocio. Predicciones, flujos automáticos, análisis inteligente y asistentes conversacionales a medida.',
    'plans' => [
      ['Basic',    '$600.000 – $900.000',   '$180.000 – $270.000', '$120.000 – $180.000', '$90.000 – $135.000',  '48 hs', 'IA básica y automatización de procesos simples'],
      ['Standard', '$900.000 – $1.300.000', '$270.000 – $390.000', '$180.000 – $260.000', '$135.000 – $195.000', '36 hs', 'IA estándar y predicciones básicas'],
      ['Pro',      '$1.300.000 – $1.800.000','$390.000 – $540.000','$260.000 – $360.000','$195.000 – $270.000', '24 hs', 'IA profesional y predicciones avanzadas'],
      ['Advanced', '$1.800.000 – $2.300.000','$540.000 – $690.000','$360.000 – $460.000','$270.000 – $345.000', '18 hs', 'IA avanzada y automatización completa'],
      ['Enterprise','$2.300.000 – $3.000.000','$690.000 – $900.000','$460.000 – $600.000','$345.000 – $450.000','12 hs', 'IA empresarial con soluciones personalizadas'],
    ],
    'subcats' => ['Implementación','Mantenimiento','Soporte','Capacitación','Customización','Consultoría','Migración de Datos','Seguridad','Monitoreo'],
    'features' => ['Modelos de lenguaje (LLM) integrados','Automatización de flujos de trabajo','Predicciones y recomendaciones','Chatbots conversacionales','Análisis de sentimiento','Integración nativa con CRM'],
  ],
  'web' => [
    'icon'  => '💻',
    'name'  => 'Desarrollo Web Personalizado',
    'color' => '#0e7490',
    'slug'  => 'desarrollo-web-personalizado',
    'desc'  => 'Sitios, landing pages y apps a medida que capturan leads y los envían directo al CRM. Diseño + desarrollo + integración en una sola propuesta.',
    'plans' => [
      ['Basic',    '$800.000 – $1.500.000', '$240.000 – $450.000', '$160.000 – $300.000', '$120.000 – $225.000', '48 hs', 'Desarrollo web básico: sitio institucional o landing page'],
      ['Standard', '$1.500.000 – $2.000.000','$450.000 – $600.000','$300.000 – $400.000','$225.000 – $300.000', '36 hs', 'Desarrollo web estándar con integraciones básicas'],
      ['Pro',      '$2.000.000 – $3.000.000','$600.000 – $900.000','$400.000 – $600.000','$300.000 – $450.000', '24 hs', 'Desarrollo web profesional: e-commerce o app compleja'],
      ['Advanced', '$3.000.000 – $4.000.000','$900.000 – $1.200.000','$600.000 – $800.000','$450.000 – $600.000','18 hs', 'Desarrollo web avanzado con módulos a medida'],
      ['Enterprise','$4.000.000 – $5.000.000','$1.200.000 – $1.500.000','$800.000 – $1.000.000','$600.000 – $750.000','12 hs','Desarrollo web empresarial con equipo dedicado'],
    ],
    'subcats' => ['Implementación','Mantenimiento','Soporte','Capacitación','Customización','Consultoría','Migración de Datos','Seguridad','Monitoreo'],
    'features' => ['Diseño UX/UI incluido','Integración directa con CRM','SEO técnico desde el inicio','E-commerce y tiendas online','Apps web progresivas (PWA)','Hosting y dominios gestionados'],
  ],
];
?>

<?php foreach ($categories as $key => $cat): ?>
<section class="section catalog-section" data-cat="<?php echo esc_attr($key); ?>">
  <div class="container">

    <!-- Header de categoría -->
    <div style="display:flex;align-items:flex-start;gap:20px;margin-bottom:36px;padding-bottom:24px;border-bottom:2px solid var(--g100)">
      <div style="width:56px;height:56px;border-radius:14px;background:<?php echo esc_attr($cat['color']); ?>;display:flex;align-items:center;justify-content:center;font-size:1.6rem;flex-shrink:0">
        <?php echo $cat['icon']; ?>
      </div>
      <div>
        <h2 style="margin:0 0 8px"><?php echo esc_html($cat['name']); ?></h2>
        <p style="color:var(--g500);margin:0;max-width:620px"><?php echo esc_html($cat['desc']); ?></p>
      </div>
      <a href="<?php echo esc_url(home_url('/' . $cat['slug'])); ?>" class="btn btn-outline" style="margin-left:auto;flex-shrink:0;white-space:nowrap">Ver detalle →</a>
    </div>

    <!-- Features incluidas -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-bottom:32px">
      <?php foreach ($cat['features'] as $feat): ?>
      <div style="display:flex;align-items:center;gap:8px;font-size:.82rem;color:var(--g700)">
        <span style="color:<?php echo esc_attr($cat['color']); ?>;font-weight:700">✓</span>
        <?php echo esc_html($feat); ?>
      </div>
      <?php endforeach; ?>
    </div>

    <!-- Tabla de planes principales -->
    <h3 style="font-size:.78rem;text-transform:uppercase;letter-spacing:.08em;color:var(--g400);margin-bottom:12px">Planes del servicio principal</h3>
    <div style="overflow-x:auto;margin-bottom:24px">
      <table class="price-table">
        <thead>
          <tr>
            <th>Plan</th>
            <th>Servicio principal</th>
            <th>Implementación</th>
            <th>Mantenimiento</th>
            <th>Soporte</th>
            <th>Tiempo resp.</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($cat['plans'] as $i => $plan): ?>
          <tr <?php echo $plan[0] === 'Pro' ? 'class="row-highlighted"' : ''; ?>>
            <td>
              <span class="plan-badge plan-<?php echo strtolower($plan[0]); ?>"><?php echo esc_html($plan[0]); ?></span>
            </td>
            <td><strong><?php echo esc_html($plan[1]); ?></strong></td>
            <td><?php echo esc_html($plan[2]); ?></td>
            <td><?php echo esc_html($plan[3]); ?></td>
            <td><?php echo esc_html($plan[4]); ?></td>
            <td><span style="background:var(--g100);border-radius:100px;padding:2px 10px;font-size:.72rem;color:var(--g600)"><?php echo esc_html($plan[5]); ?></span></td>
            <td><a href="<?php echo esc_url(home_url('/contacto')); ?>" style="color:<?php echo esc_attr($cat['color']); ?>;font-weight:600;font-size:.78rem;white-space:nowrap">Cotizar →</a></td>
          </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>

    <!-- Subcategorías disponibles -->
    <div style="background:var(--g50);border-radius:12px;padding:20px 24px">
      <p style="font-size:.75rem;text-transform:uppercase;letter-spacing:.07em;color:var(--g400);margin-bottom:12px">Componentes adicionales disponibles</p>
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        <?php foreach ($cat['subcats'] as $sub): ?>
        <span style="background:white;border:1px solid var(--g200);border-radius:100px;padding:4px 14px;font-size:.78rem;color:var(--g600)"><?php echo esc_html($sub); ?></span>
        <?php endforeach; ?>
      </div>
      <p style="font-size:.72rem;color:var(--g400);margin-top:12px;margin-bottom:0">Cada componente se cotiza según el plan elegido. Consultá precios exactos.</p>
    </div>

  </div>
</section>
<?php endforeach; ?>

<!-- Nota de precios -->
<section class="section section--sm" style="background:var(--g50)">
  <div class="container">
    <div style="max-width:700px;margin:0 auto;text-align:center">
      <p style="font-size:.85rem;color:var(--g500)">
        <strong style="color:var(--g700)">💡 Precios de referencia en pesos argentinos.</strong>
        Los valores se actualizan periódicamente. Cada proyecto se cotiza a medida según el alcance real, integraciones requeridas y complejidad técnica.
      </p>
      <div class="hero-actions" style="margin-top:20px">
        <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-primary">Solicitar propuesta personalizada</a>
        <a href="<?php echo esc_url(home_url('/precios')); ?>" class="btn btn-ghost">Ver planes del CRM</a>
      </div>
    </div>
  </div>
</section>

<section class="cta-section">
  <div class="container text-center">
    <h2>¿Necesitás un pack integrado?</h2>
    <p>CRM + Integración API + IA + Web en una sola propuesta coordinada. Hablemos 30 minutos sin costo.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-green btn-lg">Agendar asesoría gratuita</a>
    </div>
  </div>
</section>

</main>

<style>
.cat-filter {
  padding:8px 18px;border-radius:100px;border:1px solid var(--g200);background:white;font-size:.82rem;font-weight:500;cursor:pointer;transition:.2s;color:var(--g600);
}
.cat-filter.active,.cat-filter:hover { background:var(--navy);color:white;border-color:var(--navy); }
.price-table { width:100%;border-collapse:collapse;font-size:.82rem; }
.price-table th { padding:10px 14px;text-align:left;font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;color:var(--g400);border-bottom:1px solid var(--g200);white-space:nowrap; }
.price-table td { padding:12px 14px;border-bottom:1px solid var(--g100);vertical-align:middle; }
.price-table tr:last-child td { border-bottom:0; }
.price-table tr.row-highlighted { background:#f0f5ff; }
.plan-badge { padding:3px 10px;border-radius:100px;font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em; }
.plan-basic    { background:#e5e7eb;color:#374151; }
.plan-standard { background:#dbeafe;color:#1e40af; }
.plan-pro      { background:#1A3461;color:white; }
.plan-advanced { background:#ede9fe;color:#5b21b6; }
.plan-enterprise{ background:#0e7490;color:white; }
.catalog-section { padding-top:48px;padding-bottom:48px; }
.catalog-section + .catalog-section { border-top:1px solid var(--g100); }
</style>
<script>
document.querySelectorAll('.cat-filter').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.cat-filter').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    const cat = this.dataset.cat;
    document.querySelectorAll('.catalog-section').forEach(s => {
      s.style.display = (cat === 'all' || s.dataset.cat === cat) ? '' : 'none';
    });
  });
});
</script>
<?php get_footer(); ?>
