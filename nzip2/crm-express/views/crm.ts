export function crmPage(): string {
  return `
<section class="hero" style="min-height:80vh">
  <div class="container">
    <div class="hero-grid">
      <div class="fade-up">
        <span class="section-label">CRM Inteligente</span>
        <h1>Nunca más <span class="text-gradient">perdas una venta</span></h1>
        <p class="lead">Gestioná contactos, leads y deals en un pipeline visual. Con seguimiento automático y alertas para que nada se te escape.</p>
        <div class="hero-actions">
          <a href="/register" class="btn btn-primary btn-lg">Probar gratis</a>
          <a href="/contacto" class="btn btn-ghost btn-lg">Ver demo</a>
        </div>
        <div class="hero-trust">
          <div class="trust-item"><span class="check">✓</span> Sin tarjeta de crédito</div>
          <div class="trust-item"><span class="check">✓</span> Fácil de usar</div>
          <div class="trust-item"><span class="check">✓</span> Soporte incluido</div>
        </div>
      </div>
      <div class="fade-up delay-2">
        <div class="dashboard-mockup">
          <div class="dash-header">
            <span class="dash-title">Pipeline de ventas</span>
            <span class="badge badge-blue">24 deals activos</span>
          </div>
          <div class="pipeline">
            <div class="pipeline-col">
              <div class="pipeline-col-header">Prospecto</div>
              <div class="pipeline-card"><div class="pipeline-card-name">Distribuidora Norte</div><div class="pipeline-card-amount">$180.000</div></div>
              <div class="pipeline-card"><div class="pipeline-card-name">Ferretería El Clavo</div><div class="pipeline-card-amount">$95.000</div></div>
            </div>
            <div class="pipeline-col">
              <div class="pipeline-col-header">Contactado</div>
              <div class="pipeline-card"><div class="pipeline-card-name">Clínica Lumière</div><div class="pipeline-card-amount">$240.000</div></div>
            </div>
            <div class="pipeline-col">
              <div class="pipeline-col-header">Propuesta</div>
              <div class="pipeline-card"><div class="pipeline-card-name">Estudio Méndez</div><div class="pipeline-card-amount">$320.000</div></div>
            </div>
            <div class="pipeline-col">
              <div class="pipeline-col-header">Ganado 🎉</div>
              <div class="pipeline-card"><div class="pipeline-card-name">Agro Patagónica</div><div class="pipeline-card-amount">$580.000</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-header">
      <span class="section-label">Funcionalidades</span>
      <h2>Todo lo que necesitás para cerrar más ventas</h2>
    </div>
    <div class="card-grid card-grid-3">
      <div class="feature-card"><div class="card-icon">📊</div><h3>Pipeline visual</h3><p>Arrastrá deals entre etapas. Visualizá tu embudo de ventas de un vistazo.</p></div>
      <div class="feature-card"><div class="card-icon">🔔</div><h3>Alertas automáticas</h3><p>Recordatorios de seguimiento para que ningún lead quede sin atención.</p></div>
      <div class="feature-card"><div class="card-icon">👥</div><h3>Gestión de contactos</h3><p>Historial completo de cada cliente: conversaciones, compras, notas e interacciones.</p></div>
      <div class="feature-card"><div class="card-icon">💬</div><h3>WhatsApp integrado</h3><p>Cada conversación de WhatsApp queda en el perfil del contacto automáticamente.</p></div>
      <div class="feature-card"><div class="card-icon">📄</div><h3>Facturación AFIP</h3><p>Emitís facturas electrónicas directamente desde el deal, sin salir del CRM.</p></div>
      <div class="feature-card"><div class="card-icon">📈</div><h3>Reportes de ventas</h3><p>Conversión por etapa, tiempo promedio de cierre y proyección de ingresos.</p></div>
    </div>
  </div>
</section>

<div class="cta-section">
  <div class="container">
    <h2>Nunca más perdas una venta</h2>
    <p>Probá el CRM de Clientum 14 días gratis, sin tarjeta de crédito.</p>
    <div class="cta-actions">
      <a href="/register" class="btn btn-primary btn-lg">Probar gratis →</a>
      <a href="/precios" class="btn btn-ghost btn-lg">Ver planes</a>
    </div>
  </div>
</div>`;
}
