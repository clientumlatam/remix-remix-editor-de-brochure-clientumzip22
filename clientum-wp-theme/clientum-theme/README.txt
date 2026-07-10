== Clientum CRM Theme ==

Theme Name: Clientum CRM
Author: Clientum
Version: 1.0.0
License: GPLv2 or later
Requires at least: WordPress 6.0
Requires PHP: 8.0

== DESCRIPCIÓN ==

Tema WordPress oficial de Clientum — plataforma All-in-One de CRM, Chatbot WhatsApp,
E-Commerce, ERP y Business Intelligence para PyMEs argentinas.

Incluye el sitio público completo con:
• Hero section con formulario de contacto AJAX
• Servicios con Custom Post Type (CPT)
• Planes y precios
• Testimonios CPT
• Portafolio / Casos de éxito CPT
• Academia / Cursos CPT
• Blog
• FAQ acordeón
• Formulario de contacto AJAX
• Newsletter AJAX
• Botón flotante de WhatsApp
• Footer con 4 columnas + newsletter strip
• 100% responsive y mobile-first

== INSTALACIÓN ==

1. Subí la carpeta `clientum-theme` a /wp-content/themes/
2. En el panel de WordPress: Apariencia → Temas → Activar "Clientum CRM"
3. Andá a Apariencia → Clientum Setup → Instalar datos de ejemplo
4. Personalizá en Apariencia → Personalizar → Información de Contacto

== CONFIGURACIÓN ==

Apariencia → Personalizar → Información de Contacto:
• Teléfono
• Email
• Dirección
• Número de WhatsApp (solo números, ej: 5492984510883)
• Slogan principal del Hero
• Subtítulo del Hero

== CUSTOM POST TYPES ==

• clientum_service   → Servicios
• clientum_project   → Portafolio
• clientum_course    → Cursos (Academia)
• clientum_testimonial → Testimonios

== SHORTCODES ==

• [clientum_contact_form] — Formulario de contacto AJAX
• [clientum_services]     — Grid de servicios

== AJUSTE DE FORMULARIO DE CONTACTO ==

Los formularios envían emails al email del administrador de WordPress.
Para integrar con un CRM externo (Mailchimp, HubSpot, etc.),
editá la función `clientum_ajax_contact()` en functions.php.

== CHANGELOG ==

= 1.0.0 =
* Lanzamiento inicial del tema
