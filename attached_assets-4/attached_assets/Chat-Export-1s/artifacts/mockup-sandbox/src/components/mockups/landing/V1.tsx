import { CheckCircle2, ArrowRight, MessageCircle, BarChart3, Users, Zap, FileText, Star, Check, Shield, Clock } from "lucide-react";

const PLANS = [
  { name: "Starter", price: "9.990", desc: "Para emprendedores y equipos chicos", highlight: false, features: ["Hasta 3 usuarios", "500 contactos", "Pipeline de leads y deals", "Facturación básica", "Soporte por email"] },
  { name: "Pro", price: "24.990", desc: "El más popular para PyMEs en crecimiento", highlight: true, features: ["Hasta 10 usuarios", "Contactos ilimitados", "WhatsApp integrado", "Factura electrónica AFIP", "Asistente IA incluido", "Soporte prioritario"] },
  { name: "Business", price: "59.990", desc: "Para empresas con operaciones complejas", highlight: false, features: ["Usuarios ilimitados", "Multi-sucursal", "API + integraciones", "Reportes avanzados", "SLA garantizado", "Onboarding dedicado"] },
];

const TESTIMONIALS = [
  { name: "Martín R.", role: "Ferretería", text: "Antes perdíamos leads en planillas de Excel. Ahora todo está en un solo lugar y el bot de WhatsApp responde solo.", stars: 5 },
  { name: "Sandra G.", role: "Consultora", text: "Las facturas AFIP desde el CRM me ahorran 2 horas por semana. No volvería a trabajar sin Clientum.", stars: 5 },
  { name: "Diego P.", role: "E-commerce", text: "El chatbot atiende clientes a las 3am. Cerramos ventas mientras dormimos.", stars: 5 },
];

export default function V1() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Navbar */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-xl tracking-tight text-[#0f172a]">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
              <span className="font-black text-sm">C</span>
            </div>
            Clientum
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#precios" className="hover:text-blue-600 transition-colors">Precios</a>
            <a href="#testimonios" className="hover:text-blue-600 transition-colors">Clientes</a>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors hidden sm:block">Iniciar sesión</button>
            <button className="h-9 px-4 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
              Empezar gratis <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-0 px-6 overflow-hidden bg-gradient-to-b from-slate-950 via-blue-950 to-slate-900">
        <div className="max-w-7xl mx-auto">

          {/* Pill badge */}
          <div className="flex justify-center mb-8">
            <span className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold px-4 py-2 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Tu PyME argentina, organizada y automatizada
            </span>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left column — text */}
            <div className="text-center lg:text-left space-y-7">
              <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] text-white">
                Atención al cliente{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                  24/7
                </span>{" "}
                sin contratar personal
              </h1>
              <p className="text-lg text-slate-300 leading-relaxed max-w-xl">
                Clientum automatiza tu PyME con IA: chatbot para WhatsApp, CRM inteligente y reportes automáticos. Sin IT, sin código, en 1 semana.
              </p>
              <div className="flex flex-col sm:flex-row items-center lg:justify-start gap-3 pt-2">
                <button className="w-full sm:w-auto h-12 px-7 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-400 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 text-base">
                  Probarlo gratis <ArrowRight className="w-4 h-4" />
                </button>
                <button className="w-full sm:w-auto h-12 px-7 bg-white/5 border border-white/15 text-white font-semibold rounded-xl hover:bg-white/10 transition-all text-base">
                  Hablar con un experto
                </button>
              </div>
              <div className="flex flex-wrap items-center lg:justify-start justify-center gap-5 pt-1 text-sm text-slate-400 font-medium">
                <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sin tarjeta de crédito</div>
                <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Operativo en 1 semana</div>
                <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sin código</div>
              </div>
            </div>

            {/* Right column — WhatsApp chat mockup */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-[300px] bg-[#111b21] rounded-2xl shadow-2xl border border-white/5 overflow-hidden">
                {/* WA header */}
                <div className="bg-[#202c33] px-4 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">F</div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-semibold">Ferretería El Perno</p>
                    <p className="text-emerald-400 text-xs">● en línea</p>
                  </div>
                  <MessageCircle className="w-4 h-4 text-slate-400" />
                </div>
                {/* Messages */}
                <div className="p-3 space-y-2 bg-[#0b141a] min-h-[220px]">
                  <div className="flex justify-start">
                    <div className="bg-[#202c33] text-white text-xs rounded-lg rounded-tl-sm px-3 py-2 max-w-[75%]">
                      Hola! ¿Tienen tornillos 6x50 en stock?
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-[#005c4b] text-white text-xs rounded-lg rounded-tr-sm px-3 py-2 max-w-[80%]">
                      ¡Hola! Sí, tenemos tornillos 6×50 galvanizados. $1.200 la caja de 100 unidades. ¿Querés que te aparte?
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-[10px] text-slate-300/60">Bot IA</span>
                        <span className="text-[10px] text-blue-300">✓✓</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-[#202c33] text-white text-xs rounded-lg rounded-tl-sm px-3 py-2 max-w-[75%]">
                      Sí! Y también necesito bisagras piano
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-[#005c4b] text-white text-xs rounded-lg rounded-tr-sm px-3 py-2 max-w-[80%]">
                      Tengo bisagras piano 180cm a $3.800 la tira. ¿Cuántas necesitás? Te armo el presupuesto.
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-[10px] text-slate-300/60">Bot IA</span>
                        <span className="text-[10px] text-blue-300">✓✓</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-[#202c33] text-white text-xs rounded-lg rounded-tl-sm px-3 py-2 max-w-[75%]">
                      3 tiras. ¿Puedo pagar con transferencia?
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-[#005c4b] text-white text-xs rounded-lg rounded-tr-sm px-3 py-2 max-w-[80%]">
                      ¡Por supuesto! Total: $11.400. Te mando el CBU ahora. 🙌
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-[10px] text-slate-300/60">Bot IA</span>
                        <span className="text-[10px] text-blue-300">✓✓</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* WA input */}
                <div className="bg-[#202c33] px-3 py-2 flex items-center gap-2">
                  <div className="flex-1 bg-[#2a3942] rounded-full px-3 py-1.5 text-xs text-slate-500">Escribir mensaje...</div>
                  <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center">
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-16 border-t border-white/8 pt-8 grid grid-cols-3 gap-6 pb-8">
            {[
              { stat: "24/7", label: "Atención automática, sin descanso" },
              { stat: "1 semana", label: "Para estar operativo completamente" },
              { stat: "+60%", label: "Más conversiones que sin chatbot" },
            ].map((s) => (
              <div key={s.stat} className="text-center">
                <p className="text-3xl font-black text-white">{s.stat}</p>
                <p className="text-xs text-slate-400 mt-1 leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof logos strip */}
      <div className="bg-slate-50 border-y border-gray-100 py-5 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-8 flex-wrap">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mr-2">Usado por +500 PyMEs</p>
          {["Ferretería", "Farmacia", "Consultora", "E-commerce", "Logística"].map((n) => (
            <span key={n} className="text-sm font-semibold text-gray-400">{n}</span>
          ))}
        </div>
      </div>

      {/* Features — 3-col grid */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-3">Plataforma completa</p>
            <h2 className="text-4xl font-black tracking-tight text-gray-900">Todo lo que tu PyME necesita</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">Una plataforma unificada para vender, facturar, gestionar clientes y tomar decisiones con datos.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: MessageCircle, title: "Chatbot WhatsApp 24/7", desc: "El bot responde, cotiza y cierra ventas por WhatsApp mientras vos dormís. Aprende de tu catálogo.", color: "bg-emerald-50 text-emerald-600", border: "border-emerald-100" },
              { icon: Users, title: "CRM Inteligente", desc: "Contactos, empresas, leads y deals en un Kanban visual. Seguí cada oportunidad de venta.", color: "bg-blue-50 text-blue-600", border: "border-blue-100" },
              { icon: BarChart3, title: "Asistente IA", desc: "Consultá tu pipeline, identificá oportunidades y recibí recomendaciones de ventas en segundos.", color: "bg-purple-50 text-purple-600", border: "border-purple-100" },
              { icon: FileText, title: "Facturación AFIP", desc: "Generá facturas A y B con CAE integrado. Todo lo necesario para cumplir con AFIP sin complicaciones.", color: "bg-amber-50 text-amber-600", border: "border-amber-100" },
              { icon: Zap, title: "Automatizaciones", desc: "Configurá flujos automáticos: seguimientos, recordatorios y escaladas a tu equipo cuando el bot no puede responder.", color: "bg-red-50 text-red-600", border: "border-red-100" },
              { icon: Shield, title: "Portal del Cliente", desc: "Tus clientes ven sus facturas, pedidos y estados de cuenta sin llamarte. Acceso seguro y personalizado.", color: "bg-slate-50 text-slate-600", border: "border-slate-100" },
            ].map(({ icon: Icon, title, desc, color, border }) => (
              <div key={title} className={`bg-white border ${border} rounded-2xl p-6 space-y-3 hover:shadow-md transition-shadow`}>
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-3">Sin IT necesario</p>
            <h2 className="text-3xl font-black text-gray-900">De cero a automatizado en una semana</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { n: "01", title: "Conectá tu WhatsApp", desc: "Escaneá el código QR y vinculá tu número en menos de 2 minutos." },
              { n: "02", title: "Configurá el bot", desc: "Cargá tu catálogo, precios y FAQs. El bot aprende de tu negocio automáticamente." },
              { n: "03", title: "Empezá a vender solo", desc: "En media semana el bot atiende, cotiza y cierra ventas sin tu intervención." },
            ].map(({ n, title, desc }) => (
              <div key={n} className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-black text-lg flex items-center justify-center mx-auto shadow-md shadow-blue-500/20">
                  {n}
                </div>
                <h3 className="font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonios" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-gray-900">Lo que dicen nuestros clientes</h2>
            <p className="text-gray-500 mt-2">PyMEs reales que ya crecen con Clientum</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, role, text, stars }) => (
              <div key={name} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex gap-0.5">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">"{text}"</p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center">
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{name}</p>
                    <p className="text-xs text-gray-500">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precios" className="py-24 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-3">Precios en pesos</p>
            <h2 className="text-3xl font-black text-gray-900">Simple, transparente, sin dólares</h2>
            <p className="mt-3 text-gray-500">Sin costos ocultos. Cancelá cuando quieras.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {PLANS.map((plan) => (
              <div key={plan.name} className={`rounded-2xl border p-7 relative ${plan.highlight ? "border-blue-600 bg-blue-600 text-white shadow-xl shadow-blue-500/20" : "border-gray-200 bg-white"}`}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-900" /> Más popular
                    </span>
                  </div>
                )}
                <div className="mb-4">
                  <h3 className={`text-lg font-black ${plan.highlight ? "text-white" : "text-gray-900"}`}>{plan.name}</h3>
                  <p className={`text-xs mt-0.5 ${plan.highlight ? "text-blue-200" : "text-gray-400"}`}>{plan.desc}</p>
                </div>
                <div className="mb-6">
                  <span className={`text-4xl font-black ${plan.highlight ? "text-white" : "text-gray-900"}`}>${plan.price}</span>
                  <span className={`text-sm ml-1 ${plan.highlight ? "text-blue-200" : "text-gray-400"}`}>/mes + IVA</span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className={`w-4 h-4 flex-shrink-0 ${plan.highlight ? "text-blue-200" : "text-blue-500"}`} />
                      <span className={plan.highlight ? "text-blue-100" : "text-gray-600"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full h-10 rounded-xl font-semibold text-sm transition-all ${plan.highlight ? "bg-white text-blue-600 hover:bg-blue-50" : "border border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600"}`}>
                  Empezar gratis
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6 bg-gradient-to-br from-slate-950 to-blue-950 text-white text-center">
        <div className="max-w-3xl mx-auto space-y-7">
          <p className="text-blue-400 text-sm font-bold uppercase tracking-widest">Sin compromiso · 14 días gratis</p>
          <h2 className="text-5xl font-black tracking-tight">¿Listo para automatizar tu PyME?</h2>
          <p className="text-xl text-slate-300">14 días gratis. Sin tarjeta. Operativo en una semana.</p>
          <div className="flex items-center justify-center gap-4 pt-2">
            <button className="h-13 px-8 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-400 transition-all shadow-lg shadow-blue-500/25 text-lg">
              Crear cuenta gratis →
            </button>
            <button className="h-13 px-8 bg-white/5 border border-white/15 text-white font-semibold rounded-xl hover:bg-white/10 transition-all text-base">
              Hablar con un experto
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
            <div className="col-span-2">
              <div className="flex items-center gap-2 font-black text-lg text-[#0f172a] mb-3">
                <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center text-white text-xs font-black">C</div>
                Clientum
              </div>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                El CRM/ERP para PyMEs argentinas. Gestioná, automatizá y crecer.
              </p>
            </div>
            {[
              { title: "Funciones", links: ["Chatbot WhatsApp", "CRM Inteligente", "Facturación AFIP", "Portal del Cliente"] },
              { title: "Empresa", links: ["Sobre Clientum", "Blog", "Prensa"] },
              { title: "Recursos", links: ["Documentación", "Academia", "Soporte"] },
            ].map(({ title, links }) => (
              <div key={title}>
                <p className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">{title}</p>
                <ul className="space-y-2">
                  {links.map((l) => <li key={l}><a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">{l}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-6 flex items-center justify-between text-xs text-gray-400">
            <p>© 2026 Clientum. Hecho con ♥ en Argentina.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-blue-600 transition-colors">Términos</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Privacidad</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
