import { Router, type Request, type Response } from "express";
import { db, whatsappMessagesTable, contactsTable, leadsTable, dealsTable, activitiesTable, invoicesTable } from "@workspace/db";
import { eq, and, gte, count, sql, desc } from "drizzle-orm";
import { requireAuth, type JwtPayload } from "../lib/auth";

const router = Router();
type AuthReq = Request & { user: JwtPayload };

router.get("/analytics", requireAuth, async (req: Request, res: Response) => {
  const tenantId = (req as AuthReq).user.tenantId;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    const [
      contactRows,
      leadRows,
      dealRows,
      activityRows,
      invoiceRows,
      waRows,
    ] = await Promise.all([
      db.select({ total: count() }).from(contactsTable).where(eq(contactsTable.tenantId, tenantId)),
      db.select({ stage: leadsTable.stage, total: count() }).from(leadsTable).where(eq(leadsTable.tenantId, tenantId)).groupBy(leadsTable.stage),
      db.select({ stage: dealsTable.stage, value: dealsTable.value }).from(dealsTable).where(eq(dealsTable.tenantId, tenantId)),
      db.select({ type: activitiesTable.type, total: count() }).from(activitiesTable).where(eq(activitiesTable.tenantId, tenantId)).groupBy(activitiesTable.type),
      db.select({ status: invoicesTable.status, total: count(), amount: sql<number>`SUM(CAST(${invoicesTable.total} AS numeric))` }).from(invoicesTable).where(eq(invoicesTable.tenantId, tenantId)).groupBy(invoicesTable.status),
      db.select({ total: count() }).from(whatsappMessagesTable).where(and(eq(whatsappMessagesTable.tenantId, tenantId), gte(whatsappMessagesTable.createdAt, thirtyDaysAgo))),
    ]);

    const totalContacts = Number(contactRows[0]?.total ?? 0);
    const totalLeads = leadRows.reduce((s, r) => s + Number(r.total), 0);
    const totalDealValue = dealRows.reduce((s, d) => s + Number(d.value ?? 0), 0);
    const totalMessages30d = Number(waRows[0]?.total ?? 0);

    const leadsByStatus = leadRows.map(r => ({ status: r.stage, count: Number(r.total) }));
    const dealsByStage = Object.entries(
      dealRows.reduce((acc, d) => { const k = d.stage ?? "unknown"; acc[k] = (acc[k] ?? 0) + 1; return acc; }, {} as Record<string, number>)
    ).map(([stage, count]) => ({ stage, count }));

    const invoiceStats = invoiceRows.reduce((acc, r) => {
      acc[r.status ?? "unknown"] = { count: Number(r.total), amount: Number(r.amount ?? 0) };
      return acc;
    }, {} as Record<string, { count: number; amount: number }>);

    const activityBreakdown = activityRows.map(r => ({ type: r.type, count: Number(r.total) }));

    res.json({
      totalContacts,
      totalLeads,
      totalDealValue,
      totalMessages30d,
      leadsByStatus,
      dealsByStage,
      invoiceStats,
      activityBreakdown,
    });
  } catch (err) {
    req.log.error({ err }, "Analytics error");
    res.status(500).json({ error: "Error al obtener analytics" });
  }
});

export default router;
