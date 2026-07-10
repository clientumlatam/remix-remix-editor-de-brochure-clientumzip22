<?php
$services_cpt = new WP_Query([
    'post_type'      => 'clientum_service',
    'posts_per_page' => 8,
    'post_status'    => 'publish',
    'orderby'        => 'menu_order',
    'order'          => 'ASC',
]);

if ($services_cpt->have_posts()): ?>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    <?php while ($services_cpt->have_posts()): $services_cpt->the_post();
      $price    = get_post_meta(get_the_ID(), '_service_price', true);
      $monthly  = get_post_meta(get_the_ID(), '_service_monthly', true);
      $bullets  = get_post_meta(get_the_ID(), '_service_bullets', true);
      $icon     = get_post_meta(get_the_ID(), '_service_icon', true) ?: '⚡';
    ?>
      <div class="bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-lg transition-all flex flex-col">
        <div class="text-2xl mb-3"><?php echo esc_html($icon); ?></div>
        <h3 class="font-black text-slate-900 text-sm mb-2"><?php the_title(); ?></h3>
        <p class="text-slate-500 text-xs leading-relaxed flex-1"><?php the_excerpt(); ?></p>
        <?php if ($bullets): $bullet_list = explode("\n", $bullets); ?>
          <ul class="mt-4 space-y-1">
            <?php foreach ($bullet_list as $b): if (!trim($b)) continue; ?>
              <li class="flex items-center gap-2 text-xs text-slate-600">
                <span class="text-emerald-500 font-bold">✓</span> <?php echo esc_html(trim($b)); ?>
              </li>
            <?php endforeach; ?>
          </ul>
        <?php endif; ?>
        <?php if ($price): ?>
          <div class="mt-4 pt-4 border-t border-slate-100">
            <span class="text-[#1A3461] font-black text-sm">$<?php echo esc_html(number_format((float)$price, 0, ',', '.')); ?></span>
            <span class="text-slate-400 text-[10px] ml-1"><?php echo $monthly ? '/mes' : 'único pago'; ?></span>
          </div>
        <?php endif; ?>
      </div>
    <?php endwhile; wp_reset_postdata(); ?>
  </div>
<?php else:
  // Default hardcoded services when no CPT posts yet
  $defaults = [
    ['icon' => '🌐', 'title' => 'Desarrollo Web & E-Commerce', 'desc' => 'Tiendas de alto rendimiento con MercadoPago integrado y diseño UX/UI responsivo.', 'bullets' => ['Tiendas WooCommerce y Shopify', 'Diseño UX/UI premium', 'Control de stock omnicanal']],
    ['icon' => '🤖', 'title' => 'Chatbot WhatsApp 24/7', 'desc' => 'Bot que responde, cotiza, agenda y deriva leads al CRM automáticamente.', 'bullets' => ['Conversaciones ilimitadas', 'Integración WhatsApp Business', 'Panel en tiempo real']],
    ['icon' => '📊', 'title' => 'CRM & Pipeline de Ventas', 'desc' => 'Kanban drag-drop, seguimiento automático y facturación AFIP integrada.', 'bullets' => ['Pipeline visual Kanban', 'Factura electrónica AFIP', 'Reportes automáticos']],
    ['icon' => '🧠', 'title' => 'Consultoría en IA & BI', 'desc' => 'Modelos IA a medida y tableros de Business Intelligence para PyMEs.', 'bullets' => ['Agentes IA a medida', 'Dashboards predictivos', 'Automatización de flujos']],
    ['icon' => '🛡️', 'title' => 'Ciberseguridad', 'desc' => 'Auditorías de seguridad, backups en la nube y protección de datos sensibles.', 'bullets' => ['Auditorías de vulnerabilidades', 'Backup automático', 'Respuesta ante incidentes']],
    ['icon' => '☁️', 'title' => 'Cloud Computing', 'desc' => 'Infraestructura en la nube escalable para tu PyME sin inversión inicial.', 'bullets' => ['AWS / Google Cloud', 'Migración asistida', 'Alta disponibilidad 99.9%']],
    ['icon' => '📱', 'title' => 'Aplicaciones Móviles', 'desc' => 'Apps iOS y Android para tu negocio con backend integrado al CRM.', 'bullets' => ['React Native cross-platform', 'Integración con CRM', 'Push notifications']],
    ['icon' => '🎓', 'title' => 'Formación & Academia', 'desc' => 'Capacitaciones para tu equipo en herramientas digitales y ventas modernas.', 'bullets' => ['Cursos online y presenciales', 'Certificaciones incluidas', 'Contenido en español']],
  ];
  ?>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    <?php foreach ($defaults as $s): ?>
      <div class="bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-lg transition-all">
        <div class="text-2xl mb-3"><?php echo $s['icon']; ?></div>
        <h3 class="font-black text-slate-900 text-sm mb-2"><?php echo esc_html($s['title']); ?></h3>
        <p class="text-slate-500 text-xs leading-relaxed mb-4"><?php echo esc_html($s['desc']); ?></p>
        <ul class="space-y-1">
          <?php foreach ($s['bullets'] as $b): ?>
            <li class="flex items-center gap-2 text-xs text-slate-600"><span class="text-emerald-500 font-bold">✓</span><?php echo esc_html($b); ?></li>
          <?php endforeach; ?>
        </ul>
      </div>
    <?php endforeach; ?>
  </div>
<?php endif; ?>
