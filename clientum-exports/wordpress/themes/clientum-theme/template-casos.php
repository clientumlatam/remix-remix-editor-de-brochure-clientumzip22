<?php /* Template Name: Casos de Éxito */ get_header(); ?>
<main class="site-main">

<div class="page-hero page-hero--simple">
  <div class="container text-center">
    <span class="hero-eyebrow">Casos de Éxito</span>
    <h1>PyMEs argentinas que ya midieron el impacto</h1>
    <p>Resultados reales de empresas que implementaron Clientum y cambiaron su forma de trabajar.</p>
  </div>
</div>

<section class="section">
  <div class="container">
    <?php
    $cases = [
      [
        'Distribuidora del Sur S.A.', 'Distribución · General Roca, Río Negro', 'var(--navy)',
        ['+30% eficiencia operativa','-60% errores de facturación','100% trazabilidad de pedidos'],
        'Procesos manuales de pedidos con alta tasa de errores. Facturación desconectada del CRM que generaba doble carga de datos. Sin visibilidad del estado de cada cliente.',
        'Automatización del canal WhatsApp para recepción de pedidos. Integración con AFIP para facturación directa desde el CRM. Panel centralizado para el equipo comercial con acceso en tiempo real.',
        '"Clientum transformó nuestra operación. Lo que antes llevaba medio día ahora se hace solo."','Martín R.','Gerente Comercial',
      ],
      [
        'Agro San Luis', 'Agroindustria · San Luis', '#15803d',
        ['+25% productividad','-40% tiempo en reportes','100% digital'],
        'Datos dispersos en planillas de Excel. Sin visibilidad de márgenes por cultivo ni lote. Reportes manuales que consumían horas del equipo.',
        'Dashboard integrado con datos de producción y trazabilidad de lotes. Reportes automáticos de rentabilidad por campaña agrícola. CRM para gestión de proveedores y clientes.',
        '"Los reportes ahora se generan solos. Ahorramos horas por semana."','Carolina S.','Administradora',
      ],
      [
        'Tech Retail BA', 'Comercio electrónico · Buenos Aires', 'var(--purple)',
        ['+40% ventas online','-50% tiempo por venta','3× consultas por asesor'],
        'Alto volumen de consultas por WhatsApp sin sistema de gestión. Ventas perdidas por demoras en respuesta. El equipo no daba abasto.',
        'Chatbot de WhatsApp + CRM omnicanal para atención unificada. Asistente IA para respuestas personalizadas. Automatización de seguimiento post-consulta.',
        '"El bot responde solo y solo escalan al equipo las consultas que realmente lo necesitan."','Daniel M.','Director de Ventas',
      ],
    ];
    foreach ($cases as $case):
    ?>
    <div class="case-card" style="border-left-color:<?php echo $case[2]; ?>;margin-bottom:32px">
      <div style="display:grid;grid-template-columns:1fr auto;gap:16px;align-items:start;margin-bottom:20px">
        <div>
          <div class="case-company" style="color:<?php echo $case[2]; ?>"><?php echo esc_html($case[0]); ?></div>
          <div class="case-industry"><?php echo esc_html($case[1]); ?></div>
        </div>
      </div>
      <div class="case-kpis">
        <?php foreach($case[3] as $kpi): ?>
        <span class="case-kpi" style="background:<?php echo $case[2]; ?>"><?php echo esc_html($kpi); ?></span>
        <?php endforeach; ?>
      </div>
      <div class="case-cols">
        <div>
          <div class="case-col-label">Desafío</div>
          <p><?php echo esc_html($case[4]); ?></p>
        </div>
        <div>
          <div class="case-col-label">Solución</div>
          <p><?php echo esc_html($case[5]); ?></p>
        </div>
      </div>
      <div style="margin-top:20px;padding-top:20px;border-top:1px solid var(--g200);display:flex;gap:16px;align-items:center">
        <div style="width:44px;height:44px;border-radius:50%;background:<?php echo $case[2]; ?>;display:flex;align-items:center;justify-content:center;color:white;font-weight:800;flex-shrink:0">
          <?php echo mb_substr($case[7], 0, 1); ?>
        </div>
        <div>
          <p style="font-style:italic;color:var(--g700);font-size:.9375rem;margin-bottom:4px"><?php echo esc_html($case[6]); ?></p>
          <strong style="font-size:.875rem"><?php echo esc_html($case[7]); ?></strong>
          <span style="font-size:.8rem;color:var(--g400)"> · <?php echo esc_html($case[8]); ?></span>
        </div>
      </div>
    </div>
    <?php endforeach; ?>
  </div>
</section>

<section class="cta-section">
  <div class="container text-center">
    <h2>Tu empresa puede ser el próximo caso de éxito</h2>
    <p>14 días gratis. Sin compromiso.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/register')); ?>" class="btn btn-green btn-lg">Probar gratis</a>
      <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-outline-white btn-lg">Hablar con ventas</a>
    </div>
  </div>
</section>
</main>
<?php get_footer(); ?>
