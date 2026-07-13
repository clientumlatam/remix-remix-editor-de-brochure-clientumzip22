export function portalPage(): string {
  return `
<section class="hero" style="min-height:80vh">
  <div class="container">
    <div class="hero-grid">
      <div class="fade-up">
        <span class="section-label">Portal del Cliente</span>
        <h1>Tus clientes se <span class="text-gradient">autoatienden</span></h1>
        <p class="lead">Un portal privado donde cada cliente ve sus facturas, pedidos y cotizaciones. Menos llamadas, más satisfacción.</p>
        <div class="hero-actions">
          <a href="/register" class="btn btn-primary btn-lg">Probar gratis</a>
          <a href="/contacto" class="btn btn-ghost btn-lg">Ver demo del portal</a>
        </div>
        <div class="hero-trust">
          <div class="trust-item"><span class="check">✓</span> Con tu marca</div>
          <div class="trust-item"><span class="check">✓</span> Acceso seguro</div>
          <div class="trust-item"><span class="check">✓</span> Funciona en celular</div>
        </div>
      </div>
      <div class="fade-up delay-2">
        <div class="dashboard-mockup">
          <div class="dash-header">
            <span class="dash-title">Portal de Clientes — Clientum</span>
          </div>
          <div style="padding:8px 0">
            <p style="font-size:.875rem;color:var(--text-muted);margin-bottom:16px">Bienvenido, Distribuidora del Sur</p>
            <div class="dash-metric-row">
              <div class="dash-metric"><div class="dash-metric-val" style="font-size:1.1rem">3</div><div class="dash-metric-label">Pedidos activos</div></div>
              <div class="dash-metric"><div class="dash-metric-val" style="font-size:1.1rem">$480k</div><div class="dash-metric-label">Facturas pendientes</div></div>
            </div>
            <div style="margin-top:12px">
              ${[['Factura #0042','$120.000','Pagada'],['Factura #0041','$360.000','Pendiente'],['Pedido #P-19','En camino','']].map(([n,m,s]) => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);font-size:.8rem">
                <span>${n}</span><span style="color:var(--text-muted)">${m}</span>
                ${s?`<span class="badge badge-${s==='Pagada'?'green':'blue'}" style="font-size:.7rem">${s}</span>`:''}
              </div>`).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-header"><span class="section-label">Funcionalidades</span><h2>Todo lo que ve tu cliente en su portal</h2></div>
    <div class="card-grid card-grid-3">
      <div class="feature-card"><div class="card-icon">📄</div><h3>Facturas y comprobantes</h3><p>Descarga de facturas electrónicas en PDF directamente desde el portal.</p></div>
      <div class="feature-card"><div class="card-icon">📦</div><h3>Estado de pedidos</h3><p>Seguimiento en tiempo real del estado de cada pedido, desde el momento de la compra.</p></div>
      <div class="feature-card"><div class="card-icon">💼</div><h3>Cotizaciones</h3><p>Los clientes ven, aceptan y firman cotizaciones desde el portal, sin ir a la oficina.</p></div>
      <div class="feature-card"><div class="card-icon">💬</div><h3>Canal directo</h3><p>Chat integrado con tu equipo. Menos llamadas, todo queda registrado.</p></div>
      <div class="feature-card"><div class="card-icon">🎨</div><h3>Con tu marca</h3><p>Logo, colores y dominio propio. Tu cliente ve un portal tuyo, no de Clientum.</p></div>
      <div class="feature-card"><div class="card-icon">📱</div><h3>100% mobile</h3><p>Funciona perfectamente en celular. Tu cliente accede desde donde esté.</p></div>
    </div>
  </div>
</section>

<div class="cta-section">
  <div class="container">
    <h2>Menos llamadas, más satisfacción</h2>
    <p>Tu portal del cliente, activo en menos de una semana.</p>
    <div class="cta-actions"><a href="/register" class="btn btn-primary btn-lg">Probar gratis →</a></div>
  </div>
</div>`;
}
