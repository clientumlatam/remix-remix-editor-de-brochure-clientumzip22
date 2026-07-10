<?php
$phone   = clientum_opt('clientum_phone', '+54 298 451-0883');
$email   = clientum_opt('clientum_email', 'info@clientum.com.ar');
$address = clientum_opt('clientum_address', 'General Roca, Río Negro, Argentina');
$wa      = clientum_opt('clientum_whatsapp', '5492984510883');
?>

<!-- ── NEWSLETTER STRIP ──────────────────────────────────────────────────────── -->
<section class="bg-[#0d1f3c] border-t border-slate-800 py-12 px-6">
  <div class="max-w-3xl mx-auto text-center">
    <span class="text-emerald-400 text-xs font-black uppercase tracking-widest font-mono">Newsletter</span>
    <h3 class="text-white font-black text-2xl md:text-3xl mt-2 mb-3">Recibí tips de CRM y automatización</h3>
    <p class="text-slate-400 text-sm mb-6">Contenido exclusivo cada semana para PyMEs que quieren crecer con tecnología.</p>
    <form id="newsletter-form" class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <input type="email" id="newsletter-email" required placeholder="tu@empresa.com"
        class="flex-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none">
      <button type="submit"
        class="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase px-6 py-3 rounded-xl tracking-wider transition-all shrink-0">
        Suscribirme
      </button>
    </form>
    <p id="newsletter-success" class="hidden text-emerald-400 text-sm mt-3 font-semibold">✓ ¡Gracias por suscribirte!</p>
  </div>
</section>

<!-- ── FOOTER ────────────────────────────────────────────────────────────────── -->
<footer class="bg-slate-950 border-t border-slate-800 pt-16 pb-8 px-6 text-slate-400">
  <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

    <!-- Brand -->
    <div class="lg:col-span-1">
      <div class="flex items-center gap-2 mb-4">
        <div class="w-8 h-8 bg-[#1A3461] rounded-lg flex items-center justify-center shrink-0">
          <svg width="18" height="18" viewBox="0 0 180 180" fill="none">
            <rect width="180" height="180" rx="36" fill="#1A3461"/>
            <line x1="90" y1="28" x2="152" y2="90" stroke="white" stroke-width="11" stroke-linecap="round"/>
            <line x1="152" y1="90" x2="90" y2="152" stroke="white" stroke-width="11" stroke-linecap="round"/>
            <line x1="90" y1="152" x2="28" y2="90" stroke="white" stroke-width="11" stroke-linecap="round"/>
            <line x1="28" y1="90" x2="90" y2="28" stroke="white" stroke-width="11" stroke-linecap="round"/>
            <circle cx="90" cy="28" r="14" fill="white"/>
            <circle cx="152" cy="90" r="14" fill="white"/>
            <circle cx="90" cy="152" r="14" fill="white"/>
            <circle cx="28" cy="90" r="14" fill="white"/>
          </svg>
        </div>
        <span class="font-black text-white text-lg tracking-tight">CLIENTUM</span>
      </div>
      <p class="text-slate-500 text-xs leading-relaxed mb-4">
        Plataforma All-in-One para PyMEs argentinas. CRM, Chatbot WhatsApp, E-Commerce, ERP y BI — todo en un solo ecosistema.
      </p>
      <div class="flex gap-3">
        <a href="https://wa.me/<?php echo esc_attr($wa); ?>" target="_blank" rel="noopener"
           class="p-2.5 bg-slate-900 hover:bg-emerald-500/20 rounded-lg transition-all group border border-slate-800">
          <svg class="w-4 h-4 text-slate-500 group-hover:text-emerald-400" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </a>
        <a href="mailto:<?php echo esc_attr($email); ?>"
           class="p-2.5 bg-slate-900 hover:bg-blue-500/20 rounded-lg transition-all group border border-slate-800">
          <svg class="w-4 h-4 text-slate-500 group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
        </a>
      </div>
    </div>

    <!-- Servicios -->
    <div>
      <h4 class="text-white text-xs font-black uppercase tracking-widest mb-4">Servicios</h4>
      <ul class="space-y-2">
        <?php foreach (['Chatbot WhatsApp', 'CRM Inteligente', 'Asistente IA', 'E-Commerce', 'ERP & Facturación AFIP', 'Business Intelligence', 'Ciberseguridad', 'Desarrollo Web'] as $s): ?>
          <li><a href="<?php echo esc_url(home_url('/#servicios')); ?>" class="text-slate-500 hover:text-emerald-400 text-xs transition-colors"><?php echo esc_html($s); ?></a></li>
        <?php endforeach; ?>
      </ul>
    </div>

    <!-- Empresa -->
    <div>
      <h4 class="text-white text-xs font-black uppercase tracking-widest mb-4">Empresa</h4>
      <ul class="space-y-2">
        <?php
        $company_links = [
          'Inicio'      => home_url('/'),
          'Nosotros'    => home_url('/#nosotros'),
          'Portafolio'  => home_url('/portafolio/'),
          'Academia'    => home_url('/academia/'),
          'Blog'        => home_url('/blog/'),
          'Precios'     => home_url('/#planes'),
          'Contacto'    => home_url('/#contacto'),
        ];
        foreach ($company_links as $label => $url): ?>
          <li><a href="<?php echo esc_url($url); ?>" class="text-slate-500 hover:text-blue-400 text-xs transition-colors"><?php echo esc_html($label); ?></a></li>
        <?php endforeach; ?>
      </ul>
    </div>

    <!-- Contacto -->
    <div>
      <h4 class="text-white text-xs font-black uppercase tracking-widest mb-4">Contacto</h4>
      <ul class="space-y-3">
        <li class="flex items-start gap-2">
          <svg class="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          <span class="text-slate-500 text-xs leading-relaxed"><?php echo esc_html($address); ?></span>
        </li>
        <li class="flex items-center gap-2">
          <svg class="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
          <a href="tel:<?php echo esc_attr(preg_replace('/\s+/', '', $phone)); ?>" class="text-slate-500 hover:text-white text-xs transition-colors"><?php echo esc_html($phone); ?></a>
        </li>
        <li class="flex items-center gap-2">
          <svg class="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          <a href="mailto:<?php echo esc_attr($email); ?>" class="text-slate-500 hover:text-white text-xs transition-colors"><?php echo esc_html($email); ?></a>
        </li>
      </ul>
      <div class="mt-6">
        <a href="<?php echo esc_url(home_url('/#contacto')); ?>"
           class="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-[10px] uppercase px-4 py-2.5 rounded-lg tracking-wider transition-all">
          Solicitar Demo Gratis
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 17L17 7M17 7H7M17 7v10"/></svg>
        </a>
      </div>
    </div>
  </div>

  <!-- Bottom Bar -->
  <div class="border-t border-slate-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
    <p class="text-slate-600 text-[11px]">
      © <?php echo date('Y'); ?> Clientum. Todos los derechos reservados. Hecho con ❤️ en la Patagonia, Argentina.
    </p>
    <div class="flex gap-4">
      <a href="<?php echo esc_url(get_privacy_policy_url()); ?>" class="text-slate-600 hover:text-slate-400 text-[11px] transition-colors">Privacidad</a>
      <a href="<?php echo esc_url(home_url('/terminos/')); ?>" class="text-slate-600 hover:text-slate-400 text-[11px] transition-colors">Términos</a>
    </div>
  </div>
</footer>

<!-- WhatsApp Floating Button -->
<a href="https://wa.me/<?php echo esc_attr($wa); ?>?text=Hola%2C%20quiero%20saber%20m%C3%A1s%20sobre%20Clientum"
   target="_blank" rel="noopener"
   class="fixed bottom-6 right-6 z-50 bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-full shadow-2xl shadow-emerald-900/50 transition-all hover:scale-110 flex items-center justify-center"
   title="Contactanos por WhatsApp">
  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
</a>

<?php wp_footer(); ?>
</body>
</html>
