import { Router, type Request, type Response } from "express";
import { db, tenantsTable, whatsappMessagesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, type JwtPayload } from "../lib/auth";
import { logger } from "../lib/logger";

const router = Router();
type AuthReq = Request & { user: JwtPayload };

const BROADCAST_DELAY_MS = 750;

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15 && /^[1-9]/.test(digits);
}

router.get("/broadcast/contacts", requireAuth, async (req: Request, res: Response) => {
  const tenantId = (req as AuthReq).user.tenantId;

  const rows = await db
    .selectDistinctOn([whatsappMessagesTable.phone], {
      phone: whatsappMessagesTable.phone,
      contactName: whatsappMessagesTable.contactName,
      lastMessageAt: whatsappMessagesTable.createdAt,
    })
    .from(whatsappMessagesTable)
    .where(eq(whatsappMessagesTable.tenantId, tenantId))
    .orderBy(whatsappMessagesTable.phone, desc(whatsappMessagesTable.createdAt));

  res.json({ contacts: rows });
});

router.post("/broadcast/send", requireAuth, async (req: Request, res: Response) => {
  const tenantId = (req as AuthReq).user.tenantId;
  const { message, phones } = req.body as { message?: string; phones?: string[] };

  if (!message?.trim()) {
    res.status(400).json({ error: "Mensaje requerido" }); return;
  }
  if (!phones || phones.length === 0) {
    res.status(400).json({ error: "Seleccioná al menos un contacto" }); return;
  }

  const [tenant] = await db.select().from(tenantsTable).where(eq(tenantsTable.id, tenantId)).limit(1);
  if (!tenant?.evolutionApiUrl || !tenant?.evolutionApiKey || !tenant?.evolutionInstanceId) {
    res.status(400).json({ error: "Configurá la integración de WhatsApp antes de hacer broadcast" }); return;
  }

  const results: { phone: string; ok: boolean; error?: string }[] = [];

  for (const phone of phones) {
    const digits = phone.replace(/\D/g, "");
    if (!isValidPhone(digits)) {
      results.push({ phone, ok: false, error: "Número inválido" }); continue;
    }

    const url = `${tenant.evolutionApiUrl.replace(/\/$/, "")}/message/sendText/${tenant.evolutionInstanceId}`;
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: tenant.evolutionApiKey },
        body: JSON.stringify({ number: digits, text: message }),
        signal: AbortSignal.timeout(10000),
      });
      results.push({ phone, ok: r.ok });
      if (!r.ok) logger.warn({ phone, status: r.status }, "[broadcast] send failed");
    } catch (err) {
      results.push({ phone, ok: false, error: err instanceof Error ? err.message : "Error" });
      logger.warn({ phone, err }, "[broadcast] send error");
    }

    await new Promise((resolve) => setTimeout(resolve, BROADCAST_DELAY_MS));
  }

  const sent = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;
  logger.info({ tenantId, sent, failed }, "[broadcast] completed");
  res.json({ sent, failed, results });
});

export default router;
