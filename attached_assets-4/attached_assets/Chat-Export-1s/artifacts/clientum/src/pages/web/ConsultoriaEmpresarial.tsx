import { Link } from "wouter";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ArrowRight, CheckCircle2, Search, Target, Rocket, Settings2 } from "lucide-react";

const BRAND_BLUE = "#2467a2";
const BRAND_GREEN = "#25d366";

const BENEFITS = [
  "Diagnóstico exhaustivo de procesos y operaciones",
  "Plan de acción personalizado con objetivos claros",
  "Acompañamiento en la implementación de estrategias",
  "Resultados tangibles y medibles desde el inicio",
  "Equipo especializado en PyMEs argentinas",
  "Revisión y optimización continua",
];

const INDUSTRIES = ["Manufactura", "Agroindustria", "Retail y Comercio", "Distribución y Logística", "Servicios Profesionales", "Gastronomía"];

const STEPS = [
  { icon: <Search className="w-6 h-6" />, title: "Diagnóstico", desc: "Analizamos en profundidad tus procesos, herramientas y equipo para identificar exactamente dónde están las oportunidades de mejora." },
  { icon: <Target className="w-6 h-6" />, title: "Plan a medida", desc: "Diseñamos un plan de acción concreto con objetivos, plazos y métricas. Sin generalidades — todo específico para tu empresa." },
  { icon: <Rocket className="w-6 h-6" />, title: "Implementación", desc: "Acompañamos la ejecución paso a paso. Tu equipo no queda solo: estamos en cada etapa hasta ver los resultados." },
];

export default function ConsultoriaEmpresarial() {
  return (
    <SiteLayout>
      <section className="relative overflow-hidden pt-20 pb-24" style={{ background: "linear-gradient(135deg, #0a1628 0%, #1a3a5c 60%, #0d2b4a 100%)" }}>
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-400/30 text-blue-300" style={{ background: "rgba(36,103,162,0.2)" }}>
              <Settings2 className="w-4 h-4" /> Consultoría Empresarial
            </div>
            <h1 className="text-4xl lg:text-5xl font-black leading-tight">
              Transformá tu PyME con{" "}
              <span style={{ color: BRAND_GREEN }}>un plan real</span>
            </h1>
            <p className="text-lg text-blue-100 leading-relaxed">
              Analizamos tu negocio, identificamos ineficiencias y diseñamos un plan de acción concreto. Sin consultoras genéricas — especialistas en PyMEs argentinas.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/contacto">
                <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}>
                  Diagnóstico gratuito <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-blue-200">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-400" /> Sin compromisos</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-400" /> Resultados medibles</span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10 space-y-4">
            <p className="text-white font-semibold text-sm mb-2">Lo que lográs en 90 días</p>
            {["Procesos digitalizados y documentados", "Pipeline de ventas organizado y visible", "Reportes automáticos sin armar planillas", "Equipo operando en el sistema sin fricciones", "Primeros leads captados por WhatsApp automático"].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-green-400" />
                <span className="text-white text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-black text-center text-gray-900 mb-12">Nuestro método</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <div key={s.title} className="bg-white rounded-2xl p-6 border border-gray-100 text-center space-y-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white mx-auto" style={{ background: BRAND_BLUE }}>
                  {s.icon}
                </div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Paso {i + 1}</div>
                <h3 className="font-bold text-gray-900 text-lg">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-gray-900">Beneficios concretos</h2>
            <p className="text-gray-500">Cada consultoría termina con entregables claros, no con recomendaciones vagas.</p>
            <div className="space-y-3 mt-6">
              {BENEFITS.map((b) => (
                <div key={b} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: BRAND_GREEN }} />
                  <span className="text-gray-700 text-sm font-medium">{b}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900">Industrias que atendemos</h3>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map((ind) => (
                <span key={ind} className="px-4 py-2 rounded-full text-sm font-medium bg-blue-50 border border-blue-100" style={{ color: BRAND_BLUE }}>{ind}</span>
              ))}
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-3 mt-4">
              <p className="font-bold text-gray-900">Primera sesión sin costo</p>
              <p className="text-gray-500 text-sm">Charlamos 30 minutos, entendemos tu situación y te decimos si podemos ayudarte. Sin presión, sin letra chica.</p>
              <Link href="/contacto">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm mt-2" style={{ background: BRAND_BLUE }}>
                  Reservar sesión gratuita <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 text-white text-center" style={{ background: BRAND_BLUE }}>
        <div className="max-w-2xl mx-auto px-6 space-y-6">
          <h2 className="text-3xl font-black">¿Listo para transformar tu empresa?</h2>
          <p className="text-blue-100">Diagnóstico inicial sin costo. Resultados en 90 días.</p>
          <Link href="/contacto">
            <button className="px-8 py-4 rounded-xl font-bold text-white text-lg hover:opacity-90 transition-all" style={{ background: BRAND_GREEN }}>
              Hablar con un consultor →
            </button>
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
