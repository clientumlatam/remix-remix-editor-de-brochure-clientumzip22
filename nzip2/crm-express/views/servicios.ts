export function serviciosPage(): string {
  const services = [
    { icon:'🎯', title:'Consultoría Empresarial', desc:'Analizamos tu negocio, identificamos ineficiencias y diseñamos un plan de acción concreto.', href:'/consultoria', price:'Sin costo inicial' },
    { icon:'🏭', title:'ERP Personalizado', desc:'ERP adaptado a tu industria y tamaño. Desde $800.000 ARS. Implementación incluida.', href:'/erp', price:'Desde $800.000' },
    { icon:'🔧', title:'Implementación y Soporte', desc:'No te dejamos solo ni un día. Implementamos, capacitamos y acompañamos tu equipo.', href:'/implementacion', price:'Incluido en planes' },
    { icon:'📣', title:'Marketing Digital', desc:'Estrategias integradas con el CRM. SEO, Google Ads, redes sociales y email marketing.', href:'/marketing', price:'Desde $200.000/mes' },
    { icon:'🔗', title:'Integración de Tecnología', desc:'Conectamos Clientum con tus sistemas existentes: ERP, e-commerce, facturación, stock.', href:'/integracion', price:'Desde $400.000' },
    { icon:'🌐', title:'Desarrollo Web', desc:'Sitios web, landing pages y e-commerce conectados directamente al CRM de Clientum.', href:'/desarrollo-web', price:'Desde $600.000' },
  ];
  return `
<section class="section" style="padding-top:120px">
  <div class="container">
    <div class="section-header">
      <span class="section-label">Servicios</span>
      <h1>Servicios para PyMEs argentinas</h1>
      <p>Todo lo que tu empresa necesita en un solo lugar. Desde consultoría y ERP hasta marketing digital y desarrollo web. Implementamos, capacitamos y acompañamos.</p>
      <div style="display:flex;gap:12px;justify-content:center;margin-top:24px;flex-wrap:wrap">
        <a href="/contacto" class="btn btn-primary">Hablar con un asesor</a>
        <a href="/precios" class="btn btn-ghost">Ver precios</a>
      </div>
    </div>

    <div class="card-grid card-grid-3">
      ${services.map(s=>`
      <a href="${s.href}" class="feature-card" style="text-decoration:none;display:flex;flex-direction:column">
        <div class="card-icon">${s.icon}</div>
        <h3>${s.title}</h3>
        <p style="flex:1">${s.desc}</p>
        <div style="margin-top:20px;display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:.8rem;color:var(--text-faint)">${s.price}</span>
          <span style="color:var(--blue-light);font-size:.875rem;font-weight:500">Ver más →</span>
        </div>
      </a>`).join('')}
    </div>

    <div class="section" style="padding-top:60px">
      <div class="section-header"><span class="section-label">Sectores que atendemos</span><h2>Soluciones por industria</h2></div>
      <div class="card-grid card-grid-3">
        ${[['🛒','Minoristas','Stock multicanal y ventas omnicanal'],['🏭','Manufactura','Control de producción y trazabilidad'],['🌾','Agroindustria','Trazabilidad de lote y costos por campaña'],['🚛','Distribuidores','Ruteo, inventario y logística'],['💼','Servicios','CRM y automatización de flujos'],['💻','Tecnología','Gestión de proyectos y facturación']].map(([i,t,d])=>`
        <div class="card card-sm"><div style="font-size:1.8rem;margin-bottom:12px">${i}</div><h4>${t}</h4><p style="font-size:.875rem;margin-top:6px">${d}</p></div>`).join('')}
      </div>
    </div>
  </div>
</section>

<div class="cta-section">
  <div class="container">
    <h2>Implementamos, capacitamos y acompañamos</h2>
    <p>Contratás el paquete completo o solo los servicios que necesitás.</p>
    <div class="cta-actions"><a href="/contacto" class="btn btn-primary btn-lg">Hablar con un asesor →</a></div>
  </div>
</div>`;
}
