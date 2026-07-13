<?php
/*
 * Template Name: Contacto
 */
get_header(); ?>
<main class="site-main">

<div class="page-hero page-hero--simple">
  <div class="container text-center">
    <span class="hero-eyebrow">Contacto</span>
    <h1>Hablemos</h1>
    <p>Respondemos en menos de 24 horas hábiles. También podés escribirnos por WhatsApp.</p>
  </div>
</div>

<section class="section">
  <div class="container">
    <div style="display:grid;grid-template-columns:2fr 1fr;gap:56px;align-items:start">

      <!-- Form -->
      <div>
        <h2 style="margin-bottom:28px">Envianos un mensaje</h2>
        <form id="clientum-contact-form" novalidate>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="nombre">Nombre y apellido *</label>
              <input class="form-input" type="text" id="nombre" name="nombre" required placeholder="Juan García">
            </div>
            <div class="form-group">
              <label class="form-label" for="email">Email *</label>
              <input class="form-input" type="email" id="email" name="email" required placeholder="juan@empresa.com">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="empresa">Empresa</label>
              <input class="form-input" type="text" id="empresa" name="empresa" placeholder="Tu empresa S.A.">
            </div>
            <div class="form-group">
              <label class="form-label" for="rubro">Rubro</label>
              <select class="form-select" id="rubro" name="rubro">
                <option value="">Seleccioná tu rubro</option>
                <?php
                $rubros = ['Comercio / Retail','Distribución','Agro / Ganadería','Tecnología','Servicios profesionales','Salud','Construcción','Gastronomía','Educación','Otro'];
                foreach ($rubros as $r) echo '<option value="' . esc_attr($r) . '">' . esc_html($r) . '</option>';
                ?>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="mensaje">Mensaje *</label>
            <textarea class="form-textarea" id="mensaje" name="mensaje" required placeholder="Contanos en qué podemos ayudarte…"></textarea>
          </div>
          <button type="submit" class="btn btn-primary btn-lg" style="width:100%">Enviar mensaje</button>
          <div id="form-message" class="form-message"></div>
        </form>
      </div>

      <!-- Info -->
      <div>
        <h3 style="margin-bottom:24px">Contacto directo</h3>
        <div class="contact-info-list">
          <div class="contact-info-item">
            <div class="contact-info-icon">📧</div>
            <div class="contact-info-text">
              <strong>Email</strong>
              <a href="mailto:<?php echo esc_attr(clientum_email()); ?>"><?php echo esc_html(clientum_email()); ?></a>
              <p style="margin:4px 0 0;font-size:.8rem;color:var(--g400)">Respondemos en &lt; 24 horas hábiles</p>
            </div>
          </div>
          <div class="contact-info-item">
            <div class="contact-info-icon">📞</div>
            <div class="contact-info-text">
              <strong>Teléfono</strong>
              <a href="tel:+542984510883"><?php echo esc_html(clientum_phone()); ?></a>
            </div>
          </div>
          <div class="contact-info-item">
            <div class="contact-info-icon" style="background:var(--green)">💬</div>
            <div class="contact-info-text">
              <strong>WhatsApp</strong>
              <a href="<?php echo esc_url(clientum_whatsapp()); ?>" target="_blank" rel="noopener">Escribirnos ahora</a>
              <p style="margin:4px 0 0;font-size:.8rem;color:var(--g400)">Atención instantánea</p>
            </div>
          </div>
        </div>

        <div style="margin-top:32px;background:var(--g50);border-radius:10px;padding:24px;border:1px solid var(--g200)">
          <h4 style="margin-bottom:12px">🕒 Horario de atención</h4>
          <p style="font-size:.875rem;color:var(--g500)">Lunes a viernes de 9 a 18 hs (Argentina).<br>El bot de WhatsApp responde 24/7.</p>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- Newsletter -->
<section class="section section--sm" style="background:var(--g50)">
  <div class="container" style="max-width:600px;text-align:center">
    <span class="section-label">Newsletter</span>
    <h2 style="margin-bottom:8px">¿Querés estar al día?</h2>
    <p style="color:var(--g500);margin-bottom:20px">Recibí consejos de automatización, novedades y recursos gratuitos para tu PyME.</p>
    <?php echo do_shortcode('[aime_subscribe title="" description="" button_text="Suscribirme" show_name="1"]'); ?>
  </div>
</section>

</main>
<?php get_footer(); ?>
