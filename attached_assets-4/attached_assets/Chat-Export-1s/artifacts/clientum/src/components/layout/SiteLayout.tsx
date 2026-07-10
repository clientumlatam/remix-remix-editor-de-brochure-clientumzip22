import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronDown, Menu, X, ArrowRight, MessageCircle, Bot, BarChart3, Users, Zap, Globe, Briefcase, Settings2, Megaphone, Code2, Wrench, BookOpen, HelpCircle, GraduationCap, Star, GitCompare, Handshake, Info, Mail, DollarSign, Factory, FileCode2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const BRAND_BLUE = "#2467a2";
const BRAND_GREEN = "#25d366";

const FEATURES = [
  { label: "Chatbot WhatsApp 24/7", desc: "Atención automática sin personal", href: "/funciones/whatsapp", icon: <MessageCircle className="w-4 h-4" />, bg: "#dcfce7" },
  { label: "CRM Inteligente", desc: "Pipeline visual de ventas", href: "/funciones/crm", icon: <Users className="w-4 h-4" />, bg: "#dbeafe" },
  { label: "Asistente IA", desc: "Análisis e insights en tiempo real", href: "/funciones/ia", icon: <Bot className="w-4 h-4" />, bg: "#ede9fe" },
  { label: "Reportes Automáticos", desc: "KPIs y dashboards siempre actualizados", href: "/funciones/reportes", icon: <BarChart3 className="w-4 h-4" />, bg: "#fff7ed" },
  { label: "Automatización", desc: "Flujos sin intervención humana", href: "/funciones/automatizacion", icon: <Zap className="w-4 h-4" />, bg: "#fef9c3" },
  { label: "Portal del Cliente", desc: "Self-service con tu marca", href: "/funciones/portal", icon: <Globe className="w-4 h-4" />, bg: "#cffafe" },
];

const SERVICES = [
  { label: "ERP Personalizado", desc: "Gestión a medida de tu industria", href: "/servicios/erp", icon: <Settings2 className="w-4 h-4" />, bg: "#fff7ed" },
  { label: "Desarrollo Web", desc: "Sitios, apps y e-commerce con CRM", href: "/servicios/desarrollo-web", icon: <Code2 className="w-4 h-4" />, bg: "#cffafe" },
  { label: "Integración de Tecnología", desc: "Conectá todos tus sistemas sin código", href: "/servicios/integracion", icon: <Globe className="w-4 h-4" />, bg: "#dbeafe" },
  { label: "Marketing Digital", desc: "Campañas y automatización de leads", href: "/servicios/marketing", icon: <Megaphone className="w-4 h-4" />, bg: "#ede9fe" },
  { label: "Consultoría Empresarial", desc: "Diagnóstico y plan de mejora", href: "/servicios/consultoria", icon: <Briefcase className="w-4 h-4" />, bg: "#dcfce7" },
  { label: "Implementación y Soporte", desc: "Puesta en marcha llave en mano", href: "/servicios/implementacion", icon: <Wrench className="w-4 h-4" />, bg: "#fef9c3" },
];

const EMPRESA = [
  { label: "Sobre Nosotros",     href: "/sobre-nosotros",    icon: <Info className="w-4 h-4" /> },
  { label: "Casos de Éxito",     href: "/casos-de-exito",    icon: <Star className="w-4 h-4" /> },
  { label: "Blog",               href: "/blog",              icon: <BookOpen className="w-4 h-4" /> },
  { label: "Comparativa",        href: "/comparativa",       icon: <GitCompare className="w-4 h-4" /> },
  { label: "Programa de Socios", href: "/programa-socios",   icon: <Handshake className="w-4 h-4" /> },
  { label: "Trabajá con Nosotros", href: "/empleo",          icon: <Briefcase className="w-4 h-4" /> },
];

const RECURSOS = [
  { label: "Academia",  href: "/academia",  icon: <GraduationCap className="w-4 h-4" /> },
  { label: "Recursos",  href: "/recursos",  icon: <BookOpen className="w-4 h-4" /> },
  { label: "FAQ",       href: "/faq",       icon: <HelpCircle className="w-4 h-4" /> },
  { label: "Precios",   href: "/precios",   icon: <DollarSign className="w-4 h-4" /> },
  { label: "Soluciones por Industria", href: "/industria",   icon: <Factory className="w-4 h-4" /> },
  { label: "Especificaciones", href: "/especificaciones",    icon: <FileCode2 className="w-4 h-4" /> },
  { label: "Contacto",  href: "/contacto",  icon: <Mail className="w-4 h-4" /> },
];

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [empresaOpen, setEmpresaOpen] = useState(false);
  const [recursosOpen, setRecursosOpen] = useState(false);
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();

  const isActive = (href: string) => location === href;
  const isServiceActive = location.startsWith("/servicios");
  const isEmpresaActive = ["/sobre-nosotros", "/casos-de-exito", "/blog", "/comparativa", "/programa-socios", "/empleo"].some(h => location === h);
  const isRecursosActive = ["/academia", "/recursos", "/faq", "/precios", "/contacto", "/industria", "/especificaciones"].some(h => location === h);

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-extrabold text-xl" style={{ color: BRAND_BLUE }}>
            <div className="w-8 h-8 rounded-md flex items-center justify-center text-white text-sm font-black" style={{ background: BRAND_BLUE }}>
              C
            </div>
            Clientum
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-gray-600">
            <Link href="/" className={`px-3 py-2 rounded-md hover:text-[#2467a2] transition-colors ${isActive("/") ? "text-[#2467a2] font-semibold" : ""}`}>
              Inicio
            </Link>

            {/* Funciones dropdown */}
            <div className="relative" onMouseEnter={() => setFeaturesOpen(true)} onMouseLeave={() => setFeaturesOpen(false)}>
              <button className="flex items-center gap-1 px-3 py-2 rounded-md hover:text-[#2467a2] transition-colors">
                Funciones <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {featuresOpen && (
                <div className="absolute top-full left-0 w-[480px] bg-white border border-gray-100 rounded-2xl shadow-xl p-3 z-50 grid grid-cols-2 gap-1">
                  {FEATURES.map((f) => (
                    <Link key={f.href} href={f.href}
                      className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: f.bg }}>{f.icon}</span>
                      <span className="flex flex-col">
                        <strong className="text-sm font-semibold text-gray-900">{f.label}</strong>
                        <small className="text-xs text-gray-500">{f.desc}</small>
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Servicios dropdown */}
            <div className="relative" onMouseEnter={() => setServicesOpen(true)} onMouseLeave={() => setServicesOpen(false)}>
              <button className={`flex items-center gap-1 px-3 py-2 rounded-md hover:text-[#2467a2] transition-colors ${isServiceActive ? "text-[#2467a2] font-semibold" : ""}`}>
                Servicios <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {servicesOpen && (
                <div className="absolute top-full left-0 w-[480px] bg-white border border-gray-100 rounded-2xl shadow-xl p-3 z-50 grid grid-cols-2 gap-1">
                  {SERVICES.map((s) => (
                    <Link key={s.href} href={s.href}
                      className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: s.bg }}>{s.icon}</span>
                      <span className="flex flex-col">
                        <strong className="text-sm font-semibold text-gray-900">{s.label}</strong>
                        <small className="text-xs text-gray-500">{s.desc}</small>
                      </span>
                    </Link>
                  ))}
                  <Link href="/servicios"
                    className="col-span-2 flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors border-t border-gray-100 mt-1 pt-3">
                    <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#f0f5ff" }}><Briefcase className="w-4 h-4" /></span>
                    <span className="flex flex-col">
                      <strong className="text-sm font-semibold text-gray-900">Ver catálogo completo con precios →</strong>
                      <small className="text-xs text-gray-500">Todos los servicios y planes detallados</small>
                    </span>
                  </Link>
                </div>
              )}
            </div>

            {/* Empresa dropdown */}
            <div className="relative" onMouseEnter={() => setEmpresaOpen(true)} onMouseLeave={() => setEmpresaOpen(false)}>
              <button className={`flex items-center gap-1 px-3 py-2 rounded-md hover:text-[#2467a2] transition-colors ${isEmpresaActive ? "text-[#2467a2] font-semibold" : ""}`}>
                Empresa <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {empresaOpen && (
                <div className="absolute top-full left-0 w-56 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50">
                  {EMPRESA.map((e) => (
                    <Link key={e.href} href={e.href}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#2467a2] transition-colors">
                      <span className="text-gray-400">{e.icon}</span>
                      {e.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Recursos dropdown */}
            <div className="relative" onMouseEnter={() => setRecursosOpen(true)} onMouseLeave={() => setRecursosOpen(false)}>
              <button className={`flex items-center gap-1 px-3 py-2 rounded-md hover:text-[#2467a2] transition-colors ${isRecursosActive ? "text-[#2467a2] font-semibold" : ""}`}>
                Recursos <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {recursosOpen && (
                <div className="absolute top-full left-0 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50">
                  {RECURSOS.map((r) => (
                    <Link key={r.href} href={r.href}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#2467a2] transition-colors">
                      <span className="text-gray-400">{r.icon}</span>
                      {r.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/app/dashboard">
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: BRAND_BLUE }}>
                  Ir al CRM <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <button className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:text-[#2467a2] transition-colors">
                    Iniciar sesión
                  </button>
                </Link>
                <Link href="/register">
                  <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: BRAND_BLUE }}>
                    Probar gratis
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="lg:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1 max-h-[80vh] overflow-y-auto">
            <Link href="/" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Inicio</Link>

            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Funciones</div>
            {FEATURES.map((f) => (
              <Link key={f.href} href={f.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-5 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50">
                <span className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ background: f.bg }}>{f.icon}</span>
                {f.label}
              </Link>
            ))}

            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Servicios</div>
            {SERVICES.map((s) => (
              <Link key={s.href} href={s.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-5 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50">
                <span className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ background: s.bg }}>{s.icon}</span>
                {s.label}
              </Link>
            ))}
            <Link href="/servicios" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-5 py-2 rounded-md text-sm font-semibold text-[#2467a2] hover:bg-gray-50">
              Ver catálogo completo con precios →
            </Link>

            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Empresa</div>
            {EMPRESA.map((e) => (
              <Link key={e.href} href={e.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-5 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50">
                <span className="text-gray-400">{e.icon}</span>
                {e.label}
              </Link>
            ))}

            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Recursos</div>
            {RECURSOS.map((r) => (
              <Link key={r.href} href={r.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-5 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50">
                <span className="text-gray-400">{r.icon}</span>
                {r.label}
              </Link>
            ))}

            <div className="pt-2 flex flex-col gap-2">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <button className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold border border-gray-200 text-gray-700">Iniciar sesión</button>
              </Link>
              <Link href="/register" onClick={() => setMobileOpen(false)}>
                <button className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: BRAND_BLUE }}>Probar gratis</button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-5 gap-10 pb-12 border-b border-gray-800">
            {/* Brand */}
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center gap-2 font-extrabold text-xl text-white">
                <div className="w-8 h-8 rounded-md flex items-center justify-center text-white text-sm font-black" style={{ background: BRAND_BLUE }}>C</div>
                Clientum
              </div>
              <p className="text-sm leading-relaxed">IA para PyMEs argentinas. Chatbot WhatsApp 24/7, CRM inteligente y automatización. Sin código, sin IT.</p>
              <p className="text-xs">hola@clientum.com.ar</p>
            </div>

            {/* Funciones */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold text-sm uppercase tracking-wide">Funciones</h4>
              {FEATURES.map((f) => (
                <Link key={f.href} href={f.href} className="block text-sm hover:text-white transition-colors">{f.label}</Link>
              ))}
            </div>

            {/* Servicios */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold text-sm uppercase tracking-wide">Servicios</h4>
              {SERVICES.slice(1).map((s) => (
                <Link key={s.href} href={s.href} className="block text-sm hover:text-white transition-colors">{s.label}</Link>
              ))}
            </div>

            {/* Empresa */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold text-sm uppercase tracking-wide">Empresa</h4>
              {[
                { label: "Sobre Nosotros", href: "/sobre-nosotros" },
                { label: "Casos de Éxito", href: "/casos-de-exito" },
                { label: "Blog", href: "/blog" },
                { label: "Comparativa", href: "/comparativa" },
                { label: "Programa de Socios", href: "/programa-socios" },
                { label: "Trabajá con Nosotros", href: "/empleo" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="block text-sm hover:text-white transition-colors">{l.label}</Link>
              ))}
            </div>

            {/* Recursos + CTA */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold text-sm uppercase tracking-wide">Recursos</h4>
              {[
                { label: "Academia", href: "/academia" },
                { label: "Recursos", href: "/recursos" },
                { label: "FAQ", href: "/faq" },
                { label: "Precios", href: "/precios" },
                { label: "Soluciones por Industria", href: "/industria" },
                { label: "Especificaciones", href: "/especificaciones" },
                { label: "Contacto", href: "/contacto" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="block text-sm hover:text-white transition-colors">{l.label}</Link>
              ))}
              <div className="pt-3">
                <Link href="/register">
                  <button className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-white mt-1" style={{ background: BRAND_GREEN }}>
                    Probar gratis
                  </button>
                </Link>
              </div>
            </div>
          </div>
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p>© {new Date().getFullYear()} Clientum. Todos los derechos reservados.</p>
            <div className="flex gap-4">
              <Link href="/privacidad" className="hover:text-white transition-colors">Privacidad</Link>
              <Link href="/terminos" className="hover:text-white transition-colors">Términos</Link>
              <Link href="/sobre-nosotros" className="hover:text-white transition-colors">Sobre Nosotros</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
