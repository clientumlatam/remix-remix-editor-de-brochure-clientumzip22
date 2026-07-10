import { Router, type IRouter } from "express";
import { eq, ilike, and, or } from "drizzle-orm";
import { db, contactsTable } from "@workspace/db";
import { requireAuth } from "../lib/auth";
import type { JwtPayload } from "../lib/auth";
import type { Request } from "express";
import { z } from "zod";

const router: IRouter = Router();

const ContactInput = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  companyId: z.number().int().optional(),
  status: z.string().optional().default("prospect"),
  notes: z.string().optional(),
  cuit: z.string().optional(),
  condicionIva: z.string().optional(),
  razonSocial: z.string().optional(),
});

type AuthRequest = Request & { user: JwtPayload };

router.get("/contacts", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const search = req.query["search"] as string | undefined;
  const status = req.query["status"] as string | undefined;

  const conditions: ReturnType<typeof eq>[] = [eq(contactsTable.tenantId, tenantId)];
  if (search) {
    conditions.push(
      or(
        ilike(contactsTable.name, `%${search}%`),
        ilike(contactsTable.email, `%${search}%`),
        ilike(contactsTable.company, `%${search}%`),
      ) as ReturnType<typeof eq>,
    );
  }
  if (status) {
    conditions.push(eq(contactsTable.status, status));
  }

  const rows = await db
    .select()
    .from(contactsTable)
    .where(and(...conditions))
    .orderBy(contactsTable.createdAt);

  res.json(rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
});

router.post("/contacts", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const parsed = ContactInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [contact] = await db.insert(contactsTable).values({ ...parsed.data, tenantId }).returning();
  res.status(201).json({ ...contact, createdAt: contact.createdAt.toISOString() });
});

router.get("/contacts/:id", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [contact] = await db.select().from(contactsTable)
    .where(and(eq(contactsTable.id, id), eq(contactsTable.tenantId, tenantId)));

  if (!contact) { res.status(404).json({ error: "Contact not found" }); return; }
  res.json({ ...contact, createdAt: contact.createdAt.toISOString() });
});

router.patch("/contacts/:id", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = ContactInput.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [contact] = await db.update(contactsTable).set(parsed.data)
    .where(and(eq(contactsTable.id, id), eq(contactsTable.tenantId, tenantId))).returning();

  if (!contact) { res.status(404).json({ error: "Contact not found" }); return; }
  res.json({ ...contact, createdAt: contact.createdAt.toISOString() });
});

router.delete("/contacts/:id", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [contact] = await db.delete(contactsTable)
    .where(and(eq(contactsTable.id, id), eq(contactsTable.tenantId, tenantId))).returning();

  if (!contact) { res.status(404).json({ error: "Contact not found" }); return; }
  res.sendStatus(204);
});

export default router;
