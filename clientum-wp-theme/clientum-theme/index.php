<?php get_header(); ?>

<!-- ── HERO ─────────────────────────────────────────────────────────────────── -->
<section class="relative bg-slate-900 text-white py-24 px-6 md:px-12 flex items-center overflow-hidden min-h-[640px]">
  <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#0d1f3c] via-slate-900 to-[#122442]"></div>
  <div class="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
  <div class="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
    <div class="lg:col-span-7 flex flex-col items-start gap-6">
      <span class="bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 text-[10px] font-extrabold uppercase px-4 py-1.5 rounded-full tracking-widest flex items-center gap-2 font-mono">
        ✦ Plataforma All-in-One para PyMEs
      </span>
      <h1 class="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
        <?php echo esc_html(clientum_opt('clientum_hero_slogan', 'Todo lo que tu empresa necesita,')); ?><br>
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400">en una sola plataforma.</span>
      </h1>
      <p class="text-slate-300 text-sm md:text-base max-w-xl leading-relaxed">
        <?php echo esc_html(clientum_opt('clientum_hero_sub', 'CRM, Chatbot WhatsApp con IA, E-Commerce, ERP, Business Intelligence, Marketing Digital, Ciberseguridad y Capacitación — el ecosistema completo de Clientum para hacer crecer tu PyME.')); ?>
      </p>
      <div class="flex flex-wrap gap-3">
        <a href="#servicios" class="bg-gradient-to-r from-[#1A3461] to-[#254f8f] hover:from-[#0f2447] hover:to-[#1a3a6b] text-white font-bold text-xs uppercase tracking-wider px-7 py-3.5 rounded-xl transition-all shadow-md flex items-center gap-2">
          Ver Servicios →
        </a>
        <a href="#contacto" class="bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider px-7 py-3.5 rounded-xl border border-white/15 transition-all flex items-center gap-2">
          ▶ Solicitar Demo
        </a>
      </div>
      <div class="flex flex-wrap gap-x-6 gap-y-2">
        <?php foreach (['Sin contrato mínimo', 'Implementado en 5 días', 'Soporte en español 24/7'] as $t): ?>
          <span class="flex items-center gap-1.5 text-slate-400 text-xs">✓ <?php echo esc_html($t); ?></span>
        <?php endforeach; ?>
      </div>
    </div>
    <div class="lg:col-span-5">
      <?php get_template_part('template-parts/demo-form'); ?>
    </div>
  </div>
</section>

<!-- ── SOCIAL PROOF STRIP ────────────────────────────────────────────────────── -->
<section class="bg-slate-950 border-b border-slate-800/60 py-5 px-6">
  <div class="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-y-3 divide-x divide-slate-800/60">
    <span class="text-slate-500 text-[10px] uppercase tracking-widest font-bold font-mono pr-8 w-full md:w-auto text-center">Confían en Clientum</span>
    <?php
    $industries = ['🚛 Distribuidoras', '🛒 Retail & E-Commerce', '🏢 Estudios Contables', '🩺 Salud & Bienestar', '☕ Gastronomía', '🏠 Inmobiliarias'];
    foreach ($industries as $ind): ?>
      <span class="px-5 py-1 text-slate-500 text-[11px] font-medium whitespace-nowrap"><?php echo esc_html($ind); ?></span>
    <?php endforeach; ?>
  </div>
</section>

<!-- ── PILLARS ───────────────────────────────────────────────────────────────── -->
<section class="bg-white py-20 px-6">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-14">
      <span class="text-[#1A3461] text-[10px] font-black uppercase tracking-widest font-mono">La plataforma completa</span>
      <h2 class="text-3xl md:text-4xl font-black text-slate-900 mt-2">Todo en uno. Sin complicaciones.</h2>
      <p class="text-slate-500 text-sm mt-3 max-w-2xl mx-auto">Desde el primer contacto hasta el cierre de venta, Clientum automatiza cada paso para que tu equipo solo se enfoque en vender.</p>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <?php
      $pillars = [
        ['icon' => '💬', 'color' => 'emerald', 'title' => 'Chatbot WhatsApp 24/7', 'desc' => 'Tu negocio atiende solo. El bot responde, cotiza, agenda y califica leads automáticamente.'],
        ['icon' => '📊', 'color' => 'blue', 'title' => 'CRM Inteligente', 'desc' => 'Pipeline Kanban drag & drop. Seguimiento automático. Historial completo de cada cliente.'],
        ['icon' => '🤖', 'color' => 'violet', 'title' => 'Asistente IA', 'desc' => 'Preguntale a la IA por tus métricas, clientes o estrategias. Respuesta instantánea.'],
        ['icon' => '📈', 'color' => 'orange', 'title' => 'Reportes Automáticos', 'desc' => 'Dashboards de ventas, conversiones y ROI actualizados en tiempo real sin intervención.'],
        ['icon' => '⚡', 'color' => 'amber', 'title' => 'Automatización', 'desc' => 'Flujos de trabajo, recordatorios y tareas que se ejecutan solos según tus reglas.'],
        ['icon' => '🏪', 'color' => 'teal', 'title' => 'E-Commerce & ERP', 'desc' => 'Tienda online integrada con stock, facturación AFIP y logística en un solo sistema.'],
      ];
      $colors = ['emerald' => 'text-emerald-600 bg-emerald-50', 'blue' => 'text-blue-600 bg-blue-50', 'violet' => 'text-violet-600 bg-violet-50', 'orange' => 'text-orange-600 bg-orange-50', 'amber' => 'text-amber-600 bg-amber-50', 'teal' => 'text-teal-600 bg-teal-50'];
      foreach ($pillars as $p): ?>
        <div class="bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-md transition-all group">
          <div class="w-10 h-10 rounded-xl <?php echo esc_attr($colors[$p['color']]); ?> flex items-center justify-center text-lg mb-4"><?php echo $p['icon']; ?></div>
          <h3 class="font-black text-slate-900 text-sm mb-2"><?php echo esc_html($p['title']); ?></h3>
          <p class="text-slate-500 text-xs leading-relaxed"><?php echo esc_html($p['desc']); ?></p>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- ── SERVICES ──────────────────────────────────────────────────────────────── -->
<section id="servicios" class="bg-slate-50 py-20 px-6 scroll-mt-20">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-14">
      <span class="text-[#1A3461] text-[10px] font-black uppercase tracking-widest font-mono">Nuestros Servicios</span>
      <h2 class="text-3xl md:text-4xl font-black text-slate-900 mt-2">Soluciones para cada industria</h2>
    </div>
    <?php get_template_part('template-parts/services-grid'); ?>
  </div>
</section>

<!-- ── HOW IT WORKS ──────────────────────────────────────────────────────────── -->
<section class="bg-white py-20 px-6">
  <div class="max-w-5xl mx-auto">
    <div class="text-center mb-14">
      <span class="text-[#1A3461] text-[10px] font-black uppercase tracking-widest font-mono">Cómo funciona</span>
      <h2 class="text-3xl md:text-4xl font-black text-slate-900 mt-2">En 4 pasos, tu PyME en piloto automático</h2>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
      <?php
      $steps = [
        ['num' => '01', 'title' => 'Consulta Inicial', 'desc' => 'Agendás una demo gratuita. Analizamos tu negocio y tus necesidades.'],
        ['num' => '02', 'title' => 'Configuración', 'desc' => 'Implementamos el bot, CRM y ERP en menos de 5 días hábiles.'],
        ['num' => '03', 'title' => 'Capacitación', 'desc' => 'Formamos a tu equipo para aprovechar el 100% de Clientum.'],
        ['num' => '04', 'title' => 'Crecimiento', 'desc' => 'Soporte continuo y métricas para que sigas escalando sin límites.'],
      ];
      foreach ($steps as $s): ?>
        <div class="flex flex-col items-center text-center">
          <div class="w-12 h-12 rounded-2xl bg-[#1A3461] text-white font-black text-sm flex items-center justify-center mb-4"><?php echo esc_html($s['num']); ?></div>
          <h3 class="font-black text-slate-900 text-sm mb-2"><?php echo esc_html($s['title']); ?></h3>
          <p class="text-slate-500 text-xs leading-relaxed"><?php echo esc_html($s['desc']); ?></p>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- ── STATS ─────────────────────────────────────────────────────────────────── -->
<section class="bg-[#0d1f3c] py-16 px-6">
  <div class="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
    <?php
    $stats = [
      ['val' => '+500', 'label' => 'PyMEs en Argentina'],
      ['val' => '40%', 'label' => 'Más consultas con bot'],
      ['val' => '5 días', 'label' => 'Implementación promedio'],
      ['val' => '24/7', 'label' => 'Soporte en español'],
    ];
    foreach ($stats as $s): ?>
      <div>
        <div class="text-3xl md:text-4xl font-black text-white mb-1"><?php echo esc_html($s['val']); ?></div>
        <div class="text-slate-400 text-xs font-semibold"><?php echo esc_html($s['label']); ?></div>
      </div>
    <?php endforeach; ?>
  </div>
</section>

<!-- ── PRICING ───────────────────────────────────────────────────────────────── -->
<section id="planes" class="bg-white py-20 px-6 scroll-mt-20">
  <div class="max-w-6xl mx-auto">
    <?php get_template_part('template-parts/pricing'); ?>
  </div>
</section>

<!-- ── TESTIMONIALS ──────────────────────────────────────────────────────────── -->
<section class="bg-slate-50 py-20 px-6">
  <div class="max-w-6xl mx-auto">
    <?php get_template_part('template-parts/testimonials'); ?>
  </div>
</section>

<!-- ── PORTFOLIO PREVIEW ─────────────────────────────────────────────────────── -->
<section class="bg-white py-20 px-6">
  <div class="max-w-6xl mx-auto">
    <div class="flex items-center justify-between mb-10">
      <div>
        <span class="text-[#1A3461] text-[10px] font-black uppercase tracking-widest font-mono">Casos de Éxito</span>
        <h2 class="text-2xl md:text-3xl font-black text-slate-900 mt-1">Resultados reales de PyMEs reales</h2>
      </div>
      <a href="<?php echo esc_url(home_url('/portafolio/')); ?>" class="text-xs font-bold text-[#1A3461] hover:underline flex items-center gap-1">Ver todos →</a>
    </div>
    <?php get_template_part('template-parts/portfolio-grid'); ?>
  </div>
</section>

<!-- ── ABOUT ─────────────────────────────────────────────────────────────────── -->
<section id="nosotros" class="bg-slate-900 text-white py-20 px-6 scroll-mt-20">
  <div class="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
    <div>
      <span class="text-emerald-400 text-[10px] font-black uppercase tracking-widest font-mono">Nosotros</span>
      <h2 class="text-3xl md:text-4xl font-black mt-2 mb-4">Nacimos en la Patagonia,<br>escalamos Latinoamérica</h2>
      <p class="text-slate-400 text-sm leading-relaxed mb-6">Somos un equipo multidisciplinario de ingenieros, diseñadores y estrategas comerciales con sede en General Roca, Río Negro. Combinamos la comprensión directa de las PyMEs del interior argentino con estándares de ingeniería de nivel internacional.</p>
      <div class="grid grid-cols-2 gap-4">
        <?php
        $about_stats = [
          ['val' => '2017', 'label' => 'Año de fundación'],
          ['val' => '3', 'label' => 'Oficinas globales'],
          ['val' => '+50', 'label' => 'Profesionales'],
          ['val' => '13', 'label' => 'Categorías de servicios'],
        ];
        foreach ($about_stats as $a): ?>
          <div class="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
            <div class="text-xl font-black text-white"><?php echo esc_html($a['val']); ?></div>
            <div class="text-slate-500 text-xs mt-0.5"><?php echo esc_html($a['label']); ?></div>
          </div>
        <?php endforeach; ?>
      </div>
    </div>
    <div class="grid grid-cols-3 gap-3">
      <?php
      $offices = [
        ['city' => 'General Roca', 'country' => '🇦🇷 Argentina', 'desc' => 'Sede Central'],
        ['city' => 'Berlín', 'country' => '🇩🇪 Alemania', 'desc' => 'Sede Europa'],
        ['city' => 'Londres', 'country' => '🇬🇧 Reino Unido', 'desc' => 'Sede Financiera'],
      ];
      foreach ($offices as $o): ?>
        <div class="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 text-center">
          <div class="text-lg mb-1"><?php echo $o['country']; ?></div>
          <div class="font-bold text-white text-xs"><?php echo esc_html($o['city']); ?></div>
          <div class="text-slate-500 text-[10px] mt-0.5"><?php echo esc_html($o['desc']); ?></div>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- ── FAQ ───────────────────────────────────────────────────────────────────── -->
<section class="bg-white py-20 px-6">
  <div class="max-w-3xl mx-auto">
    <div class="text-center mb-12">
      <span class="text-[#1A3461] text-[10px] font-black uppercase tracking-widest font-mono">Preguntas frecuentes</span>
      <h2 class="text-2xl md:text-3xl font-black text-slate-900 mt-2">Todo lo que necesitás saber</h2>
    </div>
    <?php get_template_part('template-parts/faq'); ?>
  </div>
</section>

<!-- ── CONTACT ───────────────────────────────────────────────────────────────── -->
<section id="contacto" class="bg-slate-50 py-20 px-6 scroll-mt-20">
  <div class="max-w-5xl mx-auto">
    <div class="text-center mb-12">
      <span class="text-[#1A3461] text-[10px] font-black uppercase tracking-widest font-mono">Contacto</span>
      <h2 class="text-2xl md:text-3xl font-black text-slate-900 mt-2">¿Listo para automatizar tu negocio?</h2>
      <p class="text-slate-500 text-sm mt-2">Completá el formulario y te contactamos en menos de 24 horas.</p>
    </div>
    <div class="grid md:grid-cols-2 gap-10 items-start">
      <div>
        <?php get_template_part('template-parts/contact-form'); ?>
      </div>
      <div class="space-y-4">
        <?php
        $contact_items = [
          ['icon' => '📍', 'label' => 'Dirección', 'val' => clientum_opt('clientum_address', 'General Roca, Río Negro, Argentina')],
          ['icon' => '📞', 'label' => 'Teléfono', 'val' => clientum_opt('clientum_phone', '+54 298 451-0883')],
          ['icon' => '✉️', 'label' => 'Email', 'val' => clientum_opt('clientum_email', 'info@clientum.com.ar')],
        ];
        foreach ($contact_items as $c): ?>
          <div class="flex gap-4 bg-white border border-slate-200 rounded-2xl p-5">
            <div class="text-2xl shrink-0"><?php echo $c['icon']; ?></div>
            <div>
              <div class="text-[10px] font-black uppercase tracking-widest text-slate-400"><?php echo esc_html($c['label']); ?></div>
              <div class="font-bold text-slate-800 text-sm mt-0.5"><?php echo esc_html($c['val']); ?></div>
            </div>
          </div>
        <?php endforeach; ?>
        <a href="https://wa.me/<?php echo esc_attr(clientum_opt('clientum_whatsapp', '5492984510883')); ?>?text=Hola%2C%20quiero%20una%20demo%20de%20Clientum"
           target="_blank" rel="noopener"
           class="flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-4 rounded-2xl text-sm uppercase tracking-wider transition-all w-full mt-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Escribinos por WhatsApp
        </a>
      </div>
    </div>
  </div>
</section>

<?php get_footer(); ?>
