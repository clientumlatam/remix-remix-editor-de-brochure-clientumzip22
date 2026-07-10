import { Link } from "wouter";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ArrowRight, TrendingUp, Users, Package, Shield } from "lucide-react";

const INDUSTRIES = [
  { icon: <Users className="w-6 h-6" />, name: "Minoristas", challenge: "Gestión de stock y ventas multicanal", result: "+35% en eficiencia de ventas", color: "#2467a2" },
  { icon: <Package className="w-6 h-6" />, name: "Manufactura", challenge: "Control de producción y costos", result: "+28% en productividad de planta", color: "#761c8f" },
  { icon: <TrendingUp className="w-6 h-6" />, name: "Agroindustria", challenge: "Trazabilidad y planificación agrícola", result: "-22% en costos operativos", color: "#2ecc71" },
  { icon: <Shield className="w-6 h-6" />, name: "Distribuidores", challenge: "Ruteo, inventario y cobranzas", result: "+40% en exactitud de entregas", color: "#2467a2" },
  { icon: <Users className="w-6 h-6" />, name: "Servicios", challenge: "CRM y seguimiento de clientes", result: "+45% en retención de clientes", color: "#761c8f" },
  { icon: <Shield className="w-6 h-6" />, name: "Ciberseguridad", challenge: "Compliance y gestión de incidentes", result: "-80% en tiempo de respuesta", color: "#2467a2" },
  { icon: <Package className="w-6 h-6" />, name: "E-commerce", challenge: "Integración multicanal y logística", result: "+52% en ventas online", color: "#059669" },
  { icon: <TrendingUp className="w-6 h-6" />, name: "Marketing Digital", challenge: "Generación y conversión de leads", result: "+3x en leads calificados", color: "#ea580c" },
  { icon: <Shield className="w-6 h-6" />, name: "Consultoría", challenge: "Gestión de proyectos y facturación", result: "-40% en tiempo administrativo", color: "#7c3aed" },
];

const CASES = [
  {
    company: "Distribuidora del Sur S.A.",
    industry: "Distribución",
    challenge: "Procesos manuales, errores en pedidos y falta de visibilidad del stock en tiempo real.",
    solution: "Implementamos un ERP personalizado con módulos de ventas, logística e inventario integrados.",
    results: ["+30% en eficiencia operativa", "Reducción del 60% en errores de pedidos", "ROI en 8 meses"],
    quote: "Clientum transformó la manera en que gestionamos nuestras operaciones. El ROI fue evidente desde el primer mes.",
    person: "Carlos M., Gerente General",
  },
  {
    company: "Agro San Luis",
    industry: "Agroindustria",
    challenge: "Sin trazabilidad de lotes agrícolas y procesos de facturación completamente manuales.",
    solution: "Sistema de gestión agrícola integrado con facturación electrónica y portal de proveedores.",
    results: ["+25% en productividad", "Trazabilidad 100% digital", "Cumplimiento normativo garantizado"],
    quote: "Ahora tenemos visibilidad total de cada lote, desde el campo hasta la entrega. Imprescindible.",
    person: "Laura G., Directora de Operaciones",
  },
  {
    company: "Tech Retail BA",
    industry: "Retail",
    challenge: "Múltiples canales de venta desconectados: tienda física, web y marketplace.",
    solution: "Integración omnicanal con sincronización de stock en tiempo real y CRM unificado.",
    results: ["+40% en ventas online", "Inventario unificado", "-50% en tiempo de gestión"],
    quote: "La integración omnicanal nos dio la ventaja competitiva que necesitábamos en el mercado actual.",
    person: "Diego P., CEO",
  },
  {
    company: "Estética Lumière",
    industry: "Servicios / Salud & Belleza",
    challenge: "Gestión manual de turnos, pérdida de consultas por WhatsApp y nula retención de clientes.",
    solution: "CRM con chatbot WhatsApp integrado, agenda automática y pipeline de fidelización.",
    results: ["+80 consultas diarias por WhatsApp", "-90% en turnos sin respuesta", "+60% en clientes recurrentes"],
    quote: "El chatbot agenda turnos solo. Pasamos de 20 consultas diarias a más de 80 sin contratar personal.",
    person: "Mónica S., Propietaria",
  },
  {
    company: "Servicios Contables VG",
    industry: "Consultoría Contable",
    challenge: "Tiempo excesivo en facturación manual AFIP y seguimiento desordenado de clientes.",
    solution: "Integración directa con AFIP, CRM unificado de clientes y automatización de recordatorios.",
    results: ["-70% en tiempo de facturación", "Pipeline de clientes centralizado", "0 facturas vencidas"],
    quote: "Ahora emito facturas en segundos desde el CRM. Lo que antes me llevaba horas, lo hago en minutos.",
    person: "Valeria G., Contadora",
  },
];

export default function CasosDeExito() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section
        className="min-h-[400px] flex items-center px-6 py-24"
        style={{ background: "linear-gradient(135deg, rgba(36,103,162,0.1) 0%, #f7f5f4 100%)" }}
      >
        <div className="max-w-7xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">Casos de Uso por Industria</h1>
          <p className="text-lg text-gray-600 max-w-xl">Descubrí cómo Clientum ha transformado diversas industrias con nuestras soluciones personalizadas.</p>
          <Link href="/contacto">
            <button className="px-6 py-3 rounded-full font-semibold text-sm text-white" style={{ background: "#2ecc71" }}>
              Explorar más
            </button>
          </Link>
        </div>
      </section>

      {/* Industry grid */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Industrias que atendemos</h2>
            <p className="mt-3 text-gray-600">Soluciones especializadas para cada sector</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {INDUSTRIES.map((ind) => (
              <div key={ind.name} className="bg-[#f7f5f4] rounded-xl p-6 border border-gray-100 space-y-4 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{ background: ind.color }}>
                  {ind.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{ind.name}</h3>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Desafío</p>
                  <p className="text-gray-600 text-sm">{ind.challenge}</p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white" style={{ background: ind.color }}>
                  <TrendingUp className="w-3 h-3" /> {ind.result}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed cases */}
      <section className="py-20 px-6 bg-[#f7f5f4]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Casos de éxito detallados</h2>
          </div>
          <div className="space-y-8">
            {CASES.map((c, i) => (
              <div key={c.company} className={`bg-white rounded-2xl p-8 border border-gray-100 grid lg:grid-cols-2 gap-10 items-start ${i % 2 === 1 ? "lg:direction-rtl" : ""}`}>
                <div className="space-y-5">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">{c.industry}</span>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{c.company}</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold uppercase text-red-500 tracking-wide mb-1">Desafío</p>
                      <p className="text-gray-600 text-sm leading-relaxed">{c.challenge}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#2467a2" }}>Solución</p>
                      <p className="text-gray-600 text-sm leading-relaxed">{c.solution}</p>
                    </div>
                  </div>
                  <blockquote className="border-l-4 pl-4 italic text-gray-600 text-sm" style={{ borderColor: "#2467a2" }}>
                    "{c.quote}"
                    <footer className="mt-1 text-xs text-gray-400 not-italic">— {c.person}</footer>
                  </blockquote>
                </div>
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900">Resultados obtenidos</h4>
                  {c.results.map((r) => (
                    <div key={r} className="flex items-center gap-3 bg-[#f7f5f4] rounded-xl p-4">
                      <TrendingUp className="w-5 h-5 shrink-0" style={{ color: "#2ecc71" }} />
                      <span className="text-gray-800 font-semibold text-sm">{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center" style={{ background: "#2467a2" }}>
        <div className="max-w-2xl mx-auto space-y-6 text-white">
          <h2 className="text-3xl font-bold">¿Tu empresa podría ser el próximo caso de éxito?</h2>
          <p className="text-blue-100">Hablemos sobre cómo podemos transformar tu negocio.</p>
          <Link href="/contacto">
            <button className="px-8 py-3.5 rounded-lg font-semibold text-sm bg-white text-[#2467a2] hover:bg-blue-50 transition-all inline-flex items-center gap-2">
              Agendar una reunión <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
