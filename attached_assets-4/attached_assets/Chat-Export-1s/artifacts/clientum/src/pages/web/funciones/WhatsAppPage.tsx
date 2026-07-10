import { Link } from "wouter";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { MessageCircle, CheckCircle2, Clock, Zap, Users, BarChart3, ArrowRight, Star } from "lucide-react";

const BRAND_BLUE = "#2467a2";
const BRAND_GREEN = "#25d366";

const FEATURES = [
  { title: "Respuesta instantánea 24/7", desc: "El bot responde en segundos, sin importar el horario. Tu negocio nunca duerme." },
  { title: "Calificación automática de leads", desc: "Detecta intención de compra y clasifica a cada contacto antes de pasarlo a un asesor." },
  { title: "Agenda citas automáticamente", desc: "Integrado con tu calendario. El cliente elige horario y queda confirmado sin intervención humana." },
  { title: "Responde consultas frecuentes", desc: "Precios, stock, horarios, ubicación — configurás las respuestas una vez y funciona solo." },
  { title: "Derivación a humano cuando se necesita", desc: "Si la consulta es compleja, el bot transfiere la conversación al asesor correcto." },
  { title: "Historial completo en el CRM", desc: "Cada conversación de WhatsApp queda registrada en el perfil del contacto automáticamente." },
];

const STATS = [
  { value: "24/7", label: "Atención ininterrumpida" },
  { value: "+60%", label: "Consultas resueltas sin humano" },
  { value: "1 semana", label: "Tiempo para estar operativo" },
];

const STEPS = [
  { n: "1", title: "Conectás tu número", desc: "Vinculás tu WhatsApp Business en minutos. Sin código, sin IT." },
  { n: "2", title: "Configurás las respuestas", desc: "Cargás preguntas frecuentes, precios y flujos de conversación desde un panel simple." },
  { n: "3", title: "El bot entra en acción", desc: "Desde el primer mensaje, el chatbot atiende, califica y deriva. Vos solo revisás lo importante." },
];

export default function WhatsAppPage() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-24" style={{ background: "linear-gradient(135deg, #0a1628 0%, #1a3a5c 60%, #0d2b4a 100%)" }}>
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border border-green-400/30 text-green-300" style={{ background: "rgba(37,211,102,0.1)" }}>
              <MessageCircle className="w-4 h-4" />
              Chatbot WhatsApp
            </div>
            <h1 className="text-4xl lg:text-5xl font-black leading-tight">
              Tu negocio atiende solo,{" "}
              <span style={{ color: BRAND_GREEN }}>las 24 horas</span>
            </h1>
            <p className="text-lg text-blue-100 leading-relaxed">
              El chatbot de Clientum responde consultas, califica leads y agenda citas en WhatsApp — sin que toques nada. Operativo en una semana.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/register">
                <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}>
                  Probar 14 días gratis <ArrowRight className="w-4 h-4" />
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
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-400" /> Sin código ni IT</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-400" /> Operativo en 1 semana</span>
            </div>
          </div>

          {/* Chat preview */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/10 space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: BRAND_GREEN }}>
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Bot de tu empresa</p>
                <p className="text-green-400 text-xs">● En línea · Responde al instante</p>
              </div>
            </div>
            {[
              { from: "user", text: "Hola, ¿tienen stock del producto X?" },
              { from: "bot", text: "¡Hola! Sí, tenemos stock. ¿Cuántas unidades necesitás?" },
              { from: "user", text: "20 unidades. ¿Hacen envío?" },
              { from: "bot", text: "Sí, hacemos envío a todo el país. Te contacto con un asesor para confirmar. ¿Cuál es tu nombre?" },
            ].map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${m.from === "user" ? "bg-white/20 text-white rounded-br-sm" : "bg-white text-gray-800 rounded-bl-sm"}`}>
                  {m.text}
                </div>
              </div>
            ))}
            <p className="text-center text-xs text-blue-300 pt-2">Este bot trabaja 24/7 sin que nadie lo atienda</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 bg-gray-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.value}>
              <p className="text-4xl font-black" style={{ color: BRAND_BLUE }}>{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-gray-900">Todo lo que hace el chatbot por vos</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">Configurás una vez y funciona solo. Sin mantenimiento, sin actualizaciones manuales.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="p-6 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all">
                <CheckCircle2 className="w-6 h-6 mb-3" style={{ color: BRAND_GREEN }} />
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-black text-center text-gray-900 mb-12">¿Cómo funciona?</h2>
          <div className="space-y-8">
            {STEPS.map((s) => (
              <div key={s.n} className="flex gap-6 items-start">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black shrink-0" style={{ background: BRAND_BLUE }}>
                  {s.n}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
                  <p className="text-gray-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-white text-center" style={{ background: BRAND_BLUE }}>
        <div className="max-w-2xl mx-auto px-6 space-y-6">
          <h2 className="text-3xl font-black">Empezá hoy, sin riesgos</h2>
          <p className="text-blue-100">14 días gratis. Sin tarjeta. Sin IT. Tu chatbot operativo en una semana.</p>
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
