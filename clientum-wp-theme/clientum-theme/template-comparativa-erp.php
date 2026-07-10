<?php
/**
 * Template Name: Comparativa ERP
 */
get_header(); ?>

<main class="site-main">

<section class="page-hero page-hero--simple">
  <div class="container">
    <span class="hero-eyebrow">Comparativa</span>
    <h1>Clientum vs. ERPs tradicionales</h1>
    <p>Soluciones de alta calidad a precio de PyME. Mirá cómo nos destacamos frente a la competencia.</p>
  </div>
</section>

<!-- TABLA COMPARATIVA -->
<section class="section">
  <div class="container">
    <div class="section-header centered">
      <span class="section-label">Comparativa</span>
      <h2>Clientum vs. alternativas del mercado</h2>
    </div>
    <div style="overflow-x:auto">
      <table class="comparison-table" style="width:100%">
        <thead>
          <tr>
            <th style="text-align:left;padding:16px">Característica</th>
            <th class="clientum-col">Clientum</th>
            <th>ERP Tradicional</th>
            <th>Excel / Manual</th>
          </tr>
        </thead>
        <tbody>
          <?php
          $rows = [
            ['Configuración sin IT',           '✓','✗','✓'],
            ['Precio en pesos argentinos',      '✓','✗','✓'],
            ['Facturación AFIP integrada',      '✓','✗','✗'],
            ['Chatbot WhatsApp 24/7',           '✓','✗','✗'],
            ['CRM + ERP en una plataforma',     '✓','✓','✗'],
            ['Analítica en tiempo real',        '✓','✓','✗'],
            ['Aplicación móvil incluida',       '✓','✓','✗'],
            ['Soporte en español incluido',     '✓','✗','✗'],
            ['Implementación en una semana',    '✓','✗','✓'],
            ['Escalable sin migración',         '✓','✗','✗'],
            ['Portal del cliente self-service', '✓','✗','✗'],
            ['MercadoPago integrado',           '✓','✗','✗'],
          ];
          foreach ($rows as $r): ?>
            <tr>
              <td><?php echo esc_html($r[0]); ?></td>
              <td class="clientum-col"><span class="check-yes"><?php echo $r[1]; ?></span></td>
              <td><span class="<?php echo $r[2]==='✓'?'check-yes':'check-no'; ?>"><?php echo $r[2]; ?></span></td>
              <td><span class="<?php echo $r[3]==='✓'?'check-yes':'check-no'; ?>"><?php echo $r[3]; ?></span></td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
    <p class="text-center mt-6" style="color:var(--g500);font-size:.9rem">¿Necesitás más información? <a href="<?php echo esc_url(home_url('/contacto')); ?>" style="color:var(--navy);font-weight:600">Contactá a nuestro equipo →</a></p>
  </div>
</section>

<!-- INCLUIDO EN TODOS LOS PLANES -->
<section class="section" style="background:var(--g50)">
  <div class="container">
    <div class="section-header centered">
      <span class="section-label">Incluido siempre</span>
      <h2>Características que vienen en todos los planes</h2>
    </div>
    <div class="grid-3">
      <?php
      $features = [
        ['📱','Aplicación escritorio y móvil','Accedé a tu ERP desde cualquier dispositivo, en cualquier lugar.'],
        ['⏱','Estimaciones de tiempo','Planificación efectiva para la gestión de proyectos y entregas.'],
        ['🧾','Facturación AFIP','Gestión de facturas A, B y C con CAE. Simple y clara.'],
        ['💳','Pagos en línea','MercadoPago, transferencias y links de pago integrados.'],
        ['📊','Informes avanzados','Analizá datos y mejorá la toma de decisiones con dashboards en tiempo real.'],
        ['🔄','Tareas recurrentes','Automatizá tus procesos para mayor eficiencia operativa.'],
      ];
      foreach ($features as $f): ?>
        <div class="feature-card">
          <div class="card-icon" style="background:var(--g100);font-size:1.5rem"><?php echo $f[0]; ?></div>
          <h3><?php echo esc_html($f[1]); ?></h3>
          <p><?php echo esc_html($f[2]); ?></p>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- FAQ -->
<section class="section">
  <div class="container" style="max-width:760px">
    <div class="section-header centered">
      <h2>Preguntas sobre precios y planes</h2>
    </div>
    <div class="faq-list">
      <?php
      $faqs = [
        ['¿Hay período de prueba?','Sí. 14 días gratis sin tarjeta de crédito. Podés evaluar todos los servicios antes de comprometerte.'],
        ['¿Pago mensual o anual?','Ofrecemos ambas opciones. El plan anual incluye un descuento del 20% respecto al mensual.'],
        ['¿Puedo cancelar en cualquier momento?','Sí. Sin contratos de permanencia. Cancelás desde el panel cuando quieras.'],
        ['¿Qué métodos de pago aceptan?','MercadoPago, transferencia bancaria y tarjeta de crédito. Todo en pesos argentinos.'],
        ['¿Tienen descuentos para múltiples usuarios?','Sí. Consultá con nuestro equipo para planes corporativos con descuentos por volumen.'],
      ];
      foreach ($faqs as $f): ?>
        <div class="faq-item">
          <button class="faq-question"><?php echo esc_html($f[0]); ?><span class="faq-icon">+</span></button>
          <div class="faq-answer"><div class="faq-answer-inner"><?php echo esc_html($f[1]); ?></div></div>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section class="cta-section">
  <div class="container">
    <h2>¿Listo para cambiar de sistema?</h2>
    <p>Migramos tus datos sin costo. Operativo en menos de una semana.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/registro')); ?>" class="btn btn-green btn-lg">Probar gratis 14 días</a>
      <a href="<?php echo esc_url(home_url('/precios')); ?>" class="btn btn-outline-white btn-lg">Ver planes y precios</a>
    </div>
  </div>
</section>

</main>
<?php get_footer(); ?>
