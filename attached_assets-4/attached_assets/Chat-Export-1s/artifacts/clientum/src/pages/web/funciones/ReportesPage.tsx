import { Link } from "wouter";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { BarChart3, CheckCircle2, ArrowRight, TrendingUp, Clock, Mail, Zap, FileText } from "lucide-react";

const BRAND_BLUE = "#2467a2";
const BRAND_GREEN = "#25d366";

const REPORTS = [
  { title: "Pipeline de ventas", desc: "Deals por etapa, valor total, probabilidad de cierre y tiempo promedio en cada fase." },
  { title: "Actividad del equipo", desc: "Llamadas, emails, reuniones y tareas completadas por período y por asesor." },
  { title: "Leads y conversiones", desc: "Origen de leads, tasa de conversión por etapa y velocidad de avance en el pipeline." },
  { title: "Facturación y pagos", desc: "Ingresos por mes, facturas pendientes, clientes con deuda y proyección de cobros." },
  { title: "Contactos y empresas", desc: "Nuevos contactos por semana, contactos sin actividad reciente y segmentación por industria." },
  { title: "WhatsApp y atención", desc: "Conversaciones atendidas por el bot, derivaciones a humano y tiempo de respuesta promedio." },
];

const FEATURES = [
  { icon: <Clock className="w-5 h-5" />, title: "Reportes automáticos programados", desc: "Recibís un resumen semanal o mensual en tu email sin tener que pedirlo." },
  { icon: <Mail className="w-5 h-5" />, title: "Envío automático al equipo", desc: "Configurás quién recibe cada reporte. El CEO ve el resumen ejecutivo, ventas ve el pipeline." },
  { icon: <Zap className="w-5 h-5" />, title: "Datos en tiempo real", desc: "El dashboard se actualiza solo. Siempre tenés los números del momento, no de ayer." },
  { icon: <FileText className="w-5 h-5" />, title: "Exportá a Excel o PDF", desc: "Descargá cualquier reporte para presentar en reuniones o compartir con socios." },
];

export default function ReportesPage() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-24" style={{ background: "linear-gradient(135deg, #0a2040 0%, #0d3b6e 60%, #0a2a52 100%)" }}>
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-400/30 text-blue-300" style={{ background: "rgba(36,103,162,0.2)" }}>
              <BarChart3 className="w-4 h-4" />
              Reportes Automáticos
            </div>
            <h1 className="text-4xl lg:text-5xl font-black leading-tight">
              Tomá decisiones con{" "}
              <span style={{ color: BRAND_GREEN }}>datos reales</span>
            </h1>
            <p className="text-lg text-blue-100 leading-relaxed">
              Reportes automáticos de ventas, actividad, facturación y atención al cliente. Sin armar planillas, sin pedir datos al equipo.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/register">
                <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}>
                  Probar gratis <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-blue-200">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-400" /> Dashboard en tiempo real</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-400" /> Reportes automáticos por email</span>
            </div>
          </div>

          {/* Dashboard preview */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/10 space-y-3">
            <p className="text-white text-sm font-semibold mb-2">Dashboard — Junio 2026</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Deals activos", value: "24", change: "+3" },
                { label: "Ingresos del mes", value: "$480K", change: "+12%" },
                { label: "Leads nuevos", value: "38", change: "+7" },
                { label: "Tasa de cierre", value: "31%", change: "+5%" },
              ].map((kpi) => (
                <div key={kpi.label} className="bg-white/10 rounded-xl p-3">
                  <p className="text-blue-300 text-xs">{kpi.label}</p>
                  <p className="text-white text-xl font-black mt-0.5">{kpi.value}</p>
                  <p className="text-green-400 text-xs mt-0.5">{kpi.change} vs mes anterior</p>
                </div>
              ))}
            </div>
            <div className="bg-white/10 rounded-xl p-3 mt-2">
              <p className="text-blue-300 text-xs mb-2">Pipeline por etapa</p>
              {["Prospecto", "Propuesta", "Negociación"].map((s, i) => (
                <div key={s} className="flex items-center gap-2 mb-1.5">
                  <p className="text-white text-xs w-24">{s}</p>
                  <div className="flex-1 bg-white/10 rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ width: `${[70, 45, 25][i]}%`, background: BRAND_GREEN }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Report types */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-gray-900">Reportes incluidos desde el día 1</h2>
            <p className="text-gray-500 mt-3">Todo lo que necesitás para entender tu negocio, sin configurar nada.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {REPORTS.map((r) => (
              <div key={r.title} className="p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
                <TrendingUp className="w-6 h-6 mb-3" style={{ color: BRAND_BLUE }} />
                <h3 className="font-bold text-gray-900 mb-2">{r.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-black text-center text-gray-900 mb-12">Automatización total de reportes</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex gap-4 p-6 rounded-2xl bg-white border border-gray-100">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white" style={{ background: BRAND_BLUE }}>
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-white text-center" style={{ background: BRAND_BLUE }}>
        <div className="max-w-2xl mx-auto px-6 space-y-6">
          <h2 className="text-3xl font-black">Datos claros para decisiones rápidas</h2>
          <p className="text-blue-100">Probá los reportes automáticos 14 días sin costo.</p>
          <Link href="/register">
            <button className="px-8 py-4 rounded-xl font-bold text-white text-lg hover:opacity-90 transition-all" style={{ background: BRAND_GREEN }}>
              Probar gratis →
            </button>
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
