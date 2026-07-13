export function implementacionPage(): string {
  return `
<section class="section" style="padding-top:120px">
  <div class="container">
    <div class="section-header">
      <span class="section-label">Implementación y Soporte</span>
      <h1>No te dejamos solo ni un solo día</h1>
      <p>El mejor software no sirve si no lo adoptó tu equipo. Por eso incluimos implementación guiada, capacitación y soporte continuo en todos nuestros planes.</p>
      <div style="display:flex;gap:12px;justify-content:center;margin-top:28px;flex-wrap:wrap">
        <a href="/contacto" class="btn btn-primary">Hablar con soporte</a>
        <a href="/academia" class="btn btn-ghost">Ir a la Academia</a>
      </div>
    </div>

    <div class="card-grid card-grid-3" style="margin-top:64px">
      ${[
        { icon:'🚀', title:'Onboarding guiado', desc:'Tu account manager te acompaña durante las primeras 2 semanas. Configuramos todo juntos.' },
        { icon:'🎓', title:'Capacitación del equipo', desc:'Sesiones en vivo o grabadas para que cada persona de tu empresa sepa usar su módulo.' },
        { icon:'💬', title:'Soporte por WhatsApp', desc:'Canal directo con el equipo técnico. Respondemos en menos de 2 horas en días hábiles.' },
        { icon:'📚', title:'Base de conocimiento', desc:'Más de 200 artículos de ayuda, tutoriales y videos. Disponibles 24/7 sin esperar.' },
        { icon:'🔧', title:'Migraciones de datos', desc:'Importamos tus contactos, historial y productos desde planillas o cualquier sistema anterior.' },
        { icon:'📈', title:'Check-ins de seguimiento', desc:'Cada 30 días revisamos métricas, uso y oportunidades de mejora con tu equipo.' },
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
  <div class="container" style="max-width:720px">
    <div class="section-header"><span class="section-label">Cronograma</span><h2>De cero a operativo en 7 días</h2></div>
    <div style="display:flex;flex-direction:column;gap:0">
      ${[
        ['Día 1','Kickoff','Presentación del equipo, relevamiento de necesidades y acceso a la plataforma.'],
        ['Día 2–3','Configuración','Personalizamos el CRM, cargamos productos/servicios y conectamos WhatsApp.'],
        ['Día 4','Capacitación','Sesión en vivo con tu equipo. Cada área aprende su módulo.'],
        ['Día 5–6','Prueba piloto','Tu equipo usa la plataforma con datos reales. El account manager resuelve dudas.'],
        ['Día 7','Go-live','Todo operativo. Comenzás a medir resultados desde el primer día.'],
      ].map(([d,t,desc],i,arr)=>`
      <div style="display:flex;gap:20px;position:relative;padding-bottom:${i<arr.length-1?'32px':'0'}">
        <div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0">
          <div style="width:40px;height:40px;border-radius:50%;background:var(--blue-light);color:#fff;display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;text-align:center;line-height:1.2">${d}</div>
          ${i<arr.length-1?`<div style="width:2px;flex:1;background:var(--border);margin-top:8px"></div>`:''}
        </div>
        <div style="padding-top:8px;padding-bottom:${i<arr.length-1?'0':'0'}">
          <div style="font-weight:700;margin-bottom:6px">${t}</div>
          <p style="font-size:.875rem;color:var(--text-muted)">${desc}</p>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-header"><span class="section-label">SLA</span><h2>Tiempos de respuesta garantizados</h2></div>
    <div class="card-grid card-grid-3">
      ${[
        { plan:'Starter', tiempo:'Respuesta en 24hs', canal:'Email y base de conocimiento', color:'var(--text)' },
        { plan:'Pro', tiempo:'Respuesta en 4hs', canal:'WhatsApp + email + base de conocimiento', color:'var(--blue-light)' },
        { plan:'Enterprise', tiempo:'Respuesta en 1hs', canal:'Canal dedicado + account manager + SLA garantizado', color:'var(--green)' },
      ].map(s=>`
      <div class="card" style="text-align:center">
        <div style="font-weight:700;margin-bottom:8px;font-size:.9rem;color:var(--text-muted)">${s.plan}</div>
        <div style="font-size:1.2rem;font-weight:800;color:${s.color};margin-bottom:12px">${s.tiempo}</div>
        <p style="font-size:.8rem;color:var(--text-muted)">${s.canal}</p>
      </div>`).join('')}
    </div>
  </div>
</section>

<div class="cta-section">
  <div class="container">
    <h2>Empezá con el mejor soporte del mercado</h2>
    <p>14 días gratis con onboarding incluido. Tu account manager te espera.</p>
    <div class="cta-actions"><a href="/register" class="btn btn-primary btn-lg">Empezar gratis →</a></div>
  </div>
</div>`;
}
