export function academiaPage(): string {
  const courses = [
    { tag:'Inicio rápido', level:'Básico', title:'Primeros pasos con Clientum', students:1248, rating:'4.9', time:'45 min' },
    { tag:'WhatsApp', level:'Básico', title:'Configurá tu Chatbot de WhatsApp', students:986, rating:'4.9', time:'1.5 horas' },
    { tag:'CRM', level:'Intermedio', title:'CRM: Contactos, Leads y Pipeline', students:742, rating:'4.8', time:'2 horas' },
    { tag:'Automatización', level:'Avanzado', title:'Automatizaciones avanzadas', students:413, rating:'4.8', time:'3 horas' },
    { tag:'Facturación', level:'Intermedio', title:'Facturación AFIP desde el CRM', students:651, rating:'4.7', time:'1 hora' },
    { tag:'IA', level:'Intermedio', title:'Reportes y análisis con el Asistente IA', students:329, rating:'4.9', time:'1.5 horas' },
    { tag:'Portal', level:'Básico', title:'Portal del Cliente: configuración y uso', students:518, rating:'4.8', time:'50 min' },
    { tag:'Configuración', level:'Básico', title:'Administración de tu cuenta y equipo', students:389, rating:'4.7', time:'40 min' },
  ];
  const levelColor: Record<string,string> = { Básico:'badge-green', Intermedio:'badge-blue', Avanzado:'badge-purple' };
  return `
<section class="section" style="padding-top:120px">
  <div class="container">
    <div class="section-header">
      <span class="section-label">Academia</span>
      <h1>Aprendé a sacarle el máximo a tu CRM</h1>
      <p>Cursos cortos, en español rioplatense, con casos reales de PyMEs argentinas. Sin tecnicismos innecesarios.</p>
      <div style="display:flex;gap:12px;justify-content:center;margin-top:24px;flex-wrap:wrap">
        <a href="/register" class="btn btn-primary">Empezar gratis</a>
        <a href="#cursos" class="btn btn-ghost">Ver temario completo</a>
      </div>
    </div>

    <div style="display:flex;gap:32px;justify-content:center;flex-wrap:wrap;margin-bottom:64px">
      <div class="stat-item"><div class="stat-num">8</div><div class="stat-label">Cursos disponibles</div></div>
      <div class="stat-item"><div class="stat-num">4.8★</div><div class="stat-label">Rating promedio</div></div>
      <div class="stat-item"><div class="stat-num">5.000+</div><div class="stat-label">Usuarios activos</div></div>
    </div>

    <div style="display:flex;gap:12px;margin-bottom:32px;flex-wrap:wrap;align-items:center" id="cursos">
      <span style="font-size:.875rem;font-weight:600;color:var(--text-muted)">Catálogo</span>
      <span class="badge badge-green" style="cursor:pointer">Gratis</span>
      <span class="badge badge-blue" style="cursor:pointer">Con tu plan Pro</span>
    </div>

    <p style="color:var(--text-muted);font-size:.875rem;margin-bottom:24px">Todos los cursos organizados de principiante a avanzado. Cada uno incluye video + material descargable.</p>

    <div class="card-grid card-grid-4" style="gap:20px">
      ${courses.map(c=>`
      <div class="blog-card" style="cursor:pointer">
        <div class="blog-thumb" style="height:120px;font-size:2rem;background:linear-gradient(135deg,var(--surface-2),var(--surface-3))">${
          {Inicio:'🚀',WhatsApp:'💬',CRM:'📋',Automatización:'⚡',Facturación:'📄',IA:'🤖',Portal:'🏠',Configuración:'⚙️'}[c.tag]||'📚'
        }</div>
        <div class="blog-body">
          <div style="display:flex;gap:6px;margin-bottom:8px">
            <span class="blog-tag">${c.tag}</span>
            <span class="badge ${levelColor[c.level]}" style="font-size:.65rem">${c.level}</span>
          </div>
          <h3 style="font-size:.95rem;margin-bottom:8px">${c.title}</h3>
          <div class="blog-meta">${c.students.toLocaleString()} estudiantes · ⭐ ${c.rating} · ⏱ ${c.time}</div>
          <a href="/register" class="btn btn-ghost btn-sm" style="width:100%;justify-content:center;margin-top:12px">Ver curso</a>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>

<section class="section" style="background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border)">
  <div class="container">
    <div class="hero-grid">
      <div>
        <span class="section-label">¿Por qué Clientum Academia?</span>
        <h2>Aprendé sin perder el tiempo</h2>
        <p style="margin-top:16px;margin-bottom:24px">Cada curso está diseñado para que en menos de 2 horas ya puedas aplicarlo en tu negocio. Sin teoría innecesaria, con ejemplos reales de PyMEs argentinas.</p>
        ${['Cursos creados por el equipo de Clientum con casos reales','Acceso de por vida una vez activada tu cuenta','Videos cortos y concretos — sin relleno','Material descargable y checklists incluidos','Actualizaciones automáticas con cada nueva versión'].map(f=>`<div class="trust-item" style="margin-bottom:10px"><span class="check">✓</span>${f}</div>`).join('')}
      </div>
      <div class="card-grid" style="gap:16px">
        ${[
          {q:'"En un fin de semana aprendí a configurar el chatbot. Ahora agenda turnos solo. Los videos son claros y cortitos."',n:'Mónica S.',r:'Clínica Estética Lumière'},
          {q:'"El curso de facturación AFIP me ahorró horas de prueba y error. Seguí los pasos y funcionó a la primera."',n:'Rodrigo P.',r:'Distribuidora Patagónica'},
          {q:'"Le mandé el link de la academia a mis clientes y ya no me consultan lo básico. Se capacitan solos."',n:'Valeria G.',r:'Servicios Contables VG'},
        ].map(t=>`
        <div class="testimonial-card card-sm">
          <p class="testimonial-text" style="font-size:.875rem">${t.q}</p>
          <div class="testimonial-author">
            <div class="author-avatar" style="width:32px;height:32px;font-size:.8rem">${t.n[0]}</div>
            <div><div class="author-name" style="font-size:.85rem">${t.n}</div><div class="author-role">${t.r}</div></div>
          </div>
        </div>`).join('')}
      </div>
    </div>
  </div>
</section>

<div class="cta-section">
  <div class="container">
    <h2>La academia está incluida en tu plan</h2>
    <p>Con cualquier plan de Clientum accedés a todos los cursos sin costo adicional.</p>
    <div class="cta-actions"><a href="/register" class="btn btn-primary btn-lg">Empezar gratis →</a></div>
  </div>
</div>`;
}
