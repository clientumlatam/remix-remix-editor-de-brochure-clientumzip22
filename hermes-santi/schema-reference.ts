// schema-reference.ts
// Referencia de las tablas que la integración espera. NO es tu schema real —
// es una guía para que compares con tu `db/schema.ts` actual y ajustes nombres.
// Si tus tablas ya existen con otros nombres, no crees estas: solo mapeá
// los nombres en api-routes-scaffold.ts a los tuyos.

import { pgTable, uuid, text, varchar, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyName: text('company_name').notNull(),
  industry: varchar('industry', { length: 120 }),
  contactName: text('contact_name'),          // nombre del empleado/contacto resuelto por el scraper
  contactPhone: varchar('contact_phone', { length: 30 }),
  contactRole: varchar('contact_role', { length: 120 }), // cargo del empleado, si el scraper lo trae
  status: varchar('status', { length: 20 }).default('pendiente'),
  // valores esperados: pendiente | contactado | caliente | tibio | frio | agendado
  source: varchar('source', { length: 60 }),   // de qué scraper/búsqueda vino
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const brochures = pgTable('brochures', {
  id: uuid('id').primaryKey().defaultRandom(),
  leadId: uuid('lead_id').notNull().references(() => leads.id),
  content: text('content').notNull(),          // texto del brochure generado por IA
  hook: text('hook'),                           // el gancho/dato personalizado principal, si lo separás
  metadata: jsonb('metadata'),                  // datos crudos usados para generarlo
  createdAt: timestamp('created_at').defaultNow(),
});

export const crmNotes = pgTable('crm_notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  leadId: uuid('lead_id').notNull().references(() => leads.id),
  summary: text('summary').notNull(),
  author: varchar('author', { length: 60 }).default('santi'), // 'santi' o el nombre de quien loguea
  createdAt: timestamp('created_at').defaultNow(),
});
