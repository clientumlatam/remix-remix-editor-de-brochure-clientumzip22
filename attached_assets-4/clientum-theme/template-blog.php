<?php
/**
 * Template Name: Blog
 * Description: Landing del blog con grid de entradas recientes, categorías y buscador.
 *
 * @package Clientum
 */

get_header(); ?>

<!-- PAGE HERO -->
<section class="page-hero page-hero--navy">
  <div class="container">
    <div class="page-hero-eyebrow">Recursos &amp; Noticias</div>
    <h1 class="page-hero-title">Blog de Clientum</h1>
    <p class="page-hero-desc">Consejos de ventas, automatización y gestión de clientes para PyMEs argentinas.</p>
    <form class="blog-search" action="<?php echo esc_url( home_url('/') ); ?>" method="get" role="search">
      <input class="blog-search-input" type="search" name="s" placeholder="Buscar artículos…" value="<?php echo esc_attr( get_search_query() ); ?>" aria-label="Buscar">
      <button class="blog-search-btn btn btn-green" type="submit">Buscar</button>
    </form>
  </div>
</section>

<!-- CATEGORY TABS -->
<?php
$cats = get_categories(['hide_empty' => false]);
?>
<section class="blog-cats-bar">
  <div class="container">
    <div class="blog-cats-list">
      <a class="blog-cat-tab<?php echo ( ! is_category() && ! is_search() ) ? ' active' : ''; ?>"
         href="<?php echo esc_url( get_post_type_archive_link('post') ); ?>">
        Todos
      </a>
      <?php foreach ( $cats as $cat ) : ?>
        <a class="blog-cat-tab<?php echo is_category( $cat->term_id ) ? ' active' : ''; ?>"
           href="<?php echo esc_url( get_category_link( $cat->term_id ) ); ?>">
          <?php echo esc_html( $cat->name ); ?>
        </a>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- POSTS GRID -->
<section class="section">
  <div class="container">
    <?php
    $paged = max(1, get_query_var('paged'));

    $args = [
      'posts_per_page' => 9,
      'paged'          => $paged,
      'post_status'    => 'publish',
    ];

    // Pass search query through
    if ( get_search_query() ) {
      $args['s'] = get_search_query();
    }

    $blog_query = new WP_Query( $args );

    if ( $blog_query->have_posts() ) : ?>
      <div class="blog-grid">
        <?php
        $i = 0;
        while ( $blog_query->have_posts() ) :
          $blog_query->the_post();
          $i++;

          // First post is featured (full-width card)
          $is_featured = ( $i === 1 && $paged === 1 && ! get_search_query() );

          $cat_list     = get_the_category();
          $first_cat    = $cat_list ? $cat_list[0] : null;
          $reading_time = max(1, intval(str_word_count(strip_tags(get_the_content())) / 200));
          ?>

          <article class="blog-card<?php echo $is_featured ? ' blog-card--featured' : ''; ?>">
            <?php if ( has_post_thumbnail() ) : ?>
              <a class="blog-card-img-wrap" href="<?php the_permalink(); ?>" tabindex="-1" aria-hidden="true">
                <?php the_post_thumbnail( $is_featured ? 'large' : 'medium_large', ['class' => 'blog-card-img', 'alt' => ''] ); ?>
              </a>
            <?php else : ?>
              <a class="blog-card-img-wrap blog-card-img-placeholder" href="<?php the_permalink(); ?>" tabindex="-1" aria-hidden="true">
                <span class="blog-placeholder-icon">📝</span>
              </a>
            <?php endif; ?>

            <div class="blog-card-body">
              <?php if ( $first_cat ) : ?>
                <a class="blog-card-cat" href="<?php echo esc_url( get_category_link( $first_cat->term_id ) ); ?>">
                  <?php echo esc_html( $first_cat->name ); ?>
                </a>
              <?php endif; ?>

              <h2 class="blog-card-title<?php echo $is_featured ? ' blog-card-title--lg' : ''; ?>">
                <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
              </h2>

              <p class="blog-card-excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), $is_featured ? 30 : 18 ) ); ?></p>

              <div class="blog-card-meta">
                <span class="blog-card-author">
                  <?php echo get_avatar( get_the_author_meta('email'), 24, '', '', ['class' => 'blog-avatar'] ); ?>
                  <span><?php echo esc_html( get_the_author() ); ?></span>
                </span>
                <span class="blog-card-date"><?php echo esc_html( get_the_date('j M Y') ); ?></span>
                <span class="blog-card-read"><?php echo esc_html( $reading_time ); ?> min</span>
              </div>
            </div>
          </article>

        <?php endwhile; ?>
      </div><!-- .blog-grid -->

      <!-- PAGINATION -->
      <?php if ( $blog_query->max_num_pages > 1 ) : ?>
        <div class="blog-pagination">
          <?php
          echo wp_kses_post( paginate_links([
            'total'   => $blog_query->max_num_pages,
            'current' => $paged,
            'prev_text' => '← Anterior',
            'next_text' => 'Siguiente →',
          ]) );
          ?>
        </div>
      <?php endif;

      wp_reset_postdata();

    else : ?>
      <!-- EMPTY STATE -->
      <div class="blog-empty">
        <div class="blog-empty-icon">📭</div>
        <?php if ( get_search_query() ) : ?>
          <h2>No se encontraron resultados para <em>"<?php echo esc_html( get_search_query() ); ?>"</em></h2>
          <p>Probá con otras palabras clave o <a href="<?php echo esc_url( get_permalink() ); ?>">revisá todos los artículos</a>.</p>
        <?php else : ?>
          <h2>Próximamente…</h2>
          <p>Estamos preparando contenido de valor para PyMEs argentinas. Volvé pronto.</p>
        <?php endif; ?>
        <a class="btn btn-navy" href="<?php echo esc_url( home_url('/') ); ?>">Volver al inicio</a>
      </div>
    <?php endif; ?>

  </div>
</section>

<!-- NEWSLETTER STRIP -->
<section class="section section--light">
  <div class="container">
    <div class="newsletter-strip">
      <div class="newsletter-strip-text">
        <h2 class="newsletter-strip-title">Recibí contenido semanal</h2>
        <p>Tips de ventas, casos de éxito y novedades de Clientum directo a tu bandeja.</p>
      </div>
      <form class="newsletter-form" id="blogNewsletterForm" novalidate>
        <?php wp_nonce_field('clientum_newsletter', 'newsletter_nonce'); ?>
        <div class="newsletter-row">
          <input class="newsletter-input" type="email" name="email" placeholder="tu@email.com" required>
          <button class="btn btn-green" type="submit">Suscribirme</button>
        </div>
        <div class="newsletter-status" id="newsletterStatus" aria-live="polite"></div>
      </form>
    </div>
  </div>
</section>

<?php get_footer(); ?>
