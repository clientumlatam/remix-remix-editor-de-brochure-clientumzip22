import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Clock, AlertCircle, Loader2, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface TenantService {
  id: string;
  serviceType: string;
  status: string;
  subdomain?: string;
  siteUrl?: string;
  notes?: string;
  requestedAt?: string;
  provisionedAt?: string;
}

interface ServiceEntry {
  type: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  features: readonly string[];
  price: string;
  available: boolean;
  tenantService: TenantService | null;
}

const STATUS_LABELS: Record<string, string> = {
  requested: "Solicitado", provisioning: "Preparando", active: "Activo",
  inactive: "Inactivo", error: "Error", cancelled: "Cancelado",
};
const STATUS_ICON: Record<string, React.ReactNode> = {
  requested: <Clock className="w-3.5 h-3.5 text-yellow-600" />,
  provisioning: <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />,
  active: <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />,
  error: <AlertCircle className="w-3.5 h-3.5 text-red-600" />,
};

export default function Services() {
  const { token } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const { data, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const r = await fetch("/api/services", { headers });
      return r.json() as Promise<{ services: ServiceEntry[] }>;
    },
  });

  const requestMutation = useMutation({
    mutationFn: async (serviceType: string) => {
      const r = await fetch("/api/services/request", {
        method: "POST", headers,
        body: JSON.stringify({ serviceType }),
      });
      if (!r.ok) throw new Error((await r.json()).error ?? "No se pudo enviar la solicitud.");
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["services"] }); toast({ title: "Solicitud enviada. Te contactaremos pronto." }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  const services = data?.services ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Servicios</h1>
        <p className="text-muted-foreground">Amplía las capacidades de tu CRM con servicios adicionales</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map(svc => (
          <Card key={svc.type} className={`relative overflow-hidden ${!svc.available ? "opacity-75" : ""}`}>
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: svc.color }} />
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{svc.icon}</span>
                  <div>
                    <CardTitle className="text-base">{svc.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{svc.tagline}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {svc.tenantService ? (
                    <div className="flex items-center gap-1">
                      {STATUS_ICON[svc.tenantService.status] ?? null}
                      <span className="text-xs font-medium">{STATUS_LABELS[svc.tenantService.status] ?? svc.tenantService.status}</span>
                    </div>
                  ) : !svc.available ? (
                    <Badge variant="outline" className="text-xs">Próximamente</Badge>
                  ) : null}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{svc.description}</p>

              <ul className="space-y-1.5">
                {svc.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-semibold" style={{ color: svc.color }}>{svc.price}</span>
                {svc.available && (
                  svc.tenantService?.status === "active" && svc.tenantService.siteUrl ? (
                    <Button size="sm" variant="outline" asChild>
                      <a href={svc.tenantService.siteUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3.5 h-3.5 mr-1" />Abrir
                      </a>
                    </Button>
                  ) : !svc.tenantService || svc.tenantService.status === "inactive" || svc.tenantService.status === "cancelled" ? (
                    <Button size="sm" onClick={() => requestMutation.mutate(svc.type)} disabled={requestMutation.isPending}>
                      Solicitar
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">En proceso</span>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
