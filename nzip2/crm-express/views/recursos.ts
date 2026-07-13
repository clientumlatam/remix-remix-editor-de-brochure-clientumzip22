export function recursosPage(): string {
  const recursos = [
    { type:'📄 Guía', title:'Guía completa: CRM para PyMEs', desc:'Todo lo que necesitás saber para implementar un CRM en tu empresa desde cero.', badge:'PDF · 24 páginas', color:'badge-green' },
    { type:'🎬 Video', title:'Cómo configurar el chatbot en 30 minutos', desc:'Tutorial paso a paso para dejar tu bot de WhatsApp funcionando hoy mismo.', badge:'Video · 32 min', color:'badge-green' },
    { type:'📊 Plantilla', title:'Plantilla de pipeline de ventas', desc:'Hoja de cálculo lista para usar. Compatible con Clientum y con Excel/Google Sheets.', badge:'Excel / Google Sheets', color:'badge-green' },
    { type:'📄 Guía', title:'Automatización de seguimientos: recetas listas', desc:'10 flujos de automatización que podés activar en tu cuenta en menos de 5 minutos.', badge:'PDF · 16 páginas', color:'badge-green' },
    { type:'🎬 Webinar', title:'Caso de éxito: Distribuidora Patagónica', desc:'Cómo pasaron de planillas a CRM en 7 días. Grabación del webinar con preguntas y respuestas.', badge:'Webinar · 55 min', color:'badge-green' },
    { type:'📊 Plantilla', title:'Calculadora de ROI para tu PyME', desc:'Calculá cuánto tiempo y dinero podés ahorrar con automatización. Resultados en tiempo real.', badge:'Google Sheets interactivo', color:'badge-green' },
    { type:'📄 Checklist', title:'Onboarding en 7 días: checklist completo', desc:'Todo lo que necesitás hacer en tu primera semana con Clientum. Paso a paso, sin saltear nada.', badge:'PDF · 8 páginas', color:'badge-green' },
    { type:'🎬 Video', title:'Integración con facturación AFIP', desc:'Conectá tu cuenta de Clientum con AFIP y emitir facturas en 30 segundos.', badge:'Video · 18 min', color:'badge-green' },
    { type:'📄 Ebook', title:'IA aplicada a PyMEs argentinas', desc:'Casos reales, mitos y realidades. Qué puede y qué no puede hacer la IA por tu negocio hoy.', badge:'Ebook · 48 páginas', color:'badge-green' },
  ];

  return `
<section class="section" style="padding-top:120px">
  <div class="container">
    <div class="section-header">
      <span class="section-label">Centro de Recursos</span>
      <h1>Todo lo que necesitás para crecer</h1>
      <p>Guías, videos, plantillas y webinars pensados para PyMEs argentinas. Gratis para todos los usuarios.</p>
    </div>

    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:48px">
      ${['Todos','Guías','Videos','Plantillas','Webinars','Ebooks'].map((c,i)=>`
      <button class="btn ${i===0?'btn-primary':'btn-ghost'}" style="font-size:.8rem;padding:6px 16px">${c}</button>`).join('')}
    </div>

    <div class="card-grid card-grid-3">
      ${recursos.map(r=>`
      <div class="card" style="display:flex;flex-direction:column;cursor:pointer">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <span style="font-size:.75rem;font-weight:600;color:var(--text-muted)">${r.type}</span>
          <span class="badge ${r.color}" style="font-size:.7rem">${r.badge}</span>
        </div>
        <h3 style="font-size:1rem;margin-bottom:10px;flex:1">${r.title}</h3>
        <p style="font-size:.875rem;color:var(--text-muted);margin-bottom:20px">${r.desc}</p>
        <button class="btn btn-ghost" style="width:100%;justify-content:center;font-size:.875rem">Descargar gratis</button>
      </div>`).join('')}
    </div>
  </div>
</section>

<section class="section" style="background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border)">
  <div class="container" style="max-width:640px;text-align:center">
    <span class="section-label">Academia</span>
    <h2>¿Preferís aprender en formato curso?</h2>
    <p style="margin-bottom:28px">La Academia Clientum tiene más de 30 lecciones en video, organizadas por nivel y función.</p>
    <a href="/academia" class="btn btn-primary">Ir a la Academia →</a>
  </div>
</section>

<div class="cta-section">
  <div class="container">
    <h2>Accedé a todos los recursos</h2>
    <p>Creá tu cuenta gratis y desbloqueá guías, plantillas y el acceso completo a la Academia.</p>
    <div class="cta-actions"><a href="/register" class="btn btn-primary btn-lg">Crear cuenta gratis →</a></div>
  </div>
</div>`;
}
