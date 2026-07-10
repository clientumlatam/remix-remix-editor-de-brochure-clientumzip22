import {
  pgTable,
  text,
  serial,
  timestamp,
  integer,
  real,
  boolean,
  index,
} from "drizzle-orm/pg-core";

export const copilotSuggestionsTable = pgTable(
  "copilot_suggestions",
  {
    id: serial("id").primaryKey(),
    tenantId: integer("tenant_id").notNull(),
    userId: integer("user_id"),
    phone: text("phone").notNull().default(""),
    contactName: text("contact_name"),
    contactId: integer("contact_id"),
    tone: text("tone").notNull().default("amigable"),
    messagesCount: integer("messages_count").notNull().default(0),
    suggestion: text("suggestion").notNull(),
    accepted: boolean("accepted"),
    hadDebtAlert: boolean("had_debt_alert").notNull().default(false),
    debtAmount: real("debt_amount"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("cop_sug_tenant_idx").on(t.tenantId),
    index("cop_sug_tenant_created_idx").on(t.tenantId, t.createdAt),
  ]
);

export type CopilotSuggestion = typeof copilotSuggestionsTable.$inferSelect;
