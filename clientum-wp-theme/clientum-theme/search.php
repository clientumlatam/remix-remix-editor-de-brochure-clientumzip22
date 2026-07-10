<?php get_header(); ?>

<div class="max-w-5xl mx-auto px-6 py-16">
  <h1 class="text-2xl font-black text-slate-900 mb-2">
    Resultados para: <span class="text-[#1A3461]">"<?php echo get_search_query(); ?>"</span>
  </h1>
  <p class="text-slate-500 text-sm mb-10">
    <?php global $wp_query; echo $wp_query->found_posts; ?> resultado(s) encontrado(s).
  </p>

  <?php if (have_posts()): ?>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <?php while (have_posts()): the_post(); ?>
        <article class="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-all">
          <div class="text-[10px] font-bold uppercase text-slate-400 mb-2"><?php echo esc_html(get_post_type_object(get_post_type())->labels->singular_name ?? 'Artículo'); ?></div>
          <h2 class="font-black text-slate-900 text-sm mb-2">
            <a href="<?php the_permalink(); ?>" class="hover:text-[#1A3461] transition-colors"><?php the_title(); ?></a>
          </h2>
          <p class="text-slate-500 text-xs leading-relaxed mb-3"><?php the_excerpt(); ?></p>
          <a href="<?php the_permalink(); ?>" class="text-[#1A3461] font-bold text-xs hover:underline">Ver más →</a>
        </article>
      <?php endwhile; ?>
    </div>
  <?php else: ?>
    <div class="text-center py-16 text-slate-400">
      <div class="text-5xl mb-4">🔍</div>
      <p class="text-sm">No encontramos resultados para tu búsqueda.</p>
      <a href="<?php echo home_url('/'); ?>" class="mt-4 inline-block text-[#1A3461] font-bold text-sm hover:underline">← Volver al inicio</a>
    </div>
  <?php endif; ?>
</div>

<?php get_footer(); ?>
