<?php get_header(); ?>

<main class="site-main">
    <div class="page-hero page-hero--simple">
        <div class="container">
            <span class="hero-eyebrow">Blog</span>
            <h1>Artículos y recursos para PyMEs</h1>
            <p>Tecnología, ventas y automatización para hacer crecer tu empresa.</p>
        </div>
    </div>

    <section class="section">
        <div class="container">
            <?php if ( have_posts() ) : ?>
            <div class="blog-grid">
                <?php while ( have_posts() ) : the_post(); ?>
                <article class="blog-card" id="post-<?php the_ID(); ?>">
                    <?php if ( has_post_thumbnail() ) : ?>
                    <a href="<?php the_permalink(); ?>" class="blog-card-img">
                        <?php the_post_thumbnail('medium', ['loading' => 'lazy']); ?>
                    </a>
                    <?php endif; ?>
                    <div class="blog-card-body">
                        <?php
                        $cats = get_the_category();
                        if ($cats) echo '<span class="post-category">' . esc_html($cats[0]->name) . '</span>';
                        ?>
                        <h2 class="blog-card-title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
                        <p class="blog-card-excerpt"><?php the_excerpt(); ?></p>
                        <div class="blog-card-meta">
                            <span><?php echo get_the_date('j M Y'); ?></span>
                            <a href="<?php the_permalink(); ?>" class="read-more">Leer más →</a>
                        </div>
                    </div>
                </article>
                <?php endwhile; ?>
            </div>

            <div class="pagination">
                <?php the_posts_pagination(['mid_size' => 2, 'prev_text' => '← Anterior', 'next_text' => 'Siguiente →']); ?>
            </div>

            <?php else : ?>
            <div class="text-center py-16">
                <p>No hay artículos publicados aún. ¡Próximamente!</p>
            </div>
            <?php endif; ?>
        </div>
    </section>
</main>

<?php get_footer(); ?>
