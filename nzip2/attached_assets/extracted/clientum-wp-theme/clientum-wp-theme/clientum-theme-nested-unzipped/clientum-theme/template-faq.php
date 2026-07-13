<?php
/*
 * Template Name: FAQ
 */
get_header(); ?>
<main class="site-main">

<div class="page-hero page-hero--simple">
  <div class="container text-center">
    <span class="hero-eyebrow">Ayuda</span>
    <h1>¿Cómo podemos ayudarte?</h1>
    <p>Las respuestas a lo que más nos preguntan antes de implementar Clientum.</p>
  </div>
</div>

<section class="section">
  <div class="container">
    <div style="display:grid;grid-template-columns:220px 1fr;gap:48px;align-items:start">

      <!-- Categories sidebar -->
      <div class="faq-nav">
        <ul>
          <?php
          $cats = ['Primeros pasos','WhatsApp','CRM','Facturación AFIP','Precios y pagos','Seguridad','Integraciones','Soporte'];
          foreach ($cats as $c) echo '<li><a href="#' . esc_attr(sanitize_title($c)) . '">' . esc_html($c) . '</a></li>';
          ?>
        </ul>
      </div>

      <!-- FAQ items -->
      <div>
        <?php
        $faq_sections = [
          'Primeros pasos' => [
            ['¿Necesito saber programar o tener equipo de IT?','No. Todo se configura desde el panel de administración sin ningún conocimiento técnico. En promedio, una PyME está operativa en menos de una semana. Nuestro equipo te acompaña en el proceso.'],
            ['¿Cuánto tiempo tarda la implementación?','El promedio es de 5 a 7 días hábiles. Incluimos onboarding personalizado, configuración del bot y capacitación del equipo en ese plazo.'],
            ['¿Puedo probar Clientum antes de pagar?','Sí. Tenés 14 días del plan Pro completo, gratis, sin tarjeta de crédito ni compromiso. Podés cancelar en cualquier momento.'],
          ],
          'WhatsApp' => [
            ['¿Funciona con mi número de WhatsApp actual?','Sí. Compatible con WhatsApp Business (escáner QR) y con la API oficial de Meta para empresas con mayor volumen de mensajes.'],
            ['¿El bot puede agendar turnos o citas?','Sí. Podés configurar un calendario de disponibilidad y el bot agenda citas automáticamente, con confirmación por WhatsApp.'],
            ['¿Qué pasa cuando el cliente quiere hablar con una persona?','El bot detecta cuando la consulta necesita atención humana y deriva la conversación a un asesor del CRM, notificándole en tiempo real.'],
          ],
          'CRM' => [
            ['¿Cuántos usuarios puedo tener?','Depende del plan: Starter (1 usuario), Pro (hasta 5 usuarios), Enterprise (ilimitado). Podés agregar usuarios adicionales en cualquier momento.'],
            ['¿Puedo importar mis contactos actuales?','Sí. Importamos desde Excel, CSV, Google Contacts o desde tu CRM anterior. El proceso es guiado y no perdés ningún dato.'],
          ],
          'Facturación AFIP' => [
            ['¿Cómo funciona la facturación AFIP?','Nos conectamos directamente con AFIP. Emitís facturas A, B y C con CAE desde el CRM sin salir del sistema, sin cargar datos dos veces.'],
            ['¿Es compatible con Monotributo?','Sí. Compatible con Monotributo y con Responsable Inscripto. Configuramos tu categoría y el sistema emite el comprobante correcto automáticamente.'],
          ],
          'Precios y pagos' => [
            ['¿Los precios incluyen IVA?','Sí, todos los precios publicados incluyen IVA.'],
            ['¿Cómo se puede pagar?','Por transferencia bancaria (CBU) o con MercadoPago (tarjetas y dinero en cuenta). Para planes Enterprise también aceptamos cheque.'],
            ['¿Hay descuento por pago anual?','Sí. Pagando el año completo por adelantado obtenés 2 meses gratis (equivalente a un 16% de descuento).'],
          ],
          'Seguridad' => [
            ['¿Dónde están alojados mis datos?','En servidores de AWS y Google Cloud con encriptación de extremo a extremo. Los datos se alojan en Argentina o en la región más cercana.'],
            ['¿Qué pasa si cancelo?','Podés exportar todos tus datos en cualquier momento (contactos, historial, facturas) en formato Excel o CSV. Nada queda retenido.'],
          ],
          'Integraciones' => [
            ['¿Integra con MercadoPago?','Sí. Podés enviar links de pago por WhatsApp y registrar los cobros automáticamente en el CRM.'],
            ['¿Tiene API?','Sí. El plan Enterprise incluye acceso completo a la API REST para integraciones con sistemas propios o terceros.'],
          ],
          'Soporte' => [
            ['¿Cómo es el soporte?','Soporte por email, WhatsApp y videollamada en todos los planes. Plan Pro incluye soporte prioritario con respuesta en menos de 4 horas hábiles.'],
            ['¿El soporte es en español?','Sí, 100%. Nuestro equipo es argentino y atiende en español de lunes a viernes de 9 a 18 hs.'],
          ],
        ];
        foreach ($faq_sections as $section => $faqs) {
          $id = sanitize_title($section);
          echo '<div id="' . esc_attr($id) . '" class="faq-section" style="margin-bottom:48px">
            <h3 style="margin-bottom:20px;padding-bottom:12px;border-bottom:2px solid var(--g200)">' . esc_html($section) . '</h3>
            <div class="faq-list">';
          foreach ($faqs as $faq) {
            echo '<div class="faq-item">
              <button class="faq-question">' . esc_html($faq[0]) . '<span class="faq-icon">+</span></button>
              <div class="faq-answer"><div class="faq-answer-inner">' . esc_html($faq[1]) . '</div></div>
            </div>';
          }
          echo '</div></div>';
        }
        ?>
      </div>

    </div>
  </div>
</section>

<section class="cta-section">
  <div class="container text-center">
    <h2>¿No encontraste tu respuesta?</h2>
    <p>Escribinos y te respondemos en menos de 24 horas hábiles.</p>
    <div class="hero-actions">
      <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="btn btn-green btn-lg">Contactarnos</a>
      <a href="<?php echo esc_url(clientum_whatsapp()); ?>" target="_blank" rel="noopener" class="btn btn-outline-white btn-lg">💬 WhatsApp</a>
    </div>
  </div>
</section>

</main>

<style>
.faq-nav { position: sticky; top: calc(var(--header-h) + 24px); }
.faq-nav ul { list-style: none; }
.faq-nav ul li a { display: block; padding: 8px 12px; border-radius: 6px; font-size: .9rem; color: var(--g500); transition: background .15s, color .15s; border-left: 2px solid transparent; }
.faq-nav ul li a:hover { background: var(--g100); color: var(--navy); border-left-color: var(--navy); }
@media(max-width:768px){ .faq-nav { display: none; } }
</style>

<?php get_footer(); ?>
