import { Link } from "wouter";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { CheckCircle2, ChevronDown, Star, MessageCircle } from "lucide-react";
import { useState } from "react";

const BRAND_BLUE = "#2467a2";
const BRAND_GREEN = "#25d366";

const PLANS = [
  {
    name: "Starter",
    price: "$29.990",
    period: "/ mes",
    desc: "Para PyMEs que están empezando con la automatización.",
    featured: false,
    features: [
      "Chatbot WhatsApp (hasta 500 conversaciones/mes)",
      "CRM hasta 500 contactos",
      "Pipeline de ventas visual",
      "Reportes básicos",
      "Portal del cliente",
      "Soporte por email",
    ],
  },
  {
    name: "Pro",
    price: "$59.990",
    period: "/ mes",
    desc: "Para PyMEs que quieren escalar sin sumar personal.",
    featured: true,
    features: [
      "Chatbot WhatsApp ilimitado",
      "CRM contactos ilimitados",
      "Asistente IA incluido",
      "Automatización de flujos",
      "Facturación integrada (AFIP)",
      "Reportes automáticos avanzados",
      "Portal del cliente personalizado",
      "Soporte prioritario",
    ],
  },
  {
    name: "Enterprise",
    price: "A medida",
    period: "",
    desc: "Para empresas con necesidades específicas o volúmenes altos.",
    featured: false,
    features: [
      "Todo lo de Pro",
      "Multi-sucursal / Multi-línea WhatsApp",
      "Integración con sistemas propios (API)",
      "Onboarding dedicado",
      "SLA garantizado",
      "Capacitación del equipo",
    ],
  },
];

const INCLUDED = [
  "Aplicación de escritorio y móvil",
  "Estimaciones de tiempo y análisis de eficiencia",
  "Facturación electrónica integrada",
  "Pagos en línea y cobros automatizados",
  "Informes avanzados y dashboards",
  "Tareas recurrentes automáticas",
  "Actualizaciones automáticas",
  "Soporte técnico incluido",
  "Datos en pesos argentinos",
  "Onboarding guiado",
  "14 días de prueba gratis",
];

const FAQS = [
  {
    q: "¿Necesito saber programar?",
    a: "No. Clientum está diseñado para que cualquier dueño de PyME pueda configurarlo y operarlo sin conocimientos técnicos. Te acompañamos durante el onboarding.",
  },
  {
    q: "¿En cuánto tiempo está funcionando?",
    a: "En promedio una semana desde que empezás. Incluye la configuración del chatbot, importación de contactos y capacitación básica.",
  },
  {
    q: "¿Los precios son en pesos argentinos?",
    a: "Sí, todos los precios están en pesos argentinos (ARS) y se facturan mensualmente.",
  },
  {
    q: "¿Puedo cancelar en cualquier momento?",
    a: "Sí, podés cancelar cuando quieras sin penalizaciones. Los planes son mes a mes sin compromisos.",
  },
  {
    q: "¿Qué pasa si supero el límite de conversaciones?",
    a: "Te avisamos antes de llegar al límite. Podés hacer upgrade al plan Pro o adquirir conversaciones adicionales.",
  },
  {
    q: "¿Puedo probar antes de pagar?",
    a: "Sí, todos los planes incluyen 14 días de prueba gratuita. Sin tarjeta de crédito requerida.",
  },
];

export default function Precios() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="py-24 px-6 bg-white text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 text-sm text-blue-700 mb-2">
            <MessageCircle className="w-4 h-4" style={{ color: BRAND_GREEN }} />
            14 días gratis · Sin tarjeta de crédito
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">Planes para toda PyME</h2>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Precio en pesos, sin sorpresas. Empezá gratis y escalá cuando tu negocio crezca.
          </p>
        </div>
      </section>

      {/* What's included */}
      <section className="py-10 px-6 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="text-center">
            <h6 className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: BRAND_GREEN }}>Incluido en todos los planes</h6>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {INCLUDED.map((item) => (
              <div key={item} className="flex items-center gap-3 bg-[#f7f5f4] rounded-xl p-4 border border-gray-100">
                <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: BRAND_GREEN }} />
                <span className="text-gray-700 font-medium text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing cards */}
      <section id="planes" className="py-20 px-6 bg-[#f7f5f4]">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-8 space-y-6 relative ${
                  plan.featured
                    ? "border-[#2467a2] shadow-2xl shadow-blue-100"
                    : "border-gray-200 bg-white"
                }`}
                style={plan.featured ? { background: BRAND_BLUE, color: "#fff" } : {}}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" /> Más popular
                    </span>
                  </div>
                )}
                <div>
                  <h3 className={`text-xl font-bold ${plan.featured ? "text-white" : "text-gray-900"}`}>{plan.name}</h3>
                  <p className={`text-sm mt-1 ${plan.featured ? "text-blue-200" : "text-gray-500"}`}>{plan.desc}</p>
                </div>
                <div>
                  <span className={`text-3xl font-black ${plan.featured ? "text-white" : "text-gray-900"}`}>{plan.price}</span>
                  {plan.period && <span className={`text-sm ml-1 ${plan.featured ? "text-blue-200" : "text-gray-500"}`}>{plan.period}</span>}
                </div>
                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 mt-0.5 ${plan.featured ? "text-white" : ""}`}
                        style={!plan.featured ? { color: BRAND_GREEN } : {}}
                      />
                      <span className={plan.featured ? "text-blue-100" : "text-gray-700"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.name === "Enterprise" ? "/contacto" : "/register"}>
                  <button
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                      plan.featured
                        ? "bg-white text-[#2467a2] hover:bg-blue-50"
                        : "border-2 border-[#2467a2] text-[#2467a2] hover:bg-[#2467a2] hover:text-white"
                    }`}
                  >
                    {plan.name === "Enterprise" ? "Contactar ventas" : "Empezar gratis"}
                  </button>
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mt-8">
            ¿Tenés dudas sobre qué plan elegir?{" "}
            <Link href="/contacto" className="font-semibold" style={{ color: BRAND_BLUE }}>Hablá con nosotros</Link>
          </p>
        </div>
      </section>

      {/* Comparativa */}
      <section className="py-20 px-6 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center">
            <h6 className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: BRAND_BLUE }}>Comparativa</h6>
            <h2 className="text-3xl font-bold text-gray-900">Qué incluye cada plan.</h2>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="bg-[#f7f5f4] text-gray-500">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold">Funcionalidad</th>
                  <th className="text-center px-6 py-3 font-semibold">Starter</th>
                  <th className="text-center px-6 py-3 font-semibold">Pro</th>
                  <th className="text-center px-6 py-3 font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Chatbot WhatsApp", starter: "500 msj/mes", pro: "Ilimitado", ent: "Ilimitado" },
                  { label: "CRM", starter: "Hasta 500 contactos", pro: "Ilimitado", ent: "Ilimitado" },
                  { label: "Asistente IA", starter: false, pro: true, ent: true },
                  { label: "Facturación integrada (AFIP)", starter: false, pro: true, ent: true },
                  { label: "Automatización de flujos", starter: false, pro: true, ent: true },
                  { label: "Multi-sucursal / Multi-línea WhatsApp", starter: false, pro: false, ent: true },
                  { label: "Integraciones a medida (API)", starter: false, pro: false, ent: true },
                  { label: "Soporte", starter: "Email", pro: "Prioritario", ent: "SLA dedicado" },
                ].map((row, i) => (
                  <tr key={row.label} className={i % 2 === 0 ? "bg-white" : "bg-[#fbfaf9]"}>
                    <td className="px-6 py-3 text-gray-700 font-medium border-t border-gray-100">{row.label}</td>
                    {[row.starter, row.pro, row.ent].map((v, ci) => (
                      <td key={ci} className="px-6 py-3 text-center border-t border-gray-100">
                        {typeof v === "boolean" ? (
                          v ? (
                            <CheckCircle2 className="w-4 h-4 mx-auto" style={{ color: BRAND_GREEN }} />
                          ) : (
                            <span className="text-gray-300">—</span>
                          )
                        ) : (
                          <span className="text-gray-500">{v}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Preguntas frecuentes</h2>
            <p className="mt-2 text-gray-500 text-sm">Todo lo que necesitás saber antes de empezar.</p>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-[#f7f5f4] rounded-xl border border-gray-100 overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-gray-900 text-sm">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ml-4 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-gray-600 text-sm leading-relaxed">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center" style={{ background: BRAND_BLUE }}>
        <div className="max-w-2xl mx-auto space-y-6 text-white">
          <h2 className="text-3xl font-bold">Empezá tu prueba gratuita hoy</h2>
          <p className="text-blue-100">14 días sin compromiso. Sin tarjeta de crédito. Operativo en una semana.</p>
          <Link href="/register">
            <button
              className="px-8 py-3.5 rounded-lg font-bold text-sm text-[#2467a2] bg-white hover:bg-blue-50 transition-all"
            >
              Probar gratis
            </button>
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
