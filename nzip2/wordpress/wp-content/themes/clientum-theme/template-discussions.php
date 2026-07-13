<?php
/*
 * Template Name: Discusiones
 */
get_header(); ?>
<main class="site-main">

<div class="page-hero page-hero--simple">
  <div class="container text-center">
    <span class="hero-eyebrow">Comunidad</span>
    <h1>Discusiones y soporte</h1>
    <p>Hacé tu consulta, compartí experiencias y conectá con otros usuarios de Clientum.</p>
  </div>
</div>

<section class="section">
  <div class="container">
    <?php echo do_shortcode('[aime_discussions]'); ?>
  </div>
</section>

</main>
<?php get_footer(); ?>
