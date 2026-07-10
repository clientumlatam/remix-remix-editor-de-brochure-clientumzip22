import { Link } from "wouter";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ArrowRight, CheckCircle2, Star } from "lucide-react";

const TESTIMONIALS = [
  { name: "Roberto A.", company: "Manufactura San Juan S.A.", text: "Clientum transformó completamente nuestra operación. La implementación fue rápida y el soporte siempre estuvo disponible." },
  { name: "Gabriela M.", company: "Agro Cuyo", text: "La consultoría de Clientum nos ayudó a identificar ineficiencias que no habíamos visto en años. Resultados concretos desde el primer mes." },
  { name: "Federico L.", company: "Distribuidora Patagónica", text: "El equipo de Clientum entiende la realidad de las empresas argentinas. Son mucho más que un proveedor, son un socio estratégico." },
  { name: "Carolina V.", company: "Retail Mendoza", text: "Implementamos el ERP y CRM en tiempo récord. La capacitación fue excelente y el sistema superó nuestras expectativas." },
];

const MILESTONES = [
  { year: "2012", title: "Fundación", desc: "Nacemos en General Roca con el objetivo de acercar tecnología de punta a las PyMEs argentinas." },
  { year: "2015", title: "Expansión regional", desc: "Abrimos operaciones en Buenos Aires y comenzamos a atender clientes en toda Latinoamérica." },
  { year: "2018", title: "Clientum Academia", desc: "Lanzamos nuestra plataforma educativa con cursos especializados para empresarios y equipos." },
  { year: "2021", title: "1000 clientes", desc: "Superamos el hito de 1.000 clientes satisfechos en diferentes industrias." },
  { year: "2024", title: "Clientum CRM", desc: "Lanzamos Clientum, nuestro CRM nativo para PyMEs argentinas con facturación AFIP integrada." },
];

export default function SobreNosotros() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Testimonios de nuestros clientes
            </h1>
            <h2 className="text-2xl font-light text-gray-600">La experiencia de trabajar con Clientum</h2>
          </div>
          <div className="space-y-4">
            <p className="text-gray-600 leading-relaxed">Descubrí cómo nuestros servicios han impactado positivamente en las empresas de nuestros clientes.</p>
            <Link href="/contacto">
              <button className="flex items-center gap-1.5 font-semibold text-sm" style={{ color: "#2467a2" }}>
                Contáctanos <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* What we do */}
      <section className="py-16 px-6 bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-green-400/20 text-green-400 rounded-full px-4 py-2 text-sm font-semibold">
              <Star className="w-4 h-4" /> Clientes Satisfechos con Clientum
            </div>
            <ul className="space-y-2">
              {[
                "Historias de éxito reales",
                "Empresas de diversas industrias",
                "Transformación digital efectiva",
                "Mejora en la satisfacción del cliente",
                "Soluciones personalizadas",
                "Compromiso con la calidad",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { num: "1750+", label: "Clientes satisfechos" },
              { num: "12+", label: "Años de experiencia" },
              { num: "145+", label: "Proyectos completados" },
              { num: "6", label: "Industrias atendidas" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-xl p-5 text-center">
                <div className="text-3xl font-black text-white">{s.num}</div>
                <p className="text-gray-400 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-[#f7f5f4]">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Lo que dicen nuestros clientes</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed italic">"{t.text}"</p>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Nuestra historia</h2>
            <p className="mt-3 text-gray-600">Más de una década transformando empresas</p>
          </div>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200" />
            <div className="space-y-8">
              {MILESTONES.map((m) => (
                <div key={m.year} className="flex gap-6">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 z-10" style={{ background: "#2467a2" }}>
                    {m.year.slice(2)}
                  </div>
                  <div className="pt-2 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-400">{m.year}</span>
                      <h4 className="font-bold text-gray-900">{m.title}</h4>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center" style={{ background: "#2467a2" }}>
        <div className="max-w-2xl mx-auto space-y-6 text-white">
          <h2 className="text-3xl font-bold">¿Querés ser parte de nuestra historia?</h2>
          <p className="text-blue-100">Contactanos y empecemos a construir tu caso de éxito.</p>
          <Link href="/contacto">
            <button className="px-8 py-3.5 rounded-lg font-semibold text-sm bg-white text-[#2467a2] hover:bg-blue-50 transition-all">
              Hablar con un experto
            </button>
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
