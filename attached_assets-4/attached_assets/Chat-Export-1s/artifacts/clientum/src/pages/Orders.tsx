import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, ShoppingCart, Phone, Loader2, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface OrderItem { productName: string; quantity: number; unitPrice: number; notes?: string }
interface Order {
  id: string; orderNumber: string; contactName: string; contactPhone: string;
  status: string; totalAmount: number; currency: string; notes: string;
  deliveryAddress: string; channel: string; createdAt: string;
  items?: OrderItem[];
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente", confirmed: "Confirmado", preparing: "En preparación",
  shipped: "En camino", delivered: "Entregado", cancelled: "Cancelado",
};
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800", confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-purple-100 text-purple-800", shipped: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800", cancelled: "bg-red-100 text-red-800",
};
const NEXT_STATUS: Record<string, string> = {
  pending: "confirmed", confirmed: "preparing", preparing: "shipped", shipped: "delivered",
};

export default function Orders() {
  const { token } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [form, setForm] = useState({ contactName: "", contactPhone: "", notes: "", deliveryAddress: "" });
  const [items, setItems] = useState<OrderItem[]>([{ productName: "", quantity: 1, unitPrice: 0 }]);

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const { data, isLoading } = useQuery({
    queryKey: ["orders", filterStatus],
    queryFn: async () => {
      const params = filterStatus !== "all" ? `?status=${filterStatus}` : "";
      const r = await fetch(`/api/orders${params}`, { headers });
      return r.json() as Promise<{ orders: Order[]; total: number }>;
    },
  });

  const { data: statsData } = useQuery({
    queryKey: ["orders-stats"],
    queryFn: async () => {
      const r = await fetch("/api/orders/stats", { headers });
      return r.json() as Promise<{ stats: Record<string, number> }>;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/orders", { method: "POST", headers, body: JSON.stringify({ ...form, items }) });
      if (!r.ok) throw new Error((await r.json()).error ?? "No se pudo crear el pedido.");
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["orders"] }); qc.invalidateQueries({ queryKey: ["orders-stats"] }); setOpen(false); toast({ title: "Pedido creado" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const advanceStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const r = await fetch(`/api/orders/${id}/status`, { method: "PATCH", headers, body: JSON.stringify({ status }) });
      if (!r.ok) throw new Error((await r.json()).error ?? "No se pudo actualizar el estado.");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["orders"] }); qc.invalidateQueries({ queryKey: ["orders-stats"] }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const s = statsData?.stats;
  const statCards = [
    { label: "Pendientes", key: "pending", color: "text-yellow-600" },
    { label: "En prep.", key: "preparing", color: "text-purple-600" },
    { label: "En camino", key: "shipped", color: "text-orange-600" },
    { label: "Entregados", key: "delivered", color: "text-green-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pedidos</h1>
          <p className="text-muted-foreground">Gestión de pedidos de clientes</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Nuevo pedido</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Nuevo pedido</DialogTitle></DialogHeader>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              <Input placeholder="Nombre del cliente *" value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))} />
              <Input placeholder="Teléfono *" value={form.contactPhone} onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))} />
              <Input placeholder="Dirección de entrega" value={form.deliveryAddress} onChange={e => setForm(f => ({ ...f, deliveryAddress: e.target.value }))} />
              <Input placeholder="Notas" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              <div className="space-y-2">
                <p className="text-sm font-medium">Productos</p>
                {items.map((item, i) => (
                  <div key={i} className="grid grid-cols-5 gap-1">
                    <Input className="col-span-2" placeholder="Producto" value={item.productName} onChange={e => { const ni = [...items]; ni[i].productName = e.target.value; setItems(ni); }} />
                    <Input type="number" placeholder="Qty" value={item.quantity} onChange={e => { const ni = [...items]; ni[i].quantity = Number(e.target.value); setItems(ni); }} />
                    <Input type="number" placeholder="Precio" value={item.unitPrice} onChange={e => { const ni = [...items]; ni[i].unitPrice = Number(e.target.value); setItems(ni); }} />
                    <Button variant="outline" size="sm" onClick={() => setItems(items.filter((_, j) => j !== i))}>✕</Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setItems([...items, { productName: "", quantity: 1, unitPrice: 0 }])}>+ Agregar producto</Button>
              </div>
              <div className="text-sm font-medium">Total: ${items.reduce((s, i) => s + i.unitPrice * i.quantity, 0).toLocaleString("es-AR")}</div>
              <Button className="w-full" onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !form.contactName || !form.contactPhone}>
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Crear pedido
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {s && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map(({ label, key, color }) => (
            <Card key={key}><CardContent className="pt-4"><p className="text-sm text-muted-foreground">{label}</p><p className={`text-2xl font-bold ${color}`}>{s[key] ?? 0}</p></CardContent></Card>
          ))}
        </div>
      )}

      <Select value={filterStatus} onValueChange={setFilterStatus}>
        <SelectTrigger className="w-44"><SelectValue placeholder="Estado" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
        </SelectContent>
      </Select>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {(data?.orders ?? []).length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No hay pedidos para mostrar</CardContent></Card>
          ) : (
            (data?.orders ?? []).map(order => (
              <Card key={order.id}>
                <CardContent className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <ShoppingCart className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium">{order.contactName} <span className="text-xs text-muted-foreground ml-1">{order.orderNumber}</span></p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{order.contactPhone}</span>
                        <span className="font-medium text-foreground">${order.totalAmount.toLocaleString("es-AR")}</span>
                        <span>{new Date(order.createdAt).toLocaleDateString("es-AR")}</span>
                      </div>
                      {order.deliveryAddress && <p className="text-xs text-muted-foreground">{order.deliveryAddress}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge className={STATUS_COLORS[order.status] ?? ""}>{STATUS_LABELS[order.status] ?? order.status}</Badge>
                    {NEXT_STATUS[order.status] && (
                      <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => advanceStatus.mutate({ id: order.id, status: NEXT_STATUS[order.status] })}>
                        <ChevronRight className="w-3 h-3 mr-1" />{STATUS_LABELS[NEXT_STATUS[order.status]]}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
