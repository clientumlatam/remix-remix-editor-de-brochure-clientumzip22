import { Router, type IRouter } from "express";
import { eq, and, isNull, count } from "drizzle-orm";
import { db, productsTable, woocommerceProductsTable } from "@workspace/db";
import { requireAuth } from "../lib/auth";
import type { JwtPayload } from "../lib/auth";
import type { Request } from "express";
import { z } from "zod";

const ML_SITE_ID = "MLA";
const ML_DELAY_MS = 400;

function cleanProductName(name: string): string {
  return name.replace(/^\(?\w{2,10}\)?[\.\-]\s*/, "").replace(/\s+/g, " ").trim();
}

async function searchMlImage(query: string): Promise<string | null> {
  try {
    const searchUrl = `https://api.mercadolibre.com/sites/${ML_SITE_ID}/search?q=${encodeURIComponent(query)}&limit=1`;
    const searchRes = await fetch(searchUrl, { signal: AbortSignal.timeout(15000) });
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json() as { results?: { id: string; thumbnail?: string }[] };
    const firstResult = searchData.results?.[0];
    if (!firstResult?.id) return null;

    // Try to get HD image from item detail
    const detailRes = await fetch(`https://api.mercadolibre.com/items/${firstResult.id}`, { signal: AbortSignal.timeout(15000) });
    if (detailRes.ok) {
      const detail = await detailRes.json() as { pictures?: { url: string }[] };
      if (detail.pictures?.[0]?.url) return detail.pictures[0].url;
    }

    // Fallback to improved thumbnail
    if (firstResult.thumbnail) return firstResult.thumbnail.replace("-I.jpg", "-O.jpg");
    return null;
  } catch {
    return null;
  }
}

const router: IRouter = Router();
type AuthRequest = Request & { user: JwtPayload };

const ProductInput = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().optional().default(0),
  stock: z.number().int().optional().default(0),
  sku: z.string().optional(),
  category: z.string().optional(),
});

router.get("/products", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const search = req.query["search"] as string | undefined;

  const [crmRows, wcRows] = await Promise.all([
    db.select().from(productsTable)
      .where(eq(productsTable.tenantId, tenantId))
      .orderBy(productsTable.createdAt),
    db.select().from(woocommerceProductsTable)
      .where(eq(woocommerceProductsTable.tenantId, tenantId)),
  ]);

  type NormalizedProduct = {
    id: number;
    tenantId: number;
    name: string;
    description: string | null;
    price: number;
    regularPrice: number | null;
    salePrice: number | null;
    onSale: boolean;
    stock: number;
    sku: string | null;
    category: string | null;
    categories: string[];
    source: "crm" | "woocommerce";
    stockStatus: string | null;
    imageUrl: string | null;
    permalink: string | null;
    createdAt: string;
  };

  const normalized: NormalizedProduct[] = [
    ...crmRows.map(r => ({
      id: r.id,
      tenantId: r.tenantId,
      name: r.name,
      description: r.description ?? null,
      price: r.price,
      regularPrice: null,
      salePrice: null,
      onSale: false,
      stock: r.stock,
      sku: r.sku ?? null,
      category: r.category ?? null,
      categories: r.category ? [r.category] : [],
      source: "crm" as const,
      stockStatus: null,
      imageUrl: null,
      permalink: null,
      createdAt: r.createdAt.toISOString(),
    })),
    ...wcRows.map(r => ({
      id: r.id,
      tenantId: r.tenantId,
      name: r.name,
      description: r.description ?? null,
      price: parseFloat(r.price ?? "0") || 0,
      regularPrice: r.regularPrice ? (parseFloat(r.regularPrice) || null) : null,
      salePrice: r.salePrice ? (parseFloat(r.salePrice) || null) : null,
      onSale: r.onSale ?? false,
      stock: r.stockQuantity ?? 0,
      sku: r.sku ?? null,
      category: r.categories?.[0]?.name ?? null,
      categories: (r.categories ?? []).map((c: { name: string }) => c.name),
      source: "woocommerce" as const,
      stockStatus: r.stockStatus ?? null,
      imageUrl: r.imageUrl ?? null,
      permalink: r.permalink ?? null,
      createdAt: r.syncedAt.toISOString(),
    })),
  ];

  let results = normalized;
  if (search) {
    const s = search.toLowerCase();
    results = normalized.filter(r =>
      r.name.toLowerCase().includes(s) ||
      (r.category ?? "").toLowerCase().includes(s) ||
      (r.sku ?? "").toLowerCase().includes(s)
    );
  }

  res.json(results);
});

router.post("/products", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const parsed = ProductInput.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [product] = await db.insert(productsTable).values({ ...parsed.data, tenantId }).returning();
  res.status(201).json({ ...product, createdAt: product.createdAt.toISOString() });
});

router.patch("/products/:id", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = ProductInput.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [product] = await db.update(productsTable).set(parsed.data)
    .where(and(eq(productsTable.id, id), eq(productsTable.tenantId, tenantId))).returning();

  if (!product) { res.status(404).json({ error: "Product not found" }); return; }
  res.json({ ...product, createdAt: product.createdAt.toISOString() });
});

router.delete("/products/:id", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [product] = await db.delete(productsTable)
    .where(and(eq(productsTable.id, id), eq(productsTable.tenantId, tenantId))).returning();
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }
  res.sendStatus(204);
});

// POST /api/products/fill-images-from-ml
// Processes one batch of up to 50 WooCommerce products without images, searching MercadoLibre for each.
// The frontend calls this repeatedly until hasMore === false.
router.post("/products/fill-images-from-ml", requireAuth, async (req, res): Promise<void> => {
  const { tenantId } = (req as AuthRequest).user;
  const BATCH_SIZE = 50;

  // Count total still missing an image before we start (for progress display)
  const [{ totalRemaining }] = await db
    .select({ totalRemaining: count() })
    .from(woocommerceProductsTable)
    .where(and(eq(woocommerceProductsTable.tenantId, tenantId), isNull(woocommerceProductsTable.imageUrl)));

  const total = Number(totalRemaining);

  if (total === 0) {
    res.json({ filled: 0, notFound: 0, requestFailed: 0, processed: 0, total: 0, hasMore: false });
    return;
  }

  // Always grab the first BATCH_SIZE — already-processed rows vanish from this query
  const rows = await db
    .select({ id: woocommerceProductsTable.id, name: woocommerceProductsTable.name })
    .from(woocommerceProductsTable)
    .where(and(eq(woocommerceProductsTable.tenantId, tenantId), isNull(woocommerceProductsTable.imageUrl)))
    .limit(BATCH_SIZE);

  let filled = 0;
  let notFound = 0;
  let requestFailed = 0;

  for (const row of rows) {
    const query = cleanProductName(row.name);
    const imageUrl = await searchMlImage(query);

    if (imageUrl) {
      await db.update(woocommerceProductsTable).set({ imageUrl }).where(eq(woocommerceProductsTable.id, row.id));
      filled++;
    } else {
      notFound++;
    }

    await new Promise(r => setTimeout(r, ML_DELAY_MS));
  }

  // Count what's left after this batch
  const [{ stillRemaining }] = await db
    .select({ stillRemaining: count() })
    .from(woocommerceProductsTable)
    .where(and(eq(woocommerceProductsTable.tenantId, tenantId), isNull(woocommerceProductsTable.imageUrl)));

  res.json({
    filled,
    notFound,
    requestFailed,
    processed: rows.length,
    total,
    hasMore: Number(stillRemaining) > 0,
  });
});

export default router;
