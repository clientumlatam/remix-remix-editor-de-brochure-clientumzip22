<?php
/**
 * Template Name: Inicio (Home)
 */
get_header(); ?>

<main class="site-main">

<!-- ─── HERO ──────────────────────────────────────────────────── -->
<section class="home-hero">
  <div class="container">
    <div class="home-hero-inner">
      <div class="home-hero-content">
        <span class="hero-eyebrow">IA para PyMEs argentinas</span>
        <h1 class="home-hero-title">Atención al cliente 24/7<br>sin contratar personal</h1>
        <p class="home-hero-desc">Chatbot WhatsApp + CRM inteligente + Facturación AFIP. Operativo en una semana, sin código, en pesos.</p>
        <div class="hero-actions">
          <a href="<?php echo esc_url(home_url('/register')); ?>" class="btn btn-primary btn-lg">Probar gratis 14 días</a>
          <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-outline-white btn-lg">Hablar con ventas</a>
        </div>
        <p class="hero-note">✓ Sin tarjeta de crédito &nbsp;·&nbsp; ✓ Sin contrato &nbsp;·&nbsp; ✓ Precios en pesos</p>
      </div>
      <div class="home-hero-visual">
        <div class="chat-demo">
          <div class="chat-demo-header">
            <span class="chat-demo-dot green"></span>
            <span class="chat-demo-title">Clientum · Bot activo</span>
          </div>
          <div class="chat-messages">
            <div class="chat-msg incoming"><div class="chat-bubble">Hola! ¿Tienen disponible el producto X?</div></div>
            <div class="chat-msg outgoing"><div class="chat-bubble navy">¡Hola! Sí, tenemos stock. El precio es $45.000. ¿Querés que te envíe una cotización?</div></div>
            <div class="chat-msg incoming"><div class="chat-bubble">Sí, perfecto!</div></div>
            <div class="chat-msg outgoing"><div class="chat-bubble navy">¡Listo! Ya registré tu consulta. Un asesor te contacta en breve. 🎉</div></div>
          </div>
          <div class="chat-demo-footer">Respondido automáticamente · 0 segundos</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ─── TRUST BAR ─────────────────────────────────────────────── -->
<div class="trust-bar">
  <div class="trust-bar-inner">
    <div class="trust-item"><span class="icon">✅</span> +1.750 PyMEs en Argentina</div>
    <div class="trust-item"><span class="icon">⏱️</span> Operativo en menos de 1 semana</div>
    <div class="trust-item"><span class="icon">🇦🇷</span> Precios en pesos argentinos</div>
    <div class="trust-item"><span class="icon">🤖</span> IA entrenada para el mercado local</div>
    <div class="trust-item"><span class="icon">📞</span> Soporte en español incluido</div>
  </div>
</div>

<!-- ─── STATS ─────────────────────────────────────────────────── -->
<section class="section section--sm" style="background:var(--g50)">
  <div class="container">
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-number">24/7</div><div class="stat-label">Atención automática sin pausas</div></div>
      <div class="stat-card"><div class="stat-number">1 sem.</div><div class="stat-label">Promedio hasta estar operativo</div></div>
      <div class="stat-card"><div class="stat-number">+60%</div><div class="stat-label">Más consultas resueltas por equipo</div></div>
      <div class="stat-card"><div class="stat-number">1.750+</div><div class="stat-label">PyMEs activas en todo el país</div></div>
    </div>
  </div>
</section>

<!-- ─── FUNCIONES ─────────────────────────────────────────────── -->
<section class="section" id="funciones">
  <div class="container">
    <div class="section-header centered">
      <span class="section-label">Funciones principales</span>
      <h2 class="section-title">Todo lo que tu PyME necesita, en un solo lugar</h2>
      <p class="section-subtitle">Sin herramientas dispersas. Sin integraciones complicadas. Sin costos en dólares.</p>
    </div>
    <div class="grid-3">
      <?php
      $features = [
        ['💬','#dcfce7','Chatbot WhatsApp 24/7','Atiende, cotiza y agenda automáticamente. Califica leads y los deriva al CRM sin intervención humana.','/whatsapp'],
        ['📊','#dbeafe','CRM Inteligente','Pipeline visual de ventas, seguimiento de clientes y gestión de oportunidades desde un solo panel.','/crm-inteligente'],
        ['🤖','#ede9fe','Asistente IA','Preguntale en castellano: "¿Cuáles son mis mejores clientes este mes?" y obtenés la respuesta al instante.','/asistente-ia'],
        ['📈','#fff7ed','Reportes Automáticos','KPIs de ventas, conversión y actividad enviados automáticamente a tu email cuando los necesitás.','/reportes'],
        ['⚡','#fef9c3','Automatización','Seguimientos post-venta, recordatorios de pago y asignación de leads sin tocar un botón.','/automatizacion'],
        ['🌐','#cffafe','Portal del Cliente','Tus clientes ven sus facturas, pedidos y documentos sin llamarte. Con tu marca y dominio.','/portal-cliente'],
      ];
      foreach ($features as $f) {
        echo '<a href="' . esc_url(home_url($f[4])) . '" class="feature-card" style="text-decoration:none">
          <div class="card-icon" style="background:' . esc_attr($f[1]) . '">' . $f[0] . '</div>
          <h3>' . esc_html($f[2]) . '</h3>
          <p>' . esc_html($f[3]) . '</p>
        </a>';
      }
      ?>
    </div>
    <div class="text-center mt-8">
      <a href="<?php echo esc_url(home_url('/whatsapp')); ?>" class="btn btn-outline">Ver todas las funciones</a>
    </div>
  </div>
</section>

<!-- ─── SERVICIOS ─────────────────────────────────────────────── -->
<section class="section" style="background:var(--g50)" id="servicios">
  <div class="container">
    <div class="section-header centered">
      <span class="section-label">Servicios profesionales</span>
      <h2>Más allá de la plataforma</h2>
      <p class="section-subtitle">Acompañamiento real para que tu empresa crezca y se digitalice sin fricciones.</p>
    </div>
    <div class="grid-3">
      <?php
      $services = [
        ['💼','Consultoría Empresarial','Diagnóstico de procesos y plan de acción con KPIs medibles.'],
        ['⚙️','ERP Personalizado','Gestión a medida de tu industria, integrado con el CRM.'],
        ['🚀','Implementación y Soporte','Onboarding personalizado y soporte continuo en español.'],
        ['📣','Marketing Digital','Campañas de Meta y Google Ads con leads directo al CRM.'],
        ['🔗','Integración de Tecnología','Conectamos tus sistemas existentes sin pérdida de datos.'],
        ['🌐','Desarrollo Web','Sitios, landing pages y e-commerce con MercadoPago incluido.'],
      ];
      foreach ($services as $s) {
        echo '<div class="card card--white">
          <div style="font-size:2rem;margin-bottom:14px">' . $s[0] . '</div>
          <h3>' . esc_html($s[1]) . '</h3>
          <p>' . esc_html($s[2]) . '</p>
        </div>';
      }
      ?>
    </div>
    <div class="text-center mt-8">
      <a href="<?php echo esc_url(home_url('/servicios')); ?>" class="btn btn-outline">Ver todos los servicios</a>
    </div>
  </div>
</section>

<!-- ─── CÓMO FUNCIONA ─────────────────────────────────────────── -->
<section class="section" id="como-funciona">
  <div class="container">
    <div class="section-header">
      <span class="section-label">Cómo funciona</span>
      <h2>De cero a automatizado en menos de una semana</h2>
      <p class="section-subtitle">Sin código, sin equipo de IT, sin complicaciones.</p>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center">
      <div class="steps">
        <div class="step">
          <div class="step-num">1</div>
          <div class="step-content">
            <h3>Conectás tu WhatsApp</h3>
            <p>Escaneás un QR desde el panel y tu número queda activo en minutos. Compatible con WhatsApp Business y la API oficial de Meta.</p>
          </div>
        </div>
        <div class="step">
          <div class="step-num">2</div>
          <div class="step-content">
            <h3>Configuramos tu IA</h3>
            <p>Cargás tus preguntas frecuentes y el perfil de tu negocio. La IA aprende y empieza a responder por vos desde el primer día.</p>
          </div>
        </div>
        <div class="step">
          <div class="step-num">3</div>
          <div class="step-content">
            <h3>Tu PyME opera sola</h3>
            <p>El bot atiende, el CRM registra y los reportes se generan automáticamente. Tu equipo solo interviene cuando realmente hace falta.</p>
          </div>
        </div>
      </div>
      <div style="background:linear-gradient(135deg,var(--navy-dark),var(--navy));border-radius:16px;padding:40px;color:white">
        <span class="afip-badge" style="background:rgba(37,211,102,.15);color:#4ade80;border-color:rgba(37,211,102,.3)">✓ Exclusivo para Argentina</span>
        <h3 style="color:white;margin-bottom:12px">Facturación AFIP integrada</h3>
        <p style="color:rgba(255,255,255,.7);margin-bottom:24px">Emitís facturas A, B y C con CAE directo desde Clientum. Sin salir del sistema, sin cargar datos dos veces.</p>
        <ul style="list-style:none">
          <?php foreach(['Facturas A, B y C con CAE automático','Sin doble carga de datos','Historial de facturas por cliente','Compatible con MercadoPago'] as $b): ?>
          <li style="display:flex;gap:10px;align-items:center;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.08);color:rgba(255,255,255,.8);font-size:.9rem">
            <span style="width:18px;height:18px;border-radius:50%;background:var(--green);display:flex;align-items:center;justify-content:center;font-size:.6rem;font-weight:800;flex-shrink:0">✓</span>
            <?php echo esc_html($b); ?>
          </li>
          <?php endforeach; ?>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- ─── TESTIMONIALS ──────────────────────────────────────────── -->
<section class="section" style="background:var(--g50)">
  <div class="container">
    <div class="section-header centered">
      <span class="section-label">Testimonios</span>
      <h2>Lo que dicen nuestros clientes</h2>
    </div>
    <div class="testimonial-grid">
      <?php
      $testimonials = [
        ['"El bot de WhatsApp nos generó un 40% más de consultas en el primer mes. No podíamos creer los resultados."','Martín R.','Distribuidora del Sur'],
        ['"Implementamos en 5 días. El equipo de Clientum estuvo presente en todo momento. Excelente soporte."','Carolina S.','Agro San Luis'],
        ['"Por fin un CRM en pesos que entiende cómo trabaja una PyME argentina. Sin tecnicismos, sin dolores de cabeza."','Daniel M.','Tech Retail BA'],
      ];
      foreach ($testimonials as $t) {
        $initial = mb_substr(trim($t[1]), 0, 1);
        echo '<div class="testimonial-card">
          <div class="stars">★★★★★</div>
          <blockquote>' . esc_html($t[0]) . '</blockquote>
          <div class="testimonial-author">
            <div class="testimonial-avatar">' . esc_html($initial) . '</div>
            <div class="testimonial-info">
              <strong>' . esc_html($t[1]) . '</strong>
              <span>' . esc_html($t[2]) . '</span>
            </div>
          </div>
        </div>';
      }
      ?>
    </div>
  </div>
</section>

<!-- ─── FAQ HOME ──────────────────────────────────────────────── -->
<section class="section">
  <div class="container" style="max-width:800px">
    <div class="section-header centered">
      <span class="section-label">Preguntas frecuentes</span>
      <h2>Preguntas que nos hacen seguido</h2>
    </div>
    <div class="faq-list">
      <?php
      $faqs = [
        ['¿Necesito saber programar?','No. Todo se configura desde el panel sin ningún conocimiento técnico. En promedio, una PyME está operativa en menos de una semana.'],
        ['¿Funciona con cualquier número de WhatsApp?','Sí. Compatible con WhatsApp Business normal y también con la API oficial de Meta para mayor volumen de mensajes.'],
        ['¿Puedo probar antes de pagar?','Sí. 14 días gratis sin tarjeta de crédito ni compromiso. Podés cancelar en cualquier momento.'],
        ['¿Cómo funciona la facturación AFIP?','Nos conectamos directamente con AFIP. Emitís facturas A, B y C con CAE desde el CRM sin salir del sistema.'],
        ['¿Integra con MercadoPago?','Sí. Podés enviar links de pago por WhatsApp y registrar cobros automáticamente en el CRM.'],
      ];
      foreach ($faqs as $f) {
        echo '<div class="faq-item">
          <button class="faq-question">' . esc_html($f[0]) . '<span class="faq-icon">+</span></button>
          <div class="faq-answer"><div class="faq-answer-inner">' . esc_html($f[1]) . '</div></div>
        </div>';
      }
      ?>
    </div>
    <div class="text-center mt-8">
      <a href="<?php echo esc_url(home_url('/faq')); ?>" class="btn btn-outline">Ver todas las preguntas →</a>
    </div>
  </div>
</section>

<!-- ─── NEWSLETTER ────────────────────────────────────────────── -->
<section class="section section--sm" style="background:var(--navy)">
  <div class="container" style="max-width:680px;text-align:center">
    <span class="section-label" style="color:rgba(255,255,255,.6)">Newsletter</span>
    <h2 style="color:#fff;margin-bottom:8px">Consejos de IA para PyMEs, cada semana</h2>
    <p style="color:rgba(255,255,255,.7);margin-bottom:28px">Novedades, casos de éxito y recursos exclusivos. Sin spam.</p>
    <?php echo do_shortcode('[aime_subscribe title="" description="" button_text="Suscribirme gratis" show_name="0"]'); ?>
    <p style="font-size:.75rem;color:rgba(255,255,255,.4);margin-top:4px">Cancelás cuando quieras. Precios en pesos.</p>
  </div>
</section>

<!-- ─── CTA ───────────────────────────────────────────────────── -->
<section class="cta-section">
  <div class="container">
    <h2>¿Listo para automatizar tu PyME?</h2>
    <p>14 días gratis. Sin tarjeta de crédito. Sin código. Sin IT.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/register')); ?>" class="btn btn-green btn-lg">Probar gratis 14 días</a>
      <a href="<?php echo esc_url(clientum_whatsapp()); ?>" target="_blank" rel="noopener" class="btn btn-outline-white btn-lg">💬 Hablar por WhatsApp</a>
    </div>
  </div>
</section>

</main>

<?php get_footer(); ?>
