/**
 * WhatsApp webhooks.
 *
 *  - POST /api/webhooks/whatsapp/evolution   — Evolution API format (Baileys / WA Web)
 *  - POST /api/webhooks/whatsapp/whatomate   — Meta Cloud API format (from Whatomate)
 *  - GET  /api/webhooks/whatsapp/whatomate   — Meta webhook verification challenge
 */
import { Router } from "express";
import { eq, and, sql } from "drizzle-orm";
import {
  db, tenantsTable, contactsTable, whatsappMessagesTable,
  whatsappKbTable, whatsappConversationStatesTable, activitiesTable,
} from "@workspace/db";
import { isEscalationRequest, isFrustrated } from "../services/whatsapp-manager";
import { z } from "zod";

const router = Router();

// ── Helpers ──────────────────────────────────────────────────────────────────

function normalisePhone(raw: string): string {
  return raw.replace(/@.*$/, "").replace(/[^\d+]/g, "");
}

function filterRelevantKb(
  query: string,
  entries: { question: string; answer: string }[],
  maxEntries = 8
): { question: string; answer: string }[] {
  if (entries.length === 0) return [];
  const queryWords = new Set(
    query.toLowerCase().split(/\W+/).filter((w) => w.length > 3)
  );
  const scored = entries.map((e) => {
    const words = (e.question + " " + e.answer).toLowerCase().split(/\W+/);
    const hits = words.filter((w) => queryWords.has(w)).length;
    return { entry: e, hits };
  });
  scored.sort((a, b) => b.hits - a.hits);
  const relevant = scored.filter((s) => s.hits > 0).slice(0, maxEntries).map((s) => s.entry);
  if (relevant.length < 3) {
    const extras = scored
      .filter((s) => s.hits === 0)
      .slice(0, maxEntries - relevant.length)
      .map((s) => s.entry);
    return [...relevant, ...extras];
  }
  return relevant;
}

function buildSystemPrompt(
  persona: string | null | undefined,
  kbEntries: { question: string; answer: string }[],
  contactName?: string
): string {
  const greeting = contactName && contactName !== "Contacto WhatsApp"
    ? `El nombre del cliente es ${contactName}.` : "";
  const base = persona?.trim() ||
    `Sos un asistente comercial de WhatsApp para una empresa argentina.
Respondés mensajes de clientes de manera amigable, profesional y concisa.
Ayudás con: consultas de productos, precios, disponibilidad, pedidos y atención al cliente.
Respondé SIEMPRE en español argentino (tuteo, vos/sos/te). Nunca uses "usted".
Sé breve y directo — máximo 3 oraciones por respuesta.
No uses markdown ni asteriscos, solo texto plano apto para WhatsApp.
Si no sabés algo, decí "Ahora te consulto con un asesor" en vez de inventar.
No repitas el saludo si ya hubo mensajes previos.`;
  const parts: string[] = [base];
  if (greeting) parts.push(greeting);
  if (kbEntries.length > 0) {
    const kb = kbEntries.map((e) => `P: ${e.question}\nR: ${e.answer}`).join("\n\n");
    parts.push(`## Información de la empresa\nUsá esto para responder con precisión:\n\n${kb}`);
  }
  return parts.join("\n\n");
}

async function handleInboundMessage(opts: {
  tenantId: number;
  phone: string;
  pushName: string;
  text: string;
  msgId?: string;
  tenant: typeof tenantsTable.$inferSelect;
}): Promise<void> {
  const { tenantId, phone, pushName, text, msgId, tenant } = opts;

  // Find or create contact
  let contact = (
    await db.select().from(contactsTable)
      .where(and(eq(contactsTable.tenantId, tenantId), eq(contactsTable.phone, phone)))
  )[0];

  if (!contact) {
    [contact] = await db.insert(contactsTable).values({
      tenantId, name: pushName,
      email: `${phone}@whatsapp.placeholder`,
      phone, status: "prospect",
      notes: "Creado automáticamente desde WhatsApp",
    }).returning();
  }

  // Save inbound
  await db.insert(whatsappMessagesTable).values({
    tenantId, contactId: contact!.id, phone,
    contactName: contact!.name, direction: "inbound",
    fromMe: false, body: text, whatsappMsgId: msgId,
  });

  if (!tenant.chatbotEnabled) return;

  // Escalation detection
  if (isEscalationRequest(text)) {
    await db.insert(whatsappConversationStatesTable)
      .values({ tenantId, phone, needsHuman: true, escalatedAt: new Date(), escalationReason: text })
      .onConflictDoUpdate({
        target: [whatsappConversationStatesTable.tenantId, whatsappConversationStatesTable.phone],
        set: { needsHuman: true, escalatedAt: sql`NOW()`, resolvedAt: null, escalationReason: text, updatedAt: sql`NOW()` },
      });
    await db.insert(activitiesTable).values({
      tenantId, type: "task",
      title: `⚠️ WhatsApp: ${contact!.name} solicita atención humana`,
      contactId: contact!.id,
      notes: `Número: ${phone}\nMotivo: ${text}\nEl bot escaló la conversación.`,
      date: new Date(), completed: false,
    });
    const escalationMsg = "Entendido. Ahora te comunico con uno de nuestros asesores. En breve te contactamos. 🙏";
    await db.insert(whatsappMessagesTable).values({
      tenantId, contactId: contact!.id, phone,
      contactName: contact!.name, direction: "outbound",
      fromMe: true, aiGenerated: true, body: escalationMsg,
    });
    return;
  }

  // AI reply via tenant's OpenRouter key
  if (!tenant.openrouterApiKey) return;

  const [history, allKbEntries] = await Promise.all([
    db.select().from(whatsappMessagesTable)
      .where(and(eq(whatsappMessagesTable.tenantId, tenantId), eq(whatsappMessagesTable.phone, phone)))
      .orderBy(whatsappMessagesTable.createdAt).limit(30),
    db.select({ question: whatsappKbTable.question, answer: whatsappKbTable.answer })
      .from(whatsappKbTable).where(eq(whatsappKbTable.tenantId, tenantId)),
  ]);

  const relevantKb = filterRelevantKb(text, allKbEntries);
  const systemPrompt = buildSystemPrompt(tenant.chatbotPersona, relevantKb, contact!.name);
  const aiHistory = history.map((m) => ({
    role: m.fromMe ? ("assistant" as const) : ("user" as const),
    content: m.body,
  }));

  const FALLBACK = "Gracias por tu mensaje. Te responderemos a la brevedad.";
  let aiReply = FALLBACK;

  const { createOpenRouterClient } = await import("@workspace/integrations-openrouter-ai");
  const client = createOpenRouterClient(tenant.openrouterApiKey);
  const models = [
    "meta-llama/llama-3.3-8b-instruct:free",
    "google/gemma-3-12b-it:free",
  ];
  for (const model of models) {
    try {
      const response = await client.chat.completions.create({
        model,
        max_tokens: 300,
        temperature: 0.7,
        messages: [{ role: "system", content: systemPrompt }, ...aiHistory],
      });
      const candidate = response.choices[0]?.message?.content?.trim() ?? "";
      if (candidate && candidate !== FALLBACK) { aiReply = candidate; break; }
    } catch { /* try next model */ }
  }

  const recentFallbacks = history
    .slice(-6)
    .filter((m) => m.fromMe && m.body === FALLBACK && m.aiGenerated).length;

  if (aiReply === FALLBACK && isFrustrated(text, recentFallbacks)) {
    const escalationMsg = "Entendido. Ahora te comunico con uno de nuestros asesores. En breve te contactamos. 🙏";
    await db.insert(whatsappConversationStatesTable)
      .values({ tenantId, phone, needsHuman: true, escalatedAt: new Date(), escalationReason: text })
      .onConflictDoUpdate({
        target: [whatsappConversationStatesTable.tenantId, whatsappConversationStatesTable.phone],
        set: { needsHuman: true, escalatedAt: sql`NOW()`, resolvedAt: null, escalationReason: text, updatedAt: sql`NOW()` },
      });
    await db.insert(activitiesTable).values({
      tenantId, type: "task",
      title: `⚠️ WhatsApp: ${contact!.name} sin respuesta útil del bot`,
      contactId: contact!.id,
      notes: `Número: ${phone}\nÚltimo mensaje: ${text}\nEl bot escaló automáticamente.`,
      date: new Date(), completed: false,
    });
    await db.insert(whatsappMessagesTable).values({
      tenantId, contactId: contact!.id, phone,
      contactName: contact!.name, direction: "outbound",
      fromMe: true, aiGenerated: true, body: escalationMsg,
    });
    return;
  }

  await db.insert(whatsappMessagesTable).values({
    tenantId, contactId: contact!.id, phone,
    contactName: contact!.name, direction: "outbound",
    fromMe: true, aiGenerated: true, body: aiReply,
  });
}

// ── Meta Cloud API webhook format (Whatomate) ─────────────────────────────

const MetaMessagePayload = z.object({
  object: z.string(),
  entry: z.array(z.object({
    id: z.string(),
    changes: z.array(z.object({
      value: z.object({
        messaging_product: z.string().optional(),
        metadata: z.object({
          display_phone_number: z.string().optional(),
          phone_number_id: z.string().optional(),
        }).optional(),
        contacts: z.array(z.object({
          profile: z.object({ name: z.string() }),
          wa_id: z.string(),
        })).optional(),
        messages: z.array(z.object({
          from: z.string(),
          id: z.string(),
          type: z.string(),
          text: z.object({ body: z.string() }).optional(),
          image: z.object({ caption: z.string().optional() }).optional(),
          timestamp: z.string().optional(),
        })).optional(),
        statuses: z.array(z.any()).optional(),
      }),
      field: z.string().optional(),
    })),
  })),
});

/* GET /api/webhooks/whatsapp/whatomate — Meta verification challenge */
router.get("/webhooks/whatsapp/whatomate", (req, res): void => {
  const mode = req.query["hub.mode"] as string;
  const token = req.query["hub.verify_token"] as string;
  const challenge = req.query["hub.challenge"] as string;

  if (mode === "subscribe" && token) {
    // Any tenant with matching whatomateToken is valid
    db.select({ id: tenantsTable.id })
      .from(tenantsTable)
      .where(eq(tenantsTable.whatomateToken, token))
      .then(([tenant]) => {
        if (tenant) {
          res.status(200).send(challenge);
        } else {
          res.status(403).json({ error: "Invalid verify_token" });
        }
      })
      .catch(() => res.status(500).json({ error: "DB error" }));
  } else {
    res.status(400).json({ error: "Invalid request" });
  }
});

/* POST /api/webhooks/whatsapp/whatomate — inbound messages from Whatomate */
router.post("/webhooks/whatsapp/whatomate", async (req, res): Promise<void> => {
  // Respond immediately to prevent retries
  res.status(200).json({ ok: true });

  const parsed = MetaMessagePayload.safeParse(req.body);
  if (!parsed.success) return;

  for (const entry of parsed.data.entry) {
    for (const change of entry.changes) {
      const value = change.value;
      const messages = value.messages ?? [];

      for (const msg of messages) {
        if (msg.type !== "text" && msg.type !== "image") continue;

        const phone = normalisePhone(msg.from);
        const text = msg.text?.body ?? msg.image?.caption ?? "";
        if (!phone || !text) continue;

        // Find name from contacts array
        const contactEntry = (value.contacts ?? []).find((c) => c.wa_id === msg.from);
        const pushName = contactEntry?.profile.name ?? "Contacto WhatsApp";

        // Find tenant by whatomate phone number match (or first configured tenant)
        // Use display_phone_number from metadata to match tenant
        const phoneNumberId = value.metadata?.phone_number_id ?? "";
        let tenant: typeof tenantsTable.$inferSelect | undefined;

        if (phoneNumberId) {
          // Find tenant whose whatomateUrl contains this phone number ID via SQL LIKE.
          const [matched] = await db.select().from(tenantsTable)
            .where(sql`${tenantsTable.whatomateUrl} LIKE ${"%" + phoneNumberId + "%"}`)
            .limit(1);
          if (matched) {
            tenant = matched;
          } else {
            // Fall back to the first tenant with any whatomateUrl configured
            const [fallback] = await db.select().from(tenantsTable)
              .where(sql`${tenantsTable.whatomateUrl} IS NOT NULL`).limit(1);
            tenant = fallback;
          }
        } else {
          const [t] = await db.select().from(tenantsTable)
            .where(sql`${tenantsTable.whatomateUrl} IS NOT NULL`).limit(1);
          tenant = t;
        }

        if (!tenant) continue;

        await handleInboundMessage({
          tenantId: tenant.id, phone, pushName, text, msgId: msg.id, tenant,
        }).catch((err: unknown) => {
          req.log.error({ err, phone, tenantId: tenant!.id }, "handleInboundMessage failed (whatomate)");
        });
      }
    }
  }
});

// ── Evolution API webhook (Baileys — works with any phone number) ──────────

const EvolutionPayload = z.object({
  event: z.string(),
  instance: z.string().optional(),
  data: z.object({
    key: z.object({
      remoteJid: z.string(),
      fromMe: z.boolean().optional().default(false),
      id: z.string().optional(),
    }),
    pushName: z.string().optional(),
    message: z.object({
      conversation: z.string().optional(),
      extendedTextMessage: z.object({ text: z.string() }).optional(),
      imageMessage: z.object({ caption: z.string().optional() }).optional(),
    }).optional(),
  }),
});

router.post("/webhooks/whatsapp/evolution", async (req, res): Promise<void> => {
  const secret = (req.query["secret"] as string | undefined) ?? "";
  if (!secret) { res.status(401).json({ error: "Missing secret" }); return; }

  const [tenant] = await db.select().from(tenantsTable).where(eq(tenantsTable.webhookSecret, secret));
  if (!tenant) { res.status(401).json({ error: "Invalid secret" }); return; }

  const parsed = EvolutionPayload.safeParse(req.body);
  if (!parsed.success) { res.json({ ok: false, reason: "unrecognised payload" }); return; }

  const { data, event } = parsed.data;
  if (event !== "messages.upsert" || data.key.fromMe) { res.json({ ok: true, skipped: true }); return; }

  const phone = normalisePhone(data.key.remoteJid);
  const text = data.message?.conversation ?? data.message?.extendedTextMessage?.text ?? data.message?.imageMessage?.caption ?? "";
  if (!phone || !text) { res.json({ ok: false, reason: "could not parse phone or text" }); return; }

  res.json({ ok: true });
  await handleInboundMessage({ tenantId: tenant.id, phone, pushName: data.pushName ?? "Contacto WhatsApp", text, msgId: data.key.id, tenant }).catch((err: unknown) => {
    req.log.error({ err, phone, tenantId: tenant.id }, "handleInboundMessage failed (evolution)");
  });
});

export default router;
