import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, dealsTable, contactsTable, companiesTable } from "@workspace/db";
import { requireAuth } from "../lib/auth";
import type { JwtPayload } from "../lib/auth";
import type { Request } from "express";
import { z } from "zod";

const router: IRouter = Router();
type AuthRequest = Request & { user: JwtPayload };

const DealInput = z.object({
  title: z.string().min(1),
  contactId: z.number().int().optional(),
  companyId: z.number().int().optional(),
  stage: z.string().optional().default("discovery"),
  value: z.number().optional().default(0),
  probability: z.number().optional(),
  expectedCloseDate: z.string().optional(),
  notes: z.string().optional(),
});

function formatDeal(deal: any, contact?: any, company?: any) {
  return {
    ...deal,
    contactName: contact?.name ?? null,
    companyName: company?.name ?? null,
    createdAt: deal.createdAt instanceof Date ? deal.createdAt.toISOString() : deal.createdAt,
  };
}

router.get("/deals", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const stage = req.query["stage"] as string | undefined;

  const rows = await db.select().from(dealsTable)
    .where(eq(dealsTable.tenantId, tenantId))
    .orderBy(dealsTable.createdAt);

  const contactIds = [...new Set(rows.filter(r => r.contactId).map(r => r.contactId!))];
  const companyIds = [...new Set(rows.filter(r => r.companyId).map(r => r.companyId!))];

  const contacts = contactIds.length
    ? await db.select().from(contactsTable).where(eq(contactsTable.tenantId, tenantId))
        .then(r => r.filter(c => contactIds.includes(c.id)))
    : [];
  const companies = companyIds.length
    ? await db.select().from(companiesTable).where(eq(companiesTable.tenantId, tenantId))
        .then(r => r.filter(c => companyIds.includes(c.id)))
    : [];

  let results = rows.map(deal => {
    const contact = contacts.find(c => c.id === deal.contactId);
    const company = companies.find(c => c.id === deal.companyId);
    return formatDeal(deal, contact, company);
  });

  if (stage) results = results.filter(r => r.stage === stage);
  res.json(results);
});

router.post("/deals", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const parsed = DealInput.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [deal] = await db.insert(dealsTable).values({ ...parsed.data, tenantId }).returning();
  res.status(201).json(formatDeal(deal));
});

router.get("/deals/:id", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [deal] = await db.select().from(dealsTable)
    .where(and(eq(dealsTable.id, id), eq(dealsTable.tenantId, tenantId)));
  if (!deal) { res.status(404).json({ error: "Deal not found" }); return; }

  const contact = deal.contactId
    ? (await db.select().from(contactsTable).where(and(eq(contactsTable.id, deal.contactId), eq(contactsTable.tenantId, tenantId))))[0]
    : undefined;
  const company = deal.companyId
    ? (await db.select().from(companiesTable).where(and(eq(companiesTable.id, deal.companyId), eq(companiesTable.tenantId, tenantId))))[0]
    : undefined;

  res.json(formatDeal(deal, contact, company));
});

router.patch("/deals/:id", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = DealInput.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [deal] = await db.update(dealsTable).set(parsed.data)
    .where(and(eq(dealsTable.id, id), eq(dealsTable.tenantId, tenantId))).returning();

  if (!deal) { res.status(404).json({ error: "Deal not found" }); return; }
  res.json(formatDeal(deal));
});

router.delete("/deals/:id", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [deal] = await db.delete(dealsTable)
    .where(and(eq(dealsTable.id, id), eq(dealsTable.tenantId, tenantId))).returning();
  if (!deal) { res.status(404).json({ error: "Deal not found" }); return; }
  res.sendStatus(204);
});

export default router;
