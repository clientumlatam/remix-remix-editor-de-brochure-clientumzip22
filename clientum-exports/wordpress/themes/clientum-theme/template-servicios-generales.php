<?php
/**
 * Template Name: Servicios Generales
 */
get_header(); ?>

<main class="site-main">

<!-- HERO -->
<section class="page-hero">
  <div class="container">
    <span class="hero-eyebrow">Servicios</span>
    <h1>Impulsando el éxito de las PyMEs</h1>
    <p>Nuestra misión es proporcionar soluciones tecnológicas integrales que permitan a tu empresa crecer y destacar en un entorno digital en constante evolución.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/registro')); ?>" class="btn btn-green btn-lg">Probar gratis 14 días</a>
      <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-outline-white btn-lg">Ver todos los servicios</a>
    </div>
  </div>
</section>

<!-- SERVICIOS DESTACADOS -->
<section class="section">
  <div class="container">
    <div class="section-header centered">
      <span class="section-label">Todo en un lugar</span>
      <h2 class="section-title">Los servicios que tu PyME necesita</h2>
    </div>
    <div class="grid-3">
      <?php
      $services = [
        ['🛒','E-Commerce','Desarrollamos plataformas de comercio electrónico personalizadas para maximizar tus ventas en línea. Integradas con MercadoPago y facturación AFIP.'],
        ['📦','Gestión de Inventario','Control de stock en tiempo real, alertas de reposición y sincronización automática con tu tienda online y CRM.'],
        ['📱','Marketing Digital','Estrategias de marketing que impulsan tu visibilidad y retorno de inversión en el entorno digital argentino.'],
        ['🤖','CRM Inteligente','Pipeline visual de ventas, seguimiento de oportunidades y historial completo de cada cliente en un solo lugar.'],
        ['📊','Business Intelligence','Nuestras soluciones de analítica te dan los datos para tomar decisiones informadas y estratégicas. Medir es conocer.'],
        ['🔒','Ciberseguridad','Protegemos los datos de tu empresa y tus clientes con medidas de seguridad de nivel empresarial a precios de PyME.'],
      ];
      foreach ($services as $s): ?>
        <div class="feature-card">
          <div class="card-icon" style="background:var(--g100);font-size:1.5rem"><?php echo $s[0]; ?></div>
          <h3><?php echo esc_html($s[1]); ?></h3>
          <p><?php echo esc_html($s[2]); ?></p>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- VALORES -->
<section class="section--sm" style="background:var(--g50)">
  <div class="container">
    <div class="grid-3" style="text-align:center">
      <div class="card card--white">
        <div class="card-icon" style="margin:0 auto 16px;background:#dbeafe;font-size:1.5rem">🤝</div>
        <h3>Lealtad</h3>
        <p>Comprometidos con nuestros clientes. Trabajamos para brindarles el mejor servicio posible, siempre.</p>
      </div>
      <div class="card card--white">
        <div class="card-icon" style="margin:0 auto 16px;background:#dcfce7;font-size:1.5rem">🔧</div>
        <h3>Versatilidad</h3>
        <p>Soluciones personalizadas que se adaptan a las necesidades específicas de cada cliente y sector.</p>
      </div>
      <div class="card card--white">
        <div class="card-icon" style="margin:0 auto 16px;background:#ede9fe;font-size:1.5rem">✨</div>
        <h3>Innovación</h3>
        <p>Nuestra cultura empresarial se basa en la innovación, el compromiso y la dedicación al cliente.</p>
      </div>
    </div>
  </div>
</section>

<!-- TESTIMONIOS -->
<section class="section">
  <div class="container">
    <div class="section-header centered">
      <span class="section-label">Clientes</span>
      <h2>Lo que dicen nuestros clientes</h2>
    </div>
    <div class="testimonial-grid">
      <?php
      $testimonials = [
        ['JP','Juan Pérez','CEO — Empresa Industrial','Gracias a Clientum, nuestra empresa ha podido crecer y mejorar su presencia en línea significativamente. El CRM y la facturación AFIP son un cambio de juego.'],
        ['MG','María González','Directora de Marketing','Los servicios de Clientum son excepcionales. Siempre superan nuestras expectativas y el soporte en español hace toda la diferencia.'],
        ['CF','Carlos Fernández','Gerente General','Clientum transformó nuestra forma de trabajar, facilitando la comunicación, la gestión de proyectos y la atención al cliente.'],
      ];
      foreach ($testimonials as $t): ?>
        <div class="testimonial-card">
          <div class="stars">★★★★★</div>
          <blockquote>"<?php echo esc_html($t[3]); ?>"</blockquote>
          <div class="testimonial-author">
            <div class="testimonial-avatar"><?php echo esc_html($t[0]); ?></div>
            <div class="testimonial-info">
              <strong><?php echo esc_html($t[1]); ?></strong>
              <span><?php echo esc_html($t[2]); ?></span>
            </div>
          </div>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="cta-section">
  <div class="container">
    <h2>Colaboremos juntos</h2>
    <p>En Clientum, estamos listos para ayudarte a alcanzar tus metas. Contáctanos y descubrí cómo podemos trabajar juntos.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/registro')); ?>" class="btn btn-green btn-lg">Empezar gratis</a>
      <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-outline-white btn-lg">Contactar</a>
    </div>
  </div>
</section>

</main>

<?php get_footer(); ?>
