<?php
$faqs = [
  ['q' => '¿Qué servicios integrales ofrece exactamente Clientum?', 'a' => 'Clientum se especializa en consultoría de transformación digital. Ofrecemos desarrollo de sitios web e-commerce omnicanal, diseño de marcas sólidas (Branding), implementación personalizada de ERP y CRM integrados con facturación AFIP, Business Intelligence avanzado, consultoría en ciberseguridad y capacitación a través de Clientum Academia.'],
  ['q' => '¿Cuánto tiempo toma el desarrollo y puesta en marcha de un sitio web o CRM?', 'a' => 'Un sitio web o landing page profesional puede estar listo en un plazo de 4 a 6 semanas. Proyectos más complejos que involucren plataformas omnicanal de e-commerce o implementaciones profundas de ERP y CRM toman entre 8 y 12 semanas. Siempre trabajamos de forma ágil y por fases.'],
  ['q' => '¿Qué métodos de pago aceptan?', 'a' => 'Aceptamos pagos en pesos argentinos mediante transferencia bancaria, MercadoPago, y tarjetas de crédito internacionales. El IVA se aplica según la condición fiscal de tu empresa y la legislación vigente, detallándose con transparencia en el presupuesto.'],
  ['q' => '¿Ofrecen soporte técnico post-implementación?', 'a' => 'Sí, todos nuestros desarrollos e implementaciones cuentan con soporte amigable permanente. Ofrecemos mantenimiento continuo, copias de seguridad de bases de datos automáticas y asistencia telefónica u online 24/7 para que tu negocio nunca se detenga.'],
  ['q' => '¿Qué ventajas tiene Clientum sobre otras agencias tradicionales?', 'a' => 'Clientum combina un equipo creativo multidisciplinario con ingeniería de software rigurosa. Nacimos en General Roca, Río Negro, lo que nos da un entendimiento directo de las PyMEs del interior argentino, pero hoy expandimos soluciones con estándares y oficinas de alcance internacional.'],
  ['q' => '¿El Chatbot de WhatsApp funciona con mi número actual?', 'a' => 'Sí. Integramos el bot con tu número de WhatsApp Business existente o te asistimos en la creación de uno nuevo. El cliente recibe mensajes desde el mismo número que ya conoce y confía.'],
];
?>
<div class="space-y-3" id="faq-accordion">
  <?php foreach ($faqs as $i => $faq): ?>
    <div class="border border-slate-200 rounded-2xl overflow-hidden">
      <button
        class="w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-white hover:bg-slate-50 transition-colors faq-toggle"
        data-index="<?php echo $i; ?>"
        aria-expanded="false">
        <span class="font-bold text-slate-900 text-sm pr-4"><?php echo esc_html($faq['q']); ?></span>
        <svg class="w-4 h-4 text-slate-400 shrink-0 faq-icon transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      <div class="faq-content hidden px-5 pb-5 bg-white">
        <p class="text-slate-500 text-sm leading-relaxed"><?php echo esc_html($faq['a']); ?></p>
      </div>
    </div>
  <?php endforeach; ?>
</div>
