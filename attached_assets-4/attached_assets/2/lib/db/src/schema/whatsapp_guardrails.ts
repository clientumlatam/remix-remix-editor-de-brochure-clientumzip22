import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const whatsappGuardrailsTable = pgTable("whatsapp_guardrails", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().unique(),
  blockedKeywords: text("blocked_keywords").notNull().default(""),
  avoidTopics: text("avoid_topics").notNull().default(""),
  escalateAfterTurns: integer("escalate_after_turns").notNull().default(5),
  escalationMessage: text("escalation_message").notNull().default("Voy a derivarte con un agente humano para que te pueda ayudar mejor. ¡Gracias por tu paciencia!"),
  enableProfanityFilter: boolean("enable_profanity_filter").notNull().default(true),
  enableEscalation: boolean("enable_escalation").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertWhatsappGuardrailsSchema = createInsertSchema(whatsappGuardrailsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type WhatsappGuardrails = typeof whatsappGuardrailsTable.$inferSelect;
