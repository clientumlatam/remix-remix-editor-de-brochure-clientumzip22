/**
 * WhatsApp Session routes — Baileys direct connection management.
 *
 * GET    /api/whatsapp/session           — get current session status
 * POST   /api/whatsapp/session/connect   — start connection (generates QR)
 * DELETE /api/whatsapp/session/disconnect — disconnect
 * POST   /api/whatsapp/session/send      — send a message (for manual sends via Baileys)
 */
import { Router, type Request } from "express";
import { requireAuth, type JwtPayload } from "../lib/auth";
import { whatsAppManager } from "../services/whatsapp-manager";
import { z } from "zod";

const router = Router();
type AuthRequest = Request & { user: JwtPayload };

/**
 * GET /api/whatsapp/session
 * Returns: { status, qrDataUrl, phone }
 */
router.get("/whatsapp/session", requireAuth, (req, res): void => {
  const tenantId = (req as AuthRequest).user.tenantId;
  const data = whatsAppManager.getStatus(tenantId);
  res.json(data);
});

/**
 * POST /api/whatsapp/session/connect
 * Starts a Baileys connection for this tenant. QR code will be available
 * by polling GET /api/whatsapp/session.
 */
router.post("/whatsapp/session/connect", requireAuth, async (req, res): Promise<void> => {
  const tenantId = (req as AuthRequest).user.tenantId;

  // Fire-and-forget: connect() is long-lived, we return immediately
  whatsAppManager.connect(tenantId).catch(() => {
    // Errors are logged inside connect()
  });

  res.json({ ok: true, message: "Connecting — poll GET /api/whatsapp/session for QR" });
});

/**
 * DELETE /api/whatsapp/session/disconnect
 */
router.delete("/whatsapp/session/disconnect", requireAuth, async (req, res): Promise<void> => {
  const tenantId = (req as AuthRequest).user.tenantId;
  await whatsAppManager.disconnect(tenantId);
  res.json({ ok: true });
});

/**
 * POST /api/whatsapp/session/send
 * Send a message via Baileys to a phone number (manual send from Clientum UI).
 * Body: { phone: string, text: string }
 */
router.post("/whatsapp/session/send", requireAuth, async (req, res): Promise<void> => {
  const tenantId = (req as AuthRequest).user.tenantId;

  const parsed = z
    .object({ phone: z.string().min(5), text: z.string().min(1) })
    .safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const jid = `${parsed.data.phone}@s.whatsapp.net`;

  try {
    await whatsAppManager.sendMessage(tenantId, jid, parsed.data.text);
    res.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to send";
    res.status(503).json({ error: message });
  }
});

export default router;
