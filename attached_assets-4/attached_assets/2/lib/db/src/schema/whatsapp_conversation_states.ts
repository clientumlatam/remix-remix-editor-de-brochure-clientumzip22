import { pgTable, text, serial, timestamp, integer, boolean, uniqueIndex } from "drizzle-orm/pg-core";

export const whatsappConversationStatesTable = pgTable(
  "whatsapp_conversation_states",
  {
    id: serial("id").primaryKey(),
    tenantId: integer("tenant_id").notNull(),
    phone: text("phone").notNull(),
    needsHuman: boolean("needs_human").notNull().default(false),
    escalatedAt: timestamp("escalated_at", { withTimezone: true }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    escalationReason: text("escalation_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (t) => [uniqueIndex("wa_conv_state_unique_idx").on(t.tenantId, t.phone)]
);

export type WhatsappConversationState = typeof whatsappConversationStatesTable.$inferSelect;
