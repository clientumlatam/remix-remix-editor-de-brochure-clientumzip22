# Integración Santi ↔ AI Prospector

Tu app no tiene API todavía, así que hay dos caminos. Recomendado: Camino A.

## Camino A (recomendado) — API interna mínima, hoy o mañana

Dado tu stack (Express 5 + Drizzle + Postgres/Neon), agregar 4 endpoints internos es rápido
y le da a Santi acceso confiable y estructurado, sin depender de tu UI.

Endpoints necesarios:

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/api/leads?status=pending&limit=20` | Lista de leads listos para contactar (scrapeados + con contacto de empleado resuelto) |
| GET | `/api/leads/:id/brochure` | Devuelve el brochure personalizado generado por IA para ese lead (texto o URL) |
| PATCH | `/api/leads/:id` | Santi actualiza estado: `contactado`, `caliente`, `tibio`, `frio`, `agendado` |
| POST | `/api/leads/:id/notes` | Santi loguea la conversación/resumen en el CRM |

Protegé estos endpoints con un API key simple (header `x-api-key`), no hace falta OAuth para
uso interno server-to-server.

Ver `api-routes-scaffold.ts` (código funcional, ya con queries Drizzle reales) y
`schema-reference.ts` (tablas `leads`, `brochures`, `crm_notes` asumidas). Si tu schema
real usa otros nombres, es cuestión de:
1. Comparar `schema-reference.ts` contra tu `db/schema.ts` real.
2. Reemplazar el import y los nombres de columna en `api-routes-scaffold.ts` por los tuyos.
3. Generar una `SANTI_API_KEY` (`openssl rand -hex 32`) y agregarla a tus variables de entorno.
4. Montar el router: `app.use('/api', requireApiKey, leadsRouter)`.

## Camino B (stopgap de hoy) — Hermes opera tu UI directamente

Hermes tiene control de browser incluido (navegar, click, tipear, screenshot). Si necesitás
que Santi arranque HOY antes de tener la API:

```
hermes
> Abrí [URL de tu AI Prospector], iniciá sesión, y listame los leads en estado pendiente
  con su brochure generado. Para cada uno, marcá como "contactado" después de que yo te
  confirme que le mandé el mensaje.
```

Es más lento y frágil (cualquier cambio de UI rompe el flujo), pero no requiere escribir código.
Usalo solo como puente mientras armás el Camino A.

## Flujo completo una vez conectado

1. Santi pide a `/api/leads?status=pending` los próximos N leads del día.
2. Por cada lead, pide `/api/leads/:id/brochure` y arma el mensaje de WhatsApp incorporando
   el gancho del brochure (dato personalizado, no genérico).
3. Manda el mensaje al contacto de empleado resuelto por el scraper.
4. Clasifica la respuesta (ver SKILL.md) y hace `PATCH /api/leads/:id` con el nuevo estado.
5. Loguea resumen con `POST /api/leads/:id/notes`.
6. Si `caliente` o `agendado` → te avisa por WhatsApp inmediatamente.

Así tu CRM queda como fuente de verdad única — no hay estado duplicado entre Hermes y la app.
