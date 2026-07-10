import { SiteLayout } from "@/components/layout/SiteLayout";
import { ArrowRight, BookOpen, Video, FileText, Download, MessageCircle, Bot, BarChart3, Zap, Users, CheckCircle2 } from "lucide-react";

const BRAND_BLUE = "#2467a2";
const BRAND_GREEN = "#25d366";

const RESOURCE_TYPES = [
  { icon: <FileText className="w-6 h-6" />, title: "Guías y Checklists", desc: "Documentos paso a paso para configurar y sacarle el máximo a Clientum desde el día 1.", color: BRAND_BLUE },
  { icon: <Video className="w-6 h-6" />, title: "Videos y Webinars", desc: "Grabaciones de demos, casos de uso reales y capacitaciones para tu equipo.", color: "#7c3aed" },
  { icon: <BookOpen className="w-6 h-6" />, title: "Plantillas listas", desc: "Templates de mensajes para WhatsApp, scripts de ventas y flujos de automatización.", color: BRAND_GREEN },
];

const DOWNLOADS = [
  {
    title: "Guía de configuración del Chatbot WhatsApp",
    type: "PDF",
    desc: "Paso a paso para conectar tu línea y personalizar el bot en menos de 2 horas.",
    icon: <MessageCircle className="w-5 h-5" />,
    color: BRAND_GREEN,
  },
  {
    title: "Checklist: CRM listo para vender",
    type: "PDF",
    desc: "Todo lo que tenés que configurar antes de lanzarte a usar el pipeline de ventas.",
    icon: <CheckCircle2 className="w-5 h-5" />,
    color: BRAND_BLUE,
  },
  {
    title: "Kit de mensajes para WhatsApp Business",
    type: "Template",
    desc: "50 respuestas predefinidas para los rubros más comunes: comercio, salud, servicios.",
    icon: <MessageCircle className="w-5 h-5" />,
    color: BRAND_GREEN,
  },
  {
    title: "Webinar: Automatizá tu PyME con IA",
    type: "Video",
    desc: "Grabación completa del webinar con casos reales y sesión de preguntas.",
    icon: <Video className="w-5 h-5" />,
    color: "#7c3aed",
  },
  {
    title: "Reporte: WhatsApp y CRM para PyMEs 2026",
    type: "PDF",
    desc: "Estadísticas del mercado argentino y cómo la IA está cambiando la atención al cliente.",
    icon: <BarChart3 className="w-5 h-5" />,
    color: "#ea580c",
  },
  {
    title: "Guía de automatizaciones avanzadas",
    type: "PDF",
    desc: "Flujos de seguimiento, recordatorios de pago y notificaciones automáticas explicados.",
    icon: <Zap className="w-5 h-5" />,
    color: "#ca8a04",
  },
  {
    title: "Plantilla: Pipeline de ventas para PyMEs",
    type: "Template",
    desc: "Estructura probada de etapas de venta adaptada al mercado argentino.",
    icon: <Users className="w-5 h-5" />,
    color: BRAND_BLUE,
  },
  {
    title: "Demo: Asistente IA en acción",
    type: "Video",
    desc: "Video de 15 min mostrando cómo usar el asistente para analizar tu pipeline.",
    icon: <Bot className="w-5 h-5" />,
    color: "#7c3aed",
  },
  {
    title: "Guía de facturación AFIP + Clientum",
    type: "PDF",
    desc: "Cómo emitir facturas A, B y C desde el CRM sin salir de la plataforma.",
    icon: <FileText className="w-5 h-5" />,
    color: "#ea580c",
  },
  {
    title: "Ebook: ERP para PyMEs argentinas",
    type: "PDF",
    desc: "Todo lo que necesitás saber antes de implementar un ERP en tu empresa. Con casos reales.",
    icon: <BookOpen className="w-5 h-5" />,
    color: BRAND_BLUE,
  },
  {
    title: "Guía SEO: posicioná tu web en Google",
    type: "PDF",
    desc: "Estrategias de SEO avanzado adaptadas al mercado argentino para aumentar tu tráfico orgánico.",
    icon: <BarChart3 className="w-5 h-5" />,
    color: "#059669",
  },
  {
    title: "Webinar: Crea tu Tienda Online con WooCommerce",
    type: "Video",
    desc: "Grabación completa de cómo lanzar una tienda e-commerce desde cero con WooCommerce.",
    icon: <Video className="w-5 h-5" />,
    color: "#7c3aed",
  },
  {
    title: "Checklist: Ciberseguridad para PyMEs",
    type: "PDF",
    desc: "Las 20 acciones que toda PyME debe tomar para proteger sus datos y sistemas.",
    icon: <CheckCircle2 className="w-5 h-5" />,
    color: "#dc2626",
  },
  {
    title: "Plantilla: Dashboard de ventas y métricas",
    type: "Template",
    desc: "Tablero de control con KPIs de ventas, actividad del equipo y conversión del pipeline.",
    icon: <BarChart3 className="w-5 h-5" />,
    color: "#ca8a04",
  },
  {
    title: "Ebook: Marketing Digital B2B en Argentina",
    type: "PDF",
    desc: "Estrategias probadas para generar leads calificados en el mercado B2B argentino.",
    icon: <BookOpen className="w-5 h-5" />,
    color: "#ea580c",
  },
];

export default function Recursos() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="bg-[#0f2952] py-24 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-6">
            <p className="text-sm uppercase tracking-widest font-semibold text-blue-300">Centro de Recursos</p>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Todo lo que necesitás para arrancar rápido
            </h1>
            <p className="text-gray-300 text-lg">Guías, templates y videos para configurar Clientum y empezar a vender solo desde el día 1.</p>
            <a href="#recursos">
              <button className="px-6 py-3 rounded-lg font-bold text-sm text-white flex items-center gap-2 transition-opacity hover:opacity-90" style={{ background: BRAND_BLUE }}>
                Ver todos los recursos <ArrowRight className="w-4 h-4" />
              </button>
            </a>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { num: "9+", label: "Recursos gratuitos" },
              { num: "50+", label: "Templates WhatsApp" },
              { num: "2h", label: "Tiempo hasta estar operativo" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-white">{s.num}</div>
                <p className="text-blue-200 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resource type cards */}
      <section className="py-20 px-6 bg-white" id="recursos">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Tipos de recursos</h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">Materiales creados por el equipo de Clientum con casos reales de PyMEs argentinas</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {RESOURCE_TYPES.map((r) => (
              <div key={r.title} className="bg-[#f7f5f4] rounded-xl p-8 border border-gray-100 space-y-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white" style={{ background: r.color }}>
                  {r.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{r.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Downloads grid */}
      <section className="py-20 px-6 bg-[#f7f5f4]">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Recursos disponibles</h2>
            <p className="mt-3 text-gray-500">Todos gratuitos para usuarios de Clientum</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {DOWNLOADS.map((p) => (
              <div key={p.title} className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-all space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0" style={{ background: p.color }}>
                    {p.icon}
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-500">{p.type}</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm leading-snug">{p.title}</h3>
                  <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">{p.desc}</p>
                </div>
                <button className="flex items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-80" style={{ color: BRAND_BLUE }}>
                  <Download className="w-4 h-4" /> Descargar gratis
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 px-6 text-center" style={{ background: BRAND_BLUE }}>
        <div className="max-w-xl mx-auto space-y-6 text-white">
          <h2 className="text-3xl font-bold">Recibí recursos exclusivos</h2>
          <p className="text-blue-100">Cada mes enviamos guías nuevas, templates y casos de éxito de PyMEs que automatizaron con Clientum.</p>
          <div className="flex gap-3 max-w-sm mx-auto">
            <input
              placeholder="tu@empresa.com"
              className="flex-1 px-4 py-3 rounded-lg bg-white/20 placeholder-blue-200 text-white border border-white/30 text-sm focus:outline-none"
            />
            <button className="px-4 py-3 rounded-lg font-bold text-sm bg-white shrink-0 flex items-center gap-1 hover:bg-blue-50 transition-all" style={{ color: BRAND_BLUE }}>
              Suscribir <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
