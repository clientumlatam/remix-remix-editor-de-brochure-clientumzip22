# Informe Detallado: `remix_-remix_-editor-de-brochure-clientum`
> Generado el 10 de julio de 2026 | **30 archivos** · **~9.000 líneas de código**

---

## Resumen Ejecutivo

Aplicación **standalone** creada en **Google AI Studio** (Gemini API). Es un editor interactivo para personalizar, simular y descargar el brochure comercial de Clientum 2026.  
Funciona como herramienta de ventas B2B: un vendedor carga el nombre del prospecto, genera el contenido con IA y exporta un PDF listo para presentar.

**Nombre oficial:** `Remix: Remix: Editor de Brochure Clientum`  
**Capacidad registrada:** `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`

---

## Estructura de Archivos

```
remix_-remix_-editor-de-brochure-clientum/
│
├── index.html                   ← Entry point HTML
├── server.ts                    ← Servidor Express + Gemini API (1.682 líneas)
├── vite.config.ts               ← Configuración Vite con Tailwind v4
├── tsconfig.json                ← TypeScript config
├── package.json                 ← Dependencias y scripts
├── package-lock.json
├── .env.example                 ← Variables de entorno requeridas
├── .gitignore
├── README.md                    ← Instrucciones de Google AI Studio
├── metadata.json                ← Metadata de la app (capacidades Gemini)
│
├── assets/
│   └── .aistudio/.gitignore     ← Ignorar archivos generados por AI Studio
│
└── src/
    ├── main.tsx                 ← Entry React
    ├── App.tsx                  ← Orquestador principal (423 líneas)
    ├── types.ts                 ← Interfaces TypeScript (104 líneas)
    ├── data.ts                  ← Datos default + 6 presets de industria (700+ líneas)
    ├── index.css                ← Estilos globales Tailwind
    │
    ├── assets/images/
    │   ├── clientum_logo_one_*.jpg    ← Logo variante 1
    │   ├── clientum_logo_two_*.jpg    ← Logo variante 2
    │   └── clientum_logo_three_*.jpg  ← Logo variante 3
    │
    ├── components/
    │   ├── SidebarEditor.tsx          ← Panel de edición (1.631 líneas)
    │   ├── BrochurePreview.tsx        ← Vista previa interactiva (1.269 líneas)
    │   ├── SalesProspectorDashboard.tsx ← CRM de prospección (2.873 líneas) ⭐
    │   ├── PublicWebsite.tsx          ← Sitio web del prospecto (2.463 líneas)
    │   ├── SalesAssistantChat.tsx     ← Chat IA flotante (246 líneas)
    │   ├── ChatbotSim.tsx             ← Simulación de chatbot WhatsApp
    │   ├── InteractiveAIChat.tsx      ← Chat IA con gráficos
    │   ├── InteractiveCRMKanban.tsx   ← Kanban CRM interactivo
    │   └── SidebarCRM.tsx             ← Panel lateral del módulo CRM
    │
    ├── services/
    │   └── scraperService.ts          ← Cliente scraping Google Maps vía Apify (44 líneas)
    │
    └── utils/
        └── pdfGenerator.ts            ← Exportador PDF con jsPDF (436 líneas)
```

---

## Stack Tecnológico

| Tecnología | Versión | Rol |
|-----------|---------|-----|
| React | 19.0.1 | UI framework |
| Vite | 6.2.3 | Dev server + bundler |
| TypeScript | 5.8.2 | Tipado |
| Tailwind CSS | 4.1.14 | Estilos (plugin Vite nativo) |
| `@google/genai` | 2.4.0 | SDK de Gemini AI |
| `jspdf` | 4.2.1 | Exportación PDF vectorial |
| `recharts` | 3.9.2 | Gráficos de datos |
| `lucide-react` | 0.546.0 | Iconografía |
| `motion` | 12.23.24 | Animaciones (Framer Motion) |
| `express` | 4.21.2 | Servidor BFF / proxy IA |
| `apify-client` | 2.23.4 | Scraping de Google Maps |
| `dotenv` | 17.2.3 | Variables de entorno |
| `tsx` | 4.21.0 | Ejecutar TypeScript (dev) |
| `esbuild` | 0.25.0 | Build del servidor |

**Variables de entorno requeridas:**
```env
GEMINI_API_KEY=...            # Clave de Google Gemini
GOOGLE_MAPS_PLATFORM_KEY=...  # API key de Google Maps (opcional)
APIFY_API_TOKEN=...           # Token de Apify para scraping
```

---

## Arquitectura: Modos de Vista (`viewMode`)

La app tiene **3 modos** que se alternan desde la barra de navegación superior:

```
┌─────────────────────────────────────────────────────────┐
│  Navbar: [Editor de Brochure]  [AI Client Prospector 🎯]  [Sitio Web 🌐]  │
└─────────────────────────────────────────────────────────┘
         │                    │                      │
         ▼                    ▼                      ▼
   viewMode="editor"   viewMode="prospector"  viewMode="website"
```

### Modo 1: `editor` — Editor de Brochure

**Layout principal:** sidebar izquierdo + preview derecho + chat flotante.

```
┌──────────────────────────────────────────────────┐
│  HEADER (Navbar global)                           │
├──────────────────┬───────────────────────────────┤
│  SidebarEditor   │  BrochurePreview              │
│  (4 tabs)        │  (páginas 1-8)                │
│                  │                               │
│  · Config        │  Selector de página           │
│  · Páginas       │  [Pág.1][Pág.2]...[Pág.8]    │
│  · IA            │                               │
│  · CRM           │  Vista previa en vivo          │
│                  │  (editable inline)            │
└──────────────────┴───────────────────────────────┘
│  [SalesAssistantChat - Botón flotante IA]         │
└──────────────────────────────────────────────────┘
```

**Acciones del toolbar:**
- **Página Única / Ver Todas** — alterna entre vista de página individual y todas apiladas para imprimir
- **Reset** — reinicia todo al preset `default`
- **Imprimir / PDF A4** — abre el diálogo de impresión del navegador
- **Descargar PDF** — exporta PDF vectorial de alta calidad con `jsPDF`

---

### Modo 2: `prospector` — AI Client Prospector 🎯 (el más complejo)

Componente `SalesProspectorDashboard.tsx` — **2.873 líneas**, el más grande de la app.

**¿Qué hace?**  
Dashboard CRM completo para prospectar clientes B2B de PyMEs argentinas. Permite buscar empresas, analizarlas con IA y generar secuencias de outreach personalizadas.

**Ciudades disponibles para prospectar:**

| Río Negro | Neuquén |
|-----------|---------|
| General Roca | Neuquén Capital |
| Cipolletti | Plottier |
| San Carlos de Bariloche | Centenario |
| Viedma | Zapala |
| Villa Regina | Cutral Co |
| Allen | San Martín de los Andes |
| Cinco Saltos | Villa La Angostura |
| Catriel | Chos Malal |
| San Antonio Oeste | |

**Rubros/Industrias disponibles:**  
Presets: Ferreterías y Corralones, Agro, Gastronomía, Inmobiliarias, Distribuidoras, Salud & Estética, y entrada libre de texto.

**Flujo de prospección:**
1. Vendedor elige ciudad + rubro
2. Hace clic en **"Prospectar"** → llama a `/api/scrape-places` (Apify + Google Maps)
3. La app genera fallback de alta calidad si no hay API key
4. Se populan tarjetas de prospectos con datos reales: empresa, dirección, teléfono, pain point
5. El vendedor arrastra prospectos al **pipeline Kanban** (4 etapas)
6. Hace clic en **"Analizar con IA"** → Gemini genera scoring MEDDIC completo
7. Genera secuencias de outreach: 3 emails + 3 mensajes LinkedIn + guión telefónico

**Pipeline Kanban (4 etapas):**

| Etapa | Descripción |
|-------|-------------|
| `leads` | Prospectos nuevos encontrados |
| `bot_contact` | Contactados por bot/WhatsApp |
| `proposed` | Propuesta enviada |
| `closed` | Cerrado / Deal ganado |

**Scoring MEDDIC por deal:**

| Campo | Descripción |
|-------|-------------|
| `meddicMetrics` | Métricas económicas del negocio |
| `meddicBuyer` | Poder de decisión del contacto |
| `meddicCriteria` | Criterios de decisión del comprador |
| `meddicProcess` | Proceso de compra de la empresa |
| `meddicPain` | Dolor identificado |
| `meddicChampion` | Existe un champion interno |
| `meddicScore` | Score final 0-100 |
| `meddicRedFlags` | Señales de alerta |
| `meddicNextActions` | Próximas acciones recomendadas |

**Secuencias de Outreach generadas por IA:**
- `outreachEmail1/2/3` — 3 emails en secuencia con intervalos de tiempo
- `outreachLinkedIn[]` — 3 mensajes para LinkedIn
- `outreachPhoneScript` — Guión telefónico completo con manejo de objeciones

---

### Modo 3: `website` — Sitio Web Público

Componente `PublicWebsite.tsx` — **2.463 líneas**.

Simula el **sitio web del prospecto** tal como se vería con Clientum implementado. Usa el `brochureData` actual y el `colorTheme` elegido. Incluye:
- Hero animado con CTA
- Sección de funcionalidades
- Precios (ocultable)
- Testimonial
- Sección de contacto con datos del prospecto
- Animaciones con Framer Motion

---

## `SidebarEditor.tsx` — Panel de Edición (1.631 líneas)

4 tabs de edición:

### Tab `config` — Configuración General
- **Selector de Presets de Industria** — dropdown con 6 presets + plantillas custom
- **Temas de Color** (5 opciones):

| Tema | Paleta |
|------|--------|
| `navy` | Azul marino oscuro + verde WhatsApp (default) |
| `forest` | Teal/esmeralda oscuro |
| `amber` | Marrón oscuro + ámbar/dorado |
| `charcoal` | Pizarra oscuro + gris |
| *(pendiente)* | *(extensible)* |

- **Toggle "Ocultar precios"** — útil para primera reunión
- **Toggle "Ocultar módulo Chatbot"** — reduce brochure de 8 a 6 páginas
- **Datos de contacto del prospecto** — website, email, teléfono, dirección
- **Subida de logo del prospecto** — URL o preview modal
- **Guardar Plantilla Custom** — guarda el estado actual con nombre personalizado
- **Gestión de plantillas** — lista de plantillas guardadas con opción de eliminar

### Tab `pages` — Editor de Páginas
Editor inline de todos los textos del brochure:
- **Portada:** slogan + subtítulo
- **Servicios:** título, descripción, bullets, precio, mensualidad, tiempo estimado (por servicio)
- **Chatbot:** título, 4 features, 4 pasos del flujo
- **CRM:** título, features
- **Testimonial:** texto, autor, empresa

### Tab `ai` — Generador de Contenido IA
- **Generador de copy por industria** — campo "rubro" + "objetivo" → llama a `/api/generate-industry` → Gemini genera `BrochureData` completo
- **Optimizador de texto** — pega un texto, elige el objetivo (más persuasivo, más técnico, más cercano) → Gemini reescribe
- **Generador de imagen IA** — selecciona la página, escribe el prompt → llama a `/api/generate-image` → inserta imagen en el brochure

### Tab `crm` — Módulo CRM Embebido
Renderiza `SidebarCRM.tsx` + `ChatbotSim.tsx` directamente en el sidebar para simular el CRM y el chatbot de WhatsApp.

---

## `BrochurePreview.tsx` — Vista Previa (1.269 líneas)

### Páginas del Brochure (hasta 8 páginas, formato A4)

| Página | Contenido | Ocultar si... |
|--------|-----------|---------------|
| 1 | **Portada** — Logo, slogan, subtítulo, ciudad/contacto | — |
| 2 | **Servicios** — Cards con precio, mensualidad, tiempo estimado, bullets, estimador interactivo | `hidePrices` |
| 3 | **Chatbot WhatsApp** — Features + flujo de 4 pasos + `ChatbotSim` embebida | `hideChatbot` |
| 4 | **CRM** — Features + `InteractiveCRMKanban` embebido | — |
| 5 | **IA** — `InteractiveAIChat` con gráficos en vivo | `hideChatbot` |
| 6 | **Testimonial** — Cita del cliente, autor, empresa | — |
| 7 | **Precios y planes** — Calculadora interactiva ARS/USD + toggle mensual/anual | `hidePrices` |
| 8 | **Contacto** — Datos de contacto, QR, cierre de venta | — |

### Características de la preview
- **Temas de color** dinámicos aplicados en tiempo real (5 temas)
- **Animaciones** con Framer Motion (`motion`, `AnimatePresence`)
- **Calculadora de precios interactiva** — toggle ARS/USD + mensual/anual
- **Estimador de servicios** — checkboxes por servicio, calcula total
- **Edición inline** — algunos textos son editables directamente en la preview

---

## `server.ts` — Servidor BFF Express (1.682 líneas)

Servidor Express que actúa como **proxy seguro** entre el frontend y Gemini API / Apify.

### Endpoints de la API

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/generate` | POST | Chat IA con historial de conversación (SalesAssistantChat) |
| `/api/generate-industry` | POST | Genera `BrochureData` completo para una industria |
| `/api/generate-outreach` | POST | Genera scoring MEDDIC + secuencias de outreach para un deal |
| `/api/optimize-text` | POST | Optimiza/reescribe un texto con un objetivo |
| `/api/generate-image` | POST | Genera imagen con Gemini para insertar en el brochure |
| `/api/scrape-places` | POST | Scraping de Google Maps vía Apify para prospección |
| `/` (SPA) | GET | Sirve el frontend React (producción) |

### Sistema de fallback de IA

Diseño resiliente con múltiples niveles de fallback:

```
1. Intenta con modelo preferido (gemini-3.5-flash)
2. Si 503/429: espera exponencial (1s → 2s → 4s) y reintenta
3. Si falla: prueba modelos alternativos (gemini-3.1-flash-lite, gemini-3.1-pro-preview)
4. Si todos fallan: usa fallback LOCAL de alta calidad (funciones `getMockIndustryCopy`)
```

Los fallbacks locales están segmentados por industria:
- Agro / Logística
- Gastronomía / Restaurantes
- Inmobiliarias / Construcción
- Salud / Clínicas / Estética
- PyME genérica (default)

### Scraping de Google Maps (`/api/scrape-places`)
Usa el cliente de **Apify** para ejecutar el actor de Google Maps Scraper.  
Si no hay token de Apify → genera **prospectos mock** realistas con empresas, direcciones y teléfonos ficticios de ciudades de la Patagonia.

---

## `src/data.ts` — Datos y Presets (700+ líneas)

### `DEFAULT_BROCHURE_DATA` — Brochure Genérico

Contenido por defecto orientado a PyMEs argentinas genéricas:
- **Portada:** "Tecnología real para PyMEs reales."
- **4 features de Chatbot:** Respuesta instantánea, Agendamiento, Cotizaciones, Calificación de leads
- **4 features de CRM:** Pipeline drag & drop, Contactos, Seguimiento, Acceso móvil
- **4 Servicios:** Desarrollo Web/E-Commerce, ERP/CRM, Consultoría/Ciberseguridad, IA/BI
- **Testimonial:** Distribuidora del Sur S.A. — Neuquén

### `INDUSTRY_PRESETS` — 6 Presets de Industria

| Key | Icono | Nombre | Características especiales |
|-----|-------|--------|---------------------------|
| `gaman` | 🛠️ | GAMAN — E-Commerce & ERP (5 Etapas) | Plan de 5 etapas con precios en ARS: Bot WA ($180k+$65k/mes), CRM ($150k+$55k), Broadcast ($120k+$45k), Tienda ($350k+$90k), ERP ($280k+$75k) |
| `agro` | 🚜 | Agro & Logística | Pesaje, cartas de porte AFIP, rutas, alertas climáticas |
| `inmobiliaria` | 🏢 | Inmobiliarias & Desarrollos | Pipeline de visitas, ICL, portal de propietarios, MercadoPago |
| `distribuidora` | 📦 | Distribuidoras & Mayoristas | Catálogo B2B, cuenta corriente, tracking despacho, IIBB |
| `gastronomia` | 🍳 | Gastronomía & Restoranes | Reservas, KDS de cocina, delivery, fidelización |
| `salud` | 🩺 | Clínicas, Salud & Estética | Turnos, obras sociales, historia clínica, recordatorios |

---

## `src/types.ts` — Modelo de Datos (104 líneas)

### Interfaces principales

```typescript
// Estructura completa de un brochure
interface BrochureData {
  cover: { slogan: string; sub: string }
  chatbot: { title: string; features: Feature[]; flowSteps: string[] }
  crm: { title: string; features: Feature[]; stageLabels?; deals?: CRMDeal[] }
  services: ServiceItem[]            // precio, mensualidad, tiempo estimado
  testimonial: { text; author; company }
  outreachEmail?: string             // email de outreach generado por IA
  images?: Record<number, string>    // imágenes generadas por IA por página
  logoUrl?: string                   // logo del prospecto
}

// Deal/prospecto en el pipeline
interface CRMDeal {
  id, company, amount, stage         // datos básicos
  industry, city, address, phone     // datos de contacto
  contact, contactTitle, painPoint   // datos de prospección
  guiacoresUrl?                      // enlace a guiacores.com
  
  // MEDDIC Scoring v2.0
  meddicMetrics, meddicBuyer, meddicCriteria
  meddicProcess, meddicPain, meddicChampion
  meddicScore, meddicRedFlags, meddicNextActions[]
  
  // Outreach Copy v2.0
  outreachEmail1, outreachEmail2, outreachEmail3
  outreachLinkedIn[], outreachPhoneScript
}

// Mensaje del chat IA con soporte de gráficos
interface AIChatMessage {
  id, sender: "user" | "assistant", text
  chartData?: any[]                  // datos para recharts
  chartType?: "bar" | "line" | "pie"
}

// Plantilla guardada por el usuario
interface CustomTemplate {
  id, name, createdAt
  brochureData, colorTheme
  hidePrices, hideChatbot
}
```

---

## `src/utils/pdfGenerator.ts` — Exportador PDF (436 líneas)

Genera un PDF A4 vectorial con `jsPDF` sin dependencia del DOM.

**Páginas generadas (4-5 según configuración):**
1. Portada con logo SVG vectorial, slogan y datos de contacto
2. Servicios con precios tabulados
3. Chatbot (si `hideChatbot=false`) con flujo de 4 pasos
4. CRM con features
5. Cierre comercial con testimonial y datos de contacto

**Temas de color soportados:**
| Tema | Color primario | Color secundario |
|------|----------------|-----------------|
| `navy` (default) | RGB(26, 52, 97) | RGB(37, 211, 102) |
| `forest` | RGB(6, 78, 59) | RGB(16, 185, 129) |
| `amber` | RGB(120, 53, 15) | RGB(245, 158, 11) |
| `charcoal` | RGB(30, 41, 59) | RGB(100, 116, 139) |

**Helpers internos:**
- `drawFooter(page, total)` — pie de página con línea separadora y numeración
- `drawHeaderBand(title)` — banda de color con título de sección

---

## `src/services/scraperService.ts` — Cliente Apify (44 líneas)

Servicio minimalista que delega el scraping al servidor:

```typescript
// POST /api/scrape-places → { city, industry }
// Respuesta: { prospects: ScrapeResult[] }

interface ScrapeResult {
  company, industry, amount, city
  address, phone, contact, painPoint
  score, guiacoresUrl, rating?, website?
}
```

El servidor expone la ruta `/api/scrape-places` que internamente llama a Apify para hacer scraping de **Google Maps**. Si no hay token → genera datos mock realistas.

---

## `src/components/SalesAssistantChat.tsx` — Chat IA Flotante (246 líneas)

Chat en burbuja flotante (esquina inferior derecha) que funciona como **asesor de ventas y conversión**.

- Historial de 6 mensajes como contexto
- Llama a `/api/generate` con sistema prompt de "Asesor de Ventas de Clientum"
- Mensajes de bienvenida contextuales según el preset activo
- Sugerencias rápidas (botones) para preguntas frecuentes

---

## Persistencia Local (`localStorage`)

La app persiste todo su estado en el navegador:

| Clave | Contenido |
|-------|-----------|
| `clientum_brochure_data` | JSON completo del brochure actual |
| `clientum_active_preset` | ID del preset activo |
| `clientum_color_theme` | Tema de color seleccionado |
| `clientum_hide_prices` | Toggle de precios |
| `clientum_hide_chatbot` | Toggle del módulo chatbot |
| `clientum_contact_info` | Datos de contacto del prospecto |
| `clientum_custom_templates` | Array de plantillas guardadas |
| `clientum_sim_deals` | Deals del pipeline de prospección |

---

## Scripts del `package.json`

| Script | Comando | Descripción |
|--------|---------|-------------|
| `dev` | `tsx server.ts` | Inicia servidor Express + Vite HMR en desarrollo |
| `build` | `vite build && esbuild server.ts ...` | Compila frontend + servidor para producción |
| `start` | `node dist/server.cjs` | Ejecuta la app en producción |
| `lint` | `tsc --noEmit` | Typecheck sin emitir |
| `clean` | `rm -rf dist server.js` | Limpia los artifacts compilados |

---

## Resumen de Complejidad por Archivo

| Archivo | Líneas | Complejidad | Función |
|---------|--------|-------------|---------|
| `SalesProspectorDashboard.tsx` | **2.873** | ⭐⭐⭐⭐⭐ | CRM completo + IA + MEDDIC |
| `PublicWebsite.tsx` | **2.463** | ⭐⭐⭐⭐ | Sitio web animado completo |
| `server.ts` | **1.682** | ⭐⭐⭐⭐ | BFF Express + Gemini + Apify |
| `SidebarEditor.tsx` | **1.631** | ⭐⭐⭐⭐ | Editor de contenido + 4 tabs IA |
| `BrochurePreview.tsx` | **1.269** | ⭐⭐⭐⭐ | 8 páginas A4 + temas + calculadoras |
| `data.ts` | **700+** | ⭐⭐⭐ | 6 presets de industria detallados |
| `pdfGenerator.ts` | **436** | ⭐⭐⭐ | PDF vectorial jsPDF |
| `App.tsx` | **423** | ⭐⭐ | Orquestador + estado global |
| `types.ts` | **104** | ⭐ | Interfaces TypeScript |
| `scraperService.ts` | **44** | ⭐ | Cliente Apify proxy |

---

## Puntos Clave para Integrar en el CRM Principal

1. **`SalesProspectorDashboard`** → integrar como `/app/prospector` en el CRM (ya existe ruta en el Chat-Export-1s)
2. **`BrochurePreview` + `pdfGenerator`** → integrar como `/app/brochure-editor` — herramienta de ventas para los usuarios del CRM
3. **Presets de industria de `data.ts`** → migrar al backend como configuración de tenant
4. **Scoring MEDDIC** → agregar campos al schema de `deals` en Drizzle
5. **Fallback local de `server.ts`** → convertirlo en el módulo de generación de copy del Copilot existente
6. **Scraper de Apify** → conectar con la ruta `/api/prospector` del api-server existente
