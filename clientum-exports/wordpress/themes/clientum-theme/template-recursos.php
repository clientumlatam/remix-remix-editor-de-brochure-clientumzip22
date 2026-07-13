<?php
/*
 * Template Name: Recursos
 */
get_header(); ?>
<main class="site-main">

<div class="page-hero page-hero--simple">
  <div class="container text-center">
    <span class="hero-eyebrow">Centro de Recursos</span>
    <h1>Todo lo que necesitás para empezar rápido</h1>
    <p>Materiales gratuitos para digitalizar tu PyME desde el primer día. Sin registro requerido.</p>
  </div>
</div>

<!-- Types -->
<section class="section section--sm" style="background:var(--g50)">
  <div class="container">
    <div class="grid-3">
      <?php
      $types = [
        ['📄','Guías y PDFs','Documentación paso a paso para configurar cada módulo de Clientum.','4 guías disponibles'],
        ['🎬','Videos y Webinars','Demos en vivo, webinars grabados y tutoriales cortos para aprender haciendo.','3 videos disponibles'],
        ['📋','Plantillas y Kits','Mensajes de WhatsApp, plantillas de pipeline y checklists listos para usar.','2 kits disponibles'],
      ];
      foreach ($types as $t) {
        echo '<div class="card card--white text-center">
          <div style="font-size:2.5rem;margin-bottom:12px">' . $t[0] . '</div>
          <h3>' . esc_html($t[1]) . '</h3>
          <p>' . esc_html($t[2]) . '</p>
          <small style="color:var(--navy);font-weight:600">' . esc_html($t[3]) . '</small>
        </div>';
      }
      ?>
    </div>
  </div>
</section>

<!-- Resources grid -->
<section class="section" id="recursos">
  <div class="container">
    <div class="section-header">
      <h2>Recursos disponibles</h2>
      <p class="section-subtitle">Descargalos sin costo. Sin formularios complicados.</p>
    </div>
    <div class="resource-grid">
      <?php
      $resources = [
        ['📄','Guía PDF','Guía de configuración del Chatbot de WhatsApp','Configurá tu bot desde cero: flujos, respuestas automáticas y derivación a asesores.'],
        ['📄','Guía PDF','Checklist de preparación para el CRM','Todo lo que tenés que tener listo antes de importar tus contactos a Clientum.'],
        ['💬','Kit','Kit de mensajes para WhatsApp Business','50+ mensajes de bienvenida, seguimiento y cierre listos para copiar y pegar.'],
        ['🎬','Video','Webinar: Automatización con IA para PyMEs','60 minutos de demo en vivo. Casos reales de automatización con resultados medibles.'],
        ['📊','Informe','Informe: WhatsApp y CRM para PyMEs 2026','Estadísticas del mercado argentino y tendencias de digitalización de PyMEs.'],
        ['📄','Guía PDF','Guía avanzada de automatización de flujos','Armá flujos de seguimiento automático para no perder ninguna oportunidad de venta.'],
        ['📋','Plantilla','Plantilla de pipeline de ventas para PyMEs','Un pipeline estructurado en 6 etapas, listo para importar a Clientum.'],
        ['🎬','Video','Demo del Asistente IA en acción','Cómo hablarle a tu CRM en castellano y obtener insights de ventas al instante.'],
        ['📄','Guía PDF','Guía de facturación AFIP con Clientum','Configuración paso a paso para emitir facturas con CAE desde el CRM.'],
      ];
      foreach ($resources as $r) {
        echo '<div class="resource-card">
          <span class="resource-type">' . $r[0] . ' ' . esc_html($r[1]) . '</span>
          <h4>' . esc_html($r[2]) . '</h4>
          <p>' . esc_html($r[3]) . '</p>
          <a href="' . esc_url(home_url('/contacto')) . '" class="btn btn-outline btn-sm">Descargar gratis</a>
        </div>';
      }
      ?>
    </div>
  </div>
</section>

<!-- Newsletter -->
<section class="section section--sm" style="background:var(--navy)">
  <div class="container text-center" style="max-width:600px">
    <h2 style="color:white">Recibí recursos nuevos cada mes</h2>
    <p style="color:rgba(255,255,255,.7);margin-bottom:28px">Guías, webinars y plantillas exclusivas para suscriptores.</p>
    <?php echo do_shortcode('[aime_subscribe title="" description="" button_text="Suscribirme gratis" show_name="0"]'); ?>
    <p style="font-size:.75rem;color:rgba(255,255,255,.4);margin-top:12px">Sin spam. Cancelás cuando quieras.</p>
  </div>
</section>

</main>
<?php get_footer(); ?>
