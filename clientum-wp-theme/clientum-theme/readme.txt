Clientum — Tema WordPress
=========================
Versión: 1.0.0
Requiere WordPress: 6.0+
PHP: 8.0+

INSTALACIÓN
───────────
1. Ir a WordPress Admin → Apariencia → Temas → Agregar nuevo → Subir tema
2. Subir el archivo clientum-theme.zip
3. Activar el tema

CONFIGURACIÓN DE PÁGINAS
────────────────────────
Crear las siguientes páginas en WordPress y asignarles el template correspondiente:

| Slug de la página      | Template a asignar          |
|------------------------|-----------------------------|
| (página de inicio)     | Inicio (Home) — configurar como "Portada estática" |
| contacto               | Contacto                    |
| precios                | Precios                     |
| sobre-nosotros         | Sobre Nosotros              |
| faq                    | FAQ                         |
| recursos               | Recursos                    |
| whatsapp               | Chatbot WhatsApp            |
| crm-inteligente        | CRM Inteligente             |
| asistente-ia           | Asistente IA                |
| reportes               | Reportes Automáticos        |
| automatizacion         | Automatización              |
| portal-cliente         | Portal del Cliente          |
| servicios              | Servicios                   |
| academia               | Academia                    |
| comparativa            | Comparativa                 |
| casos-de-exito         | Casos de Éxito              |
| programa-de-socios     | Programa de Socios          |
| blog                   | Blog                        |

CONFIGURAR PORTADA
──────────────────
1. Crear una página con el slug que prefieras (ej: "Inicio")
2. Asignarle el template "Inicio (Home)"
3. Ir a Ajustes → Lectura → Portada → Seleccionar "Una página estática" y elegir esa página

FORMULARIO DE CONTACTO
──────────────────────
El formulario envía por email al admin del sitio (Ajustes → General → Email).
Los emails se envían con wp_mail(). Para producción se recomienda instalar 
el plugin WP Mail SMTP con Resend o SendGrid.

MENÚ
────
Ir a Apariencia → Menús y asignar el menú al área "Menú principal".
Los menús del header se generan automáticamente con las URLs configuradas.

LOGO PERSONALIZADO
──────────────────
Ir a Apariencia → Personalizar → Identidad del sitio → Logo.
Recomendado: imagen cuadrada 200x200px PNG con fondo transparente.

SOPORTE
───────
info@clientum.com.ar
+54 298 451-0883
clientum.com.ar


AUTH PAGES
──────────
Crear las siguientes páginas para login, registro y recuperación de contraseña:

| Slug          | Template a asignar         |
|---------------|---------------------------|
| login         | Login                     |
| registro      | Registro                  |
| recuperar-contrasena | Recuperar contraseña |

Nota: estas páginas no usan el header/footer del sitio —
tienen su propio layout split-panel (panel oscuro + formulario blanco).


PÁGINAS NUEVAS DEL ZIP web_1783091221883.zip
────────────────────────────────────────────
Crear las siguientes páginas en WordPress Admin → Páginas → Añadir nueva:

| Título                          | Slug sugerido              | Template a asignar               |
|---------------------------------|---------------------------|----------------------------------|
| Consultoría Empresarial         | consultoria-empresarial   | Consultoría Empresarial          |
| Desarrollo Web y E-Commerce     | desarrollo-web            | Desarrollo Web                   |
| ERP Personalizado               | erp-personalizado         | ERP Personalizado                |
| Implementación y Soporte        | implementacion-soporte    | Implementación y Soporte         |
| Implementación y Soporte Alt.   | implementacion-soporte-2  | Implementación y Soporte (Alternativa) |
| Integración de Tecnología       | integracion-tecnologia    | Integración de Tecnología        |
| Marketing Digital               | marketing-digital         | Marketing Digital                |
| Política de Privacidad          | politica-privacidad       | Política de Privacidad           |
| Servicios Generales             | servicios-generales       | Servicios Generales              |
| Comparativa ERP                 | comparativa-erp           | Comparativa ERP                  |
| Comparativa de Servicios        | comparativa-servicios     | Comparativa de Servicios         |
| Comparativa de Servicios Alt.   | comparativa-servicios-2   | Comparativa de Servicios (Alternativa) |
| Programa de Socios (Alt.)       | programa-socios-2         | Programa de Socios (Alternativa) |


INTEGRACIÓN CON AI MARKETING EXPERT
─────────────────────────────────────
El tema está integrado con el plugin "AI Marketing Expert" (incluido en este paquete).
El plugin debe estar instalado y activado para que funcionen:

- Formulario de suscripción al newsletter (shortcode [aime_subscribe]) — aparece en:
    · Página de inicio (sección Newsletter)
    · Página de contacto (debajo del formulario)
    · Página de recursos (reemplaza el form estático)
    · Footer de todas las páginas (columna Newsletter)
- Chatbot IA flotante — se inyecta automáticamente en TODAS las páginas via wp_footer
    · Configurarlo en: WordPress Admin → AI Marketing Expert → Chatbot
- Página de discusiones públicas (shortcode [aime_discussions]):
    · Crear página con slug "discusiones" y asignarle el template "Discusiones"

Para activar el plugin:
1. Ir a WordPress Admin → Plugins → Añadir nuevo → Subir plugin
2. Subir el archivo ai-marketing-expert-pro.zip
3. Activar el plugin
4. Ir a AI Marketing Expert → Configuración → conectar tu proveedor de IA (OpenAI, Claude, etc.)


PÁGINAS ADICIONALES (últimas incorporaciones)
──────────────────────────────────────────────
| Título                          | Slug sugerido              | Template a asignar               |
|---------------------------------|---------------------------|-----------------------------------|
| Academia y Cursos               | academia-cursos            | Academia y Cursos                 |
| AI Copilot                      | ai-copilot                 | AI Copilot                        |
| API Gateway                     | api-gateway                 | API Gateway                       |
| Catálogo de Servicios           | catalogo-servicios         | Catálogo de Servicios              |
| Desarrollo Web Personalizado    | desarrollo-web-personalizado | Desarrollo Web Personalizado    |


DASHBOARD CRM AUTOCONTENIDO (/app)
───────────────────────────────────
El tema incluye un CRM completo y autocontenido — sin depender de ninguna
URL externa (no usa Replit, ni ningún servicio aparte de WordPress):

1. No es necesario crear una página con slug "app": el tema intercepta
   automáticamente CUALQUIER URL que empiece con /app (vía `template_redirect`
   en functions.php) y sirve el shell del dashboard — no depende de que
   exista una página real en WordPress con ese slug.
2. El dashboard es una SPA con ruteo real por URL: /app/dashboard,
   /app/contacts, /app/companies, /app/leads, /app/deals, /app/activities,
   /app/invoices, /app/quotes, /app/products y /app/whatsapp son todas URLs
   navegables directamente (deep links) y el botón atrás/adelante del
   navegador funciona (history.pushState + popstate en assets/js/app.js)
2b. Sección "Comunicación → WhatsApp": cada usuario puede guardar su número
   de WhatsApp (y opcionalmente una API key, para integrarla más adelante
   con un proveedor externo tipo Evolution API). El estado de conexión
   (Conectado/Desconectado) se guarda por usuario en user_meta
   (`clntm_whatsapp`) — endpoints REST: GET/POST /whatsapp/status,
   /whatsapp/connect, /whatsapp/disconnect. Por ahora es una conexión
   "lógica" (guarda el número y marca el estado); el envío/recepción real
   de mensajes requeriría conectar esas credenciales a un proveedor de
   WhatsApp Business API.
3. Los usuarios deben registrarse desde /registro (o loguearse desde /login)
   para acceder a /app — el dashboard es privado por usuario
4. Datos 100% aislados por usuario (contactos, empresas, leads, deals,
   actividades, productos, facturas y presupuestos filtrados por user_id)
5. Al activar el tema se crean automáticamente 8 tablas MySQL con prefijo
   `clntm_` (contacts, companies, leads, deals, activities, products,
   invoices, quotes) — no requiere ningún plugin adicional
6. La API REST queda registrada en /wp-json/clientum/v1/* y solo responde
   a usuarios logueados (protegida con nonce de WordPress)

Flujo completo: Registro (/registro) → auto-login → redirige a /app/dashboard →
usuario ve su propio CRM vacío, listo para usar, con sidebar completo
(secciones CRM y Ventas), tarjetas de KPIs, gráfico de pipeline y feed de
actividad reciente — igual que el dashboard de la app React real.
