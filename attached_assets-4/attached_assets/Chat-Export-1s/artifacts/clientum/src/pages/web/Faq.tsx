import { useState } from "react";
import { Link } from "wouter";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ChevronDown, Search, MessageCircle, CreditCard, Bot, Zap, Headphones, FileText } from "lucide-react";

const BRAND_BLUE = "#2467a2";

const CATEGORIES = [
  { icon: <MessageCircle className="w-6 h-6" />, name: "WhatsApp & Chatbot", desc: "Conexión, configuración y límites del chatbot." },
  { icon: <CreditCard className="w-6 h-6" />, name: "Planes y pagos", desc: "Precios, facturación y métodos de pago." },
  { icon: <Bot className="w-6 h-6" />, name: "Asistente IA", desc: "Qué puede hacer la IA dentro del CRM." },
  { icon: <Zap className="w-6 h-6" />, name: "Implementación", desc: "Tiempos, requisitos y proceso de onboarding." },
  { icon: <Headphones className="w-6 h-6" />, name: "Soporte", desc: "Canales de atención y tiempos de respuesta." },
  { icon: <FileText className="w-6 h-6" />, name: "AFIP y facturación", desc: "Facturas electrónicas y cumplimiento fiscal." },
];

const ALL_FAQS = [
  {
    q: "¿Necesito saber programar para usar Clientum?",
    a: "No. Clientum está diseñado para dueños de PyMEs sin conocimientos técnicos. El onboarding es guiado y nuestro equipo te acompaña en los primeros pasos.",
  },
  {
    q: "¿En cuánto tiempo puedo estar operativo?",
    a: "En promedio una semana. Eso incluye la conexión del WhatsApp, configuración del chatbot y la migración de tus contactos existentes.",
  },
  {
    q: "¿Funciona con cualquier número de WhatsApp?",
    a: "Sí, funciona con WhatsApp Business (recomendado) y con líneas personales a través de la API de WhatsApp. Te asesoramos en la mejor opción según tu volumen.",
  },
  {
    q: "¿Cuántas conversaciones puede manejar el chatbot por mes?",
    a: "El plan Starter incluye 500 conversaciones/mes. El plan Pro tiene conversaciones ilimitadas. Si superás el límite, te avisamos antes de bloquearse.",
  },
  {
    q: "¿Puedo tener varias líneas de WhatsApp?",
    a: "Sí, desde el plan Enterprise podés conectar múltiples líneas (por ejemplo, una por sucursal o por área de negocio). Contactanos para configurarlo.",
  },
  {
    q: "¿Qué puede hacer el Asistente IA?",
    a: "El asistente responde preguntas sobre tu pipeline ('¿cuántos leads tengo esta semana?'), genera resúmenes de actividad, sugiere seguimientos y te ayuda a entender tus métricas de venta.",
  },
  {
    q: "¿Los precios son en pesos argentinos?",
    a: "Sí, todos los precios están en pesos argentinos (ARS). El IVA se discrimina en la factura: para monotributistas va incluido en el precio; para responsables inscriptos se detalla por separado.",
  },
  {
    q: "¿Puedo cancelar en cualquier momento?",
    a: "Sí, sin penalizaciones. Los planes son mes a mes. Si cancelás antes del fin del período, no se renueva.",
  },
  {
    q: "¿Emite facturas con CAE de AFIP?",
    a: "Sí. El módulo de facturación está integrado directamente con los web services de AFIP. Emitís facturas A, B y C con CAE en tiempo real sin salir del CRM.",
  },
  {
    q: "¿Es compatible con monotributistas?",
    a: "Sí, funciona para monotributistas (que emiten Factura C) y para responsables inscriptos (Facturas A y B). También soporta notas de crédito y débito.",
  },
  {
    q: "¿Puedo probar antes de pagar?",
    a: "Sí, todos los planes incluyen 14 días de prueba gratuita. No hace falta tarjeta de crédito para empezar.",
  },
  {
    q: "¿Cómo es el soporte técnico?",
    a: "Tenemos soporte por email, WhatsApp y videollamada. El plan Pro incluye soporte prioritario con tiempo de respuesta menor a 4 horas en días hábiles.",
  },
  {
    q: "¿Cuál es el propósito del período de prueba?",
    a: "El período de prueba de 14 días te permite evaluar todos los servicios de Clientum antes de comprometerte a un plan de pago. Sin tarjeta de crédito requerida.",
  },
  {
    q: "¿Pago mensual o anual?",
    a: "Ofrecemos opciones de pago mensuales y anuales para adaptarnos a tus necesidades. El pago anual incluye un descuento significativo respecto al mensual.",
  },
  {
    q: "¿Qué métodos de pago aceptan?",
    a: "Aceptamos diversas formas de pago, incluidas tarjetas de crédito (Visa, Mastercard, Amex), débito y transferencias bancarias.",
  },
  {
    q: "¿Se calcula el IVA por separado?",
    a: "Depende de tu situación impositiva. Los monotributistas pagan el precio publicado (IVA incluido). Los responsables inscriptos reciben la factura con IVA discriminado según la alícuota vigente.",
  },
  {
    q: "¿Ofrecen descuentos?",
    a: "Sí, ofrecemos descuentos para planes anuales y para empresas que contratan múltiples servicios. Contactanos para conocer las condiciones.",
  },
  {
    q: "¿Mis datos están seguros en Clientum?",
    a: "Sí. Todos los datos se almacenan en servidores seguros con cifrado SSL. Realizamos backups diarios y cumplimos con las normativas de protección de datos.",
  },
  {
    q: "¿Puedo integrar Clientum con MercadoLibre?",
    a: "Sí, la integración con MercadoLibre está disponible en el plan Pro y Enterprise. Sincronizamos catálogo, pedidos y mensajes automáticamente.",
  },
  {
    q: "¿Qué pasa si necesito más usuarios?",
    a: "El plan Pro incluye usuarios ilimitados para tu equipo. En el plan Starter hay hasta 5 usuarios. Para necesidades especiales, consultá el plan Enterprise.",
  },
];

export default function Faq() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? ALL_FAQS.filter(
        (f) =>
          f.q.toLowerCase().includes(search.toLowerCase()) ||
          f.a.toLowerCase().includes(search.toLowerCase())
      )
    : ALL_FAQS;

  const half = Math.ceil(filtered.length / 2);
  const left = filtered.slice(0, half);
  const right = filtered.slice(half);

  return (
    <SiteLayout>
      {/* Hero */}
      <section
        className="min-h-[320px] flex items-center px-6 py-24 text-center"
        style={{ background: "linear-gradient(135deg, #1a2b4a 0%, #2467a2 100%)" }}
      >
        <div className="max-w-3xl mx-auto space-y-6 text-white">
          <h1 className="text-4xl font-extrabold">¿Cómo podemos ayudarte?</h1>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscá tu pregunta..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-gray-800 text-sm focus:outline-none"
            />
          </div>
          <p className="text-blue-100 text-sm">
            Encontrá respuestas sobre el chatbot de WhatsApp, facturación AFIP, planes y más.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900">Explorá por categoría</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSearch(cat.name.split(" ")[0])}
                className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md hover:border-[#2467a2] transition-all text-center space-y-3 group"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white mx-auto transition-opacity group-hover:opacity-90" style={{ background: BRAND_BLUE }}>
                  {cat.icon}
                </div>
                <h3 className="font-bold text-gray-900">{cat.name}</h3>
                <p className="text-gray-500 text-sm">{cat.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ accordion */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              {search ? `${filtered.length} resultado${filtered.length !== 1 ? "s" : ""} para "${search}"` : "Preguntas frecuentes"}
            </h2>
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg">No encontramos resultados para tu búsqueda.</p>
              <button onClick={() => setSearch("")} className="mt-4 text-sm font-semibold underline" style={{ color: BRAND_BLUE }}>Ver todas las preguntas</button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {[left, right].map((col, ci) => (
                <div key={ci} className="space-y-3">
                  {col.map((faq, i) => {
                    const idx = ci === 0 ? i : half + i;
                    return (
                      <div key={idx} className="bg-[#f7f5f4] rounded-xl border border-gray-100 overflow-hidden">
                        <button
                          className="w-full flex items-center justify-between px-6 py-4 text-left"
                          onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                        >
                          <span className="font-semibold text-gray-900 text-sm pr-4">{faq.q}</span>
                          <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${openIdx === idx ? "rotate-180" : ""}`} />
                        </button>
                        {openIdx === idx && (
                          <div className="px-6 pb-4 text-gray-600 text-sm leading-relaxed">{faq.a}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-[#f7f5f4] text-center">
        <div className="max-w-xl mx-auto space-y-4">
          <h3 className="text-2xl font-bold text-gray-900">¿No encontraste tu respuesta?</h3>
          <p className="text-gray-600">Nuestro equipo te responde en menos de 24 horas hábiles.</p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link href="/contacto">
              <button className="px-6 py-3 rounded-lg font-semibold text-sm text-white" style={{ background: BRAND_BLUE }}>
                Escribirnos
              </button>
            </Link>
            <a href="https://wa.me/5492984000000" target="_blank" rel="noopener noreferrer">
              <button className="px-6 py-3 rounded-lg font-bold text-sm text-white flex items-center gap-2" style={{ background: "#25d366" }}>
                <MessageCircle className="w-4 h-4" /> WhatsApp directo
              </button>
            </a>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
