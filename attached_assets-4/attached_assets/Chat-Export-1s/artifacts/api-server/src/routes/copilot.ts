/**
 * Clientum Copilot — AI reply suggestions for human agents in WhatsApp Web.
 * POST /api/copilot/suggest        — generate a suggested reply given conversation messages
 * GET  /api/copilot/me             — verify auth + get tenant info for the extension popup
 * GET  /api/copilot/chats/:phone/status     — return handoff & bot state for a conversation
 * PUT  /api/copilot/chats/:phone/toggle-bot — pause/resume the AI bot for a conversation
 */
import { Router, type Request } from "express";
import { eq, and, desc, inArray, sql, ilike, or, count, sum } from "drizzle-orm";
import {
  db,
  contactsTable,
  activitiesTable,
  tenantsTable,
  whatsappConversationStatesTable,
  invoicesTable,
  copilotSuggestionsTable,
} from "@workspace/db";
import { requireAuth, type JwtPayload } from "../lib/auth";
import { createOpenRouterClient } from "@workspace/integrations-openrouter-ai";
import { z } from "zod";

const router = Router();
type AuthRequest = Request & { user: JwtPayload };

const COPILOT_MODEL = "google/gemma-3-12b-it:free";

const UNPAID_STATUSES = ["draft", "sent", "pending", "overdue"];

const SuggestBody = z.object({
  phone: z.string().default(""),
  messages: z
    .array(
      z.object({
        from: z.enum(["me", "them"]),
        text: z.string().min(1).max(4000),
      })
    )
    .min(1)
    .max(30),
  tone: z.enum(["formal", "amigable", "persuasivo", "directo"]).default("amigable"),
});

/** Normalise a phone number to digits only for fuzzy matching. */
function digitsOnly(s: string) {
  return s.replace(/\D/g, "");
}

/** Attempt to find a CRM contact by phone number. */
async function findContact(tenantId: number, phone: string) {
  if (!phone) return null;
  const normalized = digitsOnly(phone);
  if (normalized.length < 7) return null;

  const suffix = normalized.slice(-10);

  // Use a SQL LIKE query with the last 10 digits to avoid scanning all contacts in JS.
  const rows = await db
    .select()
    .from(contactsTable)
    .where(
      and(
        eq(contactsTable.tenantId, tenantId),
        or(
          ilike(contactsTable.phone, `%${suffix}`),
          ilike(contactsTable.phone, `%${normalized}`)
        )
      )
    )
    .limit(1);

  return rows[0] ?? null;
}

/** Return unpaid invoice total for a contact. */
async function getContactDebt(tenantId: number, contactId: number) {
  const [result] = await db
    .select({ total: sql<number>`COALESCE(SUM(${invoicesTable.total}), 0)`, count: sql<number>`COUNT(*)` })
    .from(invoicesTable)
    .where(
      and(
        eq(invoicesTable.tenantId, tenantId),
        eq(invoicesTable.contactId, contactId),
        inArray(invoicesTable.status, UNPAID_STATUSES)
      )
    );
  return { amount: Number(result?.total ?? 0), count: Number(result?.count ?? 0) };
}

/** Upsert conversation handoff state. */
async function upsertHandoff(tenantId: number, phone: string, needsHuman: boolean) {
  await db
    .insert(whatsappConversationStatesTable)
    .values({ tenantId, phone, needsHuman })
    .onConflictDoUpdate({
      target: [whatsappConversationStatesTable.tenantId, whatsappConversationStatesTable.phone],
      set: {
        needsHuman,
        updatedAt: sql`NOW()`,
        ...(needsHuman ? { escalatedAt: sql`NOW()` } : { resolvedAt: sql`NOW()` }),
      },
    });
}

/* ------------------------------------------------------------------ */
/* POST /api/copilot/suggest                                            */
/* ------------------------------------------------------------------ */

router.post("/copilot/suggest", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;

  const parsed = SuggestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const { phone, messages, tone } = parsed.data;

  const [tenant] = await db
    .select({ openrouterApiKey: tenantsTable.openrouterApiKey, name: tenantsTable.name })
    .from(tenantsTable)
    .where(eq(tenantsTable.id, tenantId));

  if (!tenant?.openrouterApiKey) {
    res.status(402).json({
      error:
        "API key de OpenRouter no configurada. Agregala en Configuración → IA en el dashboard de Clientum.",
    });
    return;
  }

  // --- CRM context ---
  const contact = await findContact(tenantId, phone);

  let recentActivities: string[] = [];
  let debtAlert: { amount: number; invoiceCount: number; suggestedMessage: string } | null = null;

  if (contact) {
    const acts = await db
      .select({ type: activitiesTable.type, title: activitiesTable.title, date: activitiesTable.date })
      .from(activitiesTable)
      .where(
        and(
          eq(activitiesTable.tenantId, tenantId),
          eq(activitiesTable.contactId, contact.id)
        )
      )
      .orderBy(desc(activitiesTable.date))
      .limit(5);
    recentActivities = acts.map(
      (a) =>
        `  - ${a.type}: ${a.title} (${new Date(a.date).toLocaleDateString("es-AR")})`
    );

    // Debt detection
    const debt = await getContactDebt(tenantId, contact.id);
    if (debt.amount > 0) {
      const amountFormatted = debt.amount.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 0,
      });
      debtAlert = {
        amount: debt.amount,
        invoiceCount: debt.count,
        suggestedMessage: `Hola ${contact.name.split(" ")[0]}! Quería avisarte que tenés ${debt.count > 1 ? `${debt.count} facturas pendientes` : "una factura pendiente"} por un total de ${amountFormatted}. Si querés regularizar, podés pagarlo fácilmente por MercadoPago — te mando el link ahora. 🙏`,
      };
    }
  }

  // Handoff state
  let handoffActive = false;
  if (phone) {
    const [state] = await db
      .select({ needsHuman: whatsappConversationStatesTable.needsHuman })
      .from(whatsappConversationStatesTable)
      .where(
        and(
          eq(whatsappConversationStatesTable.tenantId, tenantId),
          eq(whatsappConversationStatesTable.phone, phone)
        )
      )
      .limit(1);
    handoffActive = state?.needsHuman ?? false;
  }

  // --- Build prompt ---
  const toneInstructions: Record<string, string> = {
    formal: "Usá un tono formal y profesional, sin tuteo ni expresiones coloquiales.",
    amigable: "Sé cálido, cercano y amigable — como un asesor de confianza.",
    persuasivo: "Sé persuasivo, orientado a cerrar la venta o acción. Destacá beneficios.",
    directo: "Sé directo y conciso. Respondé sin rodeos, al punto.",
  };

  const contactLines: string[] = [];
  if (contact) {
    contactLines.push(`Nombre: ${contact.name}`);
    if (contact.company) contactLines.push(`Empresa: ${contact.company}`);
    if (contact.email) contactLines.push(`Email: ${contact.email}`);
    if (contact.notes) contactLines.push(`Notas CRM: ${contact.notes}`);
    if (recentActivities.length)
      contactLines.push(`Actividades recientes:\n${recentActivities.join("\n")}`);
    if (debtAlert)
      contactLines.push(`⚠️ DEUDA PENDIENTE: $${debtAlert.amount.toLocaleString("es-AR")} (${debtAlert.invoiceCount} comprobante${debtAlert.invoiceCount !== 1 ? "s" : ""})`);
  } else {
    contactLines.push(
      `Número: ${phone || "desconocido"} — no está registrado en el CRM todavía.`
    );
  }

  const systemPrompt = `Sos un asistente de ventas y atención al cliente de la empresa "${tenant.name}" (Argentina).
Tu tarea es ayudar al agente humano a redactar una respuesta profesional y efectiva por WhatsApp.

CLIENTE:
${contactLines.join("\n")}

TONO REQUERIDO: ${toneInstructions[tone] ?? toneInstructions["amigable"]}

REGLAS:
- Devolvé ÚNICAMENTE el texto del mensaje, sin comillas, sin aclaraciones, sin explicaciones.
- Usá voseo rioplatense (vos, tenés, podés, sabés). No uses "usted" ni tuteo.
- Sé conciso y natural — como habla un vendedor argentino. Máximo 3-4 oraciones.
- Adaptá el tono: si el cliente está enojado, sé empático; si está interesado, sé propositivo.
- Si el cliente hizo una pregunta concreta, respondela directamente.
- No uses emojis a menos que el cliente los haya usado en la conversación o el tono lo requiera.`;

  const chatMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({
      role: m.from === "me" ? ("assistant" as const) : ("user" as const),
      content: m.text,
    })),
  ];

  try {
    const client = createOpenRouterClient(tenant.openrouterApiKey);
    const completion = await client.chat.completions.create({
      model: COPILOT_MODEL,
      max_tokens: 300,
      messages: chatMessages,
    });

    const suggestion = completion.choices[0]?.message?.content?.trim() ?? "";

    const { userId } = (req as AuthRequest).user;

    // Insert into DB and get the id for the response
    const [logRow] = await db
      .insert(copilotSuggestionsTable)
      .values({
        tenantId,
        userId: userId ?? undefined,
        phone,
        contactName: contact?.name ?? null,
        contactId: contact?.id ?? null,
        tone,
        messagesCount: messages.length,
        suggestion,
        hadDebtAlert: !!(debtAlert && debtAlert.amount > 0),
        debtAmount: debtAlert?.amount ?? null,
      })
      .returning({ id: copilotSuggestionsTable.id })
      .catch(() => [{ id: null }]);

    res.json({
      suggestion,
      suggestionId: logRow?.id ?? null,
      contactName: contact?.name ?? null,
      handoffActive,
      debtAlert,
    });
  } catch (err: any) {
    req.log.error({ err }, "OpenRouter error in copilot/suggest");
    res.status(500).json({ error: "Error al generar la sugerencia. Intentá de nuevo." });
  }
});

/* ------------------------------------------------------------------ */
/* GET /api/copilot/history                                             */
/* ------------------------------------------------------------------ */

router.get("/copilot/history", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;

  const page     = Math.max(1, parseInt((req.query["page"] as string) ?? "1") || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt((req.query["pageSize"] as string) ?? "20") || 20));
  const search   = (req.query["search"] as string | undefined)?.trim() ?? "";
  const tone     = (req.query["tone"] as string | undefined)?.trim() ?? "";
  const debtAlert = (req.query["debtAlert"] as string | undefined)?.trim() ?? "";

  const conditions = [eq(copilotSuggestionsTable.tenantId, tenantId)];
  if (search) {
    conditions.push(
      or(
        ilike(copilotSuggestionsTable.phone, `%${search}%`),
        ilike(copilotSuggestionsTable.contactName, `%${search}%`)
      )!
    );
  }
  if (tone) conditions.push(eq(copilotSuggestionsTable.tone, tone));
  if (debtAlert === "true")  conditions.push(eq(copilotSuggestionsTable.hadDebtAlert, true));
  if (debtAlert === "false") conditions.push(eq(copilotSuggestionsTable.hadDebtAlert, false));

  const where = and(...conditions);

  const [{ total }] = await db
    .select({ total: count() })
    .from(copilotSuggestionsTable)
    .where(where);

  const rows = await db
    .select()
    .from(copilotSuggestionsTable)
    .where(where)
    .orderBy(desc(copilotSuggestionsTable.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  // Compute stats across all tenant rows (not just the filtered page)
  const allRows = await db
    .select({
      accepted:     copilotSuggestionsTable.accepted,
      hadDebtAlert: copilotSuggestionsTable.hadDebtAlert,
      tone:         copilotSuggestionsTable.tone,
    })
    .from(copilotSuggestionsTable)
    .where(eq(copilotSuggestionsTable.tenantId, tenantId));

  const statsTotal    = allRows.length;
  const accepted      = allRows.filter(r => r.accepted === true).length;
  const withDebt      = allRows.filter(r => r.hadDebtAlert).length;
  const byTone: Record<string, number> = {};
  for (const r of allRows) byTone[r.tone] = (byTone[r.tone] ?? 0) + 1;

  res.json({
    data:     rows,
    total:    Number(total),
    page,
    pageSize,
    stats: {
      total:          statsTotal,
      accepted,
      acceptanceRate: statsTotal > 0 ? Math.round((accepted / statsTotal) * 100) : 0,
      withDebt,
      byTone,
    },
  });
});

/* ------------------------------------------------------------------ */
/* POST /api/copilot/history/:id/accept                                 */
/* ------------------------------------------------------------------ */

router.post("/copilot/history/:id/accept", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "ID inválido" }); return; }

  const parsed = z.object({ accepted: z.boolean() }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Body inválido" }); return; }

  const [row] = await db
    .select({ id: copilotSuggestionsTable.id })
    .from(copilotSuggestionsTable)
    .where(and(eq(copilotSuggestionsTable.id, id), eq(copilotSuggestionsTable.tenantId, tenantId)));

  if (!row) { res.status(404).json({ error: "No encontrado" }); return; }

  await db
    .update(copilotSuggestionsTable)
    .set({ accepted: parsed.data.accepted })
    .where(eq(copilotSuggestionsTable.id, id));

  res.json({ ok: true });
});

/* ------------------------------------------------------------------ */
/* GET /api/copilot/me                                                  */
/* ------------------------------------------------------------------ */

router.get("/copilot/me", requireAuth, async (req, res): Promise<void> => {
  const { tenantId, userId, email } = (req as AuthRequest).user;

  const [tenant] = await db
    .select({ name: tenantsTable.name, openrouterApiKey: tenantsTable.openrouterApiKey })
    .from(tenantsTable)
    .where(eq(tenantsTable.id, tenantId));

  if (!tenant) {
    res.status(404).json({ error: "Tenant no encontrado" });
    return;
  }

  res.json({
    userId,
    email,
    tenantId,
    tenantName: tenant.name,
    hasApiKey: !!tenant.openrouterApiKey,
  });
});

/* ------------------------------------------------------------------ */
/* GET /api/copilot/chats/:phone/status                                 */
/* ------------------------------------------------------------------ */

router.get("/copilot/chats/:phone/status", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const rawPhone = req.params["phone"];
  const phone = decodeURIComponent(Array.isArray(rawPhone) ? rawPhone[0] ?? "" : rawPhone ?? "");
  if (!phone) { res.status(400).json({ error: "Missing phone" }); return; }

  const [state] = await db
    .select()
    .from(whatsappConversationStatesTable)
    .where(
      and(
        eq(whatsappConversationStatesTable.tenantId, tenantId),
        eq(whatsappConversationStatesTable.phone, phone)
      )
    )
    .limit(1);

  res.json({
    phone,
    needsHuman: state?.needsHuman ?? false,
    botPaused: state?.needsHuman ?? false,
    escalatedAt: state?.escalatedAt ?? null,
  });
});

/* ------------------------------------------------------------------ */
/* PUT /api/copilot/chats/:phone/toggle-bot                             */
/* ------------------------------------------------------------------ */

const ToggleBotBody = z.object({ paused: z.boolean() });

router.put("/copilot/chats/:phone/toggle-bot", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const rawPhone = req.params["phone"];
  const phone = decodeURIComponent(Array.isArray(rawPhone) ? rawPhone[0] ?? "" : rawPhone ?? "");
  if (!phone) { res.status(400).json({ error: "Missing phone" }); return; }

  const parsed = ToggleBotBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Body must be { paused: boolean }" }); return; }

  await upsertHandoff(tenantId, phone, parsed.data.paused);

  res.json({ ok: true, phone, botPaused: parsed.data.paused });
});

export default router;
