import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Loader2, Users, Target, DollarSign, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AnalyticsData {
  totalContacts: number;
  totalLeads: number;
  totalDealValue: number;
  totalMessages30d: number;
  leadsByStatus: { status: string; count: number }[];
  dealsByStage: { stage: string; count: number }[];
  invoiceStats: Record<string, { count: number; amount: number }>;
  activityBreakdown: { type: string; count: number }[];
}

const STAGE_LABELS: Record<string, string> = {
  prospecting: "Prospección", qualification: "Calificación",
  proposal: "Propuesta", negotiation: "Negociación",
  closed_won: "Ganado", closed_lost: "Perdido",
};
const LEAD_LABELS: Record<string, string> = {
  new: "Nuevo", contacted: "Contactado", qualified: "Calificado",
  proposal: "Propuesta", negotiation: "Negociación",
  won: "Ganado", lost: "Perdido",
};
const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

export default function Analytics() {
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };

  const { data, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const r = await fetch("/api/analytics", { headers });
      return r.json() as Promise<AnalyticsData>;
    },
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  if (!data) return null;

  const kpis = [
    { label: "Contactos", value: data.totalContacts, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Leads", value: data.totalLeads, icon: Target, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Valor deals", value: `$${(data.totalDealValue / 1000).toFixed(0)}K`, icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
    { label: "Mensajes (30d)", value: data.totalMessages30d, icon: MessageCircle, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  const leadChartData = data.leadsByStatus.map(l => ({ name: LEAD_LABELS[l.status] ?? l.status, value: l.count }));
  const dealChartData = data.dealsByStage.map(d => ({ name: STAGE_LABELS[d.stage] ?? d.stage, value: d.count }));
  const activityData = data.activityBreakdown.map(a => ({ name: a.type, value: a.count }));

  const invoiceTotal = Object.values(data.invoiceStats).reduce((s, v) => s + v.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Métricas y estadísticas del negocio</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="pt-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Leads por estado</CardTitle></CardHeader>
          <CardContent>
            {leadChartData.length === 0 ? <p className="text-center text-muted-foreground py-8 text-sm">Sin datos aún</p> : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={leadChartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Deals por etapa</CardTitle></CardHeader>
          <CardContent>
            {dealChartData.length === 0 ? <p className="text-center text-muted-foreground py-8 text-sm">Sin datos aún</p> : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={dealChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                    {dealChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Actividades por tipo</CardTitle></CardHeader>
          <CardContent>
            {activityData.length === 0 ? <p className="text-center text-muted-foreground py-8 text-sm">Sin actividades aún</p> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={activityData} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Resumen de facturas</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(data.invoiceStats).map(([status, { count, amount }]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{status}</span>
                  <div className="text-right">
                    <p className="text-sm font-medium">{count} factura{count !== 1 ? "s" : ""}</p>
                    <p className="text-xs text-muted-foreground">${amount.toLocaleString("es-AR")}</p>
                  </div>
                </div>
              ))}
              {Object.keys(data.invoiceStats).length === 0 && <p className="text-center text-muted-foreground py-4 text-sm">Sin facturas aún</p>}
              {invoiceTotal > 0 && <div className="pt-2 border-t flex justify-between font-semibold"><span>Total</span><span>${invoiceTotal.toLocaleString("es-AR")}</span></div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
