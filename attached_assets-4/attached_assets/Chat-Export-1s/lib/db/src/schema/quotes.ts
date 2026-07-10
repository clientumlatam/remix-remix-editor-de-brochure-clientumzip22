import { pgTable, text, serial, timestamp, integer, real, jsonb, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const quotesTable = pgTable("quotes", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull(),
  number: text("number").notNull(),
  contactId: integer("contact_id"),
  companyId: integer("company_id"),
  title: text("title").notNull(),
  status: text("status").notNull().default("draft"),
  items: jsonb("items").notNull().default([]),
  subtotal: real("subtotal").notNull().default(0),
  discount: real("discount").notNull().default(0),
  total: real("total").notNull().default(0),
  validUntil: date("valid_until", { mode: "string" }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertQuoteSchema = createInsertSchema(quotesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type Quote = typeof quotesTable.$inferSelect;
