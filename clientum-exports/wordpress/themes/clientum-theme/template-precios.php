<?php
/*
 * Template Name: Precios
 */
get_header(); ?>
<main class="site-main">

<div class="page-hero page-hero--simple">
  <div class="container text-center">
    <span class="hero-eyebrow">Planes 2026</span>
    <h1>Precios simples, en pesos argentinos</h1>
    <p>14 días gratis · Sin tarjeta de crédito · Sin contrato de permanencia</p>
  </div>
</div>

<!-- Included in all plans -->
<section class="section section--sm" style="background:var(--g50)">
  <div class="container">
    <h3 class="text-center" style="margin-bottom:28px">Incluido en todos los planes</h3>
    <div class="grid-4">
      <?php
      $included = [
        ['🤖','Asistente IA','Preguntale en castellano'],
        ['🔒','Seguridad','Datos encriptados end-to-end'],
        ['📞','Soporte','Atención en español'],
        ['🔄','Actualizaciones','Siempre la última versión'],
        ['📱','Mobile','Funciona en celular'],
        ['📊','Dashboard','Panel unificado'],
        ['🇦🇷','Local','Servidores en Argentina'],
        ['📧','Email marketing','Integrado con el CRM'],
      ];
      foreach ($included as $i) {
        echo '<div style="display:flex;align-items:center;gap:12px;padding:16px;background:white;border-radius:8px;border:1px solid var(--g200)">
          <span style="font-size:1.4rem">' . $i[0] . '</span>
          <div><strong style="display:block;font-size:.875rem">' . esc_html($i[1]) . '</strong><small style="color:var(--g500)">' . esc_html($i[2]) . '</small></div>
        </div>';
      }
      ?>
    </div>
  </div>
</section>

<!-- Pricing cards — 5 planes -->
<section class="section">
  <div class="container">
    <div class="pricing-grid pricing-grid--5">

      <!-- Demo -->
      <div class="pricing-card">
        <div class="plan-name">Demo</div>
        <div class="plan-price">Gratis <span>14 días</span></div>
        <p class="plan-desc">Probá todo sin tarjeta de crédito.</p>
        <ul class="plan-features">
          <?php foreach(['Chatbot WhatsApp (prueba)','CRM hasta 100 contactos','Pipeline de ventas','Reportes básicos','Soporte por email'] as $f): ?>
          <li><?php echo esc_html($f); ?></li>
          <?php endforeach; ?>
        </ul>
        <div class="plan-cta">
          <a href="<?php echo esc_url(home_url('/register')); ?>" class="btn btn-primary" style="width:100%;justify-content:center">Empezar gratis</a>
        </div>
      </div>

      <!-- Starter -->
      <div class="pricing-card">
        <div class="plan-name">Starter</div>
        <div class="plan-price">$89.990 <span>/ mes ARS</span></div>
        <p class="plan-desc">Para PyMEs que están comenzando.</p>
        <ul class="plan-features">
          <?php foreach(['500 conversaciones WhatsApp','CRM hasta 500 contactos','Pipeline de ventas visual','Reportes básicos','Portal del cliente','Soporte por email'] as $f): ?>
          <li><?php echo esc_html($f); ?></li>
          <?php endforeach; ?>
        </ul>
        <div class="plan-cta">
          <a href="<?php echo esc_url(home_url('/register')); ?>" class="btn btn-outline" style="width:100%;justify-content:center">Comenzar</a>
        </div>
      </div>

      <!-- Pro (featured) -->
      <div class="pricing-card pricing-card--featured">
        <span class="pricing-badge">Más popular</span>
        <div class="plan-name">Pro</div>
        <div class="plan-price">$179.990 <span>/ mes ARS</span></div>
        <p class="plan-desc">Escalá sin sumar personal.</p>
        <ul class="plan-features">
          <?php foreach(['Chatbot WhatsApp ilimitado','CRM contactos ilimitados','Asistente IA incluido','Automatización de flujos','Facturación AFIP integrada','Reportes automáticos avanzados','Portal del cliente personalizado','Soporte prioritario (< 4 hs)'] as $f): ?>
          <li><?php echo esc_html($f); ?></li>
          <?php endforeach; ?>
        </ul>
        <div class="plan-cta">
          <a href="<?php echo esc_url(home_url('/register')); ?>" class="btn btn-primary" style="width:100%;justify-content:center">Probar Pro gratis</a>
        </div>
      </div>

      <!-- Business -->
      <div class="pricing-card">
        <span class="pricing-badge pricing-badge--green">Nuevo</span>
        <div class="plan-name">Business</div>
        <div class="plan-price">$349.990 <span>/ mes ARS</span></div>
        <p class="plan-desc">Para equipos con múltiples usuarios.</p>
        <ul class="plan-features">
          <?php foreach(['Todo lo de Pro','Hasta 5 usuarios','Multi-línea WhatsApp','Analytics avanzado','Integración WooCommerce','Integración MercadoPago','Manager de cuenta dedicado'] as $f): ?>
          <li><?php echo esc_html($f); ?></li>
          <?php endforeach; ?>
        </ul>
        <div class="plan-cta">
          <a href="<?php echo esc_url(home_url('/register')); ?>" class="btn btn-outline" style="width:100%;justify-content:center">Comenzar</a>
        </div>
      </div>

      <!-- Enterprise -->
      <div class="pricing-card">
        <div class="plan-name">Enterprise</div>
        <div class="plan-price">A medida</div>
        <p class="plan-desc">Para empresas con necesidades específicas o volumen alto.</p>
        <ul class="plan-features">
          <?php foreach(['Todo lo de Business','Multi-sucursal','Usuarios ilimitados','API a medida','Onboarding dedicado','SLA garantizado','Capacitación del equipo'] as $f): ?>
          <li><?php echo esc_html($f); ?></li>
          <?php endforeach; ?>
        </ul>
        <div class="plan-cta">
          <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-outline" style="width:100%;justify-content:center">Contactar ventas</a>
        </div>
      </div>

    </div>

    <!-- Annual discount strip -->
    <div style="margin-top:28px;padding:14px 24px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;text-align:center;font-size:.875rem;color:#15803d;font-weight:600;">
      ⚡ Pagá anual y ahorrá 20% — equivale a 2 meses gratis
    </div>

    <p class="text-center text-sm" style="color:var(--g500);margin-top:16px">Todos los precios son en pesos argentinos (ARS). Podés pagar con transferencia bancaria o MercadoPago.</p>
  </div>
</section>

<!-- Comparison table -->
<section class="section section--sm" style="background:var(--g50)">
  <div class="container">
    <h2 class="text-center" style="margin-bottom:36px">Comparativa de planes</h2>
    <div style="overflow-x:auto;border-radius:12px;border:1px solid var(--g200)">
      <table style="width:100%;border-collapse:collapse;background:white;font-size:.875rem">
        <thead>
          <tr style="background:var(--g50);border-bottom:1px solid var(--g200)">
            <th style="text-align:left;padding:12px 20px;font-weight:600;color:var(--g700)">Funcionalidad</th>
            <th style="padding:12px 12px;text-align:center;font-weight:700">Demo</th>
            <th style="padding:12px 12px;text-align:center;font-weight:700">Starter</th>
            <th style="padding:12px 12px;text-align:center;font-weight:700;background:var(--navy);color:white">Pro</th>
            <th style="padding:12px 12px;text-align:center;font-weight:700">Business</th>
            <th style="padding:12px 12px;text-align:center;font-weight:700">Enterprise</th>
          </tr>
        </thead>
        <tbody>
          <?php
          $rows = [
            ['Chatbot WhatsApp', 'Prueba', '500 conv.', 'Ilimitado', 'Ilimitado', 'Ilimitado'],
            ['CRM / Contactos', '100', '500', 'Ilimitados', 'Ilimitados', 'Ilimitados'],
            ['Asistente IA', '—', '—', '✓', '✓', '✓'],
            ['Automatización', '—', '—', '✓', '✓', '✓'],
            ['Facturación AFIP', '—', '—', '✓', '✓', '✓'],
            ['Portal del cliente', '—', '✓', '✓', '✓', '✓'],
            ['Multi-usuario', '—', '—', '—', 'Hasta 5', 'Ilimitados'],
            ['Analytics avanzado', '—', '—', '—', '✓', '✓'],
            ['Integración e-commerce', '—', '—', '—', '✓', '✓'],
            ['SLA garantizado', '—', '—', '—', '—', '✓'],
          ];
          foreach ($rows as $row) {
            echo '<tr style="border-bottom:1px solid var(--g100)">';
            echo '<td style="padding:10px 20px;color:var(--g700);font-weight:500">' . esc_html($row[0]) . '</td>';
            foreach (array_slice($row, 1) as $idx => $v) {
              $is_pro = ($idx === 2);
              $is_check = ($v === '✓');
              $is_dash = ($v === '—');
              $bg = $is_pro ? 'background:#eff6ff;' : '';
              $color = $is_check ? 'color:#16a34a;font-weight:700;' : ($is_dash ? 'color:var(--g300);' : 'color:var(--g700);');
              echo '<td style="padding:10px 12px;text-align:center;' . $bg . $color . '">' . esc_html($v) . '</td>';
            }
            echo '</tr>';
          }
          ?>
        </tbody>
      </table>
    </div>
  </div>
</section>

<!-- FAQ Precios -->
<section class="section section--sm">
  <div class="container" style="max-width:760px">
    <h2 class="text-center" style="margin-bottom:36px">Preguntas sobre precios</h2>
    <div class="faq-list">
      <?php
      $faqs = [
        ['¿Los 14 días gratis requieren tarjeta?','No. Podés probar el plan Demo completo durante 14 días sin ingresar ningún dato de pago. Al terminar el período, elegís si continuás con algún plan pago.'],
        ['¿Puedo cambiar de plan en cualquier momento?','Sí. Podés hacer upgrade o downgrade desde el panel de administración en cualquier momento. Los cambios se aplican en el siguiente período de facturación.'],
        ['¿Los precios incluyen IVA?','El IVA se aplica según la legislación vigente y se refleja en la factura final. Emitimos comprobantes electrónicos con CAE de AFIP.'],
        ['¿Hay descuento por pago anual?','Sí. Pagando el año completo por adelantado ahorrás 20% (equivale a 2 meses gratis). Consultanos para más información.'],
        ['¿Cómo se paga?','Podés pagar por transferencia bancaria (CBU) o con MercadoPago (tarjetas de débito, crédito y dinero en cuenta).'],
        ['¿Qué pasa al superar el límite del plan Starter?','Te avisamos antes de llegar al límite. Podés hacer upgrade al plan Pro o adquirir conversaciones adicionales sin cambiar de plan.'],
      ];
      foreach ($faqs as $f) {
        echo '<div class="faq-item">
          <button class="faq-question">' . esc_html($f[0]) . '<span class="faq-icon">+</span></button>
          <div class="faq-answer"><div class="faq-answer-inner">' . esc_html($f[1]) . '</div></div>
        </div>';
      }
      ?>
    </div>
  </div>
</section>

<section class="cta-section">
  <div class="container text-center">
    <h2>Empezá gratis hoy</h2>
    <p>14 días del plan Demo completo. Sin tarjeta. Sin contrato.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/register')); ?>" class="btn btn-green btn-lg">Crear cuenta gratis</a>
      <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-outline-white btn-lg">Hablar con ventas</a>
    </div>
  </div>
</section>

</main>
<?php get_footer(); ?>
