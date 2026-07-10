<?php
$testimonials_query = new WP_Query([
    'post_type'      => 'clientum_testimonial',
    'posts_per_page' => 4,
    'post_status'    => 'publish',
]);

$testimonials = [];
if ($testimonials_query->have_posts()) {
    while ($testimonials_query->have_posts()) {
        $testimonials_query->the_post();
        $testimonials[] = [
            'text'    => get_the_content(),
            'author'  => get_the_title(),
            'company' => get_post_meta(get_the_ID(), '_company', true),
            'rating'  => (int)(get_post_meta(get_the_ID(), '_rating', true) ?: 5),
        ];
    }
    wp_reset_postdata();
} else {
    // Default testimonials
    $testimonials = [
        ['text' => 'Implementamos Clientum en 5 días. El bot de WhatsApp nos generó 40% más de consultas en el primer mes sin contratar nadie. Los reportes automáticos cambiaron la forma en que tomamos decisiones.', 'author' => 'Martín R.', 'company' => 'Distribuidora del Sur S.A. — Neuquén', 'rating' => 5],
        ['text' => 'El 60% de nuestras reservas ahora se hacen solas por el bot de WhatsApp. Redujimos notablemente las llamadas perdidas y aumentamos la facturación en un solo trimestre.', 'author' => 'Sofía G.', 'company' => 'Delicias Gourmet — Bariloche', 'rating' => 5],
        ['text' => 'Logramos coordinar todas nuestras operaciones con la mitad del esfuerzo. El sistema automatizado nos ahorró horas de trabajo administrativo cada semana.', 'author' => 'Gustavo B.', 'company' => 'Servicios Patagónicos — General Roca', 'rating' => 5],
        ['text' => 'La integración con AFIP fue increíble. Ahora facturamos desde el mismo CRM sin entrar al portal de AFIP. Ahorro de 3 horas semanales de administración.', 'author' => 'Gabriela S.', 'company' => 'Inmobiliaria del Valle — Cipolletti', 'rating' => 5],
    ];
}
?>

<div class="text-center mb-12">
  <span class="text-[#1A3461] text-[10px] font-black uppercase tracking-widest font-mono">Testimonios</span>
  <h2 class="text-2xl md:text-3xl font-black text-slate-900 mt-2">Lo que dicen nuestros clientes</h2>
</div>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
  <?php foreach ($testimonials as $t): ?>
    <div class="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-all">
      <div class="flex gap-1 mb-4">
        <?php for ($i = 0; $i < $t['rating']; $i++): ?>
          <span class="text-amber-400 text-sm">★</span>
        <?php endfor; ?>
      </div>
      <p class="text-slate-700 text-sm leading-relaxed mb-4 italic">"<?php echo esc_html($t['text']); ?>"</p>
      <div class="flex items-center gap-3 border-t border-slate-100 pt-4">
        <div class="w-9 h-9 rounded-full bg-[#1A3461] flex items-center justify-center text-white font-black text-xs shrink-0">
          <?php echo esc_html(strtoupper(substr($t['author'], 0, 1))); ?>
        </div>
        <div>
          <div class="font-black text-slate-900 text-xs"><?php echo esc_html($t['author']); ?></div>
          <div class="text-slate-500 text-[10px]"><?php echo esc_html($t['company']); ?></div>
        </div>
      </div>
    </div>
  <?php endforeach; ?>
</div>
