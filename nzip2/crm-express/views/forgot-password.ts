export function forgotPage(): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Recuperar contraseña — Clientum</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="/style.css"/>
</head>
<body>
<div class="auth-page">
  <div class="auth-left">
    <a href="/" class="nav-logo" style="position:relative"><div class="logo-mark">C</div><span>Clientum</span></a>
    <h2 style="margin-top:48px;position:relative">Recuperá el acceso a tu cuenta.</h2>
    <p style="color:var(--text-muted);margin-top:12px;position:relative">Te enviamos un enlace para restablecer tu contraseña. El proceso toma menos de 2 minutos.</p>
    <div style="margin-top:32px;position:relative"><a href="/login" style="color:var(--blue-light);font-size:.9rem">← Volver al login</a></div>
  </div>
  <div class="auth-right" style="justify-content:center">
    <div style="max-width:360px;width:100%">
      <div style="width:56px;height:56px;border-radius:16px;background:var(--gradient);display:flex;align-items:center;justify-content:center;font-size:1.5rem;margin-bottom:24px">🔑</div>
      <h2>¿Olvidaste tu contraseña?</h2>
      <p class="lead" style="margin-top:8px;margin-bottom:32px">Ingresá tu email y te enviamos un enlace para crear una nueva contraseña.</p>
      <form>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input type="email" class="form-input" placeholder="vos@empresa.com.ar" required/>
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center">Enviar enlace de recuperación</button>
      </form>
      <p class="auth-footer"><a href="/login">← Volver al login</a></p>
    </div>
  </div>
</div>
</body>
</html>`;
}
