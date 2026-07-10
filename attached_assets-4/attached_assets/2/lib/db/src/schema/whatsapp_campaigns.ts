import { pgTable, text, serial, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const whatsappCampaignsTable = pgTable("whatsapp_campaigns", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull(),
  name: text("name").notNull(),
  message: text("message").notNull(),
  filter: text("filter").notNull().default("all"),
  status: text("status").notNull().default("draft"),
  sentCount: integer("sent_count").notNull().default(0),
  failedCount: integer("failed_count").notNull().default(0),
  totalRecipients: integer("total_recipients").notNull().default(0),
  recipientSnapshot: jsonb("recipient_snapshot").notNull().default([]),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertWhatsappCampaignSchema = createInsertSchema(whatsappCampaignsTable).omit({
  id: true, createdAt: true, updatedAt: true,
});

export type WhatsappCampaign = typeof whatsappCampaignsTable.$inferSelect;
export type InsertWhatsappCampaign = z.infer<typeof insertWhatsappCampaignSchema>;
