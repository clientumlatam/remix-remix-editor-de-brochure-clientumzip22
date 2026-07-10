import { Link } from "wouter";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ArrowRight, CheckCircle2, Code2, Globe, Smartphone, Zap, ChevronDown, ShieldCheck } from "lucide-react";
import { useState } from "react";

const BRAND_BLUE = "#2467a2";
const BRAND_GREEN = "#25d366";

const SERVICES = [
  { icon: <Globe className="w-5 h-5" />, title: "Sitio web corporativo", desc: "Presencia profesional que genera confianza y captura leads. Diseño moderno, carga rápida y optimizado para Google." },
  { icon: <Smartphone className="w-5 h-5" />, title: "Landing pages de conversión", desc: "Páginas diseñadas para convertir visitas en leads. Integradas con tu CRM para seguimiento automático." },
  { icon: <Code2 className="w-5 h-5" />, title: "Aplicaciones web a medida", desc: "Plataformas y apps que resuelven procesos específicos de tu empresa. Integradas con Clientum desde el día 1." },
  { icon: <Zap className="w-5 h-5" />, title: "E-commerce integrado", desc: "Tienda online sincronizada con tu inventario, CRM y facturación. Pedidos que entran solos al sistema." },
  { icon: <ShieldCheck className="w-5 h-5" />, title: "Mantenimiento y hosting", desc: "Servidor, SSL, actualizaciones de seguridad y backups diarios. Tu sitio siempre online y protegido." },
  { icon: <CheckCircle2 className="w-5 h-5" />, title: "Integración con WhatsApp", desc: "Botón de WhatsApp conectado al chatbot de Clientum. Cada visita puede convertirse en un lead calificado." },
];

const FAQS = [
  { q: "¿Cuánto tiempo lleva hacer mi sitio web?", a: "Un sitio corporativo estándar toma 3-4 semanas. Un e-commerce con integraciones puede tomar 6-8 semanas. Todo depende de la cantidad de páginas y funcionalidades." },
  { q: "¿Puedo integrar mi sitio con el CRM?", a: "Sí, es parte de nuestro diferencial. Los formularios de contacto, el chat de WhatsApp y los pedidos del e-commerce entran directo al CRM automáticamente." },
  { q: "¿Qué pasa con el mantenimiento después?", a: "Tenemos planes de mantenimiento mensual que incluyen hosting, SSL, backups, actualizaciones de seguridad y soporte técnico." },
  { q: "¿Puedo tener mi propio dominio?", a: "Sí. Te ayudamos a registrar un dominio si no tenés, o configuramos el que ya tenés. El sitio es tuyo completamente." },
  { q: "¿Hacen e-commerce con MercadoPago?", a: "Sí. Integramos MercadoPago, Mercado Libre y transferencias bancarias. También conectamos con AFIP para facturación automática." },
];

export default function DesarrolloWeb() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <SiteLayout>
      <section className="relative overflow-hidden pt-20 pb-24" style={{ background: "linear-gradient(135deg, #1a0a0a 0%, #6b1a1a 60%, #4a1010 100%)" }}>
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border border-red-400/30 text-red-300" style={{ background: "rgba(220,38,38,0.2)" }}>
              <Code2 className="w-4 h-4" /> Desarrollo Web
            </div>
            <h1 className="text-4xl lg:text-5xl font-black leading-tight">
              Tu presencia web,{" "}
              <span style={{ color: BRAND_GREEN }}>conectada al CRM</span>
            </h1>
            <p className="text-lg text-red-100 leading-relaxed">
              Sitios web, landing pages y e-commerce integrados con Clientum. Cada visita que convierte entra directo a tu pipeline — nada se pierde.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/contacto">
                <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}>
                  Pedir presupuesto <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-red-200">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-400" /> Diseño moderno y responsivo</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-400" /> Integrado con WhatsApp y CRM</span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-2xl overflow-hidden border border-white/10">
            <div className="bg-white/20 px-4 py-2.5 flex items-center gap-2">
              <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400" /><div className="w-2.5 h-2.5 rounded-full bg-yellow-400" /><div className="w-2.5 h-2.5 rounded-full bg-green-400" /></div>
              <div className="flex-1 bg-white/10 rounded px-3 py-1 text-xs text-white/60">tuempresa.com.ar</div>
            </div>
            <div className="p-5 space-y-3">
              <div className="bg-white/20 rounded-lg h-8 w-3/4" />
              <div className="bg-white/10 rounded-lg h-4 w-full" />
              <div className="bg-white/10 rounded-lg h-4 w-5/6" />
              <div className="bg-white/10 rounded-lg h-4 w-4/6" />
              <div className="flex gap-3 mt-4">
                <div className="px-4 py-2 rounded-lg text-xs font-semibold text-white" style={{ background: BRAND_GREEN }}>Pedir presupuesto</div>
                <div className="px-4 py-2 rounded-lg text-xs font-semibold text-white border border-white/30">Ver servicios</div>
              </div>
              <div className="bg-white/10 rounded-lg h-24 mt-2 flex items-center justify-center">
                <Globe className="w-8 h-8 text-white/30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-gray-900">Lo que desarrollamos</h2>
            <p className="text-gray-500 mt-3">Todo con integración nativa a Clientum CRM.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((s) => (
              <div key={s.title} className="p-6 rounded-2xl border border-gray-100 hover:border-red-200 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-white bg-red-600">
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
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900">Preguntas frecuentes</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <button className="w-full flex items-center justify-between px-6 py-4 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="font-semibold text-gray-900 text-sm">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-gray-500 text-sm leading-relaxed">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 text-white text-center" style={{ background: BRAND_BLUE }}>
        <div className="max-w-2xl mx-auto px-6 space-y-6">
          <h2 className="text-3xl font-black">¿Tenés un proyecto en mente?</h2>
          <p className="text-blue-100">Contanos qué necesitás y te damos presupuesto en 48 horas.</p>
          <Link href="/contacto">
            <button className="px-8 py-4 rounded-xl font-bold text-white text-lg hover:opacity-90 transition-all" style={{ background: BRAND_GREEN }}>
              Pedir presupuesto →
            </button>
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
