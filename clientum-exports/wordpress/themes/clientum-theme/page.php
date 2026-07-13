<?php get_header(); ?>

<main class="site-main">
    <?php while ( have_posts() ) : the_post(); ?>
        <div class="page-hero page-hero--simple">
            <div class="container">
                <h1><?php the_title(); ?></h1>
            </div>
        </div>
        <div class="container py-16">
            <div class="prose"><?php the_content(); ?></div>
        </div>
    <?php endwhile; ?>
</main>

<?php get_footer(); ?>
