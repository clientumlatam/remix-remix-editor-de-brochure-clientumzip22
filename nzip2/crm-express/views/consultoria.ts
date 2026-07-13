export function consultoriaPage(): string {
  return `
<section class="section" style="padding-top:120px">
  <div class="container">
    <div class="hero-grid" style="align-items:center">
      <div class="fade-up">
        <span class="section-label">Consultoría Empresarial</span>
        <h1>Diagnosticamos tu negocio y diseñamos el plan de acción</h1>
        <p class="lead" style="margin-top:16px">No implementamos tecnología por implementar. Primero entendemos tu empresa, identificamos los cuellos de botella y definimos qué automatizar para que impacte en tus resultados.</p>
        <div style="display:flex;gap:12px;margin-top:32px;flex-wrap:wrap">
          <a href="/contacto" class="btn btn-primary btn-lg">Agendar diagnóstico gratuito</a>
          <a href="/casos" class="btn btn-ghost btn-lg">Ver casos</a>
        </div>
        <div class="hero-trust" style="margin-top:24px">
          <div class="trust-item"><span class="check">✓</span> Primera consulta sin costo</div>
          <div class="trust-item"><span class="check">✓</span> Plan entregado en 48hs</div>
          <div class="trust-item"><span class="check">✓</span> Sin compromiso de compra</div>
        </div>
      </div>
      <div class="card" style="background:var(--surface)">
        <h3 style="margin-bottom:20px">Nuestro proceso</h3>
        <div style="display:flex;flex-direction:column;gap:20px">
          ${[
            ['01','Diagnóstico','Relevamiento de procesos, tecnología actual y puntos de dolor. 1 reunión de 90 minutos.'],
            ['02','Análisis','Mapeamos flujos, calculamos ROI potencial y priorizamos qué cambiar primero.'],
            ['03','Plan de acción','Entregamos un plan concreto con tiempos, costos y métricas esperadas.'],
            ['04','Implementación','Ejecutamos el plan con nuestro equipo técnico y de negocio, con acompañamiento continuo.'],
          ].map(([n,t,d])=>`
          <div style="display:flex;gap:16px;align-items:flex-start">
            <div style="width:32px;height:32px;border-radius:50%;background:var(--blue-light);color:#fff;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700;flex-shrink:0">${n}</div>
            <div><div style="font-weight:600;margin-bottom:4px">${t}</div><p style="font-size:.8rem;color:var(--text-muted)">${d}</p></div>
          </div>`).join('')}
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section" style="background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border)">
  <div class="container">
    <div class="section-header"><span class="section-label">Áreas de consultoría</span><h2>Dónde más impactamos</h2></div>
    <div class="card-grid card-grid-3">
      ${[
        ['📋','CRM y Ventas','Organización del pipeline, seguimiento de oportunidades y automatización de contacto con clientes.'],
        ['⚡','Automatización de Procesos','Identificamos qué tareas repetitivas roban tiempo y las automatizamos sin código.'],
        ['📣','Marketing y Captación','Integración del CRM con campañas digitales para medir resultados reales de cada peso invertido.'],
        ['📊','Reportes y Decisiones','Dashboard de gestión con los indicadores que realmente importan para tu rubro.'],
        ['🏭','ERP y Sistemas','Evaluamos si tu empresa necesita un ERP, cuál y cómo integrarlo con lo que ya tenés.'],
        ['🔗','Integraciones','Conectamos tus herramientas actuales para eliminar la doble carga de datos.'],
      ].map(([i,t,d])=>`
      <div class="feature-card">
        <div class="card-icon">${i}</div>
        <h3>${t}</h3>
        <p>${d}</p>
      </div>`).join('')}
    </div>
  </div>
</section>

<section class="section">
  <div class="container" style="max-width:720px">
    <div class="section-header"><span class="section-label">Para quién es</span><h2>Consultoría ideal si...</h2></div>
    <div style="display:flex;flex-direction:column;gap:12px">
      ${[
        'Tu empresa usa planillas, papel o herramientas desconectadas entre sí.',
        'Tenés dudas sobre qué tecnología implementar y no querés equivocarte.',
        'Ya tenés un sistema pero no lo están usando bien.',
        'Querés medir resultados concretos antes de invertir en tecnología.',
        'Tu equipo pierde tiempo en tareas que se podrían automatizar.',
        'Estás creciendo y necesitás escalar sin sumar personal.',
      ].map(p=>`
      <div style="display:flex;gap:12px;align-items:center;padding:16px 20px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius)">
        <span style="color:var(--green);font-size:1.1rem">✓</span>
        <span style="font-size:.9rem">${p}</span>
      </div>`).join('')}
    </div>
  </div>
</section>

<div class="cta-section">
  <div class="container">
    <h2>Primera consulta sin costo</h2>
    <p>En 90 minutos te damos claridad sobre qué cambiar primero en tu empresa.</p>
    <div class="cta-actions"><a href="/contacto" class="btn btn-primary btn-lg">Agendar ahora →</a></div>
  </div>
</div>`;
}
