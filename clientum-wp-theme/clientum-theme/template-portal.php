<?php /* Template Name: Portal del Cliente */ get_header(); ?>
<main class="site-main">

<div class="page-hero">
  <div class="container text-center">
    <span class="hero-eyebrow">Funciones · Portal del Cliente</span>
    <h1>Tus clientes<br>se autoatienden</h1>
    <p>Portal de autoservicio con tu marca donde tus clientes ven facturas, pedidos y documentos sin tener que llamarte.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/register')); ?>" class="btn btn-primary btn-lg">Probar gratis</a>
    </div>
  </div>
</div>

<section class="section">
  <div class="container">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center">
      <div>
        <h2>Un portal que tiene tu marca, no la nuestra</h2>
        <p style="color:var(--g500);margin-top:16px;line-height:1.8">Tus clientes acceden a un portal con tu logo, tus colores y tu dominio. Ven todo lo que necesitan sin tener que llamarte ni mandarte WhatsApp.</p>
        <ul style="margin-top:24px;list-style:none">
          <?php foreach(['Facturas y cotizaciones descargables','Estado de pedidos en tiempo real','Documentos y contratos firmados','Comunicación directa desde el portal','Historial completo de la relación comercial','Funciona en celular sin instalar nada'] as $b): ?>
          <li style="display:flex;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid var(--g200);font-size:.9375rem;color:var(--g700)">
            <span style="width:20px;height:20px;border-radius:50%;background:var(--cyan);color:white;font-size:.6rem;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0">✓</span>
            <?php echo esc_html($b); ?>
          </li>
          <?php endforeach; ?>
        </ul>
      </div>
      <div style="background:var(--g50);border-radius:16px;padding:28px;border:1px solid var(--g200)">
        <div style="background:var(--navy);border-radius:10px 10px 0 0;padding:14px 18px;display:flex;align-items:center;justify-content:space-between">
          <span style="color:white;font-weight:700;font-size:.9rem">Portal — Tu empresa</span>
          <span style="background:var(--green);color:white;font-size:.7rem;font-weight:700;padding:3px 10px;border-radius:100px">Activo</span>
        </div>
        <div style="background:white;border-radius:0 0 10px 10px;padding:20px">
          <?php foreach([['📄','Mis Facturas','3 pendientes'],['📦','Mis Pedidos','1 en camino'],['📋','Mis Contratos','Todos al día'],['💬','Contactar','Respuesta en &lt;24h']] as $item): ?>
          <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-radius:8px;background:var(--g50);border:1px solid var(--g200);margin-bottom:8px">
            <span style="font-size:.875rem;color:var(--g700)"><?php echo $item[0] . ' ' . esc_html($item[1]); ?></span>
            <span style="font-size:.75rem;color:var(--navy);font-weight:600"><?php echo $item[2]; ?></span>
          </div>
          <?php endforeach; ?>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section" style="background:var(--g50)">
  <div class="container">
    <div class="section-header centered"><h2>Beneficios para tu negocio</h2></div>
    <div class="grid-3">
      <?php foreach([
        ['📞','Menos consultas entrantes','Tus clientes encuentran solos lo que necesitan, sin tener que llamarte.'],
        ['🏆','Mayor percepción de profesionalismo','Un portal propio te posiciona como una empresa seria y organizada.'],
        ['⏱️','Ahorro de tiempo del equipo','Menos tiempo respondiendo preguntas repetitivas = más tiempo para vender.'],
      ] as $b): ?>
      <div class="card card--white text-center">
        <div style="font-size:2.5rem;margin-bottom:12px"><?php echo $b[0]; ?></div>
        <h3><?php echo esc_html($b[1]); ?></h3>
        <p><?php echo esc_html($b[2]); ?></p>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section class="cta-section">
  <div class="container text-center">
    <h2>Activá el Portal del Cliente</h2>
    <p>Incluido en el plan Pro. Configuración en menos de un día.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/register')); ?>" class="btn btn-green btn-lg">Probar gratis 14 días</a>
    </div>
  </div>
</section>
</main>
<?php get_footer(); ?>
