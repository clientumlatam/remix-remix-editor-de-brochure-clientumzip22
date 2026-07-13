---
name: Clientum services catalog raw source
description: Where the raw/master service catalog for the Clientum CRM product lives and how it's curated into the app's category taxonomy.
---

The GitHub repo `clientumlatam/nzip2` (a separate, WordPress+PHP based build of the same "Clientum" product, unrelated architecture to this repl) contains the raw master catalog at `attached_assets/csv/catalogo-completo-2147-servicios.csv` (~2147 AI-generated service rows: ID, Nombre, Categoría, Descripción, Precio ARS). It also has smaller/older exports (`woocommerce-*-productos*.csv`) that are earlier snapshots of the same source, not a superset.

**Why this matters:** this repl's `src/data/servicios-catalogo.json` (feeding `crmInitialData.ts` → CRM Productos + Casos de Uso screens) is derived from that raw catalog, not hand-written. If asked to expand/refresh/re-curate the catalog, go back to the 2147-row source rather than editing the derived JSON by hand.

**Curation rule applied:** drop whole categories outside Clientum's real software stack (seen so far: Ciberseguridad, Soluciones por Industria, Plataformas de Comunicación), dedupe by normalized name, then remap the remaining raw categories (ERP y CRM, Desarrollo Web y E-Commerce, Aplicaciones Móviles, Business Intelligence, Atención al Cliente, Formación y Capacitación, Automatización de Procesos, Cloud Computing + Servicios de Hosting, Marketing Digital) into Clientum's clean taxonomy (ERP, CRM, Desarrollo Web, E-Commerce, Business Intelligence, Inteligencia Artificial, Soporte, Consultoría, Capacitación, Automatización, Hosting e Infraestructura, Marketing Digital) via keyword splits (e.g. CRM/ecommerce/IA/consultoría keyword lists).

**How to apply:** re-running this pipeline on the full 2147 source yields ~1367 curated items (vs. an earlier smaller intermediate curation that landed at 447) — the raw source is not fully deduped, so counts vary by dedup strictness.
