import { Link } from "wouter";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ArrowRight, CheckCircle2, Megaphone, TrendingUp, Users, MessageCircle, BarChart3, Target } from "lucide-react";

const BRAND_BLUE = "#2467a2";
const BRAND_GREEN = "#25d366";

const SERVICES = [
  { icon: <MessageCircle className="w-5 h-5" />, title: "Captación por WhatsApp", desc: "Campañas que llevan tráfico a tu WhatsApp y el bot califica automáticamente. Leads 24/7 sin pagar por cada click." },
  { icon: <Target className="w-5 h-5" />, title: "Publicidad en Meta e Instagram", desc: "Anuncios segmentados para tu público en Argentina. Conectamos directamente con tu CRM para medir resultados reales." },
  { icon: <TrendingUp className="w-5 h-5" />, title: "SEO y contenido local", desc: "Posicionamiento en Google para búsquedas locales. Clientes que te buscan cuando ya quieren comprar." },
  { icon: <Users className="w-5 h-5" />, title: "Email marketing y nurturing", desc: "Secuencias automáticas que mantienen caliente a tus leads hasta que estén listos para comprar." },
  { icon: <BarChart3 className="w-5 h-5" />, title: "Reportes integrados al CRM", desc: "Ves exactamente qué canal genera más ventas, no solo clicks. ROI real conectado a tu pipeline." },
  { icon: <Megaphone className="w-5 h-5" />, title: "Gestión de redes sociales", desc: "Contenido, respuestas y comunidad. Tu marca activa en Instagram, LinkedIn y Facebook." },
];

const RESULTS = [
  { value: "+45%", label: "Leads promedio por mes en los primeros 90 días" },
  { value: "3x", label: "Retorno sobre inversión publicitaria promedio" },
  { value: "24/7", label: "Captación automática vía WhatsApp y formularios" },
];

export default function MarketingDigital() {
  return (
    <SiteLayout>
      <section className="relative overflow-hidden pt-20 pb-24" style={{ background: "linear-gradient(135deg, #1a0a00 0%, #4a2000 60%, #3a1500 100%)" }}>
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border border-orange-400/30 text-orange-300" style={{ background: "rgba(234,88,12,0.2)" }}>
              <Megaphone className="w-4 h-4" /> Marketing Digital
            </div>
            <h1 className="text-4xl lg:text-5xl font-black leading-tight">
              Más leads,{" "}
              <span style={{ color: BRAND_GREEN }}>más ventas</span>
            </h1>
            <p className="text-lg text-orange-100 leading-relaxed">
              Estrategias de marketing integradas con tu CRM. Cada lead que generamos entra directo a tu pipeline — nada se pierde, todo se mide.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/contacto">
                <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}>
                  Ver propuesta gratis <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-orange-200">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-400" /> Integrado con CRM</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-400" /> ROI medible</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-400" /> Para PyMEs argentinas</span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/10 space-y-3">
            <p className="text-white text-sm font-semibold mb-2">Resultados promedio a 90 días</p>
            {RESULTS.map((r) => (
              <div key={r.label} className="bg-white/10 rounded-xl p-4">
                <p className="text-3xl font-black" style={{ color: BRAND_GREEN }}>{r.value}</p>
                <p className="text-orange-200 text-sm mt-1">{r.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-gray-900">Servicios de marketing integrados</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">Todo conectado a tu CRM. Ves el impacto real de cada campaña en tus ventas.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((s) => (
              <div key={s.title} className="p-6 rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-white bg-orange-500">
                  {s.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-3xl font-black text-gray-900">La diferencia: todo conectado</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">La mayoría de las agencias de marketing te dan un reporte de clicks e impresiones. Nosotros te mostramos cuántas de esas personas compraron. Cada campaña conectada a tu pipeline de ventas en tiempo real.</p>
          <div className="grid sm:grid-cols-3 gap-6 mt-8">
            {[
              { step: "1", title: "Lead entra por campaña", desc: "Click en anuncio, formulario o WhatsApp" },
              { step: "2", title: "Entra al CRM automático", desc: "Con fuente, campaña y datos del contacto" },
              { step: "3", title: "Ves el ROI real", desc: "Cuánto invertiste vs cuánto vendiste" },
            ].map((s) => (
              <div key={s.step} className="bg-white rounded-2xl p-5 border border-gray-100 text-left">
                <div className="w-8 h-8 rounded-full text-white font-black text-sm flex items-center justify-center mb-3" style={{ background: BRAND_BLUE }}>{s.step}</div>
                <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 text-white text-center" style={{ background: BRAND_BLUE }}>
        <div className="max-w-2xl mx-auto px-6 space-y-6">
          <h2 className="text-3xl font-black">¿Hablemos de tu estrategia?</h2>
          <p className="text-blue-100">Te mostramos qué resultados son realistas para tu industria y presupuesto.</p>
          <Link href="/contacto">
            <button className="px-8 py-4 rounded-xl font-bold text-white text-lg hover:opacity-90 transition-all" style={{ background: BRAND_GREEN }}>
              Ver propuesta gratuita →
            </button>
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
