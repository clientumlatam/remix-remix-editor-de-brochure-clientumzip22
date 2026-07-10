import { pgTable, text, serial, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export type FlowNodeType = "trigger" | "message" | "condition" | "action" | "end";

export interface FlowNode {
  id: string;
  type: FlowNodeType;
  label?: string;
  text?: string;
  action?: "escalate" | "create_lead" | "tag_contact" | "webhook";
  condition?: string;
  options?: { label: string; next: string }[];
}

export const whatsappFlowsTable = pgTable("whatsapp_flows", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  triggerKeywords: text("trigger_keywords").notNull().default(""),
  nodes: jsonb("nodes").notNull().default([]),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertWhatsappFlowSchema = createInsertSchema(whatsappFlowsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type WhatsappFlow = typeof whatsappFlowsTable.$inferSelect;
export type InsertWhatsappFlow = z.infer<typeof insertWhatsappFlowSchema>;
