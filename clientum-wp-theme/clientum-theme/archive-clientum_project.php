<?php get_header(); ?>

<div class="max-w-6xl mx-auto px-6 py-16">
  <div class="text-center mb-14">
    <span class="text-[#1A3461] text-[10px] font-black uppercase tracking-widest font-mono">Portafolio</span>
    <h1 class="text-3xl md:text-4xl font-black text-slate-900 mt-2">Casos de Éxito Reales</h1>
    <p class="text-slate-500 text-sm mt-3 max-w-2xl mx-auto">Proyectos implementados para PyMEs argentinas que transformaron su operación con tecnología Clientum.</p>
  </div>

  <!-- Industry filter -->
  <div class="flex flex-wrap gap-2 justify-center mb-10">
    <?php
    $industries = ['todos' => 'Todos', 'servicios' => 'Servicios', 'retail' => 'Retail', 'agroindustria' => 'Agroindustria', 'manufactura' => 'Manufactura', 'ciberseguridad' => 'Ciberseguridad'];
    foreach ($industries as $slug => $label): ?>
      <button class="industry-filter-btn px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border border-slate-200 text-slate-600 hover:border-[#1A3461] hover:text-[#1A3461] transition-all <?php echo $slug === 'todos' ? 'bg-[#1A3461] text-white border-[#1A3461]' : ''; ?>"
        data-filter="<?php echo esc_attr($slug); ?>">
        <?php echo esc_html($label); ?>
      </button>
    <?php endforeach; ?>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    <?php if (have_posts()): while (have_posts()): the_post();
      $year     = get_post_meta(get_the_ID(), '_project_year', true);
      $type     = get_post_meta(get_the_ID(), '_project_type', true);
      $industry = get_post_meta(get_the_ID(), '_project_industry', true) ?: 'servicios';
    ?>
      <article class="portfolio-item bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all"
               data-industry="<?php echo esc_attr($industry); ?>">
        <?php if (has_post_thumbnail()): ?>
          <div class="h-44 overflow-hidden">
            <?php the_post_thumbnail('medium', ['class' => 'w-full h-full object-cover hover:scale-105 transition-transform duration-500']); ?>
          </div>
        <?php else: ?>
          <div class="h-44 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <span class="text-5xl">🏆</span>
          </div>
        <?php endif; ?>
        <div class="p-6">
          <div class="flex items-center gap-2 mb-3">
            <?php if ($year): ?><span class="text-[10px] font-bold text-slate-400 font-mono"><?php echo esc_html($year); ?></span><?php endif; ?>
            <?php if ($type): ?><span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"><?php echo esc_html($type); ?></span><?php endif; ?>
          </div>
          <h2 class="font-black text-slate-900 text-sm mb-2"><?php the_title(); ?></h2>
          <p class="text-slate-500 text-xs leading-relaxed"><?php the_excerpt(); ?></p>
        </div>
      </article>
    <?php endwhile; else:
      // Fallback
      $defaults = [
        ['name' => 'WeWork Latam', 'year' => '2019', 'type' => 'Rebranding & SEO', 'industry' => 'servicios', 'desc' => 'Reestructuración de marca digital y optimización de presencia en buscadores.', 'emoji' => '🏢'],
        ['name' => 'Vans Store', 'year' => '2018', 'type' => 'App iOS/Android', 'industry' => 'retail', 'desc' => 'App de compra móvil con integraciones de fidelización digital.', 'emoji' => '👟'],
        ['name' => 'Apple Campus', 'year' => '2018', 'type' => 'ERP & E-Commerce', 'industry' => 'retail', 'desc' => 'Plataforma e-commerce premium con control unificado de stock y logística.', 'emoji' => '📱'],
        ['name' => 'Cereales del Limay', 'year' => '2021', 'type' => 'ERP & AFIP', 'industry' => 'agroindustria', 'desc' => 'Digitalización agrícola con balanzas, cartas de porte y liquidación automática.', 'emoji' => '🌾'],
        ['name' => 'Metalúrgica Morgado', 'year' => '2020', 'type' => 'CRM Manufactura', 'industry' => 'manufactura', 'desc' => 'Optimización de cadena de montaje y control de calidad con BI avanzado.', 'emoji' => '⚙️'],
        ['name' => 'Uber Eats Seguridad', 'year' => '2022', 'type' => 'Ciberseguridad', 'industry' => 'ciberseguridad', 'desc' => 'Protocolos criptográficos que elevaron la seguridad de transacciones de reparto.', 'emoji' => '🔐'],
      ];
      foreach ($defaults as $p): ?>
        <div class="portfolio-item bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all" data-industry="<?php echo esc_attr($p['industry']); ?>">
          <div class="h-44 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <span class="text-5xl"><?php echo $p['emoji']; ?></span>
          </div>
          <div class="p-6">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-[10px] font-bold text-slate-400 font-mono"><?php echo esc_html($p['year']); ?></span>
              <span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"><?php echo esc_html($p['type']); ?></span>
            </div>
            <h3 class="font-black text-slate-900 text-sm mb-2"><?php echo esc_html($p['name']); ?></h3>
            <p class="text-slate-500 text-xs leading-relaxed"><?php echo esc_html($p['desc']); ?></p>
          </div>
        </div>
    <?php endforeach; endif; ?>
  </div>
</div>

<?php get_footer(); ?>
