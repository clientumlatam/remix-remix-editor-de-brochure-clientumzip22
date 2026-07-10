import { Link } from "wouter";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Bot, CheckCircle2, ArrowRight, Zap, BarChart3, MessageCircle, Lightbulb, Clock } from "lucide-react";

const BRAND_BLUE = "#2467a2";
const BRAND_GREEN = "#25d366";

const EXAMPLES = [
  "¿Cuántos leads tuve esta semana?",
  "Mostrá el resumen del pipeline",
  "¿Cuál es el contacto con más actividad?",
  "Generá un borrador de propuesta para Empresa X",
  "¿Qué deals están sin actividad hace más de 7 días?",
  "Listá las facturas pendientes de este mes",
];

const FEATURES = [
  { icon: <BarChart3 className="w-5 h-5" />, title: "Reportes en lenguaje natural", desc: "Preguntale cualquier cosa sobre tu negocio y recibís la respuesta al instante, sin filtros ni tablas complejas." },
  { icon: <Zap className="w-5 h-5" />, title: "Acciones rápidas por chat", desc: "Creá contactos, deals o actividades simplemente describiendo lo que querés hacer." },
  { icon: <MessageCircle className="w-5 h-5" />, title: "Redacción asistida", desc: "El asistente te ayuda a escribir propuestas, emails y mensajes de seguimiento con contexto de tu CRM." },
  { icon: <Lightbulb className="w-5 h-5" />, title: "Sugerencias inteligentes", desc: "Detecta oportunidades: deals estancados, contactos sin actividad, leads calientes para priorizar." },
  { icon: <Clock className="w-5 h-5" />, title: "Ahorra horas por semana", desc: "Lo que antes te llevaba reportes manuales, ahora lo tenés en segundos con una pregunta simple." },
  { icon: <CheckCircle2 className="w-5 h-5" />, title: "Contexto completo de tu negocio", desc: "El asistente conoce tus contactos, deals, facturas y actividades. No es un chat genérico, es tu analista." },
];

export default function IaPage() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-24" style={{ background: "linear-gradient(135deg, #1a0533 0%, #3b1a6b 60%, #2d1258 100%)" }}>
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border border-purple-400/30 text-purple-300" style={{ background: "rgba(124,58,237,0.2)" }}>
              <Bot className="w-4 h-4" />
              Asistente IA
            </div>
            <h1 className="text-4xl lg:text-5xl font-black leading-tight">
              Tu analista de negocio,{" "}
              <span style={{ color: BRAND_GREEN }}>siempre disponible</span>
            </h1>
            <p className="text-lg text-purple-100 leading-relaxed">
              Preguntale cualquier cosa sobre tu CRM y recibís respuestas al instante. Reportes, sugerencias y acciones sin aprender ninguna herramienta.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/register">
                <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}>
                  Probar gratis <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-purple-200">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-400" /> Sin configuración</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-400" /> Incluido en todos los planes</span>
            </div>
          </div>

          {/* Chat UI */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/10 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <p className="text-white text-sm font-semibold">Asistente Clientum</p>
            </div>
            <div className="flex justify-end">
              <div className="bg-white/20 text-white text-sm px-4 py-2.5 rounded-2xl rounded-br-sm max-w-[80%]">
                ¿Cuántos leads tengo esta semana?
              </div>
            </div>
            <div className="bg-white text-gray-800 text-sm px-4 py-3 rounded-2xl rounded-bl-sm max-w-[85%] space-y-1">
              <p className="font-semibold">Esta semana registraste <span className="text-purple-600">12 leads nuevos</span> 📈</p>
              <p className="text-gray-500 text-xs">↑ 3 más que la semana pasada. Los más activos están en etapa "Propuesta".</p>
            </div>
            <div className="flex justify-end">
              <div className="bg-white/20 text-white text-sm px-4 py-2.5 rounded-2xl rounded-br-sm max-w-[80%]">
                ¿Cuáles deals están estancados?
              </div>
            </div>
            <div className="bg-white text-gray-800 text-sm px-4 py-3 rounded-2xl rounded-bl-sm max-w-[85%] space-y-1">
              <p className="font-semibold">Hay <span className="text-red-500">4 deals</span> sin actividad hace +7 días</p>
              <p className="text-gray-500 text-xs">¿Querés que te genere un mensaje de seguimiento para cada uno?</p>
            </div>
          </div>
        </div>
      </section>

      {/* Examples */}
      <section className="py-16 bg-gray-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-xl font-bold text-gray-700 mb-6">Preguntás en castellano, el asistente entiende</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {EXAMPLES.map((e) => (
              <span key={e} className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 shadow-sm">
                "{e}"
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-gray-900">Más que un chatbot — es tu copiloto de negocio</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">Conectado a todos tus datos: contactos, deals, facturas y actividades.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="p-6 rounded-2xl border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-white bg-purple-600">
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
          <h2 className="text-3xl font-black">Tu asistente de IA incluido en el plan</h2>
          <p className="text-blue-100">Probalo 14 días gratis sin tarjeta de crédito.</p>
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
