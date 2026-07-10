<?php get_header(); ?>

<?php if (have_posts()): while (have_posts()): the_post();
    $icon     = get_post_meta(get_the_ID(), '_service_icon', true) ?: '⚡';
    $price    = get_post_meta(get_the_ID(), '_service_price', true);
    $monthly  = get_post_meta(get_the_ID(), '_service_monthly', true);
    $bullets  = get_post_meta(get_the_ID(), '_service_bullets', true);
    $faq_raw  = get_post_meta(get_the_ID(), '_service_faqs', true);
    $gallery  = get_post_meta(get_the_ID(), '_service_gallery', true); // comma-separated attachment IDs
    $delivery = get_post_meta(get_the_ID(), '_service_delivery', true) ?: '5 días hábiles';
    $wa       = clientum_opt('clientum_whatsapp', '5492984510883');
    $wa_msg   = urlencode('Hola, quiero cotizar el servicio: ' . get_the_title());
    $bullet_list = $bullets ? array_filter(explode("\n", $bullets)) : [];
    $gallery_ids = $gallery ? array_filter(explode(',', $gallery)) : [];
    $faqs = $faq_raw ? json_decode($faq_raw, true) : [];
?>

<!-- ── HERO / SERVICE BANNER ─────────────────────────────────────────────────── -->
<section class="relative bg-slate-900 text-white py-20 px-6 overflow-hidden">
  <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#0d1f3c] via-slate-900 to-[#122442]"></div>
  <div class="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
  <div class="max-w-6xl mx-auto relative z-10">
    <!-- Breadcrumbs -->
    <nav class="text-xs text-slate-400 mb-8 flex items-center gap-2 flex-wrap">
      <a href="<?php echo home_url('/'); ?>" class="hover:text-emerald-400 transition-colors">Inicio</a>
      <span class="text-slate-700">/</span>
      <a href="<?php echo home_url('/#servicios'); ?>" class="hover:text-emerald-400 transition-colors">Servicios</a>
      <span class="text-slate-700">/</span>
      <span class="text-slate-400"><?php the_title(); ?></span>
    </nav>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      <!-- Left: Service Info -->
      <div class="lg:col-span-7">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-3xl shrink-0">
            <?php echo esc_html($icon); ?>
          </div>
          <div>
            <span class="text-emerald-400 text-[10px] font-black uppercase tracking-widest font-mono">Servicio Clientum</span>
            <h1 class="text-2xl md:text-3xl font-black text-white leading-tight mt-0.5"><?php the_title(); ?></h1>
          </div>
        </div>

        <p class="text-slate-300 text-sm leading-relaxed mb-8 max-w-xl">
          <?php echo esc_html(get_the_excerpt() ?: get_bloginfo('description')); ?>
        </p>

        <?php if (!empty($bullet_list)): ?>
          <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8">
            <?php foreach ($bullet_list as $b): if (!trim($b)) continue; ?>
              <li class="flex items-center gap-2.5 text-sm text-slate-300">
                <span class="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs shrink-0 font-black">✓</span>
                <?php echo esc_html(trim($b)); ?>
              </li>
            <?php endforeach; ?>
          </ul>
        <?php endif; ?>

        <div class="flex flex-wrap gap-4">
          <a href="#cotizar"
             class="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase px-6 py-3.5 rounded-xl tracking-wider transition-all shadow-lg shadow-emerald-900/30">
            Solicitar Cotización
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
          </a>
          <a href="https://wa.me/<?php echo esc_attr($wa); ?>?text=<?php echo $wa_msg; ?>"
             target="_blank" rel="noopener"
             class="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase px-6 py-3.5 rounded-xl border border-white/15 tracking-wider transition-all">
            <svg class="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Consultar por WhatsApp
          </a>
        </div>
      </div>

      <!-- Right: Price + delivery card -->
      <div class="lg:col-span-5">
        <div class="bg-slate-950/70 border border-slate-700 rounded-2xl p-7 backdrop-blur-sm">
          <?php if ($price): ?>
            <div class="mb-5 pb-5 border-b border-slate-800">
              <div class="text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-1">Precio</div>
              <div class="flex items-baseline gap-1">
                <span class="text-4xl font-black text-white">$<?php echo esc_html(number_format((float)$price, 0, ',', '.')); ?></span>
                <span class="text-slate-400 text-sm"><?php echo $monthly ? ' / mes' : ' pago único'; ?></span>
              </div>
              <p class="text-slate-500 text-[11px] mt-1">IVA según condición fiscal. Sin contrato mínimo.</p>
            </div>
          <?php endif; ?>

          <div class="space-y-4 mb-6">
            <div class="flex items-center gap-3">
              <span class="text-lg">⚡</span>
              <div>
                <div class="text-white text-xs font-bold">Implementación rápida</div>
                <div class="text-slate-400 text-[11px]"><?php echo esc_html($delivery); ?></div>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-lg">🇦🇷</span>
              <div>
                <div class="text-white text-xs font-bold">Soporte en español 24/7</div>
                <div class="text-slate-400 text-[11px]">Atención por WhatsApp, email y teléfono</div>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-lg">📄</span>
              <div>
                <div class="text-white text-xs font-bold">Facturación oficial</div>
                <div class="text-slate-400 text-[11px]">Facturas A / B con CAE de AFIP</div>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-lg">🔄</span>
              <div>
                <div class="text-white text-xs font-bold">Sin permanencia mínima</div>
                <div class="text-slate-400 text-[11px]">Cancelá cuando quieras, sin cargos ocultos</div>
              </div>
            </div>
          </div>

          <a href="#cotizar"
             class="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all">
            Quiero este servicio →
          </a>
          <a href="https://wa.me/<?php echo esc_attr($wa); ?>?text=<?php echo $wa_msg; ?>"
             target="_blank" rel="noopener"
             class="mt-3 w-full flex items-center justify-center gap-2 border border-slate-700 hover:border-emerald-500/50 text-slate-300 hover:text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all">
            <svg class="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Consultar antes de contratar
          </a>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ── SERVICE CONTENT / DESCRIPTION ────────────────────────────────────────── -->
<?php if (get_the_content()): ?>
<section class="bg-white py-16 px-6">
  <div class="max-w-4xl mx-auto">
    <div class="wp-content prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed">
      <?php the_content(); ?>
    </div>
  </div>
</section>
<?php endif; ?>

<!-- ── GALLERY ────────────────────────────────────────────────────────────────── -->
<?php if (!empty($gallery_ids)): ?>
<section class="bg-slate-50 py-16 px-6">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-10">
      <span class="text-[#1A3461] text-[10px] font-black uppercase tracking-widest font-mono">Galería</span>
      <h2 class="text-2xl font-black text-slate-900 mt-2">Capturas y ejemplos del servicio</h2>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="service-gallery">
      <?php foreach ($gallery_ids as $att_id): $att_id = (int)trim($att_id);
        $img_url = wp_get_attachment_image_url($att_id, 'large');
        $img_full = wp_get_attachment_image_url($att_id, 'full');
        $alt = get_post_meta($att_id, '_wp_attachment_image_alt', true) ?: get_the_title();
        if (!$img_url) continue; ?>
        <a href="<?php echo esc_url($img_full); ?>" class="gallery-thumb group relative overflow-hidden rounded-2xl border border-slate-200 block cursor-zoom-in"
           data-src="<?php echo esc_url($img_full); ?>" data-alt="<?php echo esc_attr($alt); ?>">
          <img src="<?php echo esc_url($img_url); ?>" alt="<?php echo esc_attr($alt); ?>"
               class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500">
          <div class="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/30 transition-all flex items-center justify-center">
            <svg class="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/>
            </svg>
          </div>
        </a>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- Lightbox -->
<div id="lightbox" class="hidden fixed inset-0 z-[100] bg-slate-950/95 flex items-center justify-center p-4">
  <button id="lightbox-close" class="absolute top-4 right-4 text-white p-2 hover:text-emerald-400 transition-colors" aria-label="Cerrar">
    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
  </button>
  <button id="lightbox-prev" class="absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 hover:text-emerald-400 transition-colors">
    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
  </button>
  <button id="lightbox-next" class="absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 hover:text-emerald-400 transition-colors">
    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
  </button>
  <img id="lightbox-img" src="" alt="" class="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain">
  <p id="lightbox-alt" class="absolute bottom-6 left-1/2 -translate-x-1/2 text-slate-400 text-xs"></p>
</div>
<?php endif; ?>

<!-- ── HOW IT WORKS (service-specific) ──────────────────────────────────────── -->
<section class="bg-white py-16 px-6">
  <div class="max-w-5xl mx-auto">
    <div class="text-center mb-12">
      <span class="text-[#1A3461] text-[10px] font-black uppercase tracking-widest font-mono">Proceso</span>
      <h2 class="text-2xl md:text-3xl font-black text-slate-900 mt-2">Cómo implementamos <?php the_title(); ?></h2>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
      <?php
      $steps = [
        ['num' => '01', 'title' => 'Consulta inicial', 'desc' => 'Nos reunimos para entender tu negocio, tus objetivos y las necesidades específicas de este servicio.'],
        ['num' => '02', 'title' => 'Propuesta a medida', 'desc' => 'Elaboramos un plan detallado con alcance, plazos y costos transparentes. Sin letra chica.'],
        ['num' => '03', 'title' => 'Implementación', 'desc' => 'Nuestro equipo técnico configura e integra el servicio en tu operación. Vos seguís vendiendo.'],
        ['num' => '04', 'title' => 'Soporte & mejora', 'desc' => 'Acompañamiento continuo, métricas y optimizaciones para que el servicio siempre rinda al máximo.'],
      ];
      foreach ($steps as $s): ?>
        <div class="flex flex-col items-center text-center group">
          <div class="w-12 h-12 rounded-2xl bg-[#1A3461] text-white font-black text-sm flex items-center justify-center mb-4 group-hover:bg-emerald-500 transition-colors">
            <?php echo esc_html($s['num']); ?>
          </div>
          <h3 class="font-black text-slate-900 text-sm mb-2"><?php echo esc_html($s['title']); ?></h3>
          <p class="text-slate-500 text-xs leading-relaxed"><?php echo esc_html($s['desc']); ?></p>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- ── SERVICE-SPECIFIC FAQs ─────────────────────────────────────────────────── -->
<?php if (!empty($faqs)): ?>
<section class="bg-slate-50 py-16 px-6">
  <div class="max-w-3xl mx-auto">
    <div class="text-center mb-10">
      <span class="text-[#1A3461] text-[10px] font-black uppercase tracking-widest font-mono">Preguntas frecuentes</span>
      <h2 class="text-2xl font-black text-slate-900 mt-2">Dudas sobre <?php the_title(); ?></h2>
    </div>
    <div class="space-y-3" id="service-faq-accordion">
      <?php foreach ($faqs as $i => $faq): ?>
        <div class="border border-slate-200 rounded-2xl overflow-hidden bg-white">
          <button class="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50 transition-colors faq-toggle" aria-expanded="false">
            <span class="font-bold text-slate-900 text-sm"><?php echo esc_html($faq['q'] ?? ''); ?></span>
            <svg class="w-4 h-4 text-slate-400 shrink-0 faq-icon transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div class="faq-content hidden px-5 pb-5">
            <p class="text-slate-500 text-sm leading-relaxed"><?php echo esc_html($faq['a'] ?? ''); ?></p>
          </div>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>
<?php endif; ?>

<!-- ── RELATED SERVICES ───────────────────────────────────────────────────────── -->
<?php
$related = new WP_Query([
    'post_type'      => 'clientum_service',
    'posts_per_page' => 3,
    'post__not_in'   => [get_the_ID()],
    'orderby'        => 'rand',
    'post_status'    => 'publish',
]);
if ($related->have_posts()): ?>
  <section class="bg-white py-16 px-6">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-10">
        <span class="text-[#1A3461] text-[10px] font-black uppercase tracking-widest font-mono">También te puede interesar</span>
        <h2 class="text-2xl font-black text-slate-900 mt-2">Otros servicios de Clientum</h2>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <?php while ($related->have_posts()): $related->the_post();
          $r_icon  = get_post_meta(get_the_ID(), '_service_icon', true) ?: '⚡';
          $r_price = get_post_meta(get_the_ID(), '_service_price', true);
        ?>
          <a href="<?php the_permalink(); ?>" class="group bg-white border border-slate-200 hover:border-[#1A3461]/40 hover:shadow-md rounded-2xl p-6 transition-all block">
            <div class="text-2xl mb-3"><?php echo esc_html($r_icon); ?></div>
            <h3 class="font-black text-slate-900 text-sm mb-2 group-hover:text-[#1A3461] transition-colors"><?php the_title(); ?></h3>
            <p class="text-slate-500 text-xs leading-relaxed mb-4"><?php echo wp_trim_words(get_the_excerpt(), 12); ?></p>
            <?php if ($r_price): ?>
              <span class="text-[#1A3461] font-black text-sm">desde $<?php echo esc_html(number_format((float)$r_price, 0, ',', '.')); ?></span>
            <?php endif; ?>
          </a>
        <?php endwhile; wp_reset_postdata(); ?>
      </div>
    </div>
  </section>
<?php endif; ?>

<!-- ── QUOTE FORM ─────────────────────────────────────────────────────────────── -->
<section id="cotizar" class="bg-slate-50 py-20 px-6 scroll-mt-20">
  <div class="max-w-5xl mx-auto">
    <div class="text-center mb-12">
      <span class="text-[#1A3461] text-[10px] font-black uppercase tracking-widest font-mono">Cotización</span>
      <h2 class="text-2xl md:text-3xl font-black text-slate-900 mt-2">Solicitá tu presupuesto para</h2>
      <h3 class="text-xl font-black text-emerald-600 mt-1"><?php the_title(); ?></h3>
      <p class="text-slate-500 text-sm mt-3">Completá el formulario y te enviamos una propuesta detallada en menos de 24 horas. Sin compromiso.</p>
    </div>

    <div class="grid md:grid-cols-5 gap-10 items-start">
      <!-- Form -->
      <div class="md:col-span-3">
        <form id="service-quote-form" class="bg-white border border-slate-200 rounded-2xl p-8 space-y-4 shadow-sm">
          <?php wp_nonce_field('clientum_nonce', 'clientum_quote_nonce'); ?>
          <input type="hidden" name="servicio" value="<?php the_title_attribute(); ?>">

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Nombre y apellido *</label>
              <input type="text" name="nombre" required placeholder="Ej. Martín López"
                class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#1A3461] focus:outline-none transition-colors">
            </div>
            <div>
              <label class="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Email *</label>
              <input type="email" name="email" required placeholder="tu@empresa.com"
                class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#1A3461] focus:outline-none transition-colors">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Empresa</label>
              <input type="text" name="empresa" placeholder="Nombre de tu empresa"
                class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#1A3461] focus:outline-none transition-colors">
            </div>
            <div>
              <label class="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Teléfono / WhatsApp</label>
              <input type="tel" name="telefono" placeholder="+54 9 298 ..."
                class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#1A3461] focus:outline-none transition-colors">
            </div>
          </div>

          <div>
            <label class="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">¿Cuántos usuarios / locales tiene tu empresa?</label>
            <select name="escala" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#1A3461] focus:outline-none transition-colors">
              <option value="micro">1–5 personas (micro)</option>
              <option value="pequena">6–20 personas (pequeña)</option>
              <option value="mediana">21–100 personas (mediana)</option>
              <option value="grande">+100 personas (grande)</option>
            </select>
          </div>

          <div>
            <label class="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">¿Qué necesitás exactamente?</label>
            <textarea name="mensaje" rows="4" placeholder="Describí brevemente tu necesidad u objetivo con este servicio..."
              class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#1A3461] focus:outline-none transition-colors resize-none"></textarea>
          </div>

          <div class="flex items-start gap-3">
            <input type="checkbox" name="newsletter" id="quote_nl" checked class="mt-0.5 rounded border-slate-300 text-[#1A3461]">
            <label for="quote_nl" class="text-xs text-slate-500 cursor-pointer">Suscribirme al newsletter de Clientum (tips de CRM, automatización y ventas)</label>
          </div>

          <div id="quote-form-error"   class="hidden text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3"></div>
          <div id="quote-form-success" class="hidden text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            ✓ ¡Listo! Recibimos tu consulta. Te enviamos la propuesta en menos de 24 horas.
          </div>

          <button type="submit" id="quote-form-btn"
            class="w-full bg-[#1A3461] hover:bg-[#0d1f3c] text-white font-black py-4 rounded-xl text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md">
            Enviar solicitud de cotización
            <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
          </button>
        </form>
      </div>

      <!-- Sidebar: Trust signals -->
      <div class="md:col-span-2 space-y-4">
        <!-- Guarantee card -->
        <div class="bg-[#0d1f3c] text-white rounded-2xl p-6 border border-slate-700">
          <div class="text-3xl mb-3">🛡️</div>
          <h4 class="font-black text-base mb-2">Garantía Clientum</h4>
          <p class="text-slate-300 text-xs leading-relaxed">
            Si en los primeros 30 días no estás conforme con la implementación, te devolvemos el 100% de lo invertido. Sin preguntas.
          </p>
        </div>

        <!-- Response time -->
        <div class="bg-white border border-slate-200 rounded-2xl p-5">
          <div class="flex items-center gap-3 mb-2">
            <span class="text-2xl">⏱️</span>
            <h4 class="font-black text-slate-900 text-sm">Respuesta en menos de 24 hs</h4>
          </div>
          <p class="text-slate-500 text-xs">Días hábiles. Los fines de semana respondemos por WhatsApp.</p>
        </div>

        <!-- Direct WhatsApp CTA -->
        <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
          <h4 class="font-black text-slate-900 text-sm mb-2">¿Preferís hablar directamente?</h4>
          <p class="text-slate-500 text-xs mb-3">Un consultor de Clientum te atiende por WhatsApp ahora mismo.</p>
          <a href="https://wa.me/<?php echo esc_attr($wa); ?>?text=<?php echo $wa_msg; ?>"
             target="_blank" rel="noopener"
             class="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase py-3 px-4 rounded-xl tracking-wider transition-all">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Abrir WhatsApp ahora
          </a>
        </div>

        <!-- Mini stats -->
        <div class="grid grid-cols-2 gap-3">
          <?php foreach ([['val' => '+500', 'label' => 'Clientes'], ['val' => '5 días', 'label' => 'Implementación'], ['val' => '24/7', 'label' => 'Soporte'], ['val' => '100%', 'label' => 'Satisfacción']] as $st): ?>
            <div class="bg-white border border-slate-200 rounded-xl p-4 text-center">
              <div class="font-black text-[#1A3461] text-base"><?php echo esc_html($st['val']); ?></div>
              <div class="text-slate-500 text-[10px] mt-0.5"><?php echo esc_html($st['label']); ?></div>
            </div>
          <?php endforeach; ?>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ── FINAL CTA ───────────────────────────────────────────────────────────────── -->
<section class="bg-[#0d1f3c] py-16 px-6">
  <div class="max-w-4xl mx-auto text-center">
    <h2 class="text-2xl md:text-3xl font-black text-white mb-4">¿Listo para implementar <?php the_title(); ?>?</h2>
    <p class="text-slate-400 text-sm mb-8 max-w-2xl mx-auto">Más de 500 PyMEs ya transformaron su negocio con Clientum. Hoy podés ser una más.</p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="#cotizar"
         class="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black px-8 py-4 rounded-2xl text-sm uppercase tracking-wider transition-all">
        Quiero empezar ahora →
      </a>
      <a href="<?php echo home_url('/#servicios'); ?>"
         class="inline-flex items-center justify-center gap-2 border border-slate-700 hover:border-slate-500 text-slate-300 font-bold px-8 py-4 rounded-2xl text-sm uppercase tracking-wider transition-all">
        ← Ver todos los servicios
      </a>
    </div>
  </div>
</section>

<?php endwhile; endif; ?>

<!-- Lightbox JS -->
<?php if (!empty($gallery_ids)): ?>
<script>
(function() {
  const thumbs   = Array.from(document.querySelectorAll('.gallery-thumb'));
  const lightbox = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lightbox-img');
  const lbAlt    = document.getElementById('lightbox-alt');
  let current    = 0;

  function openLightbox(index) {
    current = index;
    lbImg.src     = thumbs[index].dataset.src;
    lbAlt.textContent = thumbs[index].dataset.alt;
    lightbox.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.add('hidden');
    document.body.style.overflow = '';
  }

  thumbs.forEach((t, i) => t.addEventListener('click', e => { e.preventDefault(); openLightbox(i); }));
  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  document.getElementById('lightbox-prev').addEventListener('click', () => openLightbox((current - 1 + thumbs.length) % thumbs.length));
  document.getElementById('lightbox-next').addEventListener('click', () => openLightbox((current + 1) % thumbs.length));
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => {
    if (lightbox.classList.contains('hidden')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft')  document.getElementById('lightbox-prev').click();
    if (e.key === 'ArrowRight') document.getElementById('lightbox-next').click();
  });
})();
</script>
<?php endif; ?>

<!-- Quote Form AJAX JS -->
<script>
(function() {
  const form    = document.getElementById('service-quote-form');
  const errorEl = document.getElementById('quote-form-error');
  const succEl  = document.getElementById('quote-form-success');
  const btn     = document.getElementById('quote-form-btn');
  const origLabel = btn ? btn.innerHTML : '';

  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    errorEl.classList.add('hidden');
    succEl.classList.add('hidden');
    btn.disabled = true;
    btn.textContent = 'Enviando…';

    const data = new FormData(form);
    data.set('action', 'clientum_contact');
    const nonce = form.querySelector('[name="clientum_quote_nonce"]');
    if (nonce) data.set('nonce', nonce.value);

    try {
      const res  = await fetch(clientumData.ajaxUrl, { method: 'POST', body: data });
      const json = await res.json();
      if (json.success) {
        succEl.classList.remove('hidden');
        form.reset();
        // Scroll to success
        succEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        errorEl.textContent = json.data?.message || 'Error al enviar. Intentá de nuevo.';
        errorEl.classList.remove('hidden');
      }
    } catch {
      errorEl.textContent = 'Error de conexión. Revisá tu internet e intentá de nuevo.';
      errorEl.classList.remove('hidden');
    } finally {
      btn.disabled = false;
      btn.innerHTML = origLabel;
    }
  });
})();
</script>

<?php get_footer(); ?>
