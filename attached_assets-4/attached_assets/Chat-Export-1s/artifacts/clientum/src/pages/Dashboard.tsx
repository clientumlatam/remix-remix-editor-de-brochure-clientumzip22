import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useGetDashboardStats,
  useGetPipelineBreakdown,
  useGetRecentActivities,
  useListInvoices,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Users, Target, Briefcase, DollarSign,
  Phone, Mail, CalendarCheck, CheckSquare, FileText,
  LayoutDashboard, Activity, BarChart2, Receipt,
  TrendingUp, ArrowUpRight, Clock, AlertCircle, CheckCircle2,
  Plus, X, MessageCircle, Bot, Zap, AlertTriangle, ExternalLink,
  Calendar, Send, Sparkles, Search, MapPin, Star, Globe,
  Download, Loader2, ThumbsUp, ThumbsDown, Building2,
} from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useWhatsAppStatus } from "@/hooks/useWhatsAppStatus";
import { format, isToday, isYesterday } from "date-fns";
import { es } from "date-fns/locale";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import {
  QuickCreateContactDialog,
  QuickCreateLeadDialog,
  QuickCreateActivityDialog,
  QuickCreateDealDialog,
} from "@/components/QuickCreateModals";

/* ─── Constants ────────────────────────────────────────────────── */

const STAGE_LABELS: Record<string, string> = {
  discovery: "Descubrimiento",
  proposal: "Propuesta",
  negotiation: "Negociación",
  contract: "Contrato",
  closed_won: "Ganado",
  closed_lost: "Perdido",
};

const STAGE_COLORS: Record<string, string> = {
  discovery: "#94a3b8",
  proposal: "#60a5fa",
  negotiation: "#a78bfa",
  contract: "#f59e0b",
  closed_won: "#22c55e",
  closed_lost: "#f87171",
};

type ActivityType = "call" | "email" | "meeting" | "task" | "note";
const ACTIVITY_CONFIG: Record<ActivityType, { icon: React.ReactNode; colorClass: string; label: string }> = {
  call:    { icon: <Phone className="w-3.5 h-3.5" />,        colorClass: "bg-blue-100 text-blue-600",   label: "Llamada" },
  email:   { icon: <Mail className="w-3.5 h-3.5" />,         colorClass: "bg-purple-100 text-purple-600", label: "Email" },
  meeting: { icon: <CalendarCheck className="w-3.5 h-3.5" />, colorClass: "bg-amber-100 text-amber-600",  label: "Reunión" },
  task:    { icon: <CheckSquare className="w-3.5 h-3.5" />,   colorClass: "bg-green-100 text-green-600",  label: "Tarea" },
  note:    { icon: <FileText className="w-3.5 h-3.5" />,      colorClass: "bg-gray-100 text-gray-600",    label: "Nota" },
};

const INVOICE_STATUS: Record<string, { label: string; textColor: string; bgColor: string; icon: React.ReactNode }> = {
  draft:     { label: "Borrador",   textColor: "text-gray-600",  bgColor: "bg-gray-100",  icon: <FileText className="w-4 h-4" /> },
  sent:      { label: "Enviada",    textColor: "text-blue-700",  bgColor: "bg-blue-50",   icon: <ArrowUpRight className="w-4 h-4" /> },
  paid:      { label: "Pagada",     textColor: "text-green-700", bgColor: "bg-green-50",  icon: <CheckCircle2 className="w-4 h-4" /> },
  overdue:   { label: "Vencida",    textColor: "text-red-700",   bgColor: "bg-red-50",    icon: <AlertCircle className="w-4 h-4" /> },
  cancelled: { label: "Cancelada",  textColor: "text-gray-500",  bgColor: "bg-gray-100",  icon: <Clock className="w-4 h-4" /> },
};

/* ─── Helpers ───────────────────────────────────────────────────── */

function fmt$(n: number) {
  return `$${n.toLocaleString("es-AR")}`;
}

function relativeDate(dateStr: string | null | undefined) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isToday(d)) return `Hoy · ${format(d, "HH:mm")}`;
  if (isYesterday(d)) return `Ayer · ${format(d, "HH:mm")}`;
  return format(d, "d MMM · HH:mm", { locale: es });
}

/* ─── Sub-components ─────────────────────────────────────────────── */

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-gray-100 rounded-xl", className)} />;
}

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  accent: string;
}
function KpiCard({ title, value, subtitle, icon, accent }: KpiCardProps) {
  return (
    <Card className="border-gray-200 shadow-sm overflow-hidden">
      <div className={cn("h-1 w-full", accent)} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          </div>
          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", accent.replace("bg-", "bg-").replace("-500", "-100"))}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityIcon({ type }: { type: string }) {
  const cfg = ACTIVITY_CONFIG[type as ActivityType] ?? ACTIVITY_CONFIG.note;
  return (
    <div className={cn("w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0", cfg.colorClass)}>
      {cfg.icon}
    </div>
  );
}

/* ─── WhatsApp Dashboard Tab ────────────────────────────────────── */

interface WaAnalytics {
  summary: {
    totalMessages: number;
    inbound: number;
    outbound: number;
    aiReplies: number;
    uniqueUsers: number;
    resolutionRate: number;
  };
  daily: { day: string; inbound: number; outbound: number; aiReplies: number }[];
}

interface WaConversation {
  phone: string;
  contactName: string;
  contactId: number | null;
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
  needsHuman: boolean;
}

interface WaFlow {
  id: number;
  name: string;
  enabled: boolean;
  triggerCount?: number;
}

function WaStatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <Card className="border-gray-200 shadow-sm overflow-hidden">
      <div className={cn("h-1 w-full", color)} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
          </div>
          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", color.replace("bg-", "bg-").replace("-500", "-100"))}>
            <Icon className={cn("w-4 h-4", color.replace("bg-", "text-"))} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function WhatsAppDashboardTab() {
  const { token } = useAuth();
  const { status, phone } = useWhatsAppStatus();
  const [, navigate] = useLocation();
  const [analytics, setAnalytics] = useState<WaAnalytics | null>(null);
  const [conversations, setConversations] = useState<WaConversation[]>([]);
  const [flows, setFlows] = useState<WaFlow[]>([]);
  const [loading, setLoading] = useState(true);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetch("/api/whatsapp/analytics", { headers }).then(r => r.ok ? r.json() : null),
      fetch("/api/whatsapp/conversations", { headers }).then(r => r.ok ? r.json() : []),
      fetch("/api/whatsapp/flows", { headers }).then(r => r.ok ? r.json() : []),
    ]).then(([a, c, f]) => {
      setAnalytics(a);
      setConversations(Array.isArray(c) ? c : []);
      setFlows(Array.isArray(f) ? f : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  const needsAttention = conversations.filter(c => c.needsHuman);
  const activeFlows = flows.filter(f => f.enabled);

  const chartData = analytics?.daily.map(d => ({
    name: new Date(d.day + "T12:00:00").toLocaleDateString("es-AR", { weekday: "short", day: "numeric" }),
    Entrantes: Number(d.inbound),
    "IA": Number(d.aiReplies),
    Manuales: Math.max(0, Number(d.outbound) - Number(d.aiReplies)),
  })) ?? [];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border font-medium",
            status === "connected"
              ? "bg-green-50 text-green-700 border-green-200"
              : status === "qr_pending"
              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
              : "bg-gray-100 text-gray-500 border-gray-200"
          )}>
            <span className={cn(
              "w-2 h-2 rounded-full",
              status === "connected" ? "bg-green-500" : status === "qr_pending" ? "bg-yellow-400" : "bg-gray-400"
            )} />
            {status === "connected" ? (phone ? `+${phone}` : "Conectado") : status === "qr_pending" ? "Esperando QR" : "Desconectado"}
          </div>
          <div className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            <Bot className="w-3.5 h-3.5" />
            Bot IA
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => navigate("/app/whatsapp")}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Ir a WhatsApp
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <WaStatCard
          label="Mensajes Totales"
          value={analytics?.summary.totalMessages ?? 0}
          sub={`${analytics?.summary.inbound ?? 0} entrantes`}
          icon={MessageCircle}
          color="bg-green-500"
        />
        <WaStatCard
          label="Conversaciones"
          value={conversations.length}
          sub={`${needsAttention.length} necesitan atención`}
          icon={Users}
          color="bg-blue-500"
        />
        <WaStatCard
          label="Respuestas IA"
          value={analytics?.summary.aiReplies ?? 0}
          sub={`${analytics?.summary.resolutionRate ?? 0}% resolución`}
          icon={Zap}
          color="bg-purple-500"
        />
        <WaStatCard
          label="Flows Activos"
          value={activeFlows.length}
          sub={`de ${flows.length} totales`}
          icon={Bot}
          color="bg-amber-500"
        />
      </div>

      {/* Chart + Attention needed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Volumen de mensajes (últimos 7 días)</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="h-52 flex items-center justify-center text-sm text-gray-400">
                Sin datos todavía — los mensajes aparecerán cuando lleguen por webhook.
              </div>
            ) : (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} tick={{ fill: "#9ca3af" }} />
                    <YAxis axisLine={false} tickLine={false} fontSize={11} tick={{ fill: "#9ca3af" }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: 12 }}
                      cursor={{ fill: "rgba(0,0,0,0.04)" }}
                    />
                    <Bar dataKey="Entrantes" fill="#22c55e" radius={[4,4,0,0]} />
                    <Bar dataKey="IA" fill="#8b5cf6" radius={[4,4,0,0]} />
                    <Bar dataKey="Manuales" fill="#3b82f6" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="flex gap-4 mt-2">
              {[{ label: "Entrantes", color: "#22c55e" }, { label: "IA", color: "#8b5cf6" }, { label: "Manuales", color: "#3b82f6" }].map(l => (
                <div key={l.label} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                  {l.label}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Necesitan atención</CardTitle>
            {needsAttention.length > 0 && (
              <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
                {needsAttention.length}
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            {needsAttention.length === 0 ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="w-10 h-10 text-green-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Todo resuelto</p>
              </div>
            ) : (
              <div className="space-y-2">
                {needsAttention.slice(0, 5).map(conv => (
                  <button
                    key={conv.phone}
                    onClick={() => navigate("/app/whatsapp")}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-orange-100 bg-orange-50 hover:bg-orange-100 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{conv.contactName}</p>
                      <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                    </div>
                  </button>
                ))}
                {needsAttention.length > 5 && (
                  <button
                    onClick={() => navigate("/app/whatsapp")}
                    className="w-full text-xs text-center text-blue-600 hover:underline pt-1"
                  >
                    Ver {needsAttention.length - 5} más →
                  </button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Flows list */}
      {flows.length > 0 && (
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Flows configurados</CardTitle>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => navigate("/app/whatsapp")}>
              <ExternalLink className="w-3.5 h-3.5" />
              Gestionar flows
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {flows.slice(0, 6).map(flow => (
                <div key={flow.id} className="flex items-center gap-3 px-5 py-3">
                  <div className={cn(
                    "w-2 h-2 rounded-full flex-shrink-0",
                    flow.enabled ? "bg-green-500" : "bg-gray-300"
                  )} />
                  <span className="text-sm text-gray-800 flex-1 truncate">{flow.name}</span>
                  <Badge variant={flow.enabled ? "default" : "secondary"} className="text-[10px]">
                    {flow.enabled ? "Activo" : "Pausado"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ─── Quick Action FAB ───────────────────────────────────────────── */

type ModalKey = "contact" | "lead" | "activity" | "deal" | null;

const FAB_ACTIONS: { key: ModalKey; label: string; icon: React.ReactNode; color: string }[] = [
  { key: "contact",  label: "Nuevo contacto",  icon: <Users className="w-4 h-4" />,    color: "bg-blue-500 hover:bg-blue-600" },
  { key: "lead",     label: "Nuevo lead",      icon: <Target className="w-4 h-4" />,   color: "bg-purple-500 hover:bg-purple-600" },
  { key: "activity", label: "Nueva actividad", icon: <Activity className="w-4 h-4" />, color: "bg-amber-500 hover:bg-amber-600" },
  { key: "deal",     label: "Nuevo deal",      icon: <Briefcase className="w-4 h-4" />,color: "bg-green-500 hover:bg-green-600" },
];

function QuickActionFab() {
  const [open, setOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalKey>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function openModal(key: ModalKey) {
    setOpen(false);
    setActiveModal(key);
  }

  return (
    <>
      <div ref={containerRef} className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
        {/* Action items */}
        <div className={cn(
          "flex flex-col items-end gap-2 transition-all duration-200",
          open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
        )}>
          {FAB_ACTIONS.map((action) => (
            <button
              key={action.key}
              onClick={() => openModal(action.key)}
              className={cn(
                "flex items-center gap-2.5 px-4 py-2.5 rounded-full text-white text-sm font-medium shadow-lg transition-all whitespace-nowrap",
                action.color
              )}
            >
              <span className="flex-shrink-0">{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>

        {/* Main FAB button */}
        <button
          onClick={() => setOpen(v => !v)}
          className={cn(
            "w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-200",
            open
              ? "bg-gray-800 hover:bg-gray-700"
              : "bg-gray-900 hover:bg-gray-700"
          )}
          aria-label="Acciones rápidas"
        >
          {open
            ? <X className="w-6 h-6 text-white" />
            : <Plus className="w-6 h-6 text-white" />
          }
        </button>
      </div>

      {/* Modals */}
      <QuickCreateContactDialog  open={activeModal === "contact"}  onOpenChange={o => !o && setActiveModal(null)} />
      <QuickCreateLeadDialog     open={activeModal === "lead"}     onOpenChange={o => !o && setActiveModal(null)} />
      <QuickCreateActivityDialog open={activeModal === "activity"} onOpenChange={o => !o && setActiveModal(null)} />
      <QuickCreateDealDialog     open={activeModal === "deal"}     onOpenChange={o => !o && setActiveModal(null)} />
    </>
  );
}

/* ─── Main component ────────────────────────────────────────────── */

export default function Dashboard() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const [, navigate] = useLocation();

  const authHeaders = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: pipeline = [], isLoading: pipelineLoading } = useGetPipelineBreakdown();
  const { data: activities = [], isLoading: activitiesLoading } = useGetRecentActivities();
  const { data: invoices = [], isLoading: invoicesLoading } = useListInvoices();

  const [activityFilter, setActivityFilter] = useState<string>("all");

  // ── Turnos ──────────────────────────────────────────────────────
  const { data: apptStats } = useQuery({
    queryKey: ["appt-stats-dash"],
    queryFn: () => fetch("/api/appointments/stats", { headers: authHeaders }).then(r => r.ok ? r.json() : null),
    enabled: !!token,
  });
  const { data: appointments = [], isLoading: apptsLoading } = useQuery({
    queryKey: ["appt-list-dash"],
    queryFn: () => fetch("/api/appointments", { headers: authHeaders }).then(r => r.ok ? r.json().then((d: any) => d.appointments ?? d) : []),
    enabled: !!token,
  });
  const updateAppt = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      fetch(`/api/appointments/${id}`, { method: "PATCH", headers: authHeaders, body: JSON.stringify({ status }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["appt-stats-dash"] }); qc.invalidateQueries({ queryKey: ["appt-list-dash"] }); },
  });

  // ── Broadcast ──────────────────────────────────────────────────
  const { data: broadcastContacts = [], isLoading: bcastLoading } = useQuery({
    queryKey: ["broadcast-contacts-dash"],
    queryFn: () => fetch("/api/broadcast/contacts", { headers: authHeaders }).then(r => r.ok ? r.json() : []),
    enabled: !!token,
  });
  const [bcastMsg, setBcastMsg] = useState("");
  const [bcastSelected, setBcastSelected] = useState<Set<string>>(new Set());
  const [bcastResult, setBcastResult] = useState<{ sent: number; failed: number } | null>(null);
  const bcastMutation = useMutation({
    mutationFn: () => fetch("/api/broadcast/send", {
      method: "POST", headers: authHeaders,
      body: JSON.stringify({ message: bcastMsg, contacts: Array.from(bcastSelected) }),
    }).then(r => r.json()),
    onSuccess: (data) => { setBcastResult(data); setBcastMsg(""); setBcastSelected(new Set()); },
  });

  // ── Copilot / IA ───────────────────────────────────────────────
  const { data: copilotData, isLoading: copilotLoading } = useQuery({
    queryKey: ["copilot-dash"],
    queryFn: () => fetch("/api/copilot/history?page=1&pageSize=8", { headers: authHeaders }).then(r => r.ok ? r.json() : null),
    enabled: !!token,
  });

  // ── Prospector ─────────────────────────────────────────────────
  const [prospQuery, setProspQuery] = useState("ferretería");
  const [prospLocation, setProspLocation] = useState("Buenos Aires");
  const [prospResults, setProspResults] = useState<any[]>([]);
  const [prospSelected, setProspSelected] = useState<Set<string>>(new Set());
  const prospMutation = useMutation({
    mutationFn: () => fetch("/api/prospector/search", {
      method: "POST", headers: authHeaders,
      body: JSON.stringify({ query: prospQuery, location: prospLocation, maxResults: 30 }),
    }).then(r => r.json()),
    onSuccess: (data) => { setProspResults(data.results ?? []); setProspSelected(new Set()); },
  });
  const toggleProsp = (id: string) => setProspSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const exportProspCSV = () => {
    const sel = prospResults.filter(r => prospSelected.has(r.id));
    const csv = ["Nombre,Dirección,Teléfono,Sitio Web,Rating"].concat(
      sel.map(r => [r.name, r.address, r.phone, r.website, r.rating].map(v => `"${v}"`).join(","))
    ).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "prospectos.csv"; a.click();
  };

  // Pipeline: only active stages for the chart
  const activePipeline = pipeline.filter(s => s.stage !== "closed_lost" && s.stage !== "closed_won");
  const totalPipelineValue = activePipeline.reduce((s, r) => s + r.value, 0);
  const wonDeals = pipeline.find(s => s.stage === "closed_won");
  const totalDeals = pipeline.reduce((s, r) => s + r.count, 0);
  const winRate = totalDeals > 0 ? Math.round(((wonDeals?.count ?? 0) / totalDeals) * 100) : 0;

  // Invoice stats
  const invoiceByStatus = invoices.reduce<Record<string, { count: number; total: number }>>((acc, inv) => {
    const s = inv.status ?? "draft";
    if (!acc[s]) acc[s] = { count: 0, total: 0 };
    acc[s].count++;
    acc[s].total += inv.total ?? 0;
    return acc;
  }, {});
  const totalInvoiced = invoices.reduce((s, i) => s + (i.total ?? 0), 0);
  const totalPaid = invoiceByStatus["paid"]?.total ?? 0;
  const totalPending = (invoiceByStatus["sent"]?.total ?? 0);
  const totalOverdue = invoiceByStatus["overdue"]?.total ?? 0;

  // Filtered activities
  const filteredActivities = activityFilter === "all"
    ? activities
    : activities.filter(a => a.type === activityFilter);

  const today = format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 capitalize mt-0.5">{today}</p>
        </div>
        <Badge variant="outline" className="self-start sm:self-auto gap-1.5 text-green-700 border-green-200 bg-green-50 px-3 py-1">
          <TrendingUp className="w-3 h-3" />
          {(stats?.conversionRate ?? 0).toFixed(0)}% conversión
        </Badge>
      </div>

      <Tabs defaultValue="resumen" className="space-y-6">
        <TabsList className="bg-gray-100 p-1 h-auto flex-wrap">
          <TabsTrigger value="resumen"    className="gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"><LayoutDashboard className="w-3.5 h-3.5" /> Resumen</TabsTrigger>
          <TabsTrigger value="pipeline"   className="gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"><BarChart2 className="w-3.5 h-3.5" /> Pipeline</TabsTrigger>
          <TabsTrigger value="actividades" className="gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"><Activity className="w-3.5 h-3.5" /> Actividades</TabsTrigger>
          <TabsTrigger value="finanzas"   className="gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"><Receipt className="w-3.5 h-3.5" /> Finanzas</TabsTrigger>
          <TabsTrigger value="turnos"     className="gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"><Calendar className="w-3.5 h-3.5" /> Turnos</TabsTrigger>
          <TabsTrigger value="whatsapp"   className="gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp</TabsTrigger>
          <TabsTrigger value="broadcast"  className="gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"><Send className="w-3.5 h-3.5" /> Broadcast</TabsTrigger>
          <TabsTrigger value="ia"         className="gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"><Sparkles className="w-3.5 h-3.5" /> IA</TabsTrigger>
          <TabsTrigger value="prospector" className="gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"><Search className="w-3.5 h-3.5" /> Prospector</TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Resumen ── */}
        <TabsContent value="resumen" className="space-y-6 mt-0">
          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statsLoading ? (
              [1,2,3,4].map(i => <Skeleton key={i} className="h-28" />)
            ) : (
              <>
                <KpiCard title="Contactos" value={stats?.totalContacts ?? 0} subtitle={`+${stats?.newContactsThisMonth ?? 0} este mes`} icon={<Users className="w-4 h-4 text-blue-600" />} accent="bg-blue-500" />
                <KpiCard title="Leads" value={stats?.totalLeads ?? 0} subtitle={`${stats?.conversionRate ?? 0}% conversión`} icon={<Target className="w-4 h-4 text-purple-600" />} accent="bg-purple-500" />
                <KpiCard title="Deals activos" value={stats?.totalDeals ?? 0} subtitle={fmt$(stats?.openDealsValue ?? 0) + " en pipeline"} icon={<Briefcase className="w-4 h-4 text-amber-600" />} accent="bg-amber-500" />
                <KpiCard title="Ingresos" value={fmt$(stats?.totalRevenue ?? 0)} subtitle={`${stats?.activitiesThisWeek ?? 0} actividades esta semana`} icon={<DollarSign className="w-4 h-4 text-green-600" />} accent="bg-green-500" />
              </>
            )}
          </div>

          {/* Segunda fila: Turnos + IA + Broadcast */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Turnos pendientes" value={apptStats?.pending ?? 0} subtitle={`${apptStats?.confirmed ?? 0} confirmados hoy`} icon={<Calendar className="w-4 h-4 text-cyan-600" />} accent="bg-cyan-500" />
            <KpiCard title="Turnos completados" value={apptStats?.completed ?? 0} subtitle={`${apptStats?.cancelled ?? 0} cancelados`} icon={<CheckCircle2 className="w-4 h-4 text-teal-600" />} accent="bg-teal-500" />
            <KpiCard title="Sugerencias IA" value={copilotData?.stats?.total ?? 0} subtitle={`${copilotData?.stats?.acceptanceRate ?? 0}% aceptación`} icon={<Sparkles className="w-4 h-4 text-violet-600" />} accent="bg-violet-500" />
            <KpiCard title="Contactos WA" value={broadcastContacts.length} subtitle="disponibles para broadcast" icon={<Send className="w-4 h-4 text-rose-600" />} accent="bg-rose-500" />
          </div>

          {/* Chart + Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-gray-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Valor del pipeline por etapa</CardTitle>
              </CardHeader>
              <CardContent>
                {pipelineLoading ? (
                  <Skeleton className="h-64" />
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={pipeline.map(p => ({ ...p, label: STAGE_LABELS[p.stage] ?? p.stage }))} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                        <XAxis dataKey="label" axisLine={false} tickLine={false} fontSize={11} tick={{ fill: "#9ca3af" }} />
                        <YAxis axisLine={false} tickLine={false} fontSize={11} tick={{ fill: "#9ca3af" }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                        <Tooltip
                          cursor={{ fill: "rgba(0,0,0,0.04)" }}
                          contentStyle={{ borderRadius: "10px", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", fontSize: 12 }}
                          formatter={(val: number) => [fmt$(val), "Valor"]}
                          labelStyle={{ fontWeight: 600, color: "#111827" }}
                        />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                          {pipeline.map((entry) => (
                            <Cell key={entry.stage} fill={STAGE_COLORS[entry.stage] ?? "#94a3b8"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {/* Legend */}
                <div className="flex flex-wrap gap-3 mt-2">
                  {pipeline.map(p => (
                    <div key={p.stage} className="flex items-center gap-1.5 text-xs text-gray-500">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STAGE_COLORS[p.stage] ?? "#94a3b8" }} />
                      <span>{STAGE_LABELS[p.stage] ?? p.stage}</span>
                      <span className="text-gray-400">({p.count})</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Actividad reciente</CardTitle>
              </CardHeader>
              <CardContent>
                {activitiesLoading ? (
                  <div className="space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-10" />)}</div>
                ) : activities.length === 0 ? (
                  <p className="text-sm text-gray-400 py-6 text-center">Sin actividades recientes</p>
                ) : (
                  <div className="space-y-3">
                    {activities.slice(0, 6).map(a => (
                      <div key={a.id} className="flex items-start gap-3">
                        <ActivityIcon type={a.type ?? "note"} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate leading-tight">{a.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {a.contactName && <span className="mr-1">{a.contactName} ·</span>}
                            {relativeDate(a.date)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab 2: Pipeline ── */}
        <TabsContent value="pipeline" className="space-y-6 mt-0">
          {/* Summary row */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-5 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Pipeline activo</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{fmt$(totalPipelineValue)}</p>
                <p className="text-xs text-gray-400 mt-1">{activePipeline.reduce((s, r) => s + r.count, 0)} deals</p>
              </CardContent>
            </Card>
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-5 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Deals ganados</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{fmt$(wonDeals?.value ?? 0)}</p>
                <p className="text-xs text-gray-400 mt-1">{wonDeals?.count ?? 0} deals cerrados</p>
              </CardContent>
            </Card>
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-5 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Win rate</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{winRate}%</p>
                <p className="text-xs text-gray-400 mt-1">sobre {totalDeals} deals totales</p>
              </CardContent>
            </Card>
          </div>

          {/* Stage breakdown */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Desglose por etapa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pipelineLoading ? (
                <div className="space-y-3">{[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-12" />)}</div>
              ) : (
                pipeline.map(stage => {
                  const pct = totalPipelineValue > 0 ? (stage.value / (totalPipelineValue + (wonDeals?.value ?? 0) + (pipeline.find(s => s.stage === "closed_lost")?.value ?? 0))) * 100 : 0;
                  const color = STAGE_COLORS[stage.stage] ?? "#94a3b8";
                  return (
                    <div key={stage.stage} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                          <span className="font-medium text-gray-800">{STAGE_LABELS[stage.stage] ?? stage.stage}</span>
                          <Badge variant="secondary" className="text-xs py-0 h-5">{stage.count} deals</Badge>
                        </div>
                        <span className="font-semibold text-gray-900">{fmt$(stage.value)}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${Math.max(pct, 0.5)}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Chart */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Valor por etapa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pipeline.map(p => ({ ...p, label: STAGE_LABELS[p.stage] ?? p.stage }))} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                    <XAxis dataKey="label" axisLine={false} tickLine={false} fontSize={11} tick={{ fill: "#9ca3af" }} />
                    <YAxis axisLine={false} tickLine={false} fontSize={11} tick={{ fill: "#9ca3af" }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      cursor={{ fill: "rgba(0,0,0,0.04)" }}
                      contentStyle={{ borderRadius: "10px", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", fontSize: 12 }}
                      formatter={(val: number) => [fmt$(val), "Valor"]}
                      labelStyle={{ fontWeight: 600, color: "#111827" }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {pipeline.map(entry => (
                        <Cell key={entry.stage} fill={STAGE_COLORS[entry.stage] ?? "#94a3b8"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 3: Actividades ── */}
        <TabsContent value="actividades" className="space-y-4 mt-0">
          {/* Type filter */}
          <div className="flex flex-wrap gap-2">
            {(["all", "call", "email", "meeting", "task", "note"] as const).map(type => {
              const cfg = type === "all" ? null : ACTIVITY_CONFIG[type];
              const isActive = activityFilter === type;
              return (
                <button
                  key={type}
                  onClick={() => setActivityFilter(type)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                    isActive
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                >
                  {cfg && <span className={cn("w-4 h-4 rounded-full flex items-center justify-center", isActive ? "text-white" : cfg.colorClass)}>{cfg.icon}</span>}
                  {type === "all" ? "Todas" : cfg?.label}
                  <span className={cn("ml-0.5 text-[10px]", isActive ? "text-gray-300" : "text-gray-400")}>
                    ({type === "all" ? activities.length : activities.filter(a => a.type === type).length})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Activity list */}
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-0">
              {activitiesLoading ? (
                <div className="space-y-px">
                  {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 rounded-none" />)}
                </div>
              ) : filteredActivities.length === 0 ? (
                <div className="py-16 text-center">
                  <Activity className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Sin actividades{activityFilter !== "all" ? " de este tipo" : ""}</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredActivities.map(a => {
                    const cfg = ACTIVITY_CONFIG[a.type as ActivityType] ?? ACTIVITY_CONFIG.note;
                    return (
                      <div key={a.id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5", cfg.colorClass)}>
                          {cfg.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{a.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-gray-400">{cfg.label}</span>
                                {a.contactName && (
                                  <>
                                    <span className="text-gray-300">·</span>
                                    <span className="text-xs text-gray-500">{a.contactName}</span>
                                  </>
                                )}
                                {a.dealTitle && (
                                  <>
                                    <span className="text-gray-300">·</span>
                                    <span className="text-xs text-blue-500">{a.dealTitle}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              <span className="text-xs text-gray-400 whitespace-nowrap">{relativeDate(a.date)}</span>
                              {a.completed && (
                                <Badge variant="outline" className="text-[10px] py-0 h-4 text-green-600 border-green-200 bg-green-50">
                                  Completada
                                </Badge>
                              )}
                            </div>
                          </div>
                          {a.notes && (
                            <p className="text-xs text-gray-400 mt-1 line-clamp-1">{a.notes}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 4: Finanzas ── */}
        <TabsContent value="finanzas" className="space-y-6 mt-0">
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {invoicesLoading ? (
              [1,2,3,4].map(i => <Skeleton key={i} className="h-28" />)
            ) : (
              <>
                <Card className="border-gray-200 shadow-sm overflow-hidden">
                  <div className="h-1 bg-gray-400" />
                  <CardContent className="p-5">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total facturado</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{fmt$(totalInvoiced)}</p>
                    <p className="text-xs text-gray-400 mt-1">{invoices.length} facturas</p>
                  </CardContent>
                </Card>
                <Card className="border-green-200 shadow-sm overflow-hidden">
                  <div className="h-1 bg-green-500" />
                  <CardContent className="p-5">
                    <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Cobrado</p>
                    <p className="text-2xl font-bold text-green-700 mt-1">{fmt$(totalPaid)}</p>
                    <p className="text-xs text-gray-400 mt-1">{invoiceByStatus["paid"]?.count ?? 0} facturas pagadas</p>
                  </CardContent>
                </Card>
                <Card className="border-blue-200 shadow-sm overflow-hidden">
                  <div className="h-1 bg-blue-500" />
                  <CardContent className="p-5">
                    <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Pendiente</p>
                    <p className="text-2xl font-bold text-blue-700 mt-1">{fmt$(totalPending)}</p>
                    <p className="text-xs text-gray-400 mt-1">{invoiceByStatus["sent"]?.count ?? 0} enviadas</p>
                  </CardContent>
                </Card>
                <Card className="border-red-200 shadow-sm overflow-hidden">
                  <div className="h-1 bg-red-500" />
                  <CardContent className="p-5">
                    <p className="text-xs font-medium text-red-600 uppercase tracking-wide">Vencido</p>
                    <p className="text-2xl font-bold text-red-700 mt-1">{fmt$(totalOverdue)}</p>
                    <p className="text-xs text-gray-400 mt-1">{invoiceByStatus["overdue"]?.count ?? 0} facturas vencidas</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Status breakdown + invoice list */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Por estado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {invoicesLoading ? (
                  <div className="space-y-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-10" />)}</div>
                ) : Object.keys(INVOICE_STATUS).map(status => {
                  const cfg = INVOICE_STATUS[status];
                  const data = invoiceByStatus[status];
                  if (!data) return null;
                  const pct = totalInvoiced > 0 ? (data.total / totalInvoiced) * 100 : 0;
                  return (
                    <div key={status} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium", cfg.bgColor, cfg.textColor)}>
                          {cfg.icon}
                          {cfg.label}
                          <span className="ml-0.5 opacity-70">×{data.count}</span>
                        </div>
                        <span className="text-xs font-semibold text-gray-700">{fmt$(data.total)}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.max(pct, 0.5)}%`,
                            backgroundColor:
                              status === "paid" ? "#22c55e"
                              : status === "sent" ? "#3b82f6"
                              : status === "overdue" ? "#ef4444"
                              : "#94a3b8",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 border-gray-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Últimas facturas</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {invoicesLoading ? (
                  <div className="space-y-px px-5 py-2">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12" />)}</div>
                ) : invoices.length === 0 ? (
                  <div className="py-12 text-center">
                    <Receipt className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Sin facturas todavía</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {invoices.slice(0, 8).map(inv => {
                      const sc = INVOICE_STATUS[inv.status ?? "draft"] ?? INVOICE_STATUS.draft;
                      return (
                        <div key={inv.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50/50 transition-colors">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{inv.number}</p>
                            <p className="text-xs text-gray-400">{inv.contactName ?? inv.companyName ?? "Sin cliente"}</p>
                          </div>
                          <div className="ml-auto flex items-center gap-3">
                            <span className={cn("text-xs px-2 py-0.5 rounded-md font-medium", sc.bgColor, sc.textColor)}>
                              {sc.label}
                            </span>
                            <span className="text-sm font-semibold text-gray-900 w-24 text-right">{fmt$(inv.total ?? 0)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab 5: Turnos ── */}
        <TabsContent value="turnos" className="space-y-6 mt-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Pendientes",  value: apptStats?.pending   ?? 0, color: "bg-amber-500",  text: "text-amber-600"  },
              { label: "Confirmados", value: apptStats?.confirmed ?? 0, color: "bg-blue-500",   text: "text-blue-600"   },
              { label: "Completados", value: apptStats?.completed ?? 0, color: "bg-green-500",  text: "text-green-600"  },
              { label: "Cancelados",  value: apptStats?.cancelled ?? 0, color: "bg-red-500",    text: "text-red-600"    },
            ].map(s => (
              <Card key={s.label} className="border-gray-200 shadow-sm overflow-hidden">
                <div className={`h-1 ${s.color}`} />
                <CardContent className="p-5">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{s.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${s.text}`}>{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Próximos turnos</CardTitle>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => navigate("/app/appointments")}>
                <ExternalLink className="w-3.5 h-3.5" /> Ver todos
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {apptsLoading ? (
                <div className="space-y-px px-4 py-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-14" />)}</div>
              ) : (appointments as any[]).length === 0 ? (
                <div className="py-14 text-center"><Calendar className="w-10 h-10 text-gray-200 mx-auto mb-2" /><p className="text-sm text-gray-400">Sin turnos registrados</p></div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {(appointments as any[]).slice(0, 10).map((a: any) => {
                    const statusCfg: Record<string, { label: string; cls: string }> = {
                      pending:   { label: "Pendiente",  cls: "bg-amber-50 text-amber-700 border-amber-200" },
                      confirmed: { label: "Confirmado", cls: "bg-blue-50 text-blue-700 border-blue-200" },
                      completed: { label: "Completado", cls: "bg-green-50 text-green-700 border-green-200" },
                      cancelled: { label: "Cancelado",  cls: "bg-red-50 text-red-700 border-red-200" },
                    };
                    const sc = statusCfg[a.status] ?? statusCfg.pending;
                    return (
                      <div key={a.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                        <div className="w-9 h-9 rounded-lg bg-cyan-50 flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-4 h-4 text-cyan-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{a.clientName || a.contactName || "Sin nombre"}</p>
                          <p className="text-xs text-gray-400">{a.service || a.serviceType || "—"} · {a.date ? format(new Date(a.date), "d MMM HH:mm", { locale: es }) : a.time || "—"}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={cn("text-xs px-2 py-0.5 rounded-md font-medium border", sc.cls)}>{sc.label}</span>
                          {a.status === "pending" && (
                            <button onClick={() => updateAppt.mutate({ id: a.id, status: "confirmed" })}
                              className="text-xs px-2 py-0.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                              Confirmar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 6: WhatsApp ── */}
        <TabsContent value="whatsapp" className="mt-0">
          <WhatsAppDashboardTab />
        </TabsContent>

        {/* ── Tab 7: Broadcast ── */}
        <TabsContent value="broadcast" className="space-y-6 mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Composer */}
            <Card className="lg:col-span-1 border-gray-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Send className="w-4 h-4 text-rose-500" /> Mensaje masivo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Escribí el mensaje para enviar por WhatsApp..."
                  value={bcastMsg}
                  onChange={e => setBcastMsg(e.target.value)}
                  className="min-h-[140px] resize-none text-sm"
                />
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{bcastSelected.size} contactos seleccionados</span>
                  <span>{bcastMsg.length} caracteres</span>
                </div>
                {bcastResult && (
                  <div className="flex gap-3">
                    <div className="flex-1 rounded-lg bg-green-50 border border-green-200 p-3 text-center">
                      <p className="text-xl font-bold text-green-700">{bcastResult.sent}</p>
                      <p className="text-xs text-green-600">Enviados</p>
                    </div>
                    <div className="flex-1 rounded-lg bg-red-50 border border-red-200 p-3 text-center">
                      <p className="text-xl font-bold text-red-700">{bcastResult.failed}</p>
                      <p className="text-xs text-red-600">Fallidos</p>
                    </div>
                  </div>
                )}
                <Button
                  className="w-full gap-2"
                  disabled={!bcastMsg.trim() || bcastSelected.size === 0 || bcastMutation.isPending}
                  onClick={() => bcastMutation.mutate()}
                >
                  {bcastMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {bcastMutation.isPending ? "Enviando..." : `Enviar a ${bcastSelected.size} contactos`}
                </Button>
                <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs" onClick={() => navigate("/app/broadcast")}>
                  <ExternalLink className="w-3.5 h-3.5" /> Ir a Broadcast completo
                </Button>
              </CardContent>
            </Card>

            {/* Contact list */}
            <Card className="lg:col-span-2 border-gray-200 shadow-sm">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold">Contactos con WhatsApp</CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() =>
                    setBcastSelected(bcastSelected.size === broadcastContacts.length ? new Set() : new Set(broadcastContacts.map((c: any) => c.phone)))
                  }>
                    {bcastSelected.size === broadcastContacts.length ? "Ninguno" : "Todos"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {bcastLoading ? (
                  <div className="space-y-px px-4 py-2">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12" />)}</div>
                ) : broadcastContacts.length === 0 ? (
                  <div className="py-14 text-center"><MessageCircle className="w-10 h-10 text-gray-200 mx-auto mb-2" /><p className="text-sm text-gray-400">Sin contactos con WhatsApp</p></div>
                ) : (
                  <div className="divide-y divide-gray-100 max-h-[420px] overflow-y-auto">
                    {(broadcastContacts as any[]).map((c: any) => (
                      <label key={c.phone} className={cn("flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-gray-50 transition-colors", bcastSelected.has(c.phone) && "bg-blue-50")}>
                        <input type="checkbox" className="rounded border-gray-300" checked={bcastSelected.has(c.phone)}
                          onChange={() => setBcastSelected(prev => { const n = new Set(prev); n.has(c.phone) ? n.delete(c.phone) : n.add(c.phone); return n; })} />
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-xs font-medium text-gray-600">
                          {(c.name || c.phone || "?")[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{c.name || "Sin nombre"}</p>
                          <p className="text-xs text-gray-400">{c.phone}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab 8: IA ── */}
        <TabsContent value="ia" className="space-y-6 mt-0">
          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-gray-200 shadow-sm overflow-hidden"><div className="h-1 bg-violet-500" /><CardContent className="p-5"><p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sugerencias totales</p><p className="text-3xl font-bold text-violet-600 mt-1">{copilotData?.stats?.total ?? 0}</p></CardContent></Card>
            <Card className="border-gray-200 shadow-sm overflow-hidden"><div className="h-1 bg-green-500" /><CardContent className="p-5"><p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Aceptadas</p><p className="text-3xl font-bold text-green-600 mt-1">{copilotData?.stats?.accepted ?? 0}<span className="text-sm font-normal text-gray-400 ml-1">({copilotData?.stats?.acceptanceRate ?? 0}%)</span></p></CardContent></Card>
            <Card className="border-gray-200 shadow-sm overflow-hidden"><div className="h-1 bg-amber-500" /><CardContent className="p-5"><p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Con alerta deuda</p><p className="text-3xl font-bold text-amber-600 mt-1">{copilotData?.stats?.withDebt ?? 0}</p></CardContent></Card>
            <Card className="border-gray-200 shadow-sm overflow-hidden"><div className="h-1 bg-blue-500" /><CardContent className="p-5"><p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Conversaciones IA</p><p className="text-3xl font-bold text-blue-600 mt-1">{copilotData?.stats?.byTone ? Object.values(copilotData.stats.byTone as Record<string,number>).reduce((a,b)=>a+b,0) : 0}</p></CardContent></Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tone breakdown */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Tonos usados</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {copilotLoading ? <Skeleton className="h-32" /> : copilotData?.stats?.byTone ? (
                  Object.entries(copilotData.stats.byTone as Record<string,number>).map(([tone, count]) => {
                    const total = Object.values(copilotData.stats.byTone as Record<string,number>).reduce((a,b)=>a+b,0);
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    const colors: Record<string,string> = { amigable: "bg-green-500", formal: "bg-blue-500", persuasivo: "bg-purple-500", directo: "bg-orange-500" };
                    return (
                      <div key={tone} className="space-y-1">
                        <div className="flex justify-between text-xs"><span className="capitalize text-gray-700 font-medium">{tone}</span><span className="text-gray-400">{count} ({pct}%)</span></div>
                        <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: colors[tone] || "#94a3b8" }} /></div>
                      </div>
                    );
                  })
                ) : <p className="text-sm text-gray-400 text-center py-6">Sin datos todavía</p>}
              </CardContent>
              <CardContent className="pt-0 flex gap-2">
                <Button className="flex-1 gap-1.5 text-xs" size="sm" variant="outline" onClick={() => navigate("/app/copilot-history")}><ExternalLink className="w-3.5 h-3.5" /> Historial Copilot</Button>
                <Button className="flex-1 gap-1.5 text-xs" size="sm" onClick={() => navigate("/app/ai-chat")}><Bot className="w-3.5 h-3.5" /> Asistente IA</Button>
              </CardContent>
            </Card>

            {/* Recent suggestions */}
            <Card className="lg:col-span-2 border-gray-200 shadow-sm">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold">Últimas sugerencias</CardTitle>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => navigate("/app/copilot-history")}><ExternalLink className="w-3.5 h-3.5" /> Ver todas</Button>
              </CardHeader>
              <CardContent className="p-0">
                {copilotLoading ? (
                  <div className="space-y-px px-4 py-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-14" />)}</div>
                ) : !copilotData?.data?.length ? (
                  <div className="py-14 text-center"><Sparkles className="w-10 h-10 text-gray-200 mx-auto mb-2" /><p className="text-sm text-gray-400">Las sugerencias aparecerán cuando los agentes usen la extensión de Chrome</p></div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {(copilotData.data as any[]).map((s: any) => (
                      <div key={s.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-medium text-gray-900 truncate">{s.contactName || s.phone}</p>
                            <span className="text-xs px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 capitalize flex-shrink-0">{s.tone}</span>
                            {s.accepted === true && <ThumbsUp className="w-3 h-3 text-green-500 flex-shrink-0" />}
                            {s.accepted === false && <ThumbsDown className="w-3 h-3 text-red-400 flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2">{s.suggestion}</p>
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">{s.createdAt ? format(new Date(s.createdAt), "d MMM", { locale: es }) : ""}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab 9: Prospector ── */}
        <TabsContent value="prospector" className="space-y-6 mt-0">
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="pt-5">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <Input className="pl-9" placeholder="Tipo de negocio (ej: ferretería, restaurante...)" value={prospQuery} onChange={e => setProspQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && prospMutation.mutate()} />
                </div>
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <Input className="pl-9" placeholder="Ciudad o barrio" value={prospLocation} onChange={e => setProspLocation(e.target.value)} onKeyDown={e => e.key === "Enter" && prospMutation.mutate()} />
                </div>
                <Button onClick={() => prospMutation.mutate()} disabled={prospMutation.isPending || !prospQuery || !prospLocation} className="gap-2 shrink-0">
                  {prospMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  {prospMutation.isPending ? "Buscando..." : "Buscar"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {prospResults.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => setProspSelected(prospSelected.size === prospResults.length ? new Set() : new Set(prospResults.map(r => r.id)))}>
                    {prospSelected.size === prospResults.length ? "Ninguno" : "Todos"}
                  </Button>
                  <span className="text-sm text-gray-500">{prospSelected.size} seleccionados de {prospResults.length}</span>
                </div>
                <div className="flex gap-2">
                  {prospSelected.size > 0 && (
                    <Button size="sm" variant="outline" onClick={exportProspCSV} className="gap-1.5">
                      <Download className="w-3.5 h-3.5" /> Exportar CSV
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => navigate("/app/prospector")}>
                    <ExternalLink className="w-3.5 h-3.5" /> Abrir Prospector
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {prospResults.map(place => (
                  <Card key={place.id} className={cn("transition-colors", prospSelected.has(place.id) ? "border-blue-300 bg-blue-50/40" : "border-gray-200")}>
                    <CardContent className="py-3 flex items-start gap-3">
                      <input type="checkbox" className="mt-1 rounded border-gray-300" checked={prospSelected.has(place.id)} onChange={() => toggleProsp(place.id)} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <p className="font-medium text-sm text-gray-900">{place.name}</p>
                          {place.rating > 0 && (
                            <span className="flex items-center gap-1 text-xs text-amber-600 flex-shrink-0">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />{place.rating.toFixed(1)} ({place.reviews})
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                          {place.address && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{place.address}</span>}
                          {place.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{place.phone}</span>}
                          {place.website && <a href={place.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-600"><Globe className="w-3 h-3" />{place.website.replace(/^https?:\/\//, "").slice(0, 30)}</a>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {!prospMutation.isPending && prospResults.length === 0 && (
            <div className="py-20 text-center">
              <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400">Buscá negocios por rubro y ubicación para encontrar nuevos clientes potenciales</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <QuickActionFab />
    </div>
  );
}
