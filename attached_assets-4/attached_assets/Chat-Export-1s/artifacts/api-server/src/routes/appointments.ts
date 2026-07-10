import { Router, type Request, type Response } from "express";
import crypto from "crypto";
import { db, appointmentsTable, scheduledMessagesTable } from "@workspace/db";
import { eq, and, desc, gte, lte, isNull, count } from "drizzle-orm";
import { requireAuth, type JwtPayload } from "../lib/auth";
import { normalizeArgPhone } from "../lib/phone";

const router = Router();
type AuthReq = Request & { user: JwtPayload };

router.get("/appointments", requireAuth, async (req: Request, res: Response) => {
  const tenantId = (req as AuthReq).user.tenantId;
  const { status, from, to, limit: limitParam, offset: offsetParam } = req.query as { status?: string; from?: string; to?: string; limit?: string; offset?: string };
  const limit = Math.min(Math.max(parseInt(limitParam ?? "50", 10) || 50, 1), 200);
  const offset = Math.max(parseInt(offsetParam ?? "0", 10) || 0, 0);

  const conditions = [eq(appointmentsTable.tenantId, tenantId), isNull(appointmentsTable.deletedAt)];
  if (status && status !== "all") conditions.push(eq(appointmentsTable.status, status));
  if (from) conditions.push(gte(appointmentsTable.scheduledAt, new Date(from)));
  if (to) conditions.push(lte(appointmentsTable.scheduledAt, new Date(to)));

  const [[{ total }], appointments] = await Promise.all([
    db.select({ total: count() }).from(appointmentsTable).where(and(...conditions)),
    db.select().from(appointmentsTable).where(and(...conditions))
      .orderBy(desc(appointmentsTable.scheduledAt))
      .limit(limit).offset(offset),
  ]);

  res.json({ appointments, total: Number(total), limit, offset, hasMore: offset + limit < Number(total) });
});

router.get("/appointments/stats", requireAuth, async (req: Request, res: Response) => {
  const tenantId = (req as AuthReq).user.tenantId;
  const all = await db.select({ status: appointmentsTable.status })
    .from(appointmentsTable).where(eq(appointmentsTable.tenantId, tenantId));

  res.json({
    stats: {
      total: all.length,
      pending: all.filter(a => a.status === "pending").length,
      confirmed: all.filter(a => a.status === "confirmed").length,
      completed: all.filter(a => a.status === "completed").length,
      cancelled: all.filter(a => a.status === "cancelled").length,
    },
  });
});

router.post("/appointments", requireAuth, async (req: Request, res: Response) => {
  const tenantId = (req as AuthReq).user.tenantId;
  const { contactName, contactPhone, contactEmail, serviceType, notes, scheduledAt, durationMinutes } = req.body as {
    contactName: string; contactPhone: string; contactEmail?: string;
    serviceType?: string; notes?: string; scheduledAt: string; durationMinutes?: number;
  };

  if (!contactName || !contactPhone || !scheduledAt) {
    res.status(400).json({ error: "Nombre, teléfono y fecha son requeridos" }); return;
  }

  const id = crypto.randomUUID();
  await db.insert(appointmentsTable).values({
    id, tenantId,
    contactName, contactPhone: normalizeArgPhone(contactPhone),
    contactEmail: contactEmail ?? null,
    serviceType: serviceType ?? "Consulta",
    notes: notes ?? "",
    scheduledAt: new Date(scheduledAt),
    durationMinutes: durationMinutes ?? 60,
    status: "pending",
  });

  const [appointment] = await db.select().from(appointmentsTable).where(eq(appointmentsTable.id, id)).limit(1);

  const reminderDate = new Date(new Date(scheduledAt).getTime() - 24 * 60 * 60 * 1000);
  if (reminderDate > new Date()) {
    await db.insert(scheduledMessagesTable).values({
      id: crypto.randomUUID(), tenantId,
      phoneNumber: normalizeArgPhone(contactPhone),
      contactName,
      message: `Hola ${contactName}! Te recordamos que tenés un turno mañana para *${serviceType ?? "Consulta"}*. ¿Confirmás tu asistencia? 📅`,
      scheduledAt: reminderDate,
      type: "appointment_reminder",
    });
  }

  res.json({ appointment });
});

router.patch("/appointments/:id", requireAuth, async (req: Request, res: Response) => {
  const tenantId = (req as AuthReq).user.tenantId;
  const id = String(req.params["id"]);
  const [existing] = await db.select({ id: appointmentsTable.id, tenantId: appointmentsTable.tenantId })
    .from(appointmentsTable).where(eq(appointmentsTable.id, id)).limit(1);

  if (!existing || existing.tenantId !== tenantId) {
    res.status(404).json({ error: "Turno no encontrado" }); return;
  }

  const { status, notes, scheduledAt, serviceType, contactName, contactPhone } = req.body as {
    status?: string; notes?: string; scheduledAt?: string;
    serviceType?: string; contactName?: string; contactPhone?: string;
  };

  const fields: Record<string, unknown> = {};
  if (status) fields.status = status;
  if (notes !== undefined) fields.notes = notes;
  if (scheduledAt) fields.scheduledAt = new Date(scheduledAt);
  if (serviceType) fields.serviceType = serviceType;
  if (contactName) fields.contactName = contactName;
  if (contactPhone) fields.contactPhone = normalizeArgPhone(contactPhone);

  await db.update(appointmentsTable).set(fields).where(eq(appointmentsTable.id, id));
  res.json({ ok: true });
});

router.delete("/appointments/:id", requireAuth, async (req: Request, res: Response) => {
  const tenantId = (req as AuthReq).user.tenantId;
  const id = String(req.params["id"]);
  const [existing] = await db.select({ tenantId: appointmentsTable.tenantId, contactPhone: appointmentsTable.contactPhone, scheduledAt: appointmentsTable.scheduledAt })
    .from(appointmentsTable).where(eq(appointmentsTable.id, id)).limit(1);

  if (!existing || existing.tenantId !== tenantId) {
    res.status(404).json({ error: "Turno no encontrado" }); return;
  }

  await db.update(appointmentsTable).set({ deletedAt: new Date() }).where(eq(appointmentsTable.id, id));

  // Cancel only the reminder for this specific appointment (matched by phone + 24h before the appointment time)
  const reminderDate = new Date(existing.scheduledAt.getTime() - 24 * 60 * 60 * 1000);
  await db.update(scheduledMessagesTable)
    .set({ cancelledAt: new Date(), status: "cancelled" })
    .where(and(
      eq(scheduledMessagesTable.tenantId, tenantId),
      eq(scheduledMessagesTable.type, "appointment_reminder"),
      eq(scheduledMessagesTable.phoneNumber, existing.contactPhone),
      eq(scheduledMessagesTable.scheduledAt, reminderDate),
    ));

  res.json({ ok: true });
});

export default router;
