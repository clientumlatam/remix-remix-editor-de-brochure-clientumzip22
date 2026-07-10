import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, quotesTable, contactsTable, companiesTable } from "@workspace/db";
import { requireAuth } from "../lib/auth";
import type { JwtPayload } from "../lib/auth";
import type { Request } from "express";
import { z } from "zod";

const router: IRouter = Router();
type AuthRequest = Request & { user: JwtPayload };

const QuoteItemSchema = z.object({
  productId: z.number().int().optional(),
  name: z.string(),
  description: z.string().optional(),
  quantity: z.number(),
  unitPrice: z.number(),
  total: z.number(),
});

const QuoteInput = z.object({
  contactId: z.number().int().optional(),
  companyId: z.number().int().optional(),
  title: z.string().min(1),
  status: z.string().optional().default("draft"),
  items: z.array(QuoteItemSchema).optional().default([]),
  discount: z.number().optional().default(0),
  validUntil: z.string().optional(),
  notes: z.string().optional(),
});

async function nextQuoteNumber(tenantId: number): Promise<string> {
  const rows = await db.select({ number: quotesTable.number })
    .from(quotesTable)
    .where(eq(quotesTable.tenantId, tenantId));
  const max = rows.reduce((m, r) => {
    const n = parseInt(r.number.replace("QUOT-", ""), 10);
    return isNaN(n) ? m : Math.max(m, n);
  }, 1000);
  return `QUOT-${max + 1}`;
}

function computeSubtotal(items: Array<{ quantity: number; unitPrice: number }>) {
  return items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
}

function formatQuote(quote: any, contact?: any, company?: any) {
  return {
    ...quote,
    contactName: contact?.name ?? null,
    companyName: company?.name ?? null,
    items: Array.isArray(quote.items) ? quote.items : [],
    createdAt: quote.createdAt instanceof Date ? quote.createdAt.toISOString() : quote.createdAt,
    updatedAt: quote.updatedAt instanceof Date ? quote.updatedAt.toISOString() : quote.updatedAt,
  };
}

router.get("/quotes", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const status = req.query["status"] as string | undefined;

  let rows = await db.select().from(quotesTable)
    .where(eq(quotesTable.tenantId, tenantId))
    .orderBy(quotesTable.createdAt);

  if (status) rows = rows.filter(r => r.status === status);

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

  const results = rows.map(quote => {
    const contact = contacts.find(c => c.id === quote.contactId);
    const company = companies.find(c => c.id === quote.companyId);
    return formatQuote(quote, contact, company);
  });

  res.json(results);
});

router.post("/quotes", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const parsed = QuoteInput.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const items = parsed.data.items ?? [];
  const subtotal = computeSubtotal(items);
  const discount = parsed.data.discount ?? 0;
  const total = subtotal - discount;
  const number = await nextQuoteNumber(tenantId);

  const [quote] = await db.insert(quotesTable)
    .values({ ...parsed.data, number, items, subtotal, discount, total, tenantId })
    .returning();

  res.status(201).json(formatQuote(quote));
});

router.get("/quotes/:id", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [quote] = await db.select().from(quotesTable)
    .where(and(eq(quotesTable.id, id), eq(quotesTable.tenantId, tenantId)));
  if (!quote) { res.status(404).json({ error: "Quote not found" }); return; }

  const contact = quote.contactId
    ? (await db.select().from(contactsTable).where(and(eq(contactsTable.id, quote.contactId), eq(contactsTable.tenantId, tenantId))))[0]
    : undefined;
  const company = quote.companyId
    ? (await db.select().from(companiesTable).where(and(eq(companiesTable.id, quote.companyId), eq(companiesTable.tenantId, tenantId))))[0]
    : undefined;

  res.json(formatQuote(quote, contact, company));
});

router.patch("/quotes/:id", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = QuoteInput.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const updateData: any = { ...parsed.data };
  if (parsed.data.items !== undefined) {
    const subtotal = computeSubtotal(parsed.data.items);
    const discount = parsed.data.discount ?? 0;
    updateData.subtotal = subtotal;
    updateData.total = subtotal - discount;
  }

  const [quote] = await db.update(quotesTable).set(updateData)
    .where(and(eq(quotesTable.id, id), eq(quotesTable.tenantId, tenantId))).returning();

  if (!quote) { res.status(404).json({ error: "Quote not found" }); return; }
  res.json(formatQuote(quote));
});

router.delete("/quotes/:id", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [quote] = await db.delete(quotesTable)
    .where(and(eq(quotesTable.id, id), eq(quotesTable.tenantId, tenantId))).returning();
  if (!quote) { res.status(404).json({ error: "Quote not found" }); return; }
  res.sendStatus(204);
});

export default router;
