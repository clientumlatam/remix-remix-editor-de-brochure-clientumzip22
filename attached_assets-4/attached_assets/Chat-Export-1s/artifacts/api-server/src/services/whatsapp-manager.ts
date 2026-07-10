/**
 * WhatsAppManager — Baileys-based multi-tenant WhatsApp session manager.
 *
 * Each tenant gets its own Baileys socket connection.
 * Auth state persists to /tmp/wa-auth-{tenantId}/ for the container lifetime.
 * On incoming messages the bot:
 *  1. Detects escalation keywords → flags conversation as needsHuman, creates CRM activity
 *  2. Otherwise generates an AI reply and sends it back
 */
import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  type WASocket,
  type WAMessage,
} from "@whiskeysockets/baileys";
import pino from "pino";
import QRCode from "qrcode";
import { mkdirSync } from "node:fs";
import { eq, and, sql } from "drizzle-orm";
import {
  db,
  whatsappMessagesTable,
  contactsTable,
  tenantsTable,
  whatsappKbTable,
  whatsappConversationStatesTable,
  activitiesTable,
} from "@workspace/db";
import { openrouter } from "@workspace/integrations-openrouter-ai";
import { logger as rootLogger } from "../lib/logger";

// Silent pino logger for Baileys internals — avoids flooding our log output
const baileysLogger = pino({ level: "silent" });

export type SessionStatus = "disconnected" | "qr_pending" | "connected";

interface TenantSession {
  socket: WASocket | null;
  status: SessionStatus;
  qrDataUrl: string | null;
  phone: string | null;
  retryCount: number;
}

// ── Escalation detection ──────────────────────────────────────────────────────

const ESCALATION_RE =
  /\b(hablar\s+con|persona\s+(real|humana?)?|humano|agente|asesor|operador|no\s+(entiendo|me\s+ayuda?|sirve?)|quiero\s+hablar|necesito\s+hablar|llam[aé]me?|llamen|contacto\s+humano|necesito\s+ayuda\s+urgente|urgen(te|cia)|soporte\s+humano|hablen\s+conmigo|quiero\s+(un\s+)?asesor|están\s+robando|es\s+un\s+fraude|devuelvan|reembolso\s+ya|no\s+funciona\s+nada|pésimo\s+servicio|re\s+mal|muy\s+mal\s+servicio|no\s+me\s+atienden)\b/i;

// Detect implicit frustration: multiple exclamation marks, ALL CAPS words, or repeated questions
const FRUSTRATION_RE = /!{2,}|[A-ZÁÉÍÓÚ]{4,}|\?{2,}|(mismo\s+(mensaje|pregunta)|ya\s+te\s+dije|te\s+lo\s+repito|cuántas\s+veces)/i;

export function isEscalationRequest(text: string): boolean {
  return ESCALATION_RE.test(text);
}

export function isFrustrated(text: string, recentFallbacks: number): boolean {
  return recentFallbacks >= 2 || (recentFallbacks >= 1 && FRUSTRATION_RE.test(text));
}

// ── WhatsApp Manager ──────────────────────────────────────────────────────────

class WhatsAppManager {
  private readonly sessions = new Map<number, TenantSession>();

  private authDir(tenantId: number): string {
    const dir = `/tmp/wa-auth-${tenantId}`;
    mkdirSync(dir, { recursive: true });
    return dir;
  }

  getStatus(tenantId: number): { status: SessionStatus; qrDataUrl: string | null; phone: string | null } {
    const s = this.sessions.get(tenantId);
    if (!s) return { status: "disconnected", qrDataUrl: null, phone: null };
    return { status: s.status, qrDataUrl: s.qrDataUrl, phone: s.phone };
  }

  async connect(tenantId: number): Promise<void> {
    await this.disconnect(tenantId);

    const authDir = this.authDir(tenantId);
    const { state, saveCreds } = await useMultiFileAuthState(authDir);

    let version: [number, number, number] = [2, 3000, 1023170886];
    try {
      const v = await fetchLatestBaileysVersion();
      version = v.version;
    } catch {
      // use fallback version
    }

    const session: TenantSession = {
      socket: null,
      status: "qr_pending",
      qrDataUrl: null,
      phone: null,
      retryCount: 0,
    };
    this.sessions.set(tenantId, session);

    const sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      logger: baileysLogger as any,
      generateHighQualityLinkPreview: false,
      syncFullHistory: false,
      markOnlineOnConnect: false,
    });

    session.socket = sock;
    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
      if (qr) {
        try {
          session.qrDataUrl = await QRCode.toDataURL(qr);
          session.status = "qr_pending";
        } catch (err) {
          rootLogger.error({ tenantId, err }, "Failed to generate QR code");
        }
      }
      if (connection === "open") {
        session.status = "connected";
        session.qrDataUrl = null;
        session.phone = sock.user?.id?.split(":")[0] ?? null;
        session.retryCount = 0;
        rootLogger.info({ tenantId, phone: session.phone }, "WhatsApp connected via Baileys");
      }
      if (connection === "close") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const statusCode = (lastDisconnect?.error as any)?.output?.statusCode as number | undefined;
        const loggedOut = statusCode === DisconnectReason.loggedOut;
        if (!loggedOut && session.retryCount < 5) {
          session.retryCount++;
          session.status = "qr_pending";
          session.socket = null;
          rootLogger.warn({ tenantId, statusCode, attempt: session.retryCount }, "WhatsApp disconnected — reconnecting");
          setTimeout(() => void this.connect(tenantId), 5000 * session.retryCount);
        } else {
          session.status = "disconnected";
          session.socket = null;
          session.qrDataUrl = null;
        }
      }
    });

    sock.ev.on("messages.upsert", ({ messages, type }) => {
      if (type !== "notify") return;
      for (const msg of messages) {
        if (msg.key.fromMe) continue;
        this.handleIncomingMessage(tenantId, msg).catch((err: unknown) => {
          rootLogger.error({ tenantId, err }, "Error processing incoming WhatsApp message");
        });
      }
    });
  }

  async disconnect(tenantId: number): Promise<void> {
    const session = this.sessions.get(tenantId);
    if (session?.socket) {
      try { session.socket.end(undefined); } catch { /* ignore */ }
    }
    this.sessions.set(tenantId, {
      socket: null, status: "disconnected",
      qrDataUrl: null, phone: null, retryCount: 0,
    });
  }

  async sendMessage(tenantId: number, jid: string, text: string): Promise<void> {
    const session = this.sessions.get(tenantId);
    if (!session?.socket || session.status !== "connected") {
      throw new Error(`WhatsApp not connected for tenant ${tenantId}`);
    }
    await session.socket.sendMessage(jid, { text });
  }

  // ── Incoming message handler ──────────────────────────────────────────────

  private async handleIncomingMessage(tenantId: number, msg: WAMessage): Promise<void> {
    const jid = msg.key.remoteJid ?? "";
    if (!jid || jid.endsWith("@g.us")) return;

    const phone = jid.split("@")[0] ?? "";
    const rawMsg = msg.message;
    const text =
      rawMsg?.conversation ??
      rawMsg?.extendedTextMessage?.text ??
      rawMsg?.imageMessage?.caption ?? "";
    const pushName = (msg as WAMessage & { pushName?: string }).pushName ?? "Contacto WhatsApp";

    if (!phone || !text) return;

    const [tenant] = await db.select().from(tenantsTable).where(eq(tenantsTable.id, tenantId));
    if (!tenant) return;

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

    // Save inbound message
    await db.insert(whatsappMessagesTable).values({
      tenantId, contactId: contact!.id, phone,
      contactName: contact!.name, direction: "inbound",
      fromMe: false, body: text, whatsappMsgId: msg.key.id ?? undefined,
    });

    if (!tenant.chatbotEnabled) return;

    // ── Escalation detection ──────────────────────────────────────────────
    if (isEscalationRequest(text)) {
      await this.escalateConversation(tenantId, phone, contact!, jid, text);
      return;
    }

    // ── AI reply ─────────────────────────────────────────────────────────
    const history = await db.select().from(whatsappMessagesTable)
      .where(and(eq(whatsappMessagesTable.tenantId, tenantId), eq(whatsappMessagesTable.phone, phone)))
      .orderBy(whatsappMessagesTable.createdAt).limit(30);

    const allKbEntries = await db
      .select({ question: whatsappKbTable.question, answer: whatsappKbTable.answer })
      .from(whatsappKbTable).where(eq(whatsappKbTable.tenantId, tenantId));

    const relevantKb = filterRelevantKb(text, allKbEntries);
    const systemPrompt = buildSystemPrompt(tenant.chatbotPersona, relevantKb, contact!.name);
    const aiHistory = history.map((m) => ({
      role: m.fromMe ? ("assistant" as const) : ("user" as const),
      content: m.body,
    }));

    const FALLBACK = "Gracias por tu mensaje. Te responderemos a la brevedad.";
    let aiReply = FALLBACK;

    // Primary model → fallback model if it fails
    const models = [
      "meta-llama/llama-3.3-8b-instruct:free",
      "google/gemma-3-12b-it:free",
    ];
    for (const model of models) {
      try {
        const response = await openrouter.chat.completions.create({
          model,
          max_tokens: 300,
          temperature: 0.7,
          messages: [{ role: "system", content: systemPrompt }, ...aiHistory],
        });
        const candidate = response.choices[0]?.message?.content?.trim() ?? "";
        if (candidate && candidate !== FALLBACK) {
          aiReply = candidate;
          break;
        }
      } catch (err: unknown) {
        rootLogger.warn({ tenantId, model, err }, "AI model failed — trying next");
      }
    }

    // Count recent fallbacks to detect when bot is stuck
    const recentFallbacks = history
      .slice(-6)
      .filter((m) => m.fromMe && m.body === FALLBACK && m.aiGenerated).length;

    // Escalate if bot is stuck or user is frustrated
    if (aiReply === FALLBACK && isFrustrated(text, recentFallbacks)) {
      await this.escalateConversation(tenantId, phone, contact!, jid, "Bot sin respuesta útil repetidamente");
      return;
    }

    await db.insert(whatsappMessagesTable).values({
      tenantId, contactId: contact!.id, phone,
      contactName: contact!.name, direction: "outbound",
      fromMe: true, aiGenerated: true, body: aiReply,
    });

    try {
      await this.sendMessage(tenantId, jid, aiReply);
    } catch (err: unknown) {
      rootLogger.error({ tenantId, err }, "Failed to send WhatsApp reply via Baileys");
    }
  }

  // ── Escalation ────────────────────────────────────────────────────────────

  private async escalateConversation(
    tenantId: number,
    phone: string,
    contact: { id: number; name: string },
    jid: string,
    reason: string
  ): Promise<void> {
    const escalationMsg = "Entendido. Ahora te comunico con uno de nuestros asesores. En breve te contactamos. 🙏";

    // 1. Mark conversation as needs human
    await db
      .insert(whatsappConversationStatesTable)
      .values({ tenantId, phone, needsHuman: true, escalatedAt: new Date(), escalationReason: reason })
      .onConflictDoUpdate({
        target: [whatsappConversationStatesTable.tenantId, whatsappConversationStatesTable.phone],
        set: {
          needsHuman: true,
          escalatedAt: sql`NOW()`,
          resolvedAt: null,
          escalationReason: reason,
          updatedAt: sql`NOW()`,
        },
      });

    // 2. Create CRM activity
    await db.insert(activitiesTable).values({
      tenantId,
      type: "task",
      title: `⚠️ WhatsApp: ${contact.name} solicita atención humana`,
      contactId: contact.id,
      notes: `Número: ${phone}\nMotivo: ${reason}\nEl bot escaló automáticamente la conversación.`,
      date: new Date(),
      completed: false,
    });

    // 3. Save escalation reply to DB + send
    await db.insert(whatsappMessagesTable).values({
      tenantId, contactId: contact.id, phone,
      contactName: contact.name, direction: "outbound",
      fromMe: true, aiGenerated: true, body: escalationMsg,
    });

    try {
      await this.sendMessage(tenantId, jid, escalationMsg);
    } catch (err: unknown) {
      rootLogger.error({ tenantId, err }, "Failed to send escalation message");
    }

    rootLogger.info({ tenantId, phone, contact: contact.name, reason }, "Conversation escalated to human");
  }
}

// Filter KB to only entries relevant to the current user message (keyword overlap)
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
  // Always include entries with at least 1 hit; fill remaining slots with top entries
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

  const base =
    persona?.trim() ||
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
    const kbSection = kbEntries.map((e) => `P: ${e.question}\nR: ${e.answer}`).join("\n\n");
    parts.push(`## Información de la empresa\nUsá esto para responder con precisión:\n\n${kbSection}`);
  }
  return parts.join("\n\n");
}

export const whatsAppManager = new WhatsAppManager();
