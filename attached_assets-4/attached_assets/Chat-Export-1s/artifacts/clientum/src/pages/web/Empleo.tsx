import { Link } from "wouter";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { MessageCircle, Code2, Settings2, Megaphone } from "lucide-react";

const BRAND_BLUE = "#2467a2";

const POSITIONS = [
  {
    area: "Desarrollo",
    icon: <Code2 className="w-6 h-6" />,
    title: "Desarrollador/a Full Stack",
    desc: "Node/React. Experiencia con CRM, ERP o e-commerce es un plus.",
  },
  {
    area: "Implementación",
    icon: <Settings2 className="w-6 h-6" />,
    title: "Consultor/a funcional CRM",
    desc: "Relevamiento de procesos y configuración de Clientum para PyMEs.",
  },
  {
    area: "Marketing",
    icon: <Megaphone className="w-6 h-6" />,
    title: "Especialista en Marketing Digital",
    desc: "Gestión de campañas y automatización para clientes de distintas industrias.",
  },
];

export default function Empleo() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section
        className="min-h-[320px] flex items-center px-6 py-24 text-center"
        style={{ background: "linear-gradient(135deg, #1a2b4a 0%, #2467a2 100%)" }}
      >
        <div className="max-w-3xl mx-auto space-y-6 text-white">
          <span className="inline-block text-xs font-bold uppercase tracking-wide bg-white/10 px-3 py-1 rounded-full">
            Trabajá con nosotros
          </span>
          <h1 className="text-4xl font-extrabold">
            Buscamos gente que prefiera resolver antes que aparentar.
          </h1>
          <p className="text-blue-100 text-base max-w-2xl mx-auto">
            Equipo remoto-first. Valoramos criterio técnico, comunicación clara con el
            cliente y ganas de aprender el negocio, no solo el código.
          </p>
        </div>
      </section>

      {/* Positions */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: BRAND_BLUE }}>
              Posiciones abiertas
            </span>
            <h2 className="text-3xl font-bold text-gray-900">Sumate al equipo.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {POSITIONS.map((p) => (
              <div key={p.title} className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{ background: BRAND_BLUE }}>
                  {p.icon}
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wide text-gray-400">{p.area}</span>
                  <h3 className="font-bold text-gray-900">{p.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-white text-center">
        <div className="max-w-xl mx-auto space-y-4">
          <h3 className="text-2xl font-bold text-gray-900">¿No ves tu perfil pero creés que encajás?</h3>
          <p className="text-gray-600">Escribinos igual. Siempre estamos abiertos a conocer gente con criterio.</p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link href="/contacto">
              <button className="px-6 py-3 rounded-lg font-semibold text-sm text-white" style={{ background: BRAND_BLUE }}>
                Enviar tu CV →
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
