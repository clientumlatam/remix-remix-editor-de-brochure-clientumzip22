import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Loader2, CreditCard, History } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Subscription { plan: string; status: string; currentPeriodEnd: string | null }
interface PaymentEvent { id: string; plan: string; amount: number | null; status: string; description: string; createdAt: string }

const PLANS = [
  { id: "starter",  name: "Starter",  price: "$149.000/mes", features: ["CRM básico", "Chatbot WhatsApp", "Reportes automáticos", "Hasta 100 contactos"] },
  { id: "pro",      name: "Pro",      price: "$299.000/mes", features: ["CRM ilimitado", "IA entrenada", "ERP básico", "Soporte 24/7"] },
  { id: "business", name: "Business", price: "$549.000/mes", features: ["Multi-agente IA", "ERP completo + AFIP", "5 integraciones", "Ejecutivo dedicado"] },
];

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  active: { label: "Activa", class: "bg-green-100 text-green-800" },
  trialing: { label: "Trial", class: "bg-blue-100 text-blue-800" },
  cancelled: { label: "Cancelada", class: "bg-red-100 text-red-800" },
  none: { label: "Sin plan", class: "bg-gray-100 text-gray-800" },
};

export default function Payments() {
  const { token } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const { data: sub } = useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const r = await fetch("/api/payments/subscription", { headers });
      return r.json() as Promise<Subscription>;
    },
  });

  const { data: historyData } = useQuery({
    queryKey: ["payment-history"],
    queryFn: async () => {
      const r = await fetch("/api/payments/history", { headers });
      return r.json() as Promise<{ events: PaymentEvent[] }>;
    },
  });

  const upgradeMutation = useMutation({
    mutationFn: async (planId: string) => {
      const r = await fetch("/api/payments/preference", {
        method: "POST", headers,
        body: JSON.stringify({ planId }),
      });
      if (!r.ok) throw new Error((await r.json()).error ?? "No se pudo completar el pago.");
      return r.json() as Promise<{ initPoint: string }>;
    },
    onSuccess: (data) => { window.open(data.initPoint, "_blank"); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/payments/cancel", { method: "POST", headers });
      if (!r.ok) throw new Error((await r.json()).error ?? "No se pudo cancelar la suscripción.");
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["subscription"] }); toast({ title: "Suscripción cancelada" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const currentPlan = sub?.plan ?? "free";
  const subStatus = sub?.status ?? "none";
  const statusInfo = STATUS_MAP[subStatus] ?? STATUS_MAP.none;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Plan y pagos</h1>
        <p className="text-muted-foreground">Administrá tu suscripción a Clientum</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><CreditCard className="w-4 h-4" />Suscripción actual</CardTitle>
            <Badge className={statusInfo.class}>{statusInfo.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Plan:</span>
            <span className="font-semibold capitalize">{currentPlan === "free" ? "Gratuito" : currentPlan}</span>
          </div>
          {sub?.currentPeriodEnd && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">Próximo cobro:</span>
              <span className="text-sm">{new Date(sub.currentPeriodEnd).toLocaleDateString("es-AR")}</span>
            </div>
          )}
          {(subStatus === "active" || subStatus === "trialing") && currentPlan !== "free" && (
            <Button variant="outline" size="sm" className="text-red-600 border-red-200" onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending}>
              {cancelMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Cancelar suscripción
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map(plan => {
          const isCurrent = currentPlan === plan.id;
          return (
            <Card key={plan.id} className={`relative ${isCurrent ? "border-primary" : ""}`}>
              {isCurrent && <div className="absolute -top-3 left-1/2 -translate-x-1/2"><Badge>Plan actual</Badge></div>}
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{plan.name}</CardTitle>
                <p className="text-lg font-bold text-primary">{plan.price}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full" size="sm" variant={isCurrent ? "outline" : "default"}
                  disabled={isCurrent || upgradeMutation.isPending}
                  onClick={() => !isCurrent && upgradeMutation.mutate(plan.id)}
                >
                  {upgradeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {isCurrent ? "Plan actual" : "Contratar"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {(historyData?.events ?? []).length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><History className="w-4 h-4" />Historial de pagos</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {historyData!.events.map(event => (
                <div key={event.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{event.description}</p>
                    <p className="text-xs text-muted-foreground">{new Date(event.createdAt).toLocaleDateString("es-AR")}</p>
                  </div>
                  <div className="text-right">
                    {event.amount != null && <p className="text-sm font-medium">${event.amount.toLocaleString("es-AR")}</p>}
                    <p className="text-xs text-muted-foreground capitalize">{event.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
