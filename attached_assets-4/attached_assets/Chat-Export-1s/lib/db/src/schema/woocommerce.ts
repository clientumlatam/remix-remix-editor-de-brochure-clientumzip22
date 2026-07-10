import { pgTable, text, serial, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";

export const woocommerceProductsTable = pgTable("woocommerce_products", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull(),
  wcProductId: integer("wc_product_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  shortDescription: text("short_description"),
  sku: text("sku"),
  price: text("price"),
  regularPrice: text("regular_price"),
  salePrice: text("sale_price"),
  onSale: boolean("on_sale").default(false),
  stockStatus: text("stock_status"),
  stockQuantity: integer("stock_quantity"),
  categories: jsonb("categories").$type<{ id: number; name: string; slug: string }[]>(),
  imageUrl: text("image_url"),
  permalink: text("permalink"),
  status: text("status"),
  syncedAt: timestamp("synced_at", { withTimezone: true }).notNull().defaultNow(),
});

export type WoocommerceProduct = typeof woocommerceProductsTable.$inferSelect;
