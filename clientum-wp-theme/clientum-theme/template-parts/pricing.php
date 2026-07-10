<div class="text-center mb-14">
  <span class="text-[#1A3461] text-[10px] font-black uppercase tracking-widest font-mono">Planes & Precios</span>
  <h2 class="text-3xl md:text-4xl font-black text-slate-900 mt-2">Transparente. Sin sorpresas.</h2>
  <p class="text-slate-500 text-sm mt-3 max-w-xl mx-auto">Todos los planes incluyen implementación en 5 días, soporte en español y sin contrato mínimo.</p>
</div>

<div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
  <?php
  $plans = [
    [
      'name' => 'Clientum Starter',
      'badge' => '',
      'price' => '$180.000',
      'period' => '/mes',
      'desc' => 'Ideal para iniciar la automatización de tu negocio.',
      'features' => ['Chatbot WhatsApp — 500 conv/mes', 'CRM básico hasta 3 usuarios', 'Panel de reportes estándar', 'Soporte por email', 'Implementación en 5 días'],
      'cta' => 'Empezar →',
      'highlight' => false,
    ],
    [
      'name' => 'Clientum Pro',
      'badge' => 'Más popular',
      'price' => '$350.000',
      'period' => '/mes',
      'desc' => 'La solución completa para PyMEs en crecimiento.',
      'features' => ['Chatbot WhatsApp ilimitado', 'CRM completo usuarios ilimitados', 'Facturación AFIP integrada', 'Asistente IA + Reportes avanzados', 'Soporte 24/7 prioritario', 'E-Commerce integrado'],
      'cta' => 'Empezar →',
      'highlight' => true,
    ],
    [
      'name' => 'Clientum Enterprise',
      'badge' => '',
      'price' => 'A medida',
      'period' => '',
      'desc' => 'Soluciones custom para empresas con necesidades complejas.',
      'features' => ['Todo lo de Pro incluido', 'ERP personalizado', 'Integraciones a medida', 'Desarrollo de apps móviles', 'SLA garantizado 99.9%', 'Consultor dedicado'],
      'cta' => 'Contactar →',
      'highlight' => false,
    ],
  ];
  foreach ($plans as $plan): ?>
    <div class="relative flex flex-col rounded-2xl border <?php echo $plan['highlight'] ? 'border-[#1A3461] shadow-xl shadow-blue-900/20 bg-[#0d1f3c] text-white scale-105' : 'border-slate-200 bg-white text-slate-800'; ?> p-8">
      <?php if ($plan['badge']): ?>
        <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 text-[9px] font-black uppercase px-4 py-1 rounded-full tracking-wider">
          <?php echo esc_html($plan['badge']); ?>
        </div>
      <?php endif; ?>
      <h3 class="font-black text-base mb-1 <?php echo $plan['highlight'] ? 'text-white' : 'text-slate-900'; ?>"><?php echo esc_html($plan['name']); ?></h3>
      <p class="text-xs mb-4 <?php echo $plan['highlight'] ? 'text-slate-400' : 'text-slate-500'; ?>"><?php echo esc_html($plan['desc']); ?></p>
      <div class="mb-6">
        <span class="text-3xl font-black <?php echo $plan['highlight'] ? 'text-white' : 'text-slate-900'; ?>"><?php echo esc_html($plan['price']); ?></span>
        <?php if ($plan['period']): ?>
          <span class="text-xs <?php echo $plan['highlight'] ? 'text-slate-400' : 'text-slate-500'; ?>"><?php echo esc_html($plan['period']); ?></span>
        <?php endif; ?>
      </div>
      <ul class="space-y-2 mb-8 flex-1">
        <?php foreach ($plan['features'] as $f): ?>
          <li class="flex items-center gap-2 text-xs <?php echo $plan['highlight'] ? 'text-slate-300' : 'text-slate-600'; ?>">
            <span class="text-emerald-400 font-bold shrink-0">✓</span> <?php echo esc_html($f); ?>
          </li>
        <?php endforeach; ?>
      </ul>
      <a href="<?php echo esc_url(home_url('/#contacto')); ?>"
         class="w-full text-center py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all <?php echo $plan['highlight'] ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950' : 'bg-[#1A3461] hover:bg-[#0d1f3c] text-white'; ?>">
        <?php echo esc_html($plan['cta']); ?>
      </a>
    </div>
  <?php endforeach; ?>
</div>

<p class="text-center text-slate-400 text-xs mt-8">Todos los precios en pesos argentinos (ARS). IVA según condición fiscal. Sin contrato mínimo.</p>
