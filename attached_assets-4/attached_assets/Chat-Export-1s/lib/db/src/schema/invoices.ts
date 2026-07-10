import { pgTable, text, serial, timestamp, integer, real, jsonb, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const invoicesTable = pgTable("invoices", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull(),
  number: text("number").notNull(),
  contactId: integer("contact_id").notNull(),
  companyId: integer("company_id"),
  status: text("status").notNull().default("draft"),
  items: jsonb("items").notNull().default([]),
  subtotal: real("subtotal").notNull().default(0),
  tax: real("tax").notNull().default(0),
  total: real("total").notNull().default(0),
  dueDate: date("due_date", { mode: "string" }),
  notes: text("notes"),
  cae: text("cae"),
  caeFechaVencimiento: date("cae_fecha_vencimiento", { mode: "string" }),
  tipoComprobante: text("tipo_comprobante"),
  puntoVenta: integer("punto_venta"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertInvoiceSchema = createInsertSchema(invoicesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoicesTable.$inferSelect;
