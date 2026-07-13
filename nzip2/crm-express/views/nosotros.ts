export function nosotrosPage(): string {
  return `
<section class="section" style="padding-top:120px">
  <div class="container">
    <div class="section-header">
      <span class="section-label">Sobre Nosotros</span>
      <h1>Nacimos para que las PyMEs argentinas compitan con los grandes</h1>
      <p>Clientum es una plataforma de IA construida en Argentina para PyMEs argentinas. Entendemos los desafíos del mercado local: inflación, facturación AFIP, WhatsApp como canal principal.</p>
    </div>

    <div class="hero-grid" style="align-items:center;margin-top:64px">
      <div class="fade-up">
        <span class="section-label">Nuestra misión</span>
        <h2>Tecnología de punta accesible para toda PyME</h2>
        <p style="margin-top:16px;line-height:1.8">Creemos que una ferretería de Allen o una clínica de General Roca merece las mismas herramientas que las grandes corporaciones. Sin depender de IT, sin pagar en dólares, sin semanas de implementación.</p>
        <p style="margin-top:12px;line-height:1.8">Combinamos inteligencia artificial, automatización y CRM en una plataforma pensada para la realidad argentina.</p>
      </div>
      <div>
        <div class="card" style="background:var(--surface)">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
            ${[
              ['2023','Año de fundación'],
              ['+500','PyMEs activas'],
              ['8','Provincias cubiertas'],
              ['24/7','Soporte automático'],
            ].map(([n,l])=>`
            <div style="text-align:center;padding:24px;background:var(--bg);border-radius:var(--radius);border:1px solid var(--border)">
              <div style="font-size:2rem;font-weight:800;color:var(--blue-light)">${n}</div>
              <div style="font-size:.8rem;color:var(--text-muted);margin-top:4px">${l}</div>
            </div>`).join('')}
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section" style="background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border)">
  <div class="container">
    <div class="section-header">
      <span class="section-label">El equipo</span>
      <h2>Construido por emprendedores, para emprendedores</h2>
    </div>
    <div class="card-grid card-grid-3">
      ${[
        { init:'S', name:'Santiago M.', role:'CEO & Co-fundador', bio:'Ex-consultor ERP. 10 años asesorando PyMEs en la Patagonia.' },
        { init:'V', name:'Valentina R.', role:'CTO & Co-fundadora', bio:'Ingeniería en Sistemas. Especialista en IA aplicada a negocios.' },
        { init:'L', name:'Lucas P.', role:'Head of Customer Success', bio:'Acompañó el onboarding de más de 300 PyMEs desde el día uno.' },
      ].map(m=>`
      <div class="card" style="text-align:center">
        <div class="author-avatar" style="width:64px;height:64px;font-size:1.5rem;margin:0 auto 16px">${m.init}</div>
        <div style="font-weight:700">${m.name}</div>
        <div style="font-size:.8rem;color:var(--blue-light);margin-bottom:12px">${m.role}</div>
        <p style="font-size:.875rem">${m.bio}</p>
      </div>`).join('')}
    </div>
  </div>
</section>

<section class="section">
  <div class="container" style="max-width:720px">
    <div class="section-header">
      <span class="section-label">Nuestros valores</span>
      <h2>Lo que nos guía cada día</h2>
    </div>
    <div style="display:flex;flex-direction:column;gap:24px">
      ${[
        ['🎯','Foco en el resultado','No vendemos tecnología, vendemos resultados concretos: más ventas, menos tiempo perdido, más orden.'],
        ['🤝','Acompañamiento real','Implementamos, capacitamos y seguimos al lado. No somos un software que te dejamos solo.'],
        ['🇦🇷','Hecho en Argentina','Entendemos la facturación AFIP, el tipo de cambio, el WhatsApp business y la realidad de cada provincia.'],
        ['🔒','Datos seguros','Tu información nunca sale del país. Hosting local, backups diarios, encriptación end-to-end.'],
      ].map(([i,t,d])=>`
      <div style="display:flex;gap:20px;align-items:flex-start;padding:24px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius)">
        <div style="font-size:2rem;flex-shrink:0">${i}</div>
        <div><h4 style="margin-bottom:8px">${t}</h4><p style="font-size:.875rem;color:var(--text-muted)">${d}</p></div>
      </div>`).join('')}
    </div>
  </div>
</section>

<div class="cta-section">
  <div class="container">
    <h2>Trabajemos juntos</h2>
    <p>Contanos tu negocio y diseñamos una solución a medida.</p>
    <div class="cta-actions">
      <a href="/contacto" class="btn btn-primary btn-lg">Hablar con el equipo →</a>
      <a href="/casos" class="btn btn-ghost btn-lg">Ver casos de éxito</a>
    </div>
  </div>
</div>`;
}
