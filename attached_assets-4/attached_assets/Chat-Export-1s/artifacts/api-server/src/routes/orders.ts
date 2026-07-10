import { Router, type Request, type Response } from "express";
import crypto from "crypto";
import { db, ordersTable, orderItemsTable, orderStatusHistoryTable } from "@workspace/db";
import { eq, and, desc, isNull, count, inArray } from "drizzle-orm";
import { requireAuth, type JwtPayload } from "../lib/auth";
import { normalizeArgPhone } from "../lib/phone";

const router = Router();
type AuthReq = Request & { user: JwtPayload };

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente", confirmed: "Confirmado", preparing: "En preparación",
  shipped: "En camino", delivered: "Entregado", cancelled: "Cancelado",
};

router.get("/orders", requireAuth, async (req: Request, res: Response) => {
  const tenantId = (req as AuthReq).user.tenantId;
  const { status, limit: limitParam, offset: offsetParam } = req.query as { status?: string; limit?: string; offset?: string };
  const limit = Math.min(Math.max(parseInt(limitParam ?? "50", 10) || 50, 1), 200);
  const offset = Math.max(parseInt(offsetParam ?? "0", 10) || 0, 0);

  const conditions = [eq(ordersTable.tenantId, tenantId), isNull(ordersTable.deletedAt)];
  if (status && status !== "all") conditions.push(eq(ordersTable.status, status));

  const [[{ total }], orders] = await Promise.all([
    db.select({ total: count() }).from(ordersTable).where(and(...conditions)),
    db.select().from(ordersTable).where(and(...conditions))
      .orderBy(desc(ordersTable.createdAt)).limit(limit).offset(offset),
  ]);

  const orderIds = orders.map(o => o.id);
  const allItems = orderIds.length
    ? await db.select().from(orderItemsTable).where(inArray(orderItemsTable.orderId, orderIds))
    : [];

  const itemsByOrder = new Map<string, typeof allItems>();
  for (const item of allItems) {
    const list = itemsByOrder.get(item.orderId) ?? [];
    list.push(item);
    itemsByOrder.set(item.orderId, list);
  }

  const ordersWithItems = orders.map(order => ({ ...order, items: itemsByOrder.get(order.id) ?? [] }));

  res.json({ orders: ordersWithItems, total: Number(total) });
});

router.get("/orders/stats", requireAuth, async (req: Request, res: Response) => {
  const tenantId = (req as AuthReq).user.tenantId;
  const all = await db.select({ status: ordersTable.status, totalAmount: ordersTable.totalAmount })
    .from(ordersTable).where(eq(ordersTable.tenantId, tenantId));

  res.json({
    stats: {
      total: all.length,
      pending: all.filter(o => o.status === "pending").length,
      confirmed: all.filter(o => o.status === "confirmed").length,
      preparing: all.filter(o => o.status === "preparing").length,
      shipped: all.filter(o => o.status === "shipped").length,
      delivered: all.filter(o => o.status === "delivered").length,
      cancelled: all.filter(o => o.status === "cancelled").length,
      revenue: all.filter(o => o.status === "delivered").reduce((s, o) => s + (o.totalAmount ?? 0), 0),
    },
  });
});

router.get("/orders/:id", requireAuth, async (req: Request, res: Response) => {
  const tenantId = (req as AuthReq).user.tenantId;
  const id = String(req.params["id"]);
  const [order] = await db.select().from(ordersTable).where(and(eq(ordersTable.id, id), eq(ordersTable.tenantId, tenantId))).limit(1);
  if (!order) { res.status(404).json({ error: "Pedido no encontrado" }); return; }

  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, id));
  const history = await db.select().from(orderStatusHistoryTable).where(eq(orderStatusHistoryTable.orderId, id)).orderBy(orderStatusHistoryTable.createdAt);
  res.json({ order: { ...order, items, history } });
});

router.post("/orders", requireAuth, async (req: Request, res: Response) => {
  const tenantId = (req as AuthReq).user.tenantId;
  const { contactName, contactPhone, contactEmail, notes, deliveryAddress, channel, items } = req.body as {
    contactName: string; contactPhone: string; contactEmail?: string;
    notes?: string; deliveryAddress?: string; channel?: string;
    items?: { productName: string; quantity: number; unitPrice: number; notes?: string }[];
  };

  if (!contactName || !contactPhone) {
    res.status(400).json({ error: "Nombre y teléfono son requeridos" }); return;
  }

  const orderId = crypto.randomUUID();
  const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;
  const orderItems = items ?? [];
  const totalAmount = orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  await db.transaction(async (tx) => {
    await tx.insert(ordersTable).values({
      id: orderId, tenantId, orderNumber,
      contactName, contactPhone: normalizeArgPhone(contactPhone),
      contactEmail: contactEmail ?? null,
      notes: notes ?? "", deliveryAddress: deliveryAddress ?? "",
      channel: channel ?? "manual", totalAmount, status: "pending",
    });

    for (const item of orderItems) {
      await tx.insert(orderItemsTable).values({
        id: crypto.randomUUID(), orderId,
        productName: item.productName, quantity: item.quantity,
        unitPrice: item.unitPrice, totalPrice: item.unitPrice * item.quantity,
        notes: item.notes ?? "",
      });
    }

    await tx.insert(orderStatusHistoryTable).values({
      id: crypto.randomUUID(), orderId, fromStatus: "", toStatus: "pending", note: "Pedido creado",
    });
  });

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId)).limit(1);
  res.json({ order });
});

router.patch("/orders/:id/status", requireAuth, async (req: Request, res: Response) => {
  const tenantId = (req as AuthReq).user.tenantId;
  const id = String(req.params["id"]);
  const [existing] = await db.select().from(ordersTable).where(eq(ordersTable.id, id)).limit(1);

  if (!existing || existing.tenantId !== tenantId) {
    res.status(404).json({ error: "Pedido no encontrado" }); return;
  }

  const { status, note } = req.body as { status: string; note?: string };
  if (!status) { res.status(400).json({ error: "Estado requerido" }); return; }

  await db.update(ordersTable).set({ status }).where(eq(ordersTable.id, id));
  await db.insert(orderStatusHistoryTable).values({
    id: crypto.randomUUID(), orderId: id,
    fromStatus: existing.status, toStatus: status,
    note: note ?? STATUS_LABELS[status] ?? status,
  });

  res.json({ ok: true });
});

export default router;
