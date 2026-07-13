export function automatizacionPage(): string {
  return `
<section class="hero" style="min-height:80vh">
  <div class="container">
    <div class="hero-grid">
      <div class="fade-up">
        <span class="section-label">Automatización</span>
        <h1>Hacé más con <span class="text-gradient">menos esfuerzo</span></h1>
        <p class="lead">Automatizá seguimientos, alertas, emails y tareas. Tu equipo se enfoca en vender — el sistema hace el resto.</p>
        <div class="hero-actions">
          <a href="/register" class="btn btn-primary btn-lg">Probar gratis</a>
          <a href="/contacto" class="btn btn-ghost btn-lg">Ver demo</a>
        </div>
        <div class="hero-trust">
          <div class="trust-item"><span class="check">✓</span> Sin código</div>
          <div class="trust-item"><span class="check">✓</span> Flujos visuales</div>
          <div class="trust-item"><span class="check">✓</span> Activación inmediata</div>
        </div>
      </div>
      <div class="fade-up delay-2">
        <div class="dashboard-mockup">
          <div class="dash-header"><span class="dash-title">Flujo automático de ventas</span><span class="badge badge-green">● Activo</span></div>
          <div class="steps" style="gap:0">
            ${[
              ['Lead entra por WhatsApp','💬'],
              ['Bot califica y registra en CRM','🤖'],
              ['Se asigna al vendedor correcto','👤'],
              ['Email de bienvenida automático','📧'],
              ['Recordatorio de seguimiento a 48h','🔔'],
            ].map(([t,icon],i) => `
            <div style="display:flex;align-items:center;gap:12px;padding:12px 0;${i<4?'border-bottom:1px solid var(--border)':''}">
              <div style="width:32px;height:32px;border-radius:50%;background:var(--gradient);display:flex;align-items:center;justify-content:center;font-size:.85rem;flex-shrink:0">${icon}</div>
              <span style="font-size:.875rem">${t}</span>
            </div>`).join('')}
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-header"><span class="section-label">Automatizaciones disponibles</span><h2>Qué podés automatizar con Clientum</h2></div>
    <div class="card-grid card-grid-3">
      <div class="feature-card"><div class="card-icon">📧</div><h3>Emails automáticos</h3><p>Bienvenida, seguimiento, propuestas y recordatorios. Se envían solos en el momento justo.</p></div>
      <div class="feature-card"><div class="card-icon">🔔</div><h3>Alertas de inactividad</h3><p>Si un lead no tuvo actividad en X días, el sistema avisa al vendedor responsable.</p></div>
      <div class="feature-card"><div class="card-icon">📋</div><h3>Tareas automáticas</h3><p>Al mover un deal de etapa, se crean las tareas necesarias para el siguiente paso.</p></div>
      <div class="feature-card"><div class="card-icon">💬</div><h3>Mensajes de WhatsApp</h3><p>Seguimientos y recordatorios vía WhatsApp enviados automáticamente por el bot.</p></div>
      <div class="feature-card"><div class="card-icon">📄</div><h3>Facturación automática</h3><p>Al cerrar un deal, la factura se genera y envía al cliente sin intervención manual.</p></div>
      <div class="feature-card"><div class="card-icon">🔗</div><h3>Integraciones</h3><p>Conectá con tu tienda, sistema de stock o plataforma de pagos. Sin código.</p></div>
    </div>
  </div>
</section>

<div class="cta-section">
  <div class="container">
    <h2>Tu equipo se enfoca en vender, el sistema hace el resto</h2>
    <p>Configurá tu primer flujo automático en menos de 30 minutos.</p>
    <div class="cta-actions"><a href="/register" class="btn btn-primary btn-lg">Probar gratis →</a></div>
  </div>
</div>`;
}
