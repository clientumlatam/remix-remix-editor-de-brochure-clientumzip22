import { Router, type IRouter } from "express";
import { eq, and, inArray } from "drizzle-orm";
import { db, invoicesTable, contactsTable, companiesTable } from "@workspace/db";
import { requireAuth } from "../lib/auth";
import type { JwtPayload } from "../lib/auth";
import type { Request } from "express";
import { z } from "zod";

const router: IRouter = Router();
type AuthRequest = Request & { user: JwtPayload };

const InvoiceItemSchema = z.object({
  description: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  total: z.number(),
});

const InvoiceInput = z.object({
  contactId: z.number().int(),
  companyId: z.number().int().optional(),
  status: z.string().optional().default("draft"),
  items: z.array(InvoiceItemSchema).optional().default([]),
  tax: z.number().optional().default(0),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  cae: z.string().optional(),
  caeFechaVencimiento: z.string().optional(),
  tipoComprobante: z.string().optional(),
  puntoVenta: z.number().int().optional(),
});

async function nextInvoiceNumber(tenantId: number): Promise<string> {
  const rows = await db.select({ number: invoicesTable.number })
    .from(invoicesTable)
    .where(eq(invoicesTable.tenantId, tenantId));
  const max = rows.reduce((m, r) => {
    const n = parseInt(r.number.replace("INV-", ""), 10);
    return isNaN(n) ? m : Math.max(m, n);
  }, 1000);
  return `INV-${max + 1}`;
}

function computeSubtotal(items: Array<{ quantity: number; unitPrice: number; total: number }>) {
  return items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
}

function formatInvoice(invoice: any, contact?: any, company?: any) {
  return {
    ...invoice,
    contactName: contact?.name ?? null,
    companyName: company?.name ?? null,
    items: Array.isArray(invoice.items) ? invoice.items : [],
    createdAt: invoice.createdAt instanceof Date ? invoice.createdAt.toISOString() : invoice.createdAt,
  };
}

router.get("/invoices", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const status = req.query["status"] as string | undefined;

  let rows = await db.select().from(invoicesTable)
    .where(eq(invoicesTable.tenantId, tenantId))
    .orderBy(invoicesTable.createdAt);

  if (status) rows = rows.filter(r => r.status === status);

  const contactIds = [...new Set(rows.map(r => r.contactId))];
  const companyIds = [...new Set(rows.filter(r => r.companyId).map(r => r.companyId!))];

  const contacts = contactIds.length
    ? await db.select().from(contactsTable).where(and(eq(contactsTable.tenantId, tenantId), inArray(contactsTable.id, contactIds)))
    : [];
  const companies = companyIds.length
    ? await db.select().from(companiesTable).where(and(eq(companiesTable.tenantId, tenantId), inArray(companiesTable.id, companyIds)))
    : [];

  const results = rows.map(invoice => {
    const contact = contacts.find(c => c.id === invoice.contactId);
    const company = companies.find(c => c.id === invoice.companyId);
    return formatInvoice(invoice, contact, company);
  });

  res.json(results);
});

router.post("/invoices", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const parsed = InvoiceInput.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const items = parsed.data.items ?? [];
  const subtotal = computeSubtotal(items);
  const tax = parsed.data.tax ?? 0;
  const total = subtotal + tax;
  const number = await nextInvoiceNumber(tenantId);

  const [invoice] = await db.insert(invoicesTable)
    .values({ ...parsed.data, number, items, subtotal, total, tenantId })
    .returning();

  res.status(201).json(formatInvoice(invoice));
});

router.get("/invoices/:id", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [invoice] = await db.select().from(invoicesTable)
    .where(and(eq(invoicesTable.id, id), eq(invoicesTable.tenantId, tenantId)));
  if (!invoice) { res.status(404).json({ error: "Invoice not found" }); return; }

  const contact = (await db.select().from(contactsTable)
    .where(and(eq(contactsTable.id, invoice.contactId), eq(contactsTable.tenantId, tenantId))))[0];
  const company = invoice.companyId
    ? (await db.select().from(companiesTable).where(and(eq(companiesTable.id, invoice.companyId), eq(companiesTable.tenantId, tenantId))))[0]
    : undefined;

  res.json(formatInvoice(invoice, contact, company));
});

router.patch("/invoices/:id", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = InvoiceInput.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const updateData: any = { ...parsed.data };
  if (parsed.data.items) {
    const subtotal = computeSubtotal(parsed.data.items);
    const tax = parsed.data.tax ?? 0;
    updateData.subtotal = subtotal;
    updateData.total = subtotal + tax;
  }

  const [invoice] = await db.update(invoicesTable).set(updateData)
    .where(and(eq(invoicesTable.id, id), eq(invoicesTable.tenantId, tenantId))).returning();

  if (!invoice) { res.status(404).json({ error: "Invoice not found" }); return; }
  res.json(formatInvoice(invoice));
});

router.delete("/invoices/:id", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [invoice] = await db.delete(invoicesTable)
    .where(and(eq(invoicesTable.id, id), eq(invoicesTable.tenantId, tenantId))).returning();
  if (!invoice) { res.status(404).json({ error: "Invoice not found" }); return; }
  res.sendStatus(204);
});

export default router;
