# Informe Detallado: `base44-export-2026-07-10T02-24-41-741Z`
> Generado el 10 de julio de 2026 | **90 archivos** · Exportado a las 02:24 hs

---

## Resumen Ejecutivo

Exportación completa de una aplicación construida en **Base44** — plataforma no-code/low-code argentina. La app se llama **"ChatFlow 24/7"** y es un sistema de gestión para **GAMAN Ferretería y Corralón** (Neuquén Capital, 4 sucursales). Combina:

- **Bot de WhatsApp 24/7** — atiende consultas automáticamente, consulta catálogo, deriva a vendedores
- **CRM** — gestión de conversaciones derivadas con asignación de vendedores y seguimiento
- **Playbook de Ventas interno** — herramienta para los vendedores de Clientum para presentar el producto

> **Contexto:** Esta app no es el CRM de Clientum en sí — es una **app de demostración/piloto** construida en Base44 para mostrarle a GAMAN cómo funcionaría la solución. También sirve como Playbook interno de ventas de Clientum.

---

## Estructura de Archivos

```
base44-export-2026-07-10T02-24-41-741Z/
│
├── base44/                          ← Configuración de la plataforma Base44
│   ├── config.jsonc                 ← Nombre app: "ChatFlow 24/7", comandos npm
│   ├── agents/
│   │   └── whatsapp_bot.jsonc       ← Agente WhatsApp (contiene código del componente Sellers)
│   └── entities/                    ← Esquema de datos (JSON Schema)
│       ├── Branch.jsonc             ← Entidad Sucursal
│       ├── Product.jsonc            ← Entidad Producto
│       ├── Seller.jsonc             ← Entidad Vendedor
│       ├── User.jsonc               ← Entidad Usuario (roles)
│       └── WhatsAppConversation.jsonc ← Entidad Conversación WhatsApp
│
├── src/
│   ├── App.jsx                      ← Router principal con 7 rutas
│   ├── main.jsx                     ← Entry React
│   ├── index.css                    ← Estilos globales
│   │
│   ├── api/
│   │   └── base44Client.js          ← Cliente stub del SDK (para export local)
│   │
│   ├── lib/
│   │   ├── AuthContext.jsx          ← Context de autenticación Base44
│   │   ├── app-params.js            ← Parámetros URL/storage (appId, token)
│   │   ├── query-client.js          ← React Query config
│   │   ├── utils.js                 ← cn() y helpers
│   │   └── PageNotFound.jsx         ← Página 404
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx        ← Layout con sidebar colapsable
│   │   │   └── Sidebar.jsx          ← Sidebar con 7 ítems de navegación
│   │   ├── dashboard/
│   │   │   ├── PlaybookHero.jsx     ← Hero oscuro "Playbook Interno de Ventas"
│   │   │   ├── ImpactMetrics.jsx    ← Gráficos Recharts: automatización + ahorro de tiempo
│   │   │   ├── ProblemSolutionMap.jsx ← Mapa interactivo problema→solución
│   │   │   ├── PitchEngine.jsx      ← Motor de 7 pitches de ventas
│   │   │   └── ConversionChart.jsx  ← Gráfico de conversión por vendedor/sucursal
│   │   ├── crm/
│   │   │   └── ConversationDetail.jsx ← Panel lateral de detalle de conversación
│   │   ├── ProtectedRoute.jsx       ← Guard de ruta autenticada
│   │   ├── UserNotRegisteredError.jsx ← Error de usuario no registrado
│   │   └── ui/                      ← 30+ componentes shadcn/ui
│   │
│   ├── pages/
│   │   ├── Dashboard.jsx            ← Playbook de ventas (4 secciones)
│   │   ├── CRM.jsx                  ← CRM de conversaciones WhatsApp
│   │   ├── Conversations.jsx        ← Historial de conversaciones
│   │   ├── Products.jsx             ← Catálogo de productos con búsqueda
│   │   ├── Branches.jsx             ← Gestión de sucursales GAMAN
│   │   ├── Sellers.jsx              ← Gestión de vendedores por especialidad
│   │   └── BotConfig.jsx            ← Configuración del bot WhatsApp
│   │
│   ├── hooks/
│   │   └── use-mobile.jsx
│   └── utils/
│       └── index.ts
│
├── package.json                     ← Dependencias (ver detalle abajo)
├── vite.config.js                   ← Vite + Base44 plugin
├── tailwind.config.js               ← Tailwind v3
├── jsconfig.json / tsconfig.json    ← Config JS/TS
├── eslint.config.js
├── components.json                  ← shadcn/ui config
├── postcss.config.js
├── index.html
├── README.md
└── .gitignore
```

---

## Stack Tecnológico

| Tecnología | Versión | Rol |
|-----------|---------|-----|
| React | 18.2.0 | UI framework |
| Vite | 6.1.0 | Dev server + bundler |
| `@base44/sdk` | 0.8.37 | SDK de Base44 (auth, entities, agents) |
| `@base44/vite-plugin` | 1.0.30 | Plugin Vite para Base44 |
| Tailwind CSS | 3.4.17 | Estilos |
| shadcn/ui + Radix UI | múltiples | Componentes UI (30+ componentes) |
| `@tanstack/react-query` | 5.84.1 | Data fetching y cache |
| `react-router-dom` | 6.26.0 | Routing SPA |
| Recharts | 2.15.4 | Gráficos (pie chart, bar chart) |
| `@hello-pangea/dnd` | 17.0.0 | Drag & Drop (Kanban) |
| `framer-motion` | 11.16.4 | Animaciones |
| `jspdf` + `html2canvas` | 4.2.1 / 1.4.1 | Exportación PDF |
| `react-leaflet` | 4.2.1 | Mapas (sucursales) |
| `date-fns` | 3.6.0 | Formateo de fechas en español |
| `moment` | 2.30.1 | Manejo de fechas |
| `zod` | 3.24.2 | Validación de esquemas |
| `@stripe/stripe-js` | 5.2.0 | Pagos Stripe (preparado) |
| `lodash` | 4.17.21 | Utilidades JS |
| `react-hook-form` | 7.54.2 | Formularios |
| `three` | 0.171.0 | 3D (preparado para visualizaciones) |
| `canvas-confetti` | 1.9.4 | Animación de celebración |
| `react-markdown` | 9.0.1 | Renderizado Markdown |
| TypeScript | 5.8.2 | Tipado (parcial) |

---

## Plataforma Base44 — Entidades (`base44/entities/`)

El esquema de datos de la app se define en archivos JSONC (JSON Schema). Base44 genera automáticamente la API CRUD a partir de estas definiciones.

### `Branch` — Sucursal

```json
{
  "name": string (req),       // Nombre de la sucursal
  "address": string (req),    // Dirección completa
  "phone": string (req),      // Teléfono de contacto
  "schedule": string (req),   // Horarios (separados por "|")
  "city": string,             // Ciudad
  "active": boolean = true    // Si la sucursal está activa
}
```

### `Product` — Producto

```json
{
  "code": string (req),    // Código del producto
  "name": string (req),    // Nombre del producto
  "price": number (req),   // Precio con IVA
  "category": string,      // Categoría
  "active": boolean = true
}
```

### `Seller` — Vendedor

```json
{
  "name": string (req),       // Nombre del vendedor
  "phone": string (req),      // WhatsApp del vendedor
  "email": string,
  "specialty": enum (req):    // Especialidad:
    "plomeria" | "electricidad" | "pintura" |
    "construccion" | "ceramicos" | "herramientas" | "general"
  "branch": string,           // Sucursal asignada
  "active": boolean = true
}
```

### `User` — Usuario

```json
{
  "role": enum (req): "admin" | "user"
}
```

### `WhatsAppConversation` — Conversación WhatsApp ⭐ (entidad central)

```json
{
  "customer_phone": string (req),   // Teléfono del cliente
  "customer_name": string,          // Nombre del cliente
  "query_type": enum (req):         // Tipo de consulta:
    "precios" | "horarios" | "sucursales" |
    "derivacion" | "reclamo" | "otro"
  "status": enum = "activa":        // Estado:
    "activa" | "derivada" | "resuelta" | "cerrada"
  "assigned_seller": string,        // Vendedor asignado
  "assigned_branch": string,        // Sucursal asignada
  "budget_generated": boolean,      // Si se generó un presupuesto
  "budget_approved": boolean,       // Si el presupuesto fue aprobado
  "visit_date": datetime,           // Fecha/hora de visita técnica
  "visit_scheduled": boolean,       // Si se creó evento en Google Calendar
  "summary": string,                // Resumen de la conversación
  "channel": enum = "whatsapp":     // Canal: "whatsapp" | "web"
}
```

---

## Agente Base44 (`base44/agents/whatsapp_bot.jsonc`)

> ⚠️ **Nota:** Este archivo contiene código JSX en lugar de JSONC puro — parece ser un archivo mal mapeado durante la exportación. El contenido corresponde al componente `Sellers.jsx`.

El agente `whatsapp_bot` se vincula desde `BotConfig.jsx` mediante:
```javascript
const whatsappURL = db.agents.getWhatsAppConnectURL('whatsapp_bot');
```
Este método devuelve la URL de conexión por QR para vincular un número de WhatsApp Business al agente de IA configurado en Base44.

---

## Autenticación — `AuthContext.jsx`

Sistema de auth propio de Base44 con flujo completo:

```
1. checkAppState() → GET /api/apps/public/prod/public-settings/by-id/{appId}
   ├── Si OK y hay token → checkUserAuth()
   │   └── db.auth.me() → obtiene usuario actual
   └── Si 403:
       ├── reason = "auth_required" → redirige a login
       └── reason = "user_not_registered" → muestra error UserNotRegisteredError

2. logout() → db.auth.logout(redirectUrl)
3. navigateToLogin() → db.auth.redirectToLogin(returnUrl)
```

**Parámetros de configuración** (`app-params.js`):
- `appId` — ID de la app en Base44 (desde `VITE_BASE44_APP_ID` o URL `?app_id=`)
- `token` — Token de acceso (desde URL `?access_token=`, se limpia de la URL y se guarda en localStorage)
- `functionsVersion` — Versión de funciones serverless
- `appBaseUrl` — Base URL de la API

---

## Rutas de la App (`App.jsx`)

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | `Dashboard` | Playbook de ventas interno de Clientum |
| `/crm` | `CRM` | CRM de conversaciones con detalle y acciones |
| `/conversations` | `Conversations` | Historial de conversaciones (vista simple) |
| `/products` | `Products` | Catálogo de productos con búsqueda |
| `/branches` | `Branches` | Gestión de las 4 sucursales GAMAN |
| `/sellers` | `Sellers` | Gestión de vendedores por especialidad |
| `/bot` | `BotConfig` | Config y estado del bot WhatsApp |
| `*` | `PageNotFound` | 404 |

**Sidebar** (navbar izquierda oscura `hsl(222,47%,11%)`):

| Ícono | Ruta | Etiqueta |
|-------|------|---------|
| LayoutDashboard | `/` | Dashboard |
| Kanban | `/crm` | CRM |
| MessageSquare | `/conversations` | Conversaciones |
| Package | `/products` | Productos |
| MapPin | `/branches` | Sucursales |
| Users | `/sellers` | Vendedores |
| Bot | `/bot` | Bot WhatsApp |

Footer del sidebar: `● Bot activo · 24/7` con indicador verde pulsante.

---

## Páginas en Detalle

### `/` — Dashboard (Playbook de Ventas)

Composición de 4 secciones apiladas:

#### 1. `PlaybookHero` — Hero del Playbook
Fondo oscuro (`slate-900`) con glows azules difuminados. Título:
> "Tu PyME merece trabajar con IA. **Dejá de hacerlo todo a mano**"

Descripción: herramienta para comunicar el valor de Clientum a prospectos.

#### 2. `ImpactMetrics` — Métricas de Impacto con Gráficos Recharts

**Gráfico 1 — Pie Chart: Resolución Automática**
- 80% — Resueltas por IA (azul `#0ea5e9`)
- 20% — Derivadas a Humanos (gris `#cbd5e1`)

**Gráfico 2 — Bar Chart apilado: Ahorro de Tiempo Diario**
- Antes: 8 hs de carga operativa
- Con Clientum: 5 hs carga + 3 hs liberadas

Subtítulo: "+500 PyMEs que ya confían en Clientum"

#### 3. `ProblemSolutionMap` — Mapa Interactivo Problema → Solución

4 problemas clickeables (columna izquierda) que iluminan la solución correspondiente (columna derecha):

| Problema | Solución Clientum |
|----------|------------------|
| ⏳ Tareas Repetitivas | 📧 CRM + Automatización (scoring, pipeline, follow-up IA) |
| 📱 Respuestas Lentas | 🤖 Chatbot Inteligente 24/7 (WhatsApp, deriva casos complejos) |
| 📊 Datos Dispersos | 📈 Reportes y Dashboards (datos unificados, alertas WA, predicciones) |
| 📉 Dificultad para Escalar | 🏭 ERP Integrado con IA (escala sin sumar carga administrativa) |

#### 4. `PitchEngine` — Motor de Comunicación y Ventas

Selector de 7 pitches pre-escritos adaptados al contexto de la reunión:

| Key | Etiqueta | Uso |
|-----|---------|-----|
| `estandar` | Presentación General | Resumen completo en pocos segundos |
| `elevator` | Reunión Rápida (1 frase) | Cruces de pasillo, networking, intro <10s |
| `comercial` | Apertura de Ventas (Gancho) | Llamadas en frío, primeros minutos de demo |
| `aspiracional` | Visión a Inversores/Socios | Reuniones estratégicas, inversores |
| `emocional` | Dueño de PyME Agotado | Cuando el prospecto expresa estrés operativo |
| `motivacional` | Kick-off con Equipo Interno | Para fomentar adopción interna de la herramienta |
| `competitivo` | Enfoque Anti-Competencia | Mercados saturados, donde velocidad define el cierre |

Cada pitch tiene: texto completo + tip de uso + indicador visual del objetivo.

---

### `/crm` — CRM de Conversaciones ⭐

La página más funcional. Gestiona conversaciones derivadas del bot.

**Filtros por estado:**
- Activa · Derivada · Resuelta · Cerrada (con contadores)
- Búsqueda por nombre o teléfono de cliente

**Vista lista:** Cards con avatar inicial, nombre, teléfono, tipo de consulta (emoji), estado (badge color), vendedor asignado, resumen, timestamp.

**Panel de detalle** (`ConversationDetail.jsx`) — se abre al hacer clic en una conversación:
- Datos del cliente: nombre, teléfono, tipo de consulta, canal, fecha
- **Asignar vendedor** → desplegable con lista de sellers → `db.entities.WhatsAppConversation.update(id, { assigned_seller, status: 'derivada' })`
- **Toggle Presupuesto generado** → actualiza `budget_generated`
- **Toggle Presupuesto aprobado** → actualiza `budget_approved`
- **Agendar visita técnica** → datetime picker → actualiza `visit_date` + `visit_scheduled: true`
- **Cerrar conversación** → textarea de resumen → actualiza `status: 'cerrada'` + `summary`

**`ConversionChart`** (sub-componente — gráfico de barras):
- Calcula tasa de conversión `(budget_generated / total) × 100` por vendedor y por sucursal
- Toggle vista por Vendedor / Sucursal

---

### `/conversations` — Historial de Conversaciones

Vista más simple que `/crm`. Lista todas las conversaciones con filtros por estado. Sin panel de detalle ni acciones. Orientada a auditoría/historial.

---

### `/products` — Catálogo de Productos

- Lista todos los productos activos de la entidad `Product`
- Búsqueda en tiempo real por `code` o `name`
- Grid de cards: código, nombre, categoría, precio con IVA
- Hasta 200 productos mostrados

---

### `/branches` — Sucursales GAMAN

CRUD completo de sucursales con:
- Cards con nombre, estado activo/inactivo, dirección, ciudad, teléfono (clickeable `tel:`), horarios (separados por `|`)
- Inline edit: nombre, dirección, teléfono, horario, ciudad
- `useMutation` → `db.entities.Branch.update(id, data)`
- Botón "Agregar sucursal" → `db.entities.Branch.create(...)`

---

### `/sellers` — Vendedores

CRUD completo de vendedores con:
- Cards con avatar (inicial del nombre), nombre, especialidad (badge color por rubro), teléfono (link WhatsApp `wa.me/`), email, sucursal asignada
- Inline edit: nombre, teléfono, email, especialidad (select), sucursal, activo
- `useMutation` → `db.entities.Seller.update(id, data)` / `db.entities.Seller.create(...)`

**Especialidades con colores:**

| Especialidad | Color |
|-------------|-------|
| 🔧 Plomería | Azul |
| ⚡ Electricidad | Amarillo |
| 🎨 Pintura | Rojo |
| 🏗️ Construcción | Naranja |
| 🪟 Cerámicos | Violeta |
| 🛠️ Herramientas | Pizarra |
| 📋 General | Gris |

---

### `/bot` — Configuración del Bot WhatsApp

Panel informativo del estado del bot **"Asistente Virtual GAMAN"** con:

**Banner de estado activo:**
> `Bot configurado para GAMAN Ferretería y Corralón · Neuquén Capital · 4 Sucursales`  
> Indicador `● Activo 24/7` (verde pulsante)

**Botón "Conectar WhatsApp"** → enlace a `db.agents.getWhatsAppConnectURL('whatsapp_bot')` (URL de QR de Base44)

**Menú interactivo del bot (5 opciones):**

| # | Opción | Descripción |
|---|--------|-------------|
| 1 | 💰 Consultar precios | Busca por nombre o código en el catálogo |
| 2 | 🕐 Ver horarios | Horarios de cada sucursal |
| 3 | 📍 Ubicar sucursal | Dirección y teléfono de las 4 sucursales |
| 4 | 👤 Hablar con vendedor | Derivación inteligente por especialidad |
| 5 | ❓ Otra consulta | Asistencia general |

**Reglas de derivación inteligente (7 triggers → especialista):**

| Trigger del cliente | Derivar a |
|--------------------|----------|
| Caños, accesorios PP/SIGAS, válvulas | 🔧 Plomería |
| Cables, enchufes, térmicas, llaves de luz | ⚡ Electricidad |
| Pinturas, aerosoles, rodillos, barniz | 🎨 Pintura |
| Cemento, ladrillos, hierros, mallas | 🏗️ Construcción |
| Cerámicos, porcellanatos | 🪟 Cerámicos |
| Herramientas manuales y eléctricas | 🛠️ Herramientas |
| Consultas generales | 📋 General |

**Pasos de configuración (checklist):**
1. Conectar WhatsApp Business (QR)
2. Probar el bot
3. Ajustar respuestas
4. Activar en producción

---

## Cliente Base44 SDK (`base44Client.js`)

En el export offline, el SDK real se reemplaza por un **stub local**:

```javascript
export const db = {
  auth: {
    isAuthenticated: async () => false,
    me: async () => null
  },
  entities: new Proxy({}, {
    get: () => ({
      filter: async () => [],
      get: async () => null,
      create: async () => ({}),
      update: async () => ({}),
      delete: async () => ({})
    })
  }),
  integrations: {
    Core: { UploadFile: async () => ({ file_url: '' }) }
  }
}
```

En producción, `globalThis.__B44_DB__` es inyectado por el SDK real de Base44, que conecta con la base de datos cloud y los agentes de IA.

---

## Componentes UI (`src/components/ui/`)

30 componentes de shadcn/ui completos (JSX, sin TypeScript):

`accordion` · `alert` · `alert-dialog` · `aspect-ratio` · `avatar` · `badge` · `breadcrumb` · `button` · `calendar` · `card` · `carousel` · `chart` · `checkbox` · `collapsible` · `command` · `context-menu` · `dialog` · `drawer` · `dropdown-menu` · `form` · `hover-card` · `input` · `input-otp` · `label` · `menubar` · `navigation-menu` · `pagination` · `popover` · `progress` · `radio-group` · `resizable` · `scroll-area` · `select` · `separator` · `sheet` · `sidebar` · `skeleton` · `slider` · `sonner` · `switch` · `table` · `tabs` · `textarea` · `toast` · `toaster` · `toggle` · `toggle-group` · `tooltip` · `use-toast`

---

## Dependencias Notables

| Paquete | Por qué está | Estado |
|---------|-------------|--------|
| `@stripe/stripe-js` | Pagos Stripe preparados | No usado aún |
| `react-leaflet` | Mapa de sucursales | Importado, pendiente integrar |
| `three` | Visualizaciones 3D | No usado aún |
| `canvas-confetti` | Animación celebración | No usado aún |
| `react-quill` | Editor de texto rico | No usado aún |
| `html2canvas` + `jspdf` | Exportar a PDF | No usado aún |
| `@hello-pangea/dnd` | Kanban drag & drop | No usado aún (ruta `/crm` sin Kanban) |

---

## Diferencias Clave vs Clientum CRM (workspace actual)

| Aspecto | Base44 "ChatFlow 24/7" | Clientum CRM (Replit) |
|---------|----------------------|----------------------|
| Plataforma | Base44 (no-code cloud) | Replit (código propio) |
| Lenguaje | JavaScript (JSX) | TypeScript (TSX) |
| Backend | Base44 cloud (entities + agents) | Express 5 + PostgreSQL |
| Auth | Base44 SDK | JWT + bcrypt propio |
| DB | Base44 cloud DB | Drizzle ORM + PostgreSQL |
| WhatsApp | Agente Base44 (QR) | Evolution API (webhook) |
| Entidades | 5 (Branch, Product, Seller, User, WAConversation) | 24 tablas Drizzle |
| Propósito | Demo/piloto para GAMAN + Playbook ventas | CRM/ERP SaaS general para PyMEs |
| Estado | Exportado/congelado | En desarrollo activo |

---

## Puntos Clave para Migrar a Clientum

1. **Dashboard Playbook** → Crear `/app/playbook` en Clientum con las 4 secciones (PlaybookHero, ImpactMetrics, ProblemSolutionMap, PitchEngine) — es una herramienta de ventas lista para usar
2. **Entidad `WhatsAppConversation`** → Ya existe como `conversations` + `messages` en el schema de Drizzle de Clientum — verificar paridad de campos (`budget_generated`, `budget_approved`, `visit_date`, `visit_scheduled`)
3. **Reglas de derivación por especialidad** → Incorporar al módulo de WhatsApp Flows/Guardrails del bot
4. **`ConversionChart`** → Integrar en Analytics o en el módulo de reportes de WhatsApp como métrica de conversión por vendedor
5. **Menú interactivo del bot (5 opciones)** → Configurar como flujo base en WhatsApp Flows de la versión GAMAN del bot
6. **`PitchEngine`** (7 pitches) → Agregar como sección en la Landing page o en una nueva sección `/recursos/pitches` del sitio web público
