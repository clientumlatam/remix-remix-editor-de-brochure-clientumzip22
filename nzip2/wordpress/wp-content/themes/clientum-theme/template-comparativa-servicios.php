<?php
/**
 * Template Name: Comparativa de Servicios
 */
get_header(); ?>

<main class="site-main">

<section class="page-hero page-hero--simple">
  <div class="container">
    <span class="hero-eyebrow">Comparativa</span>
    <h1>Comparativa de servicios</h1>
    <p>Nos esforzamos por brindar soluciones de alta calidad y servicio excepcional. Mirá cómo nos destacamos.</p>
  </div>
</section>

<!-- PRICING GRID -->
<section class="section">
  <div class="container">
    <div class="section-header centered">
      <span class="section-label">Planes</span>
      <h2>Elige el plan que se adapta a tu empresa</h2>
      <p class="section-subtitle">Todos los planes incluyen 14 días de prueba gratis. Sin tarjeta de crédito.</p>
    </div>
    <div class="pricing-grid">
      <div class="pricing-card">
        <p class="plan-name">Starter</p>
        <div class="plan-price">$29.990<span>/mes</span></div>
        <p class="plan-desc">Para emprendedores y negocios que recién arrancan.</p>
        <ul class="plan-features">
          <li>Hasta 3 usuarios</li>
          <li>CRM básico</li>
          <li>Facturación AFIP (50 facturas/mes)</li>
          <li>Chatbot WhatsApp</li>
          <li>Soporte por email</li>
        </ul>
        <div class="plan-cta">
          <a href="<?php echo esc_url(home_url('/registro')); ?>" class="btn btn-outline" style="width:100%">Seleccionar plan</a>
        </div>
      </div>

      <div class="pricing-card pricing-card--featured">
        <span class="pricing-badge">Más popular</span>
        <p class="plan-name">Pro</p>
        <div class="plan-price">$59.990<span>/mes</span></div>
        <p class="plan-desc">Para PyMEs en crecimiento que necesitan más potencia.</p>
        <ul class="plan-features">
          <li>Hasta 10 usuarios</li>
          <li>CRM completo + Pipeline</li>
          <li>Facturación AFIP ilimitada</li>
          <li>Chatbot WhatsApp avanzado</li>
          <li>Portal del cliente</li>
          <li>Integraciones (MP, WooCommerce)</li>
          <li>Soporte WhatsApp prioritario</li>
        </ul>
        <div class="plan-cta">
          <a href="<?php echo esc_url(home_url('/registro')); ?>" class="btn btn-primary" style="width:100%">Seleccionar plan</a>
        </div>
      </div>

      <div class="pricing-card">
        <p class="plan-name">Enterprise</p>
        <div class="plan-price">A medida</div>
        <p class="plan-desc">Para empresas con necesidades específicas o alto volumen.</p>
        <ul class="plan-features">
          <li>Usuarios ilimitados</li>
          <li>ERP personalizado</li>
          <li>API acceso completo</li>
          <li>Onboarding dedicado</li>
          <li>SLA garantizado</li>
          <li>Soporte 24/7</li>
        </ul>
        <div class="plan-cta">
          <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-outline" style="width:100%">Contactarnos</a>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- FEATURES INCLUIDAS -->
<section class="section" style="background:var(--g50)">
  <div class="container">
    <div class="section-header centered">
      <span class="section-label">Siempre incluido</span>
      <h2>Todos los planes incluyen</h2>
    </div>
    <div class="grid-3">
      <?php
      $features = [
        ['📱','App escritorio y móvil','Accedé desde cualquier dispositivo.'],
        ['⏱','Estimaciones de tiempo','Gestión de proyectos incluida.'],
        ['🧾','Facturación electrónica','Facturas A, B y C con CAE de AFIP.'],
        ['💳','Pagos en línea','MercadoPago y transferencias.'],
        ['📊','Informes avanzados','Dashboards y analytics en tiempo real.'],
        ['🔄','Tareas recurrentes','Automatización de procesos repetitivos.'],
      ];
      foreach ($features as $f): ?>
        <div class="feature-card">
          <div class="card-icon" style="background:var(--g100);font-size:1.4rem"><?php echo $f[0]; ?></div>
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
    <div class="section-header centered"><h2>Preguntas frecuentes sobre precios</h2></div>
    <div class="faq-list">
      <?php
      $faqs = [
        ['¿Hay período de prueba?','Sí. Podés probar todos los servicios durante 14 días sin tarjeta de crédito.'],
        ['¿Pago mensual o anual?','Ofrecemos ambas opciones. El plan anual tiene un 20% de descuento.'],
        ['¿Puedo cancelar en cualquier momento?','Sí. Sin contratos de permanencia. Cancelás desde tu panel cuando quieras.'],
        ['¿Qué métodos de pago aceptan?','MercadoPago, transferencia bancaria y tarjeta de crédito, en pesos argentinos.'],
        ['¿Aplica IVA?','Sí, los precios más arriba son sin IVA. El IVA se calcula según legislación vigente.'],
        ['¿Hay descuentos?','Consultá con nuestro equipo sobre promociones y descuentos por volumen disponibles.'],
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
    <h2>¿Necesitás más capacidad?</h2>
    <p>No dudes en contactarnos. Armamos un plan a medida para tu empresa.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/registro')); ?>" class="btn btn-green btn-lg">Probar gratis 14 días</a>
      <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-outline-white btn-lg">Hablar con ventas</a>
    </div>
  </div>
</section>

</main>
<?php get_footer(); ?>
