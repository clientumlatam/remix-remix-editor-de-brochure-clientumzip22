export function industriasPage(): string {
  const industries = [
    { icon:'🏥', name:'Salud & Estética', desc:'Agendamiento automático, recordatorios de turnos, ficha del paciente y gestión de pagos. Reducí las inasistencias y enfocate en atender.', cases:['Clínicas estéticas','Centros de salud','Consultorios odontológicos','Gimnasios y spas'] },
    { icon:'🚛', name:'Distribución & Logística', desc:'Control de pedidos, stock en tiempo real, ruteo de entregas y facturación automática por AFIP. Para distribuidoras de cualquier rubro.', cases:['Distribuidoras mayoristas','Logística de última milla','Proveedores de retail','Distribución de alimentos'] },
    { icon:'🛒', name:'Retail & E-Commerce', desc:'Stock multicanal, integración con tiendas online, CRM de compradores y automatización de posventa. Vendé más sin sumar personal.', cases:['Tiendas físicas','E-commerce','Marketplace','Multisucursal'] },
    { icon:'🌾', name:'Agroindustria', desc:'Trazabilidad por lote, gestión de campaña, control de costos y reportes de rentabilidad. Para el campo argentino.', cases:['Fincas y viñedos','Cooperativas agrícolas','Exportadores','Frigoríficos'] },
    { icon:'💼', name:'Servicios Profesionales', desc:'CRM de clientes, presupuestos automáticos, seguimiento de proyectos y facturación integrada. Para estudios y consultoras.', cases:['Estudios contables','Consultoras','Agencias','Estudios jurídicos'] },
    { icon:'🏨', name:'Gastronomía & Hotelería', desc:'Reservas online, chatbot de WhatsApp para consultas, gestión de pedidos y fidelización de clientes.', cases:['Restaurantes','Hoteles y apart-hotels','Catering','Bares y cafés'] },
  ];

  return `
<section class="section" style="padding-top:120px">
  <div class="container">
    <div class="section-header">
      <span class="section-label">Por Industria</span>
      <h1>Soluciones adaptadas a tu sector</h1>
      <p>Clientum se adapta a la realidad de cada rubro. La misma plataforma, configurada para los desafíos específicos de tu industria.</p>
    </div>

    <div style="display:flex;flex-direction:column;gap:48px;margin-top:64px">
      ${industries.map((ind,i)=>`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center${i%2===1?';direction:rtl':''}">
        <div style="${i%2===1?'direction:ltr':''}">
          <div style="font-size:3rem;margin-bottom:16px">${ind.icon}</div>
          <h2 style="margin-bottom:12px">${ind.name}</h2>
          <p style="margin-bottom:20px;line-height:1.8">${ind.desc}</p>
          <a href="/contacto" class="btn btn-primary">Hablar con un especialista</a>
        </div>
        <div style="${i%2===1?'direction:ltr':''}">
          <div class="card" style="background:var(--surface)">
            <h4 style="margin-bottom:16px;font-size:.85rem;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted)">Casos de uso</h4>
            <div style="display:flex;flex-direction:column;gap:10px">
              ${ind.cases.map(c=>`
              <div style="display:flex;align-items:center;gap:10px;padding:12px 16px;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius)">
                <span style="color:var(--green)">✓</span>
                <span style="font-size:.875rem">${c}</span>
              </div>`).join('')}
            </div>
          </div>
        </div>
      </div>`).join('<hr style="border:none;border-top:1px solid var(--border);margin:0"/>')}
    </div>
  </div>
</section>

<div class="cta-section">
  <div class="container">
    <h2>¿No encontrás tu industria?</h2>
    <p>Clientum se adapta a cualquier PyME argentina. Contanos tu negocio y lo vemos juntos.</p>
    <div class="cta-actions">
      <a href="/contacto" class="btn btn-primary btn-lg">Hablar con nosotros →</a>
      <a href="/register" class="btn btn-ghost btn-lg">Probar gratis</a>
    </div>
  </div>
</div>`;
}
