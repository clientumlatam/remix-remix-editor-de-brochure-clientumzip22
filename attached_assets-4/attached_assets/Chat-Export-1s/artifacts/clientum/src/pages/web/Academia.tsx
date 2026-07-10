import { Link } from "wouter";
import { useMemo, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ArrowRight, BookOpen, Play, Star, Users, CheckCircle2, MessageCircle, Bot, BarChart3, Zap, FileText, Settings, ShieldCheck, Globe, Smartphone, DollarSign, Clock, Award, TrendingUp, Briefcase, Search } from "lucide-react";

const BRAND_BLUE = "#2467a2";

const COURSES = [
  { title: "Primeros pasos con Clientum", cat: "Inicio rápido", level: "Básico", duration: "45 min", students: 1248, rating: 4.9, icon: <BookOpen className="w-8 h-8" /> },
  { title: "Configurá tu Chatbot de WhatsApp", cat: "WhatsApp", level: "Básico", duration: "1.5 horas", students: 986, rating: 4.9, icon: <MessageCircle className="w-8 h-8" /> },
  { title: "CRM: Contactos, Leads y Pipeline", cat: "CRM", level: "Intermedio", duration: "2 horas", students: 742, rating: 4.8, icon: <Users className="w-8 h-8" /> },
  { title: "Automatizaciones avanzadas", cat: "Automatización", level: "Avanzado", duration: "3 horas", students: 413, rating: 4.8, icon: <Zap className="w-8 h-8" /> },
  { title: "Facturación AFIP desde el CRM", cat: "Facturación", level: "Intermedio", duration: "1 hora", students: 651, rating: 4.7, icon: <FileText className="w-8 h-8" /> },
  { title: "Reportes y análisis con el Asistente IA", cat: "IA", level: "Intermedio", duration: "1.5 horas", students: 329, rating: 4.9, icon: <Bot className="w-8 h-8" /> },
  { title: "Portal del Cliente: configuración y uso", cat: "Portal", level: "Básico", duration: "50 min", students: 518, rating: 4.8, icon: <BarChart3 className="w-8 h-8" /> },
  { title: "Administración de tu cuenta y equipo", cat: "Configuración", level: "Básico", duration: "40 min", students: 389, rating: 4.7, icon: <Settings className="w-8 h-8" /> },
  { title: "Crea tu Tienda Online ¡YA! con WooCommerce", cat: "E-commerce", level: "Básico", duration: "3 horas", students: 1122, rating: 4.8, icon: <Globe className="w-8 h-8" /> },
  { title: "Automatiza tu Negocio y Multiplica tu Tiempo Libre", cat: "Automatización", level: "Intermedio", duration: "2.5 horas", students: 874, rating: 4.9, icon: <Zap className="w-8 h-8" /> },
  { title: "Dolibarr ERP/CRM: Gestioná tu empresa como un CEO", cat: "ERP", level: "Intermedio", duration: "4 horas", students: 563, rating: 4.7, icon: <Briefcase className="w-8 h-8" /> },
  { title: "Zapier e Integromat: Conectá tus apps favoritas", cat: "Automatización", level: "Intermedio", duration: "2 horas", students: 698, rating: 4.8, icon: <Zap className="w-8 h-8" /> },
  { title: "SEO Avanzado: Posicioná tu web en el TOP de Google", cat: "Marketing Digital", level: "Avanzado", duration: "5 horas", students: 941, rating: 4.8, icon: <TrendingUp className="w-8 h-8" /> },
  { title: "Ciberseguridad para PyMEs: Protegé tu negocio", cat: "Seguridad", level: "Básico", duration: "2 horas", students: 487, rating: 4.7, icon: <ShieldCheck className="w-8 h-8" /> },
  { title: "Ventas Ninja: Vendé como un profesional", cat: "Ventas", level: "Intermedio", duration: "3 horas", students: 776, rating: 4.9, icon: <Award className="w-8 h-8" /> },
  { title: "Gestión del Tiempo y Productividad", cat: "Productividad", level: "Básico", duration: "1.5 horas", students: 832, rating: 4.8, icon: <Clock className="w-8 h-8" /> },
  { title: "Liderazgo Inspirador: Guiá equipos al éxito", cat: "Liderazgo", level: "Avanzado", duration: "3.5 horas", students: 344, rating: 4.8, icon: <Users className="w-8 h-8" /> },
  { title: "Finanzas para Emprendedores", cat: "Finanzas", level: "Básico", duration: "2 horas", students: 619, rating: 4.7, icon: <DollarSign className="w-8 h-8" /> },
  { title: "Apps Móviles Rentables: Creá apps que generan ingresos", cat: "Desarrollo", level: "Avanzado", duration: "6 horas", students: 258, rating: 4.7, icon: <Smartphone className="w-8 h-8" /> },
  { title: "Gestión de Proyectos Innovadores", cat: "Gestión", level: "Intermedio", duration: "2.5 horas", students: 391, rating: 4.8, icon: <Briefcase className="w-8 h-8" /> },
  { title: "Métricas de Marketing Digital: Dominá tus datos", cat: "Marketing Digital", level: "Avanzado", duration: "4 horas", students: 507, rating: 4.9, icon: <BarChart3 className="w-8 h-8" /> },
];

const BENEFITS = [
  "Cursos creados por el equipo de Clientum con casos reales",
  "Acceso de por vida una vez activada tu cuenta",
  "Videos cortos y concretos — sin relleno",
  "Material descargable y checklists incluidos",
  "Actualizaciones automáticas con cada nueva versión",
  "Soporte de la comunidad de usuarios de Clientum",
];

const TESTIMONIALS = [
  {
    name: "Mónica S.",
    company: "Clínica Estética Lumière",
    text: "En un fin de semana aprendí a configurar el chatbot. Ahora agenda turnos solo. Los videos son claros y cortitos.",
    rating: 5,
  },
  {
    name: "Rodrigo P.",
    company: "Distribuidora Patagónica",
    text: "El curso de facturación AFIP me ahorró horas de prueba y error. Seguí los pasos y funcionó a la primera.",
    rating: 5,
  },
  {
    name: "Valeria G.",
    company: "Servicios Contables VG",
    text: "Le mandé el link de la academia a mis clientes y ya no me consultan lo básico. Se capacitan solos.",
    rating: 5,
  },
];

const CAT_COLORS: Record<string, string> = {
  "Inicio rápido": "#2467a2",
  WhatsApp: "#25d366",
  CRM: "#2467a2",
  Automatización: "#ca8a04",
  Facturación: "#ea580c",
  IA: "#7c3aed",
  Portal: "#0891b2",
  Configuración: "#64748b",
  "E-commerce": "#059669",
  ERP: "#1d4ed8",
  "Marketing Digital": "#db2777",
  Seguridad: "#dc2626",
  Ventas: "#f59e0b",
  Productividad: "#0891b2",
  Liderazgo: "#7c3aed",
  Finanzas: "#16a34a",
  Desarrollo: "#4f46e5",
  Gestión: "#0f766e",
};

export default function Academia() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COURSES;
    return COURSES.filter((c) => c.title.toLowerCase().includes(q) || c.cat.toLowerCase().includes(q));
  }, [query]);

  return (
    <SiteLayout>
      {/* Hero */}
      <section
        className="relative min-h-[480px] flex items-center px-6 py-24"
        style={{ background: "linear-gradient(135deg, #1a1a3e 0%, #294ca7 60%, #2467a2 100%)" }}
      >
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-widest font-semibold text-blue-300">Clientum Academia</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
              Aprendé a sacarle el máximo a tu CRM
            </h1>
            <p className="text-gray-300 leading-relaxed text-lg">
              Cursos cortos, en español rioplatense, con casos reales de PyMEs argentinas. Sin tecnicismos innecesarios.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="px-6 py-3 rounded-lg font-bold text-sm text-white flex items-center gap-2 transition-opacity hover:opacity-90" style={{ background: "#25d366" }}>
                <Play className="w-4 h-4" /> Empezar gratis
              </button>
              <Link href="/contacto">
                <button className="px-6 py-3 rounded-lg font-semibold text-sm text-white border-2 border-white/30 hover:bg-white/10 transition-all flex items-center gap-2">
                  Ver temario completo <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:pl-6">
            {[
              { num: "20+", label: "Cursos disponibles" },
              { num: "4.8★", label: "Rating promedio" },
              { num: "5.000+", label: "Usuarios activos" },
              { num: "Gratis", label: "Con tu plan Pro" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 border border-white/10 rounded-xl p-5 text-center">
                <div className="text-2xl font-black text-white">{s.num}</div>
                <p className="text-blue-200 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses grid */}
      <section className="py-20 px-6 bg-[#f7f5f4]">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center">
            <h6 className="text-sm uppercase tracking-widest font-semibold text-gray-400 mb-2">Catálogo</h6>
            <h2 className="text-3xl font-bold text-gray-900">Todos los cursos</h2>
            <p className="text-gray-500 text-sm mt-2 max-w-xl mx-auto">
              Organizados de principiante a avanzado. Cada uno incluye video + material descargable.
            </p>
          </div>
          <div className="max-w-md mx-auto relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar curso (ej: marketing, WhatsApp, ventas)…"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
            />
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 text-sm">No encontramos cursos para "{query}". Probá con otra palabra.</p>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filtered.map((course) => (
              <div key={course.title} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all flex flex-col">
                <div className="aspect-video flex items-center justify-center text-white" style={{ background: CAT_COLORS[course.cat] ?? BRAND_BLUE }}>
                  {course.icon}
                </div>
                <div className="p-5 space-y-3 flex-1 flex flex-col">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-semibold px-2 py-1 rounded-full"
                      style={{ background: (CAT_COLORS[course.cat] ?? BRAND_BLUE) + "18", color: CAT_COLORS[course.cat] ?? BRAND_BLUE }}
                    >
                      {course.cat}
                    </span>
                    <span className="text-xs text-gray-400">{course.level}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm leading-snug flex-1">{course.title}</h3>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> {course.students.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {course.rating}
                    </div>
                    <span>{course.duration}</span>
                  </div>
                  <button className="w-full py-2.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90 mt-auto" style={{ background: BRAND_BLUE }}>
                    Ver curso
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-5">
            <h6 className="text-xs uppercase tracking-widest font-semibold text-gray-400">¿Por qué Clientum Academia?</h6>
            <h2 className="text-3xl font-bold text-gray-900">Aprendé sin perder el tiempo</h2>
            <p className="text-gray-600 leading-relaxed">
              Cada curso está diseñado para que en menos de 2 horas ya puedas aplicarlo en tu negocio. Sin teoría innecesaria, con ejemplos reales de PyMEs argentinas.
            </p>
            <div className="space-y-3">
              {BENEFITS.map((b) => (
                <div key={b} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#25d366" }} />
                  <span className="text-gray-700 text-sm">{b}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-5">
            <h3 className="text-xl font-bold text-gray-900">Lo que dicen nuestros usuarios</h3>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-[#f7f5f4] rounded-xl p-5 space-y-3">
                <div className="flex gap-0.5">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center" style={{ background: BRAND_BLUE }}>
        <div className="max-w-2xl mx-auto space-y-6 text-white">
          <h2 className="text-3xl font-bold">La academia está incluida en tu plan</h2>
          <p className="text-blue-100">Con cualquier plan de Clientum accedés a todos los cursos sin costo adicional.</p>
          <Link href="/register">
            <button className="px-8 py-3.5 rounded-lg font-bold text-sm bg-white flex items-center gap-2 mx-auto" style={{ color: BRAND_BLUE }}>
              <Play className="w-4 h-4" /> Empezar gratis
            </button>
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
