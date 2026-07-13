<?php
/**
 * Clientum — Modo catálogo ("Consultar" en vez de comprar)
 * Pegar en el child theme: functions.php
 * Requiere: WooCommerce + Flatsome (child theme obligatorio, no editar el core)
 */

// URL del formulario de contacto/cotización (ajustar al slug real de la página)
if ( ! defined( 'CLIENTUM_QUOTE_PAGE_URL' ) ) {
    define( 'CLIENTUM_QUOTE_PAGE_URL', home_url( '/contanos-tu-caso/' ) );
}

/**
 * 1) Grilla de catálogo (loop): reemplaza el botón "Agregar al carrito"
 *    por "Consultar", con el nombre del servicio precargado por query param.
 */
add_filter( 'woocommerce_loop_add_to_cart_link', 'clientum_loop_consultar_button', 10, 2 );
function clientum_loop_consultar_button( $html, $product ) {
    $url = add_query_arg( 'servicio', rawurlencode( $product->get_name() ), CLIENTUM_QUOTE_PAGE_URL );
    return sprintf(
        '<a href="%s" class="button consultar-btn">Consultar &rarr;</a>',
        esc_url( $url )
    );
}

/**
 * 2) Página de producto individual: saca el form de compra (qty + carrito)
 *    y pone el mismo botón "Consultar".
 */
remove_action( 'woocommerce_single_product_summary', 'woocommerce_template_single_add_to_cart', 30 );
add_action( 'woocommerce_single_product_summary', 'clientum_single_consultar_button', 30 );
function clientum_single_consultar_button() {
    global $product;
    $url = add_query_arg( 'servicio', rawurlencode( $product->get_name() ), CLIENTUM_QUOTE_PAGE_URL );
    echo '<a href="' . esc_url( $url ) . '" class="button consultar-btn large">Consultar &rarr;</a>';
}

/**
 * 3) Precio: mostrar "Desde $X" en vez del precio Woo estándar
 *    (coincide con el copy visto en las capturas del catálogo).
 */
add_filter( 'woocommerce_get_price_html', 'clientum_desde_price_html', 10, 2 );
function clientum_desde_price_html( $price_html, $product ) {
    if ( '' === $price_html ) {
        return $price_html;
    }
    return '<span class="clientum-desde">Desde</span> ' . $price_html;
}

/**
 * 4) Ocultar completamente precio + botón en productos a $0
 *    (por si en algún momento se importan cursos/tiles con precio 0).
 */
add_filter( 'woocommerce_get_price_html', function ( $price_html, $product ) {
    if ( $product->get_price() == 0 ) {
        return '<span class="clientum-gratis">Consultar disponibilidad</span>';
    }
    return $price_html;
}, 20, 2 );

/**
 * 5) Precarga el campo "Servicio de interés" en el formulario de contacto
 *    (Contact Form 7 / Gravity Forms / WPForms — ajustar al plugin real).
 *    Ejemplo genérico via shortcode attribute con JS mínimo:
 */
add_action( 'wp_footer', function () {
    if ( ! is_page() || ! isset( $_GET['servicio'] ) ) {
        return;
    }
    $servicio = esc_js( sanitize_text_field( wp_unslash( $_GET['servicio'] ) ) );
    ?>
    <script>
    document.addEventListener('DOMContentLoaded', function () {
        var field = document.querySelector('[name="servicio-interes"], #servicio-interes');
        if (field) field.value = "<?php echo $servicio; ?>";
    });
    </script>
    <?php
} );
