<?php /* Template Name: Academia y Cursos */ get_header(); ?>
<main class="site-main">

<div class="page-hero">
  <div class="container text-center">
    <span class="hero-eyebrow">Academia Clientum</span>
    <h1>Capacitá a tu equipo.<br>Hacé crecer tu empresa.</h1>
    <p>30 cursos organizados en 11 áreas para PyMEs argentinas. Desde automatización con IA hasta gestión de proyectos y ventas.</p>
    <div class="hero-actions">
      <a href="#cursos" class="btn btn-primary btn-lg">Ver los 30 cursos</a>
      <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-ghost btn-lg">Capacitación in-company</a>
    </div>
  </div>
</div>

<!-- Stats -->
<section style="background:#f8fafc;padding:36px 0;border-bottom:1px solid var(--g100)">
  <div class="container">
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:24px;text-align:center">
      <div><div style="font-size:2rem;font-weight:800;color:#1A3461">30</div><div style="font-size:.82rem;color:var(--g500)">cursos canónicos</div></div>
      <div><div style="font-size:2rem;font-weight:800;color:#1A3461">11</div><div style="font-size:.82rem;color:var(--g500)">áreas temáticas</div></div>
      <div><div style="font-size:2rem;font-weight:800;color:#1A3461">100%</div><div style="font-size:.82rem;color:var(--g500)">para PyMEs argentinas</div></div>
      <div><div style="font-size:2rem;font-weight:800;color:#1A3461">🏆</div><div style="font-size:.82rem;color:var(--g500)">certificado incluido</div></div>
    </div>
  </div>
</section>

<?php
/* ── 30 cursos canónicos con categorías reales ─────────────── */
$academia = [
  [
    'cat'   => 'Marketing Digital',
    'slug'  => 'marketing-digital',
    'color' => '#0891b2',
    'icon'  => '📣',
    'cursos'=> [
      ['Dominio de las métricas de marketing digital','Descubrí los secretos para analizar y optimizar tu rendimiento de marketing: KPIs, tasas de conversión, CLV y campañas que realmente convierten.','Intermedio','24 hs','Online','$55.000'],
      ['SEO Avanzado','Posicioná tu web en el TOP de búsqueda y recibí tráfico orgánico sin pagar publicidad. Técnicas on-page, link building y auditoría SEO.','Avanzado','16 hs','Online','$48.000'],
    ],
  ],
  [
    'cat'   => 'E-commerce',
    'slug'  => 'e-commerce',
    'color' => '#7c3aed',
    'icon'  => '🛒',
    'cursos'=> [
      ['Crea tu Tienda Online ¡YA! con WooCommerce','Armá tu tienda online desde cero, configurá productos, medios de pago y envíos. Vende más y sin depender de terceros.','Principiante','20 hs','Online','$65.000'],
      ['Automatiza tu Ecommerce y Dispara tus Ventas','Automatizá tu tienda: emails de carrito abandonado, notificaciones, reportes y sincronización de stock con el CRM.','Intermedio','14 hs','Online','$52.000'],
      ['Ecommerce para Pymes Argentinas','Creá y gestioná una tienda online exitosa en el mercado argentino: MercadoPago, medios de envío locales y estrategia de precios en pesos.','Principiante','18 hs','Online','$58.000'],
    ],
  ],
  [
    'cat'   => 'Automatización y Software de Gestión',
    'slug'  => 'automatizacion-gestion',
    'color' => '#1A3461',
    'icon'  => '⚙️',
    'cursos'=> [
      ['Automatiza tu Negocio y Multiplica tu Tiempo Libre','Aplicá herramientas de automatización para eliminar tareas repetitivas y enfocar tu energía en lo que importa.','Principiante','12 hs','Online','$45.000'],
      ['Dolibarr ERP/CRM','Implementá un sistema completo de gestión empresarial para optimizar tus operaciones de ventas, stock, finanzas y clientes.','Intermedio','20 hs','Online','$72.000'],
      ['Zapier e Integromat','Conectá tus apps favoritas y automatizá flujos de trabajo sin escribir una línea de código. Casos prácticos para PyMEs.','Principiante','10 hs','Online','$40.000'],
      ['ERP para Pymes','Implementá un sistema de planificación de recursos empresariales para optimizar operaciones, reducir costos y escalar.','Intermedio','22 hs','Online','$78.000'],
      ['CRM para Pymes','Implementá un sistema de CRM para mejorar la relación con tus clientes, organizar leads y aumentar las ventas.','Principiante','14 hs','Online','Gratuito'],
    ],
  ],
  [
    'cat'   => 'Ciberseguridad',
    'slug'  => 'ciberseguridad',
    'color' => '#dc2626',
    'icon'  => '🔒',
    'cursos'=> [
      ['Ciberseguridad para Pymes','Protegé tu negocio de hackers, ransomware y fraudes online. Prácticas esenciales para empresas sin un equipo de IT dedicado.','Principiante','10 hs','Online','$42.000'],
    ],
  ],
  [
    'cat'   => 'Ventas y Comunicación',
    'slug'  => 'ventas-comunicacion',
    'color' => '#059669',
    'icon'  => '💬',
    'cursos'=> [
      ['Comunicación Empresarial Efectiva','Dominá el arte de comunicar: presentaciones, reuniones, emails y negociaciones que generan resultados profesionales.','Principiante','12 hs','Online','$38.000'],
      ['Ventas Ninja','Aprendé a vender como un profesional: prospección, objeciones, cierre y seguimiento postventa para aumentar tus ingresos.','Intermedio','16 hs','Online','$55.000'],
      ['Comunícate como un Profesional','Mejorá tus habilidades de comunicación oral y escrita, alcanzá tus metas y convertite en referente en tu industria.','Principiante','10 hs','Online','$35.000'],
      ['Negociación Ganadora','Dominá el arte de negociar y conseguí acuerdos que te beneficien en cualquier situación de negocios.','Intermedio','12 hs','Online','$45.000'],
    ],
  ],
  [
    'cat'   => 'Desarrollo Personal y Liderazgo',
    'slug'  => 'liderazgo-personal',
    'color' => '#d97706',
    'icon'  => '🌟',
    'cursos'=> [
      ['Gestiona tu Tiempo y Multiplica tu Productividad','Hacé más en menos tiempo: técnicas probadas de gestión del tiempo, priorización y foco para dueños de PyMEs.','Principiante','8 hs','Online','$32.000'],
      ['Inteligencia Emocional para el Éxito','Desarrollá tu potencial emocional para mejorar relaciones, tomar mejores decisiones y alcanzar el éxito profesional.','Principiante','10 hs','Online','$38.000'],
      ['Liderazgo Inspirador','Convertite en el líder que motiva y guía equipos hacia el éxito. Herramientas de coaching y gestión de personas.','Intermedio','14 hs','Online','$48.000'],
    ],
  ],
  [
    'cat'   => 'Tecnología y Desarrollo',
    'slug'  => 'tecnologia-desarrollo',
    'color' => '#0e7490',
    'icon'  => '💻',
    'cursos'=> [
      ['Apps Móviles Rentables','Creá apps que enamoran usuarios y generan ingresos. Desde la idea hasta la publicación en App Store y Google Play.','Avanzado','24 hs','Online','$85.000'],
      ['Programación Web con Python','Convertite en un desarrollador web codiciado. Flask, Django, APIs REST y bases de datos desde cero.','Intermedio','28 hs','Online','$92.000'],
    ],
  ],
  [
    'cat'   => 'Finanzas',
    'slug'  => 'finanzas',
    'color' => '#065f46',
    'icon'  => '💰',
    'cursos'=> [
      ['Finanzas para Emprendedores','Tomá el control de tus finanzas personales y empresariales. Flujo de caja, presupuesto y decisiones financieras inteligentes.','Principiante','12 hs','Online','$42.000'],
      ['Finanzas Empresariales para Pymes','Dominá el mundo de las finanzas: ratios, proyecciones, costos y decisiones de inversión para llevar tu PyME al siguiente nivel.','Intermedio','16 hs','Online','$58.000'],
    ],
  ],
  [
    'cat'   => 'Gestión de Proyectos',
    'slug'  => 'gestion-proyectos',
    'color' => '#4338ca',
    'icon'  => '📋',
    'cursos'=> [
      ['Gestión de Proyectos Innovadores','Hacé realidad tus ideas: metodologías para planificar, ejecutar y cerrar proyectos que generan impacto real.','Principiante','14 hs','Online','$48.000'],
      ['Gestión de Proyectos Ágiles','Planificá, ejecutá y controlá proyectos con éxito en tiempo récord usando Scrum, Kanban y metodologías ágiles.','Intermedio','16 hs','Online','$55.000'],
      ['Gestiona tus Proyectos como un Experto','Dominá las mejores prácticas (PMI/PMP) y llevá tus proyectos al éxito con técnicas de gestión de riesgos y equipos.','Avanzado','20 hs','Online','$68.000'],
      ['Calidad Garantizada','Implementá un sistema de gestión de calidad (ISO 9001) que diferenciará a tu empresa y aumentará la satisfacción del cliente.','Intermedio','14 hs','Online','$52.000'],
    ],
  ],
  [
    'cat'   => 'Recursos Humanos',
    'slug'  => 'recursos-humanos',
    'color' => '#9333ea',
    'icon'  => '👥',
    'cursos'=> [
      ['Talento Humano para Pymes','Atraé, retenés y desarrollás talento de alto rendimiento. Reclutamiento, onboarding y cultura organizacional para PyMEs.','Principiante','14 hs','Online','$48.000'],
      ['Recursos Humanos Eficientes para Pymes','Implementá estrategias de RRHH adecuadas para empresas pequeñas: liquidación de sueldos, legajos y gestión del desempeño en Argentina.','Intermedio','16 hs','Online','$55.000'],
    ],
  ],
  [
    'cat'   => 'Estrategia de Negocios',
    'slug'  => 'estrategia-negocios',
    'color' => '#be185d',
    'icon'  => '🎯',
    'cursos'=> [
      ['Estrategias de Negocios Ganadoras','Creá planes de negocio infalibles: análisis de mercado, diferenciación, modelo de ingresos y estrategia de crecimiento.','Intermedio','16 hs','Online','$62.000'],
      ['Innovación Empresarial','Fomentá una cultura de innovación, desarrollá productos y servicios disruptivos y adelantate a la competencia.','Intermedio','14 hs','Online','$55.000'],
    ],
  ],
];

/* Nota sobre Ciberseguridad */
$ciberseg_nota = true;
?>

<!-- Filtros por categoría -->
<section class="section section--sm" style="background:var(--g50);padding-top:24px;padding-bottom:24px" id="cursos">
  <div class="container">
    <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">
      <button class="curso-filter active" data-cat="all">Todos (30)</button>
      <?php foreach ($academia as $area): ?>
      <button class="curso-filter" data-cat="<?php echo esc_attr($area['slug']); ?>" style="--fc:<?php echo esc_attr($area['color']); ?>">
        <?php echo $area['icon']; ?> <?php echo esc_html($area['cat']); ?>
        <span style="opacity:.6;font-size:.7em">(<?php echo count($area['cursos']); ?>)</span>
      </button>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- Cursos por área -->
<?php foreach ($academia as $area): ?>
<section class="section academia-area" data-cat="<?php echo esc_attr($area['slug']); ?>" style="padding-top:36px;padding-bottom:36px">
  <div class="container">

    <!-- Header del área -->
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid var(--g100)">
      <div style="width:44px;height:44px;border-radius:10px;background:<?php echo esc_attr($area['color']); ?>;display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0">
        <?php echo $area['icon']; ?>
      </div>
      <div>
        <h2 style="margin:0;font-size:1.2rem"><?php echo esc_html($area['cat']); ?></h2>
        <span style="font-size:.75rem;color:var(--g400)"><?php echo count($area['cursos']); ?> <?php echo count($area['cursos']) === 1 ? 'curso' : 'cursos'; ?></span>
      </div>
      <?php if ($area['slug'] === 'ciberseguridad'): ?>
      <span style="margin-left:auto;font-size:.72rem;background:#fef2f2;color:#991b1b;border:1px solid #fecaca;border-radius:100px;padding:3px 12px">Solo 1 curso — se amplía próximamente</span>
      <?php endif; ?>
    </div>

    <!-- Grid de cursos -->
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px">
      <?php foreach ($area['cursos'] as $curso): ?>
      <?php
      $nivel_colors = [
        'Principiante' => ['bg'=>'#dcfce7','txt'=>'#166534'],
        'Intermedio'   => ['bg'=>'#dbeafe','txt'=>'#1e40af'],
        'Avanzado'     => ['bg'=>'#ede9fe','txt'=>'#5b21b6'],
      ];
      $nc = $nivel_colors[$curso[2]] ?? ['bg'=>'#f3f4f6','txt'=>'#374151'];
      $is_free = strtolower($curso[5]) === 'gratuito';
      ?>
      <div class="curso-item" data-cat="<?php echo esc_attr($area['slug']); ?>" style="background:white;border:1px solid var(--g200);border-radius:12px;overflow:hidden;display:flex;flex-direction:column;transition:.2s;position:relative">
        <?php if ($is_free): ?>
        <div style="position:absolute;top:12px;right:12px;background:#dcfce7;color:#166534;font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;padding:3px 10px;border-radius:100px">Gratis</div>
        <?php endif; ?>
        <div style="height:4px;background:<?php echo esc_attr($area['color']); ?>"></div>
        <div style="padding:18px 18px 16px;flex:1;display:flex;flex-direction:column">
          <div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap">
            <span style="background:<?php echo esc_attr($nc['bg']); ?>;color:<?php echo esc_attr($nc['txt']); ?>;font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:2px 8px;border-radius:100px"><?php echo esc_html($curso[2]); ?></span>
          </div>
          <h3 style="font-size:.92rem;margin:0 0 8px;line-height:1.35"><?php echo esc_html($curso[0]); ?></h3>
          <p style="font-size:.76rem;color:var(--g500);flex:1;margin:0 0 14px;line-height:1.5"><?php echo esc_html($curso[1]); ?></p>
          <div style="display:flex;gap:14px;font-size:.72rem;color:var(--g400);margin-bottom:14px">
            <span>⏱ <?php echo esc_html($curso[3]); ?></span>
            <span>📍 <?php echo esc_html($curso[4]); ?></span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <strong style="font-size:.95rem;color:<?php echo $is_free ? '#166534' : esc_attr($area['color']); ?>"><?php echo esc_html($curso[5]); ?></strong>
            <a href="<?php echo esc_url(home_url('/contacto')); ?>" style="background:<?php echo esc_attr($area['color']); ?>;color:white;padding:7px 14px;border-radius:7px;font-size:.73rem;font-weight:600;text-decoration:none;white-space:nowrap">Inscribirme →</a>
          </div>
        </div>
      </div>
      <?php endforeach; ?>
    </div>

  </div>
</section>
<?php endforeach; ?>

<!-- Separador -->
<div style="border-top:1px solid var(--g100)"></div>

<!-- Capacitación in-company -->
<section class="section section--sm" style="background:var(--g50)">
  <div class="container">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center">
      <div>
        <span class="hero-eyebrow">Capacitación personalizada</span>
        <h2>In-company para tu equipo</h2>
        <p style="color:var(--g500)">Diseñamos un programa con los cursos que necesita tu equipo, con casos reales de tu negocio, instructor dedicado y certificado corporativo.</p>
        <ul class="feature-list">
          <li>Instructor dedicado y material personalizado</li>
          <li>Talleres prácticos con tus datos reales</li>
          <li>Horarios flexibles: mañana, tarde o noche</li>
          <li>Modalidad presencial o remota</li>
          <li>Certificado corporativo para el equipo</li>
          <li>Seguimiento post-capacitación incluido</li>
        </ul>
        <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-primary" style="margin-top:20px">Consultar programa corporativo</a>
      </div>
      <div style="background:white;border:1px solid var(--g200);border-radius:16px;padding:28px">
        <h3 style="margin-bottom:20px;font-size:1rem">Precios de referencia — In-company</h3>
        <?php
        $corp = [
          ['👥 Hasta 5 personas','$180.000 – $280.000','Medio día (4 hs)'],
          ['👥 Hasta 10 personas','$280.000 – $450.000','Jornada completa (8 hs)'],
          ['👥 Hasta 20 personas','$450.000 – $700.000','2 jornadas (16 hs)'],
          ['🏢 Programa mensual','$600.000 – $1.200.000','4 sesiones por mes'],
        ];
        foreach ($corp as $p): ?>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--g100)">
          <div>
            <div style="font-size:.82rem;font-weight:600"><?php echo esc_html($p[0]); ?></div>
            <div style="font-size:.72rem;color:var(--g400)"><?php echo esc_html($p[2]); ?></div>
          </div>
          <strong style="font-size:.85rem;color:#1A3461"><?php echo esc_html($p[1]); ?></strong>
        </div>
        <?php endforeach; ?>
        <p style="font-size:.72rem;color:var(--g400);margin-top:14px;margin-bottom:0">Precios en ARS. Incluye instructor, material y certificado.</p>
      </div>
    </div>
  </div>
</section>

<section class="cta-section">
  <div class="container text-center">
    <h2>Empezá hoy con el curso de CRM para Pymes</h2>
    <p>14 horas, online, <strong>completamente gratuito</strong>. Certificado incluido al finalizar.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-green btn-lg">Inscribirme gratis</a>
      <a href="<?php echo esc_url(home_url('/catalogo-servicios')); ?>" class="btn btn-ghost btn-lg">Ver servicios de capacitación</a>
    </div>
  </div>
</section>

</main>

<style>
.curso-filter {
  padding:6px 14px;border-radius:100px;border:1px solid var(--g200);background:white;font-size:.78rem;font-weight:500;cursor:pointer;transition:.2s;color:var(--g600);
}
.curso-filter.active,.curso-filter:hover { background:var(--fc,#1A3461);color:white;border-color:var(--fc,#1A3461); }
.academia-area + .academia-area { border-top:1px solid var(--g50); }
.curso-item:hover { box-shadow:0 4px 20px rgba(0,0,0,.08);transform:translateY(-1px); }
</style>
<script>
(function(){
  const filters = document.querySelectorAll('.curso-filter');
  const areas   = document.querySelectorAll('.academia-area');

  filters.forEach(btn => {
    btn.addEventListener('click', function() {
      filters.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const cat = this.dataset.cat;
      areas.forEach(area => {
        area.style.display = (cat === 'all' || area.dataset.cat === cat) ? '' : 'none';
      });
    });
  });
})();
</script>
<?php get_footer(); ?>
