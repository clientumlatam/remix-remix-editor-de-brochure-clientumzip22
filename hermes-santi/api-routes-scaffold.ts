// api-routes-scaffold.ts
// Rutas internas para que Hermes/Santi consuma AI Prospector.
// Usa los nombres de schema-reference.ts (leads, brochures, crmNotes).
// Si tu schema real tiene otros nombres de tabla/columna, es un find-and-replace
// de las referencias `leads.`, `brochures.`, `crmNotes.` de abajo.

import { Router } from 'express';
import { db } from '../db'; // tu instancia de Drizzle
import { leads, brochures, crmNotes } from './schema-reference'; // ajustar import a tu path real
import { eq, and } from 'drizzle-orm';

const router = Router();

// --- Middleware de API key para uso server-to-server (Hermes -> tu API) ---
export function requireApiKey(req: any, res: any, next: any) {
  const key = req.header('x-api-key');
  if (!key || key !== process.env.SANTI_API_KEY) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
}

// GET /api/leads?status=pendiente&limit=20
router.get('/leads', async (req, res) => {
  const status = (req.query.status as string) ?? 'pendiente';
  const limit = Number(req.query.limit) || 20;

  const rows = await db
    .select()
    .from(leads)
    .where(eq(leads.status, status))
    .limit(limit);

  res.json({ leads: rows });
});

// GET /api/leads/:id/brochure
router.get('/leads/:id/brochure', async (req, res) => {
  const { id } = req.params;

  const [brochure] = await db
    .select()
    .from(brochures)
    .where(eq(brochures.leadId, id))
    .limit(1);

  if (!brochure) return res.status(404).json({ error: 'brochure not found' });
  res.json({ brochure });
});

// PATCH /api/leads/:id  { status: "contactado" | "caliente" | "tibio" | "frio" | "agendado" }
router.patch('/leads/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pendiente', 'contactado', 'caliente', 'tibio', 'frio', 'agendado'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'invalid status' });
  }

  await db
    .update(leads)
    .set({ status, updatedAt: new Date() })
    .where(eq(leads.id, id));

  res.json({ ok: true, id, status });
});

// POST /api/leads/:id/notes  { summary: string }
router.post('/leads/:id/notes', async (req, res) => {
  const { id } = req.params;
  const { summary } = req.body;

  if (!summary) return res.status(400).json({ error: 'summary required' });

  await db.insert(crmNotes).values({
    leadId: id,
    summary,
    author: 'santi',
  });

  res.json({ ok: true, id });
});

export default router;

// --- Montaje en tu app principal ---
// import leadsRouter, { requireApiKey } from './api-routes-scaffold';
// app.use('/api', requireApiKey, leadsRouter);
//
// Variable de entorno necesaria:
// SANTI_API_KEY=<generar una key random larga, ej: openssl rand -hex 32>
