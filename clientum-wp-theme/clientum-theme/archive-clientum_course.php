<?php get_header(); ?>

<div class="max-w-6xl mx-auto px-6 py-16">
  <div class="text-center mb-14">
    <span class="text-[#1A3461] text-[10px] font-black uppercase tracking-widest font-mono">Clientum Academia</span>
    <h1 class="text-3xl md:text-4xl font-black text-slate-900 mt-2">Capacitate para crecer</h1>
    <p class="text-slate-500 text-sm mt-3 max-w-2xl mx-auto">Cursos online de CRM, ventas, marketing digital y automatización de negocios. Dictados por profesionales con experiencia real en PyMEs argentinas.</p>
  </div>

  <!-- Stats strip -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-14">
    <?php foreach ([['val' => '+377', 'label' => 'Cursos disponibles'], ['val' => 'Gratis', 'label' => 'Acceso básico'], ['val' => '100%', 'label' => 'Online y en español'], ['val' => 'Certificado', 'label' => 'Al finalizar']] as $s): ?>
      <div class="bg-white border border-slate-200 rounded-2xl p-5 text-center">
        <div class="text-2xl font-black text-[#1A3461] mb-1"><?php echo esc_html($s['val']); ?></div>
        <div class="text-slate-500 text-xs"><?php echo esc_html($s['label']); ?></div>
      </div>
    <?php endforeach; ?>
  </div>

  <?php if (have_posts()): ?>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <?php while (have_posts()): the_post();
        $duration = get_post_meta(get_the_ID(), '_course_duration', true);
        $level    = get_post_meta(get_the_ID(), '_course_level', true) ?: 'General';
      ?>
        <article class="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all group">
          <?php if (has_post_thumbnail()): ?>
            <div class="h-44 overflow-hidden">
              <?php the_post_thumbnail('medium', ['class' => 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-500']); ?>
            </div>
          <?php else: ?>
            <div class="h-44 bg-gradient-to-br from-indigo-900 to-slate-900 flex items-center justify-center">
              <span class="text-5xl">🎓</span>
            </div>
          <?php endif; ?>
          <div class="p-6">
            <div class="flex items-center gap-2 mb-3">
              <?php
              $level_colors = ['Principiante' => 'bg-green-100 text-green-700', 'Intermedio' => 'bg-blue-100 text-blue-700', 'Avanzado' => 'bg-red-100 text-red-700', 'General' => 'bg-slate-100 text-slate-600'];
              $level_class  = $level_colors[$level] ?? 'bg-slate-100 text-slate-600';
              ?>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full <?php echo esc_attr($level_class); ?>"><?php echo esc_html($level); ?></span>
              <?php if ($duration): ?>
                <span class="text-slate-400 text-[10px]">⏱ <?php echo esc_html($duration); ?></span>
              <?php endif; ?>
            </div>
            <h2 class="font-black text-slate-900 text-sm mb-2 leading-tight group-hover:text-[#1A3461] transition-colors">
              <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
            </h2>
            <p class="text-slate-500 text-xs leading-relaxed mb-4"><?php the_excerpt(); ?></p>
            <a href="<?php the_permalink(); ?>"
               class="inline-flex items-center gap-1.5 bg-[#1A3461] hover:bg-[#0d1f3c] text-white font-bold text-[10px] uppercase px-4 py-2 rounded-lg tracking-wider transition-all">
              Ver curso →
            </a>
          </div>
        </article>
      <?php endwhile; ?>
    </div>
    <div class="mt-10 flex justify-center">
      <?php the_posts_navigation(['prev_text' => '← Anteriores', 'next_text' => 'Siguientes →']); ?>
    </div>

  <?php else: ?>
    <!-- Default fallback courses -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <?php
      $default_courses = [
        ['title' => 'Dominio de las métricas de marketing digital', 'desc' => 'Analizá, medí y optimizá tus estrategias de adquisición y conversión.', 'duration' => '4 semanas', 'level' => 'Intermedio', 'emoji' => '📊'],
        ['title' => 'Crea tu Tienda Online con WooCommerce', 'desc' => 'Vendé más de forma autónoma. Controlá tu inventario y despertá tu negocio.', 'duration' => '6 semanas', 'level' => 'Principiante', 'emoji' => '🛒'],
        ['title' => 'Automatizá tu Negocio y Multiplicá tu Tiempo', 'desc' => 'Integrá bots de WhatsApp, flujos de CRM y liquidaciones automáticas.', 'duration' => '5 semanas', 'level' => 'Avanzado', 'emoji' => '⚡'],
        ['title' => 'Finanzas para Emprendedores', 'desc' => 'Controlá tu flujo de caja, costos fijos y proyecciones de facturación en pesos.', 'duration' => '4 semanas', 'level' => 'Principiante', 'emoji' => '💰'],
        ['title' => 'SEO Avanzado y Marketing Orgánico', 'desc' => 'Posicioná tu web en el TOP de Google y recibí miles de visitas gratuitas.', 'duration' => '8 semanas', 'level' => 'Avanzado', 'emoji' => '🔍'],
        ['title' => 'Comunicación Empresarial Efectiva', 'desc' => 'Dominá el arte de hablar en público, negociar y convencer a clientes exigentes.', 'duration' => '3 semanas', 'level' => 'General', 'emoji' => '🎤'],
      ];
      $level_colors = ['Principiante' => 'bg-green-100 text-green-700', 'Intermedio' => 'bg-blue-100 text-blue-700', 'Avanzado' => 'bg-red-100 text-red-700', 'General' => 'bg-slate-100 text-slate-600'];
      foreach ($default_courses as $c): ?>
        <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all">
          <div class="h-44 bg-gradient-to-br from-indigo-900 to-slate-900 flex items-center justify-center">
            <span class="text-5xl"><?php echo $c['emoji']; ?></span>
          </div>
          <div class="p-6">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full <?php echo esc_attr($level_colors[$c['level']] ?? 'bg-slate-100 text-slate-600'); ?>"><?php echo esc_html($c['level']); ?></span>
              <span class="text-slate-400 text-[10px]">⏱ <?php echo esc_html($c['duration']); ?></span>
            </div>
            <h3 class="font-black text-slate-900 text-sm mb-2 leading-tight"><?php echo esc_html($c['title']); ?></h3>
            <p class="text-slate-500 text-xs leading-relaxed mb-4"><?php echo esc_html($c['desc']); ?></p>
            <a href="<?php echo esc_url(home_url('/#contacto')); ?>"
               class="inline-flex items-center gap-1.5 bg-[#1A3461] hover:bg-[#0d1f3c] text-white font-bold text-[10px] uppercase px-4 py-2 rounded-lg tracking-wider transition-all">
              Inscribirme →
            </a>
          </div>
        </div>
      <?php endforeach; ?>
    </div>
  <?php endif; ?>
</div>

<?php get_footer(); ?>
