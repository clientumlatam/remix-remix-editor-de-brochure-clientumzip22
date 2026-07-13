export function contactoPage(): string {
  return `
<section class="section" style="padding-top:120px">
  <div class="container">
    <div class="section-header">
      <span class="section-label">Contacto</span>
      <h1>Hablemos</h1>
      <p>Contamos con un equipo listo para ayudarte a automatizar tu PyME. Sin vueltas.</p>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1.5fr;gap:64px;align-items:start" class="hero-grid">
      <div>
        <div class="card mb-3">
          <h4>🏢 Casa Central</h4>
          <p style="margin-top:8px;font-size:.9rem">Av. Julio A. Roca 1250<br>General Roca, Río Negro<br>Argentina</p>
        </div>
        <div class="card mb-3">
          <h4>🏢 Oficina Buenos Aires</h4>
          <p style="margin-top:8px;font-size:.9rem">Av. Corrientes 1234, piso 8<br>Ciudad Autónoma de Buenos Aires<br>Argentina</p>
        </div>
        <div class="card mb-3">
          <h4>📞 Contacto directo</h4>
          <p style="margin-top:8px;font-size:.9rem">
            <a href="mailto:hola@clientum.com.ar" style="color:var(--blue-light)">hola@clientum.com.ar</a><br>
            <a href="tel:+5402984000000" style="color:var(--blue-light);margin-top:4px;display:block">+54 (0298) 400-0000</a>
          </p>
        </div>
        <div class="card">
          <h4>🧾 Datos fiscales</h4>
          <p style="margin-top:8px;font-size:.9rem;line-height:1.8">
            Clientum S.R.L.<br>
            CUIT: 30-71234567-8<br>
            IVA Responsable Inscripto<br>
            General Roca, Río Negro (8332)
          </p>
        </div>
      </div>
      <div>
        <div class="card">
          <h3 style="margin-bottom:4px">Envianos un mensaje</h3>
          <p style="font-size:.875rem;margin-bottom:28px">Respondemos en menos de 24 horas hábiles.</p>
          <form>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
              <div class="form-group">
                <label class="form-label">Nombre *</label>
                <input type="text" class="form-input" placeholder="Tu nombre" required/>
              </div>
              <div class="form-group">
                <label class="form-label">Email *</label>
                <input type="email" class="form-input" placeholder="vos@empresa.com" required/>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
              <div class="form-group">
                <label class="form-label">Empresa</label>
                <input type="text" class="form-input" placeholder="Mi Empresa S.A."/>
              </div>
              <div class="form-group">
                <label class="form-label">Rubro</label>
                <select class="form-select form-input">
                  <option value="">Seleccioná tu rubro</option>
                  <option>Comercio / Retail</option>
                  <option>Servicios profesionales</option>
                  <option>Gastronomía / Hotelería</option>
                  <option>Salud / Estética</option>
                  <option>Distribución / Logística</option>
                  <option>Manufactura / Industria</option>
                  <option>Agroindustria</option>
                  <option>Otro</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">¿En qué podemos ayudarte? *</label>
              <textarea class="form-textarea" placeholder="Contanos sobre tu negocio y qué necesitás..." required></textarea>
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center">Enviar mensaje</button>
          </form>
        </div>
        <div class="card mt-3" style="margin-top:16px;display:flex;gap:16px;align-items:center">
          <span style="font-size:2rem">📅</span>
          <div>
            <h4>¿Querés una demo rápida?</h4>
            <p style="font-size:.875rem">Agendamos una videollamada de 30 minutos y te mostramos Clientum en acción con tu caso de uso.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`;
}
