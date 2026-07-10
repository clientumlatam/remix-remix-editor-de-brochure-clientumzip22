import { pgTable, text, serial, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tenantsTable = pgTable("tenants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  plan: text("plan").notNull().default("starter"),

  /* AFIP / empresa */
  cuit: text("cuit"),
  razonSocial: text("razon_social"),
  condicionIva: text("condicion_iva"),
  puntoVenta: integer("punto_venta"),
  ingresosBrutos: text("ingresos_brutos"),
  domicilioFiscal: text("domicilio_fiscal"),
  inicioActividades: text("inicio_actividades"),

  /* Contacto */
  emailContacto: text("email_contacto"),
  telefono: text("telefono"),
  sitioWeb: text("sitio_web"),

  /* Integraciones */
  webhookSecret: text("webhook_secret"),
  openrouterApiKey: text("openrouter_api_key"),

  /* Chatbot WhatsApp */
  chatbotEnabled: boolean("chatbot_enabled").notNull().default(true),
  chatbotMode: text("chatbot_mode").notNull().default("hybrid"),
  chatbotPersona: text("chatbot_persona"),
  whatomateUrl: text("whatomate_url"),
  whatomateToken: text("whatomate_token"),

  /* Evolution API (WhatsApp gateway) */
  evolutionApiUrl: text("evolution_api_url"),
  evolutionApiKey: text("evolution_api_key"),
  evolutionInstanceId: text("evolution_instance"),

  /* WooCommerce integration */
  woocommerceUrl: text("woocommerce_url"),
  woocommerceKey: text("woocommerce_key"),
  woocommerceSecret: text("woocommerce_secret"),
  woocommerceSyncedAt: timestamp("woocommerce_synced_at", { withTimezone: true }),

  /* Widget Web */
  widgetName: text("widget_name").default("Asistente"),
  widgetColor: text("widget_color").default("#e01b24"),
  widgetWelcome: text("widget_welcome").default("¡Hola! ¿En qué te puedo ayudar? 👋"),

  /* Horarios de atención */
  horariosEnabled: boolean("horarios_enabled").notNull().default(false),
  horariosTimezone: text("horarios_timezone").default("America/Argentina/Buenos_Aires"),
  horariosData: jsonb("horarios_data").$type<Record<string, { enabled: boolean; from: string; to: string }>>(),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertTenantSchema = createInsertSchema(tenantsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Tenant = typeof tenantsTable.$inferSelect;
