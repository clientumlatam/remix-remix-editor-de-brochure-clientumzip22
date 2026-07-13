export function blogPage(): string {
  const posts = [
    { cat:'CRM', date:'10 Jul 2026', title:'Cómo organizar tu pipeline de ventas sin morir en el intento', desc:'Pipeline caótico = ventas perdidas. Te mostramos el sistema de 4 etapas que usan las PyMEs más eficientes.', min:'5 min', slug:'pipeline-ventas' },
    { cat:'WhatsApp', date:'7 Jul 2026', title:'Por qué el 73% de tus clientes prefiere WhatsApp sobre el email', desc:'Los datos son claros. Si no estás atendiendo por WhatsApp, estás perdiendo ventas a diario.', min:'4 min', slug:'whatsapp-vs-email' },
    { cat:'Automatización', date:'3 Jul 2026', title:'5 tareas que tu PyME puede automatizar esta semana', desc:'Recordatorios, seguimientos, facturas y más. Te explicamos cuáles automatizar primero para ver resultados rápido.', min:'6 min', slug:'automatizacion-pyme' },
    { cat:'IA', date:'28 Jun 2026', title:'Asistente IA: qué puede (y no puede) hacer por tu negocio', desc:'La IA no reemplaza a tu equipo, lo multiplica. Casos de uso reales con PyMEs argentinas.', min:'7 min', slug:'asistente-ia-casos' },
    { cat:'Facturación', date:'22 Jun 2026', title:'Facturación AFIP desde el CRM: guía paso a paso', desc:'Emitir una factura electrónica no debería tomar más de 30 segundos. Así lo hacemos con Clientum.', min:'5 min', slug:'facturacion-afip' },
    { cat:'Caso de éxito', date:'15 Jun 2026', title:'Distribuidora Patagónica: de planillas a CRM en 7 días', desc:'Cómo una distribuidora de Neuquén eliminó el 80% del trabajo administrativo con Clientum.', min:'8 min', slug:'caso-distribuidora' },
  ];

  const categories = ['Todos', 'CRM', 'WhatsApp', 'Automatización', 'IA', 'Facturación', 'Caso de éxito'];

  return `
<section class="section" style="padding-top:120px">
  <div class="container">
    <div class="section-header">
      <span class="section-label">Blog</span>
      <h1>Recursos y aprendizajes para PyMEs</h1>
      <p>Estrategias, casos de éxito y tutoriales pensados para la realidad de los negocios argentinos.</p>
    </div>

    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:48px">
      ${categories.map((c,i)=>`<button class="btn ${i===0?'btn-primary':'btn-ghost'}" style="font-size:.8rem;padding:6px 16px">${c}</button>`).join('')}
    </div>

    <div class="card-grid card-grid-3">
      ${posts.map(p=>`
      <article class="card" style="display:flex;flex-direction:column;cursor:pointer">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <span class="badge badge-green">${p.cat}</span>
          <span style="font-size:.75rem;color:var(--text-faint)">${p.date}</span>
        </div>
        <h3 style="font-size:1.05rem;margin-bottom:10px;flex:1">${p.title}</h3>
        <p style="font-size:.875rem;color:var(--text-muted);margin-bottom:20px">${p.desc}</p>
        <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--border);padding-top:16px">
          <span style="font-size:.75rem;color:var(--text-faint)">⏱ ${p.min} lectura</span>
          <span style="font-size:.875rem;font-weight:500;color:var(--blue-light)">Leer →</span>
        </div>
      </article>`).join('')}
    </div>

    <div class="text-center" style="margin-top:48px">
      <button class="btn btn-ghost">Cargar más artículos</button>
    </div>
  </div>
</section>

<section class="section" style="background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border)">
  <div class="container" style="max-width:600px;text-align:center">
    <span class="section-label">Newsletter</span>
    <h2>Estrategias para tu PyME cada semana</h2>
    <p style="margin-bottom:32px">Sin spam. Un correo semanal con el contenido más útil del blog y novedades de Clientum.</p>
    <form style="display:flex;gap:12px;max-width:440px;margin:0 auto" onsubmit="return false">
      <input type="email" placeholder="tu@email.com" style="flex:1;padding:10px 16px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);color:var(--text);font-size:.9rem"/>
      <button class="btn btn-primary">Suscribirme</button>
    </form>
  </div>
</section>

<div class="cta-section">
  <div class="container">
    <h2>¿Querés ver Clientum en acción?</h2>
    <p>Probalo 14 días gratis y aplicá lo que aprendiste en tu propio negocio.</p>
    <div class="cta-actions"><a href="/register" class="btn btn-primary btn-lg">Empezar gratis →</a></div>
  </div>
</div>`;
}
