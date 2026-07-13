export function erpPage(): string {
  return `
<section class="section" style="padding-top:120px">
  <div class="container">
    <div class="section-header">
      <span class="section-label">ERP Personalizado</span>
      <h1>El ERP que se adapta a tu PyME, no al revés</h1>
      <p>Sistemas ERP pensados para la realidad argentina: facturación AFIP, precios en pesos, logística local. Implementados en semanas, no en meses.</p>
      <div style="display:flex;gap:12px;justify-content:center;margin-top:28px;flex-wrap:wrap">
        <a href="/contacto" class="btn btn-primary">Hablar con un especialista</a>
        <a href="/consultoria" class="btn btn-ghost">Hacer diagnóstico primero</a>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start;margin-top:64px">
      <div>
        <h2 style="margin-bottom:24px">Módulos disponibles</h2>
        <div style="display:flex;flex-direction:column;gap:12px">
          ${[
            ['📦','Stock e Inventario','Multialmacén, lotes, vencimientos y trazabilidad completa.'],
            ['🧾','Facturación AFIP','Facturas A, B, C, NC y ND en tiempo real. Integración nativa.'],
            ['🛒','Compras y Proveedores','Órdenes de compra, recepción y cuentas corrientes de proveedores.'],
            ['💵','Tesorería','Cajas, bancos, conciliación y flujo de caja proyectado.'],
            ['🚛','Logística y Entregas','Ruteo, estados de pedido y seguimiento de entregas.'],
            ['📊','Reportes de Gestión','P&L, rentabilidad por producto, rotación de stock y más.'],
          ].map(([i,t,d])=>`
          <div style="display:flex;gap:16px;padding:16px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);align-items:flex-start">
            <span style="font-size:1.5rem;flex-shrink:0">${i}</span>
            <div><div style="font-weight:600;font-size:.9rem;margin-bottom:4px">${t}</div><p style="font-size:.8rem;color:var(--text-muted)">${d}</p></div>
          </div>`).join('')}
        </div>
      </div>
      <div style="position:sticky;top:100px">
        <div class="card" style="background:var(--surface);margin-bottom:20px">
          <h3 style="margin-bottom:20px">Precios orientativos</h3>
          ${[
            { plan:'ERP Starter', price:'Desde $800.000', desc:'Facturación + Stock + CRM básico. Hasta 3 usuarios.' },
            { plan:'ERP Pro', price:'Desde $1.400.000', desc:'Todos los módulos. Hasta 10 usuarios. API incluida.' },
            { plan:'ERP Enterprise', price:'A medida', desc:'Multi-sucursal, integración con sistemas propios, SLA.' },
          ].map(p=>`
          <div style="padding:16px 0;border-bottom:1px solid var(--border)">
            <div style="font-weight:600;margin-bottom:4px">${p.plan}</div>
            <div style="font-size:1.1rem;font-weight:700;color:var(--blue-light);margin-bottom:4px">${p.price}</div>
            <p style="font-size:.8rem;color:var(--text-muted)">${p.desc}</p>
          </div>`).join('')}
          <a href="/contacto" class="btn btn-primary" style="width:100%;justify-content:center;margin-top:20px">Pedir cotización</a>
        </div>
        <div class="card card-sm">
          <h4 style="margin-bottom:12px">Implementación incluida</h4>
          <ul style="list-style:none;display:flex;flex-direction:column;gap:8px">
            ${['Relevamiento de procesos','Configuración personalizada','Migración de datos','Capacitación del equipo','Soporte post-implementación'].map(i=>`<li style="font-size:.8rem;display:flex;gap:8px"><span style="color:var(--green)">✓</span>${i}</li>`).join('')}
          </ul>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section" style="background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border)">
  <div class="container">
    <div class="section-header"><span class="section-label">Sectores</span><h2>ERP por industria</h2></div>
    <div class="card-grid" style="grid-template-columns:repeat(3,1fr)">
      ${[
        ['🚛','Distribuidoras','Stock multialmacén, pedidos, remitos y facturación masiva.'],
        ['🛒','Retail','POS integrado, e-commerce y control de sucursales.'],
        ['🌾','Agroindustria','Trazabilidad de lotes, campaña y costos de producción.'],
        ['🏭','Manufactura','Órdenes de producción, control de MP y costo de producto.'],
        ['💼','Servicios','Proyectos, horas trabajadas y facturación por avance.'],
        ['🏥','Salud','Turnos, historia clínica, insumos y obra social.'],
      ].map(([i,t,d])=>`
      <div class="card card-sm"><div style="font-size:1.8rem;margin-bottom:10px">${i}</div><h4>${t}</h4><p style="font-size:.8rem;color:var(--text-muted);margin-top:6px">${d}</p></div>`).join('')}
    </div>
  </div>
</section>

<div class="cta-section">
  <div class="container">
    <h2>Implementación en semanas, no meses</h2>
    <p>Te acompañamos desde el relevamiento hasta que tu equipo esté operativo.</p>
    <div class="cta-actions"><a href="/contacto" class="btn btn-primary btn-lg">Pedir cotización →</a></div>
  </div>
</div>`;
}
