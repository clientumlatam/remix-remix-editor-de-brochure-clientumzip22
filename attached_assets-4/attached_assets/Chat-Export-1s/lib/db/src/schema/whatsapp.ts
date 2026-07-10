import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const whatsappMessagesTable = pgTable("whatsapp_messages", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull(),
  contactId: integer("contact_id"),
  phone: text("phone").notNull(),
  contactName: text("contact_name").notNull().default("Desconocido"),
  direction: text("direction").notNull(), // "inbound" | "outbound"
  body: text("body").notNull(),
  fromMe: boolean("from_me").notNull().default(false),
  aiGenerated: boolean("ai_generated").notNull().default(false),
  whatsappMsgId: text("whatsapp_msg_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertWhatsappMessageSchema = createInsertSchema(whatsappMessagesTable).omit({
  id: true,
  createdAt: true,
});

export type WhatsappMessage = typeof whatsappMessagesTable.$inferSelect;
export type InsertWhatsappMessage = z.infer<typeof insertWhatsappMessageSchema>;
