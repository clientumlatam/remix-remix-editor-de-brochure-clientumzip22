<?php
/**
 * Clientum — [ctm_calculadora_planes]
 * Pegar en el child theme: functions.php
 *
 * Slider "Cantidad de Proyectos" que recomienda un plan según el rango.
 * Los umbrales deben ajustarse a un criterio de negocio real (acá van
 * valores de ejemplo tomados de la estructura de 5 planes del CSV 03-planes-5.csv).
 */
add_shortcode( 'ctm_calculadora_planes', function ( $atts ) {

    // Traer los 5 planes reales desde WooCommerce por SKU (PLN-*)
    $skus = array(
        'inicial'      => 'PLN-inicial',
        'pyme'         => 'PLN-pyme',
        'pro'          => 'PLN-pro',
        'corporativo'  => 'PLN-corporativo',
        'especializado'=> 'PLN-especializado',
    );

    $planes = array();
    foreach ( $skus as $key => $sku ) {
        $product_id = wc_get_product_id_by_sku( $sku );
        if ( ! $product_id ) {
            continue;
        }
        $product = wc_get_product( $product_id );
        $planes[ $key ] = array(
            'nombre'      => $product->get_name(),
            'precio'      => $product->get_price(),
            'descripcion' => $product->get_short_description(),
            'url'         => get_permalink( $product_id ),
        );
    }

    if ( empty( $planes ) ) {
        return '<p>Los planes todavía no están cargados en WooCommerce.</p>';
    }

    ob_start();
    ?>
    <div class="ctm-calculadora" data-planes='<?php echo esc_attr( wp_json_encode( $planes ) ); ?>'>
        <div class="ctm-calculadora__intro">
            <h3>Calculador Comparativo Inteligente de Planes</h3>
            <p>Mové la barra para simular la escala de tu negocio. Te recomendamos el plan exacto.</p>
        </div>

        <div class="ctm-calculadora__body">
            <div class="ctm-calculadora__slider-col">
                <label for="ctm-proyectos">Cantidad de Proyectos: <span id="ctm-proyectos-valor">Hasta 10</span></label>
                <input type="range" id="ctm-proyectos" min="0" max="4" value="1" step="1">
                <ul class="ctm-calculadora__incluye">
                    <li>Aplicación de escritorio y móvil</li>
                    <li>Estimaciones de tiempos operacionales</li>
                    <li>Facturación integrada y link de cobros</li>
                    <li>Reportes automatizados de métricas</li>
                </ul>
            </div>
            <div class="ctm-calculadora__resultado">
                <span class="ctm-calculadora__label">Plan recomendado para ti</span>
                <h4 id="ctm-plan-nombre"></h4>
                <p id="ctm-plan-desc"></p>
                <div class="ctm-calculadora__precio">
                    $<span id="ctm-plan-precio"></span><small>/ MES</small>
                </div>
                <a id="ctm-plan-cta" href="#" class="button">Contratar plan recomendado</a>
            </div>
        </div>
    </div>

    <script>
    document.addEventListener('DOMContentLoaded', function () {
        var wrap = document.querySelector('.ctm-calculadora');
        if (!wrap) return;

        var planes = JSON.parse(wrap.dataset.planes);
        var order = ['inicial', 'pyme', 'pro', 'corporativo', 'especializado'];
        var labels = ['Hasta 10', 'Hasta 50', 'Hasta 200', 'Hasta 500', 'Ilimitado'];

        var slider = document.getElementById('ctm-proyectos');
        var valorEl = document.getElementById('ctm-proyectos-valor');
        var nombreEl = document.getElementById('ctm-plan-nombre');
        var descEl = document.getElementById('ctm-plan-desc');
        var precioEl = document.getElementById('ctm-plan-precio');
        var ctaEl = document.getElementById('ctm-plan-cta');

        function render() {
            var key = order[slider.value];
            var plan = planes[key];
            if (!plan) return;
            valorEl.textContent = labels[slider.value];
            nombreEl.textContent = plan.nombre;
            descEl.textContent = plan.descripcion;
            precioEl.textContent = plan.precio;
            ctaEl.href = plan.url;
        }

        slider.addEventListener('input', render);
        render();
    });
    </script>
    <?php
    return ob_get_clean();
} );
