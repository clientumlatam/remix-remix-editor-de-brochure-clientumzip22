<?php
/**
 * Template Name: Política de Privacidad
 */
get_header(); ?>

<main class="site-main">

<section class="page-hero page-hero--simple">
  <div class="container">
    <h1>Política de Privacidad</h1>
    <p>Última actualización: <?php echo date('d/m/Y'); ?></p>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="prose" style="max-width:760px;margin:0 auto">

      <h2>1. Información que recopilamos</h2>
      <p>Clientum recopila información que usted nos proporciona directamente al registrarse, usar nuestros servicios o comunicarse con nosotros. Esta información puede incluir nombre completo, nombre de la empresa, dirección de email, número de teléfono y datos de facturación.</p>
      <p>También recopilamos automáticamente cierta información sobre su dispositivo y uso del servicio, incluyendo dirección IP, tipo de navegador, páginas visitadas y acciones realizadas dentro de la plataforma.</p>

      <h2>2. Cómo usamos su información</h2>
      <p>Utilizamos la información recopilada para:</p>
      <ul>
        <li>Proveer, operar y mejorar nuestros servicios</li>
        <li>Procesar transacciones y enviar avisos relacionados</li>
        <li>Enviar comunicaciones técnicas, actualizaciones y soporte</li>
        <li>Responder a consultas y solicitudes de soporte</li>
        <li>Cumplir con obligaciones legales</li>
        <li>Detectar y prevenir actividades fraudulentas</li>
      </ul>

      <h2>3. Compartir información</h2>
      <p>No vendemos, alquilamos ni compartimos su información personal con terceros con fines comerciales. Podemos compartir información con proveedores de servicios que nos asisten en la operación de la plataforma (hosting, procesamiento de pagos, envío de emails), siempre bajo estrictos acuerdos de confidencialidad.</p>

      <h2>4. Seguridad de los datos</h2>
      <p>Implementamos medidas técnicas y organizativas para proteger su información contra acceso no autorizado, alteración, divulgación o destrucción. Los datos se almacenan en servidores seguros con cifrado SSL/TLS. Sin embargo, ningún método de transmisión por internet es 100% seguro.</p>

      <h2>5. Sus derechos</h2>
      <p>Usted tiene derecho a:</p>
      <ul>
        <li>Acceder a sus datos personales almacenados</li>
        <li>Corregir información inexacta</li>
        <li>Solicitar la eliminación de sus datos</li>
        <li>Oponerse al procesamiento de sus datos</li>
        <li>Portabilidad de datos</li>
      </ul>
      <p>Para ejercer estos derechos, contáctenos en <a href="mailto:<?php echo esc_attr(clientum_email()); ?>"><?php echo esc_html(clientum_email()); ?></a>.</p>

      <h2>6. Cookies</h2>
      <p>Utilizamos cookies propias y de terceros para mejorar la experiencia de uso, analizar el tráfico y personalizar contenido. Puede configurar su navegador para rechazar cookies, aunque esto puede afectar la funcionalidad del sitio.</p>

      <h2>7. Retención de datos</h2>
      <p>Conservamos su información durante el tiempo que su cuenta esté activa o sea necesario para proveer los servicios. Al dar de baja su cuenta, eliminamos sus datos dentro de los 30 días hábiles siguientes, salvo que la legislación aplicable requiera conservarlos por más tiempo.</p>

      <h2>8. Menores de edad</h2>
      <p>Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos conscientemente información personal de menores. Si detectamos que hemos recibido datos de un menor, los eliminaremos de inmediato.</p>

      <h2>9. Cambios en esta política</h2>
      <p>Podemos actualizar esta política periódicamente. Le notificaremos sobre cambios significativos por email o mediante un aviso destacado en la plataforma. El uso continuado del servicio tras la notificación implica la aceptación de los cambios.</p>

      <h2>10. Contacto</h2>
      <p>Para consultas sobre esta política o el tratamiento de sus datos personales, contáctenos:</p>
      <ul>
        <li>Email: <a href="mailto:<?php echo esc_attr(clientum_email()); ?>"><?php echo esc_html(clientum_email()); ?></a></li>
        <li>Teléfono: <?php echo esc_html(clientum_phone()); ?></li>
        <li>WhatsApp: <a href="<?php echo esc_url(clientum_whatsapp()); ?>" target="_blank" rel="noopener">Escribinos</a></li>
      </ul>

    </div>
  </div>
</section>

</main>

<?php get_footer(); ?>
