import { Link } from "wouter";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ArrowRight, CheckCircle2, Globe, Zap, BarChart3, RefreshCw, Link2, ShieldCheck } from "lucide-react";

const BRAND_BLUE = "#2467a2";
const BRAND_GREEN = "#25d366";

const INTEGRATIONS = [
  { name: "WhatsApp Business", desc: "Conversaciones sincronizadas al CRM automáticamente.", category: "Comunicación" },
  { name: "MercadoLibre", desc: "Pedidos y consultas de ML directo en tu CRM.", category: "E-commerce" },
  { name: "AFIP / Facturación electrónica", desc: "Facturas emitidas desde el CRM con un click.", category: "Administración" },
  { name: "Google Calendar", desc: "Reuniones y recordatorios sincronizados al instante.", category: "Productividad" },
  { name: "Gmail / Outlook", desc: "Emails de clientes registrados automáticamente en el CRM.", category: "Comunicación" },
  { name: "Sistemas legacy", desc: "Conectamos Clientum con tu ERP o sistema actual.", category: "ERP" },
];

const BENEFITS = [
  { icon: <RefreshCw className="w-5 h-5" />, title: "Datos siempre sincronizados", desc: "Un cambio en un sistema se refleja en todos. Nunca más datos desactualizados ni duplicados." },
  { icon: <Zap className="w-5 h-5" />, title: "Automatización real", desc: "Los flujos se disparan solos: un pedido en ML crea el contacto, la oportunidad y la tarea de seguimiento." },
  { icon: <BarChart3 className="w-5 h-5" />, title: "Visión unificada", desc: "Ves todo el negocio en un dashboard. Sin abrir 5 aplicaciones distintas para entender qué pasa." },
  { icon: <ShieldCheck className="w-5 h-5" />, title: "Sin pérdida de datos", desc: "La integración es auditada. Si algo falla, hay rollback automático y alerta al equipo técnico." },
];

export default function IntegracionTecnologia() {
  return (
    <SiteLayout>
      <section className="relative overflow-hidden pt-20 pb-24" style={{ background: "linear-gradient(135deg, #021a12 0%, #064e3b 60%, #065f46 100%)" }}>
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border border-green-400/30 text-green-300" style={{ background: "rgba(5,150,105,0.2)" }}>
              <Link2 className="w-4 h-4" /> Integración de Tecnología
            </div>
            <h1 className="text-4xl lg:text-5xl font-black leading-tight">
              Tus sistemas,{" "}
              <span style={{ color: BRAND_GREEN }}>todos conectados</span>
            </h1>
            <p className="text-lg text-green-100 leading-relaxed">
              Conectamos Clientum con WhatsApp, MercadoLibre, AFIP, Gmail y tus sistemas actuales. Un ecosistema integrado donde los datos fluyen solos.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/contacto">
                <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}>
                  Ver integraciones disponibles <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-green-200">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-400" /> Sin código</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-400" /> Sincronización en tiempo real</span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/10">
            <p className="text-white text-sm font-semibold mb-4">Integraciones más usadas</p>
            <div className="grid grid-cols-2 gap-3">
              {["WhatsApp", "MercadoLibre", "AFIP", "Gmail", "Google Cal.", "ERP Propio"].map((app) => (
                <div key={app} className="bg-white/10 rounded-xl px-4 py-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-white text-sm font-medium">{app}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 text-green-300 text-sm">
              <Globe className="w-4 h-4" />
              <span>+ integraciones a medida por API</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-gray-900">Integraciones disponibles</h2>
            <p className="text-gray-500 mt-3">Conectadas y listas para activar. Si no está en la lista, lo hacemos a medida.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {INTEGRATIONS.map((int) => (
              <div key={int.name} className="p-5 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900">{int.name}</h3>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-50 text-green-700 border border-green-100">{int.category}</span>
                </div>
                <p className="text-sm text-gray-500">{int.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-gray-900">Por qué integrar todo</h2>
            <p className="text-gray-500 mt-3">Cuando tus sistemas están separados, perdés tiempo, datos y ventas.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {BENEFITS.map((b) => (
              <div key={b.title} className="flex gap-4 p-6 rounded-2xl bg-white border border-gray-100">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white" style={{ background: "#059669" }}>
                  {b.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{b.title}</h3>
                  <p className="text-sm text-gray-500">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 text-white text-center" style={{ background: BRAND_BLUE }}>
        <div className="max-w-2xl mx-auto px-6 space-y-6">
          <h2 className="text-3xl font-black">¿Usás una herramienta que no está en la lista?</h2>
          <p className="text-blue-100">Desarrollamos integraciones a medida vía API. Contanos qué usás y te decimos si es posible.</p>
          <Link href="/contacto">
            <button className="px-8 py-4 rounded-xl font-bold text-white text-lg hover:opacity-90 transition-all" style={{ background: BRAND_GREEN }}>
              Consultar integración →
            </button>
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
