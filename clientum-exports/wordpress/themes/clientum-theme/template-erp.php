<?php
/**
 * Template Name: ERP Personalizado
 */
get_header(); ?>

<main class="site-main">

<!-- HERO -->
<section class="page-hero">
  <div class="container">
    <span class="hero-eyebrow">Producto</span>
    <h1>ERP Personalizado para el Éxito</h1>
    <p>Optimizá operaciones, mejorá la eficiencia y obtené información clave de tu negocio en tiempo real.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/registro')); ?>" class="btn btn-green btn-lg">Solicitar demo</a>
      <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-outline-white btn-lg">Más información</a>
    </div>
  </div>
</section>

<!-- FEATURES -->
<section class="section">
  <div class="container">
    <div class="section-header centered">
      <span class="section-label">Qué incluye</span>
      <h2 class="section-title">Un ERP diseñado para PyMEs argentinas</h2>
      <p class="section-subtitle">Sin el costo ni la complejidad de los sistemas corporativos. Todo lo que necesitás, nada de lo que no.</p>
    </div>
    <div class="grid-3">
      <?php
      $features = [
        ['⚡','Automatización de Procesos','Cotizaciones, órdenes de compra, facturación AFIP y recordatorios automáticos. Tu equipo hace más con menos tiempo.'],
        ['📊','Analíticas en Tiempo Real','Dashboards con métricas de ventas, stock, cobranza y rentabilidad. Tomá decisiones con datos, no con suposiciones.'],
        ['📈','Soluciones Escalables','Empezás con los módulos que necesitás hoy y agregás funcionalidades a medida que tu negocio crece.'],
        ['☁️','Basado en la Nube','Acceso desde cualquier dispositivo, en cualquier lugar. Sin instalaciones ni mantenimiento de servidores.'],
        ['🌍','Multilenguaje','Soporte completo en español con nomenclatura fiscal argentina: IVA, AFIP, CUIT, retenciones y más.'],
        ['🖥️','Paneles Personalizados','Cada rol ve lo que necesita. Vendedores, administración, logística y gerencia: dashboards a medida.'],
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
<section class="section" style="background:var(--g50)">
  <div class="container" style="max-width:760px">
    <div class="section-header centered">
      <span class="section-label">Preguntas frecuentes</span>
      <h2>Todo sobre el ERP de Clientum</h2>
    </div>
    <div class="faq-list">
      <?php
      $faqs = [
        ['¿Qué es un ERP y para qué sirve?','Un ERP (Enterprise Resource Planning) es un sistema que centraliza y automatiza los procesos clave de tu empresa: ventas, compras, stock, finanzas y facturación. Con Clientum, todo funciona en un solo lugar.'],
        ['¿Cómo se personaliza para mi empresa?','Después del onboarding, configuramos los módulos, categorías, usuarios y flujos según tus procesos. No necesitás saber programar.'],
        ['¿Qué soporte ofrecen?','Soporte en español por WhatsApp, email y videollamada. Tiempo de respuesta menor a 4 horas hábiles en todos los planes.'],
        ['¿Funciona con la facturación de AFIP?','Sí. Emitís facturas A, B y C con CAE directamente desde el ERP, sin salir del sistema ni usar el portal de AFIP.'],
        ['¿Puedo migrar mis datos actuales?','Sí. Te ayudamos a importar tus contactos, productos y datos históricos desde Excel, tu sistema anterior o cualquier CSV.'],
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

<!-- CTA -->
<section class="cta-section">
  <div class="container">
    <h2>Empezá a operar con un ERP en menos de una semana</h2>
    <p>Sin IT, sin contratos, sin costos en dólares. 14 días gratis.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/registro')); ?>" class="btn btn-green btn-lg">Solicitar demo gratuita</a>
      <a href="<?php echo esc_url(clientum_whatsapp()); ?>" target="_blank" rel="noopener" class="btn btn-outline-white btn-lg">💬 WhatsApp</a>
    </div>
  </div>
</section>

</main>

<?php get_footer(); ?>
