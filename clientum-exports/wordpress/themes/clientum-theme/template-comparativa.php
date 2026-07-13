<?php /* Template Name: Comparativa */ get_header(); ?>
<main class="site-main">

<div class="page-hero page-hero--simple">
  <div class="container text-center">
    <span class="hero-eyebrow">Comparativa</span>
    <h1>Clientum vs. otras opciones</h1>
    <p>La única plataforma diseñada para la realidad del mercado argentino. Sin dólares, sin tecnicismos, con soporte local.</p>
  </div>
</div>

<section class="section">
  <div class="container">
    <div style="overflow-x:auto">
      <table class="comparison-table">
        <thead>
          <tr>
            <th style="text-align:left;width:36%">Característica</th>
            <th class="clientum-col" style="width:16%">Clientum</th>
            <th style="width:16%">HubSpot</th>
            <th style="width:16%">Pipedrive</th>
            <th style="width:16%">Excel / Planillas</th>
          </tr>
        </thead>
        <tbody>
          <?php
          $rows = [
            ['Pipeline CRM visual',                          true,  true,  true,  false],
            ['Chatbot WhatsApp nativo (incluido)',            true,  false, false, false],
            ['Asistente IA integrado',                       true,  false, false, false],
            ['Facturación AFIP con CAE',                     true,  false, false, false],
            ['Precio en Pesos Argentinos',                   true,  false, false, true ],
            ['Soporte en español incluido',                  true,  true,  false, false],
            ['Onboarding personalizado incluido',            true,  false, false, false],
            ['Portal del cliente nativo',                    true,  false, false, false],
            ['Automatización de flujos incluida',            true,  false, false, false],
            ['Integración MercadoPago',                      true,  false, false, false],
            ['Migración de datos sin costo extra',           true,  false, false, false],
            ['Sin exposición al tipo de cambio',             true,  false, false, true ],
            ['Academia y recursos en español',               true,  true,  false, false],
            ['Soporte local argentino',                      true,  false, false, false],
          ];
          foreach ($rows as $i => $row) {
            $bg = $i % 2 === 0 ? '' : 'style="background:var(--g50)"';
            echo '<tr ' . $bg . '>
              <td>' . esc_html($row[0]) . '</td>';
            foreach ([1,2,3,4] as $ci) {
              $isClientum = $ci === 1;
              $style = $isClientum ? ' class="clientum-col"' : '';
              if ($row[$ci]) {
                echo '<td' . $style . '><span class="check-yes">' . ($isClientum ? '✓' : '✓') . '</span></td>';
              } else {
                echo '<td' . $style . '><span class="check-no">✕</span></td>';
              }
            }
            echo '</tr>';
          }
          ?>
        </tbody>
      </table>
    </div>
    <p class="text-sm text-gray-500" style="margin-top:12px">* Excel y planillas no son CRM: se incluyen como referencia del punto de partida habitual de las PyMEs. Los datos de HubSpot y Pipedrive corresponden a sus planes de entrada.</p>
  </div>
</section>

<section class="section" style="background:var(--g50)">
  <div class="container">
    <div class="section-header centered">
      <h2>¿Por qué Clientum para Argentina?</h2>
    </div>
    <div class="grid-3">
      <?php foreach([
        ['🇦🇷','Precio en pesos','Sin impuesto PAIS. Sin tipo de cambio. Pagás en pesos con tarjeta o transferencia bancaria local.'],
        ['🤝','Soporte humano local','Atención en español por personas que conocen el mercado argentino. De lunes a viernes, de 9 a 18 hs.'],
        ['📋','AFIP integrada','El único CRM que emite facturas con CAE directamente desde el panel, sin salir del sistema.'],
        ['🚀','Onboarding incluido','Nuestro equipo te acompaña en la implementación. No te dejamos solo frente a un tutorial en inglés.'],
        ['⚡','Velocidad de implementación','Mientras otros tardan meses, con Clientum estás operativo en menos de una semana.'],
        ['💬','WhatsApp nativo','El canal de comunicación más usado en Argentina, integrado nativamente en el CRM.'],
      ] as $r): ?>
      <div class="card card--white">
        <div style="font-size:2rem;margin-bottom:12px"><?php echo $r[0]; ?></div>
        <h3><?php echo esc_html($r[1]); ?></h3>
        <p><?php echo esc_html($r[2]); ?></p>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section class="cta-section">
  <div class="container text-center">
    <h2>Probá la diferencia en 14 días</h2>
    <p>Sin tarjeta. Sin contratos. Sin dolores de cabeza.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/register')); ?>" class="btn btn-green btn-lg">Crear cuenta gratis</a>
      <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-outline-white btn-lg">Hablar con ventas</a>
    </div>
  </div>
</section>
</main>
<?php get_footer(); ?>
