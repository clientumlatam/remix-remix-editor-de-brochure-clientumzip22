# Variables de entorno y secretos — Clientum CRM

Listado completo de todas las variables de entorno y API keys usadas en el proyecto.

---

## 🔴 Secretos obligatorios en producción

| Variable | Servicio | Descripción | Fallback dev |
|---|---|---|---|
| `DATABASE_URL` | PostgreSQL | Cadena de conexión a la base de datos Postgres | Auto-provisionado por Replit ✅ |
| `JWT_SECRET` | Auth / Portal | Clave para firmar y verificar tokens JWT (usuarios + portal de clientes) | `"clientum-dev-secret-change-in-production"` ⚠️ |
| `RESEND_API_KEY` | Resend | API key para envío de emails transaccionales (reset de contraseña, invitaciones) | Ninguno — falla si no está |
| `MP_ACCESS_TOKEN` | MercadoPago | Access token para procesar pagos con MercadoPago | Ninguno — pagos deshabilitados |
| `MP_WEBHOOK_SECRET` | MercadoPago | Secret para verificar la firma de webhooks de MP en producción | Ninguno — webhooks rechazados |
| `OPENROUTER_API_KEY` | OpenRouter | API key global para el módulo de IA | Ninguno — IA deshabilitada |
| `GROQ_API_KEY` | Groq Whisper | API key para transcripción de audio de WhatsApp (Whisper Large v3) | Ninguno — bot responde "escribí en texto" |
| `GOOGLE_CLIENT_ID` | Google OAuth | Client ID para login con Google | Ninguno — login Google deshabilitado |
| `GOOGLE_CLIENT_SECRET` | Google OAuth | Client Secret para login con Google | Ninguno — login Google deshabilitado |

> ⚠️ **`JWT_SECRET`**: si no se define, el servidor usa el fallback hardcodeado. Esto es un riesgo de seguridad crítico en producción — cualquiera que conozca el string por defecto puede forjar tokens válidos.

---

## 🟡 Variables de configuración opcionales

| Variable | Servicio | Descripción | Default |
|---|---|---|---|
| `RESEND_FROM_NAME` | Resend | Nombre del remitente en los emails | `"Clientum"` ✅ configurado |
| `RESEND_FROM_EMAIL` | Resend | Dirección de email del remitente | `"noreply@clientum.com.ar"` ✅ configurado |
| `OPENROUTER_API_KEY_CLIENTUM` | OpenRouter | API key premium para cuentas `@clientum.com.ar` (opcional, tiene prioridad sobre la global) | Usa la global |
| `LOG_LEVEL` | Logger (Pino) | Nivel de logging del servidor API | `"info"` |
| `NODE_ENV` | Infra | Entorno de ejecución (`development` / `production`) | — |

---

## 🔵 Variables de infraestructura (provistas por Replit, no configurar manualmente)

| Variable | Descripción |
|---|---|
| `PORT` | Puerto en el que escucha cada servicio (asignado por Replit por artifact) |
| `BASE_PATH` | Path base del frontend Vite (ej. `/`) |
| `REPL_ID` | ID del Repl, usado para detectar entorno de desarrollo |
| `REPLIT_DOMAINS` | Dominios públicos del deploy (separados por coma) |
| `SESSION_SECRET` | Secret de sesión (auto-provisionado por Replit) |

---

## 🟢 API keys por tenant (en base de datos, no en env)

Además de las variables de entorno globales, el sistema soporta configuración por tenant almacenada en la tabla `tenants`:

| Columna DB | Descripción |
|---|---|
| `openrouterApiKey` | API key de OpenRouter propia del tenant para el módulo de IA. Si está definida, tiene prioridad sobre `OPENROUTER_API_KEY` global |

---

## Dónde se usan — mapa rápido

```
DATABASE_URL
  └── lib/db/src/index.ts
  └── lib/db/drizzle.config.ts

JWT_SECRET
  └── artifacts/api-server/src/lib/auth.ts         (tokens de usuario, 7d)
  └── artifacts/api-server/src/routes/portal.ts    (tokens de portal, 24h, iss:"portal")

RESEND_API_KEY / RESEND_FROM_NAME / RESEND_FROM_EMAIL
  └── artifacts/api-server/src/lib/mailer.ts
  └── artifacts/api-server/src/routes/auth.ts

MP_ACCESS_TOKEN / MP_WEBHOOK_SECRET
  └── artifacts/api-server/src/routes/payments.ts

OPENROUTER_API_KEY / OPENROUTER_API_KEY_CLIENTUM
  └── lib/integrations-openrouter-ai/src/client.ts

GROQ_API_KEY
  └── artifacts/api-server/src/routes/webhooks (transcripción de audio WhatsApp)

GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
  └── artifacts/api-server/src/routes/auth.ts (Google OAuth)

PORT / BASE_PATH / NODE_ENV / REPL_ID
  └── artifacts/api-server/src/index.ts
  └── artifacts/clientum/vite.config.ts
  └── artifacts/mockup-sandbox/vite.config.ts

LOG_LEVEL
  └── artifacts/api-server/src/lib/logger.ts
```

---

## Cómo configurar los secretos en Replit

1. Ir a **Tools → Secrets** en el panel lateral de Replit
2. Agregar cada variable con su nombre exacto (ej. `JWT_SECRET`)
3. El servidor las lee automáticamente como `process.env.NOMBRE_VARIABLE`

> Nunca commitear valores reales de secretos en el código fuente o en este archivo.
