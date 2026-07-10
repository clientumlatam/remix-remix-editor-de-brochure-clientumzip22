import { Link } from "wouter";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ArrowRight, CheckCircle2, Search, Shield, Users, BarChart3, Clock, Wrench } from "lucide-react";

const BRAND_BLUE = "#2467a2";
const BRAND_GREEN = "#25d366";

const PHASES = [
  { icon: <Search className="w-5 h-5" />, title: "Análisis inicial", desc: "Relevamos tus procesos, herramientas actuales y necesidades del equipo. Nada se supone — todo se valida." },
  { icon: <Wrench className="w-5 h-5" />, title: "Configuración", desc: "Configuramos el sistema a medida: usuarios, permisos, flujos y datos migrados desde tus planillas actuales." },
  { icon: <Users className="w-5 h-5" />, title: "Capacitación", desc: "Formamos a todo tu equipo con sesiones prácticas. Aprenden haciendo, no leyendo manuales." },
  { icon: <BarChart3 className="w-5 h-5" />, title: "Go-live acompañado", desc: "El primer día en producción lo hacemos juntos. Estamos presentes para resolver cualquier duda al instante." },
  { icon: <Shield className="w-5 h-5" />, title: "Soporte continuo", desc: "Soporte técnico por WhatsApp y email. Respondemos en menos de 4 horas en días hábiles." },
  { icon: <Clock className="w-5 h-5" />, title: "Optimización mensual", desc: "Revisamos métricas de uso y proponemos mejoras. Tu sistema evoluciona con tu negocio." },
];

const SLA = [
  { metric: "Tiempo de respuesta", value: "< 4 horas" },
  { metric: "Disponibilidad del sistema", value: "99.9%" },
  { metric: "Resolución de incidentes críticos", value: "< 24 horas" },
  { metric: "Backups automáticos", value: "Diarios" },
];

export default function ImplementacionSoporte() {
  return (
    <SiteLayout>
      <section className="relative overflow-hidden pt-20 pb-24" style={{ background: "linear-gradient(135deg, #0a2040 0%, #0d3b6e 60%, #0a2a52 100%)" }}>
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-400/30 text-blue-300" style={{ background: "rgba(8,145,178,0.2)" }}>
              <Wrench className="w-4 h-4" /> Implementación y Soporte
            </div>
            <h1 className="text-4xl lg:text-5xl font-black leading-tight">
              No te dejamos solo{" "}
              <span style={{ color: BRAND_GREEN }}>ni un día</span>
            </h1>
            <p className="text-lg text-blue-100 leading-relaxed">
              Implementamos Clientum en tu empresa de punta a punta: análisis, configuración, migración de datos, capacitación y soporte continuo. Vos operás, nosotros resolvemos.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/contacto">
                <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}>
                  Hablar con un especialista <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-blue-200">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-400" /> Soporte en español</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-400" /> Respuesta en 4hs</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-400" /> Horario argentino</span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/10 space-y-3">
            <p className="text-white text-sm font-semibold mb-3">Nuestro SLA de soporte</p>
            {SLA.map((s) => (
              <div key={s.metric} className="flex justify-between items-center py-2.5 border-b border-white/10 last:border-0">
                <span className="text-blue-200 text-sm">{s.metric}</span>
                <span className="font-bold text-white text-sm">{s.value}</span>
              </div>
            ))}
            <div className="pt-3">
              <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Soporte incluido en todos los planes
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-gray-900">Cómo implementamos</h2>
            <p className="text-gray-500 mt-3">Un proceso probado que minimiza disrupciones y maximiza la adopción del equipo.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PHASES.map((p, i) => (
              <div key={p.title} className="p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: BRAND_BLUE }}>
                    {p.icon}
                  </div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Fase {i + 1}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{p.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-3xl font-black text-gray-900">¿Qué pasa si algo falla?</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Respondemos por WhatsApp en menos de 4 horas en días hábiles. Para incidentes críticos, tenés acceso directo a nuestro equipo técnico. Sin tickets que desaparecen, sin call centers — personas reales que conocen tu implementación.</p>
          <div className="grid sm:grid-cols-3 gap-4 mt-8">
            {[
              { label: "WhatsApp directo", desc: "Con tu consultor asignado" },
              { label: "Email técnico", desc: "Para incidentes no urgentes" },
              { label: "Videollamada", desc: "Para problemas complejos" },
            ].map((c) => (
              <div key={c.label} className="bg-white rounded-2xl p-5 border border-gray-100">
                <p className="font-bold text-gray-900 mb-1">{c.label}</p>
                <p className="text-sm text-gray-500">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 text-white text-center" style={{ background: BRAND_BLUE }}>
        <div className="max-w-2xl mx-auto px-6 space-y-6">
          <h2 className="text-3xl font-black">Implementación sin fricciones</h2>
          <p className="text-blue-100">Tu equipo operando en Clientum en menos de 30 días.</p>
          <Link href="/contacto">
            <button className="px-8 py-4 rounded-xl font-bold text-white text-lg hover:opacity-90 transition-all" style={{ background: BRAND_GREEN }}>
              Empezar la implementación →
            </button>
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
