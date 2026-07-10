import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, conversations, messages, tenantsTable } from "@workspace/db";
import { requireAuth } from "../../lib/auth";
import type { JwtPayload } from "../../lib/auth";
import type { Request } from "express";
import { z } from "zod";
import { createOpenRouterClient } from "@workspace/integrations-openrouter-ai";

const router: IRouter = Router();
type AuthRequest = Request & { user: JwtPayload };

const MODEL = "google/gemma-3-12b-it:free";

const SYSTEM_PROMPT = `Eres un asistente de CRM inteligente para una empresa argentina. 
Ayudas con: gestión de contactos, leads, deals, propuestas comerciales, seguimiento de clientes y análisis de ventas.
Responde siempre en español de Argentina. Sé conciso y profesional.`;

async function getTenantApiKey(tenantId: number): Promise<string | null> {
  const [tenant] = await db.select({ openrouterApiKey: tenantsTable.openrouterApiKey })
    .from(tenantsTable)
    .where(eq(tenantsTable.id, tenantId));
  return tenant?.openrouterApiKey ?? process.env.OPENROUTER_API_KEY ?? null;
}

router.get("/openrouter/conversations", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const rows = await db.select().from(conversations)
    .where(eq(conversations.tenantId, tenantId))
    .orderBy(conversations.createdAt);
  res.json(rows);
});

router.post("/openrouter/conversations", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const parsed = z.object({ title: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [conv] = await db.insert(conversations).values({ title: parsed.data.title, tenantId }).returning();
  res.status(201).json(conv);
});

router.get("/openrouter/conversations/:id", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [conv] = await db.select().from(conversations)
    .where(eq(conversations.id, id));
  if (!conv || conv.tenantId !== tenantId) { res.status(404).json({ error: "Not found" }); return; }

  const msgs = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(messages.createdAt);
  res.json({ ...conv, messages: msgs });
});

router.delete("/openrouter/conversations/:id", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
  if (!conv || conv.tenantId !== tenantId) { res.status(404).json({ error: "Not found" }); return; }

  await db.delete(messages).where(eq(messages.conversationId, id));
  await db.delete(conversations).where(eq(conversations.id, id));
  res.sendStatus(204);
});

router.get("/openrouter/conversations/:id/messages", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
  if (!conv || conv.tenantId !== tenantId) { res.status(404).json({ error: "Not found" }); return; }

  const msgs = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(messages.createdAt);
  res.json(msgs);
});

router.post("/openrouter/conversations/:id/messages", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = z.object({ content: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const apiKey = await getTenantApiKey(tenantId);
  if (!apiKey) {
    res.status(402).json({ error: "API key de OpenRouter no configurada. Agregála en Configuración → IA." });
    return;
  }

  const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
  if (!conv || conv.tenantId !== tenantId) { res.status(404).json({ error: "Not found" }); return; }

  await db.insert(messages).values({ conversationId: id, role: "user", content: parsed.data.content });

  const history = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(messages.createdAt);

  const chatMessages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    ...history.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
  ];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let fullResponse = "";

  try {
    const client = createOpenRouterClient(apiKey);
    const stream = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 8192,
      messages: chatMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    await db.insert(messages).values({ conversationId: id, role: "assistant", content: fullResponse });
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  } catch (err: any) {
    res.write(`data: ${JSON.stringify({ error: err.message ?? "AI error" })}\n\n`);
  }

  res.end();
});

export default router;
