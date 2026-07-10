import { Router, type Request } from "express";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { db, tenantsTable, usersTable, contactsTable } from "@workspace/db";
import { requireAuth, hashPassword } from "../lib/auth";
import type { JwtPayload } from "../lib/auth";
import crypto from "crypto";

type AuthRequest = Request & { user: JwtPayload };

const router = Router();

const updateSettingsSchema = z.object({
  name: z.string().min(2).optional(),
  cuit: z.string().optional(),
  razonSocial: z.string().optional(),
  condicionIva: z.string().optional(),
  puntoVenta: z.coerce.number().int().positive().optional(),
  ingresosBrutos: z.string().optional(),
  domicilioFiscal: z.string().optional(),
  inicioActividades: z.string().optional(),
  emailContacto: z.string().email().optional().or(z.literal("")),
  telefono: z.string().optional(),
  sitioWeb: z.string().optional(),
});

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
});

/* GET /api/settings */
router.get("/settings", requireAuth, async (req, res): Promise<void> => {
  const { tenantId, userId } = (req as AuthRequest).user;

  const [tenant] = await db.select().from(tenantsTable).where(eq(tenantsTable.id, tenantId));
  const [user] = await db.select({
    id: usersTable.id,
    name: usersTable.name,
    email: usersTable.email,
    role: usersTable.role,
  }).from(usersTable).where(eq(usersTable.id, userId));

  if (!tenant || !user) { res.status(404).json({ error: "Not found" }); return; }

  const { webhookSecret: _, ...tenantPublic } = tenant;
  res.json({ tenant: tenantPublic, user });
});

/* PATCH /api/settings/tenant */
router.patch("/settings/tenant", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const parsed = updateSettingsSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Datos inválidos", details: parsed.error.issues }); return; }

  const [updated] = await db
    .update(tenantsTable)
    .set(parsed.data)
    .where(eq(tenantsTable.id, tenantId))
    .returning();

  const { webhookSecret: _, ...tenantPublic } = updated;
  res.json(tenantPublic);
});

/* PATCH /api/settings/profile */
router.patch("/settings/profile", requireAuth, async (req, res): Promise<void> => {
  const { userId } = (req as AuthRequest).user;
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Datos inválidos" }); return; }

  const [updated] = await db
    .update(usersTable)
    .set(parsed.data)
    .where(eq(usersTable.id, userId))
    .returning({ id: usersTable.id, name: usersTable.name, email: usersTable.email, role: usersTable.role });

  res.json(updated);
});

/* GET /api/settings/webhook — get (or auto-generate) the webhook secret */
router.get("/settings/webhook", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const [tenant] = await db.select().from(tenantsTable).where(eq(tenantsTable.id, tenantId));
  if (!tenant) { res.status(404).json({ error: "Tenant not found" }); return; }

  let secret = tenant.webhookSecret;
  if (!secret) {
    secret = crypto.randomBytes(32).toString("hex");
    await db.update(tenantsTable).set({ webhookSecret: secret }).where(eq(tenantsTable.id, tenantId));
  }

  res.json({ secret, hasSecret: true });
});

/* POST /api/settings/webhook/rotate — regenerate secret */
router.post("/settings/webhook/rotate", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const secret = crypto.randomBytes(32).toString("hex");
  await db.update(tenantsTable).set({ webhookSecret: secret }).where(eq(tenantsTable.id, tenantId));
  res.json({ secret, hasSecret: true });
});

/* GET /api/settings/ai — get AI config (key masked) */
router.get("/settings/ai", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const [tenant] = await db.select({ openrouterApiKey: tenantsTable.openrouterApiKey })
    .from(tenantsTable).where(eq(tenantsTable.id, tenantId));
  if (!tenant) { res.status(404).json({ error: "Not found" }); return; }
  const key = tenant.openrouterApiKey;
  res.json({
    hasApiKey: !!key,
    apiKeyPreview: key ? `sk-or-...${key.slice(-6)}` : null,
  });
});

/* PATCH /api/settings/ai — save or clear the OpenRouter API key */
router.patch("/settings/ai", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const parsed = z.object({ openrouterApiKey: z.string().nullable() }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Datos inválidos" }); return; }
  await db.update(tenantsTable)
    .set({ openrouterApiKey: parsed.data.openrouterApiKey })
    .where(eq(tenantsTable.id, tenantId));
  const key = parsed.data.openrouterApiKey;
  res.json({
    hasApiKey: !!key,
    apiKeyPreview: key ? `sk-or-...${key.slice(-6)}` : null,
  });
});

/* POST /api/settings/portal-password/:contactId — set portal password for a contact */
router.post("/settings/portal-password/:contactId", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const contactId = parseInt(String(req.params["contactId"] ?? ""));
  if (isNaN(contactId)) { res.status(400).json({ error: "Invalid contactId" }); return; }

  const schema = z.object({ password: z.string() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "password requerida" }); return; }

  const hash = parsed.data.password ? await hashPassword(parsed.data.password) : null;

  const [updated] = await db
    .update(contactsTable)
    .set({ portalPasswordHash: hash })
    .where(and(eq(contactsTable.id, contactId), eq(contactsTable.tenantId, tenantId)))
    .returning({
      id: contactsTable.id,
      name: contactsTable.name,
      portalPasswordHash: contactsTable.portalPasswordHash,
    });

  if (!updated) { res.status(404).json({ error: "Contacto no encontrado" }); return; }
  res.json({ id: updated.id, name: updated.name, hasPortalAccess: !!updated.portalPasswordHash });
});

export default router;
