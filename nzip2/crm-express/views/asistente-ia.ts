export function asistentePage(): string {
  return `
<section class="hero" style="min-height:80vh">
  <div class="container">
    <div class="hero-grid">
      <div class="fade-up">
        <span class="section-label">Asistente IA</span>
        <h1>Tu analista de negocio, <span class="text-gradient">siempre disponible</span></h1>
        <p class="lead">Preguntale cualquier cosa sobre tu CRM y recibís respuestas al instante. Reportes, sugerencias y acciones sin aprender ninguna herramienta.</p>
        <div class="hero-actions">
          <a href="/register" class="btn btn-primary btn-lg">Probar gratis</a>
          <a href="/contacto" class="btn btn-ghost btn-lg">Ver demo</a>
        </div>
        <div class="hero-trust">
          <div class="trust-item"><span class="check">✓</span> Sin configuración</div>
          <div class="trust-item"><span class="check">✓</span> Incluido en todos los planes</div>
        </div>
      </div>
      <div class="fade-up delay-2">
        <div class="dashboard-mockup">
          <div class="dash-header">
            <div style="display:flex;align-items:center;gap:8px">
              <div style="width:28px;height:28px;border-radius:8px;background:var(--gradient);display:flex;align-items:center;justify-content:center;font-size:.85rem">🤖</div>
              <span class="dash-title">Asistente Clientum</span>
            </div>
            <span class="badge badge-green">● Activo</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:12px">
            <div style="background:var(--surface-3);padding:14px 16px;border-radius:10px;font-size:.85rem;color:var(--text-muted)">¿Cuántos leads tengo esta semana?</div>
            <div style="background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.2);padding:14px 16px;border-radius:10px;font-size:.85rem">
              Tenés <strong>23 leads nuevos</strong> esta semana, un <span class="text-green">+34%</span> vs la semana pasada. Los 3 más calientes son de la industria Retail. Te recomiendo llamarlos hoy.
            </div>
            <div style="background:var(--surface-3);padding:14px 16px;border-radius:10px;font-size:.85rem;color:var(--text-muted)">¿Cuál fue mi mejor mes del año?</div>
            <div style="background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.2);padding:14px 16px;border-radius:10px;font-size:.85rem">
              Tu mejor mes fue <strong>Marzo 2026</strong> con $1.8M en ventas cerradas. El ticket promedio fue de $240.000.
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
      <span class="section-label">Capacidades</span>
      <h2>Qué puede hacer el Asistente IA por vos</h2>
    </div>
    <div class="card-grid card-grid-3">
      <div class="feature-card"><div class="card-icon">📊</div><h3>Reportes en lenguaje natural</h3><p>Pedí cualquier reporte en palabras simples y lo tenés al instante, sin armar tablas.</p></div>
      <div class="feature-card"><div class="card-icon">🎯</div><h3>Identificación de oportunidades</h3><p>La IA detecta leads calientes, clientes en riesgo de fuga y oportunidades de upsell.</p></div>
      <div class="feature-card"><div class="card-icon">⚡</div><h3>Acciones directas</h3><p>Decile que envíe un email, cree una tarea o actualice un deal — lo hace sin salir del chat.</p></div>
      <div class="feature-card"><div class="card-icon">📈</div><h3>Proyecciones de ventas</h3><p>Estimaciones de cierre del mes basadas en tu pipeline y datos históricos.</p></div>
      <div class="feature-card"><div class="card-icon">💡</div><h3>Sugerencias inteligentes</h3><p>Recomendaciones personalizadas para mejorar tu tasa de conversión y ticket promedio.</p></div>
      <div class="feature-card"><div class="card-icon">🔍</div><h3>Búsqueda en todo el CRM</h3><p>Encontrá cualquier contacto, deal o conversación en segundos con lenguaje natural.</p></div>
    </div>
  </div>
</section>

<div class="cta-section">
  <div class="container">
    <h2>Tu analista de negocio incluido en tu plan</h2>
    <p>El Asistente IA está disponible desde el plan Pro, sin costo adicional.</p>
    <div class="cta-actions">
      <a href="/precios" class="btn btn-primary btn-lg">Ver planes →</a>
      <a href="/register" class="btn btn-ghost btn-lg">Probar gratis</a>
    </div>
  </div>
</div>`;
}
