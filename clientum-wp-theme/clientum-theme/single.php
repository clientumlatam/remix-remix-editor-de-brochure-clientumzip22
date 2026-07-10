<?php get_header(); ?>

<div class="max-w-3xl mx-auto px-6 py-16">
  <?php if (have_posts()): while (have_posts()): the_post(); ?>

    <nav class="text-xs text-slate-400 mb-8 flex items-center gap-2">
      <a href="<?php echo home_url('/'); ?>" class="hover:text-[#1A3461] transition-colors">Inicio</a>
      <span>/</span>
      <a href="<?php echo home_url('/blog/'); ?>" class="hover:text-[#1A3461] transition-colors">Blog</a>
      <span>/</span>
      <span class="text-slate-600"><?php the_title(); ?></span>
    </nav>

    <article class="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
      <?php if (has_post_thumbnail()): ?>
        <div class="h-64 md:h-80 overflow-hidden">
          <?php the_post_thumbnail('large', ['class' => 'w-full h-full object-cover']); ?>
        </div>
      <?php endif; ?>

      <div class="p-8 md:p-12">
        <div class="flex items-center gap-3 mb-6">
          <?php $cats = get_the_category(); if ($cats): ?>
            <span class="bg-[#1A3461]/10 text-[#1A3461] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
              <?php echo esc_html($cats[0]->name); ?>
            </span>
          <?php endif; ?>
          <span class="text-slate-400 text-xs"><?php echo get_the_date('j \d\e F \d\e Y'); ?></span>
          <span class="text-slate-300">·</span>
          <span class="text-slate-400 text-xs"><?php echo ceil(str_word_count(get_the_content()) / 200); ?> min de lectura</span>
        </div>

        <h1 class="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-6"><?php the_title(); ?></h1>

        <div class="flex items-center gap-3 pb-6 border-b border-slate-100 mb-8">
          <div class="w-9 h-9 rounded-full bg-[#1A3461] flex items-center justify-center text-white font-black text-xs">
            <?php echo strtoupper(substr(get_the_author(), 0, 1)); ?>
          </div>
          <div>
            <div class="font-bold text-slate-800 text-xs"><?php the_author(); ?></div>
            <div class="text-slate-400 text-[10px]">Equipo Clientum</div>
          </div>
        </div>

        <div class="wp-content prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed">
          <?php the_content(); ?>
        </div>

        <div class="mt-10 pt-6 border-t border-slate-100">
          <?php the_tags('<div class="flex flex-wrap gap-2">', '', '</div>'); ?>
        </div>
      </div>
    </article>

    <?php comments_template(); ?>

  <?php endwhile; endif; ?>

  <div class="mt-10 text-center">
    <a href="<?php echo home_url('/blog/'); ?>" class="inline-flex items-center gap-2 bg-[#1A3461] hover:bg-[#0d1f3c] text-white font-bold text-xs uppercase px-6 py-3 rounded-xl tracking-wider transition-all">
      ← Ver todos los artículos
    </a>
  </div>
</div>

<?php get_footer(); ?>
