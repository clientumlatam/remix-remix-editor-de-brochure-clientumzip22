<?php
/**
 * Clientum — Barra de búsqueda + filtro de categoría en el catálogo de Servicios
 * Pegar en el child theme: functions.php (junto al snippet clientum-catalogo-consultar.php)
 *
 * Requiere: crear la página de archivo apuntando a la categoría raíz "Servicios"
 * (WooCommerce genera esto automático en /categoria-producto/servicios/)
 */

add_action( 'woocommerce_before_shop_loop', 'clientum_catalogo_filtros_bar', 5 );
function clientum_catalogo_filtros_bar() {
    if ( ! is_product_category() && ! is_shop() ) {
        return;
    }
    ?>
    <div class="ctm-catalogo-filtros">
        <form method="get" class="ctm-catalogo-filtros__form">
            <input type="text" name="s" placeholder="Buscar servicio (ej: ERP, e-commerce, ciberseguridad)..."
                   value="<?php echo isset( $_GET['s'] ) ? esc_attr( wp_unslash( $_GET['s'] ) ) : ''; ?>">
            <input type="hidden" name="post_type" value="product">

            <?php
            // Dropdown de subcategorías dentro de "Servicios"
            wc_product_dropdown_categories( array(
                'show_count'         => false,
                'hierarchical'       => true,
                'hide_empty'         => true,
                'parent'             => get_queried_object_id() ?: 0,
                'any_name'           => 'product_cat',
                'class'              => 'ctm-catalogo-filtros__select',
                'show_option_none'   => 'Todas las categorías',
            ) );
            ?>
            <button type="submit">Buscar</button>
        </form>

        <p class="ctm-catalogo-filtros__count">
            <?php
            global $wp_query;
            printf( '%d resultados', (int) $wp_query->found_posts );
            ?>
        </p>
    </div>
    <?php
}

/**
 * Cantidad de productos por página del catálogo (afecta "Página 1 de X").
 * Con 489 servicios y 24/página → 21 páginas, igual a las capturas.
 */
add_filter( 'loop_shop_per_page', function () {
    return 24;
}, 20 );
