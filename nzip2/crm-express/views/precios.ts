export function preciosPage(): string {
  return `
<section class="section" style="padding-top:120px">
  <div class="container">
    <div class="section-header">
      <p class="hero-badge" style="justify-content:center;margin-bottom:16px">14 días gratis · Sin tarjeta de crédito</p>
      <h1>Planes para toda PyME</h1>
      <p>Precio en pesos, sin sorpresas. Empezá gratis y escalá cuando tu negocio crezca.</p>
    </div>

    <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:16px 24px;margin-bottom:48px;display:flex;flex-wrap:wrap;gap:12px;justify-content:center;align-items:center">
      <span style="font-size:.875rem;color:var(--text-muted)">Incluido en todos los planes:</span>
      ${['Aplicación web y móvil','Actualizaciones automáticas','Soporte técnico incluido','Datos en pesos argentinos','Onboarding guiado','14 días de prueba gratis'].map(f=>`<span class="badge badge-green">${f}</span>`).join('')}
    </div>

    <div class="pricing-grid">
      <div class="pricing-card">
        <div class="pricing-name">Starter</div>
        <div class="pricing-price">$29.990 <span>/ mes</span></div>
        <p class="pricing-desc">Para PyMEs que están empezando con la automatización.</p>
        <ul class="pricing-features">
          <li>Chatbot WhatsApp (hasta 500 conversaciones/mes)</li>
          <li>CRM hasta 500 contactos</li>
          <li>Pipeline de ventas visual</li>
          <li>Reportes básicos</li>
          <li>Portal del cliente</li>
          <li>Soporte por email</li>
        </ul>
        <a href="/register" class="btn btn-ghost" style="width:100%;justify-content:center">Empezar gratis</a>
      </div>

      <div class="pricing-card featured">
        <div class="pricing-badge">Más popular</div>
        <div class="pricing-name">Pro</div>
        <div class="pricing-price">$59.990 <span>/ mes</span></div>
        <p class="pricing-desc">Para PyMEs que quieren escalar sin sumar personal.</p>
        <ul class="pricing-features">
          <li>Chatbot WhatsApp ilimitado</li>
          <li>CRM contactos ilimitados</li>
          <li>Asistente IA incluido</li>
          <li>Automatización de flujos</li>
          <li>Facturación integrada (AFIP)</li>
          <li>Reportes automáticos avanzados</li>
          <li>Portal del cliente personalizado</li>
          <li>Soporte prioritario</li>
        </ul>
        <a href="/register" class="btn btn-primary" style="width:100%;justify-content:center">Empezar gratis</a>
      </div>

      <div class="pricing-card">
        <div class="pricing-name">Enterprise</div>
        <div class="pricing-price" style="font-size:1.8rem">A medida</div>
        <p class="pricing-desc">Para empresas con necesidades específicas o volúmenes altos.</p>
        <ul class="pricing-features">
          <li>Todo lo de Pro</li>
          <li>Multi-sucursal / Multi-línea WhatsApp</li>
          <li>Integración con sistemas propios (API)</li>
          <li>Onboarding dedicado</li>
          <li>SLA garantizado</li>
          <li>Capacitación del equipo</li>
        </ul>
        <a href="/contacto" class="btn btn-ghost" style="width:100%;justify-content:center">Contactar ventas</a>
      </div>
    </div>

    <div class="text-center" style="margin-top:32px">
      <p class="text-muted" style="margin-bottom:16px">¿Tenés dudas sobre qué plan elegir?</p>
      <a href="/contacto" class="btn btn-secondary">Hablá con nosotros</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="container" style="max-width:760px">
    <div class="section-header"><span class="section-label">FAQ</span><h2>Preguntas frecuentes</h2></div>
    ${[
      ['¿Necesito saber programar?','No. Clientum está diseñado para PyMEs sin perfil técnico. Todo se configura desde un panel visual, sin código.'],
      ['¿En cuánto tiempo está funcionando?','En 5 a 7 días hábiles para el plan Starter. Nuestro equipo te acompaña en el onboarding.'],
      ['¿Los precios son en pesos argentinos?','Sí. Todos los precios están en pesos argentinos y la facturación se hace en Argentina (AFIP).'],
      ['¿Puedo cancelar en cualquier momento?','Sí. Sin penalidades, sin preguntas. Cancelás en dos clics desde tu panel.'],
      ['¿Qué pasa si supero el límite de conversaciones?','Te avisamos antes de llegar al límite y podés escalar de plan en cualquier momento, sin perder datos.'],
      ['¿Puedo probar antes de pagar?','Sí. 14 días de prueba completa sin tarjeta de crédito. Acceso a todas las funciones del plan Pro.'],
    ].map(([q,a])=>`
    <div class="faq-item">
      <button class="faq-question">${q}<svg class="faq-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></button>
      <p class="faq-answer">${a}</p>
    </div>`).join('')}
  </div>
</section>

<div class="cta-section">
  <div class="container">
    <h2>Empezá tu prueba gratuita hoy</h2>
    <p>14 días sin compromiso. Sin tarjeta de crédito. Operativo en una semana.</p>
    <div class="cta-actions"><a href="/register" class="btn btn-primary btn-lg">Probar gratis →</a></div>
  </div>
</div>`;
}
