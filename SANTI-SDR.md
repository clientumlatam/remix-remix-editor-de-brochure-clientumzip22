# Santi SDR — Integración Hermes ↔ AI Prospector

## Qué es Santi

Santi es el agente SDR (Sales Development Rep) automático de Clientum, implementado como una
skill de **Hermes Agent** (Nous Research). Opera sobre WhatsApp: lee leads de la base,
personaliza el mensaje usando el brochure generado por IA de cada empresa, clasifica la
respuesta (caliente / tibio / frío / agendar) y escala a Jonathan cuando hay interés real.

El CRM de AI Prospector (este proyecto) es la única fuente de verdad del estado de cada lead.
Hermes consume y escribe sobre él vía API interna protegida con API key.

---

## Arquitectura

```
Ubuntu local
├── AI Prospector (Express + Postgres)   ← este proyecto
│   └── /api/leads  (6 endpoints)
└── Hermes Agent
    └── skill: santi-sdr
        └── lee leads → manda WA → clasifica → actualiza CRM
```

Todo corre en la misma máquina: comunicación por `localhost`, sin túneles ni Deployments.

---

## Tablas creadas en PostgreSQL

Creadas automáticamente al arrancar el servidor (`initSantiTables()`).

### `santi_leads`
| Columna | Tipo | Descripción |
|---|---|---|
| `id` | UUID PK | Auto-generado |
| `company_name` | TEXT | Nombre de la empresa |
| `industry` | VARCHAR(120) | Rubro |
| `city` | VARCHAR(120) | Ciudad |
| `address` | TEXT | Dirección |
| `contact_name` | TEXT | Nombre del contacto (empleado resuelto por scraper) |
| `contact_phone` | VARCHAR(30) | Teléfono del contacto |
| `contact_role` | VARCHAR(120) | Cargo del contacto |
| `pain_point` | TEXT | Diagnóstico comercial / dolor detectado |
| `fit_score` | INTEGER | Score de fit (0-10) |
| `amount_ars` | INTEGER | Monto sugerido del contrato en ARS (default: 180.000) |
| `meddic_score` | INTEGER | Score MEDDIC (0-100) |
| `guiacores_url` | TEXT | Link en Guía Cores |
| `status` | VARCHAR(20) | Estado del lead (ver valores abajo) |
| `source` | VARCHAR(60) | Origen: `patagonia_explorer` u otro |
| `created_at` | TIMESTAMP | Alta |
| `updated_at` | TIMESTAMP | Última modificación |

**Valores válidos de `status`:** `pendiente` · `contactado` · `caliente` · `tibio` · `frio` · `agendado`

### `santi_brochures`
| Columna | Tipo | Descripción |
|---|---|---|
| `id` | UUID PK | Auto-generado |
| `lead_id` | UUID FK | Referencia a `santi_leads.id` |
| `content` | TEXT | Texto completo del brochure generado por IA |
| `hook` | TEXT | Gancho/dato principal extraído (para el primer mensaje) |
| `created_at` | TIMESTAMP | Fecha de generación |

Un lead tiene a lo sumo un brochure vigente (se reemplaza en cada regeneración).

### `santi_notes`
| Columna | Tipo | Descripción |
|---|---|---|
| `id` | UUID PK | Auto-generado |
| `lead_id` | UUID FK | Referencia a `santi_leads.id` |
| `summary` | TEXT | Resumen de conversación escrito por Santi |
| `author` | VARCHAR(60) | Quién escribió la nota (default: `santi`) |
| `created_at` | TIMESTAMP | Fecha |

---

## Endpoints de la API

### Ingesta — autenticados con sesión de usuario (CRM frontend)

#### `POST /api/leads`
Crea un nuevo lead en la DB. El Patagonia Explorer llama esto cuando el usuario guarda un
prospecto en el CRM.

**Body:**
```json
{
  "company_name": "Distribuidora Comahue",
  "industry": "Distribuidora Mayorista",
  "city": "General Roca",
  "address": "Av. Roca 1234",
  "contact_name": "Marcos Ramírez",
  "contact_phone": "+54 298 4432120",
  "contact_role": "Dueño",
  "pain_point": "Pierde ventas por no responder WhatsApp fuera de horario",
  "fit_score": 8,
  "amount_ars": 180000,
  "meddic_score": 50,
  "guiacores_url": "https://guiacores.com.ar/..."
}
```

**Respuesta:** `{ "ok": true, "id": "<uuid>" }`

---

#### `POST /api/leads/:id/brochure`
Guarda (o reemplaza) el brochure generado por IA para un lead.

**Body:**
```json
{
  "content": "Texto completo del brochure...",
  "hook": "Dato personalizado para usar en el primer mensaje de WhatsApp"
}
```

**Respuesta:** `{ "ok": true }`

---

### Consumo — autenticados con `x-api-key` (Hermes/Santi)

Todos estos endpoints requieren el header:
```
x-api-key: <SANTI_API_KEY>
```

#### `GET /api/leads?status=pendiente&limit=20`
Lista de leads en un estado dado. Máximo 100 por request.

**Respuesta:**
```json
{
  "leads": [
    {
      "id": "uuid",
      "company_name": "...",
      "industry": "...",
      "city": "...",
      "contact_name": "...",
      "contact_phone": "...",
      "contact_role": "...",
      "pain_point": "...",
      "fit_score": 8,
      "amount_ars": 180000,
      "status": "pendiente",
      "created_at": "..."
    }
  ]
}
```

---

#### `GET /api/leads/:id/brochure`
Brochure IA completo de un lead específico.

**Respuesta:**
```json
{
  "brochure": {
    "id": "uuid",
    "lead_id": "uuid",
    "content": "...",
    "hook": "...",
    "created_at": "..."
  }
}
```

**404** si el lead no tiene brochure generado todavía.

---

#### `PATCH /api/leads/:id`
Actualiza el estado de un lead después de contactarlo o clasificar su respuesta.

**Body:**
```json
{ "status": "caliente" }
```

**Valores válidos:** `pendiente` · `contactado` · `caliente` · `tibio` · `frio` · `agendado`

**Respuesta:** `{ "ok": true, "id": "uuid", "status": "caliente" }`

---

#### `POST /api/leads/:id/notes`
Guarda el resumen de conversación de Santi en el CRM.

**Body:**
```json
{ "summary": "El dueño respondió con interés. Quiere saber el precio del Plan Pro. Escalado a Jonathan." }
```

**Respuesta:** `{ "ok": true, "id": "uuid" }`

---

## Credenciales y variables de entorno

### En Replit (este proyecto)
| Variable | Dónde | Estado |
|---|---|---|
| `SANTI_API_KEY` | Replit Secrets | ✅ Configurado |
| `DATABASE_URL` | Replit (gestionado) | ✅ Ya existía |

### En Hermes (máquina local Ubuntu)
```bash
hermes secrets set AI_PROSPECTOR_BASE_URL "http://localhost:5000/api"
hermes secrets set SANTI_API_KEY "<la misma key del Replit Secret>"
```

> **Nota:** La `SANTI_API_KEY` real está en Replit Secrets — nunca se guarda en texto plano
> en el repositorio. Copiala desde Replit → Secrets antes de configurar Hermes.

---

## Skill de Santi

La carpeta `hermes-santi/` en la raíz de este proyecto contiene todos los archivos de la skill:

| Archivo | Descripción |
|---|---|
| `SKILL.md` | Personalidad, flujo, límites y lógica de clasificación de Santi |
| `INTEGRATION.md` | Camino A (API, recomendado) vs Camino B (browser automation) |
| `QUICKSTART.md` | Instalación de Hermes, conexión de WhatsApp, cron |
| `GO-LIVE.md` | Checklist completo para setup local con pm2 |
| `api-routes-scaffold.ts` | Referencia del código de los endpoints (adaptado ya al proyecto) |
| `schema-reference.ts` | Tablas de referencia asumidas en el scaffold |
| `setup-local.sh` | Script bash para bajar el proyecto a Ubuntu con pm2 |
| `setup-hermes.sh` | Script bash para configurar Hermes y validar conexión con curl |
| `prospects.csv` | Fallback manual (solo si se necesita campaña fuera del CRM) |
| `RESUMEN-PROYECTO.md` | Resumen ejecutivo del proyecto completo |
| `replit-prompt.md` | El prompt original que se usó para generar esta integración |

Para instalar la skill en Hermes:
```bash
cp -r hermes-santi ~/.hermes/skills/santi-sdr
```

---

## Flujo completo de operación

```
1. Patagonia Explorer encuentra un lead (scraping Google Maps / Guía Cores)
2. Usuario guarda el lead en el CRM → frontend llama POST /api/leads
3. CRM genera el brochure IA → frontend llama POST /api/leads/:id/brochure
4. [10am diario] Hermes/Santi llama GET /api/leads?status=pendiente&limit=15
5. Por cada lead: GET /api/leads/:id/brochure → arma mensaje con el hook
6. Santi manda el mensaje de WhatsApp al contacto
7. Santi llama PATCH /api/leads/:id → status: "contactado"
8. Santi clasifica la respuesta:
   - CALIENTE / AGENDAR → notifica a Jonathan por WA + PATCH status: "caliente"|"agendado"
   - TIBIO → follow-up en 3 días + PATCH status: "tibio"
   - FRIO → PATCH status: "frio", no insiste más
9. Santi loguea el resumen → POST /api/leads/:id/notes
```

---

## Restricciones operativas de Santi

- Máximo **15-20 primeros contactos por día** (proteger el número de WA de baneo)
- Máximo **2 follow-ups** por prospecto, espaciados 3-4 días
- **Nunca** cerrar precio ni condiciones — solo califica y escala a Jonathan
- Si el prospecto pide no ser contactado → `status: "frio"`, no volver a escribirle
- Variá siempre la redacción del mensaje — nunca el mismo texto a dos prospectos seguidos
- El CRM es la única fuente de verdad — Santi no mantiene estado propio fuera de la DB

---

## Test rápido (curl)

Antes de activar el cron, validar que la API responde:

```bash
# Lista leads pendientes (debería devolver [] si aún no hay leads cargados en la DB)
curl -s "http://localhost:5000/api/leads?status=pendiente&limit=3" \
  -H "x-api-key: <SANTI_API_KEY>"

# Crear un lead de prueba (desde sesión autenticada del CRM)
curl -s -X POST "http://localhost:5000/api/leads" \
  -H "Content-Type: application/json" \
  -b "connect.sid=<tu-cookie-de-sesion>" \
  -d '{"company_name":"Test SA","industry":"Ferretería","city":"Roca","contact_name":"Juan","contact_phone":"+54 298 4000000"}'

# Actualizar estado
curl -s -X PATCH "http://localhost:5000/api/leads/<id>" \
  -H "Content-Type: application/json" \
  -H "x-api-key: <SANTI_API_KEY>" \
  -d '{"status":"contactado"}'
```

---

## Checklist de go-live

- [ ] Código corriendo local con `pm2 start "npm run start" --name ai-prospector`
- [ ] `pm2 startup` configurado (arranca solo al rebootear el server)
- [ ] `AI_PROSPECTOR_BASE_URL` y `SANTI_API_KEY` seteados en Hermes
- [ ] Skill `santi-sdr` instalada en `~/.hermes/skills/`
- [ ] `curl` de prueba devuelve JSON válido
- [ ] Test manual con 5 leads — revisar tono antes de soltar el cron
- [ ] Cron activado con límite de 15 leads/día
- [ ] WhatsApp conectado (`hermes gateway add whatsapp`)
