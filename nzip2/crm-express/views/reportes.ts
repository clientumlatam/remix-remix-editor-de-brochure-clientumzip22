export function reportesPage(): string {
  return `
<section class="hero" style="min-height:80vh">
  <div class="container">
    <div class="hero-grid">
      <div class="fade-up">
        <span class="section-label">Reportes Automáticos</span>
        <h1>Tomá decisiones con <span class="text-gradient">datos reales</span></h1>
        <p class="lead">Reportes automáticos de ventas, actividad, facturación y atención al cliente. Sin armar planillas, sin pedir datos al equipo.</p>
        <div class="hero-actions">
          <a href="/register" class="btn btn-primary btn-lg">Probar gratis</a>
          <a href="/contacto" class="btn btn-ghost btn-lg">Ver demo</a>
        </div>
        <div class="hero-trust">
          <div class="trust-item"><span class="check">✓</span> Dashboard en tiempo real</div>
          <div class="trust-item"><span class="check">✓</span> Reportes automáticos por email</div>
        </div>
      </div>
      <div class="fade-up delay-2">
        <div class="dashboard-mockup">
          <div class="dash-header">
            <span class="dash-title">Dashboard — Junio 2026</span>
            <span class="badge badge-green">● Tiempo real</span>
          </div>
          <div class="dash-metric-row">
            <div class="dash-metric"><div class="dash-metric-val">24</div><div class="dash-metric-label">Deals activos</div><div class="dash-metric-change">+3 vs mes ant.</div></div>
            <div class="dash-metric"><div class="dash-metric-val">$1.2M</div><div class="dash-metric-label">Pipeline</div><div class="dash-metric-change">+18%</div></div>
            <div class="dash-metric"><div class="dash-metric-val">67%</div><div class="dash-metric-label">Tasa de cierre</div><div class="dash-metric-change">+5pts</div></div>
            <div class="dash-metric"><div class="dash-metric-val">$240k</div><div class="dash-metric-label">Ticket promedio</div><div class="dash-metric-change">+12%</div></div>
          </div>
          <div style="background:var(--surface-3);border-radius:10px;padding:16px">
            <div style="font-size:.75rem;color:var(--text-muted);margin-bottom:8px">Ventas por mes (ARS)</div>
            <div style="display:flex;align-items:flex-end;gap:6px;height:60px">
              ${['40','55','45','70','65','90','80','100','85','95','88','100'].map((h,i) => `<div style="flex:1;height:${h}%;background:var(--gradient);border-radius:3px 3px 0 0;opacity:${i===11?1:0.4+i*0.05}"></div>`).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-header"><span class="section-label">Reportes disponibles</span><h2>Toda la información de tu negocio, organizada</h2></div>
    <div class="card-grid card-grid-3">
      <div class="feature-card"><div class="card-icon">💰</div><h3>Reporte de ventas</h3><p>Facturación por período, vendedor, producto y canal. Con comparativa mes a mes.</p></div>
      <div class="feature-card"><div class="card-icon">📋</div><h3>Actividad del equipo</h3><p>Llamadas, emails, reuniones y seguimientos por cada integrante del equipo.</p></div>
      <div class="feature-card"><div class="card-icon">💬</div><h3>Atención WhatsApp</h3><p>Volumen de conversaciones, tiempo de respuesta y tasa de resolución del chatbot.</p></div>
      <div class="feature-card"><div class="card-icon">📄</div><h3>Facturación AFIP</h3><p>Facturas emitidas, pendientes y vencidas. Integrado con el módulo de facturación.</p></div>
      <div class="feature-card"><div class="card-icon">📈</div><h3>Proyección de cierre</h3><p>Estimación de ingresos del mes basada en el pipeline actual y tasas históricas.</p></div>
      <div class="feature-card"><div class="card-icon">📧</div><h3>Reportes por email</h3><p>Recibís un resumen semanal y mensual en tu casilla, sin tener que entrar al sistema.</p></div>
    </div>
  </div>
</section>

<div class="cta-section">
  <div class="container">
    <h2>Información clara para decisiones inteligentes</h2>
    <p>Probá los reportes automáticos de Clientum 14 días gratis.</p>
    <div class="cta-actions"><a href="/register" class="btn btn-primary btn-lg">Probar gratis →</a></div>
  </div>
</div>`;
}
