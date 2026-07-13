export function desarrolloWebPage(): string {
  return `
<section class="section" style="padding-top:120px">
  <div class="container">
    <div class="section-header">
      <span class="section-label">Desarrollo Web</span>
      <h1>Sitios web y e-commerce que generan ventas, no solo visitas</h1>
      <p>Desarrollamos sitios web, landing pages y tiendas online integradas directamente al CRM de Clientum. Cada visita se convierte en un lead, cada venta entra al pipeline.</p>
      <div style="display:flex;gap:12px;justify-content:center;margin-top:28px;flex-wrap:wrap">
        <a href="/contacto" class="btn btn-primary">Pedir cotización</a>
        <a href="/casos" class="btn btn-ghost">Ver ejemplos</a>
      </div>
    </div>

    <div class="card-grid card-grid-3" style="margin-top:64px">
      ${[
        { icon:'🌐', title:'Sitio web corporativo', price:'Desde $600.000', desc:'Presencia online profesional con integración al CRM. Formularios que van directo a tu pipeline.' },
        { icon:'🎯', title:'Landing pages', price:'Desde $200.000', desc:'Páginas de conversión para campañas de Google Ads o Meta. Optimizadas para captura de leads.' },
        { icon:'🛒', title:'E-Commerce', price:'Desde $900.000', desc:'Tienda online conectada al stock del CRM. Pedidos que entran automáticamente a tu sistema.' },
        { icon:'📱', title:'Diseño mobile-first', price:'Incluido', desc:'Todos nuestros desarrollos se ven perfectos en celular, donde el 75% de tus clientes navega.' },
        { icon:'⚡', title:'Velocidad y SEO', price:'Incluido', desc:'Código optimizado para carga rápida y posicionamiento en Google desde el primer día.' },
        { icon:'🔗', title:'Integración Clientum', price:'Incluido', desc:'Tu sitio habla con el CRM. Leads, pedidos y consultas entran automáticamente a tu pipeline.' },
      ].map(s=>`
      <div class="feature-card" style="display:flex;flex-direction:column">
        <div class="card-icon">${s.icon}</div>
        <h3>${s.title}</h3>
        <p style="flex:1">${s.desc}</p>
        <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border);font-size:.8rem;font-weight:600;color:var(--blue-light)">${s.price}</div>
      </div>`).join('')}
    </div>
  </div>
</section>

<section class="section" style="background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border)">
  <div class="container">
    <div class="section-header"><span class="section-label">Tecnologías</span><h2>Stack moderno, mantenimiento simple</h2></div>
    <div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-top:24px">
      ${['WordPress + WooCommerce','Tienda Nube','Next.js','React','PHP','PostgreSQL','Cloudflare CDN','Google Analytics 4','Meta Pixel','Integración AFIP'].map(t=>`
      <span style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:100px;font-size:.875rem;font-weight:500">${t}</span>`).join('')}
    </div>
  </div>
</section>

<section class="section">
  <div class="container" style="max-width:720px">
    <div class="section-header"><span class="section-label">Proceso</span><h2>De la idea al sitio en vivo</h2></div>
    <div style="display:flex;flex-direction:column;gap:0">
      ${[
        ['Semana 1','Brief y diseño','Entendemos tu negocio, competencia y objetivos. Diseñamos wireframes y paleta.'],
        ['Semana 2–3','Desarrollo','Construimos el sitio con tu marca, copy y funcionalidades acordadas.'],
        ['Semana 4','Integración','Conectamos el CRM, formularios, analítica y cualquier sistema externo.'],
        ['Semana 5','QA y ajustes','Revisión completa en todos los dispositivos. Ajustes de copy y diseño.'],
        ['Semana 6','Lanzamiento','Publicación, verificación en Google y entrega de accesos y manual.'],
      ].map(([w,t,d],i,arr)=>`
      <div style="display:flex;gap:20px;position:relative;padding-bottom:${i<arr.length-1?'28px':'0'}">
        <div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0">
          <div style="width:44px;height:44px;border-radius:50%;background:var(--surface);border:2px solid var(--blue-light);color:var(--blue-light);display:flex;align-items:center;justify-content:center;font-size:.65rem;font-weight:700;text-align:center;line-height:1.2">${w}</div>
          ${i<arr.length-1?`<div style="width:2px;flex:1;background:var(--border);margin-top:6px"></div>`:''}
        </div>
        <div style="padding-top:10px">
          <div style="font-weight:700;margin-bottom:6px">${t}</div>
          <p style="font-size:.875rem;color:var(--text-muted)">${d}</p>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>

<div class="cta-section">
  <div class="container">
    <h2>Tu sitio web, conectado a tu negocio</h2>
    <p>Desde $600.000. Entrega en 6 semanas. Integración con Clientum incluida.</p>
    <div class="cta-actions"><a href="/contacto" class="btn btn-primary btn-lg">Pedir cotización →</a></div>
  </div>
</div>`;
}
