import { Router } from "express";
import { requireAuth, type JwtPayload } from "../lib/auth";
import { db, tenantsTable, woocommerceProductsTable } from "@workspace/db";
import { eq, and, count } from "drizzle-orm";
import type { Request } from "express";

const router = Router();

type AuthReq = Request & { user: JwtPayload };

// ── Helper: fetch all pages from WooCommerce REST API ────────────────────────

interface WcProduct {
  id: number;
  name: string;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  stock_status: string;
  stock_quantity: number | null;
  categories: { id: number; name: string; slug: string }[];
  images: { src: string }[];
  permalink: string;
  status: string;
}

async function fetchWooCommerceProducts(
  storeUrl: string,
  consumerKey: string,
  consumerSecret: string
): Promise<WcProduct[]> {
  const base = storeUrl.replace(/\/$/, "");
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  const allProducts: WcProduct[] = [];

  let page = 1;
  const perPage = 100;

  while (true) {
    const url = `${base}/wp-json/wc/v3/products?per_page=${perPage}&page=${page}&status=publish`;
    const res = await fetch(url, {
      headers: { Authorization: `Basic ${auth}` },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`WooCommerce API error ${res.status}: ${body.slice(0, 200)}`);
    }

    const batch: WcProduct[] = await res.json() as WcProduct[];
    if (!Array.isArray(batch) || batch.length === 0) break;

    allProducts.push(...batch);
    if (batch.length < perPage) break;
    page++;
  }

  return allProducts;
}

// ── GET /api/integrations/woocommerce/status ─────────────────────────────────

router.get("/integrations/woocommerce/status", requireAuth, async (req, res) => {
  const { tenantId } = (req as AuthReq).user;

  const [tenant] = await db
    .select({
      woocommerceUrl: tenantsTable.woocommerceUrl,
      woocommerceKey: tenantsTable.woocommerceKey,
      woocommerceSyncedAt: tenantsTable.woocommerceSyncedAt,
    })
    .from(tenantsTable)
    .where(eq(tenantsTable.id, tenantId));

  const [{ value: productCount }] = await db
    .select({ value: count() })
    .from(woocommerceProductsTable)
    .where(eq(woocommerceProductsTable.tenantId, tenantId));

  res.json({
    connected: !!(tenant?.woocommerceUrl && tenant?.woocommerceKey),
    storeUrl: tenant?.woocommerceUrl ?? null,
    syncedAt: tenant?.woocommerceSyncedAt ?? null,
    productCount: Number(productCount),
  });
});

// ── POST /api/integrations/woocommerce/connect ───────────────────────────────

router.post("/integrations/woocommerce/connect", requireAuth, async (req, res) => {
  const { tenantId } = (req as AuthReq).user;
  const { storeUrl, consumerKey, consumerSecret } = req.body as {
    storeUrl: string;
    consumerKey: string;
    consumerSecret: string;
  };

  if (!storeUrl || !consumerKey || !consumerSecret) {
    res.status(400).json({ error: "storeUrl, consumerKey y consumerSecret son requeridos" });
    return;
  }

  // Test the connection by fetching 1 product
  try {
    const base = storeUrl.replace(/\/$/, "");
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
    const testRes = await fetch(`${base}/wp-json/wc/v3/products?per_page=1`, {
      headers: { Authorization: `Basic ${auth}` },
    });
    if (!testRes.ok) {
      const body = await testRes.text().catch(() => "");
      res.status(400).json({ error: `No se pudo conectar con WooCommerce: ${testRes.status} ${body.slice(0, 100)}` });
      return;
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(400).json({ error: `Error de conexión: ${msg}` });
    return;
  }

  await db
    .update(tenantsTable)
    .set({
      woocommerceUrl: storeUrl.replace(/\/$/, ""),
      woocommerceKey: consumerKey,
      woocommerceSecret: consumerSecret,
    })
    .where(eq(tenantsTable.id, tenantId));

  res.json({ ok: true });
});

// ── DELETE /api/integrations/woocommerce/disconnect ──────────────────────────

router.delete("/integrations/woocommerce/disconnect", requireAuth, async (req, res) => {
  const { tenantId } = (req as AuthReq).user;

  await db
    .update(tenantsTable)
    .set({
      woocommerceUrl: null,
      woocommerceKey: null,
      woocommerceSecret: null,
      woocommerceSyncedAt: null,
    })
    .where(eq(tenantsTable.id, tenantId));

  // Remove cached products
  await db
    .delete(woocommerceProductsTable)
    .where(eq(woocommerceProductsTable.tenantId, tenantId));

  res.json({ ok: true });
});

// ── POST /api/integrations/woocommerce/sync ──────────────────────────────────

router.post("/integrations/woocommerce/sync", requireAuth, async (req, res) => {
  const { tenantId } = (req as AuthReq).user;

  const [tenant] = await db
    .select({
      woocommerceUrl: tenantsTable.woocommerceUrl,
      woocommerceKey: tenantsTable.woocommerceKey,
      woocommerceSecret: tenantsTable.woocommerceSecret,
    })
    .from(tenantsTable)
    .where(eq(tenantsTable.id, tenantId));

  if (!tenant?.woocommerceUrl || !tenant?.woocommerceKey || !tenant?.woocommerceSecret) {
    res.status(400).json({ error: "WooCommerce no está configurado para este tenant" });
    return;
  }

  let products: WcProduct[];
  try {
    products = await fetchWooCommerceProducts(
      tenant.woocommerceUrl,
      tenant.woocommerceKey,
      tenant.woocommerceSecret
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(502).json({ error: msg });
    return;
  }

  // Delete existing cached products and re-insert
  await db
    .delete(woocommerceProductsTable)
    .where(eq(woocommerceProductsTable.tenantId, tenantId));

  if (products.length > 0) {
    const rows = products.map((p) => ({
      tenantId,
      wcProductId: p.id,
      name: p.name,
      description: p.description ? stripHtml(p.description).slice(0, 1000) : null,
      shortDescription: p.short_description ? stripHtml(p.short_description).slice(0, 500) : null,
      sku: p.sku || null,
      price: p.price || null,
      regularPrice: p.regular_price || null,
      salePrice: p.sale_price || null,
      onSale: p.on_sale,
      stockStatus: p.stock_status,
      stockQuantity: p.stock_quantity,
      categories: p.categories ?? [],
      imageUrl: p.images?.[0]?.src ?? null,
      permalink: p.permalink,
      status: p.status,
      syncedAt: new Date(),
    }));

    // Insert in batches of 100
    for (let i = 0; i < rows.length; i += 100) {
      await db.insert(woocommerceProductsTable).values(rows.slice(i, i + 100));
    }
  }

  // Update last sync timestamp
  await db
    .update(tenantsTable)
    .set({ woocommerceSyncedAt: new Date() })
    .where(eq(tenantsTable.id, tenantId));

  res.json({ ok: true, synced: products.length });
});

// ── GET /api/integrations/woocommerce/products ───────────────────────────────

router.get("/integrations/woocommerce/products", requireAuth, async (req, res) => {
  const { tenantId } = (req as AuthReq).user;

  const products = await db
    .select()
    .from(woocommerceProductsTable)
    .where(eq(woocommerceProductsTable.tenantId, tenantId))
    .limit(200);

  res.json(products);
});

// ── Helper: strip HTML tags ───────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export default router;
