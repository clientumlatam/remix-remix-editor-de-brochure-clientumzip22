import { Router, type IRouter } from "express";
import { eq, and, or, ilike, sql } from "drizzle-orm";
import { db, companiesTable, contactsTable } from "@workspace/db";
import { requireAuth } from "../lib/auth";
import type { JwtPayload } from "../lib/auth";
import type { Request } from "express";
import { z } from "zod";

const router: IRouter = Router();
type AuthRequest = Request & { user: JwtPayload };

const CompanyInput = z.object({
  name: z.string().min(1),
  industry: z.string().optional(),
  size: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  cuit: z.string().optional(),
  condicionIva: z.string().optional(),
  razonSocial: z.string().optional(),
  ingresosBrutos: z.string().optional(),
});

router.get("/companies", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const search = req.query["search"] as string | undefined;

  const conditions: ReturnType<typeof eq>[] = [eq(companiesTable.tenantId, tenantId)];
  if (search) {
    conditions.push(
      or(
        ilike(companiesTable.name, `%${search}%`),
        ilike(companiesTable.industry, `%${search}%`),
      ) as ReturnType<typeof eq>,
    );
  }

  const rows = await db
    .select({
      id: companiesTable.id,
      tenantId: companiesTable.tenantId,
      name: companiesTable.name,
      industry: companiesTable.industry,
      size: companiesTable.size,
      website: companiesTable.website,
      address: companiesTable.address,
      notes: companiesTable.notes,
      cuit: companiesTable.cuit,
      condicionIva: companiesTable.condicionIva,
      razonSocial: companiesTable.razonSocial,
      ingresosBrutos: companiesTable.ingresosBrutos,
      createdAt: companiesTable.createdAt,
      contactCount: sql<number>`(
        SELECT COUNT(*) FROM contacts
        WHERE contacts.company_id = ${companiesTable.id}
          AND contacts.tenant_id = ${tenantId}
      )`,
    })
    .from(companiesTable)
    .where(and(...conditions))
    .orderBy(companiesTable.name);

  res.json(rows.map((r) => ({ ...r, contactCount: Number(r.contactCount), createdAt: r.createdAt.toISOString() })));
});

router.post("/companies", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const parsed = CompanyInput.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [company] = await db.insert(companiesTable).values({ ...parsed.data, tenantId }).returning();
  res.status(201).json({ ...company, contactCount: 0, createdAt: company.createdAt.toISOString() });
});

router.get("/companies/:id", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [row] = await db
    .select({
      id: companiesTable.id,
      tenantId: companiesTable.tenantId,
      name: companiesTable.name,
      industry: companiesTable.industry,
      size: companiesTable.size,
      website: companiesTable.website,
      address: companiesTable.address,
      notes: companiesTable.notes,
      cuit: companiesTable.cuit,
      condicionIva: companiesTable.condicionIva,
      razonSocial: companiesTable.razonSocial,
      ingresosBrutos: companiesTable.ingresosBrutos,
      createdAt: companiesTable.createdAt,
      contactCount: sql<number>`(
        SELECT COUNT(*) FROM contacts
        WHERE contacts.company_id = ${companiesTable.id}
          AND contacts.tenant_id = ${tenantId}
      )`,
    })
    .from(companiesTable)
    .where(and(eq(companiesTable.id, id), eq(companiesTable.tenantId, tenantId)));

  if (!row) { res.status(404).json({ error: "Company not found" }); return; }
  res.json({ ...row, contactCount: Number(row.contactCount), createdAt: row.createdAt.toISOString() });
});

router.patch("/companies/:id", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = CompanyInput.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [company] = await db.update(companiesTable).set(parsed.data)
    .where(and(eq(companiesTable.id, id), eq(companiesTable.tenantId, tenantId))).returning();

  if (!company) { res.status(404).json({ error: "Company not found" }); return; }
  res.json({ ...company, contactCount: 0, createdAt: company.createdAt.toISOString() });
});

router.delete("/companies/:id", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [company] = await db.delete(companiesTable)
    .where(and(eq(companiesTable.id, id), eq(companiesTable.tenantId, tenantId))).returning();

  if (!company) { res.status(404).json({ error: "Company not found" }); return; }
  res.sendStatus(204);
});

export default router;
