export function integracionPage(): string {
  const integrations = [
    { cat:'Facturación', items:['AFIP (factura electrónica A, B, C)','Facturante','Siigo','Colppy'] },
    { cat:'E-Commerce', items:['Tienda Nube','WooCommerce','MercadoShops','Shopify'] },
    { cat:'Pagos', items:['MercadoPago','Stripe','PayU','Naranja X'] },
    { cat:'Logística', items:['Andreani','OCA','Correo Argentino','Ship Now'] },
    { cat:'Comunicación', items:['WhatsApp Business API','Gmail','Outlook','Telegram'] },
    { cat:'Contabilidad', items:['Tango Gestión','Bejerman','Defontana','SAP B1 (consultar)'] },
  ];

  return `
<section class="section" style="padding-top:120px">
  <div class="container">
    <div class="section-header">
      <span class="section-label">Integración de Tecnología</span>
      <h1>Conectamos Clientum con todo lo que ya usás</h1>
      <p>No tenés que cambiar todos tus sistemas. Conectamos Clientum con tu facturación, e-commerce, logística y sistemas propios para que todo funcione junto.</p>
      <div style="display:flex;gap:12px;justify-content:center;margin-top:28px;flex-wrap:wrap">
        <a href="/contacto" class="btn btn-primary">Consultar integración</a>
        <a href="/erp" class="btn btn-ghost">Ver ERP</a>
      </div>
    </div>

    <div class="card-grid card-grid-3" style="margin-top:64px">
      ${integrations.map(g=>`
      <div class="card">
        <h4 style="margin-bottom:16px;color:var(--blue-light)">${g.cat}</h4>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${g.items.map(item=>`
          <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--surface);border-radius:var(--radius);border:1px solid var(--border)">
            <span style="color:var(--green);font-size:.8rem">✓</span>
            <span style="font-size:.875rem">${item}</span>
          </div>`).join('')}
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>

<section class="section" style="background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border)">
  <div class="container">
    <div class="section-header"><span class="section-label">API</span><h2>¿Tenés un sistema propio? Usá nuestra API.</h2></div>
    <div class="hero-grid" style="align-items:center">
      <div>
        <p style="line-height:1.8;margin-bottom:20px">Clientum expone una API REST completa para que tu equipo de desarrollo conecte cualquier sistema interno. Autenticación por token, documentación completa y ambiente de sandbox para pruebas.</p>
        <div style="display:flex;flex-direction:column;gap:12px">
          ${[
            'API REST con autenticación por Bearer token',
            'Webhooks para eventos en tiempo real',
            'Sandbox de desarrollo incluido',
            'Documentación técnica en español',
            'Soporte de integración con nuestro equipo',
          ].map(f=>`
          <div style="display:flex;gap:10px;align-items:center;font-size:.875rem">
            <span style="color:var(--green)">✓</span>${f}
          </div>`).join('')}
        </div>
        <a href="/contacto" class="btn btn-primary" style="margin-top:28px">Solicitar documentación API</a>
      </div>
      <div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-lg);padding:24px;font-family:monospace;font-size:.8rem;overflow:hidden">
        <div style="color:var(--text-faint);margin-bottom:16px"># Crear un contacto via API</div>
        <div style="color:#7dd3fc">POST</div> <span style="color:var(--text)">/api/v1/contacts</span>
        <div style="color:var(--text-faint);margin-top:8px">Authorization: Bearer {token}</div>
        <pre style="color:var(--text);margin-top:16px;white-space:pre-wrap">{
  "name": "Juan García",
  "phone": "+549...",
  "email": "juan@empresa.com",
  "pipeline_stage": "prospecto",
  "tags": ["mayorista", "norte"]
}</pre>
        <div style="color:var(--green);margin-top:16px">→ 201 Created</div>
        <pre style="color:var(--text-faint);margin-top:8px;white-space:pre-wrap">{
  "id": "cnt_abc123",
  "created_at": "2026-07-13T..."
}</pre>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-header"><span class="section-label">Proceso</span><h2>Cómo implementamos una integración</h2></div>
    <div class="card-grid" style="grid-template-columns:repeat(4,1fr)">
      ${[
        ['01','Relevamiento','Entendemos qué sistemas tenés y qué datos necesitás sincronizar.'],
        ['02','Diseño','Definimos el flujo de datos, frecuencia y transformaciones necesarias.'],
        ['03','Desarrollo','Construimos la integración con pruebas en sandbox antes de producción.'],
        ['04','Monitoreo','Dashboard de estado de sincronización y alertas ante errores.'],
      ].map(([n,t,d])=>`
      <div class="card" style="text-align:center">
        <div style="width:40px;height:40px;border-radius:50%;background:var(--blue-light);color:#fff;display:flex;align-items:center;justify-content:center;font-size:.85rem;font-weight:700;margin:0 auto 16px">${n}</div>
        <h4 style="margin-bottom:8px">${t}</h4>
        <p style="font-size:.8rem;color:var(--text-muted)">${d}</p>
      </div>`).join('')}
    </div>
  </div>
</section>

<div class="cta-section">
  <div class="container">
    <h2>Tu tecnología, conectada</h2>
    <p>Desde $400.000. Contanos qué sistemas usás y diseñamos la integración.</p>
    <div class="cta-actions"><a href="/contacto" class="btn btn-primary btn-lg">Consultar →</a></div>
  </div>
</div>`;
}
