export function comparativaPage(): string {
  const features: [string, boolean, boolean, boolean, boolean][] = [
    ['Chatbot WhatsApp 24/7', true, false, false, false],
    ['CRM visual con pipeline', true, true, false, false],
    ['Asistente IA integrado', true, false, false, false],
    ['Facturación AFIP', true, false, false, false],
    ['Reportes automáticos', true, true, true, false],
    ['Automatización de flujos', true, true, false, false],
    ['Portal del cliente', true, false, false, false],
    ['Onboarding incluido', true, false, false, false],
    ['Precio en pesos ARS', true, false, false, false],
    ['Sin código ni IT', true, false, false, true],
    ['Soporte en español 24/7', true, false, false, false],
    ['Multi-sucursal', true, true, true, false],
  ];

  const competitors = ['Clientum', 'HubSpot', 'Salesforce', 'Zoho'];

  function check(v: boolean): string {
    return v
      ? '<span style="color:var(--green);font-size:1.1rem">✓</span>'
      : '<span style="color:var(--text-faint);font-size:1rem">—</span>';
  }

  function rowStyle(ri: number): string {
    return ri % 2 === 0 ? 'background:var(--surface)' : '';
  }

  function cellStyle(ci: number): string {
    return ci === 0 ? 'padding:14px 20px;background:rgba(59,130,246,.04)' : 'padding:14px 20px';
  }

  const headerCols = competitors.map((c, i) => {
    const highlight = i === 0;
    const style = highlight
      ? 'padding:16px 20px;border-bottom:2px solid var(--blue-light);color:var(--blue-light);background:rgba(59,130,246,.05);border-radius:12px 12px 0 0'
      : 'padding:16px 20px;border-bottom:2px solid var(--border)';
    const sub = highlight ? '<div style="font-size:.7rem;font-weight:400;color:var(--green);margin-top:4px">Recomendado</div>' : '';
    return `<th style="${style}">${c}${sub}</th>`;
  }).join('');

  const bodyRows = features.map(([label, ...vals], ri) => {
    const cells = vals.map((v, ci) => {
      return `<td style="${cellStyle(ci)}">${check(v)}</td>`;
    }).join('');
    return `<tr style="border-bottom:1px solid var(--border);${rowStyle(ri)}">
              <td style="text-align:left;padding:14px 20px;font-size:.875rem">${label}</td>
              ${cells}
            </tr>`;
  }).join('');

  const pricingCards = [
    { name: 'Clientum', price: '$59.990/mes', note: 'En pesos ARS · Todo incluido', highlight: true },
    { name: 'HubSpot', price: 'USD 800/mes', note: 'Plan profesional · Sin IA local', highlight: false },
    { name: 'Salesforce', price: 'USD 1.200/mes', note: 'Plan Essentials · Sin WhatsApp', highlight: false },
    { name: 'Zoho CRM', price: 'USD 35/usuario/mes', note: 'Funciones básicas · Sin AFIP', highlight: false },
  ].map(p => {
    const cta = p.highlight ? '<a href="/register" class="btn btn-primary" style="width:100%;justify-content:center;margin-top:16px">Probar gratis</a>' : '';
    const priceColor = p.highlight ? 'var(--blue-light)' : 'var(--text)';
    const cls = p.highlight ? 'card featured' : 'card';
    return `<div class="${cls}">
      <div style="font-weight:700;margin-bottom:8px">${p.name}</div>
      <div style="font-size:1.4rem;font-weight:800;color:${priceColor};margin-bottom:8px">${p.price}</div>
      <p style="font-size:.8rem;color:var(--text-muted)">${p.note}</p>
      ${cta}
    </div>`;
  }).join('');

  return `
<section class="section" style="padding-top:120px">
  <div class="container">
    <div class="section-header">
      <span class="section-label">Comparativa</span>
      <h1>Clientum vs. las alternativas globales</h1>
      <p>Las grandes plataformas no fueron construidas para PyMEs argentinas. Clientum sí.</p>
    </div>

    <div style="overflow-x:auto;margin-top:48px">
      <table style="width:100%;border-collapse:collapse;text-align:center">
        <thead>
          <tr>
            <th style="text-align:left;padding:16px 20px;border-bottom:2px solid var(--border);font-size:.85rem;color:var(--text-muted)">Característica</th>
            ${headerCols}
          </tr>
        </thead>
        <tbody>
          ${bodyRows}
        </tbody>
      </table>
    </div>

    <div style="margin-top:64px">
      <div class="section-header"><span class="section-label">Precios</span><h2>Lo que pagás en cada plataforma</h2></div>
      <div class="card-grid" style="grid-template-columns:repeat(4,1fr)">
        ${pricingCards}
      </div>
    </div>
  </div>
</section>

<div class="cta-section">
  <div class="container">
    <h2>Elegí la herramienta construida para tu realidad</h2>
    <p>14 días gratis. En pesos. Sin configuraciones interminables.</p>
    <div class="cta-actions">
      <a href="/register" class="btn btn-primary btn-lg">Empezar gratis →</a>
      <a href="/precios" class="btn btn-ghost btn-lg">Ver planes</a>
    </div>
  </div>
</div>`;
}
