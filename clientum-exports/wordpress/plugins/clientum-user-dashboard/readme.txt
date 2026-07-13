=== Clientum — Panel de Usuario (CRM) ===
Contributors: clientum
Tags: crm, dashboard, panel de usuario
Requires at least: 5.8
Tested up to: 6.6
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later

Panel de usuario independiente (CRM completo) instalable como plugin, funciona con cualquier tema activo.

== Descripción ==

Este plugin agrega un panel de usuario tipo CRM (contactos, empresas, leads, negocios,
actividades, productos, facturas y cotizaciones), con su propio sistema de login,
registro y recuperación de contraseña. Cada usuario ve y gestiona únicamente sus
propios datos.

A diferencia de una plantilla de tema, este plugin NO depende de páginas de WordPress
con slugs específicos ni de ningún tema en particular: intercepta directamente las
rutas /app, /login, /registro y /recuperar-contrasena y sirve su propio HTML.
Podés activar/desactivar el tema que quieras sin perder el panel.

== Instalación ==

1. Subí la carpeta `clientum-user-dashboard` (o el .zip) desde Plugins > Añadir nuevo > Subir plugin.
2. Activá el plugin. Esto crea automáticamente las tablas del CRM en tu base de datos.
3. Visitá /registro para crear la primera cuenta, o /login si ya tenés una.
4. El panel queda disponible en /app.

== Notas ==

* Requiere que los permalinks de WordPress estén configurados en un formato "bonito"
  (Ajustes > Enlaces permanentes → cualquier opción que no sea "Sencilla"), ya que el
  plugin identifica las rutas por su path (/app, /login, etc.).
* También podés insertar el panel dentro de cualquier página con el shortcode
  [clientum_user_dashboard].
* Si el tema activo ya usa las rutas /login, /registro o /app para otra cosa, puede
  haber conflicto — en ese caso desactivá esas plantillas del tema o usá este plugin
  sin el tema Clientum.

== Changelog ==

= 1.0.0 =
* Versión inicial: panel de usuario extraído del tema Clientum como plugin independiente.
