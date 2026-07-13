# Resumen del proyecto — Santi, SDR de Clientum con Hermes + AI Prospector

## Contexto
Jonathan Ledantes, fundador de Clientum (plataforma de IA/CRM para PyMEs argentinas,
clientum.com.ar), necesita generar clientes urgente. Construyó una app propia llamada
**AI Prospector** que tiene:
- Scraper de leads
- Scraper/resolución de contacto de empleados
- Generador de brochure personalizado por lead con IA
- Un CRM básico

El objetivo es que **Hermes Agent** (framework open-source de Nous Research, sucesor de
OpenClaw) opere un agente SDR llamado **"Santi"** que:
1. Lee leads pendientes desde AI Prospector
2. Usa el brochure personalizado como gancho para el primer mensaje
3. Contacta al lead por WhatsApp
4. Clasifica la respuesta (caliente / tibio / frío / agendar)
5. Escala a Jonathan por WhatsApp cuando hay un lead caliente
6. Actualiza el estado y loguea notas de vuelta en el CRM de AI Prospector

Todo corre en la misma máquina Ubuntu local de Jonathan (app + Hermes juntos, sin
Deployments de Replit ni túneles — comunicación por localhost).

## Qué falta para que AI Prospector exponga los datos a Hermes
La app no tenía API — todo era uso manual por UI. Se decidió agregar 4 endpoints internos
(protegidos con API key simple, server-to-server) usando el stack existente
(Express + Drizzle + Postgres):

1. `GET /api/leads?status=pendiente&limit=20` — lista de leads con nombre de empresa,
   rubro, nombre/teléfono/cargo del contacto, estado.
2. `GET /api/leads/:id/brochure` — brochure generado por IA para ese lead.
3. `PATCH /api/leads/:id` — actualiza estado (`pendiente|contactado|caliente|tibio|frio|agendado`).
4. `POST /api/leads/:id/notes` — guarda resumen de conversación en el CRM.

**El prompt para pegarle al Replit AI Agent y que genere esto sobre las tablas reales
del proyecto está en `replit-prompt.md`.** Es la pieza central de este paquete.

## Archivos incluidos y para qué sirve cada uno

| Archivo | Para qué |
|---|---|
| `replit-prompt.md` | El prompt a pegar en Replit Agent para generar los 4 endpoints sobre el schema real |
| `schema-reference.ts` | Tablas de referencia asumidas (leads, brochures, crm_notes) — comparar contra el schema real, no imponer |
| `api-routes-scaffold.ts` | Código de referencia de las rutas, ya con queries Drizzle — usar como guía si Replit necesita ejemplo de patrón |
| `SKILL.md` | Personalidad y lógica completa de Santi como skill de Hermes (tono, clasificación de leads, límites, cómo usa el brochure) |
| `INTEGRATION.md` | Explica Camino A (API, recomendado) vs Camino B (browser automation como stopgap) |
| `QUICKSTART.md` | Instalación de Hermes, migración desde OpenClaw si aplica, conexión de WhatsApp |
| `GO-LIVE.md` | Checklist paso a paso para setup 100% local: pm2, variables de entorno, test, activar cron |
| `setup-local.sh` | Script bash: clona/actualiza el repo de AI Prospector y lo deja corriendo persistente con pm2 |
| `setup-hermes.sh` | Script bash: configura Hermes con la URL/API key y valida la conexión con un curl de prueba |
| `prospects.csv` | Fallback manual, solo si se necesita correr algo fuera del CRM en algún momento |

## Orden de ejecución recomendado
1. Pegar `replit-prompt.md` en el chat del Agent de Replit, dentro del proyecto AI Prospector.
2. Cuando Replit termine: anotar la `SANTI_API_KEY` generada y qué tablas/columnas usó.
3. Bajar el código a Ubuntu local con `setup-local.sh` (ajustar `REPO_URL` primero).
4. Confirmar el puerto en `pm2 logs ai-prospector`.
5. Completar `PUERTO` y `API_KEY` en `setup-hermes.sh` y correrlo — valida la conexión con curl.
6. Instalar Hermes (`QUICKSTART.md`), copiar `SKILL.md` a `~/.hermes/skills/santi-sdr`.
7. Decirle a Hermes que actualice la skill para usar la API real (comando en `GO-LIVE.md`).
8. Test manual con 5 leads antes de soltar todo.
9. Activar el cron diario (máx. 15-20 contactos/día para no arriesgar el número de WhatsApp).

## Restricciones importantes a respetar siempre
- Santi nunca cierra precio ni condiciones — solo califica y escala a Jonathan.
- Máximo 1 mensaje de primer contacto por día por número; máximo 2 follow-ups espaciados.
- Si un prospecto pide no ser contactado de nuevo, se marca frío y no se le vuelve a escribir.
- El CRM de AI Prospector es la única fuente de verdad del estado de cada lead.
- Mientras se arma esto, no frenar el contacto manual de la base existente de 167 prospectos —
  la automatización es para escalar, no para arrancar desde cero mientras hay urgencia de caja.
