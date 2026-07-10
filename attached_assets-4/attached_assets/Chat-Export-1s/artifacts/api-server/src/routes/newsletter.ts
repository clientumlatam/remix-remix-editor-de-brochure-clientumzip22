import { Router, type Request, type Response } from "express";
import crypto from "crypto";
import { db, newsletterSubscribersTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";

const router = Router();

router.post("/newsletter/subscribe", async (req: Request, res: Response) => {
  const { email, name, source } = req.body as { email?: string; name?: string; source?: string };
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: "Email inválido" }); return;
  }

  const [existing] = await db.select({ id: newsletterSubscribersTable.id, unsubscribed: newsletterSubscribersTable.unsubscribed })
    .from(newsletterSubscribersTable).where(eq(newsletterSubscribersTable.email, email.trim().toLowerCase())).limit(1);

  if (existing && !existing.unsubscribed) {
    res.json({ ok: true, message: "Ya estás suscripto/a" }); return;
  }

  if (existing) {
    await db.update(newsletterSubscribersTable).set({ unsubscribed: false }).where(eq(newsletterSubscribersTable.id, existing.id));
  } else {
    await db.insert(newsletterSubscribersTable).values({
      id: crypto.randomUUID(), email: email.trim().toLowerCase(),
      name: name?.trim() ?? null, source: source ?? "landing",
    });
  }

  res.json({ ok: true, message: "¡Gracias por suscribirte!" });
});

router.post("/newsletter/unsubscribe", async (req: Request, res: Response) => {
  const { email } = req.body as { email?: string };
  if (!email?.trim()) { res.status(400).json({ error: "Email requerido" }); return; }

  await db.update(newsletterSubscribersTable).set({ unsubscribed: true })
    .where(eq(newsletterSubscribersTable.email, email.trim().toLowerCase()));

  res.json({ ok: true, message: "Te diste de baja correctamente." });
});

router.get("/newsletter/stats", async (req: Request, res: Response) => {
  const ip = req.ip ?? req.socket?.remoteAddress ?? "";
  const isLocal = ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1";
  if (!isLocal) { res.status(403).json({ error: "Solo accesible desde localhost" }); return; }

  const [{ total }] = await db.select({ total: count() }).from(newsletterSubscribersTable);
  const [{ active }] = await db.select({ active: count() }).from(newsletterSubscribersTable)
    .where(eq(newsletterSubscribersTable.unsubscribed, false));

  res.json({ total: Number(total), active: Number(active) });
});

export default router;
