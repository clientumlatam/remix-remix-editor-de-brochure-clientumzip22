import { Link } from "wouter";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { CheckCircle2, X, Star } from "lucide-react";

const PLANS = [
  {
    name: "Clientum Mini",
    price: "$20",
    period: "Por mes",
    featured: false,
    features: ["Hasta 20 proyectos", "Hasta 20 páginas", "Dominio personalizado", "Diseño profesional"],
  },
  {
    name: "Clientum Small",
    price: "$50",
    period: "Por mes",
    featured: true,
    features: ["Hasta 50 proyectos", "Hasta 50 páginas", "Dominio personalizado", "Diseño profesional"],
  },
  {
    name: "Clientum Large",
    price: "$100",
    period: "Por mes",
    featured: false,
    features: ["Hasta 100 proyectos", "Hasta 100 páginas", "Dominio personalizado", "Diseño profesional"],
  },
];

type FeatureValue = boolean | string;

const COMPARISON_FEATURES: { name: string; mini: FeatureValue; small: FeatureValue; large: FeatureValue }[] = [
  { name: "Proyectos incluidos", mini: "20", small: "50", large: "100" },
  { name: "Páginas por proyecto", mini: "20", small: "50", large: "100" },
  { name: "Dominio personalizado", mini: true, small: true, large: true },
  { name: "Diseño profesional", mini: true, small: true, large: true },
  { name: "Soporte por email", mini: true, small: true, large: true },
  { name: "Soporte prioritario", mini: false, small: true, large: true },
  { name: "Soporte 24/7", mini: false, small: false, large: true },
  { name: "Consultoría mensual", mini: false, small: true, large: true },
  { name: "Consultoría semanal", mini: false, small: false, large: true },
  { name: "API access", mini: false, small: false, large: true },
  { name: "White label", mini: false, small: false, large: true },
  { name: "Capacitación del equipo", mini: false, small: true, large: true },
];

function FeatureCell({ value }: { value: FeatureValue }) {
  if (typeof value === "boolean") {
    return value
      ? <CheckCircle2 className="w-5 h-5 mx-auto" style={{ color: "#2ecc71" }} />
      : <X className="w-5 h-5 mx-auto text-gray-300" />;
  }
  return <span className="text-sm font-semibold text-gray-700">{value}</span>;
}

export default function Comparativa() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="py-24 px-6 bg-white text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <h6 className="text-sm font-semibold uppercase tracking-widest" style={{ color: "#2ecc71" }}>Comparativa</h6>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">Comparativa de Servicios</h2>
          <p className="text-gray-600 text-lg max-w-xl mx-auto">
            En Clientum, nos esforzamos por brindar soluciones de alta calidad y un servicio excepcional. Aquí te mostramos cómo nos destacamos.
          </p>
        </div>
      </section>

      {/* Plan cards */}
      <section className="py-16 px-6 bg-[#f7f5f4]">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-8 space-y-4 relative ${
                  plan.featured ? "border-[#2467a2] shadow-xl" : "border-gray-200 bg-white"
                }`}
                style={plan.featured ? { background: "#2467a2" } : {}}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" /> Más popular
                    </span>
                  </div>
                )}
                <h3 className={`text-xl font-bold ${plan.featured ? "text-white" : "text-gray-900"}`}>{plan.name}</h3>
                <div>
                  <span className={`text-3xl font-black ${plan.featured ? "text-white" : "text-gray-900"}`}>{plan.price}</span>
                  <span className={`text-sm ml-1 ${plan.featured ? "text-blue-200" : "text-gray-500"}`}>{plan.period}</span>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className={`text-sm flex items-center gap-2 ${plan.featured ? "text-blue-100" : "text-gray-600"}`}>
                      <CheckCircle2 className="w-4 h-4 shrink-0" style={plan.featured ? { color: "#fff" } : { color: "#2ecc71" }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/contacto">
                  <button
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                      plan.featured ? "bg-white text-[#2467a2]" : "border-2 border-[#2467a2] text-[#2467a2] hover:bg-[#2467a2] hover:text-white"
                    }`}
                  >
                    Seleccionar plan
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Comparativa detallada</h2>
            <p className="mt-2 text-gray-600 text-sm">Todas las características por plan</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 text-gray-600 font-semibold">Característica</th>
                  {PLANS.map((p) => (
                    <th key={p.name} className={`py-4 px-4 text-center font-bold ${p.featured ? "text-[#2467a2]" : "text-gray-900"}`}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map((feature, i) => (
                  <tr key={feature.name} className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-gray-50/50" : ""}`}>
                    <td className="py-3 px-4 text-gray-700">{feature.name}</td>
                    <td className="py-3 px-4 text-center"><FeatureCell value={feature.mini} /></td>
                    <td className="py-3 px-4 text-center"><FeatureCell value={feature.small} /></td>
                    <td className="py-3 px-4 text-center"><FeatureCell value={feature.large} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Why Clientum vs competition */}
      <section className="py-20 px-6 bg-[#f7f5f4]">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">¿Por qué Clientum sobre la competencia?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Precios transparentes", desc: "Sin costos ocultos. El precio que ves es el que pagás, sin sorpresas." },
              { title: "Soporte en español", desc: "Todo nuestro equipo de soporte habla tu idioma y entiende tu realidad." },
              { title: "Personalización real", desc: "No vendemos templates. Cada solución es diseñada para tu empresa." },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-6 border border-gray-100 space-y-2">
                <CheckCircle2 className="w-6 h-6" style={{ color: "#2ecc71" }} />
                <h4 className="font-bold text-gray-900">{item.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center" style={{ background: "#2467a2" }}>
        <div className="max-w-2xl mx-auto space-y-6 text-white">
          <h2 className="text-3xl font-bold">¿Listo para empezar?</h2>
          <p className="text-blue-100">Elegí el plan que más te convenga y comenzá hoy.</p>
          <Link href="/precios">
            <button className="px-8 py-3.5 rounded-lg font-semibold text-sm bg-white text-[#2467a2] hover:bg-blue-50 transition-all">
              Ver todos los planes
            </button>
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
