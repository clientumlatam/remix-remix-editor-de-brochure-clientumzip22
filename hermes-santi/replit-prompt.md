# Prompt para Replit AI Agent

Pegar esto tal cual (ajustando lo que esté entre [corchetes]) en el chat del Agent de Replit,
dentro del proyecto de AI Prospector:

---

Necesito exponer una API interna en este proyecto (Express + Drizzle + Postgres) para que un
agente externo (Hermes, corriendo en otro server) pueda operar esta app como SDR automático.
No es una API pública: es server-to-server, protegida con una API key simple.

Contexto: esta app ya tiene scraper de leads, resolución de contacto de empleados, generador
de brochure personalizado por IA, y un CRM. Necesito 4 endpoints nuevos que lean/escriban
sobre las tablas que ya existen en el schema (revisá `db/schema.ts` o donde esté definido
antes de escribir código, no asumas nombres):

1. `GET /api/leads?status=pendiente&limit=20`
   Devuelve leads en un estado dado, con: id, nombre de empresa, rubro, nombre de contacto,
   teléfono de contacto, cargo del contacto (si existe), estado.

2. `GET /api/leads/:id/brochure`
   Devuelve el brochure generado por IA para ese lead (el texto/contenido completo).

3. `PATCH /api/leads/:id`
   Body: `{ status: "contactado" | "caliente" | "tibio" | "frio" | "agendado" }`.
   Actualiza el estado del lead en la tabla real de leads.

4. `POST /api/leads/:id/notes`
   Body: `{ summary: string }`.
   Guarda un resumen de conversación asociado al lead en el CRM (tabla de notas/actividad
   que ya exista, o crear una mínima si no existe).

Requisitos:
- Todos los endpoints van montados bajo `/api` y protegidos con un middleware que valida un
  header `x-api-key` contra una variable de entorno `SANTI_API_KEY` (generar y agregar a
  Secrets si no existe).
- Usar los nombres de tabla y columna que YA existen en el proyecto — no crear tablas nuevas
  salvo que falte explícitamente la de notas/actividad del CRM, en cuyo caso creála con una
  migración de Drizzle siguiendo el patrón del resto del schema.
- Mantener el estilo de código y estructura de rutas que ya usa el proyecto (no introducir
  un patrón nuevo si ya hay un router de leads o similar).
- Responder con JSON consistente: `{ ok: true, ... }` en éxito, `{ error: "..." }` en fallo,
  con status codes apropiados (401 sin api key, 404 no encontrado, 400 datos inválidos).
- No tocar ni romper ninguna ruta o funcionalidad existente del scraper, del generador de
  brochures o del CRM actual — esto es una capa adicional de lectura/escritura, no un refactor.

Al terminar, mostrame un resumen de qué tablas/columnas usó cada endpoint y el nombre final
de la variable de entorno para que pueda configurarla del lado del agente externo.

---

## Después de que Replit lo genere

1. Copiá la `SANTI_API_KEY` que haya quedado en Secrets de Replit.
2. Confirmá con Replit (o revisando el diff) los nombres reales de tabla/columna que usó —
   así actualizamos `api-routes-scaffold.ts` y `schema-reference.ts` del lado de Hermes para
   que coincidan exactamente (o simplemente los descartamos si Replit ya resolvió todo del
   lado de la app, y Hermes solo consume la URL pública).
3. Si tu Replit tiene URL pública (`https://[proyecto].[usuario].repl.co`), esa es la base URL
   que Santi va a usar para las 4 rutas. Si es privada, vas a necesitar exponerla o correr
   Hermes en la misma red.
