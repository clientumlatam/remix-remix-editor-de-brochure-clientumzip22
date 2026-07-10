import { CheckCircle2, ArrowRight, MessageCircle, BarChart3, Users, Zap, FileText, Star, Check, Shield, Clock, ChevronRight } from "lucide-react";

const PLANS = [
  { name: "Starter", price: "9.990", desc: "Para emprendedores y equipos chicos", highlight: false, features: ["Hasta 3 usuarios", "500 contactos", "Pipeline visual", "Facturación básica", "Soporte por email"] },
  { name: "Pro", price: "24.990", desc: "El más popular para PyMEs en crecimiento", highlight: true, features: ["Hasta 10 usuarios", "Contactos ilimitados", "WhatsApp + Bot IA", "Factura AFIP", "Asistente IA incluido", "Soporte prioritario"] },
  { name: "Business", price: "59.990", desc: "Para empresas con operaciones complejas", highlight: false, features: ["Usuarios ilimitados", "Multi-sucursal", "API + integraciones", "Reportes avanzados", "SLA garantizado", "Onboarding dedicado"] },
];

const FEATURES = [
  { icon: MessageCircle, tag: "WhatsApp IA", title: "Chatbot que cierra ventas mientras dormís", desc: "Conectá tu número de WhatsApp y el bot responde consultas, cotiza productos y toma pedidos 24/7. Se integra con WooCommerce para leer tu catálogo en tiempo real.", accent: "emerald" },
  { icon: FileText, tag: "Facturación AFIP", title: "Facturá en segundos, sin salir del CRM", desc: "Generá facturas A y B con CAE directo de AFIP. Datos del cliente pre-cargados desde tu CRM. Envío automático por email. Sin planillas, sin errores.", accent: "blue" },
  { icon: Users, tag: "CRM + Pipeline", title: "Pipeline de ventas visual, sin complicaciones", desc: "Kanban de leads y deals con alertas automáticas. Sabé exactamente en qué etapa está cada oportunidad y qué acción corresponde. Todo el equipo en sincronía.", accent: "violet" },
];

export default function V2() {
  return (
    <div className="min-h-screen bg-[#fafafa] font-sans">

      {/* Navbar */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/98 backdrop-blur z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#111827] rounded-lg flex items-center justify-center text-white shadow-sm">
              <span className="font-black text-sm">C</span>
            </div>
            <span className="font-black text-xl tracking-tight text-[#111827]">Clientum</span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {["Inicio", "Productos", "Servicios", "Precios", "Blog", "Contacto"].map((link) => (
              <a key={link} href="#" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">{link}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button className="text-sm font-medium text-gray-600">Iniciar sesión</button>
            <button className="h-9 px-4 bg-[#111827] text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1.5">
              Lanzá tu PyME <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero — split layout */}
      <section className="bg-[#111827] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-0">
          <div className="grid lg:grid-cols-[1fr_420px] gap-16 items-end">
            {/* Left */}
            <div className="pb-16 space-y-8">
              <div className="inline-flex items-center gap-2 bg-white/8 border border-white/10 text-gray-300 text-xs font-medium px-4 py-2 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Integrado con AFIP · WhatsApp · WooCommerce
              </div>
              <div className="space-y-4">
                <h1 className="text-6xl font-black tracking-tight leading-[1.02]">
                  La PyME que<br />
                  <span className="text-emerald-400">vende sola.</span>
                </h1>
                <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
                  CRM inteligente, chatbot WhatsApp con IA, facturación AFIP y portal del cliente. Todo en una plataforma diseñada para la Argentina.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="h-12 px-6 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2">
                  Empezar gratis — 14 días <ArrowRight className="w-4 h-4" />
                </button>
                <button className="h-12 px-6 bg-white/6 border border-white/12 text-white font-semibold rounded-xl hover:bg-white/10 transition-all">
                  Ver demo en vivo
                </button>
              </div>
              <div className="flex flex-wrap gap-5 text-sm text-gray-400">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sin tarjeta de crédito</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Operativo en 1 semana</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sin código</span>
              </div>
            </div>

            {/* Right — chat mockup */}
            <div className="self-end">
              <div className="bg-[#1e2939] rounded-t-2xl overflow-hidden border border-white/8 border-b-0 shadow-2xl">
                {/* Browser bar */}
                <div className="px-4 py-2.5 bg-[#161e2d] flex items-center gap-2 border-b border-white/5">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                  </div>
                  <div className="flex-1 bg-[#0d1117] rounded text-[10px] text-gray-500 text-center py-0.5 font-mono">clientum.ar/app/whatsapp</div>
                </div>
                {/* Conversation UI */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/5">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">M</div>
                    <div>
                      <p className="text-white text-xs font-semibold">María González</p>
                      <p className="text-emerald-400 text-[10px]">● en línea · hace 2 min</p>
                    </div>
                    <span className="ml-auto text-[10px] bg-orange-500/20 text-orange-300 border border-orange-500/20 px-2 py-0.5 rounded-full">⚠ Atención humana</span>
                  </div>
                  {[
                    { from: "in", text: "Hola, necesito una cotización para 5 mesas de reunión" },
                    { from: "out", text: "¡Hola María! Las mesas de reunión modelo Executive están a $45.000 c/u. Para 5 unidades te aplica 10% de descuento: total $202.500. ¿Las querés con o sin sillas?", ai: true },
                    { from: "in", text: "Con sillas, 4 por mesa. Y necesito la factura A" },
                    { from: "out", text: "Perfecto. Con 20 sillas modelo Ergon a $8.500 c/u, el total es $372.500. Te genero el presupuesto y la factura A ahora mismo.", ai: true },
                    { from: "in", text: "Quiero hablar con un vendedor para negociar" },
                  ].map(({ from, text, ai }, i) => (
                    <div key={i} className={`flex ${from === "out" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] text-[11px] rounded-xl px-3 py-2 leading-relaxed ${from === "out" ? "bg-[#005c4b] text-white rounded-tr-sm" : "bg-[#2a3942] text-gray-200 rounded-tl-sm"}`}>
                        {ai && <p className="text-[9px] text-emerald-400 font-medium mb-0.5">⚡ Bot IA</p>}
                        {text}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                    <div className="flex-1 bg-[#2a3942] rounded-lg px-3 py-1.5 text-[11px] text-gray-500">Responder como asesor humano...</div>
                    <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center"><ArrowRight className="w-3.5 h-3.5 text-white" /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <div className="bg-white border-b border-gray-100 py-5 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-3 md:grid-cols-6 gap-6 items-center text-center">
          {[
            { n: "+500", l: "PyMEs activas" },
            { n: "24/7", l: "Atención sin parar" },
            { n: "1 sem", l: "Para empezar" },
            { n: "+60%", l: "Más conversiones" },
            { n: "$0", l: "Sin IT externo" },
            { n: "100%", l: "Precios en pesos" },
          ].map(({ n, l }) => (
            <div key={n}>
              <p className="text-xl font-black text-gray-900">{n}</p>
              <p className="text-xs text-gray-400 mt-0.5">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features — alternating */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto space-y-20">
          <div className="text-center mb-4">
            <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">Plataforma todo-en-uno</p>
            <h2 className="text-4xl font-black text-gray-900">Todo lo que tu PyME necesita</h2>
          </div>
          {FEATURES.map(({ icon: Icon, tag, title, desc, accent }, i) => {
            const colors: Record<string, string> = {
              emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
              blue: "bg-blue-50 text-blue-600 border-blue-100",
              violet: "bg-violet-50 text-violet-600 border-violet-100",
            };
            const tagColors: Record<string, string> = {
              emerald: "bg-emerald-100 text-emerald-700",
              blue: "bg-blue-100 text-blue-700",
              violet: "bg-violet-100 text-violet-700",
            };
            return (
              <div key={title} className={`grid lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? "lg:grid-flow-col-dense" : ""}`}>
                <div className={`space-y-5 ${i % 2 === 1 ? "lg:col-start-2" : ""}`}>
                  <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${tagColors[accent]}`}>{tag}</span>
                  <h3 className="text-2xl font-black text-gray-900 leading-tight">{title}</h3>
                  <p className="text-gray-500 leading-relaxed">{desc}</p>
                  <button className="text-sm font-semibold text-gray-900 flex items-center gap-1 hover:gap-2 transition-all">
                    Conocer más <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className={`${i % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""}`}>
                  <div className={`rounded-2xl border ${colors[accent]} p-10 flex items-center justify-center aspect-video`}>
                    <Icon className="w-16 h-16 opacity-40" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* AFIP integration callout */}
      <section className="py-20 px-6 bg-[#111827] text-white">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/20">
              Integrado con AFIP
            </span>
            <h2 className="text-3xl font-black leading-tight">
              Facturación electrónica<br />sin salir del CRM
            </h2>
            <p className="text-gray-400 leading-relaxed">
              Emitís facturas A y B directamente desde el deal o la cotización. CUIT, condición de IVA, CAE y PDF automático. Sin planillas, sin volver a cargar datos.
            </p>
            <ul className="space-y-2">
              {["Facturas A y B con CAE en segundos", "Datos del cliente desde el CRM", "Envío automático por email al cliente", "Historial de facturas por cliente"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> {item}
                </li>
              ))}
            </ul>
            <button className="h-11 px-6 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-400 transition-all text-sm flex items-center gap-2">
              Ver planes con AFIP <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          {/* Fake invoice */}
          <div className="bg-white rounded-2xl p-5 text-gray-900 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div>
                <p className="text-[10px] text-gray-400 font-mono">N° 0001-00000821</p>
                <p className="text-sm font-black text-gray-900">FACTURA B</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">CAE ✓</span>
            </div>
            <div className="space-y-1 text-xs mb-4">
              <div className="flex justify-between text-gray-500"><span>Cliente</span><span className="font-semibold text-gray-800">Ferretería San Martín</span></div>
              <div className="flex justify-between text-gray-500"><span>CUIT</span><span className="font-mono text-gray-800">30-12345678-9</span></div>
              <div className="flex justify-between text-gray-500"><span>Fecha</span><span className="text-gray-800">29/06/2026</span></div>
            </div>
            <table className="w-full text-xs mb-4">
              <thead><tr className="bg-gray-50 text-gray-500"><th className="py-1 px-2 text-left">Detalle</th><th className="py-1 px-2 text-right">Total</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                <tr><td className="py-1.5 px-2 text-gray-700">Chatbot WhatsApp — Mes 1</td><td className="py-1.5 px-2 text-right font-medium">$24.990</td></tr>
                <tr><td className="py-1.5 px-2 text-gray-700">Onboarding Inicial</td><td className="py-1.5 px-2 text-right font-medium">$10.000</td></tr>
              </tbody>
            </table>
            <div className="bg-gray-50 rounded-lg p-2 text-xs flex items-center justify-between">
              <span className="text-gray-500">IVA 21%</span>
              <span className="font-semibold">$7.347</span>
            </div>
            <div className="flex items-center justify-between mt-2 font-black text-sm">
              <span>Total</span><span className="text-blue-600">$42.337</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precios" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">Precios en pesos</p>
            <h2 className="text-4xl font-black text-gray-900">Simple, sin dólares</h2>
            <p className="mt-3 text-gray-500">Sin costos ocultos. Cancelá cuando quieras.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 items-start">
            {PLANS.map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-7 relative ${plan.highlight ? "bg-[#111827] text-white ring-2 ring-[#111827] shadow-2xl -mt-2" : "bg-white border border-gray-200"}`}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">★ Más popular</span>
                  </div>
                )}
                <h3 className={`text-lg font-black mb-0.5 ${plan.highlight ? "text-white" : "text-gray-900"}`}>{plan.name}</h3>
                <p className={`text-xs mb-5 ${plan.highlight ? "text-gray-400" : "text-gray-400"}`}>{plan.desc}</p>
                <div className="mb-6">
                  <span className={`text-4xl font-black ${plan.highlight ? "text-white" : "text-gray-900"}`}>${plan.price}</span>
                  <span className={`text-sm ml-1 ${plan.highlight ? "text-gray-400" : "text-gray-400"}`}>/mes + IVA</span>
                </div>
                <ul className="space-y-2.5 mb-7">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className={`w-4 h-4 flex-shrink-0 ${plan.highlight ? "text-emerald-400" : "text-emerald-500"}`} />
                      <span className={plan.highlight ? "text-gray-300" : "text-gray-600"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full h-10 rounded-xl font-semibold text-sm transition-all ${plan.highlight ? "bg-emerald-500 text-white hover:bg-emerald-400" : "border border-gray-200 text-gray-700 hover:border-gray-400"}`}>
                  Empezar gratis
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-black text-gray-900 text-center mb-10">Lo que dicen nuestros clientes</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: "Martín R.", role: "Ferretería", text: "El bot de WhatsApp responde solo. Cerramos ventas a las 3am sin que nadie esté trabajando.", stars: 5 },
              { name: "Sandra G.", role: "Consultora", text: "Las facturas AFIP desde el CRM me ahorran 2 horas por semana. Increíble.", stars: 5 },
              { name: "Diego P.", role: "E-commerce", text: "Integré WooCommerce y el bot ya sabe stock y precios. Mis clientes piden sin llamarme.", stars: 5 },
            ].map(({ name, role, text, stars }) => (
              <div key={name} className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4 shadow-sm">
                <div className="flex gap-0.5">
                  {Array.from({ length: stars }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">"{text}"</p>
                <div className="flex items-center gap-2.5 pt-1">
                  <div className="w-8 h-8 rounded-full bg-[#111827] text-white font-bold text-xs flex items-center justify-center">{name[0]}</div>
                  <div><p className="text-sm font-semibold text-gray-900">{name}</p><p className="text-xs text-gray-400">{role}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-[#111827] text-white text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-4xl font-black">¿Listo para automatizar<br />tu PyME?</h2>
          <p className="text-gray-400 text-lg">14 días gratis. Sin tarjeta. Operativo en una semana.</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button className="h-12 px-7 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2">
              Crear cuenta gratis <ArrowRight className="w-4 h-4" />
            </button>
            <button className="h-12 px-7 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-all">
              Hablar con ventas
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0f1a] border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8 pb-8 border-b border-white/5">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center text-white text-xs font-black">C</div>
                <span className="font-black text-white text-lg">Clientum</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs">CRM/ERP para PyMEs argentinas. Gestioná, automatizá y crecé.</p>
            </div>
            {[
              { t: "Funciones", ls: ["Chatbot WhatsApp", "CRM Inteligente", "Facturación AFIP", "Portal del Cliente", "Asistente IA"] },
              { t: "Empresa", ls: ["Sobre Clientum", "Blog", "Prensa", "Carreras"] },
              { t: "Recursos", ls: ["Documentación", "Academia", "Soporte", "API"] },
            ].map(({ t, ls }) => (
              <div key={t}>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{t}</p>
                <ul className="space-y-2">{ls.map((l) => <li key={l}><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">{l}</a></li>)}</ul>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-600">
            <p>© 2026 Clientum. Hecho con ♥ en Argentina.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-gray-400 transition-colors">Términos</a>
              <a href="#" className="hover:text-gray-400 transition-colors">Privacidad</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
