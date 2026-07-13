export function layout(content: string, title = 'Clientum CRM'): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="/style.css"/>
</head>
<body>
  <nav class="navbar">
    <div class="nav-inner">
      <a href="/" class="nav-logo">
        <div class="logo-mark">C</div>
        <span>Clientum</span>
      </a>
      <button class="nav-toggle" id="navToggle" aria-label="Menú">
        <span></span><span></span><span></span>
      </button>
      <div class="nav-links" id="navLinks">
        <a href="/" class="nav-link">Inicio</a>
        <div class="nav-dropdown">
          <button class="nav-link dropdown-trigger">Funciones <svg width="10" height="6" viewBox="0 0 10 6"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg></button>
          <div class="dropdown-menu">
            <a href="/chatbot" class="dropdown-item">💬 Chatbot WhatsApp</a>
            <a href="/crm" class="dropdown-item">📋 CRM Inteligente</a>
            <a href="/asistente-ia" class="dropdown-item">🤖 Asistente IA</a>
            <a href="/reportes" class="dropdown-item">📊 Reportes Automáticos</a>
            <a href="/automatizacion" class="dropdown-item">⚡ Automatización</a>
            <a href="/portal" class="dropdown-item">🏠 Portal del Cliente</a>
          </div>
        </div>
        <div class="nav-dropdown">
          <button class="nav-link dropdown-trigger">Servicios <svg width="10" height="6" viewBox="0 0 10 6"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg></button>
          <div class="dropdown-menu">
            <a href="/consultoria" class="dropdown-item">🎯 Consultoría Empresarial</a>
            <a href="/erp" class="dropdown-item">🏭 ERP Personalizado</a>
            <a href="/implementacion" class="dropdown-item">🔧 Implementación y Soporte</a>
            <a href="/marketing" class="dropdown-item">📣 Marketing Digital</a>
            <a href="/integracion" class="dropdown-item">🔗 Integración de Tecnología</a>
            <a href="/desarrollo-web" class="dropdown-item">🌐 Desarrollo Web</a>
          </div>
        </div>
        <div class="nav-dropdown">
          <button class="nav-link dropdown-trigger">Empresa <svg width="10" height="6" viewBox="0 0 10 6"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg></button>
          <div class="dropdown-menu">
            <a href="/nosotros" class="dropdown-item">👥 Sobre Nosotros</a>
            <a href="/casos" class="dropdown-item">⭐ Casos de Éxito</a>
            <a href="/blog" class="dropdown-item">📝 Blog</a>
            <a href="/comparativa" class="dropdown-item">📈 Comparativa</a>
            <a href="/socios" class="dropdown-item">🤝 Programa de Socios</a>
          </div>
        </div>
        <div class="nav-dropdown">
          <button class="nav-link dropdown-trigger">Recursos <svg width="10" height="6" viewBox="0 0 10 6"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg></button>
          <div class="dropdown-menu">
            <a href="/academia" class="dropdown-item">🎓 Academia</a>
            <a href="/recursos" class="dropdown-item">📚 Recursos</a>
            <a href="/faq" class="dropdown-item">❓ FAQ</a>
            <a href="/precios" class="dropdown-item">💰 Precios</a>
            <a href="/contacto" class="dropdown-item">📞 Contacto</a>
          </div>
        </div>
        <div class="nav-actions">
          <a href="/login" class="nav-link">Iniciar sesión</a>
          <a href="/register" class="btn btn-primary btn-sm">Probar gratis</a>
        </div>
      </div>
    </div>
  </nav>

  <main>${content}</main>

  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="/" class="nav-logo">
            <div class="logo-mark">C</div>
            <span>Clientum</span>
          </a>
          <p class="footer-desc">IA para PyMEs argentinas. Chatbot WhatsApp 24/7, CRM inteligente y automatización. Sin código, sin IT.</p>
          <a href="mailto:hola@clientum.com.ar" class="footer-email">hola@clientum.com.ar</a>
        </div>
        <div class="footer-col">
          <h4>Funciones</h4>
          <a href="/chatbot">Chatbot WhatsApp</a>
          <a href="/crm">CRM Inteligente</a>
          <a href="/asistente-ia">Asistente IA</a>
          <a href="/reportes">Reportes Automáticos</a>
          <a href="/automatizacion">Automatización</a>
          <a href="/portal">Portal del Cliente</a>
        </div>
        <div class="footer-col">
          <h4>Servicios</h4>
          <a href="/consultoria">Consultoría Empresarial</a>
          <a href="/erp">ERP Personalizado</a>
          <a href="/implementacion">Implementación y Soporte</a>
          <a href="/marketing">Marketing Digital</a>
          <a href="/integracion">Integración de Tecnología</a>
          <a href="/desarrollo-web">Desarrollo Web</a>
        </div>
        <div class="footer-col">
          <h4>Empresa</h4>
          <a href="/nosotros">Sobre Nosotros</a>
          <a href="/casos">Casos de Éxito</a>
          <a href="/blog">Blog</a>
          <a href="/comparativa">Comparativa</a>
          <a href="/socios">Programa de Socios</a>
          <h4 style="margin-top:1.5rem">Recursos</h4>
          <a href="/academia">Academia</a>
          <a href="/recursos">Recursos</a>
          <a href="/faq">FAQ</a>
          <a href="/precios">Precios</a>
          <a href="/contacto">Contacto</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2026 Clientum. Todos los derechos reservados.</p>
        <div class="footer-links">
          <a href="#">Privacidad</a>
          <a href="#">Términos</a>
          <a href="/nosotros">Sobre Nosotros</a>
          <a href="/register" class="btn btn-primary btn-sm">Probar gratis</a>
        </div>
      </div>
    </div>
  </footer>
  <script src="/app.js"></script>
</body>
</html>`;
}
