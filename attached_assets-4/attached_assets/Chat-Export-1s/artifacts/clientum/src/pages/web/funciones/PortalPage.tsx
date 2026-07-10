import { Link } from "wouter";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Globe, CheckCircle2, ArrowRight, FileText, BarChart3, MessageCircle, Shield, Smartphone } from "lucide-react";

const BRAND_BLUE = "#2467a2";
const BRAND_GREEN = "#25d366";

const FEATURES = [
  { icon: <FileText className="w-5 h-5" />, title: "Facturas y cotizaciones online", desc: "Tus clientes ven y descargan sus facturas y presupuestos sin llamarte ni mandarte mensajes." },
  { icon: <BarChart3 className="w-5 h-5" />, title: "Estado de sus pedidos y deals", desc: "Seguimiento en tiempo real del avance de sus proyectos o pedidos, actualizado automáticamente." },
  { icon: <MessageCircle className="w-5 h-5" />, title: "Comunicación directa", desc: "El cliente puede enviarte mensajes desde el portal que llegan directo a su perfil en el CRM." },
  { icon: <Shield className="w-5 h-5" />, title: "Acceso seguro con contraseña", desc: "Cada cliente tiene su propio acceso privado. Solo ve su información, nada de otros clientes." },
  { icon: <Smartphone className="w-5 h-5" />, title: "Funciona en celular", desc: "Diseño responsive. Tus clientes acceden desde el celular sin instalar nada." },
  { icon: <Globe className="w-5 h-5" />, title: "Con tu marca y dominio", desc: "El portal lleva tu logo y colores. Tus clientes lo ven como parte de tu empresa." },
];

const PORTAL_SECTIONS = [
  { label: "Mis Facturas", icon: "📄" },
  { label: "Mis Pedidos", icon: "📦" },
  { label: "Mis Cotizaciones", icon: "💼" },
  { label: "Mensajes", icon: "💬" },
];

export default function PortalPage() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-24" style={{ background: "linear-gradient(135deg, #0a1f0a 0%, #1a4a1a 60%, #123a12 100%)" }}>
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border border-green-400/30 text-green-300" style={{ background: "rgba(37,211,102,0.1)" }}>
              <Globe className="w-4 h-4" />
              Portal del Cliente
            </div>
            <h1 className="text-4xl lg:text-5xl font-black leading-tight">
              Tus clientes se{" "}
              <span style={{ color: BRAND_GREEN }}>autoatienden</span>
            </h1>
            <p className="text-lg text-green-100 leading-relaxed">
              Un portal privado donde cada cliente ve sus facturas, pedidos y cotizaciones. Menos llamadas, más satisfacción.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/register">
                <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}>
                  Probar gratis <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/portal/login">
                <button className="px-6 py-3 rounded-xl font-semibold text-white border border-white/20 hover:bg-white/10 transition-colors">
                  Ver demo del portal
                </button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-green-200">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-400" /> Con tu marca</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-400" /> Acceso seguro</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-400" /> Funciona en celular</span>
            </div>
          </div>

          {/* Portal preview */}
          <div className="bg-white/10 backdrop-blur rounded-2xl overflow-hidden border border-white/10">
            <div className="bg-white/20 px-4 py-3 flex items-center gap-2">
              <div className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-black" style={{ background: BRAND_BLUE }}>C</div>
              <p className="text-white text-sm font-semibold">Portal de Clientes — Clientum</p>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-green-300 text-xs font-semibold">Bienvenido, Distribuidora del Sur</p>
              <div className="grid grid-cols-2 gap-2">
                {PORTAL_SECTIONS.map((s) => (
                  <div key={s.label} className="bg-white/10 rounded-xl p-3 flex items-center gap-2 cursor-pointer hover:bg-white/20 transition-colors">
                    <span className="text-lg">{s.icon}</span>
                    <span className="text-white text-xs font-medium">{s.label}</span>
                  </div>
                ))}
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-green-300 text-xs font-semibold mb-2">Última factura</p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white text-sm font-bold">FAC-0042</p>
                    <p className="text-green-300 text-xs">Junio 2026 · $124.500</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-300 font-medium">Pagada</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-gray-900">Todo lo que ven tus clientes</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">Un portal profesional que refleja la calidad de tu empresa.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="p-6 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-white" style={{ background: BRAND_GREEN }}>
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
          <h2 className="text-3xl font-black">Dale a tus clientes una experiencia premium</h2>
          <p className="text-blue-100">El portal está incluido en todos los planes. Activalo en minutos.</p>
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
