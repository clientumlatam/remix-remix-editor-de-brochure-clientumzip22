<form id="main-contact-form" class="bg-white border border-slate-200 rounded-2xl p-8 space-y-4">
  <?php wp_nonce_field('clientum_nonce', 'clientum_nonce_contact'); ?>
  <div class="grid grid-cols-2 gap-4">
    <div>
      <label class="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Tu nombre *</label>
      <input type="text" name="nombre" required placeholder="Martín Rodríguez"
        class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:border-[#1A3461] focus:outline-none transition-colors">
    </div>
    <div>
      <label class="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Email *</label>
      <input type="email" name="email" required placeholder="martin@empresa.com"
        class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:border-[#1A3461] focus:outline-none transition-colors">
    </div>
  </div>
  <div class="grid grid-cols-2 gap-4">
    <div>
      <label class="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Empresa</label>
      <input type="text" name="empresa" placeholder="Distribuidora Sur S.A."
        class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:border-[#1A3461] focus:outline-none transition-colors">
    </div>
    <div>
      <label class="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Servicio de interés</label>
      <select name="servicio" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:border-[#1A3461] focus:outline-none transition-colors">
        <option>Chatbot WhatsApp</option>
        <option>CRM &amp; Pipeline</option>
        <option>E-Commerce Web</option>
        <option>ERP &amp; Facturación AFIP</option>
        <option>Consultoría General</option>
        <option>Ciberseguridad</option>
        <option>Business Intelligence</option>
      </select>
    </div>
  </div>
  <div>
    <label class="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Mensaje</label>
    <textarea name="mensaje" rows="4" placeholder="Contanos brevemente cuáles son tus necesidades..."
      class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:border-[#1A3461] focus:outline-none transition-colors resize-none"></textarea>
  </div>
  <div id="contact-form-error" class="hidden text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3"></div>
  <div id="contact-form-success" class="hidden text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
    ✓ ¡Gracias! Te contactamos en menos de 24 horas.
  </div>
  <button type="submit" id="contact-form-btn"
    class="w-full bg-[#1A3461] hover:bg-[#0d1f3c] text-white font-black py-3.5 rounded-xl text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2">
    Enviar Mensaje
    <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
  </button>
</form>
