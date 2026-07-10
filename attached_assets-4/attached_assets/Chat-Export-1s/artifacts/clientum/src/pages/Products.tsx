import { useState, useRef, useCallback } from "react";
import { useListProducts, useCreateProduct, getListProductsQueryKey } from "@workspace/api-client-react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Loader2, Package, ExternalLink, Tag, RefreshCw, CheckCircle2, ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const STORAGE_KEY = "clientum_auth";
function getToken(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as { token?: string }).token ?? null : null;
  } catch { return null; }
}

function authFetch(path: string, init: RequestInit = {}) {
  const token = getToken();
  return fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init.headers },
  });
}

type ProductWithSource = {
  id: number;
  name: string;
  sku: string | null;
  category: string | null;
  categories: string[];
  stock: number;
  price: number;
  regularPrice: number | null;
  salePrice: number | null;
  onSale: boolean;
  source?: "crm" | "woocommerce";
  stockStatus?: string | null;
  imageUrl?: string | null;
  permalink?: string | null;
  description?: string | null;
};

function formatPrice(n: number) {
  return `$${n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function StockBadge({ product }: { product: ProductWithSource }) {
  if (product.source === "woocommerce" && product.stockStatus) {
    const map: Record<string, { label: string; className: string }> = {
      instock: { label: product.stock > 0 ? String(product.stock) : "En stock", className: "bg-green-50 text-green-700" },
      onbackorder: { label: "Bajo pedido", className: "bg-yellow-50 text-yellow-700" },
      outofstock: { label: "Sin stock", className: "bg-red-50 text-red-700" },
    };
    const entry = map[product.stockStatus] ?? { label: product.stockStatus, className: "bg-gray-50 text-gray-700" };
    return <span className={`px-2 py-1 rounded text-xs font-medium ${entry.className}`}>{entry.label}</span>;
  }
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${product.stock < 10 ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
      {product.stock}
    </span>
  );
}

export default function Products() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const { data, isLoading } = useListProducts({ search });
  const products = data as ProductWithSource[] | undefined;
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<ProductWithSource | null>(null);
  const [syncDone, setSyncDone] = useState(false);
  type MlState = { running: boolean; filled: number; processed: number; total: number | null; error: string | null; done: boolean };
  const [mlState, setMlState] = useState<MlState | null>(null);
  const mlRunningRef = useRef(false);

  const wcCount = products?.filter(p => p.source === "woocommerce").length ?? 0;
  const crmCount = products?.filter(p => p.source === "crm").length ?? 0;

  const { data: wcStatus } = useQuery({
    queryKey: ["woocommerce-status"],
    queryFn: async () => {
      const r = await authFetch("/api/integrations/woocommerce/status");
      return r.ok ? (r.json() as Promise<{ connected: boolean; syncedAt: string | null; productCount: number }>) : null;
    },
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const r = await authFetch("/api/integrations/woocommerce/sync", { method: "POST" });
      if (!r.ok) throw new Error("Sync failed");
      return r.json() as Promise<{ synced: number }>;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
      queryClient.invalidateQueries({ queryKey: ["woocommerce-status"] });
      setSyncDone(true);
      setTimeout(() => setSyncDone(false), 3000);
      console.log(`Synced ${result.synced} products`);
    },
  });

  const noImgCount = products?.filter(p => p.source === "woocommerce" && !p.imageUrl).length ?? 0;

  const startMlFill = useCallback(async () => {
    mlRunningRef.current = true;
    setMlState({ running: true, filled: 0, processed: 0, total: null, error: null, done: false });
    let totalFilled = 0;
    let totalProcessed = 0;
    try {
      while (mlRunningRef.current) {
        const r = await authFetch("/api/products/fill-images-from-ml", { method: "POST" });
        if (!r.ok) throw new Error(`Error del servidor (${r.status})`);
        const data = await r.json() as { filled: number; notFound: number; requestFailed: number; processed: number; total: number; hasMore: boolean };
        totalFilled += data.filled;
        totalProcessed += data.processed;
        setMlState({ running: true, filled: totalFilled, processed: totalProcessed, total: data.total + (totalProcessed - data.processed), error: null, done: false });
        if (!data.hasMore || data.processed === 0) break;
        await new Promise(res => setTimeout(res, 200));
      }
      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
      setMlState({ running: false, filled: totalFilled, processed: totalProcessed, total: totalProcessed, error: null, done: true });
      setTimeout(() => setMlState(null), 6000);
    } catch (err) {
      setMlState({ running: false, filled: totalFilled, processed: totalProcessed, total: null, error: err instanceof Error ? err.message : "Error desconocido", done: false });
      setTimeout(() => setMlState(null), 8000);
    } finally {
      mlRunningRef.current = false;
    }
  }, [queryClient]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Productos e Inventario</h1>
          <p className="text-gray-500 text-sm">
            {!isLoading && (wcCount > 0 || crmCount > 0)
              ? [wcCount > 0 && `${wcCount} de WooCommerce`, crmCount > 0 && `${crmCount} propios`].filter(Boolean).join(" · ")
              : "Catálogo de productos"}
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {wcStatus?.connected && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => syncMutation.mutate()}
                disabled={syncMutation.isPending}
                className={syncDone ? "border-green-300 text-green-700" : ""}
              >
                {syncMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sincronizando...</>
                ) : syncDone ? (
                  <><CheckCircle2 className="w-4 h-4 mr-2" />¡Listo!</>
                ) : (
                  <><RefreshCw className="w-4 h-4 mr-2" />Sincronizar WooCommerce</>
                )}
              </Button>
              {(noImgCount > 0 || mlState !== null) && (
                <div className="flex flex-col items-end gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={startMlFill}
                    disabled={mlState?.running === true}
                    className={
                      mlState?.done
                        ? "border-green-300 text-green-700"
                        : mlState?.error
                        ? "border-red-300 text-red-700"
                        : "border-orange-200 text-orange-700 hover:border-orange-300 hover:bg-orange-50"
                    }
                  >
                    {mlState?.running ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {mlState.total !== null
                          ? `${mlState.processed} / ${mlState.total}...`
                          : "Buscando imágenes..."}
                      </>
                    ) : mlState?.done ? (
                      <><CheckCircle2 className="w-4 h-4 mr-2" />{mlState.filled} imágenes completadas</>
                    ) : mlState?.error ? (
                      <><ImageIcon className="w-4 h-4 mr-2" />Error — reintentar</>
                    ) : (
                      <><ImageIcon className="w-4 h-4 mr-2" />Completar imágenes ({noImgCount})</>
                    )}
                  </Button>
                  {mlState?.error && (
                    <p className="text-xs text-red-600">{mlState.error}</p>
                  )}
                </div>
              )}
            </>
          )}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar productos..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <CreateProductDialog open={isOpen} onOpenChange={setIsOpen} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
              <TableHead>Producto</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead>Origen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
                </TableCell>
              </TableRow>
            ) : products?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <Package className="w-10 h-10 text-gray-300 mb-2" />
                    No se encontraron productos.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              products?.map((product) => (
                <TableRow
                  key={`${product.source ?? "crm"}-${product.id}`}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelected(product)}
                >
                  <TableCell className="font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-8 h-8 rounded object-cover border border-gray-100 flex-shrink-0"
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded border border-gray-100 bg-gray-50 flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4 text-gray-300" />
                        </div>
                      )}
                      <span className="truncate max-w-xs">{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-500 font-mono text-xs">{product.sku || "-"}</TableCell>
                  <TableCell className="text-gray-600">{product.category || "-"}</TableCell>
                  <TableCell className="text-right"><StockBadge product={product} /></TableCell>
                  <TableCell className="text-right font-medium text-gray-900">
                    {product.onSale && product.salePrice != null ? (
                      <div className="flex flex-col items-end">
                        <span className="text-green-700 font-semibold">{formatPrice(product.salePrice)}</span>
                        <span className="text-xs text-gray-400 line-through">{formatPrice(product.regularPrice ?? product.price)}</span>
                      </div>
                    ) : product.price > 0 ? formatPrice(product.price) : "-"}
                  </TableCell>
                  <TableCell>
                    {product.source === "woocommerce" ? (
                      <Badge variant="secondary" className="text-xs bg-purple-50 text-purple-700 border-purple-200">WooCommerce</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">CRM</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ProductDrawer product={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function ProductDrawer({ product, onClose }: { product: ProductWithSource | null; onClose: () => void }) {
  return (
    <Sheet open={!!product} onOpenChange={open => { if (!open) onClose(); }}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        {product && (
          <>
            <SheetHeader className="pb-4">
              <SheetTitle className="text-lg font-semibold leading-tight pr-6">{product.name}</SheetTitle>
            </SheetHeader>

            {product.imageUrl && (
              <div className="mb-5 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full max-h-64 object-contain"
                />
              </div>
            )}

            <div className="space-y-5">
              {/* Price */}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Precio</p>
                {product.onSale && product.salePrice != null ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-green-700">{formatPrice(product.salePrice)}</span>
                    <span className="text-base text-gray-400 line-through">{formatPrice(product.regularPrice ?? product.price)}</span>
                    <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">OFERTA</Badge>
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-gray-900">{product.price > 0 ? formatPrice(product.price) : "Sin precio"}</span>
                )}
              </div>

              <Separator />

              {/* Meta */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {product.sku && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">SKU</p>
                    <p className="font-mono font-medium text-gray-800">{product.sku}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Stock</p>
                  <div><StockBadge product={product} /></div>
                </div>
                {product.categories && product.categories.length > 0 && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-1.5">Categorías</p>
                    <div className="flex flex-wrap gap-1">
                      {product.categories.map(cat => (
                        <span key={cat} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs">
                          <Tag className="w-3 h-3" />{cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Descripción</p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{product.description}</p>
                  </div>
                </>
              )}

              {/* WooCommerce link */}
              {product.permalink && (
                <>
                  <Separator />
                  <a
                    href={product.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-purple-700 hover:text-purple-900 font-medium transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Ver en la tienda WooCommerce
                  </a>
                </>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function CreateProductDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const queryClient = useQueryClient();
  const createProduct = useCreateProduct();
  const [formData, setFormData] = useState({ name: "", sku: "", price: 0, stock: 0 });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProduct.mutate(
      { data: formData },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          onOpenChange(false);
          setFormData({ name: "", sku: "", price: 0, stock: 0 });
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button><Plus className="w-4 h-4 mr-2" /> Agregar producto</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo producto</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" required value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" value={formData.sku} onChange={e => setFormData(p => ({ ...p, sku: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Precio ($)</Label>
              <Input id="price" type="number" min="0" step="0.01" required value={formData.price || ""} onChange={e => setFormData(p => ({ ...p, price: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock inicial</Label>
              <Input id="stock" type="number" min="0" required value={formData.stock || ""} onChange={e => setFormData(p => ({ ...p, stock: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={createProduct.isPending}>
              {createProduct.isPending ? "Guardando..." : "Guardar producto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
