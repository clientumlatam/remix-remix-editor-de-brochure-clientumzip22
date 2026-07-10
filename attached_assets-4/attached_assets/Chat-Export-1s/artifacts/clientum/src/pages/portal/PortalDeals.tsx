import { useEffect, useState } from "react";
import { usePortal } from "@/contexts/PortalContext";
import { PortalLayout } from "./PortalLayout";
import { Briefcase } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface Deal {
  id: number;
  title: string;
  stage: string;
  value: number;
  notes?: string | null;
  expectedCloseDate?: string | null;
  createdAt: string;
}

const STAGE_CONFIG: Record<string, { label: string; color: string; bg: string; step: number }> = {
  discovery: { label: "Descubrimiento", color: "#6366f1", bg: "#eef2ff", step: 1 },
  proposal: { label: "Propuesta", color: "#f59e0b", bg: "#fffbeb", step: 2 },
  negotiation: { label: "Negociación", color: "#2467a2", bg: "#eff6ff", step: 3 },
  won: { label: "Ganado ✓", color: "#16a34a", bg: "#dcfce7", step: 4 },
  lost: { label: "No avanzado", color: "#6b7280", bg: "#f3f4f6", step: 0 },
};

const STAGE_ORDER = ["discovery", "proposal", "negotiation", "won"];

function StageProgress({ stage }: { stage: string }) {
  const current = STAGE_CONFIG[stage]?.step ?? 0;
  if (stage === "lost") {
    return <span className="text-xs text-gray-400 italic">No avanzó</span>;
  }
  return (
    <div className="flex items-center gap-1">
      {STAGE_ORDER.map((s, i) => {
        const cfg = STAGE_CONFIG[s]!;
        const done = i < current;
        const active = i + 1 === current;
        return (
          <div key={s} className="flex items-center gap-1">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: done || active ? cfg.color : "#e5e7eb",
                color: done || active ? "#fff" : "#9ca3af",
              }}
            >
              {i + 1}
            </div>
            {i < STAGE_ORDER.length - 1 && (
              <div className="w-4 h-0.5" style={{ background: done ? "#2467a2" : "#e5e7eb" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function PortalDeals() {
  const { token } = usePortal();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${BASE}/api/portal/deals`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setDeals(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [token]);

  const active = deals.filter(d => d.stage !== "won" && d.stage !== "lost");
  const closed = deals.filter(d => d.stage === "won" || d.stage === "lost");

  return (
    <PortalLayout>
      <div className="space-y-8 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Proyectos</h1>
          <p className="text-gray-500 text-sm mt-1">Estado actualizado de cada propuesta y proyecto</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
            Cargando proyectos…
          </div>
        ) : deals.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center space-y-3">
            <Briefcase className="w-10 h-10 text-gray-200 mx-auto" />
            <p className="text-gray-400 text-sm">No hay proyectos para mostrar aún</p>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">En curso ({active.length})</h2>
                <div className="space-y-3">
                  {active.map(deal => {
                    const cfg = STAGE_CONFIG[deal.stage] ?? STAGE_CONFIG.discovery!;
                    return (
                      <div key={deal.id} className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1 min-w-0">
                            <h3 className="font-bold text-gray-900 truncate">{deal.title}</h3>
                            {deal.notes && (
                              <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{deal.notes}</p>
                            )}
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-xl font-black text-gray-900">${deal.value.toLocaleString("es-AR")}</p>
                            {deal.expectedCloseDate && (
                              <p className="text-xs text-gray-400">
                                Cierre: {new Date(deal.expectedCloseDate).toLocaleDateString("es-AR")}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                          <StageProgress stage={deal.stage} />
                          <span
                            className="text-xs px-2.5 py-1 rounded-full font-semibold"
                            style={{ background: cfg.bg, color: cfg.color }}
                          >
                            {cfg.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {closed.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Finalizados ({closed.length})</h2>
                <div className="space-y-3">
                  {closed.map(deal => {
                    const cfg = STAGE_CONFIG[deal.stage] ?? STAGE_CONFIG.lost!;
                    return (
                      <div key={deal.id} className="bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between opacity-70">
                        <div>
                          <h3 className="font-semibold text-gray-700">{deal.title}</h3>
                          <p className="text-xs text-gray-400">{new Date(deal.createdAt).toLocaleDateString("es-AR")}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-700">${deal.value.toLocaleString("es-AR")}</span>
                          <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: cfg.bg, color: cfg.color }}>
                            {cfg.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PortalLayout>
  );
}
