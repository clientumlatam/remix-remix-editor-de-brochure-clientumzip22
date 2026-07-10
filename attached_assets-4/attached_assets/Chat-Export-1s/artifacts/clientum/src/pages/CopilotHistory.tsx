import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Sparkles,
  Phone,
  User,
  ThumbsUp,
  ThumbsDown,
  Clock,
  TrendingUp,
  MessageSquare,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface CopilotSuggestion {
  id: number;
  phone: string;
  contactName: string | null;
  contactId: number | null;
  tone: string;
  messagesCount: number;
  suggestion: string;
  accepted: boolean | null;
  hadDebtAlert: boolean;
  debtAmount: number | null;
  createdAt: string;
  userEmail?: string;
}

interface HistoryResponse {
  data: CopilotSuggestion[];
  total: number;
  page: number;
  pageSize: number;
  stats: {
    total: number;
    accepted: number;
    acceptanceRate: number;
    withDebt: number;
    byTone: Record<string, number>;
  };
}

const TONE_META: Record<string, { label: string; color: string }> = {
  amigable:   { label: "Amigable",   color: "bg-green-100 text-green-700 border-green-200" },
  formal:     { label: "Formal",     color: "bg-blue-100 text-blue-700 border-blue-200" },
  persuasivo: { label: "Persuasivo", color: "bg-purple-100 text-purple-700 border-purple-200" },
  directo:    { label: "Directo",    color: "bg-orange-100 text-orange-700 border-orange-200" },
};

const PAGE_SIZE = 20;

function StatCard({
  icon,
  label,
  value,
  sub,
  color = "blue",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: "blue" | "green" | "purple" | "amber";
}) {
  const colors = {
    blue:   "from-blue-50 to-blue-100 border-blue-200 text-blue-600",
    green:  "from-green-50 to-green-100 border-green-200 text-green-600",
    purple: "from-purple-50 to-purple-100 border-purple-200 text-purple-600",
    amber:  "from-amber-50 to-amber-100 border-amber-200 text-amber-600",
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-white/70 flex items-center justify-center">{icon}</div>
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function CopilotHistory() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [toneFilter, setToneFilter] = useState("all");
  const [debtFilter, setDebtFilter] = useState("all");
  const [selected, setSelected] = useState<CopilotSuggestion | null>(null);

  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(PAGE_SIZE),
    ...(search ? { search } : {}),
    ...(toneFilter !== "all" ? { tone: toneFilter } : {}),
    ...(debtFilter !== "all" ? { debtAlert: debtFilter } : {}),
  });

  const { data, isLoading } = useQuery<HistoryResponse>({
    queryKey: ["copilot-history", page, search, toneFilter, debtFilter],
    queryFn: async () => {
      const resp = await fetch(`/api/copilot/history?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error("Error al cargar el historial");
      return resp.json();
    },
  });

  const markAccepted = useMutation({
    mutationFn: async ({ id, accepted }: { id: number; accepted: boolean }) => {
      await fetch(`/api/copilot/history/${id}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ accepted }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["copilot-history"] });
    },
  });

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;

  function handleSearch(v: string) {
    setSearch(v);
    setPage(1);
  }

  function handleTone(v: string) {
    setToneFilter(v);
    setPage(1);
  }

  function handleDebt(v: string) {
    setDebtFilter(v);
    setPage(1);
  }

  const stats = data?.stats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            Historial de Copilot
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Registro de sugerencias generadas por IA para tus agentes en WhatsApp
          </p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<MessageSquare className="w-4 h-4 text-blue-600" />}
            label="Total sugerencias"
            value={stats.total.toLocaleString("es-AR")}
            sub="Todas las épocas"
            color="blue"
          />
          <StatCard
            icon={<ThumbsUp className="w-4 h-4 text-green-600" />}
            label="Aceptadas"
            value={`${stats.acceptanceRate.toFixed(0)}%`}
            sub={`${stats.accepted} de ${stats.total}`}
            color="green"
          />
          <StatCard
            icon={<TrendingUp className="w-4 h-4 text-purple-600" />}
            label="Tono más usado"
            value={
              Object.entries(stats.byTone).sort((a, b) => b[1] - a[1])[0]
                ? TONE_META[Object.entries(stats.byTone).sort((a, b) => b[1] - a[1])[0][0]]?.label ?? "—"
                : "—"
            }
            color="purple"
          />
          <StatCard
            icon={<AlertCircle className="w-4 h-4 text-amber-600" />}
            label="Con alerta de deuda"
            value={stats.withDebt.toLocaleString("es-AR")}
            sub="Clientes con facturas pendientes"
            color="amber"
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por contacto o número..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={toneFilter} onValueChange={handleTone}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Tono" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tonos</SelectItem>
            <SelectItem value="amigable">Amigable</SelectItem>
            <SelectItem value="formal">Formal</SelectItem>
            <SelectItem value="persuasivo">Persuasivo</SelectItem>
            <SelectItem value="directo">Directo</SelectItem>
          </SelectContent>
        </Select>
        <Select value={debtFilter} onValueChange={handleDebt}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Deuda" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="yes">Con alerta de deuda</SelectItem>
            <SelectItem value="no">Sin deuda</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-purple-500 mr-2" />
            <span className="text-gray-500">Cargando historial...</span>
          </div>
        ) : !data?.data.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Sparkles className="w-10 h-10 mb-3 text-gray-300" />
            <p className="font-medium">No hay sugerencias todavía</p>
            <p className="text-sm mt-1">
              Las sugerencias aparecerán aquí cuando los agentes usen la extensión de Chrome.
            </p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wide">Contacto</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wide">Sugerencia</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wide">Tono</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wide">Estado</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wide">Fecha</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.data.map((row) => {
                  const tone = TONE_META[row.tone] ?? { label: row.tone, color: "bg-gray-100 text-gray-600" };
                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-gray-50/60 transition-colors cursor-pointer"
                      onClick={() => setSelected(row)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <User className="w-3.5 h-3.5 text-purple-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-800 truncate">
                              {row.contactName ?? "Desconocido"}
                            </p>
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                              <Phone className="w-2.5 h-2.5" />
                              +{row.phone}
                            </p>
                          </div>
                        </div>
                        {row.hadDebtAlert && (
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                            <AlertCircle className="w-2.5 h-2.5" />
                            Deuda ${row.debtAmount?.toLocaleString("es-AR") ?? ""}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <p className="text-gray-700 text-xs leading-relaxed line-clamp-2">
                          {row.suggestion}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {row.messagesCount} msg de contexto
                        </p>
                      </td>

                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={`text-[11px] ${tone.color}`}
                        >
                          {tone.label}
                        </Badge>
                      </td>

                      <td className="py-3 px-4">
                        {row.accepted === true && (
                          <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                            <ThumbsUp className="w-3 h-3" />
                            Insertada
                          </span>
                        )}
                        {row.accepted === false && (
                          <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
                            <ThumbsDown className="w-3 h-3" />
                            Descartada
                          </span>
                        )}
                        {row.accepted === null && (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-2 py-0.5">
                            <Clock className="w-3 h-3" />
                            Sin registrar
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-xs text-gray-400 whitespace-nowrap">
                        {format(parseISO(row.createdAt), "d MMM, HH:mm", { locale: es })}
                      </td>

                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        {row.accepted === null && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => markAccepted.mutate({ id: row.id, accepted: true })}
                              className="p-1.5 rounded hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"
                              title="Marcar como insertada"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => markAccepted.mutate({ id: row.id, accepted: false })}
                              className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                              title="Marcar como descartada"
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-500">
                  Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, data.total)} de{" "}
                  {data.total.toLocaleString("es-AR")} sugerencias
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="h-7 w-7 p-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-xs text-gray-600 px-2">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="h-7 w-7 p-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Sugerencia #{selected?.id}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Contacto</p>
                  <p className="font-medium">{selected.contactName ?? "Desconocido"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Teléfono</p>
                  <p className="font-medium">+{selected.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Tono</p>
                  <Badge variant="outline" className={`text-xs ${TONE_META[selected.tone]?.color ?? ""}`}>
                    {TONE_META[selected.tone]?.label ?? selected.tone}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Mensajes de contexto</p>
                  <p className="font-medium">{selected.messagesCount}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Fecha</p>
                  <p className="font-medium">
                    {format(parseISO(selected.createdAt), "d 'de' MMMM, HH:mm", { locale: es })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Estado</p>
                  {selected.accepted === true && (
                    <span className="text-xs text-green-700 font-medium">✓ Insertada por el agente</span>
                  )}
                  {selected.accepted === false && (
                    <span className="text-xs text-red-600 font-medium">✕ Descartada</span>
                  )}
                  {selected.accepted === null && (
                    <span className="text-xs text-gray-500">Sin registrar</span>
                  )}
                </div>
              </div>

              {selected.hadDebtAlert && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  Alerta de deuda activa — ${selected.debtAmount?.toLocaleString("es-AR") ?? "0"}
                </div>
              )}

              <div>
                <p className="text-xs text-gray-400 mb-1.5">Sugerencia generada</p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {selected.suggestion}
                </div>
              </div>

              {selected.accepted === null && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-green-700 border-green-300 hover:bg-green-50"
                    onClick={() => {
                      markAccepted.mutate({ id: selected.id, accepted: true });
                      setSelected(null);
                    }}
                  >
                    <ThumbsUp className="w-3.5 h-3.5 mr-1.5" />
                    Marcar como insertada
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                    onClick={() => {
                      markAccepted.mutate({ id: selected.id, accepted: false });
                      setSelected(null);
                    }}
                  >
                    <ThumbsDown className="w-3.5 h-3.5 mr-1.5" />
                    Marcar como descartada
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
