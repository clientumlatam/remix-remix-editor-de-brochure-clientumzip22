export function registerPage(): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Crear cuenta — Clientum CRM</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="/style.css"/>
</head>
<body>
<div class="auth-page">
  <div class="auth-left">
    <a href="/" class="nav-logo" style="position:relative">
      <div class="logo-mark">C</div><span>Clientum</span>
    </a>
    <h2 style="margin-top:48px;position:relative">Comenzá gratis. Resultados en una semana.</h2>
    <p style="color:var(--text-muted);margin-top:12px;position:relative">14 días de prueba completa — sin tarjeta de crédito. Configuramos todo con vos.</p>
    <div class="auth-features" style="position:relative">
      <div class="auth-feature"><span class="auth-feature-icon">✅</span>14 días de prueba gratis, sin compromisos</div>
      <div class="auth-feature"><span class="auth-feature-icon">🎓</span>Onboarding guiado en español</div>
      <div class="auth-feature"><span class="auth-feature-icon">💬</span>Soporte por WhatsApp incluido</div>
      <div class="auth-feature"><span class="auth-feature-icon">❌</span>Cancelá cuando quieras</div>
    </div>
    <div style="margin-top:48px;display:flex;gap:8px;align-items:center;position:relative">
      ${['M','S','A','R'].map(l=>`<div style="width:32px;height:32px;border-radius:50%;background:var(--gradient);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.8rem;color:#fff;border:2px solid var(--bg)">${l}</div>`).join('')}
      <span style="font-size:.875rem;color:var(--text-muted);margin-left:8px">+500 PyMEs ya automatizadas</span>
    </div>
  </div>
  <div class="auth-right">
    <h2>Crear cuenta</h2>
    <p class="lead">Registrá tu empresa en Clientum</p>
    <form action="/register" method="post">
      <div class="form-group">
        <label class="form-label">Nombre de la empresa</label>
        <input type="text" name="company" class="form-input" placeholder="Mi Empresa S.R.L." required/>
      </div>
      <div class="form-group">
        <label class="form-label">Tu nombre</label>
        <input type="text" name="name" class="form-input" placeholder="Juan García" required/>
      </div>
      <div class="form-group">
        <label class="form-label">Email</label>
        <input type="email" name="email" class="form-input" placeholder="vos@empresa.com.ar" required/>
      </div>
      <div class="form-group">
        <label class="form-label">Contraseña</label>
        <input type="password" name="password" class="form-input" placeholder="Mínimo 8 caracteres" required/>
      </div>
      <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;margin-top:8px">Crear cuenta gratis</button>
    </form>
    <p class="auth-footer">¿Ya tenés cuenta? <a href="/login">Iniciá sesión</a></p>
    <p style="text-align:center;font-size:.8rem;color:var(--text-faint);margin-top:12px">Sin tarjeta de crédito · 14 días gratis</p>
  </div>
</div>
</body>
</html>`;
}
