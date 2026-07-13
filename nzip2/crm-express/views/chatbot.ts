export function chatbotPage(): string {
  return `
<section class="hero" style="min-height:80vh">
  <div class="container">
    <div class="hero-grid">
      <div class="fade-up">
        <span class="section-label">Chatbot WhatsApp</span>
        <h1>Tu negocio atiende solo, <span class="text-gradient">las 24 horas</span></h1>
        <p class="lead">El chatbot de Clientum responde consultas, califica leads y agenda citas en WhatsApp — sin que toques nada. Operativo en una semana.</p>
        <div class="hero-actions">
          <a href="/register" class="btn btn-primary btn-lg">Probar 14 días gratis</a>
          <a href="/contacto" class="btn btn-ghost btn-lg">Ver demo</a>
        </div>
        <div class="hero-trust">
          <div class="trust-item"><span class="check">✓</span> Sin tarjeta de crédito</div>
          <div class="trust-item"><span class="check">✓</span> Sin código ni IT</div>
          <div class="trust-item"><span class="check">✓</span> Operativo en 1 semana</div>
        </div>
      </div>
      <div class="fade-up delay-2">
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
          </div>
        </div>
        <div class="flex" style="gap:16px;margin-top:16px;flex-wrap:wrap">
          <div class="surface-card" style="padding:16px 20px;flex:1;text-align:center">
            <div style="font-size:1.5rem;font-weight:800;color:var(--green)">24/7</div>
            <div style="font-size:.8rem;color:var(--text-muted)">Atención ininterrumpida</div>
          </div>
          <div class="surface-card" style="padding:16px 20px;flex:1;text-align:center">
            <div style="font-size:1.5rem;font-weight:800;color:var(--blue-light)">+60%</div>
            <div style="font-size:.8rem;color:var(--text-muted)">Consultas resueltas sin humano</div>
          </div>
          <div class="surface-card" style="padding:16px 20px;flex:1;text-align:center">
            <div style="font-size:1.5rem;font-weight:800;color:var(--purple)">1 sem</div>
            <div style="font-size:.8rem;color:var(--text-muted)">Para estar operativo</div>
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
      <h2>Todo lo que hace el chatbot por vos</h2>
      <p>Configurás una vez y funciona solo. Sin mantenimiento, sin actualizaciones manuales.</p>
    </div>
    <div class="card-grid card-grid-3">
      <div class="feature-card">
        <div class="card-icon">⚡</div>
        <h3>Respuesta instantánea 24/7</h3>
        <p>El bot responde en segundos, sin importar el horario. Tu negocio nunca duerme.</p>
      </div>
      <div class="feature-card">
        <div class="card-icon">🎯</div>
        <h3>Calificación automática de leads</h3>
        <p>Detecta intención de compra y clasifica a cada contacto antes de pasarlo a un asesor.</p>
      </div>
      <div class="feature-card">
        <div class="card-icon">📅</div>
        <h3>Agenda citas automáticamente</h3>
        <p>Integrado con tu calendario. El cliente elige horario y queda confirmado sin intervención humana.</p>
      </div>
      <div class="feature-card">
        <div class="card-icon">❓</div>
        <h3>Responde consultas frecuentes</h3>
        <p>Precios, stock, horarios, ubicación — configurás las respuestas una vez y funciona solo.</p>
      </div>
      <div class="feature-card">
        <div class="card-icon">👤</div>
        <h3>Derivación a humano cuando se necesita</h3>
        <p>Si la consulta es compleja, el bot transfiere la conversación al asesor correcto.</p>
      </div>
      <div class="feature-card">
        <div class="card-icon">📋</div>
        <h3>Historial completo en el CRM</h3>
        <p>Cada conversación de WhatsApp queda registrada en el perfil del contacto automáticamente.</p>
      </div>
    </div>
  </div>
</section>

<section class="section" style="background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border)">
  <div class="container">
    <div class="hero-grid">
      <div class="section-header" style="text-align:left;margin:0">
        <span class="section-label">Cómo funciona</span>
        <h2>Tres pasos para estar operativo</h2>
      </div>
      <div class="steps">
        <div class="step">
          <div class="step-num">1</div>
          <div class="step-content">
            <h3>Conectás tu número</h3>
            <p>Vinculás tu WhatsApp Business en minutos. Sin código, sin IT.</p>
          </div>
        </div>
        <div class="step">
          <div class="step-num">2</div>
          <div class="step-content">
            <h3>Configurás las respuestas</h3>
            <p>Cargás preguntas frecuentes, precios y flujos de conversación desde un panel simple.</p>
          </div>
        </div>
        <div class="step">
          <div class="step-num">3</div>
          <div class="step-content">
            <h3>El bot entra en acción</h3>
            <p>Desde el primer mensaje, el chatbot atiende, califica y deriva. Vos solo revisás lo importante.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<div class="cta-section">
  <div class="container">
    <h2>Empezá hoy, sin riesgos</h2>
    <p>14 días gratis. Sin tarjeta. Sin IT. Tu chatbot operativo en una semana.</p>
    <div class="cta-actions">
      <a href="/register" class="btn btn-primary btn-lg">Probar 14 días gratis →</a>
    </div>
  </div>
</div>`;
}
