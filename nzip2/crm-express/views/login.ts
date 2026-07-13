export function loginPage(): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Iniciar sesión — Clientum CRM</title>
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
    <h2 style="margin-top:48px;position:relative">Tu PyME, organizada y automatizada.</h2>
    <p style="color:var(--text-muted);margin-top:12px;position:relative">CRM, facturación electrónica y atención al cliente por WhatsApp — todo en una sola plataforma.</p>
    <div class="auth-features" style="position:relative">
      <div class="auth-feature"><span class="auth-feature-icon">💬</span>Chatbot WhatsApp 24/7</div>
      <div class="auth-feature"><span class="auth-feature-icon">📄</span>Facturación electrónica AFIP</div>
      <div class="auth-feature"><span class="auth-feature-icon">📊</span>Pipeline de ventas y CRM</div>
    </div>
    <div style="margin-top:48px;display:flex;gap:8px;align-items:center;position:relative">
      ${['M','S','A','R'].map(l=>`<div style="width:32px;height:32px;border-radius:50%;background:var(--gradient);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.8rem;color:#fff;border:2px solid var(--bg)">${l}</div>`).join('')}
      <span style="font-size:.875rem;color:var(--text-muted);margin-left:8px">+500 PyMEs confían en Clientum</span>
    </div>
  </div>
  <div class="auth-right">
    <h2>Bienvenido de vuelta</h2>
    <p class="lead">Ingresá con tu cuenta de Clientum</p>
    <form action="/login" method="post">
      <div class="form-group">
        <label class="form-label">Email</label>
        <input type="email" name="email" class="form-input" placeholder="vos@empresa.com.ar" required/>
      </div>
      <div class="form-group">
        <label class="form-label" style="display:flex;justify-content:space-between">
          Contraseña
          <a href="/forgot-password" style="font-weight:400;color:var(--blue-light);font-size:.8rem">¿Olvidaste tu contraseña?</a>
        </label>
        <input type="password" name="password" class="form-input" placeholder="••••••••" required/>
      </div>
      <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;margin-top:8px">Ingresar</button>
    </form>
    <p class="auth-footer">¿Nuevo en Clientum? <a href="/register">Crear cuenta gratis</a></p>
    <p style="text-align:center;font-size:.8rem;color:var(--text-faint);margin-top:12px">Sin tarjeta de crédito · Operativo en una semana</p>
  </div>
</div>
</body>
</html>`;
}
