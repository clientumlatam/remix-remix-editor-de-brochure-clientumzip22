<?php get_header(); ?>

<main class="site-main">
    <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
        <article id="post-<?php the_ID(); ?>" <?php post_class('container py-16'); ?>>
            <h1 class="section-title"><?php the_title(); ?></h1>
            <div class="prose"><?php the_content(); ?></div>
        </article>
    <?php endwhile; else : ?>
        <div class="container py-16 text-center">
            <h1>No se encontró contenido</h1>
            <p>La página que buscás no existe.</p>
            <a href="<?php echo esc_url(home_url('/')); ?>" class="btn btn-primary mt-4">Volver al inicio</a>
        </div>
    <?php endif; ?>
</main>

<?php get_footer(); ?>
