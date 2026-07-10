import { useEffect, useState } from "react";
import { usePortal } from "@/contexts/PortalContext";
import { PortalLayout } from "./PortalLayout";
import { Link } from "wouter";
import { FileText, Briefcase, Clock, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface Invoice {
  id: number;
  number: string;
  status: string;
  total: number;
  dueDate?: string | null;
  createdAt: string;
}

interface Deal {
  id: number;
  title: string;
  stage: string;
  value: number;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  paid: "#2ecc71",
  sent: "#2467a2",
  draft: "#94a3b8",
  overdue: "#ef4444",
};

const STAGE_LABELS: Record<string, string> = {
  discovery: "Descubrimiento",
  proposal: "Propuesta",
  negotiation: "Negociación",
  won: "Ganado",
  lost: "Perdido",
};

export default function PortalDashboard() {
  const { token, contact } = usePortal();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${BASE}/api/portal/invoices`, { headers }).then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); }),
      fetch(`${BASE}/api/portal/deals`, { headers }).then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); }),
    ]).then(([inv, dls]) => {
      setInvoices(Array.isArray(inv) ? inv : []);
      setDeals(Array.isArray(dls) ? dls : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  const pendingInvoices = invoices.filter(i => i.status === "sent" || i.status === "overdue");
  const totalOwed = pendingInvoices.reduce((s, i) => s + i.total, 0);
  const activeDeals = deals.filter(d => d.stage !== "won" && d.stage !== "lost");

  return (
    <PortalLayout>
      <div className="space-y-8 max-w-5xl">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            ¡Hola, {contact?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-gray-500 mt-1">Aquí está el resumen de tu cuenta.</p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Facturas totales", value: invoices.length, icon: <FileText className="w-5 h-5" />, color: "#2467a2" },
            { label: "Facturas pendientes", value: pendingInvoices.length, icon: <AlertCircle className="w-5 h-5" />, color: "#ef4444" },
            { label: "Total adeudado", value: `$${totalOwed.toLocaleString()}`, icon: <Clock className="w-5 h-5" />, color: "#f59e0b" },
            { label: "Proyectos activos", value: activeDeals.length, icon: <Briefcase className="w-5 h-5" />, color: "#761c8f" },
          ].map(kpi => (
            <div key={kpi.label} className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white" style={{ background: kpi.color }}>
                {kpi.icon}
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">{loading ? "…" : kpi.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{kpi.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent invoices */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h2 className="font-bold text-gray-900 text-sm">Últimas facturas</h2>
              <Link href="/portal/invoices">
                <a className="text-xs font-semibold flex items-center gap-1" style={{ color: "#2467a2" }}>
                  Ver todas <ArrowRight className="w-3 h-3" />
                </a>
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {loading ? (
                <div className="p-8 text-center text-gray-400 text-sm">Cargando…</div>
              ) : invoices.slice(0, 4).length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">No hay facturas aún</div>
              ) : (
                invoices.slice(0, 4).map(inv => (
                  <div key={inv.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{inv.number}</p>
                      <p className="text-xs text-gray-400">{new Date(inv.createdAt).toLocaleDateString("es-AR")}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-700">${inv.total.toLocaleString()}</span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-semibold text-white capitalize"
                        style={{ background: STATUS_COLORS[inv.status] ?? "#94a3b8" }}
                      >
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent deals */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h2 className="font-bold text-gray-900 text-sm">Mis proyectos</h2>
              <Link href="/portal/deals">
                <a className="text-xs font-semibold flex items-center gap-1" style={{ color: "#2467a2" }}>
                  Ver todos <ArrowRight className="w-3 h-3" />
                </a>
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {loading ? (
                <div className="p-8 text-center text-gray-400 text-sm">Cargando…</div>
              ) : deals.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">No hay proyectos aún</div>
              ) : (
                deals.slice(0, 4).map(deal => (
                  <div key={deal.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 truncate max-w-[160px]">{deal.title}</p>
                      <p className="text-xs text-gray-400">{new Date(deal.createdAt).toLocaleDateString("es-AR")}</p>
                    </div>
                    <span
                      className="text-xs px-2 py-1 rounded-full font-semibold"
                      style={{ background: deal.stage === "won" ? "#dcfce7" : "#eff6ff", color: deal.stage === "won" ? "#166534" : "#1e40af" }}
                    >
                      {STAGE_LABELS[deal.stage] ?? deal.stage}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
