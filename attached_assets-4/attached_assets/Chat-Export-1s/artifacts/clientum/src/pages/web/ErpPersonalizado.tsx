import { Link } from "wouter";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ArrowRight, CheckCircle2, Zap, BarChart3, TrendingUp, Package, Users, FileText } from "lucide-react";

const BRAND_BLUE = "#2467a2";
const BRAND_GREEN = "#25d366";

const MODULES = [
  { icon: <Users className="w-5 h-5" />, title: "CRM integrado", desc: "Contactos, leads, pipeline y actividades en un solo lugar." },
  { icon: <Package className="w-5 h-5" />, title: "Inventario y stock", desc: "Control de productos, alertas de stock mínimo y trazabilidad." },
  { icon: <FileText className="w-5 h-5" />, title: "Facturación y AFIP", desc: "Facturación electrónica conectada con tu CRM y pedidos." },
  { icon: <BarChart3 className="w-5 h-5" />, title: "Reportes y dashboards", desc: "KPIs en tiempo real sin armar planillas ni pedir datos." },
  { icon: <Zap className="w-5 h-5" />, title: "Automatización de procesos", desc: "Flujos automáticos de aprobación, alertas y seguimiento." },
  { icon: <TrendingUp className="w-5 h-5" />, title: "Presupuestos y ventas", desc: "Cotizaciones, órdenes de compra y seguimiento de ventas." },
];

const INCLUDED = [
  "Análisis y mapeo de procesos actuales",
  "Configuración personalizada por módulo",
  "Migración de datos históricos",
  "Capacitación de tu equipo",
  "Soporte técnico incluido 12 meses",
  "Actualizaciones sin costo adicional",
  "Reportes y dashboards a medida",
  "Integración con sistemas existentes",
];

export default function ErpPersonalizado() {
  return (
    <SiteLayout>
      <section className="relative overflow-hidden pt-20 pb-24" style={{ background: "linear-gradient(135deg, #1a0533 0%, #3b1a6b 60%, #2d1258 100%)" }}>
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border border-purple-400/30 text-purple-300" style={{ background: "rgba(124,58,237,0.2)" }}>
              <Zap className="w-4 h-4" /> ERP Personalizado
            </div>
            <h1 className="text-4xl lg:text-5xl font-black leading-tight">
              Tu empresa,{" "}
              <span style={{ color: BRAND_GREEN }}>toda en un sistema</span>
            </h1>
            <p className="text-lg text-purple-100 leading-relaxed">
              ERP adaptado a tu industria y tamaño. Sin pagar módulos que no usás, sin configuraciones imposibles. Operativo en semanas, no meses.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/contacto">
                <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}>
                  Ver demo <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-purple-200">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-400" /> Sin IT de tu parte</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-400" /> Precios en pesos</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-400" /> Soporte local</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/10">
            <p className="text-white text-sm font-semibold mb-4">Resultados típicos a 3 meses</p>
            {[
              { label: "Tiempo en tareas administrativas", value: "-40%", color: BRAND_GREEN },
              { label: "Errores por datos duplicados", value: "-85%", color: BRAND_GREEN },
              { label: "Visibilidad del negocio", value: "+100%", color: "#a78bfa" },
              { label: "Tiempo de respuesta al cliente", value: "-60%", color: BRAND_GREEN },
            ].map((s) => (
              <div key={s.label} className="flex justify-between items-center py-2.5 border-b border-white/10 last:border-0">
                <span className="text-blue-200 text-sm">{s.label}</span>
                <span className="font-black text-lg" style={{ color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-gray-900">Módulos incluidos</h2>
            <p className="text-gray-500 mt-3">Activás solo los que necesitás. Todo conectado entre sí.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MODULES.map((m) => (
              <div key={m.title} className="p-6 rounded-2xl border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-white bg-purple-600">
                  {m.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{m.title}</h3>
                <p className="text-sm text-gray-500">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">Todo incluido en la implementación</h2>
            <p className="text-gray-500 mb-6">Sin costos ocultos ni sorpresas. El precio que acordamos es el precio final.</p>
            <div className="space-y-3">
              {INCLUDED.map((item) => (
                <div key={item} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100">
                  <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: BRAND_GREEN }} />
                  <span className="text-gray-700 text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-black text-gray-900 text-xl">¿Cuánto tiempo tarda?</h3>
            {[
              { phase: "Diagnóstico y diseño", time: "1-2 semanas" },
              { phase: "Configuración y migración", time: "2-4 semanas" },
              { phase: "Capacitación del equipo", time: "1 semana" },
              { phase: "Puesta en marcha", time: "Día de go-live" },
            ].map((p) => (
              <div key={p.phase} className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
                <span className="text-gray-600 text-sm">{p.phase}</span>
                <span className="font-semibold text-sm" style={{ color: BRAND_BLUE }}>{p.time}</span>
              </div>
            ))}
            <Link href="/contacto">
              <button className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-white mt-2" style={{ background: BRAND_BLUE }}>
                Solicitar presupuesto <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 text-white text-center" style={{ background: BRAND_BLUE }}>
        <div className="max-w-2xl mx-auto px-6 space-y-6">
          <h2 className="text-3xl font-black">¿Listo para unificar tu gestión?</h2>
          <p className="text-blue-100">Demo gratuita. Presupuesto sin compromiso. Resultados en 60 días.</p>
          <Link href="/contacto">
            <button className="px-8 py-4 rounded-xl font-bold text-white text-lg hover:opacity-90 transition-all" style={{ background: BRAND_GREEN }}>
              Solicitar demo gratuita →
            </button>
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
