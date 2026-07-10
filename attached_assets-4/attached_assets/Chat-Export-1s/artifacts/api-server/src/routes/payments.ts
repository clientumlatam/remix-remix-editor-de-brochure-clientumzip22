import { Router, type Request, type Response } from "express";
import crypto from "crypto";
import { db, subscriptionsTable, paymentEventsTable, usersTable } from "@workspace/db";
import { and, eq, desc, or } from "drizzle-orm";
import { requireAuth, type JwtPayload } from "../lib/auth";

const router = Router();
type AuthReq = Request & { user: JwtPayload };

const PLANS: Record<string, { name: string; price: number; description: string }> = {
  starter:  { name: "Clientum Starter",  price: 149000, description: "CRM básico, chatbot WhatsApp y reportes automáticos" },
  pro:      { name: "Clientum Pro",      price: 299000, description: "CRM ilimitado con IA entrenada, ERP básico y soporte prioritario 24/7" },
  business: { name: "Clientum Business", price: 549000, description: "Multi-agente IA, ERP completo + AFIP, 5 integraciones y ejecutivo dedicado" },
};

router.post("/payments/preference", requireAuth, async (req: Request, res: Response) => {
  const tenantId = (req as AuthReq).user.tenantId;
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) { res.status(503).json({ error: "Pagos no configurados. Contactanos por WhatsApp." }); return; }

  const { planId } = req.body as { planId?: string };
  const plan = planId ? PLANS[planId] : undefined;
  if (!plan) { res.status(400).json({ error: "Plan inválido" }); return; }

  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers["host"] || "localhost";
  const origin = `${proto}://${host}`;

  const [user] = await db.select({ email: usersTable.email })
    .from(usersTable)
    .where(eq(usersTable.tenantId, tenantId))
    .limit(1);

  try {
    const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ id: planId, title: plan.name, description: plan.description, unit_price: plan.price, quantity: 1, currency_id: "ARS" }],
        payer: { email: user?.email ?? undefined },
        back_urls: {
          success: `${origin}/app/cuenta?payment=success&plan=${planId}`,
          failure: `${origin}/app/cuenta?payment=failure`,
          pending: `${origin}/app/cuenta?payment=pending`,
        },
        auto_return: "approved",
        external_reference: `${tenantId}|${planId}`,
        notification_url: `${origin}/api/payments/webhook`,
        statement_descriptor: "CLIENTUM",
      }),
    });

    if (!mpRes.ok) {
      const err = await mpRes.text();
      req.log.error({ err }, "MercadoPago preference error");
      res.status(500).json({ error: "Error al crear preferencia de pago" }); return;
    }

    const data = (await mpRes.json()) as { id: string; init_point: string; sandbox_init_point: string };
    res.json({ preferenceId: data.id, initPoint: data.init_point, sandboxInitPoint: data.sandbox_init_point });
  } catch (err) {
    req.log.error({ err }, "MercadoPago fetch error");
    res.status(500).json({ error: "Error de conexión con MercadoPago" });
  }
});

router.post("/payments/webhook", async (req: Request, res: Response) => {
  const body = req.body as { type?: string; data?: { id?: string } };
  const paymentId = body.data?.id ?? (req.query.id as string | undefined);
  const topic = body.type ?? (req.query.topic as string | undefined);

  if (topic !== "payment" || !paymentId) { res.status(200).json({ ok: true }); return; }

  try {
    const token = process.env.MP_ACCESS_TOKEN;
    if (!token) { res.status(200).json({ ok: true }); return; }

    const payRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!payRes.ok) { res.status(200).json({ ok: true }); return; }

    const payment = (await payRes.json()) as { status: string; external_reference?: string; id: number; transaction_amount?: number };
    const mpPaymentIdStr = String(payment.id);

    if (payment.external_reference) {
      const parts = payment.external_reference.split("|");
      const tenantId = parseInt(parts[0] ?? "", 10);
      const planId = parts[1];
      if (!tenantId || !planId) { res.status(200).json({ ok: true }); return; }

      const [newEvent] = await db.insert(paymentEventsTable).values({
        id: crypto.randomUUID(), tenantId, mpPaymentId: mpPaymentIdStr,
        plan: planId, amount: payment.transaction_amount ? Math.round(payment.transaction_amount) : null,
        status: payment.status, description: PLANS[planId]?.name ?? planId,
      }).onConflictDoNothing().returning({ id: paymentEventsTable.id });

      if (!newEvent) { res.status(200).json({ ok: true }); return; }

      if (payment.status === "approved" && PLANS[planId]) {
        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        await db.transaction(async (tx) => {
          const existing = await tx.select({ id: subscriptionsTable.id })
            .from(subscriptionsTable).where(eq(subscriptionsTable.tenantId, tenantId)).limit(1);

          if (existing.length > 0) {
            await tx.update(subscriptionsTable).set({ plan: planId, status: "active", mpPaymentId: mpPaymentIdStr, currentPeriodEnd: periodEnd })
              .where(eq(subscriptionsTable.tenantId, tenantId));
          } else {
            await tx.insert(subscriptionsTable).values({ id: crypto.randomUUID(), tenantId, plan: planId, status: "active", mpPaymentId: mpPaymentIdStr, currentPeriodEnd: periodEnd });
          }
        });

        req.log.info({ tenantId, planId, mpPaymentId: mpPaymentIdStr }, "MP webhook: subscription activated");
      }

      if (["refunded", "charged_back", "cancelled"].includes(payment.status)) {
        await db.update(subscriptionsTable).set({ plan: "free", status: "cancelled", cancelledAt: new Date() })
          .where(and(eq(subscriptionsTable.tenantId, tenantId), eq(subscriptionsTable.mpPaymentId, mpPaymentIdStr)));
      }
    }
  } catch (err) { req.log.error({ err }, "Webhook processing error"); }

  res.status(200).json({ ok: true });
});

router.get("/payments/subscription", requireAuth, async (req: Request, res: Response) => {
  const tenantId = (req as AuthReq).user.tenantId;
  const [sub] = await db.select().from(subscriptionsTable)
    .where(and(eq(subscriptionsTable.tenantId, tenantId), or(eq(subscriptionsTable.status, "active"), eq(subscriptionsTable.status, "trialing"))))
    .limit(1);

  res.json({ plan: sub?.plan ?? "free", status: sub?.status ?? "none", currentPeriodEnd: sub?.currentPeriodEnd ?? null });
});

router.post("/payments/cancel", requireAuth, async (req: Request, res: Response) => {
  const tenantId = (req as AuthReq).user.tenantId;
  const [sub] = await db.select().from(subscriptionsTable)
    .where(and(eq(subscriptionsTable.tenantId, tenantId), or(eq(subscriptionsTable.status, "active"), eq(subscriptionsTable.status, "trialing"))))
    .limit(1);

  if (!sub) { res.status(404).json({ error: "No tenés una suscripción activa" }); return; }

  await db.update(subscriptionsTable).set({ status: "cancelled", cancelledAt: new Date() }).where(eq(subscriptionsTable.id, sub.id));
  await db.insert(paymentEventsTable).values({ id: crypto.randomUUID(), tenantId, plan: String(sub.plan), amount: 0, status: "cancelled", description: "Suscripción cancelada por el usuario" });

  res.json({ ok: true, message: "Suscripción cancelada. Tu plan pasará a Free al final del período." });
});

router.get("/payments/history", requireAuth, async (req: Request, res: Response) => {
  const tenantId = (req as AuthReq).user.tenantId;
  const events = await db.select().from(paymentEventsTable).where(eq(paymentEventsTable.tenantId, tenantId)).orderBy(desc(paymentEventsTable.createdAt)).limit(50);
  res.json({ events });
});

export default router;
