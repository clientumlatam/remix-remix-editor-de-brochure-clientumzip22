<?php get_header(); ?>

<div class="max-w-4xl mx-auto px-6 py-16">
  <?php if (have_posts()): while (have_posts()): the_post(); ?>
    <article class="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm">
      <h1 class="text-2xl md:text-3xl font-black text-slate-900 mb-6"><?php the_title(); ?></h1>
      <div class="wp-content prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed">
        <?php the_content(); ?>
      </div>
    </article>
  <?php endwhile; endif; ?>
</div>

<?php get_footer(); ?>
