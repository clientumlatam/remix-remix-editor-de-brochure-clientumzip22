export function casosPage(): string {
  return `
<section class="section" style="padding-top:120px">
  <div class="container">
    <div class="section-header">
      <span class="section-label">Casos de Éxito</span>
      <h1>La experiencia de trabajar con Clientum</h1>
      <p>Descubrí cómo PyMEs argentinas de distintos rubros automatizaron su negocio y aumentaron sus ventas.</p>
    </div>
    <div class="card-grid card-grid-3">
      ${[
        { emoji:'🏥', name:'Clínica Estética Lumière', rubro:'Salud & Estética', loc:'General Roca', result:'+45% turnos agendados', quote:'El chatbot agenda turnos 24/7. Ya no perdemos pacientes que llaman fuera de horario.', logo:'L' },
        { emoji:'🚛', name:'Distribuidora Patagónica', rubro:'Distribución', loc:'Neuquén', result:'-30% tiempo en administración', quote:'Antes tardábamos 3 días en emitir una factura. Ahora sale en 2 minutos desde el deal.', logo:'D' },
        { emoji:'📊', name:'Estudio Méndez & Asoc.', rubro:'Servicios Contables', loc:'General Roca', result:'+60% eficiencia operativa', quote:'Ahora sabemos exactamente qué repuestos tenemos sin revisar papeles. Las facturas salen solas.', logo:'M' },
        { emoji:'🛒', name:'Ferretería El Clavo', rubro:'Retail', loc:'Allen, Río Negro', result:'+25% ventas online', quote:'Conectamos el stock con la tienda y el CRM. Cero errores de inventario.', logo:'F' },
        { emoji:'🌾', name:'Agro Patagónica', rubro:'Agroindustria', loc:'Cipolletti', result:'Trazabilidad completa de lotes', quote:'Rastreamos cada lote desde el campo hasta la entrega. Nunca tuvimos esa visibilidad.', logo:'A' },
        { emoji:'🏨', name:'Hotel del Comahue', rubro:'Gastronomía / Hotelería', loc:'Neuquén Capital', result:'+80% consultas resueltas por bot', quote:'El chatbot responde disponibilidad, precios y reservas. El 80% se resuelve sin humano.', logo:'H' },
      ].map(c=>`
      <div class="card" style="display:flex;flex-direction:column">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
          <div class="author-avatar" style="width:48px;height:48px;font-size:1.1rem;flex-shrink:0">${c.logo}</div>
          <div>
            <div style="font-weight:600;font-size:.95rem">${c.name}</div>
            <div style="font-size:.8rem;color:var(--text-muted)">${c.rubro} · ${c.loc}</div>
          </div>
        </div>
        <div class="badge badge-green" style="align-self:flex-start;margin-bottom:16px">${c.result}</div>
        <p style="font-size:.9rem;font-style:italic;flex:1">"${c.quote}"</p>
      </div>`).join('')}
    </div>
  </div>
</section>

<div class="cta-section">
  <div class="container">
    <h2>Tu empresa podría ser el próximo caso de éxito</h2>
    <p>Probá Clientum 14 días gratis y medí el impacto en tu operación.</p>
    <div class="cta-actions"><a href="/register" class="btn btn-primary btn-lg">Empezar gratis →</a></div>
  </div>
</div>`;
}
