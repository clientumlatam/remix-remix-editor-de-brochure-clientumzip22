import { Link } from "wouter";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ArrowRight, Star, Users, TrendingUp, Globe } from "lucide-react";

const BENEFITS = [
  { icon: <TrendingUp className="w-5 h-5" />, title: "Ingresos recurrentes", desc: "Comisiones por cada cliente que referís o gestionás con nosotros." },
  { icon: <Star className="w-5 h-5" />, title: "Materiales de venta", desc: "Acceso a demos, presentaciones y casos de éxito para ayudarte a cerrar negocios." },
  { icon: <Users className="w-5 h-5" />, title: "Soporte dedicado", desc: "Un equipo especializado que te ayuda en cada etapa del ciclo de venta." },
  { icon: <Globe className="w-5 h-5" />, title: "Visibilidad de marca", desc: "Tu empresa aparece en nuestro directorio de socios certificados." },
];

const PARTNER_TYPES = [
  {
    name: "Socio Referidor",
    desc: "Recomendás clientes y recibís una comisión por cada contrato firmado. Sin compromiso mínimo.",
    features: ["Comisión del 10%", "Sin cuota mensual", "Portal de seguimiento", "Material de ventas"],
  },
  {
    name: "Socio Implementador",
    featured: true,
    desc: "Vendés, implementás y soportás soluciones Clientum bajo tu marca con nuestro respaldo técnico.",
    features: ["Comisión del 20%", "Capacitación técnica incluida", "Acceso a sandbox de desarrollo", "SLA garantizado", "Co-branding permitido"],
  },
  {
    name: "Socio Estratégico",
    desc: "Para empresas consultoras que quieren integrar Clientum como parte de su oferta principal.",
    features: ["Comisión del 30%", "Account manager dedicado", "Acceso API completo", "Roadmap conjunto", "Eventos exclusivos"],
  },
];

export default function ProgramaSocios() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section
        className="relative min-h-[550px] flex items-center px-6 py-24"
        style={{ background: "linear-gradient(135deg, #1a2b4a 0%, #2467a2 100%)" }}
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="max-w-lg text-white space-y-6">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Asóciate con Clientum<br />y llevá tu negocio al siguiente nivel.
            </h1>
            <p className="text-blue-100 text-lg">En Clientum, creemos en la colaboración para generar valor y crecer juntos.</p>
            <div className="flex gap-4 flex-wrap">
              <button className="px-6 py-3 rounded-lg font-semibold text-sm text-white" style={{ background: "#761c8f" }}>
                Nuestros Socios
              </button>
              <Link href="/contacto">
                <button className="flex items-center gap-1.5 text-white font-semibold text-sm hover:opacity-80 transition-opacity">
                  Contáctanos <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Partnerships overview */}
      <section className="py-20 px-6 bg-[#f4f2f2]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Partnerships</h2>
            </div>
            {[
              { title: "Socios Estratégicos", desc: "Colaboramos con empresas que comparten nuestra visión y valores." },
              { title: "Beneficios de las Alianzas", desc: "Las alianzas estratégicas ofrecen ventajas competitivas y acceso a nuevos mercados." },
              { title: "Cómo Convertirse en Socio", desc: "Te invitamos a conocer el proceso y requisitos para formar parte de nuestra red de socios." },
            ].map((p) => (
              <div key={p.title} className="space-y-2">
                <h5 className="font-bold text-gray-900">{p.title}</h5>
                <p className="text-gray-600 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner types */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Tipos de asociación</h2>
            <p className="mt-3 text-gray-600">Encontrá el nivel de partnership que mejor se adapta a tu negocio.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {PARTNER_TYPES.map((type) => (
              <div
                key={type.name}
                className={`rounded-2xl border p-8 space-y-6 relative ${
                  type.featured ? "border-[#2467a2] shadow-xl" : "border-gray-100 bg-[#f7f5f4]"
                }`}
                style={type.featured ? { background: "#2467a2" } : {}}
              >
                {type.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" /> Más popular
                    </span>
                  </div>
                )}
                <h3 className={`text-xl font-bold ${type.featured ? "text-white" : "text-gray-900"}`}>{type.name}</h3>
                <p className={`text-sm leading-relaxed ${type.featured ? "text-blue-100" : "text-gray-600"}`}>{type.desc}</p>
                <ul className="space-y-2">
                  {type.features.map((f) => (
                    <li key={f} className={`flex items-center gap-2 text-sm ${type.featured ? "text-white" : "text-gray-700"}`}>
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: type.featured ? "#fff" : "#2467a2" }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/contacto">
                  <button
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                      type.featured ? "bg-white text-[#2467a2]" : "border-2 border-[#2467a2] text-[#2467a2] hover:bg-[#2467a2] hover:text-white"
                    }`}
                  >
                    Comenzar ahora
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6 bg-[#f4f2f2]">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Beneficios de ser socio</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map((b) => (
              <div key={b.title} className="bg-white rounded-xl p-6 border border-gray-100 space-y-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ background: "#2467a2" }}>
                  {b.icon}
                </div>
                <h4 className="font-bold text-gray-900">{b.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center bg-white">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">¡Hablemos de asociación!</h2>
          <p className="text-gray-600">Estamos aquí para explorar oportunidades de colaboración que beneficien a ambas partes.</p>
          <Link href="/contacto">
            <button className="px-8 py-3.5 rounded-lg font-semibold text-sm text-white inline-flex items-center gap-2" style={{ background: "#761c8f" }}>
              Contactanos <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
