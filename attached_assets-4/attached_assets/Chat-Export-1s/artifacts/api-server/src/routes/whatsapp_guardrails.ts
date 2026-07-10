/**
 * WhatsApp Guardrails — content safety and escalation configuration per tenant.
 */
import { Router, type Request } from "express";
import { eq } from "drizzle-orm";
import { db, whatsappGuardrailsTable } from "@workspace/db";
import { requireAuth, type JwtPayload } from "../lib/auth";
import { z } from "zod";

const router = Router();
type AuthRequest = Request & { user: JwtPayload };

/**
 * GET /api/whatsapp/guardrails
 */
router.get("/whatsapp/guardrails", requireAuth, async (req, res): Promise<void> => {
  const tenantId = (req as AuthRequest).user.tenantId;

  let [row] = await db
    .select()
    .from(whatsappGuardrailsTable)
    .where(eq(whatsappGuardrailsTable.tenantId, tenantId));

  if (!row) {
    [row] = await db
      .insert(whatsappGuardrailsTable)
      .values({ tenantId })
      .returning();
  }

  res.json(row);
});

const patchSchema = z.object({
  blockedKeywords: z.string().optional(),
  avoidTopics: z.string().optional(),
  escalateAfterTurns: z.coerce.number().int().min(1).max(50).optional(),
  escalationMessage: z.string().min(1).optional(),
  enableProfanityFilter: z.boolean().optional(),
  enableEscalation: z.boolean().optional(),
});

/**
 * PATCH /api/whatsapp/guardrails
 */
router.patch("/whatsapp/guardrails", requireAuth, async (req, res): Promise<void> => {
  const tenantId = (req as AuthRequest).user.tenantId;

  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  // Upsert — create row if it doesn't exist
  const existing = await db
    .select({ id: whatsappGuardrailsTable.id })
    .from(whatsappGuardrailsTable)
    .where(eq(whatsappGuardrailsTable.tenantId, tenantId));

  let row;
  if (existing.length === 0) {
    [row] = await db
      .insert(whatsappGuardrailsTable)
      .values({ tenantId, ...parsed.data })
      .returning();
  } else {
    [row] = await db
      .update(whatsappGuardrailsTable)
      .set(parsed.data)
      .where(eq(whatsappGuardrailsTable.tenantId, tenantId))
      .returning();
  }

  res.json(row);
});

export default router;
