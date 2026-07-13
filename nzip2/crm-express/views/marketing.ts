export function marketingPage(): string {
  return `
<section class="section" style="padding-top:120px">
  <div class="container">
    <div class="hero-grid" style="align-items:center">
      <div class="fade-up">
        <span class="section-label">Marketing Digital</span>
        <h1>Marketing conectado a tu CRM. Medís cada peso que invertís.</h1>
        <p class="lead" style="margin-top:16px">Estrategias digitales integradas directamente con Clientum. Cada lead que llega de Google, Instagram o email entra al CRM automáticamente para que nadie se pierda.</p>
        <div style="display:flex;gap:12px;margin-top:32px;flex-wrap:wrap">
          <a href="/contacto" class="btn btn-primary btn-lg">Hablar con un experto</a>
          <a href="/precios" class="btn btn-ghost btn-lg">Ver precios</a>
        </div>
      </div>
      <div class="card" style="background:var(--surface)">
        <div style="margin-bottom:20px;font-weight:600">Dashboard de campañas</div>
        <div style="display:flex;flex-direction:column;gap:12px">
          ${[
            { canal:'Google Ads', leads:'47', costo:'$18.200', conv:'38%' },
            { canal:'Meta/Instagram', leads:'82', costo:'$12.400', conv:'29%' },
            { canal:'Email mkt', leads:'23', costo:'$3.100', conv:'52%' },
            { canal:'WhatsApp orgánico', leads:'134', costo:'$0', conv:'68%' },
          ].map(r=>`
          <div style="display:grid;grid-template-columns:1fr auto auto auto;gap:12px;padding:10px 12px;background:var(--bg);border-radius:var(--radius);border:1px solid var(--border);align-items:center;font-size:.8rem">
            <span style="font-weight:500">${r.canal}</span>
            <span><span style="color:var(--text-muted)">Leads:</span> <strong>${r.leads}</strong></span>
            <span><span style="color:var(--text-muted)">Costo:</span> <strong>${r.costo}</strong></span>
            <span class="badge badge-green">${r.conv}</span>
          </div>`).join('')}
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section" style="background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border)">
  <div class="container">
    <div class="section-header"><span class="section-label">Servicios</span><h2>Qué incluye el servicio de marketing</h2></div>
    <div class="card-grid card-grid-3">
      ${[
        { icon:'🎯', title:'Google Ads', desc:'Campañas de búsqueda y display orientadas a tu cliente ideal. Solo pagás por clicks relevantes.' },
        { icon:'📱', title:'Meta & Instagram Ads', desc:'Anuncios en redes sociales con targeting preciso por zona, intereses y comportamiento.' },
        { icon:'📧', title:'Email Marketing', desc:'Secuencias automáticas, newsletters y campañas segmentadas desde el CRM de Clientum.' },
        { icon:'🔍', title:'SEO', desc:'Posicionamiento orgánico en Google. Contenido, técnica y linkbuilding para tu rubro.' },
        { icon:'💬', title:'WhatsApp Marketing', desc:'Campañas de difusión y flujos de nurturing integrados al chatbot de Clientum.' },
        { icon:'📊', title:'Reportes unificados', desc:'Todo en un dashboard. Cuánto gastaste, cuántos leads entraron y cuántos se convirtieron.' },
      ].map(s=>`
      <div class="feature-card">
        <div class="card-icon">${s.icon}</div>
        <h3>${s.title}</h3>
        <p>${s.desc}</p>
      </div>`).join('')}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="hero-grid" style="align-items:center">
      <div>
        <span class="section-label">La diferencia</span>
        <h2>Marketing que habla con tu CRM</h2>
        <div style="display:flex;flex-direction:column;gap:16px;margin-top:24px">
          ${[
            ['Sin Clientum','Con Clientum'],
            ['Leads en planillas separadas','Leads automáticos en el CRM'],
            ['No sabés qué campaña convierte','Atribución real por canal'],
            ['Seguimiento manual por vendedor','Flujos automáticos de nurturing'],
            ['Reportes armados a mano','Dashboard unificado en tiempo real'],
          ].slice(1).map(([a,b])=>`
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div style="padding:12px 16px;background:rgba(239,68,68,.05);border:1px solid rgba(239,68,68,.2);border-radius:var(--radius);font-size:.875rem;color:var(--text-muted)">❌ ${a}</div>
            <div style="padding:12px 16px;background:rgba(34,197,94,.05);border:1px solid rgba(34,197,94,.2);border-radius:var(--radius);font-size:.875rem">✓ ${b}</div>
          </div>`).join('')}
        </div>
      </div>
      <div class="card card-sm" style="background:var(--surface)">
        <h3 style="margin-bottom:20px">Desde $200.000/mes</h3>
        <ul style="list-style:none;display:flex;flex-direction:column;gap:10px;margin-bottom:24px">
          ${['Gestión de 2 canales digitales','Integración completa con Clientum CRM','Reportes mensuales de performance','Atención dedicada por WhatsApp','Estrategia y creatividades incluidas'].map(i=>`<li style="font-size:.875rem;display:flex;gap:8px"><span style="color:var(--green)">✓</span>${i}</li>`).join('')}
        </ul>
        <a href="/contacto" class="btn btn-primary" style="width:100%;justify-content:center">Pedir propuesta</a>
      </div>
    </div>
  </div>
</section>

<div class="cta-section">
  <div class="container">
    <h2>Más leads, mejor convertidos</h2>
    <p>Marketing integrado con el CRM para que cada peso invertido se mida y se optimice.</p>
    <div class="cta-actions"><a href="/contacto" class="btn btn-primary btn-lg">Pedir propuesta →</a></div>
  </div>
</div>`;
}
