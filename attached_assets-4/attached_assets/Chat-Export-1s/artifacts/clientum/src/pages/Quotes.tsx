import { useState } from "react";
import { useLocation } from "wouter";
import { useListQuotes, useDeleteQuote, getListQuotesQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, FileText, Trash2, Eye, Building2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft:    { label: "Borrador",  variant: "secondary" },
  sent:     { label: "Enviada",   variant: "default" },
  accepted: { label: "Aceptada",  variant: "default" },
  rejected: { label: "Rechazada", variant: "destructive" },
  expired:  { label: "Vencida",   variant: "outline" },
};

function formatARS(n: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
}

export default function Quotes() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const { data: quotes = [], isLoading } = useListQuotes();
  const deleteQuote = useDeleteQuote();
  const { toast } = useToast();
  const qc = useQueryClient();

  const filtered = quotes.filter(q =>
    q.title.toLowerCase().includes(search.toLowerCase()) ||
    q.number.toLowerCase().includes(search.toLowerCase()) ||
    (q.contactName ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (q.companyName ?? "").toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(id: number, e: React.MouseEvent) {
    e.preventDefault();
    if (!confirm("¿Eliminar esta cotización?")) return;
    try {
      await deleteQuote.mutateAsync({ id });
      qc.invalidateQueries({ queryKey: getListQuotesQueryKey() });
      toast({ title: "Cotización eliminada" });
    } catch {
      toast({ title: "Error al eliminar", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Cotizaciones</h1>
          <p className="text-sm text-gray-500 mt-1">Creá y gestioná propuestas para tus clientes</p>
        </div>
        <Button className="gap-2" onClick={() => navigate("/app/quotes/new")}>
          <Plus className="w-4 h-4" />
          Nueva cotización
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Buscar cotizaciones..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No hay cotizaciones</p>
            <p className="text-sm text-gray-400 mt-1">Creá tu primera cotización para empezar</p>
            <Button className="mt-4 gap-2" onClick={() => navigate("/app/quotes/new")}>
              <Plus className="w-4 h-4" />
              Nueva cotización
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(q => {
            const st = STATUS_LABELS[q.status] ?? { label: q.status, variant: "secondary" as const };
            return (
              <div key={q.id} role="button" tabIndex={0} onClick={() => navigate(`/app/quotes/${q.id}`)} onKeyDown={e => e.key === "Enter" && navigate(`/app/quotes/${q.id}`)} className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group">
                  <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-mono">{q.number}</span>
                      <Badge variant={st.variant} className="text-xs">{st.label}</Badge>
                    </div>
                    <p className="font-medium text-gray-900 truncate mt-0.5">{q.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {q.contactName && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <User className="w-3 h-3" />{q.contactName}
                        </span>
                      )}
                      {q.companyName && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Building2 className="w-3 h-3" />{q.companyName}
                        </span>
                      )}
                      {q.validUntil && (
                        <span className="text-xs text-gray-400">Vence: {new Date(q.validUntil).toLocaleDateString("es-AR")}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-gray-900">{formatARS(q.total)}</p>
                    {q.discount > 0 && (
                      <p className="text-xs text-green-600">- {formatARS(q.discount)} desc.</p>
                    )}
                    <p className="text-xs text-gray-400">{q.items.length} ítem{q.items.length !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="w-8 h-8" onClick={e => { e.stopPropagation(); navigate(`/app/quotes/${q.id}`); }}>
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-8 h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={e => { e.stopPropagation(); handleDelete(q.id, e); }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
