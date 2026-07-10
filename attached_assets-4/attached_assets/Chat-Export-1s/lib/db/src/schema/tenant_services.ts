import { pgTable, varchar, text, timestamp, integer, boolean, index } from "drizzle-orm/pg-core";

export const tenantServicesTable = pgTable(
  "tenant_services",
  {
    id:            varchar("id").primaryKey(),
    tenantId:      integer("tenant_id").notNull(),
    serviceType:   text("service_type").notNull(),
    status:        text("status").notNull().default("inactive"),
    subdomain:     varchar("subdomain"),
    siteUrl:       text("site_url"),
    notes:         text("notes"),
    requestedAt:   timestamp("requested_at", { withTimezone: true }),
    provisionedAt: timestamp("provisioned_at", { withTimezone: true }),
    createdAt:     timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt:     timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_tenant_services_tenant").on(table.tenantId),
    index("idx_tenant_services_tenant_type").on(table.tenantId, table.serviceType),
  ],
);

export type TenantService = typeof tenantServicesTable.$inferSelect;
export type InsertTenantService = typeof tenantServicesTable.$inferInsert;
