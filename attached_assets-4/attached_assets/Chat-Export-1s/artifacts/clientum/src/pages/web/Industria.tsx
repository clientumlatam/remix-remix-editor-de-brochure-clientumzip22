import { Link } from "wouter";
import { SiteLayout } from "@/components/layout/SiteLayout";

const BRAND_BLUE = "#2467a2";

const INDUSTRIES = [
  { idx: "Retail", title: "Comercio minorista", desc: "Punto de venta, stock multisucursal, facturación AFIP y fidelización de clientes por WhatsApp." },
  { idx: "Manufactura", title: "Industria y producción", desc: "Seguimiento de pedidos, control de insumos y reportes de costos en tiempo real." },
  { idx: "Agroindustria", title: "Campo y agroindustria", desc: "Gestión de acopio, logística, comercialización y relación con productores." },
  { idx: "Distribución", title: "Distribuidores y mayoristas", desc: "Rutas de venta, listas de precio diferenciadas por canal y seguimiento de cobranza." },
  { idx: "Servicios", title: "Empresas de servicios", desc: "Gestión de proyectos, seguimiento de clientes y automatización de cotizaciones." },
  { idx: "PyMEs", title: "Pequeñas y medianas empresas", desc: "Planes acotados para empezar a ordenar la gestión comercial sin sobre-invertir." },
];

export default function Industria() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section
        className="min-h-[320px] flex items-center px-6 py-24 text-center"
        style={{ background: "linear-gradient(135deg, #1a2b4a 0%, #2467a2 100%)" }}
      >
        <div className="max-w-3xl mx-auto space-y-6 text-white">
          <span className="inline-block text-xs font-bold uppercase tracking-wide bg-white/10 px-3 py-1 rounded-full">
            Soluciones por industria
          </span>
          <h1 className="text-4xl font-extrabold">
            Cada rubro tiene su propia lógica. La respetamos.
          </h1>
          <p className="text-blue-100 text-base max-w-2xl mx-auto">
            No adaptamos tu negocio a un software genérico: configuramos Clientum según
            cómo realmente opera tu industria.
          </p>
        </div>
      </section>

      {/* Industries grid */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {INDUSTRIES.map((ind) => (
            <div key={ind.title} className="bg-[#f7f5f4] rounded-2xl p-6 space-y-3 border border-gray-100 hover:shadow-md transition-shadow">
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: BRAND_BLUE }}>{ind.idx}</span>
              <h3 className="font-bold text-gray-900 text-lg">{ind.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{ind.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-[#f7f5f4] text-center">
        <div className="max-w-xl mx-auto space-y-4">
          <h3 className="text-2xl font-bold text-gray-900">¿No encontrás tu rubro?</h3>
          <p className="text-gray-600">Contanos cómo funciona tu negocio y te mostramos cómo lo configuraríamos en Clientum.</p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link href="/contacto">
              <button className="px-6 py-3 rounded-lg font-semibold text-sm text-white" style={{ background: BRAND_BLUE }}>
                Hablar con un especialista →
              </button>
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
