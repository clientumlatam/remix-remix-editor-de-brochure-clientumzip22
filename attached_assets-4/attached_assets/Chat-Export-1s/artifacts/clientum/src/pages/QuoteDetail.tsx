import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useGetQuote, useCreateQuote, useUpdateQuote, useListProducts, useListContacts, useListCompanies, getListQuotesQueryKey, getGetQuoteQueryKey, QuoteInputStatus, QuoteUpdateStatus } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Trash2, Search, Package, Save, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";

interface QuoteItem {
  productId?: number;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

function formatARS(n: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
}

const STATUS_OPTIONS = [
  { value: "draft", label: "Borrador" },
  { value: "sent", label: "Enviada" },
  { value: "accepted", label: "Aceptada" },
  { value: "rejected", label: "Rechazada" },
  { value: "expired", label: "Vencida" },
];

export default function QuoteDetail() {
  const [, params] = useRoute("/app/quotes/:id");
  const [, navigate] = useLocation();
  const isNew = params?.id === "new";
  const id = isNew ? null : parseInt(params?.id ?? "");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: quote } = useGetQuote(id!, { query: { enabled: !isNew && !!id, queryKey: getGetQuoteQueryKey(id!) } });
  const { data: products = [] } = useListProducts();
  const { data: contacts = [] } = useListContacts();
  const { data: companies = [] } = useListCompanies();

  const createQuote = useCreateQuote();
  const updateQuote = useUpdateQuote();

  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("draft");
  const [contactId, setContactId] = useState<string>("");
  const [companyId, setCompanyId] = useState<string>("");
  const [validUntil, setValidUntil] = useState("");
  const [notes, setNotes] = useState("");
  const [discount, setDiscount] = useState(0);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [productPickerOpen, setProductPickerOpen] = useState(false);

  useEffect(() => {
    if (quote) {
      setTitle(quote.title);
      setStatus(quote.status);
      setContactId(quote.contactId ? String(quote.contactId) : "");
      setCompanyId(quote.companyId ? String(quote.companyId) : "");
      setValidUntil(quote.validUntil ?? "");
      setNotes(quote.notes ?? "");
      setDiscount(quote.discount);
      setItems((quote.items as QuoteItem[]) ?? []);
    }
  }, [quote?.id]);

  const subtotal = items.reduce((acc, i) => acc + i.total, 0);
  const total = subtotal - discount;

  function addProduct(p: { id: number; name: string; description?: string | null; price: number }) {
    setItems(prev => {
      const existing = prev.findIndex(i => i.productId === p.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], quantity: updated[existing].quantity + 1, total: (updated[existing].quantity + 1) * updated[existing].unitPrice };
        return updated;
      }
      return [...prev, { productId: p.id, name: p.name, description: p.description ?? undefined, quantity: 1, unitPrice: p.price, total: p.price }];
    });
    setProductPickerOpen(false);
  }

  function addCustomItem() {
    setItems(prev => [...prev, { name: "Servicio personalizado", quantity: 1, unitPrice: 0, total: 0 }]);
  }

  function updateItem(idx: number, field: keyof QuoteItem, value: string | number) {
    setItems(prev => {
      const updated = [...prev];
      const item = { ...updated[idx], [field]: value };
      if (field === "quantity" || field === "unitPrice") {
        item.total = Number(item.quantity) * Number(item.unitPrice);
      }
      updated[idx] = item;
      return updated;
    });
  }

  function removeItem(idx: number) {
    setItems(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleSave(newStatus?: string) {
    if (!title.trim()) { toast({ title: "El título es requerido", variant: "destructive" }); return; }
    const resolvedStatus = newStatus ?? status;
    try {
      if (isNew) {
        const created = await createQuote.mutateAsync({ data: {
          title,
          status: resolvedStatus as QuoteInputStatus,
          contactId: contactId ? parseInt(contactId) : undefined,
          companyId: companyId ? parseInt(companyId) : undefined,
          validUntil: validUntil || undefined,
          notes: notes || undefined,
          discount,
          items,
        }});
        qc.invalidateQueries({ queryKey: getListQuotesQueryKey() });
        toast({ title: "Cotización creada" });
        navigate(`/app/quotes/${created.id}`);
      } else {
        await updateQuote.mutateAsync({ id: id!, data: {
          title,
          status: resolvedStatus as QuoteUpdateStatus,
          contactId: contactId ? parseInt(contactId) : undefined,
          companyId: companyId ? parseInt(companyId) : undefined,
          validUntil: validUntil || undefined,
          notes: notes || undefined,
          discount,
          items,
        }});
        qc.invalidateQueries({ queryKey: getListQuotesQueryKey() });
        qc.invalidateQueries({ queryKey: getGetQuoteQueryKey(id!) });
        if (newStatus) setStatus(newStatus);
        toast({ title: "Cotización guardada" });
      }
    } catch {
      toast({ title: "Error al guardar", variant: "destructive" });
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.category ?? "").toLowerCase().includes(productSearch.toLowerCase())
  );

  const isSaving = createQuote.isPending || updateQuote.isPending;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Link href="/app/quotes">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-900">
            {isNew ? "Nueva cotización" : `Cotización ${quote?.number ?? ""}`}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave()} disabled={isSaving} className="gap-2">
            <Save className="w-4 h-4" />
            Guardar
          </Button>
          {status === "draft" && (
            <Button onClick={() => handleSave("sent")} disabled={isSaving} className="gap-2">
              <Send className="w-4 h-4" />
              Guardar y enviar
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left — main form */}
        <div className="col-span-2 space-y-4">
          {/* Header info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Información general</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Título *</label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Propuesta de integración API para Empresa XYZ" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Contacto</label>
                  <Select value={contactId || "none"} onValueChange={v => setContactId(v === "none" ? "" : v)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar contacto" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin contacto</SelectItem>
                      {contacts.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Empresa</label>
                  <Select value={companyId || "none"} onValueChange={v => setCompanyId(v === "none" ? "" : v)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar empresa" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin empresa</SelectItem>
                      {companies.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Estado</label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Válida hasta</label>
                  <Input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Ítems de la cotización</CardTitle>
                <div className="flex gap-2">
                  <Dialog open={productPickerOpen} onOpenChange={setProductPickerOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                        <Package className="w-3.5 h-3.5" />
                        Agregar producto
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Seleccionar producto/servicio</DialogTitle>
                      </DialogHeader>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Buscar por nombre o categoría..."
                          value={productSearch}
                          onChange={e => setProductSearch(e.target.value)}
                          className="pl-9"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-80 overflow-y-auto space-y-1 mt-2">
                        {filteredProducts.length === 0 ? (
                          <p className="text-center text-gray-400 py-8 text-sm">Sin resultados</p>
                        ) : (
                          filteredProducts.map(p => (
                            <button
                              key={p.id}
                              onClick={() => addProduct(p)}
                              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                            >
                              <div className="flex items-center justify-between">
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate">{p.name}</p>
                                  {p.category && <p className="text-xs text-gray-500">{p.category}</p>}
                                </div>
                                <span className="text-sm font-semibold text-gray-900 ml-4 shrink-0">{formatARS(p.price)}</span>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button size="sm" variant="ghost" className="gap-1.5 text-xs" onClick={addCustomItem}>
                    <Plus className="w-3.5 h-3.5" />
                    Ítem manual
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
                  <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Agregá productos o servicios a la cotización</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 px-1 mb-1">
                    <div className="col-span-5">Descripción</div>
                    <div className="col-span-2 text-right">Cant.</div>
                    <div className="col-span-3 text-right">Precio unit.</div>
                    <div className="col-span-1 text-right">Total</div>
                    <div className="col-span-1" />
                  </div>
                  {items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-gray-50 rounded-lg p-2">
                      <div className="col-span-5">
                        <Input
                          value={item.name}
                          onChange={e => updateItem(idx, "name", e.target.value)}
                          className="h-8 text-sm"
                          placeholder="Nombre del ítem"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={e => updateItem(idx, "quantity", parseFloat(e.target.value) || 0)}
                          className="h-8 text-sm text-right"
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          min={0}
                          value={item.unitPrice}
                          onChange={e => updateItem(idx, "unitPrice", parseFloat(e.target.value) || 0)}
                          className="h-8 text-sm text-right"
                        />
                      </div>
                      <div className="col-span-1 text-right">
                        <span className="text-sm font-medium text-gray-900">{formatARS(item.total)}</span>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <Button size="icon" variant="ghost" className="w-7 h-7 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => removeItem(idx)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Notas</CardTitle></CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Términos, condiciones, observaciones..."
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right — summary */}
        <div className="space-y-4">
          <Card className="sticky top-6">
            <CardHeader className="pb-3"><CardTitle className="text-base">Resumen</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatARS(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Descuento</span>
                  <div className="w-28">
                    <Input
                      type="number"
                      min={0}
                      value={discount}
                      onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
                      className="h-7 text-sm text-right"
                    />
                  </div>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span className="text-blue-700">{formatARS(total)}</span>
                </div>
              </div>

              <Button className="w-full gap-2 mt-2" onClick={() => handleSave()} disabled={isSaving}>
                <Save className="w-4 h-4" />
                {isSaving ? "Guardando..." : "Guardar cotización"}
              </Button>

              {status === "draft" && (
                <Button variant="outline" className="w-full gap-2" onClick={() => handleSave("sent")} disabled={isSaving}>
                  <Send className="w-4 h-4" />
                  Marcar como enviada
                </Button>
              )}

              <div className="pt-2 space-y-1 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Ítems</span><span>{items.length}</span>
                </div>
                {quote?.number && (
                  <div className="flex justify-between">
                    <span>Número</span><span className="font-mono">{quote.number}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
