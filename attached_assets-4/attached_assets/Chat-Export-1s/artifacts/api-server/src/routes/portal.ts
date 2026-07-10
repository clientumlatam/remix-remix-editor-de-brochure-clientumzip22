/**
 * Portal de clientes — rutas públicas para el acceso de contactos.
 *
 * POST /api/portal/login        — email + password → JWT de portal
 * GET  /api/portal/me           — datos del contacto autenticado
 * GET  /api/portal/invoices     — facturas propias (tenantId + contactId)
 * GET  /api/portal/deals        — deals propios
 * POST /api/portal/logout       — sin estado, sólo documentación
 *
 * Portal JWT payload: { contactId, tenantId, email, iss: "portal" }
 */
import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db, contactsTable, invoicesTable, dealsTable } from "@workspace/db";
import { comparePassword } from "../lib/auth";
import jwt from "jsonwebtoken";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";

const router = Router();

const JWT_SECRET = process.env["JWT_SECRET"] ?? "clientum-dev-secret-change-in-production";

/* ── Portal JWT ─────────────────────────────────────────────────────── */
interface PortalPayload {
  contactId: number;
  tenantId: number;
  email: string;
  iss: string;
}

function signPortalToken(payload: Omit<PortalPayload, "iss">): string {
  return jwt.sign({ ...payload, iss: "portal" }, JWT_SECRET, { expiresIn: "24h" });
}

function requirePortalAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers["authorization"];
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as PortalPayload;
    if (payload.iss !== "portal") throw new Error("wrong issuer");
    (req as Request & { portal: PortalPayload }).portal = payload;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
}

type PortalRequest = Request & { portal: PortalPayload };

/* ── POST /api/portal/login ─────────────────────────────────────────── */
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/portal/login", async (req, res): Promise<void> => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Email y contraseña requeridos" });
    return;
  }
  const { email, password } = parsed.data;

  /* Find contact by email (across all tenants — email must be unique per tenant) */
  const contacts = await db
    .select()
    .from(contactsTable)
    .where(eq(contactsTable.email, email));

  /* Find one that has a portal password set */
  let matched: (typeof contacts)[0] | undefined;
  for (const c of contacts) {
    if (c.portalPasswordHash && (await comparePassword(password, c.portalPasswordHash))) {
      matched = c;
      break;
    }
  }

  if (!matched) {
    res.status(401).json({ error: "Credenciales incorrectas" });
    return;
  }

  const token = signPortalToken({
    contactId: matched.id,
    tenantId: matched.tenantId,
    email: matched.email,
  });

  res.json({
    token,
    contact: {
      id: matched.id,
      name: matched.name,
      email: matched.email,
      phone: matched.phone,
      company: matched.company,
    },
  });
});

/* ── GET /api/portal/me ─────────────────────────────────────────────── */
router.get("/portal/me", requirePortalAuth, async (req, res): Promise<void> => {
  const { contactId, tenantId } = (req as PortalRequest).portal;

  const [contact] = await db
    .select({
      id: contactsTable.id,
      name: contactsTable.name,
      email: contactsTable.email,
      phone: contactsTable.phone,
      company: contactsTable.company,
      status: contactsTable.status,
    })
    .from(contactsTable)
    .where(and(eq(contactsTable.id, contactId), eq(contactsTable.tenantId, tenantId)));

  if (!contact) { res.status(404).json({ error: "Contacto no encontrado" }); return; }
  res.json(contact);
});

/* ── GET /api/portal/invoices ───────────────────────────────────────── */
router.get("/portal/invoices", requirePortalAuth, async (req, res): Promise<void> => {
  const { contactId, tenantId } = (req as PortalRequest).portal;

  const rows = await db
    .select()
    .from(invoicesTable)
    .where(and(eq(invoicesTable.contactId, contactId), eq(invoicesTable.tenantId, tenantId)))
    .orderBy(invoicesTable.createdAt);

  res.json(rows.map(inv => ({
    ...inv,
    createdAt: inv.createdAt instanceof Date ? inv.createdAt.toISOString() : inv.createdAt,
  })));
});

/* ── GET /api/portal/deals ──────────────────────────────────────────── */
router.get("/portal/deals", requirePortalAuth, async (req, res): Promise<void> => {
  const { contactId, tenantId } = (req as PortalRequest).portal;

  const rows = await db
    .select()
    .from(dealsTable)
    .where(and(eq(dealsTable.contactId, contactId), eq(dealsTable.tenantId, tenantId)))
    .orderBy(dealsTable.createdAt);

  res.json(rows.map(d => ({
    ...d,
    createdAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : d.createdAt,
  })));
});

export default router;
