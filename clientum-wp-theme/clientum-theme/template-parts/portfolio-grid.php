<?php
$projects_query = new WP_Query([
    'post_type'      => 'clientum_project',
    'posts_per_page' => 6,
    'post_status'    => 'publish',
]);

if ($projects_query->have_posts()): ?>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    <?php while ($projects_query->have_posts()): $projects_query->the_post();
      $year  = get_post_meta(get_the_ID(), '_project_year', true);
      $type  = get_post_meta(get_the_ID(), '_project_type', true);
    ?>
      <div class="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all">
        <?php if (has_post_thumbnail()): ?>
          <div class="h-40 overflow-hidden">
            <?php the_post_thumbnail('medium', ['class' => 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-500']); ?>
          </div>
        <?php else: ?>
          <div class="h-40 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <span class="text-slate-600 text-4xl">🏆</span>
          </div>
        <?php endif; ?>
        <div class="p-5">
          <?php if ($year || $type): ?>
            <div class="flex items-center gap-2 mb-2">
              <?php if ($year): ?><span class="text-[10px] font-bold text-slate-400 font-mono"><?php echo esc_html($year); ?></span><?php endif; ?>
              <?php if ($type): ?><span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"><?php echo esc_html($type); ?></span><?php endif; ?>
            </div>
          <?php endif; ?>
          <h3 class="font-black text-slate-900 text-sm mb-1"><?php the_title(); ?></h3>
          <p class="text-slate-500 text-xs leading-relaxed"><?php the_excerpt(); ?></p>
        </div>
      </div>
    <?php endwhile; wp_reset_postdata(); ?>
  </div>
<?php else:
  $defaults = [
    ['name' => 'WeWork Latam', 'year' => '2019', 'type' => 'Rebranding & SEO', 'desc' => 'Reestructuración de marca digital y optimización de presencia en motores de búsqueda.', 'emoji' => '🏢'],
    ['name' => 'Vans Store', 'year' => '2018', 'type' => 'App iOS / Android', 'desc' => 'App de compra móvil con integraciones de fidelización digital.', 'emoji' => '👟'],
    ['name' => 'Cereales del Limay', 'year' => '2021', 'type' => 'ERP & AFIP', 'desc' => 'Digitalización agrícola con balanzas, cartas de porte y liquidación automática.', 'emoji' => '🌾'],
    ['name' => 'Metalúrgica Morgado', 'year' => '2020', 'type' => 'CRM Manufactura', 'desc' => 'Optimización de cadena de montaje y control de calidad con BI avanzado.', 'emoji' => '⚙️'],
    ['name' => 'Uber Eats Seguridad', 'year' => '2022', 'type' => 'Ciberseguridad', 'desc' => 'Protocolos criptográficos que elevaron la seguridad de transacciones de reparto.', 'emoji' => '🔐'],
    ['name' => 'Coca Cola Local', 'year' => '2018', 'type' => 'Marketing Digital', 'desc' => 'Marketing local automatizado segmentado por geolocalización.', 'emoji' => '🥤'],
  ];
  ?>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    <?php foreach ($defaults as $p): ?>
      <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all">
        <div class="h-40 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
          <span class="text-5xl"><?php echo $p['emoji']; ?></span>
        </div>
        <div class="p-5">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-[10px] font-bold text-slate-400 font-mono"><?php echo esc_html($p['year']); ?></span>
            <span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"><?php echo esc_html($p['type']); ?></span>
          </div>
          <h3 class="font-black text-slate-900 text-sm mb-1"><?php echo esc_html($p['name']); ?></h3>
          <p class="text-slate-500 text-xs leading-relaxed"><?php echo esc_html($p['desc']); ?></p>
        </div>
      </div>
    <?php endforeach; ?>
  </div>
<?php endif; ?>
