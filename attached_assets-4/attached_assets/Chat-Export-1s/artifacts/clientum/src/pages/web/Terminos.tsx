import { SiteLayout } from "@/components/layout/SiteLayout";

const SECTIONS = [
  {
    title: "Datos personales",
    content: "Recolectamos únicamente los datos necesarios para responder consultas y prestar el servicio contratado (nombre, email, teléfono y empresa). No vendemos ni compartimos esta información con terceros salvo requerimiento legal.",
  },
  {
    title: "Uso de cookies",
    content: "Utilizamos cookies técnicas para el funcionamiento del sitio y, opcionalmente, analítica para entender el uso agregado de las páginas.",
  },
  {
    title: "Condiciones de servicio",
    content: "Los alcances, tiempos y precios de cada proyecto se definen por escrito en una propuesta formal antes de iniciar cualquier trabajo. El soporte incluido varía según el plan contratado.",
  },
  {
    title: "Cancelación",
    content: "Los planes son mes a mes y podés cancelar en cualquier momento sin penalización. Si cancelás antes del fin del período, no se renueva el ciclo siguiente.",
  },
  {
    title: "Propiedad de los datos",
    content: "Los datos que cargás en Clientum (contactos, oportunidades, facturas) son de tu propiedad. Podés exportarlos en cualquier momento durante la vigencia del servicio.",
  },
];

export default function Terminos() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="py-24 px-6 bg-[#f7f5f4] text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <h1 className="text-4xl font-extrabold text-gray-900">Términos y Condiciones</h1>
          <p className="text-gray-600">Última actualización: julio de 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 leading-relaxed text-base">
              Estos términos regulan el uso de la plataforma Clientum y los servicios contratados
              a través de ella. Al usar el servicio, aceptás las condiciones descritas a continuación.
            </p>
          </div>

          {SECTIONS.map((section) => (
            <div key={section.title} className="space-y-3">
              <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">{section.title}</h2>
              <p className="text-gray-600 leading-relaxed text-sm">{section.content}</p>
            </div>
          ))}

          <div className="bg-[#f7f5f4] rounded-xl p-6 space-y-2">
            <h3 className="font-bold text-gray-900">Contacto para cuestiones legales</h3>
            <p className="text-gray-600 text-sm">Si tenés preguntas sobre estos términos, podés contactarnos en:</p>
            <a href="mailto:legal@clientum.net.ar" className="text-sm font-semibold" style={{ color: "#2467a2" }}>
              legal@clientum.net.ar
            </a>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
