import { useEffect, useState } from "react";
import { usePortal } from "@/contexts/PortalContext";
import { PortalLayout } from "./PortalLayout";
import { FileText, Download, Search } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface Invoice {
  id: number;
  number: string;
  status: string;
  total: number;
  subtotal: number;
  tax: number;
  dueDate?: string | null;
  notes?: string | null;
  tipoComprobante?: string | null;
  cae?: string | null;
  createdAt: string;
}

const STATUS_LABEL: Record<string, string> = {
  draft: "Borrador",
  sent: "Enviada",
  paid: "Pagada",
  overdue: "Vencida",
  cancelled: "Cancelada",
};

const STATUS_COLOR: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  sent: "bg-blue-50 text-blue-700",
  paid: "bg-green-50 text-green-700",
  overdue: "bg-red-50 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
};

export default function PortalInvoices() {
  const { token } = usePortal();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!token) return;
    fetch(`${BASE}/api/portal/invoices`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
      .then(data => setInvoices(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = invoices.filter(inv => {
    const matchSearch = inv.number.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const total = filtered.reduce((s, i) => s + i.total, 0);

  return (
    <PortalLayout>
      <div className="space-y-6 max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mis Facturas</h1>
            <p className="text-gray-500 text-sm mt-1">Historial completo de tus comprobantes</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por número…"
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#2467a2]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none"
          >
            <option value="all">Todos los estados</option>
            <option value="draft">Borrador</option>
            <option value="sent">Enviada</option>
            <option value="paid">Pagada</option>
            <option value="overdue">Vencida</option>
          </select>
        </div>

        {/* Summary */}
        {filtered.length > 0 && (
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span>{filtered.length} facturas</span>
            <span className="font-bold text-gray-900">Total: ${total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Cargando facturas…</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <FileText className="w-10 h-10 text-gray-200 mx-auto" />
              <p className="text-gray-400 text-sm">No hay facturas para mostrar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["Número", "Fecha", "Vencimiento", "Tipo", "Subtotal", "IVA", "Total", "Estado"].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(inv => (
                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-semibold text-gray-900">{inv.number}</td>
                      <td className="px-5 py-3 text-gray-600">{new Date(inv.createdAt).toLocaleDateString("es-AR")}</td>
                      <td className="px-5 py-3 text-gray-600">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("es-AR") : "—"}</td>
                      <td className="px-5 py-3 text-gray-600">{inv.tipoComprobante ?? "—"}</td>
                      <td className="px-5 py-3 text-gray-700">${inv.subtotal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
                      <td className="px-5 py-3 text-gray-700">${inv.tax.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
                      <td className="px-5 py-3 font-bold text-gray-900">${inv.total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR[inv.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {STATUS_LABEL[inv.status] ?? inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
