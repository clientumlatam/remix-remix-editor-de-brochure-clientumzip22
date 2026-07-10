import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, leadsTable, contactsTable, companiesTable } from "@workspace/db";
import { requireAuth } from "../lib/auth";
import type { JwtPayload } from "../lib/auth";
import type { Request } from "express";
import { z } from "zod";

const router: IRouter = Router();
type AuthRequest = Request & { user: JwtPayload };

const LeadInput = z.object({
  title: z.string().min(1),
  contactId: z.number().int().optional(),
  companyId: z.number().int().optional(),
  stage: z.string().optional().default("new"),
  value: z.number().optional().default(0),
  source: z.string().optional(),
  notes: z.string().optional(),
});

function formatLead(lead: any, contact?: any, company?: any) {
  return {
    ...lead,
    contactName: contact?.name ?? null,
    companyName: company?.name ?? null,
    createdAt: lead.createdAt instanceof Date ? lead.createdAt.toISOString() : lead.createdAt,
  };
}

router.get("/leads", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const stage = req.query["stage"] as string | undefined;
  const search = req.query["search"] as string | undefined;

  const rows = await db.select().from(leadsTable)
    .where(eq(leadsTable.tenantId, tenantId))
    .orderBy(leadsTable.createdAt);

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

  let results = rows.map(lead => {
    const contact = contacts.find(c => c.id === lead.contactId);
    const company = companies.find(c => c.id === lead.companyId);
    return formatLead(lead, contact, company);
  });

  if (stage) results = results.filter(r => r.stage === stage);
  if (search) {
    const s = search.toLowerCase();
    results = results.filter(r => r.title.toLowerCase().includes(s));
  }

  res.json(results);
});

router.post("/leads", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const parsed = LeadInput.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [lead] = await db.insert(leadsTable).values({ ...parsed.data, tenantId }).returning();
  res.status(201).json(formatLead(lead));
});

router.get("/leads/:id", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [lead] = await db.select().from(leadsTable)
    .where(and(eq(leadsTable.id, id), eq(leadsTable.tenantId, tenantId)));
  if (!lead) { res.status(404).json({ error: "Lead not found" }); return; }

  const contact = lead.contactId
    ? (await db.select().from(contactsTable).where(and(eq(contactsTable.id, lead.contactId), eq(contactsTable.tenantId, tenantId))))[0]
    : undefined;
  const company = lead.companyId
    ? (await db.select().from(companiesTable).where(and(eq(companiesTable.id, lead.companyId), eq(companiesTable.tenantId, tenantId))))[0]
    : undefined;

  res.json(formatLead(lead, contact, company));
});

router.patch("/leads/:id", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = LeadInput.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [lead] = await db.update(leadsTable).set(parsed.data)
    .where(and(eq(leadsTable.id, id), eq(leadsTable.tenantId, tenantId))).returning();

  if (!lead) { res.status(404).json({ error: "Lead not found" }); return; }
  res.json(formatLead(lead));
});

router.delete("/leads/:id", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [lead] = await db.delete(leadsTable)
    .where(and(eq(leadsTable.id, id), eq(leadsTable.tenantId, tenantId))).returning();
  if (!lead) { res.status(404).json({ error: "Lead not found" }); return; }
  res.sendStatus(204);
});

export default router;
