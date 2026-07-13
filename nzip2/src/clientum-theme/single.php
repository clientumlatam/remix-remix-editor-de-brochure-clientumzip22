<?php get_header(); ?>

<main class="site-main">
    <?php while ( have_posts() ) : the_post(); ?>

    <article class="single-post" id="post-<?php the_ID(); ?>">
        <div class="page-hero page-hero--simple">
            <div class="container">
                <?php
                $cats = get_the_category();
                if ( $cats ) :
                    echo '<span class="post-category">' . esc_html($cats[0]->name) . '</span>';
                endif;
                ?>
                <h1 class="post-title"><?php the_title(); ?></h1>
                <div class="post-meta">
                    <span><?php echo esc_html( get_the_date('j \d\e F \d\e Y') ); ?></span>
                    <span><?php echo esc_html( get_the_author() ); ?></span>
                    <span><?php echo esc_html( get_the_time('G:i') ); ?> min de lectura</span>
                </div>
            </div>
        </div>

        <?php if ( has_post_thumbnail() ) : ?>
        <div class="post-thumbnail container">
            <?php the_post_thumbnail('large', ['class' => 'post-featured-img']); ?>
        </div>
        <?php endif; ?>

        <div class="container">
            <div class="post-content prose"><?php the_content(); ?></div>

            <div class="post-nav">
                <?php previous_post_link('<div class="post-nav-prev">%link</div>', '← %title'); ?>
                <?php next_post_link('<div class="post-nav-next">%link</div>', '%title →'); ?>
            </div>
        </div>
    </article>

    <?php endwhile; ?>

    <section class="cta-section">
        <div class="container text-center">
            <h2>¿Querés automatizar tu PyME?</h2>
            <p>14 días gratis. Sin tarjeta de crédito.</p>
            <a href="<?php echo esc_url(home_url('/register')); ?>" class="btn btn-primary btn-lg mt-4">Probar gratis</a>
        </div>
    </section>
</main>

<?php get_footer(); ?>
