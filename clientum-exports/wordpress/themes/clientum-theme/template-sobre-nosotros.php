<?php
/*
 * Template Name: Sobre Nosotros
 */
get_header(); ?>
<main class="site-main">

<div class="page-hero">
  <div class="container text-center">
    <span class="hero-eyebrow">Sobre Nosotros</span>
    <h1>Tecnología real para PyMEs reales</h1>
    <p>Nacimos en la Patagonia para resolver los problemas de digitalización de las empresas argentinas. Sin tecnicismos, sin dólares, sin excusas.</p>
  </div>
</div>

<!-- Misión -->
<section class="section">
  <div class="container">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center">
      <div>
        <span class="section-label">Nuestra misión</span>
        <h2>Nivelar la cancha para las empresas argentinas</h2>
        <p style="color:var(--g500);margin-top:16px;line-height:1.8">Hace más de 12 años que acompañamos a PyMEs de todo el país en su transformación digital. Conocemos la realidad argentina: limitaciones de tiempo, presupuesto y equipo de IT. Por eso construimos una plataforma que no requiere conocimientos técnicos, funciona en pesos y tiene soporte humano en español.</p>
        <p style="color:var(--g500);line-height:1.8">Nacimos en General Roca, Río Negro, con el objetivo de acercar tecnología de vanguardia a empresas de todo el país, sin importar su tamaño ni su ubicación.</p>
      </div>
      <div>
        <div class="stats-grid" style="grid-template-columns:repeat(2,1fr)">
          <div class="stat-card"><div class="stat-number">1.750+</div><div class="stat-label">PyMEs activas en Argentina</div></div>
          <div class="stat-card"><div class="stat-number">12+</div><div class="stat-label">Años de experiencia</div></div>
          <div class="stat-card"><div class="stat-number">4.8/5</div><div class="stat-label">Satisfacción de clientes</div></div>
          <div class="stat-card"><div class="stat-number">100%</div><div class="stat-label">Desarrollo local</div></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Valores -->
<section class="section" style="background:var(--g50)">
  <div class="container">
    <div class="section-header centered">
      <h2>Nuestros valores</h2>
    </div>
    <div class="grid-4">
      <?php
      $values = [
        ['🎯','Foco en resultados','No medimos funcionalidades sino el impacto real en tu negocio.'],
        ['🤝','Cercanía local','Soporte humano en español, por personas que entienden tu realidad.'],
        ['✨','Simplicidad','Tecnología avanzada que cualquiera puede usar. Sin tecnicismos.'],
        ['🪟','Transparencia','Sin costos ocultos, sin letra chica, sin promesas que no podemos cumplir.'],
      ];
      foreach ($values as $v) {
        echo '<div class="card card--white text-center">
          <div style="font-size:2.5rem;margin-bottom:16px">' . $v[0] . '</div>
          <h3>' . esc_html($v[1]) . '</h3>
          <p>' . esc_html($v[2]) . '</p>
        </div>';
      }
      ?>
    </div>
  </div>
</section>

<!-- Timeline -->
<section class="section">
  <div class="container" style="max-width:880px">
    <div class="section-header centered">
      <h2>Nuestra historia</h2>
    </div>
    <div class="timeline">
      <?php
      $milestones = [
        ['2012','Fundación','Nacemos en General Roca, Río Negro, con el objetivo de acercar tecnología a las PyMEs argentinas.'],
        ['2015','Expansión nacional','Crecemos a todo el país y consolidamos el equipo de consultoría y soporte.'],
        ['2018','Academia Clientum','Lanzamos la Academia Clientum: capacitación gratuita y práctica para todos nuestros clientes.'],
        ['2021','1.000 clientes','Alcanzamos el hito de 1.000 clientes activos en toda Argentina.'],
        ['2023','Portal del Cliente','Sumamos el módulo de portal de autoservicio para los clientes de nuestras PyMEs.'],
        ['2024','Plataforma IA','Lanzamos el CRM con IA integrada, chatbot WhatsApp y asistente de ventas.'],
      ];
      foreach ($milestones as $i => $m) {
        $align = $i % 2 === 0 ? 'left' : 'right';
        echo '<div class="timeline-item timeline-item--' . $align . '">
          <div class="timeline-dot"></div>
          <div class="timeline-card">
            <span class="timeline-year">' . esc_html($m[0]) . '</span>
            <h3>' . esc_html($m[1]) . '</h3>
            <p>' . esc_html($m[2]) . '</p>
          </div>
        </div>';
      }
      ?>
    </div>
  </div>
</section>

<!-- Testimonial -->
<section class="section" style="background:var(--navy)">
  <div class="container text-center" style="max-width:700px">
    <div style="font-size:3rem;color:var(--green);margin-bottom:16px">"</div>
    <p style="font-size:1.25rem;color:white;line-height:1.7;font-style:italic;margin-bottom:24px">Implementamos Clientum en 5 días. El bot de WhatsApp nos generó 40% más de consultas en el primer mes sin contratar nadie.</p>
    <strong style="color:rgba(255,255,255,.7)">— Martín R., Distribuidora del Sur S.A.</strong>
  </div>
</section>

<section class="cta-section">
  <div class="container text-center">
    <h2>¿Querés ser parte?</h2>
    <p>Sumamos miles de PyMEs argentinas a la transformación digital. La tuya puede ser la próxima.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/register')); ?>" class="btn btn-green btn-lg">Probar gratis 14 días</a>
      <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-outline-white btn-lg">Hablar con el equipo</a>
    </div>
  </div>
</section>

</main>

<style>
.timeline { position: relative; }
.timeline::before { content:''; position:absolute; left:50%; top:0; bottom:0; width:2px; background:var(--g200); transform:translateX(-50%); }
.timeline-item { display:grid; grid-template-columns:1fr 40px 1fr; gap:0; align-items:start; margin-bottom:40px; }
.timeline-item--left .timeline-card  { grid-column:1; text-align:right; padding-right:28px; }
.timeline-item--left .timeline-dot   { grid-column:2; }
.timeline-item--right .timeline-card { grid-column:3; padding-left:28px; }
.timeline-item--right .timeline-dot  { grid-column:2; }
.timeline-dot { width:16px;height:16px;border-radius:50%;background:var(--navy);border:3px solid white;box-shadow:0 0 0 2px var(--navy);margin-top:6px;justify-self:center; }
.timeline-year { display:inline-block;background:var(--navy);color:white;font-size:.75rem;font-weight:700;padding:3px 10px;border-radius:100px;margin-bottom:8px; }
.timeline-card h3 { margin-bottom:6px; }
.timeline-card p  { font-size:.875rem;color:var(--g500); }
@media(max-width:640px){
  .timeline::before { left:20px; }
  .timeline-item { grid-template-columns:40px 1fr; }
  .timeline-item--left .timeline-card  { grid-column:2;text-align:left;padding-right:0;padding-left:16px; }
  .timeline-item--left .timeline-dot   { grid-column:1; }
  .timeline-item--right .timeline-card { grid-column:2;padding-left:16px; }
  .timeline-item--right .timeline-dot  { grid-column:1; }
}
</style>

<?php get_footer(); ?>
