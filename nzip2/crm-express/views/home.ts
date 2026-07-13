export function homePage(): string {
  return `
<section class="hero">
  <div class="container">
    <div class="hero-grid">
      <div class="fade-up">
        <div class="hero-badge">IA para PyMEs argentinas</div>
        <h1>Tu PyME, organizada y <span class="text-gradient">automatizada.</span></h1>
        <p class="lead">CRM, facturación electrónica y atención al cliente por WhatsApp — todo en una sola plataforma. Sin código, sin IT.</p>
        <div class="hero-actions">
          <a href="/register" class="btn btn-primary btn-lg">Probar 14 días gratis →</a>
          <a href="/chatbot" class="btn btn-ghost btn-lg">Ver demo</a>
        </div>
        <div class="hero-trust">
          <div class="trust-item"><span class="check">✓</span> Sin tarjeta de crédito</div>
          <div class="trust-item"><span class="check">✓</span> Sin código ni IT</div>
          <div class="trust-item"><span class="check">✓</span> Operativo en 1 semana</div>
        </div>
      </div>
      <div class="fade-up delay-2">
        <div class="dashboard-mockup">
          <div class="dash-header">
            <span class="dash-title">Dashboard — Junio 2026</span>
            <span class="badge badge-green">● En vivo</span>
          </div>
          <div class="dash-metric-row">
            <div class="dash-metric">
              <div class="dash-metric-val">24</div>
              <div class="dash-metric-label">Deals activos</div>
              <div class="dash-metric-change">+3 vs mes ant.</div>
            </div>
            <div class="dash-metric">
              <div class="dash-metric-val">$1.2M</div>
              <div class="dash-metric-label">Pipeline</div>
              <div class="dash-metric-change">+18%</div>
            </div>
            <div class="dash-metric">
              <div class="dash-metric-val">148</div>
              <div class="dash-metric-label">Chats WhatsApp</div>
              <div class="dash-metric-change">+32%</div>
            </div>
            <div class="dash-metric">
              <div class="dash-metric-val">94%</div>
              <div class="dash-metric-label">Resueltos por bot</div>
              <div class="dash-metric-change">↑ 6pts</div>
            </div>
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

<section class="section-sm" style="border-top:1px solid var(--border)">
  <div class="container">
    <p class="text-center text-muted mb-3" style="font-size:.8rem;text-transform:uppercase;letter-spacing:.1em">+500 PyMEs confían en Clientum</p>
    <div class="flex flex-center" style="gap:48px;flex-wrap:wrap;opacity:.5;filter:grayscale(1)">
      <span style="font-weight:700;font-size:1.1rem">Distribuidoras</span>
      <span style="font-weight:700;font-size:1.1rem">Retail & E-Commerce</span>
      <span style="font-weight:700;font-size:1.1rem">Estudios Contables</span>
      <span style="font-weight:700;font-size:1.1rem">Salud & Bienestar</span>
      <span style="font-weight:700;font-size:1.1rem">Gastronomía</span>
      <span style="font-weight:700;font-size:1.1rem">Inmobiliarias</span>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-header">
      <span class="section-label">Plataforma completa</span>
      <h2>Todo lo que tu PyME necesita en una sola plataforma</h2>
      <p>Sin integrar 10 herramientas distintas. Sin depender de IT. Sin pagar por separado cada módulo.</p>
    </div>
    <div class="card-grid card-grid-3">
      <a href="/chatbot" class="feature-card" style="text-decoration:none">
        <div class="card-icon">💬</div>
        <h3>Chatbot WhatsApp 24/7</h3>
        <p>Responde consultas, califica leads y agenda citas en WhatsApp sin que nadie lo atienda.</p>
        <div class="mt-3" style="color:var(--blue-light);font-size:.875rem;font-weight:500">Ver más →</div>
      </a>
      <a href="/crm" class="feature-card" style="text-decoration:none">
        <div class="card-icon">📋</div>
        <h3>CRM Inteligente</h3>
        <p>Pipeline visual, seguimiento automático y alertas para que ninguna venta se pierda.</p>
        <div class="mt-3" style="color:var(--blue-light);font-size:.875rem;font-weight:500">Ver más →</div>
      </a>
      <a href="/asistente-ia" class="feature-card" style="text-decoration:none">
        <div class="card-icon">🤖</div>
        <h3>Asistente IA</h3>
        <p>Preguntale cualquier cosa sobre tu negocio. Reportes, sugerencias y acciones al instante.</p>
        <div class="mt-3" style="color:var(--blue-light);font-size:.875rem;font-weight:500">Ver más →</div>
      </a>
      <a href="/reportes" class="feature-card" style="text-decoration:none">
        <div class="card-icon">📊</div>
        <h3>Reportes Automáticos</h3>
        <p>Dashboard en tiempo real de ventas, actividad y facturación. Sin armar planillas.</p>
        <div class="mt-3" style="color:var(--blue-light);font-size:.875rem;font-weight:500">Ver más →</div>
      </a>
      <a href="/automatizacion" class="feature-card" style="text-decoration:none">
        <div class="card-icon">⚡</div>
        <h3>Automatización</h3>
        <p>Flujos automáticos de seguimiento, alertas y tareas. Tu equipo se enfoca en vender.</p>
        <div class="mt-3" style="color:var(--blue-light);font-size:.875rem;font-weight:500">Ver más →</div>
      </a>
      <a href="/portal" class="feature-card" style="text-decoration:none">
        <div class="card-icon">🏠</div>
        <h3>Portal del Cliente</h3>
        <p>Portal privado donde cada cliente ve sus facturas, pedidos y cotizaciones. Menos llamadas.</p>
        <div class="mt-3" style="color:var(--blue-light);font-size:.875rem;font-weight:500">Ver más →</div>
      </a>
    </div>
  </div>
</section>

<section class="section" style="background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border)">
  <div class="container">
    <div class="hero-grid" style="align-items:center">
      <div>
        <span class="section-label">El problema real</span>
        <h2>Tu negocio pierde ventas mientras alguien no contesta el WhatsApp.</h2>
        <div class="card-grid" style="margin-top:32px">
          <div class="card card-sm">
            <h4 style="color:var(--text-muted)">❌ Sin Clientum</h4>
            <ul style="list-style:none;display:flex;flex-direction:column;gap:10px;margin-top:12px">
              <li style="font-size:.875rem;color:var(--text-muted)">Respuestas lentas = ventas perdidas</li>
              <li style="font-size:.875rem;color:var(--text-muted)">Presupuestos y stock a mano</li>
              <li style="font-size:.875rem;color:var(--text-muted)">Cero seguimiento de leads</li>
            </ul>
          </div>
          <div class="card card-sm" style="border-color:var(--green)">
            <h4 style="color:var(--green)">✓ Con Clientum</h4>
            <ul style="list-style:none;display:flex;flex-direction:column;gap:10px;margin-top:12px">
              <li style="font-size:.875rem">Chatbot con IA 24/7</li>
              <li style="font-size:.875rem">CRM + reportes en vivo</li>
              <li style="font-size:.875rem">Presupuestos automáticos</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="chat-mockup">
        <div class="chat-header">
          <div class="chat-avatar">B</div>
          <div>
            <div class="chat-name">Bot de tu empresa</div>
            <div class="chat-status">En línea · Responde al instante</div>
          </div>
        </div>
        <div class="chat-body">
          <div class="msg msg-in">Hola, ¿tienen stock del producto X?</div>
          <div class="msg msg-out">¡Hola! Sí, tenemos stock. ¿Cuántas unidades necesitás?</div>
          <div class="msg msg-in">20 unidades. ¿Hacen envío?</div>
          <div class="msg msg-out">Sí, hacemos envío a todo el país. Te contacto con un asesor para confirmar. ¿Cuál es tu nombre?</div>
          <div class="msg msg-in" style="font-size:.75rem;color:#666">Este bot trabaja 24/7 sin que nadie lo atienda</div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-header">
      <span class="section-label">Resultados</span>
      <h2>Métricas de impacto real</h2>
    </div>
    <div class="flex flex-center" style="gap:64px;flex-wrap:wrap">
      <div class="stat-item"><div class="stat-num">+30%</div><div class="stat-label">Eficiencia Operativa</div></div>
      <div class="stat-item"><div class="stat-num">+40%</div><div class="stat-label">Satisfacción del Cliente</div></div>
      <div class="stat-item"><div class="stat-num">-25%</div><div class="stat-label">Costos Administrativos</div></div>
      <div class="stat-item"><div class="stat-num">24/7</div><div class="stat-label">Atención automática</div></div>
      <div class="stat-item"><div class="stat-num">5-7</div><div class="stat-label">Días para arrancar</div></div>
    </div>
  </div>
</section>

<section class="section" style="background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border)">
  <div class="container">
    <div class="section-header">
      <span class="section-label">Testimonios</span>
      <h2>Lo que dicen nuestros clientes</h2>
    </div>
    <div class="card-grid card-grid-3">
      <div class="testimonial-card">
        <p class="testimonial-text">Ahora sabemos exactamente qué repuestos tenemos sin revisar papeles. Las facturas salen solas.</p>
        <div class="testimonial-author">
          <div class="author-avatar">M</div>
          <div><div class="author-name">Estudio Méndez & Asoc.</div><div class="author-role">General Roca</div></div>
        </div>
      </div>
      <div class="testimonial-card">
        <p class="testimonial-text">En un fin de semana aprendí a configurar el chatbot. Ahora agenda turnos solo.</p>
        <div class="testimonial-author">
          <div class="author-avatar">M</div>
          <div><div class="author-name">Mónica S.</div><div class="author-role">Clínica Estética Lumière</div></div>
        </div>
      </div>
      <div class="testimonial-card">
        <p class="testimonial-text">Le mandé el link de la academia a mis clientes y ya no me consultan lo básico. Se capacitan solos.</p>
        <div class="testimonial-author">
          <div class="author-avatar">V</div>
          <div><div class="author-name">Valeria G.</div><div class="author-role">Servicios Contables VG</div></div>
        </div>
      </div>
    </div>
  </div>
</section>

<div class="cta-section">
  <div class="container">
    <h2>Empezá hoy, sin riesgos</h2>
    <p>14 días gratis. Sin tarjeta. Sin IT. Tu plataforma operativa en una semana.</p>
    <div class="cta-actions">
      <a href="/register" class="btn btn-primary btn-lg">Crear cuenta gratis →</a>
      <a href="/precios" class="btn btn-ghost btn-lg">Ver planes</a>
    </div>
  </div>
</div>`;
}
