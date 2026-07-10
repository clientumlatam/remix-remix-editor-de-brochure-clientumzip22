<div class="bg-slate-950/80 border border-slate-800 p-8 rounded-2xl shadow-2xl relative">
  <div class="absolute top-0 right-0 transform translate-x-3 -translate-y-3 bg-emerald-500 text-slate-950 text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-md shadow-md">
    En Vivo
  </div>
  <h3 class="font-black text-lg text-white mb-1">Solicitá un Presupuesto Gratuito</h3>
  <p class="text-slate-400 text-[11px] mb-6">Cargá tus datos y el equipo de Clientum te enviará una demo adaptada a tu escala.</p>
  <form id="hero-contact-form" class="flex flex-col gap-3">
    <?php wp_nonce_field('clientum_nonce', 'clientum_nonce_field'); ?>
    <div>
      <label class="block text-[10px] uppercase font-bold text-slate-400 mb-1">Tu Nombre *</label>
      <input type="text" name="nombre" required placeholder="Ej. Martín Rodríguez"
        class="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-2.5 text-xs focus:border-emerald-500 focus:outline-none">
    </div>
    <div>
      <label class="block text-[10px] uppercase font-bold text-slate-400 mb-1">Correo Electrónico *</label>
      <input type="email" name="email" required placeholder="Ej. martin@empresa.com"
        class="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-2.5 text-xs focus:border-blue-600 focus:outline-none">
    </div>
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="block text-[10px] uppercase font-bold text-slate-400 mb-1">Empresa</label>
        <input type="text" name="empresa" placeholder="Ej. Distribuidora Sur"
          class="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-2.5 text-xs focus:border-blue-600 focus:outline-none">
      </div>
      <div>
        <label class="block text-[10px] uppercase font-bold text-slate-400 mb-1">Servicio de Interés</label>
        <select name="servicio" class="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-2.5 text-xs focus:border-blue-600 focus:outline-none">
          <option value="E-Commerce">E-Commerce Web</option>
          <option value="ERP-CRM">ERP &amp; CRM Integrado</option>
          <option value="Chatbot">Chatbot WhatsApp</option>
          <option value="Consultoria">Consultoría General</option>
          <option value="Ciberseguridad">Ciberseguridad</option>
        </select>
      </div>
    </div>
    <div id="hero-form-error" class="hidden text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2"></div>
    <div id="hero-form-success" class="hidden text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800 rounded-lg px-3 py-2">
      ✓ ¡Gracias! Te contactamos en menos de 24 horas.
    </div>
    <button type="submit" id="hero-form-btn"
      class="mt-2 w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-2.5 rounded-lg text-xs uppercase tracking-wider transition-all">
      Enviar Solicitud
    </button>
  </form>
</div>
