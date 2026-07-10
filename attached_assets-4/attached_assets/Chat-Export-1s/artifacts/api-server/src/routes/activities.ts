import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, activitiesTable, contactsTable, dealsTable } from "@workspace/db";
import { requireAuth } from "../lib/auth";
import type { JwtPayload } from "../lib/auth";
import type { Request } from "express";
import { z } from "zod";

const router: IRouter = Router();
type AuthRequest = Request & { user: JwtPayload };

const ActivityInput = z.object({
  type: z.string().optional().default("task"),
  title: z.string().min(1),
  contactId: z.number().int().optional(),
  dealId: z.number().int().optional(),
  date: z.string().optional(),
  completed: z.boolean().optional().default(false),
  notes: z.string().optional(),
});

function formatActivity(activity: any, contact?: any, deal?: any) {
  return {
    ...activity,
    contactName: contact?.name ?? null,
    dealTitle: deal?.title ?? null,
    date: activity.date instanceof Date ? activity.date.toISOString() : activity.date,
    createdAt: activity.createdAt instanceof Date ? activity.createdAt.toISOString() : activity.createdAt,
  };
}

router.get("/activities", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const contactId = req.query["contactId"] ? parseInt(req.query["contactId"] as string) : undefined;
  const dealId = req.query["dealId"] ? parseInt(req.query["dealId"] as string) : undefined;

  let rows = await db.select().from(activitiesTable)
    .where(eq(activitiesTable.tenantId, tenantId))
    .orderBy(activitiesTable.date);

  if (contactId) rows = rows.filter(r => r.contactId === contactId);
  if (dealId) rows = rows.filter(r => r.dealId === dealId);

  const contactIds = [...new Set(rows.filter(r => r.contactId).map(r => r.contactId!))];
  const dealIds = [...new Set(rows.filter(r => r.dealId).map(r => r.dealId!))];

  const contacts = contactIds.length
    ? await db.select().from(contactsTable).where(eq(contactsTable.tenantId, tenantId))
        .then(r => r.filter(c => contactIds.includes(c.id)))
    : [];
  const deals = dealIds.length
    ? await db.select().from(dealsTable).where(eq(dealsTable.tenantId, tenantId))
        .then(r => r.filter(d => dealIds.includes(d.id)))
    : [];

  const results = rows.map(activity => {
    const contact = contacts.find(c => c.id === activity.contactId);
    const deal = deals.find(d => d.id === activity.dealId);
    return formatActivity(activity, contact, deal);
  });

  res.json(results);
});

router.post("/activities", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const parsed = ActivityInput.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const values: any = { ...parsed.data, tenantId };
  if (parsed.data.date) values.date = new Date(parsed.data.date);

  const [activity] = await db.insert(activitiesTable).values(values).returning();
  res.status(201).json(formatActivity(activity));
});

router.patch("/activities/:id", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = ActivityInput.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const values: any = { ...parsed.data };
  if (parsed.data.date) values.date = new Date(parsed.data.date);

  const [activity] = await db.update(activitiesTable).set(values)
    .where(and(eq(activitiesTable.id, id), eq(activitiesTable.tenantId, tenantId))).returning();

  if (!activity) { res.status(404).json({ error: "Activity not found" }); return; }
  res.json(formatActivity(activity));
});

router.delete("/activities/:id", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [activity] = await db.delete(activitiesTable)
    .where(and(eq(activitiesTable.id, id), eq(activitiesTable.tenantId, tenantId))).returning();

  if (!activity) { res.status(404).json({ error: "Activity not found" }); return; }
  res.sendStatus(204);
});

export default router;
