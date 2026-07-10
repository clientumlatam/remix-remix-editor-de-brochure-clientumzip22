import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const whatsappKbTable = pgTable("whatsapp_kb", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").default("general"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertWhatsappKbSchema = createInsertSchema(whatsappKbTable).omit({ id: true, createdAt: true, updatedAt: true });
export type WhatsappKbEntry = typeof whatsappKbTable.$inferSelect;
export type InsertWhatsappKbEntry = z.infer<typeof insertWhatsappKbSchema>;
