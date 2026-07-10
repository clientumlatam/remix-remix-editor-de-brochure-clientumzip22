<?php /* Template Name: Academia */ get_header(); ?>
<main class="site-main">

<div class="page-hero">
  <div class="container text-center">
    <span class="hero-eyebrow">Academia Clientum</span>
    <h1>Aprendé a sacarle el máximo a Clientum</h1>
    <p>Cursos cortos, prácticos y en español para que vos y tu equipo dominen la plataforma rápido.</p>
  </div>
</div>

<section class="section section--sm" style="background:var(--g50)">
  <div class="container">
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-number">30+</div><div class="stat-label">Cursos disponibles</div></div>
      <div class="stat-card"><div class="stat-number">5.000+</div><div class="stat-label">Usuarios formados</div></div>
      <div class="stat-card"><div class="stat-number">4.8/5</div><div class="stat-label">Calificación promedio</div></div>
      <div class="stat-card"><div class="stat-number">Gratis</div><div class="stat-label">Con plan Pro y Business</div></div>
    </div>
  </div>
</section>

<!-- Clientum platform courses -->
<section class="section">
  <div class="container">
    <h2 style="margin-bottom:8px">Cursos de la plataforma Clientum</h2>
    <p style="color:var(--g500);font-size:.9rem;margin-bottom:32px">Todo lo que necesitás para operar Clientum como un experto.</p>
    <div class="course-list">
      <?php
      $courses = [
        ['Primeros pasos con Clientum','45 min','Básico','Configurá tu cuenta, importá contactos y explorá el panel por primera vez.'],
        ['Chatbot de WhatsApp: configuración completa','1h 30m','Básico','Creá flujos de conversación, configurá respuestas automáticas y derivá al CRM.'],
        ['CRM: Contactos, Leads y Pipeline','2h','Medio','Gestioná tu embudo de ventas, asigná deals y configurá seguimientos automáticos.'],
        ['Automatizaciones avanzadas','3h','Avanzado','Armá flujos complejos de automatización para el ciclo de ventas completo.'],
        ['Facturación AFIP desde el CRM','1h','Medio','Conectá tu cuenta de AFIP y emití tu primera factura electrónica.'],
        ['Reportes y análisis con IA','1h 30m','Medio','Usá el asistente IA para generar reportes y tomar decisiones con datos.'],
        ['Portal del Cliente: configuración y uso','50 min','Básico','Configurá el portal y permitile a tus clientes ver sus documentos.'],
        ['Administración de tu cuenta y equipo','40 min','Básico','Gestioná usuarios, roles y permisos dentro de Clientum.'],
      ];
      foreach ($courses as $c):
        $level_color = $c[2] === 'Básico' ? 'var(--green-dark)' : ($c[2] === 'Avanzado' ? 'var(--purple)' : 'var(--navy)');
      ?>
      <div class="course-item">
        <div style="display:flex;align-items:flex-start;gap:16px">
          <div style="flex:1">
            <h4 style="font-size:.9rem;margin-bottom:4px"><?php echo esc_html($c[0]); ?></h4>
            <p style="font-size:.78rem;color:var(--g500);margin:0"><?php echo esc_html($c[3]); ?></p>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-shrink:0">
            <span style="font-size:.68rem;background:var(--g50);padding:3px 10px;border-radius:100px;color:var(--g500)"><?php echo esc_html($c[1]); ?></span>
            <span style="font-size:.68rem;font-weight:700;color:<?php echo $level_color; ?>"><?php echo esc_html($c[2]); ?></span>
          </div>
        </div>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- LMS Library -->
<section class="section section--sm" style="background:var(--g50)">
  <div class="container">
    <h2 style="margin-bottom:8px">Biblioteca Viaweb — Cursos para PyMEs</h2>
    <p style="color:var(--g500);font-size:.9rem;margin-bottom:32px">Más de 30 cursos de negocios, marketing, automatización y liderazgo. Incluidos con tu plan.</p>
    <div class="grid-4">
      <?php
      $library = [
        ['🎯 Gestión & Negocios','var(--navy)',[
          'Dolibarr ERP/CRM','CRM para Pymes','ERP para Pymes',
          'Estrategias de Negocios Ganadoras','Finanzas para Emprendedores',
          'Finanzas Empresariales para Pymes','Gestión de Proyectos Ágiles','Calidad Garantizada',
        ]],
        ['📣 Marketing & Ventas','#ea580c',[
          'Marketing Digital para Principiantes','Crea tu Tienda Online con WooCommerce',
          'Automatiza tu Ecommerce y Dispara tus Ventas','Ecommerce para Pymes Argentinas',
          'SEO Avanzado','Marketing de Contenidos',
        ]],
        ['⚡ Automatización & Tech','var(--green)',[
          'Automatiza tu Negocio y Multiplica tu Tiempo','Zapier e Integromat',
          'Apps Móviles Rentables','Programación Web con Python','Ciberseguridad para Pymes',
        ]],
        ['🤝 Liderazgo & Personas','#7c3aed',[
          'Gestiona tu Tiempo y Multiplica tu Productividad','Inteligencia Emocional para el Éxito',
          'Liderazgo Inspirador','Negociación Ganadora','Comunícate como un Profesional',
          'Talento Humano para Pymes','Recursos Humanos Eficientes para Pymes',
        ]],
      ];
      foreach ($library as $group):
      ?>
      <div style="background:white;border-radius:12px;border:1px solid var(--g200);overflow:hidden">
        <div style="padding:14px 16px;font-weight:700;font-size:.82rem;color:white;background:<?php echo $group[1]; ?>"><?php echo $group[0]; ?></div>
        <ul style="margin:0;padding:0;list-style:none">
          <?php foreach ($group[2] as $course): ?>
          <li style="padding:10px 16px;border-bottom:1px solid var(--g100);font-size:.78rem;color:var(--g700);display:flex;align-items:flex-start;gap:8px">
            <span style="width:6px;height:6px;border-radius:50%;background:<?php echo $group[1]; ?>;flex-shrink:0;margin-top:5px"></span>
            <?php echo esc_html($course); ?>
          </li>
          <?php endforeach; ?>
        </ul>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- Clientes testimonials -->
<section class="section">
  <div class="container" style="max-width:720px;text-align:center">
    <h2 style="margin-bottom:32px">Lo que dicen nuestros alumnos</h2>
    <?php
    $testimonials = [
      ['Mónica S.','Clínica Estética Lumière','En un fin de semana aprendí a configurar el chatbot. Ahora agenda turnos solo. Los videos son claros y cortitos.'],
      ['Rodrigo P.','Distribuidora Patagónica','El curso de facturación AFIP me ahorró horas de prueba y error. Seguí los pasos y funcionó a la primera.'],
      ['Valeria G.','Servicios Contables VG','Le mandé el link a mis clientes y ya no me consultan lo básico. Se capacitan solos.'],
    ];
    foreach ($testimonials as $t):
    ?>
    <div style="background:var(--g50);border:1px solid var(--g200);border-radius:12px;padding:24px;margin-bottom:16px;text-align:left">
      <div style="font-size:.85rem;color:var(--g700);font-style:italic;margin-bottom:12px">"<?php echo esc_html($t[2]); ?>"</div>
      <strong style="font-size:.82rem"><?php echo esc_html($t[0]); ?></strong>
      <span style="font-size:.78rem;color:var(--g500)"> — <?php echo esc_html($t[1]); ?></span>
    </div>
    <?php endforeach; ?>
  </div>
</section>

<section class="cta-section">
  <div class="container text-center">
    <h2>Empezá a aprender hoy</h2>
    <p>La Academia está incluida con tu cuenta. Sin costo adicional en planes Pro y Business.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/register')); ?>" class="btn btn-green btn-lg">Crear cuenta gratis</a>
      <a href="<?php echo esc_url(home_url('/precios')); ?>" class="btn btn-outline-white btn-lg">Ver planes</a>
    </div>
  </div>
</section>

</main>
<?php get_footer(); ?>
