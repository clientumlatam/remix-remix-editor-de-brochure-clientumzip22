import { pgTable, varchar, text, timestamp, integer, jsonb, index } from "drizzle-orm/pg-core";

export const ordersTable = pgTable(
  "orders",
  {
    id:              varchar("id").primaryKey(),
    tenantId:        integer("tenant_id").notNull(),
    orderNumber:     varchar("order_number", { length: 50 }).notNull(),
    contactName:     varchar("contact_name", { length: 255 }).notNull(),
    contactPhone:    varchar("contact_phone", { length: 50 }).notNull(),
    contactEmail:    varchar("contact_email", { length: 255 }),
    status:          text("status").notNull().default("pending"),
    totalAmount:     integer("total_amount").notNull().default(0),
    currency:        varchar("currency", { length: 10 }).notNull().default("ARS"),
    notes:           text("notes").notNull().default(""),
    deliveryAddress: text("delivery_address").notNull().default(""),
    channel:         text("channel").notNull().default("manual"),
    createdAt:       timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt:       timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    deletedAt:       timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("idx_orders_tenant").on(table.tenantId),
    index("idx_orders_status").on(table.tenantId, table.status),
    index("idx_orders_created").on(table.tenantId, table.createdAt),
  ],
);

export const orderItemsTable = pgTable(
  "order_items",
  {
    id:          varchar("id").primaryKey(),
    orderId:     varchar("order_id").notNull().references(() => ordersTable.id, { onDelete: "cascade" }),
    productName: varchar("product_name", { length: 255 }).notNull(),
    quantity:    integer("quantity").notNull().default(1),
    unitPrice:   integer("unit_price").notNull().default(0),
    totalPrice:  integer("total_price").notNull().default(0),
    notes:       text("notes").notNull().default(""),
    metadata:    jsonb("metadata"),
  },
  (table) => [
    index("idx_order_items_order").on(table.orderId),
  ],
);

export const orderStatusHistoryTable = pgTable(
  "order_status_history",
  {
    id:         varchar("id").primaryKey(),
    orderId:    varchar("order_id").notNull().references(() => ordersTable.id, { onDelete: "cascade" }),
    fromStatus: text("from_status").notNull().default(""),
    toStatus:   text("to_status").notNull(),
    note:       text("note").notNull().default(""),
    createdAt:  timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_order_history_order").on(table.orderId),
  ],
);

export type Order = typeof ordersTable.$inferSelect;
export type InsertOrder = typeof ordersTable.$inferInsert;
export type OrderItem = typeof orderItemsTable.$inferSelect;
export type OrderStatusHistory = typeof orderStatusHistoryTable.$inferSelect;
