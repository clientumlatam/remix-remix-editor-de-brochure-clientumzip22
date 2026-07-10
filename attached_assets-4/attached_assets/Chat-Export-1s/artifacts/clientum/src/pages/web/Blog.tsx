import { SiteLayout } from "@/components/layout/SiteLayout";
import { ArrowRight, Calendar, User, Tag } from "lucide-react";

const POSTS = [
  {
    title: "Cómo elegir el ERP correcto para tu PyME",
    excerpt: "Implementar un ERP es una decisión estratégica. Te explicamos los criterios clave para tomar la mejor decisión para tu empresa.",
    date: "15 de enero, 2026",
    author: "Equipo Clientum",
    category: "ERP",
    readTime: "5 min",
  },
  {
    title: "Marketing digital para empresas B2B en Argentina",
    excerpt: "Las estrategias de marketing digital funcionan diferente en el mercado B2B. Descubrí las tácticas que generan más leads calificados.",
    date: "8 de enero, 2026",
    author: "María L.",
    category: "Marketing",
    readTime: "7 min",
  },
  {
    title: "Integración ERP-CRM: ¿Por qué es fundamental?",
    excerpt: "La sinergia entre ERP y CRM transforma la manera en que tu equipo de ventas y operaciones trabaja. Casos reales de implementación.",
    date: "22 de diciembre, 2025",
    author: "Carlos R.",
    category: "Tecnología",
    readTime: "6 min",
  },
  {
    title: "E-commerce en Argentina: Tendencias 2026",
    excerpt: "El mercado e-commerce argentino sigue creciendo. Analizamos las tendencias que van a definir el año y cómo preparar tu negocio.",
    date: "10 de diciembre, 2025",
    author: "Ana P.",
    category: "E-commerce",
    readTime: "8 min",
  },
  {
    title: "Automatización de procesos: ¿Por dónde empezar?",
    excerpt: "No todos los procesos se automatizan igual. Te mostramos el mapa de prioridades para empezar a ahorrar tiempo y reducir errores.",
    date: "1 de diciembre, 2025",
    author: "Equipo Clientum",
    category: "Tecnología",
    readTime: "5 min",
  },
  {
    title: "Consultoría empresarial: mitos y realidades",
    excerpt: "¿Qué hace realmente un consultor empresarial? ¿Vale la pena contratar uno? Respondemos las preguntas más frecuentes.",
    date: "20 de noviembre, 2025",
    author: "Diego M.",
    category: "Consultoría",
    readTime: "4 min",
  },
  {
    title: "Transformación digital en PyMEs: por dónde empezar",
    excerpt: "Muchas empresas saben que deben digitalizarse pero no saben cómo. Estas son las etapas y los errores a evitar en el proceso.",
    date: "5 de noviembre, 2025",
    author: "Equipo Clientum",
    category: "Transformación Digital",
    readTime: "6 min",
  },
  {
    title: "SEO para PyMEs: cómo aparecer en Google sin pagar publicidad",
    excerpt: "El posicionamiento orgánico es el activo más sostenible de un negocio digital. Estrategias concretas para el mercado argentino.",
    date: "18 de octubre, 2025",
    author: "Laura S.",
    category: "SEO",
    readTime: "8 min",
  },
  {
    title: "Business Intelligence: de los datos a las decisiones",
    excerpt: "Cómo convertir los datos de tu ERP y CRM en dashboards accionables que te permitan tomar mejores decisiones en tiempo real.",
    date: "2 de octubre, 2025",
    author: "Carlos R.",
    category: "BI",
    readTime: "7 min",
  },
  {
    title: "Cómo implementar WooCommerce para tu tienda online",
    excerpt: "WooCommerce es la plataforma de e-commerce más usada del mundo. Te guiamos paso a paso para arrancar tu tienda sin errores.",
    date: "15 de septiembre, 2025",
    author: "Equipo Clientum",
    category: "E-commerce",
    readTime: "9 min",
  },
  {
    title: "Estrategias de negocios para crecer en mercados inciertos",
    excerpt: "La incertidumbre económica en Argentina exige estrategias adaptables. Estas son las claves para sostener el crecimiento.",
    date: "28 de agosto, 2025",
    author: "Martín V.",
    category: "Negocios",
    readTime: "6 min",
  },
  {
    title: "CRM para PyMEs: cómo dejar de perder clientes",
    excerpt: "El 68% de los clientes se van porque sienten que nadie los atiende. Un CRM bien configurado cambia esa estadística para siempre.",
    date: "10 de agosto, 2025",
    author: "Ana P.",
    category: "CRM",
    readTime: "5 min",
  },
  {
    title: "Dolibarr ERP/CRM: la alternativa open source para PyMEs",
    excerpt: "Dolibarr es una solución gratuita y potente de gestión empresarial. Te contamos cuándo conviene implementarla y cuándo no.",
    date: "22 de julio, 2025",
    author: "Carlos R.",
    category: "ERP",
    readTime: "7 min",
  },
  {
    title: "Zapier e Integromat: conectá tus herramientas sin código",
    excerpt: "Las plataformas de automatización low-code permiten conectar más de 3.000 apps sin saber programar. Casos de uso reales.",
    date: "5 de julio, 2025",
    author: "Diego M.",
    category: "Tecnología",
    readTime: "6 min",
  },
  {
    title: "Ciberseguridad para PyMEs: las 5 amenazas más comunes",
    excerpt: "El 43% de los ataques cibernéticos apuntan a pequeñas empresas. Conocé los riesgos más frecuentes y cómo protegerte hoy.",
    date: "18 de junio, 2025",
    author: "Equipo Clientum",
    category: "Tecnología",
    readTime: "5 min",
  },
];

const CATEGORIES = ["Todos", "ERP", "CRM", "Marketing", "Tecnología", "E-commerce", "Consultoría", "Transformación Digital", "SEO", "Negocios", "BI"];
const CATEGORY_COLORS: Record<string, string> = {
  ERP: "#2467a2",
  CRM: "#761c8f",
  Marketing: "#2ecc71",
  Tecnología: "#2467a2",
  "E-commerce": "#761c8f",
  Consultoría: "#f8951d",
  "Transformación Digital": "#0891b2",
  SEO: "#059669",
  BI: "#7c3aed",
  Negocios: "#ea580c",
};

export default function Blog() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="py-24 px-6 bg-white text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">Blog de Clientum</h1>
          <p className="text-gray-600 text-lg">Insights, guías y novedades sobre tecnología, marketing y gestión empresarial para PyMEs.</p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-4 px-6 bg-[#f7f5f4] border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className="px-4 py-2 rounded-full text-xs font-semibold border transition-colors border-gray-200 text-gray-600 hover:border-[#2467a2] hover:text-[#2467a2]"
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Posts grid */}
      <section className="py-20 px-6 bg-[#f7f5f4]">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {POSTS.map((post) => (
              <article key={post.title} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group cursor-pointer">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                  <div className="text-4xl font-black text-[#2467a2]/20">{post.category[0]}</div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span
                      className="px-2.5 py-1 rounded-full font-semibold text-white"
                      style={{ background: CATEGORY_COLORS[post.category] || "#2467a2" }}
                    >
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{post.readTime} de lectura</span>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-[#2467a2] transition-colors">{post.title}</h2>
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.author}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{post.date}</span>
                    </div>
                    <button className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#2467a2" }}>
                      Leer <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 px-6 text-center" style={{ background: "#2467a2" }}>
        <div className="max-w-xl mx-auto space-y-6 text-white">
          <h2 className="text-3xl font-bold">No te pierdas ningún artículo</h2>
          <p className="text-blue-100">Suscribite y recibí el mejor contenido directamente en tu inbox.</p>
          <div className="flex gap-3 max-w-sm mx-auto">
            <input placeholder="tu@empresa.com" className="flex-1 px-4 py-3 rounded-lg bg-white/20 placeholder-blue-200 text-white border border-white/30 text-sm focus:outline-none" />
            <button className="px-4 py-3 rounded-lg font-semibold text-sm bg-white text-[#2467a2] shrink-0 hover:bg-blue-50 transition-all">
              Suscribir
            </button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
