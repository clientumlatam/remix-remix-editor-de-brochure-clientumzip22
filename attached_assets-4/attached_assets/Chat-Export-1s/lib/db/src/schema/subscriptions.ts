import { pgTable, varchar, text, timestamp, integer, index, uniqueIndex } from "drizzle-orm/pg-core";

export const subscriptionsTable = pgTable(
  "subscriptions",
  {
    id:               varchar("id").primaryKey(),
    tenantId:         integer("tenant_id").notNull(),
    plan:             text("plan").notNull().default("free"),
    status:           text("status").notNull().default("active"),
    mpPaymentId:      varchar("mp_payment_id"),
    mpPreferenceId:   varchar("mp_preference_id"),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    cancelledAt:      timestamp("cancelled_at", { withTimezone: true }),
    createdAt:        timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt:        timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("idx_subscriptions_tenant_unique").on(table.tenantId),
    index("idx_subscriptions_tenant_status").on(table.tenantId, table.status),
  ],
);

export const paymentEventsTable = pgTable(
  "payment_events",
  {
    id:          varchar("id").primaryKey(),
    tenantId:    integer("tenant_id").notNull(),
    mpPaymentId: varchar("mp_payment_id"),
    plan:        text("plan").notNull(),
    amount:      integer("amount"),
    status:      text("status").notNull(),
    description: text("description").notNull().default(""),
    createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_payment_events_tenant").on(table.tenantId),
    uniqueIndex("idx_payment_events_mp_status").on(table.mpPaymentId, table.status),
  ],
);

export type Subscription = typeof subscriptionsTable.$inferSelect;
export type InsertSubscription = typeof subscriptionsTable.$inferInsert;
export type PaymentEvent = typeof paymentEventsTable.$inferSelect;
