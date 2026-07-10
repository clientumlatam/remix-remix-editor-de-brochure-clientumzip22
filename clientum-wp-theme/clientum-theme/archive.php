<?php get_header(); ?>

<div class="max-w-6xl mx-auto px-6 py-16">
  <div class="mb-10">
    <span class="text-[#1A3461] text-[10px] font-black uppercase tracking-widest font-mono"><?php post_type_archive_title(); ?></span>
    <h1 class="text-3xl md:text-4xl font-black text-slate-900 mt-2"><?php
      if (is_category()) single_cat_title('', true);
      elseif (is_tag()) single_tag_title('Etiqueta: ', true);
      elseif (is_post_type_archive()) post_type_archive_title('', true);
      else _e('Archivo', 'clientum');
    ?></h1>
  </div>

  <?php if (have_posts()): ?>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <?php while (have_posts()): the_post(); ?>
        <article class="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-all">
          <?php if (has_post_thumbnail()): ?>
            <div class="h-44 overflow-hidden">
              <a href="<?php the_permalink(); ?>">
                <?php the_post_thumbnail('medium', ['class' => 'w-full h-full object-cover hover:scale-105 transition-transform duration-500']); ?>
              </a>
            </div>
          <?php else: ?>
            <div class="h-44 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
              <span class="text-4xl">📝</span>
            </div>
          <?php endif; ?>
          <div class="p-6">
            <div class="flex items-center gap-2 mb-3">
              <?php $cats = get_the_category(); if ($cats): ?>
                <span class="text-[10px] font-black text-[#1A3461] bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wide"><?php echo esc_html($cats[0]->name); ?></span>
              <?php endif; ?>
              <span class="text-slate-400 text-[10px]"><?php echo ceil(str_word_count(get_the_content()) / 200); ?> min</span>
            </div>
            <h2 class="font-black text-slate-900 text-sm mb-2 leading-tight">
              <a href="<?php the_permalink(); ?>" class="hover:text-[#1A3461] transition-colors"><?php the_title(); ?></a>
            </h2>
            <p class="text-slate-500 text-xs leading-relaxed mb-4"><?php the_excerpt(); ?></p>
            <a href="<?php the_permalink(); ?>" class="text-[#1A3461] font-bold text-xs hover:underline flex items-center gap-1">
              Leer artículo →
            </a>
          </div>
        </article>
      <?php endwhile; ?>
    </div>

    <div class="mt-10 flex justify-center">
      <?php the_posts_navigation(['prev_text' => '← Anteriores', 'next_text' => 'Siguientes →']); ?>
    </div>

  <?php else: ?>
    <div class="text-center py-20">
      <div class="text-5xl mb-4">🔍</div>
      <p class="text-slate-500">No se encontraron publicaciones.</p>
      <a href="<?php echo home_url('/'); ?>" class="mt-4 inline-block text-[#1A3461] font-bold text-sm hover:underline">← Volver al inicio</a>
    </div>
  <?php endif; ?>
</div>

<?php get_footer(); ?>
