export function faqPage(): string {
  const faqs = [
    { cat:'WhatsApp & Chatbot', q:'¿Cómo conecto mi número de WhatsApp?', a:'Vinculás tu WhatsApp Business escaneando un QR desde el panel de Clientum. El proceso toma menos de 5 minutos, sin código ni IT.' },
    { cat:'WhatsApp & Chatbot', q:'¿El bot puede manejar múltiples conversaciones al mismo tiempo?', a:'Sí. El chatbot de Clientum maneja conversaciones ilimitadas en paralelo, sin tiempos de espera.' },
    { cat:'WhatsApp & Chatbot', q:'¿Puedo personalizar las respuestas del bot?', a:'Totalmente. Configurás preguntas frecuentes, flujos de conversación y respuestas desde un panel visual sin código.' },
    { cat:'Planes y pagos', q:'¿Los precios son en pesos argentinos?', a:'Sí. Todos los precios están en ARS y la facturación se emite en Argentina (AFIP).' },
    { cat:'Planes y pagos', q:'¿Puedo cancelar en cualquier momento?', a:'Sí. Sin penalidades, sin preguntas. Cancelás en dos clics desde tu panel de administración.' },
    { cat:'Planes y pagos', q:'¿Qué métodos de pago aceptan?', a:'Aceptamos transferencia bancaria, tarjeta de crédito/débito y Mercado Pago.' },
    { cat:'Asistente IA', q:'¿Qué puede hacer el Asistente IA?', a:'Reportes en lenguaje natural, identificación de oportunidades, acciones directas en el CRM, proyecciones de ventas y búsqueda en toda tu base de datos.' },
    { cat:'Asistente IA', q:'¿El Asistente IA está incluido en todos los planes?', a:'El Asistente IA está incluido desde el plan Pro. En el plan Starter no está disponible.' },
    { cat:'Configuración', q:'¿Necesito saber programar?', a:'No. Clientum está diseñado para PyMEs sin perfil técnico. Todo se configura desde paneles visuales.' },
    { cat:'Configuración', q:'¿En cuánto tiempo está funcionando?', a:'En 5-7 días hábiles para el plan Starter. Nuestro equipo te acompaña en el onboarding completo.' },
  ];
  const cats = [...new Set(faqs.map(f=>f.cat))];
  return `
<section class="section" style="padding-top:120px">
  <div class="container">
    <div class="section-header">
      <span class="section-label">FAQ</span>
      <h1>¿Cómo podemos ayudarte?</h1>
      <p>Encontrá respuestas sobre el chatbot de WhatsApp, facturación AFIP, planes y más.</p>
    </div>

    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:48px">
      ${cats.map(c=>`<span class="badge badge-blue" style="cursor:pointer;padding:8px 16px">${c}</span>`).join('')}
    </div>

    ${cats.map(cat=>`
    <div style="max-width:760px;margin:0 auto 48px">
      <h3 style="margin-bottom:24px;color:var(--text-muted);font-size:1rem;font-weight:600;text-transform:uppercase;letter-spacing:.05em">${cat}</h3>
      ${faqs.filter(f=>f.cat===cat).map(f=>`
      <div class="faq-item">
        <button class="faq-question">${f.q}<svg class="faq-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></button>
        <p class="faq-answer">${f.a}</p>
      </div>`).join('')}
    </div>`).join('')}

    <div class="cta-section" style="border-radius:var(--radius-lg);border:1px solid var(--border);margin-top:48px">
      <h2>¿No encontraste tu respuesta?</h2>
      <p>Nuestro equipo responde en menos de 24 horas hábiles.</p>
      <div class="cta-actions"><a href="/contacto" class="btn btn-primary">Contactar soporte</a></div>
    </div>
  </div>
</section>`;
}
