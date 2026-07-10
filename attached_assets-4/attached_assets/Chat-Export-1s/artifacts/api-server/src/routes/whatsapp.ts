/**
 * WhatsApp conversations, analytics, knowledge base, and chatbot settings API.
 * All routes require JWT auth (tenant-scoped).
 */
import { Router, type Request } from "express";
import { eq, and, desc, sql, asc } from "drizzle-orm";
import { db, whatsappMessagesTable, contactsTable, tenantsTable, whatsappKbTable, whatsappConversationStatesTable } from "@workspace/db";
import { requireAuth, type JwtPayload } from "../lib/auth";
import { whatsAppManager } from "../services/whatsapp-manager";
import { z } from "zod";

const router = Router();
type AuthRequest = Request & { user: JwtPayload };

/* ------------------------------------------------------------------ */
/* CONVERSATIONS                                                         */
/* ------------------------------------------------------------------ */

/**
 * GET /api/whatsapp/conversations
 * Returns one entry per unique phone number with the latest message and unread count.
 */
router.get("/whatsapp/conversations", requireAuth, async (req, res): Promise<void> => {
  const tenantId = (req as AuthRequest).user.tenantId;

  const rows = await db
    .select({
      phone: whatsappMessagesTable.phone,
      contactName: whatsappMessagesTable.contactName,
      contactId: whatsappMessagesTable.contactId,
      lastMessage: sql<string>`(array_agg(${whatsappMessagesTable.body} ORDER BY ${whatsappMessagesTable.createdAt} DESC))[1]`,
      lastMessageAt: sql<string>`MAX(${whatsappMessagesTable.createdAt})`,
      unread: sql<number>`COUNT(*) FILTER (WHERE ${whatsappMessagesTable.fromMe} = false AND ${whatsappMessagesTable.direction} = 'inbound')`,
    })
    .from(whatsappMessagesTable)
    .where(eq(whatsappMessagesTable.tenantId, tenantId))
    .groupBy(
      whatsappMessagesTable.phone,
      whatsappMessagesTable.contactName,
      whatsappMessagesTable.contactId
    )
    .orderBy(sql`MAX(${whatsappMessagesTable.createdAt}) DESC`);

  // Merge escalation state
  const states = await db
    .select({ phone: whatsappConversationStatesTable.phone, needsHuman: whatsappConversationStatesTable.needsHuman })
    .from(whatsappConversationStatesTable)
    .where(and(eq(whatsappConversationStatesTable.tenantId, tenantId), eq(whatsappConversationStatesTable.needsHuman, true)));

  const escalatedPhones = new Set(states.map((s) => s.phone));

  res.json(rows.map((r) => ({ ...r, needsHuman: escalatedPhones.has(r.phone) })));
});

/**
 * GET /api/whatsapp/conversations/:phone/messages
 * Returns all messages for a specific phone number.
 */
router.get("/whatsapp/conversations/:phone/messages", requireAuth, async (req, res): Promise<void> => {
  const tenantId = (req as AuthRequest).user.tenantId;
  const rawPhone = req.params["phone"];
  const phone = decodeURIComponent(Array.isArray(rawPhone) ? rawPhone[0] ?? "" : rawPhone ?? "");

  if (!phone) { res.status(400).json({ error: "Missing phone" }); return; }

  const msgs = await db
    .select()
    .from(whatsappMessagesTable)
    .where(and(eq(whatsappMessagesTable.tenantId, tenantId), eq(whatsappMessagesTable.phone, phone)))
    .orderBy(whatsappMessagesTable.createdAt);

  res.json(msgs);
});

/**
 * POST /api/whatsapp/conversations/:phone/send
 * Send a manual reply to a phone number.
 */
router.post("/whatsapp/conversations/:phone/send", requireAuth, async (req, res): Promise<void> => {
  const tenantId = (req as AuthRequest).user.tenantId;
  const rawPhone = req.params["phone"];
  const phone = decodeURIComponent(Array.isArray(rawPhone) ? rawPhone[0] ?? "" : rawPhone ?? "");

  if (!phone) { res.status(400).json({ error: "Missing phone" }); return; }

  const parsed = z.object({ body: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [existingMsg] = await db
    .select()
    .from(whatsappMessagesTable)
    .where(and(eq(whatsappMessagesTable.tenantId, tenantId), eq(whatsappMessagesTable.phone, phone)))
    .orderBy(desc(whatsappMessagesTable.createdAt))
    .limit(1);

  const contactName = existingMsg?.contactName ?? "Contacto";
  const contactId = existingMsg?.contactId ?? null;

  const [msg] = await db
    .insert(whatsappMessagesTable)
    .values({
      tenantId,
      contactId: contactId ?? undefined,
      phone,
      contactName,
      direction: "outbound",
      fromMe: true,
      aiGenerated: false,
      body: parsed.data.body,
    })
    .returning();

  // Try to send via Baileys if connected (best-effort)
  try {
    const jid = `${phone}@s.whatsapp.net`;
    await whatsAppManager.sendMessage(tenantId, jid, parsed.data.body);
  } catch {
    // Baileys not connected — message saved to DB only
  }

  res.status(201).json(msg);
});

/**
 * POST /api/whatsapp/conversations/:phone/resolve
 * Mark a conversation as resolved (no longer needs human attention).
 */
router.post("/whatsapp/conversations/:phone/resolve", requireAuth, async (req, res): Promise<void> => {
  const tenantId = (req as AuthRequest).user.tenantId;
  const rawPhone = req.params["phone"];
  const phone = decodeURIComponent(Array.isArray(rawPhone) ? rawPhone[0] ?? "" : rawPhone ?? "");

  if (!phone) { res.status(400).json({ error: "Missing phone" }); return; }

  await db
    .insert(whatsappConversationStatesTable)
    .values({ tenantId, phone, needsHuman: false, resolvedAt: new Date() })
    .onConflictDoUpdate({
      target: [whatsappConversationStatesTable.tenantId, whatsappConversationStatesTable.phone],
      set: { needsHuman: false, resolvedAt: sql`NOW()`, updatedAt: sql`NOW()` },
    });

  res.json({ ok: true });
});

/* ------------------------------------------------------------------ */
/* ANALYTICS                                                             */
/* ------------------------------------------------------------------ */

/**
 * GET /api/whatsapp/analytics
 * Returns key metrics for the tenant's WhatsApp chatbot.
 */
router.get("/whatsapp/analytics", requireAuth, async (req, res): Promise<void> => {
  const tenantId = (req as AuthRequest).user.tenantId;

  const [totals] = await db
    .select({
      totalMessages: sql<number>`COUNT(*)`,
      inbound: sql<number>`COUNT(*) FILTER (WHERE ${whatsappMessagesTable.direction} = 'inbound')`,
      outbound: sql<number>`COUNT(*) FILTER (WHERE ${whatsappMessagesTable.direction} = 'outbound')`,
      aiReplies: sql<number>`COUNT(*) FILTER (WHERE ${whatsappMessagesTable.aiGenerated} = true)`,
      uniqueUsers: sql<number>`COUNT(DISTINCT ${whatsappMessagesTable.phone})`,
    })
    .from(whatsappMessagesTable)
    .where(eq(whatsappMessagesTable.tenantId, tenantId));

  // Messages per day (last 7 days)
  const dailyRows = await db
    .select({
      day: sql<string>`DATE(${whatsappMessagesTable.createdAt})`,
      inbound: sql<number>`COUNT(*) FILTER (WHERE ${whatsappMessagesTable.direction} = 'inbound')`,
      outbound: sql<number>`COUNT(*) FILTER (WHERE ${whatsappMessagesTable.direction} = 'outbound')`,
      aiReplies: sql<number>`COUNT(*) FILTER (WHERE ${whatsappMessagesTable.aiGenerated} = true)`,
    })
    .from(whatsappMessagesTable)
    .where(
      and(
        eq(whatsappMessagesTable.tenantId, tenantId),
        sql`${whatsappMessagesTable.createdAt} >= NOW() - INTERVAL '7 days'`
      )
    )
    .groupBy(sql`DATE(${whatsappMessagesTable.createdAt})`)
    .orderBy(sql`DATE(${whatsappMessagesTable.createdAt}) ASC`);

  // Conversations per day (last 7 days)
  const conversationsThisWeek = await db
    .select({
      day: sql<string>`DATE(${whatsappMessagesTable.createdAt})`,
      conversations: sql<number>`COUNT(DISTINCT ${whatsappMessagesTable.phone})`,
    })
    .from(whatsappMessagesTable)
    .where(
      and(
        eq(whatsappMessagesTable.tenantId, tenantId),
        sql`${whatsappMessagesTable.createdAt} >= NOW() - INTERVAL '7 days'`
      )
    )
    .groupBy(sql`DATE(${whatsappMessagesTable.createdAt})`)
    .orderBy(sql`DATE(${whatsappMessagesTable.createdAt}) ASC`);

  const totalMessages = Number(totals?.totalMessages ?? 0);
  const inbound = Number(totals?.inbound ?? 0);
  const aiReplies = Number(totals?.aiReplies ?? 0);
  const resolutionRate = inbound > 0 ? Math.round((aiReplies / inbound) * 100) : 0;

  res.json({
    summary: {
      totalMessages,
      inbound,
      outbound: Number(totals?.outbound ?? 0),
      aiReplies,
      uniqueUsers: Number(totals?.uniqueUsers ?? 0),
      resolutionRate,
    },
    daily: dailyRows,
    conversationsPerDay: conversationsThisWeek,
  });
});

/* ------------------------------------------------------------------ */
/* KNOWLEDGE BASE                                                        */
/* ------------------------------------------------------------------ */

/**
 * GET /api/whatsapp/kb
 * List all KB entries for the tenant.
 */
router.get("/whatsapp/kb", requireAuth, async (req, res): Promise<void> => {
  const tenantId = (req as AuthRequest).user.tenantId;
  const entries = await db
    .select()
    .from(whatsappKbTable)
    .where(eq(whatsappKbTable.tenantId, tenantId))
    .orderBy(asc(whatsappKbTable.createdAt));
  res.json(entries);
});

/**
 * POST /api/whatsapp/kb
 * Create a new KB entry.
 */
router.post("/whatsapp/kb", requireAuth, async (req, res): Promise<void> => {
  const tenantId = (req as AuthRequest).user.tenantId;
  const parsed = z.object({
    question: z.string().min(1),
    answer: z.string().min(1),
    category: z.string().optional(),
  }).safeParse(req.body);

  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [entry] = await db
    .insert(whatsappKbTable)
    .values({ tenantId, ...parsed.data })
    .returning();

  res.status(201).json(entry);
});

/**
 * PATCH /api/whatsapp/kb/:id
 * Update a KB entry.
 */
router.patch("/whatsapp/kb/:id", requireAuth, async (req, res): Promise<void> => {
  const tenantId = (req as AuthRequest).user.tenantId;
  const id = Number(req.params["id"]);
  if (!id) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = z.object({
    question: z.string().min(1).optional(),
    answer: z.string().min(1).optional(),
    category: z.string().optional(),
  }).safeParse(req.body);

  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [entry] = await db
    .update(whatsappKbTable)
    .set(parsed.data)
    .where(and(eq(whatsappKbTable.id, id), eq(whatsappKbTable.tenantId, tenantId)))
    .returning();

  if (!entry) { res.status(404).json({ error: "Not found" }); return; }
  res.json(entry);
});

/**
 * DELETE /api/whatsapp/kb/:id
 */
router.delete("/whatsapp/kb/:id", requireAuth, async (req, res): Promise<void> => {
  const tenantId = (req as AuthRequest).user.tenantId;
  const id = Number(req.params["id"]);
  if (!id) { res.status(400).json({ error: "Invalid id" }); return; }

  await db
    .delete(whatsappKbTable)
    .where(and(eq(whatsappKbTable.id, id), eq(whatsappKbTable.tenantId, tenantId)));

  res.status(204).end();
});

/* ------------------------------------------------------------------ */
/* CHATBOT SETTINGS                                                      */
/* ------------------------------------------------------------------ */

/**
 * GET /api/whatsapp/bot-settings
 */
router.get("/whatsapp/bot-settings", requireAuth, async (req, res): Promise<void> => {
  const tenantId = (req as AuthRequest).user.tenantId;
  const [tenant] = await db
    .select({
      chatbotEnabled: tenantsTable.chatbotEnabled,
      chatbotMode: tenantsTable.chatbotMode,
      chatbotPersona: tenantsTable.chatbotPersona,
      whatomateUrl: tenantsTable.whatomateUrl,
      whatomateToken: tenantsTable.whatomateToken,
      evolutionApiUrl: tenantsTable.evolutionApiUrl,
      evolutionApiKey: tenantsTable.evolutionApiKey,
      evolutionInstanceId: tenantsTable.evolutionInstanceId,
      widgetName: tenantsTable.widgetName,
      widgetColor: tenantsTable.widgetColor,
      widgetWelcome: tenantsTable.widgetWelcome,
      horariosEnabled: tenantsTable.horariosEnabled,
      horariosTimezone: tenantsTable.horariosTimezone,
      horariosData: tenantsTable.horariosData,
    })
    .from(tenantsTable)
    .where(eq(tenantsTable.id, tenantId));

  if (!tenant) { res.status(404).json({ error: "Tenant not found" }); return; }
  res.json(tenant);
});

/**
 * PATCH /api/whatsapp/bot-settings
 */
router.patch("/whatsapp/bot-settings", requireAuth, async (req, res): Promise<void> => {
  const tenantId = (req as AuthRequest).user.tenantId;

  const parsed = z.object({
    chatbotEnabled: z.boolean().optional(),
    chatbotMode: z.enum(["full_auto", "hybrid", "supervised"]).optional(),
    chatbotPersona: z.string().optional().or(z.null()),
    whatomateUrl: z.string().optional().or(z.null()),
    whatomateToken: z.string().optional().or(z.null()),
    evolutionApiUrl: z.string().optional().or(z.null()),
    evolutionApiKey: z.string().optional().or(z.null()),
    evolutionInstanceId: z.string().optional().or(z.null()),
    widgetName: z.string().optional().or(z.null()),
    widgetColor: z.string().optional().or(z.null()),
    widgetWelcome: z.string().optional().or(z.null()),
    horariosEnabled: z.boolean().optional(),
    horariosTimezone: z.string().optional().or(z.null()),
    horariosData: z.record(z.object({ enabled: z.boolean(), from: z.string(), to: z.string() })).optional().or(z.null()),
  }).safeParse(req.body);

  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [tenant] = await db
    .update(tenantsTable)
    .set(parsed.data)
    .where(eq(tenantsTable.id, tenantId))
    .returning({
      chatbotEnabled: tenantsTable.chatbotEnabled,
      chatbotMode: tenantsTable.chatbotMode,
      chatbotPersona: tenantsTable.chatbotPersona,
      whatomateUrl: tenantsTable.whatomateUrl,
      whatomateToken: tenantsTable.whatomateToken,
    });

  res.json(tenant);
});

export default router;
