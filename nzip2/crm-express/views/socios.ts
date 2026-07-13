export function sociosPage(): string {
  return `
<section class="section" style="padding-top:120px">
  <div class="container">
    <div class="section-header">
      <span class="section-label">Programa de Socios</span>
      <h1>Crecé con Clientum. Ganá por cada PyME que ayudés.</h1>
      <p>Consultores, agencias, contadores e integradores: unite al programa de socios y monetizá tu red de contactos con comisiones recurrentes.</p>
      <div style="display:flex;gap:12px;justify-content:center;margin-top:28px;flex-wrap:wrap">
        <a href="/contacto" class="btn btn-primary">Quiero ser socio</a>
        <a href="/precios" class="btn btn-ghost">Ver comisiones</a>
      </div>
    </div>

    <div class="card-grid card-grid-3" style="margin-top:64px">
      ${[
        { icon:'💰', title:'Comisiones recurrentes', desc:'Ganás el 20% mensual de cada cliente que referís, mientras sigan activos. Sin techo.' },
        { icon:'🛠️', title:'Material y capacitación', desc:'Demos, materiales de venta, sandbox de prueba y capacitación técnica sin costo.' },
        { icon:'🤝', title:'Soporte dedicado', desc:'Canal directo con el equipo de Clientum. Respondemos en menos de 2 horas.' },
        { icon:'📊', title:'Dashboard de socios', desc:'Seguí tus referidos, comisiones y estado de cada cuenta desde un panel propio.' },
        { icon:'🏆', title:'Programa de niveles', desc:'Silver, Gold y Platinum. A más clientes, más comisión y más beneficios exclusivos.' },
        { icon:'🎯', title:'Leads compartidos', desc:'En algunas regiones compartimos oportunidades de nuestro equipo comercial con socios certificados.' },
      ].map(s=>`
      <div class="feature-card">
        <div class="card-icon">${s.icon}</div>
        <h3>${s.title}</h3>
        <p>${s.desc}</p>
      </div>`).join('')}
    </div>
  </div>
</section>

<section class="section" style="background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border)">
  <div class="container">
    <div class="section-header"><span class="section-label">Niveles</span><h2>Cómo funciona el programa</h2></div>
    <div class="card-grid card-grid-3">
      ${[
        { nivel:'Silver', req:'1–5 clientes activos', comision:'20%', extras:['Materiales de venta','Capacitación inicial','Soporte por email'] },
        { nivel:'Gold', req:'6–20 clientes activos', comision:'25%', extras:['Todo Silver','Dashboard de socios','Canal WhatsApp dedicado','Co-branding opcional'] },
        { nivel:'Platinum', req:'+20 clientes activos', comision:'30%', extras:['Todo Gold','Leads compartidos','SLA prioritario','Account Manager propio'] },
      ].map((n,i)=>`
      <div class="pricing-card${i===1?' featured':''}">
        ${i===1?'<div class="pricing-badge">Más popular</div>':''}
        <div class="pricing-name">${n.nivel}</div>
        <div class="pricing-price">${n.comision} <span>comisión</span></div>
        <p class="pricing-desc">${n.req}</p>
        <ul class="pricing-features">
          ${n.extras.map(e=>`<li>${e}</li>`).join('')}
        </ul>
      </div>`).join('')}
    </div>
  </div>
</section>

<section class="section">
  <div class="container" style="max-width:640px">
    <div class="section-header"><span class="section-label">¿Para quién?</span><h2>Tipos de socios que trabajamos</h2></div>
    <div style="display:flex;flex-direction:column;gap:16px">
      ${[
        ['💼','Consultores de negocio','Asesoran PyMEs y añaden Clientum como herramienta de su metodología.'],
        ['📣','Agencias de marketing','Integran CRM y automatización en sus servicios para clientes.'],
        ['📋','Estudios contables','Ofrecen Clientum a sus clientes como solución de gestión integral.'],
        ['🔧','Integradores tecnológicos','Implementan ERP, conectan sistemas y añaden la capa de CRM e IA.'],
      ].map(([i,t,d])=>`
      <div style="display:flex;gap:16px;align-items:flex-start;padding:20px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius)">
        <span style="font-size:1.8rem">${i}</span>
        <div><h4 style="margin-bottom:6px">${t}</h4><p style="font-size:.875rem;color:var(--text-muted)">${d}</p></div>
      </div>`).join('')}
    </div>
  </div>
</section>

<div class="cta-section">
  <div class="container">
    <h2>Unite al programa de socios</h2>
    <p>Sin inversión inicial. Empezás a ganar desde el primer cliente.</p>
    <div class="cta-actions"><a href="/contacto" class="btn btn-primary btn-lg">Aplicar ahora →</a></div>
  </div>
</div>`;
}
