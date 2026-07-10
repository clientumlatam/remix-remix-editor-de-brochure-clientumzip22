# Checklist de Migración — Clientum CRM (FINAL)

Basado en: `INFORME.md`, `INFORME_base44_export.md`, `INFORME_brochure_editor.md`
Verificado contra: `base44-export-2026-07-10T03-00-19-908Z.zip`, `remix_-remix_-editor-de-brochure-clientum-1.zip`
Objetivo: consolidar los 4 orígenes (Chat-Export-1s, `/2`, Editor de Brochure, ChatFlow 24/7) en el workspace activo.

---

## Correcciones confirmadas contra los zips reales

- ❌ El informe decía que `base44/agents/whatsapp_bot.jsonc` tenía código JSX mal mapeado — **falso**, es JSONC limpio con las instrucciones del bot en texto plano
- ✅ Entidad `WhatsAppConversation` — schema confirmado 1:1, incluye `budget_generated`, `budget_approved`, `visit_date`, `visit_scheduled`
- ⚠️ **Rutas del sitio público no son planas como decía el informe** — según capturas SingleFile del sitio en vivo (9/7 22:47–22:51), están anidadas bajo `/servicios/`: `/servicios/consultoria`, `/servicios/erp`, `/servicios/implementacion`, `/servicios/marketing`, `/servicios/integracion`, `/servicios/desarrollo-web` (el informe las listaba como `/consultoria`, `/erp-personalizado`, etc.)
- 🆕 Páginas no documentadas en ningún informe, confirmadas en producción: `/login`, `/forgot-password`, `/register`
- ⚠️ No se pudo confirmar `/` (home) ni `/privacidad` en las capturas — sin evidencia de que estén rotas, simplemente no se capturaron
- ✅ Brochure editor: `SalesProspectorDashboard.tsx`, `BrochurePreview.tsx`, `pdfGenerator.ts`, `data.ts`, 3 logos — todo presente tal cual lo documentado
- ⏳ **Pendiente de verificar** (no se subió el zip aún): `Chat-Export-1s/`, `/2`, `SECRETS.md`, `brand/` — todo lo de Fase 0, 1 y 4 sigue basado solo en el informe, no en archivos reales

---

## Fase 0 — Seguridad (antes de tocar nada)

- [ ] Abrir `SECRETS.md` (dentro de `Chat-Export-1s`) y confirmar si tiene credenciales reales vigentes
- [ ] Si son reales: rotar esas credenciales (DB, API keys, tokens Evolution/Apify/Gemini) antes de mover archivos
- [ ] Excluir `SECRETS.md` de cualquier commit o repo — agregar a `.gitignore` en el destino
- [ ] Revisar `Pasted--workspace-*.txt` y `Pasted--usr-bin-env*.txt` por si también tienen credenciales pegadas en logs

---

## Fase 1 — Reconciliar arquitectura de API (Chat-Export-1s vs `/2`)

Esto es lo primero porque todo lo demás depende de saber qué contrato de API es el vigente.

- [ ] Comparar `lib/db/src/schema/` de `Chat-Export-1s` contra `lib/db/` de `/2` — ver si cambiaron tablas o campos
- [ ] Abrir `lib/api-spec/` de `/2` y listar qué endpoints define
- [ ] Cruzar esa lista contra los 32 módulos de `artifacts/api-server/src/routes/` de `Chat-Export-1s`
- [ ] Marcar qué rutas **faltan** en el spec de `/2` (candidatas: `afip`, `prospector`, `woocommerce`, `copilot`, `newsletter` — son las menos probables de haber sido formalizadas)
- [ ] Decidir por cada ruta faltante: ¿se migra al spec-first, o se descarta porque quedó obsoleta?
- [ ] Una vez decidido, reconstruir `api-server` en el workspace activo generando código a partir del spec (no copiando el `.ts` viejo tal cual)

---

## Fase 2 — Integrar el Editor de Brochure (Gemini)

Es el módulo más autocontenido y de mayor valor comercial inmediato.

- [ ] Migrar `SalesProspectorDashboard.tsx` → nueva ruta `/app/prospector` (reemplaza o complementa al `prospector.ts` de Fase 1)
- [ ] Migrar `BrochurePreview.tsx` + `pdfGenerator.ts` → nueva ruta `/app/brochure-editor`
- [ ] Portar los 6 presets de industria de `data.ts` de config hardcodeada a configuración de tenant en la DB
- [ ] Agregar campos MEDDIC (`meddicScore`, `meddicMetrics`, etc.) al schema de `deals` en Drizzle
- [ ] Convertir el fallback local de `server.ts` (`getMockIndustryCopy`) en el módulo de generación de copy del Copilot existente (evita duplicar lógica de IA)
- [ ] Conectar `scraperService.ts` (Apify) con la ruta `/api/prospector` ya migrada en Fase 1
- [ ] Decidir: ¿el logo/tema de color del brochure se comparte con el Brand Guide (Fase 4), o queda independiente por prospecto?

---

## Fase 3 — Migrar el Playbook de Ventas (Base44 / ChatFlow 24/7)

Esto es contenido de ventas ya armado, bajo riesgo técnico.

- [ ] Crear `/app/playbook` con las 4 secciones: `PlaybookHero`, `ImpactMetrics`, `ProblemSolutionMap`, `PitchEngine`
- [ ] Portar los 7 pitches de `PitchEngine` como contenido estático (o configurable por tenant si aplica a más de GAMAN)
- [x] Revisar entidad `WhatsAppConversation` de Base44 — **confirmado en el zip real**, tiene los 4 campos:
  - [x] `budget_generated`
  - [x] `budget_approved`
  - [x] `visit_date`
  - [x] `visit_scheduled`
- [ ] Cruzar esos 4 campos contra `conversations` + `messages` de Drizzle en el workspace activo (esto todavía no se verificó — falta el zip de `Chat-Export-1s`/`/2`) y agregar los que falten
- [ ] Portar las 7 reglas de derivación por especialidad al módulo `whatsapp_flows` / `whatsapp_guardrails`
- [ ] Portar el menú interactivo de 5 opciones del bot como flujo base de WhatsApp Flows (versión GAMAN)
- [ ] `ConversionChart` → integrar en `/app/analytics` o en reportes de WhatsApp

---

## Fase 3.5 — Confirmar estructura real del sitio público (nuevo, post-verificación)

- [ ] Actualizar la documentación interna de rutas: usar `/servicios/{slug}` en vez de rutas planas
- [ ] Confirmar si `/login`, `/register`, `/forgot-password` públicos son el mismo auth que `/app` o uno separado
- [ ] Capturar/verificar `/` y `/privacidad` que no quedaron en las capturas SingleFile
- [ ] Si `/login` público y `/app` login son sistemas distintos, documentar por qué (¿login de leads vs login de tenant?)

---

## Fase 4 — Brand Guide y limpieza visual

- [ ] Extraer paleta/tipografía de `brand-style-guide.html` y `palette.pdf`
- [ ] Confirmar que coincide con lo ya usado en el frontend activo (o definir cuál es la fuente de verdad)
- [ ] Aplicar unificación a los componentes migrados en Fases 2 y 3

---

## Fase 5 — Descarte / archivo

- [ ] `packages/copilot-extension/` vs `wa-copilot-ext/` — son dos implementaciones de lo mismo. Elegir una, archivar la otra
- [ ] Scripts WooCommerce/ML (`fill-images-from-ml.php`, `ml_fill_images.py`) — mover a `tools/` del repo activo si siguen en uso, si no, descartar
- [ ] `img/` (30 screenshots) y archivos sueltos (`imagen_*.png`, `Screenshot_*.png`) — quedan como referencia histórica, no requieren migración de código

---

## Orden sugerido de ejecución

1. Fase 0 (seguridad) — **ya**
2. Fase 1 (reconciliar API) — bloquea todo lo demás
3. Fase 2 (Brochure/Prospector) — mayor ROI comercial inmediato, dado que tenés a GAMAN y Koala activos
4. Fase 3 (Playbook) — bajo esfuerzo, alto valor para cerrar ventas
5. Fase 4 (Brand) — cosmético, se puede paralelizar
6. Fase 5 (limpieza) — al final, sin apuro
