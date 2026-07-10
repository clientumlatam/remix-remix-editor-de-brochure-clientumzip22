import { Router, type IRouter } from "express";
import { db, contactsTable, leadsTable, dealsTable, activitiesTable, invoicesTable } from "@workspace/db";
import { sql, gte, eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import type { JwtPayload } from "../lib/auth";
import type { Request } from "express";

const router: IRouter = Router();
type AuthRequest = Request & { user: JwtPayload };

router.get("/dashboard/stats", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);

  const [contacts, leads, deals, invoices, newContacts, weekActivities] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(contactsTable).where(eq(contactsTable.tenantId, tenantId)),
    db.select({ count: sql<number>`count(*)` }).from(leadsTable).where(eq(leadsTable.tenantId, tenantId)),
    db.select({ count: sql<number>`count(*)`, value: sql<number>`sum(value)` }).from(dealsTable).where(eq(dealsTable.tenantId, tenantId)),
    db.select({ total: sql<number>`sum(total)` }).from(invoicesTable)
      .where(sql`status = 'paid' AND tenant_id = ${tenantId}`),
    db.select({ count: sql<number>`count(*)` }).from(contactsTable)
      .where(sql`tenant_id = ${tenantId} AND created_at >= ${startOfMonth}`),
    db.select({ count: sql<number>`count(*)` }).from(activitiesTable)
      .where(sql`tenant_id = ${tenantId} AND date >= ${startOfWeek}`),
  ]);

  const totalLeads = Number(leads[0]?.count ?? 0);
  const totalDeals = Number(deals[0]?.count ?? 0);

  const wonDeals = await db
    .select({ count: sql<number>`count(*)`, value: sql<number>`sum(value)` })
    .from(dealsTable)
    .where(sql`stage = 'closed_won' AND tenant_id = ${tenantId}`);

  const openDeals = await db
    .select({ value: sql<number>`sum(value)` })
    .from(dealsTable)
    .where(sql`stage NOT IN ('closed_won', 'closed_lost') AND tenant_id = ${tenantId}`);

  const wonCount = Number(wonDeals[0]?.count ?? 0);
  const conversionRate = totalDeals > 0 ? Math.round((wonCount / totalDeals) * 100) : 0;

  res.json({
    totalContacts: Number(contacts[0]?.count ?? 0),
    totalLeads: totalLeads,
    totalDeals: totalDeals,
    totalRevenue: Number(invoices[0]?.total ?? 0),
    openDealsValue: Number(openDeals[0]?.value ?? 0),
    conversionRate,
    newContactsThisMonth: Number(newContacts[0]?.count ?? 0),
    activitiesThisWeek: Number(weekActivities[0]?.count ?? 0),
  });
});

router.get("/dashboard/pipeline", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const stages = ["discovery", "proposal", "negotiation", "contract", "closed_won", "closed_lost"];

  const rows = await db
    .select({
      stage: dealsTable.stage,
      count: sql<number>`count(*)`,
      value: sql<number>`sum(value)`,
    })
    .from(dealsTable)
    .where(eq(dealsTable.tenantId, tenantId))
    .groupBy(dealsTable.stage);

  const stageMap = new Map(rows.map(r => [r.stage, r]));
  const result = stages.map(stage => ({
    stage,
    count: Number(stageMap.get(stage)?.count ?? 0),
    value: Number(stageMap.get(stage)?.value ?? 0),
  }));

  res.json(result);
});

router.get("/dashboard/recent-activities", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;

  const rows = await db
    .select({
      id: activitiesTable.id,
      tenantId: activitiesTable.tenantId,
      type: activitiesTable.type,
      title: activitiesTable.title,
      contactId: activitiesTable.contactId,
      dealId: activitiesTable.dealId,
      date: activitiesTable.date,
      completed: activitiesTable.completed,
      notes: activitiesTable.notes,
      createdAt: activitiesTable.createdAt,
      updatedAt: activitiesTable.updatedAt,
      contactName: contactsTable.name,
      dealTitle: dealsTable.title,
    })
    .from(activitiesTable)
    .leftJoin(contactsTable, eq(activitiesTable.contactId, contactsTable.id))
    .leftJoin(dealsTable, eq(activitiesTable.dealId, dealsTable.id))
    .where(eq(activitiesTable.tenantId, tenantId))
    .orderBy(sql`${activitiesTable.date} DESC`)
    .limit(10);

  const results = rows.map(a => ({
    ...a,
    contactName: a.contactId ? a.contactName : null,
    date: a.date instanceof Date ? a.date.toISOString() : a.date,
    createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : a.createdAt,
  }));

  res.json(results);
});

export default router;
