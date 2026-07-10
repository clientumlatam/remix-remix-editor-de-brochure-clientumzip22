import { Link } from "wouter";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Users, CheckCircle2, ArrowRight, BarChart3, Bell, Search, Tag, RefreshCw } from "lucide-react";

const BRAND_BLUE = "#2467a2";
const BRAND_GREEN = "#25d366";

const FEATURES = [
  { icon: <Users className="w-5 h-5" />, title: "Contactos y empresas unificados", desc: "Todos tus clientes, prospectos y empresas en un solo lugar con historial completo de interacciones." },
  { icon: <BarChart3 className="w-5 h-5" />, title: "Pipeline visual de ventas", desc: "Tablero Kanban con tus etapas de venta. Arrastrá deals y nunca perdas una oportunidad." },
  { icon: <Bell className="w-5 h-5" />, title: "Seguimiento automático", desc: "Recordatorios, tareas y alertas para que nada se te escape. El CRM trabaja mientras vos te enfocás en vender." },
  { icon: <Search className="w-5 h-5" />, title: "Búsqueda y filtros avanzados", desc: "Encontrá cualquier contacto, deal o actividad en segundos con filtros por etapa, fecha, responsable y más." },
  { icon: <Tag className="w-5 h-5" />, title: "Etiquetas y segmentación", desc: "Clasificá tus contactos por industria, tamaño, interés o cualquier criterio personalizado." },
  { icon: <RefreshCw className="w-5 h-5" />, title: "Integrado con WhatsApp y facturación", desc: "Las conversaciones de WhatsApp y las facturas se vinculan automáticamente a cada contacto." },
];

const PIPELINE = ["Prospecto", "Contactado", "Propuesta", "Negociación", "Ganado"];

export default function CrmPage() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-24" style={{ background: "linear-gradient(135deg, #0a1628 0%, #1a3a5c 60%, #0d2b4a 100%)" }}>
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-400/30 text-blue-300" style={{ background: "rgba(36,103,162,0.2)" }}>
              <Users className="w-4 h-4" />
              CRM Inteligente
            </div>
            <h1 className="text-4xl lg:text-5xl font-black leading-tight">
              Nunca más perdas{" "}
              <span style={{ color: BRAND_GREEN }}>una venta</span>
            </h1>
            <p className="text-lg text-blue-100 leading-relaxed">
              Gestioná contactos, leads y deals en un pipeline visual. Con seguimiento automático y alertas para que nada se te escape.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/register">
                <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}>
                  Probar gratis <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/contacto">
                <button className="px-6 py-3 rounded-xl font-semibold text-white border border-white/20 hover:bg-white/10 transition-colors">
                  Ver demo
                </button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-blue-200">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-400" /> Sin tarjeta de crédito</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-400" /> Fácil de usar</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-400" /> Soporte incluido</span>
            </div>
          </div>

          {/* Pipeline preview */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/10">
            <p className="text-white text-sm font-semibold mb-4">Pipeline de ventas</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {PIPELINE.map((stage, i) => (
                <div key={stage} className="shrink-0 w-32 space-y-2">
                  <p className="text-xs font-semibold text-blue-200 text-center">{stage}</p>
                  {[0, 1].map((j) => (
                    i * 2 + j < 7 ? (
                      <div key={j} className="bg-white/10 rounded-lg p-2.5 text-xs text-white border border-white/10">
                        <div className="w-full h-2 rounded bg-white/20 mb-1.5" />
                        <div className="w-2/3 h-2 rounded bg-white/10" />
                      </div>
                    ) : null
                  ))}
                </div>
              ))}
            </div>
            <p className="text-blue-300 text-xs mt-4 text-center">Arrastrá y soltá entre etapas</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-gray-900">Todo lo que necesitás para vender más</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">Un CRM pensado para PyMEs argentinas, sin la complejidad de las grandes plataformas.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-white" style={{ background: BRAND_BLUE }}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-white text-center" style={{ background: BRAND_BLUE }}>
        <div className="max-w-2xl mx-auto px-6 space-y-6">
          <h2 className="text-3xl font-black">Tu equipo de ventas, ordenado</h2>
          <p className="text-blue-100">Probá el CRM 14 días gratis y organizá tu pipeline en minutos.</p>
          <Link href="/register">
            <button className="px-8 py-4 rounded-xl font-bold text-white text-lg hover:opacity-90 transition-all" style={{ background: BRAND_GREEN }}>
              Probar 14 días gratis →
            </button>
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
