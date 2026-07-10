/**
 * WhatsApp Flows — visual chatbot flow builder CRUD.
 */
import { Router, type Request } from "express";
import { eq, and } from "drizzle-orm";
import { db, whatsappFlowsTable } from "@workspace/db";
import { requireAuth, type JwtPayload } from "../lib/auth";
import { z } from "zod";

const router = Router();
type AuthRequest = Request & { user: JwtPayload };

/** GET /api/whatsapp/flows */
router.get("/whatsapp/flows", requireAuth, async (req, res): Promise<void> => {
  const tenantId = (req as AuthRequest).user.tenantId;
  const flows = await db
    .select()
    .from(whatsappFlowsTable)
    .where(eq(whatsappFlowsTable.tenantId, tenantId));
  res.json(flows);
});

/** GET /api/whatsapp/flows/:id */
router.get("/whatsapp/flows/:id", requireAuth, async (req, res): Promise<void> => {
  const tenantId = (req as AuthRequest).user.tenantId;
  const id = Number(req.params["id"]);
  const [flow] = await db
    .select()
    .from(whatsappFlowsTable)
    .where(and(eq(whatsappFlowsTable.id, id), eq(whatsappFlowsTable.tenantId, tenantId)));
  if (!flow) { res.status(404).json({ error: "Not found" }); return; }
  res.json(flow);
});

const flowBodySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  triggerKeywords: z.string().optional(),
  nodes: z.array(z.any()).optional(),
  isActive: z.boolean().optional(),
});

/** POST /api/whatsapp/flows */
router.post("/whatsapp/flows", requireAuth, async (req, res): Promise<void> => {
  const tenantId = (req as AuthRequest).user.tenantId;
  const parsed = flowBodySchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [flow] = await db
    .insert(whatsappFlowsTable)
    .values({
      tenantId,
      name: parsed.data.name,
      description: parsed.data.description ?? "",
      triggerKeywords: parsed.data.triggerKeywords ?? "",
      nodes: parsed.data.nodes ?? [],
      isActive: parsed.data.isActive ?? false,
    })
    .returning();
  res.status(201).json(flow);
});

/** PATCH /api/whatsapp/flows/:id */
router.patch("/whatsapp/flows/:id", requireAuth, async (req, res): Promise<void> => {
  const tenantId = (req as AuthRequest).user.tenantId;
  const id = Number(req.params["id"]);

  const patchSchema = flowBodySchema.partial();
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updateData["name"] = parsed.data.name;
  if (parsed.data.description !== undefined) updateData["description"] = parsed.data.description;
  if (parsed.data.triggerKeywords !== undefined) updateData["triggerKeywords"] = parsed.data.triggerKeywords;
  if (parsed.data.nodes !== undefined) updateData["nodes"] = parsed.data.nodes;
  if (parsed.data.isActive !== undefined) updateData["isActive"] = parsed.data.isActive;

  const [flow] = await db
    .update(whatsappFlowsTable)
    .set(updateData as never)
    .where(and(eq(whatsappFlowsTable.id, id), eq(whatsappFlowsTable.tenantId, tenantId)))
    .returning();

  if (!flow) { res.status(404).json({ error: "Not found" }); return; }
  res.json(flow);
});

/** DELETE /api/whatsapp/flows/:id */
router.delete("/whatsapp/flows/:id", requireAuth, async (req, res): Promise<void> => {
  const tenantId = (req as AuthRequest).user.tenantId;
  const id = Number(req.params["id"]);
  await db
    .delete(whatsappFlowsTable)
    .where(and(eq(whatsappFlowsTable.id, id), eq(whatsappFlowsTable.tenantId, tenantId)));
  res.status(204).end();
});

export default router;
