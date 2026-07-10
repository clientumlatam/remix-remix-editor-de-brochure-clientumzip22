import { Link } from "wouter";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ArrowRight, Settings2, Zap, Wrench, Megaphone, Globe, Code2, CheckCircle2 } from "lucide-react";

const BRAND_BLUE = "#2467a2";
const BRAND_GREEN = "#25d366";

const SERVICES = [
  { icon: <Settings2 className="w-6 h-6" />, title: "Consultoría Empresarial", desc: "Analizamos tus procesos y diseñamos un plan de transformación digital a medida para tu PyME.", href: "/servicios/consultoria", color: "#2467a2" },
  { icon: <Zap className="w-6 h-6" />, title: "ERP Personalizado", desc: "Implementamos un sistema de gestión integral adaptado a tu industria, sin complejidad innecesaria.", href: "/servicios/erp", color: "#7c3aed" },
  { icon: <Wrench className="w-6 h-6" />, title: "Implementación y Soporte", desc: "Te acompañamos desde el día 1 hasta que el sistema esté operativo. Soporte continuo incluido.", href: "/servicios/implementacion", color: "#0891b2" },
  { icon: <Megaphone className="w-6 h-6" />, title: "Marketing Digital", desc: "Estrategias de captación de leads integradas con tu CRM para que tu pipeline nunca se quede vacío.", href: "/servicios/marketing", color: "#ea580c" },
  { icon: <Globe className="w-6 h-6" />, title: "Integración de Tecnología", desc: "Conectamos Clientum con tus herramientas actuales: WhatsApp, MercadoLibre, AFIP y más.", href: "/servicios/integracion", color: "#059669" },
  { icon: <Code2 className="w-6 h-6" />, title: "Desarrollo Web", desc: "Sitios y aplicaciones web profesionales integrados con tu CRM para capturar más leads.", href: "/servicios/desarrollo-web", color: "#dc2626" },
  { icon: <Globe className="w-6 h-6" />, title: "E-commerce y Tiendas Online", desc: "Creamos tu tienda online con WooCommerce o Shopify, integrada con tu inventario y CRM.", href: "/servicios/ecommerce", color: "#0891b2" },
  { icon: <CheckCircle2 className="w-6 h-6" />, title: "Business Intelligence", desc: "Transformamos los datos de tu empresa en dashboards e informes que guían las decisiones estratégicas.", href: "/servicios/bi", color: "#7c3aed" },
  { icon: <Zap className="w-6 h-6" />, title: "Inteligencia Artificial para PyMEs", desc: "Incorporamos IA en tus procesos: chatbots, análisis predictivo y automatización inteligente.", href: "/servicios/ia", color: "#ca8a04" },
  { icon: <Wrench className="w-6 h-6" />, title: "Hosting y Dominios", desc: "Servidores estables, rápidos y seguros para tu sitio web y aplicaciones, con soporte local.", href: "/servicios/hosting", color: "#059669" },
];

const WHY = [
  "Especialistas en PyMEs argentinas",
  "Sin código ni IT de tu parte",
  "Operativo en días, no meses",
  "Precios en pesos, sin sorpresas",
  "Soporte en español y en horario local",
  "Resultados medibles desde el primer mes",
];

export default function Servicios() {
  return (
    <SiteLayout>
      <section className="relative overflow-hidden pt-20 pb-24" style={{ background: "linear-gradient(135deg, #0a1628 0%, #1a3a5c 60%, #0d2b4a 100%)" }}>
        <div className="max-w-4xl mx-auto px-6 text-center text-white space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-400/30 text-blue-300" style={{ background: "rgba(36,103,162,0.2)" }}>
            Servicios para PyMEs argentinas
          </div>
          <h1 className="text-4xl lg:text-5xl font-black leading-tight">
            Todo lo que tu empresa necesita{" "}
            <span style={{ color: BRAND_GREEN }}>en un solo lugar</span>
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Desde consultoría y ERP hasta marketing digital y desarrollo web. Implementamos, capacitamos y acompañamos.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/contacto">
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}>
                Hablar con un asesor <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/precios">
              <button className="px-6 py-3 rounded-xl font-semibold text-white border border-white/20 hover:bg-white/10 transition-colors">
                Ver precios
              </button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-gray-900">Nuestros servicios</h2>
            <p className="text-gray-500 mt-3">Elegí los que necesitás o contratá el paquete completo.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((s) => (
              <Link key={s.title} href={s.href}>
                <div className="group p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all cursor-pointer h-full">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white transition-transform group-hover:scale-110" style={{ background: s.color }}>
                    {s.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{s.desc}</p>
                  <span className="text-sm font-semibold flex items-center gap-1 transition-colors" style={{ color: BRAND_BLUE }}>
                    Saber más <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">¿Por qué elegir Clientum?</h2>
            <p className="text-gray-500 leading-relaxed">Somos un equipo especializado en digitalizar PyMEs argentinas. Conocemos la realidad local: AFIP, WhatsApp Business, precios en pesos y la necesidad de resultados rápidos sin depender de IT.</p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {WHY.map((w) => (
              <div key={w} className="flex items-center gap-3 bg-white rounded-xl px-5 py-3.5 border border-gray-100 shadow-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: BRAND_GREEN }} />
                <span className="text-gray-700 font-medium text-sm">{w}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 text-white text-center" style={{ background: BRAND_BLUE }}>
        <div className="max-w-2xl mx-auto px-6 space-y-6">
          <h2 className="text-3xl font-black">¿No sabés por dónde empezar?</h2>
          <p className="text-blue-100">Hablamos 30 minutos sin costo y te decimos exactamente qué necesita tu empresa.</p>
          <Link href="/contacto">
            <button className="px-8 py-4 rounded-xl font-bold text-white text-lg hover:opacity-90 transition-all" style={{ background: BRAND_GREEN }}>
              Hablar con un asesor →
            </button>
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
