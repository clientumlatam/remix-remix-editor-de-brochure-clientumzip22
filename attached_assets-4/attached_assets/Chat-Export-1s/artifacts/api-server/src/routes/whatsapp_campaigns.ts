/**
 * WhatsApp mass campaigns API.
 * Routes: GET/POST /api/whatsapp/campaigns, GET/DELETE /:id, POST /:id/send
 */
import { Router, type Request } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, whatsappCampaignsTable, contactsTable, whatsappMessagesTable } from "@workspace/db";
import { requireAuth, type JwtPayload } from "../lib/auth";
import { whatsAppManager } from "../services/whatsapp-manager";
import { z } from "zod";

const router = Router();
type AuthRequest = Request & { user: JwtPayload };

const createSchema = z.object({
  name: z.string().min(1).max(120),
  message: z.string().min(1).max(4096),
  filter: z.enum(["all", "contacts_with_phone", "has_conversation"]).default("contacts_with_phone"),
});

/** GET /api/whatsapp/campaigns */
router.get("/whatsapp/campaigns", requireAuth, async (req, res): Promise<void> => {
  const tenantId = (req as AuthRequest).user.tenantId;
  const rows = await db
    .select()
    .from(whatsappCampaignsTable)
    .where(eq(whatsappCampaignsTable.tenantId, tenantId))
    .orderBy(desc(whatsappCampaignsTable.createdAt));
  res.json(rows);
});

/** POST /api/whatsapp/campaigns */
router.post("/whatsapp/campaigns", requireAuth, async (req, res): Promise<void> => {
  const tenantId = (req as AuthRequest).user.tenantId;
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { name, message, filter } = parsed.data;

  const [campaign] = await db
    .insert(whatsappCampaignsTable)
    .values({ tenantId, name, message, filter, status: "draft" })
    .returning();

  res.status(201).json(campaign);
});

/** DELETE /api/whatsapp/campaigns/:id */
router.delete("/whatsapp/campaigns/:id", requireAuth, async (req, res): Promise<void> => {
  const tenantId = (req as AuthRequest).user.tenantId;
  const id = Number(req.params["id"]);
  if (!id) { res.status(400).json({ error: "Invalid id" }); return; }

  await db
    .delete(whatsappCampaignsTable)
    .where(and(eq(whatsappCampaignsTable.id, id), eq(whatsappCampaignsTable.tenantId, tenantId)));

  res.status(204).end();
});

/** POST /api/whatsapp/campaigns/:id/send */
router.post("/whatsapp/campaigns/:id/send", requireAuth, async (req, res): Promise<void> => {
  const tenantId = (req as AuthRequest).user.tenantId;
  const id = Number(req.params["id"]);
  if (!id) { res.status(400).json({ error: "Invalid id" }); return; }

  const [campaign] = await db
    .select()
    .from(whatsappCampaignsTable)
    .where(and(eq(whatsappCampaignsTable.id, id), eq(whatsappCampaignsTable.tenantId, tenantId)))
    .limit(1);

  if (!campaign) { res.status(404).json({ error: "Campaign not found" }); return; }
  if (campaign.status === "sending" || campaign.status === "sent") {
    res.status(409).json({ error: "Campaign already sent or in progress" });
    return;
  }

  // Resolve recipients based on filter
  let phones: { phone: string; name: string }[] = [];

  if (campaign.filter === "has_conversation") {
    // Only contacts that already have a WA conversation
    const msgs = await db
      .selectDistinctOn([whatsappMessagesTable.phone], {
        phone: whatsappMessagesTable.phone,
        contactName: whatsappMessagesTable.contactName,
      })
      .from(whatsappMessagesTable)
      .where(eq(whatsappMessagesTable.tenantId, tenantId));
    phones = msgs.map(m => ({ phone: m.phone, name: m.contactName }));
  } else {
    // contacts_with_phone (default) or "all" — contacts that have a phone number
    const contacts = await db
      .select({ phone: contactsTable.phone, name: contactsTable.name })
      .from(contactsTable)
      .where(eq(contactsTable.tenantId, tenantId));
    phones = contacts
      .filter(c => c.phone && c.phone.trim().length > 5)
      .map(c => ({ phone: c.phone!.replace(/\D/g, ""), name: c.name }));
  }

  // Mark campaign as sending
  await db
    .update(whatsappCampaignsTable)
    .set({ status: "sending", totalRecipients: phones.length, recipientSnapshot: phones })
    .where(eq(whatsappCampaignsTable.id, id));

  res.json({ status: "sending", totalRecipients: phones.length });

  // Fire-and-forget: send messages with 1.5s delay between each
  (async () => {
    let sent = 0;
    let failed = 0;

    for (const recipient of phones) {
      try {
        const jid = `${recipient.phone}@s.whatsapp.net`;
        await whatsAppManager.sendMessage(tenantId, jid, campaign.message);

        await db.insert(whatsappMessagesTable).values({
          tenantId,
          phone: recipient.phone,
          contactName: recipient.name,
          direction: "outbound",
          fromMe: true,
          aiGenerated: false,
          body: campaign.message,
        });

        sent++;
      } catch {
        failed++;
      }

      // Throttle: 1.5s between sends to avoid rate limits
      await new Promise(r => setTimeout(r, 1500));
    }

    await db
      .update(whatsappCampaignsTable)
      .set({
        status: "sent",
        sentCount: sent,
        failedCount: failed,
        sentAt: new Date(),
      })
      .where(eq(whatsappCampaignsTable.id, id));
  })().catch(() => {
    db.update(whatsappCampaignsTable)
      .set({ status: "failed" })
      .where(eq(whatsappCampaignsTable.id, id))
      .catch(() => {});
  });
});

/** GET /api/whatsapp/campaigns/:id/preview-count — estimate recipient count */
router.get("/whatsapp/campaigns/preview-count", requireAuth, async (req, res): Promise<void> => {
  const tenantId = (req as AuthRequest).user.tenantId;
  const filter = (req.query["filter"] as string) ?? "contacts_with_phone";

  let count = 0;

  if (filter === "has_conversation") {
    const rows = await db
      .selectDistinctOn([whatsappMessagesTable.phone], { phone: whatsappMessagesTable.phone })
      .from(whatsappMessagesTable)
      .where(eq(whatsappMessagesTable.tenantId, tenantId));
    count = rows.length;
  } else {
    const contacts = await db
      .select({ phone: contactsTable.phone })
      .from(contactsTable)
      .where(eq(contactsTable.tenantId, tenantId));
    count = contacts.filter(c => c.phone && c.phone.trim().length > 5).length;
  }

  res.json({ count });
});

export default router;
