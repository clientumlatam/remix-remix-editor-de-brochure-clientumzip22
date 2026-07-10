<?php get_header(); ?>

<div class="min-h-[60vh] flex items-center justify-center px-6 py-20">
  <div class="text-center">
    <div class="text-8xl font-black text-slate-200 mb-4">404</div>
    <h1 class="text-2xl font-black text-slate-900 mb-3">Página no encontrada</h1>
    <p class="text-slate-500 text-sm mb-8 max-w-md mx-auto">La página que buscás no existe o fue movida. Pero podemos ayudarte a encontrar lo que necesitás.</p>
    <div class="flex flex-col sm:flex-row gap-3 justify-center">
      <a href="<?php echo home_url('/'); ?>" class="bg-[#1A3461] hover:bg-[#0d1f3c] text-white font-bold text-xs uppercase px-6 py-3 rounded-xl tracking-wider transition-all">
        ← Volver al inicio
      </a>
      <a href="<?php echo home_url('/#contacto'); ?>" class="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs uppercase px-6 py-3 rounded-xl tracking-wider transition-all">
        Contactar soporte
      </a>
    </div>
  </div>
</div>

<?php get_footer(); ?>
