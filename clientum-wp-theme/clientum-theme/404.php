<?php get_header(); ?>

<main class="site-main">
    <section class="section text-center py-24">
        <div class="container">
            <div class="error-404-icon">404</div>
            <h1>Página no encontrada</h1>
            <p class="text-gray-500 mt-4 mb-8">La página que buscás no existe o fue movida.</p>
            <div class="flex gap-4 justify-center">
                <a href="<?php echo esc_url(home_url('/')); ?>" class="btn btn-primary">Volver al inicio</a>
                <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-outline">Contactarnos</a>
            </div>
        </div>
    </section>
</main>

<?php get_footer(); ?>
