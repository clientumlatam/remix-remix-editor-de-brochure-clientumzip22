import { Link } from "wouter";
import { SiteLayout } from "@/components/layout/SiteLayout";

const BRAND_BLUE = "#2467a2";

const NUCLEO = [
  { title: "Gestión comercial", desc: "Facturación electrónica AFIP, stock, precios y listas por canal." },
  { title: "CRM integrado", desc: "Seguimiento de leads, oportunidades y atención por WhatsApp/email desde un mismo panel." },
  { title: "Reportes y BI", desc: "Dashboards en tiempo real por sucursal, vendedor o categoría de producto." },
];

const EXTENSION = [
  { title: "E-commerce", desc: "Sincronización de stock y precios con la tienda online sin doble carga." },
  { title: "Multi-sucursal", desc: "Stock, caja y reportes independientes por local, consolidados a nivel empresa." },
  { title: "API abierta", desc: "Integración con pasarelas de pago, MercadoLibre y sistemas propios vía REST API." },
];

const REQUISITOS = [
  { comp: "Conexión a internet", rec: "10 Mbps simétricos o superior" },
  { comp: "Dispositivos", rec: "PC/tablet/celular con navegador actualizado" },
  { comp: "Base de datos", rec: "PostgreSQL gestionado por Clientum (cloud)" },
  { comp: "Backups", rec: "Automáticos, diarios, con retención de 30 días" },
];

function Card({ tag, title, desc }: { tag: string; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 space-y-3 border border-gray-100 hover:shadow-md transition-shadow">
      <span className="text-xs font-bold uppercase tracking-wide" style={{ color: BRAND_BLUE }}>{tag}</span>
      <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

export default function Especificaciones() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section
        className="min-h-[320px] flex items-center px-6 py-24 text-center"
        style={{ background: "linear-gradient(135deg, #1a2b4a 0%, #2467a2 100%)" }}
      >
        <div className="max-w-3xl mx-auto space-y-6 text-white">
          <span className="inline-block text-xs font-bold uppercase tracking-wide bg-white/10 px-3 py-1 rounded-full">
            Especificaciones del producto
          </span>
          <h1 className="text-4xl font-extrabold">Qué incluye técnicamente Clientum.</h1>
          <p className="text-blue-100 text-base max-w-2xl mx-auto">
            Arquitectura modular pensada para crecer sin migrar de sistema cada vez que
            tu negocio cambia de escala.
          </p>
        </div>
      </section>

      {/* Núcleo + Extensión */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {NUCLEO.map((n) => (
            <Card key={n.title} tag="Núcleo" title={n.title} desc={n.desc} />
          ))}
          {EXTENSION.map((e) => (
            <Card key={e.title} tag="Extensión" title={e.title} desc={e.desc} />
          ))}
        </div>
      </section>

      {/* Requisitos */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: BRAND_BLUE }}>Requisitos</span>
            <h2 className="text-3xl font-bold text-gray-900">Infraestructura mínima recomendada.</h2>
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-[#f7f5f4] text-gray-500">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold">Componente</th>
                  <th className="text-left px-6 py-3 font-semibold">Recomendado</th>
                </tr>
              </thead>
              <tbody>
                {REQUISITOS.map((r, i) => (
                  <tr key={r.comp} className={i % 2 === 0 ? "bg-white" : "bg-[#fbfaf9]"}>
                    <td className="px-6 py-3 text-gray-700 font-medium border-t border-gray-100">{r.comp}</td>
                    <td className="px-6 py-3 text-gray-500 border-t border-gray-100">{r.rec}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-[#f7f5f4] text-center">
        <div className="max-w-xl mx-auto space-y-4">
          <h3 className="text-2xl font-bold text-gray-900">¿Tenés dudas técnicas puntuales?</h3>
          <p className="text-gray-600">Nuestro equipo te responde con el detalle que necesites.</p>
          <Link href="/contacto">
            <button className="px-6 py-3 rounded-lg font-semibold text-sm text-white" style={{ background: BRAND_BLUE }}>
              Consultar al equipo técnico →
            </button>
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
