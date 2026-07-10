<?php
/**
 * Template Name: Comparativa de Servicios (Alternativa)
 */
get_header(); ?>

<main class="site-main">

<section class="page-hero page-hero--simple">
  <div class="container">
    <span class="hero-eyebrow">Comparativa</span>
    <h1>Clientum vs. la competencia</h1>
    <p>Comparativa directa de servicios. Evaluá con datos reales y tomá la mejor decisión para tu PyME.</p>
  </div>
</section>

<!-- TABLA VS COMPETIDORES -->
<section class="section">
  <div class="container">
    <div class="section-header centered">
      <h2>Comparativa de servicios con la competencia</h2>
      <p class="section-subtitle">Mismo precio, mucha más funcionalidad para el mercado argentino.</p>
    </div>
    <div style="overflow-x:auto">
      <table class="comparison-table">
        <thead>
          <tr>
            <th style="text-align:left">Función</th>
            <th class="clientum-col">Clientum</th>
            <th>HubSpot</th>
            <th>Pipedrive</th>
            <th>Excel</th>
          </tr>
        </thead>
        <tbody>
          <?php
          $rows = [
            ['Precio en pesos ARS',               '✓','✗','✗','✓'],
            ['Facturación AFIP nativa',            '✓','✗','✗','✗'],
            ['Chatbot WhatsApp integrado',         '✓','✗','✗','✗'],
            ['CRM completo',                       '✓','✓','✓','✗'],
            ['ERP + inventario',                   '✓','✗','✗','✗'],
            ['Portal del cliente',                 '✓','✗','✗','✗'],
            ['MercadoPago integrado',              '✓','✗','✗','✗'],
            ['Soporte en español 24/7',            '✓','✗','✗','✗'],
            ['Sin necesidad de IT',                '✓','✓','✓','✓'],
            ['Implementación en 1 semana',         '✓','✗','✓','✓'],
            ['IA para analítica',                  '✓','✓','✗','✗'],
            ['Precio accesible para PyMEs',        '✓','✗','✗','✓'],
          ];
          foreach ($rows as $r): ?>
            <tr>
              <td><?php echo esc_html($r[0]); ?></td>
              <td class="clientum-col"><span class="check-yes"><?php echo $r[1]; ?></span></td>
              <td><span class="<?php echo $r[2]==='✓'?'check-yes':'check-no'; ?>"><?php echo $r[2]; ?></span></td>
              <td><span class="<?php echo $r[3]==='✓'?'check-yes':'check-no'; ?>"><?php echo $r[3]; ?></span></td>
              <td><span class="<?php echo $r[4]==='✓'?'check-yes':'check-no'; ?>"><?php echo $r[4]; ?></span></td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </div>
</section>

<!-- HIGHLIGHT -->
<section class="section" style="background:var(--g50)">
  <div class="container">
    <div class="highlight-box">
      <div>
        <h3>Diseñado para el mercado argentino</h3>
        <p>Otros CRMs son herramientas globales adaptadas. Clientum nació para PyMEs argentinas: pesos, AFIP, WhatsApp, CUIT y procesos locales desde el primer día.</p>
        <ul>
          <li>Facturación A, B y C con CAE automático</li>
          <li>Precios en pesos, sin conversión de dólares</li>
          <li>WhatsApp como canal principal de ventas</li>
          <li>Soporte en español rioplatense</li>
        </ul>
      </div>
      <div>
        <a href="<?php echo esc_url(home_url('/registro')); ?>" class="btn btn-green btn-lg" style="width:100%;margin-bottom:12px">Empezar gratis 14 días</a>
        <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-outline-white" style="width:100%">Hablar con ventas</a>
      </div>
    </div>
  </div>
</section>

<!-- FAQ -->
<section class="section">
  <div class="container" style="max-width:760px">
    <div class="section-header centered"><h2>Preguntas frecuentes</h2></div>
    <div class="faq-list">
      <?php
      $faqs = [
        ['¿Puedo migrar desde HubSpot o Pipedrive?','Sí. Te ayudamos a importar todos tus contactos, deals y actividades. El proceso toma menos de un día.'],
        ['¿Qué pasa si necesito más funcionalidades?','Nuestro plan Enterprise es completamente personalizable. Hablá con nuestro equipo.'],
        ['¿Hay descuentos por pagar anual?','Sí, 20% de descuento pagando el año completo.'],
        ['¿Puedo cancelar en cualquier momento?','Sí, sin contratos. Cancelás cuando querés desde tu panel.'],
        ['¿Más preguntas?','Contactá a nuestro equipo de atención al cliente. Respondemos en menos de 2 horas hábiles.'],
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
    <h2>Cambiá al CRM hecho para Argentina</h2>
    <p>Migramos tus datos sin costo. Soporte en español. Precios en pesos.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/registro')); ?>" class="btn btn-green btn-lg">Probar gratis 14 días</a>
      <a href="<?php echo esc_url(home_url('/precios')); ?>" class="btn btn-outline-white btn-lg">Ver precios</a>
    </div>
  </div>
</section>

</main>
<?php get_footer(); ?>
