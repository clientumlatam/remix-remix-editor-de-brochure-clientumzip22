import {
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  Bot,
  BarChart3,
  Zap,
  Users,
  Globe,
  Star,
  Clock,
  ShieldCheck,
  FileText,
  Receipt,
  BadgeCheck,
  RefreshCw,
} from "lucide-react";

const BRAND_BLUE = "#2467a2";
const BRAND_GREEN = "#25d366";

const STATS = [
  { value: "24/7", label: "Atención automática al cliente, sin pausas" },
  { value: "1 semana", label: "Tiempo promedio para estar operativo" },
  { value: "+60%", label: "Más consultas respondidas sin intervención humana" },
];

const FEATURES = [
  { icon: <MessageCircle className="w-6 h-6" />, color: BRAND_GREEN, accent: "#dcfce7", title: "Chatbot WhatsApp 24/7", desc: "Tu negocio responde solo. El chatbot atiende consultas, agenda citas y califica leads en WhatsApp sin que toques nada." },
  { icon: <Users className="w-6 h-6" />, color: BRAND_BLUE, accent: "#dbeafe", title: "CRM Inteligente", desc: "Todos tus contactos, leads y deals en un solo lugar. Seguimiento automático y pipeline visual para nunca perder una venta." },
  { icon: <Bot className="w-6 h-6" />, color: "#7c3aed", accent: "#ede9fe", title: "Asistente IA", desc: "Preguntale al asistente: '¿Cuántos leads tengo esta semana?' o 'Resumen del pipeline' y te responde al instante." },
  { icon: <BarChart3 className="w-6 h-6" />, color: "#ea580c", accent: "#ffedd5", title: "Reportes Automáticos", desc: "Reportes de ventas, actividad y conversión generados automáticamente. Tomá decisiones con datos reales, no intuición." },
  { icon: <Zap className="w-6 h-6" />, color: "#ca8a04", accent: "#fef9c3", title: "Automatización", desc: "Flujos automáticos para seguimientos, recordatorios de pago y notificaciones. Hacé más con menos trabajo manual." },
  { icon: <Globe className="w-6 h-6" />, color: "#0891b2", accent: "#cffafe", title: "Portal del Cliente", desc: "Tus clientes ven sus facturas, deals y estado de servicio desde un portal propio. Menos consultas, más profesionalismo." },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Conectás tu WhatsApp", desc: "En minutos conectamos tu línea de WhatsApp Business. Sin configuraciones técnicas complicadas." },
  { step: "02", title: "Configuramos tu IA", desc: "Definimos las respuestas, el tono de tu negocio y los flujos. Te ayudamos nosotros, sin código de tu parte." },
  { step: "03", title: "Empezás a vender solo", desc: "Tu chatbot atiende, el CRM registra y vos revisás el dashboard. Operativo en menos de una semana." },
];

const TESTIMONIALS = [
  { name: "Martín R.", company: "Distribuidora del Sur", text: "Antes perdíamos clientes por no responder a tiempo. Ahora el chatbot responde solo y el equipo se enfoca en cerrar ventas." },
  { name: "Laura G.", company: "Estética Lumière", text: "El bot agenda turnos solo. Pasamos de 20 consultas de WhatsApp por día a más de 80, sin contratar personal." },
  { name: "Diego P.", company: "Tech Retail BA", text: "El CRM integrado con WhatsApp y la facturación nos cambió la vida. En una semana ya estábamos funcionando." },
];

const LOGOS = ["Distribuidora del Sur", "Lumière Estética", "Tech Retail BA", "Agro San Luis", "Taller Norte", "Moda PyME"];

export function VariantA() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: BRAND_BLUE }}>
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">Clientum</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600 font-medium">
            <a href="#" className="hover:text-gray-900 transition-colors">Inicio</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Funciones</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Precios</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Blog</a>
          </nav>
          <div className="flex items-center gap-3">
            <button className="hidden md:block text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2">Iniciar sesión</button>
            <button className="text-sm font-bold px-4 py-2 rounded-lg text-white transition-all hover:opacity-90" style={{ background: BRAND_BLUE }}>
              Probar gratis
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(150deg, #071e3d 0%, #1a4175 45%, #2467a2 100%)" }}
      >
        {/* Subtle mesh overlay */}
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-[0.08] blur-3xl" style={{ background: BRAND_GREEN, transform: "translate(30%, -30%)" }} />

        <div className="relative max-w-7xl mx-auto px-6 py-28 lg:py-32 grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-white space-y-7">
            <div className="inline-flex items-center gap-2.5 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-sm text-blue-100 w-fit">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              IA para PyMEs argentinas
            </div>
            <h1 className="text-5xl xl:text-6xl font-extrabold leading-[1.08] tracking-tight">
              Atención al cliente{" "}
              <span className="relative">
                <span style={{ color: BRAND_GREEN }}>24/7</span>
              </span>
              {" "}sin contratar personal
            </h1>
            <p className="text-blue-100/90 text-lg leading-relaxed max-w-lg">
              Clientum automatiza tu PyME con IA: chatbot para WhatsApp, CRM inteligente y reportes automáticos. Sin código, sin IT. Operativo en una semana.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <button
                className="px-7 py-3.5 rounded-xl font-bold text-sm text-white flex items-center gap-2 transition-all hover:brightness-110 shadow-lg"
                style={{ background: BRAND_GREEN, boxShadow: `0 8px 24px ${BRAND_GREEN}55` }}
              >
                Probar 14 días gratis <ArrowRight className="w-4 h-4" />
              </button>
              <button className="px-7 py-3.5 rounded-xl font-semibold text-sm border border-white/25 text-white hover:bg-white/10 transition-all backdrop-blur-sm">
                Ver demo
              </button>
            </div>
            <div className="flex flex-wrap gap-6 pt-1">
              {[
                { icon: <ShieldCheck className="w-4 h-4" />, text: "Sin tarjeta de crédito" },
                { icon: <Clock className="w-4 h-4" />, text: "Operativo en 1 semana" },
                { icon: <CheckCircle2 className="w-4 h-4" />, text: "Sin código ni IT" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 text-blue-200/80 text-sm">
                  <span style={{ color: BRAND_GREEN }}>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          {/* Chat mockup — cleaner card */}
          <div className="relative">
            <div className="bg-[#1a3a5c]/60 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-2xl space-y-3">
              <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: BRAND_GREEN }}>
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-white">Bot de Distribuidora del Sur</p>
                  <p className="text-xs text-green-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" /> En línea · Responde al instante
                  </p>
                </div>
              </div>
              {[
                { from: "client", text: "Hola, ¿tienen stock de aceite 20w50?" },
                { from: "bot", text: "¡Hola! Sí, tenemos en stock. ¿Cuántos litros necesitás?" },
                { from: "client", text: "20 litros. ¿Hacen envío?" },
                { from: "bot", text: "Sí, hacemos envío a CABA y GBA. Te contacta un asesor en minutos para confirmar. ¿Podés dejarme tu nombre?" },
              ].map((msg, i) => (
                <div key={i} className={`flex ${msg.from === "client" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed text-white ${msg.from === "client" ? "bg-white/15 rounded-tr-sm" : "rounded-tl-sm"}`}
                    style={msg.from === "bot" ? { background: `${BRAND_GREEN}2a`, border: `1px solid ${BRAND_GREEN}44` } : {}}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <p className="text-center text-xs text-blue-200/60 pt-1">Este bot trabaja 24/7 sin que nadie lo atienda</p>
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-4 -right-4 bg-white rounded-xl px-4 py-2.5 shadow-xl flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#dcfce7" }}>
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Nuevo lead calificado</p>
                <p className="text-xs text-gray-500">Ferrería San Martín · ahora</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logo bar */}
      <section className="border-b border-gray-100 py-5 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-8">
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Usado por PyMEs de:</span>
          {LOGOS.map((l) => (
            <span key={l} className="text-sm font-semibold text-gray-500">{l}</span>
          ))}
        </div>
      </section>

      {/* Stats — with colored accents */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Resultados reales para PyMEs</h2>
            <p className="mt-3 text-gray-500 text-base">Lo que lograron nuestros clientes en el primer mes.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {STATS.map((s, i) => (
              <div key={s.value} className="relative rounded-2xl p-8 text-center overflow-hidden" style={{ background: i === 0 ? "#f0f9f4" : i === 1 ? "#eff6ff" : "#faf5ff" }}>
                <div className="text-5xl font-black mb-2" style={{ color: i === 0 ? BRAND_GREEN : i === 1 ? BRAND_BLUE : "#7c3aed" }}>{s.value}</div>
                <p className="text-gray-600 text-sm leading-relaxed">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features — top-accent cards */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Todo lo que tu PyME necesita</h2>
            <p className="mt-3 text-gray-500 max-w-2xl mx-auto">Una plataforma unificada para automatizar la atención, gestionar ventas y tomar decisiones con datos.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all group overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: f.color }} />
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 text-white mt-1" style={{ background: f.accent }}>
                  <span style={{ color: f.color }}>{f.icon}</span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-[#2467a2] transition-colors">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: BRAND_GREEN }}>Así funciona</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">De cero a automatizado en una semana</h2>
            <p className="mt-3 text-gray-500">Sin IT, sin desarrolladores, sin complicaciones.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-7 left-[20%] right-[20%] h-px" style={{ background: "linear-gradient(to right, #2467a233, #2467a2, #2467a233)" }} />
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="text-center space-y-4 relative">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto text-xl font-black text-white relative z-10 shadow-lg" style={{ background: BRAND_BLUE }}>
                  {step.step}
                </div>
                <h3 className="text-base font-bold text-gray-900">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-14">
            <button className="px-8 py-3.5 rounded-xl font-bold text-sm text-white flex items-center gap-2 mx-auto hover:opacity-90 transition-all shadow-md" style={{ background: BRAND_BLUE }}>
              Empezar ahora <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* AFIP section */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 text-sm font-semibold text-blue-700">
              <BadgeCheck className="w-4 h-4" /> Integrado con AFIP
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Facturación electrónica sin salir del CRM</h2>
            <p className="text-gray-500 leading-relaxed">Emitís facturas A, B y C directamente desde Clientum, conectado en tiempo real con los servicios de AFIP. Sin doble carga, sin errores, sin papeles.</p>
            <ul className="space-y-2.5">
              {[
                { icon: <FileText className="w-4 h-4" />, text: "Facturas A, B y C con CAE al instante" },
                { icon: <Receipt className="w-4 h-4" />, text: "Notas de crédito y débito automáticas" },
                { icon: <RefreshCw className="w-4 h-4" />, text: "Sincronización directa con AFIP (sin intermediarios)" },
                { icon: <BadgeCheck className="w-4 h-4" />, text: "Envío automático al cliente por email" },
                { icon: <BarChart3 className="w-4 h-4" />, text: "Reportes de IVA y retenciones listos para contador" },
                { icon: <CheckCircle2 className="w-4 h-4" />, text: "Compatible con monotributistas y responsables inscriptos" },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-3 text-sm text-gray-700">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 text-blue-600">{item.icon}</span>
                  {item.text}
                </li>
              ))}
            </ul>
            <button className="px-6 py-3 rounded-xl font-semibold text-sm text-white flex items-center gap-2 hover:opacity-90 transition-all" style={{ background: BRAND_BLUE }}>
              Ver planes con AFIP <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between" style={{ background: BRAND_BLUE }}>
              <div className="text-white">
                <p className="text-xs text-blue-200 uppercase tracking-wide font-medium">Factura B</p>
                <p className="text-xl font-bold">N° 0001-00004821</p>
              </div>
              <span className="bg-green-400 text-green-900 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                <BadgeCheck className="w-3.5 h-3.5" /> CAE emitido
              </span>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Cliente</p>
                  <p className="font-semibold text-gray-900">Ferrería San Martín</p>
                  <p className="text-gray-400 text-xs">CUIT: 20-12345678-9</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Fecha</p>
                  <p className="font-semibold text-gray-900">26/06/2026</p>
                  <p className="text-gray-400 text-xs">Vence: 26/07/2026</p>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-2">
                {[
                  { desc: "Servicio Clientum Pro — junio 2026", price: "$59.990" },
                  { desc: "Chatbot WhatsApp adicional (2da línea)", price: "$15.000" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <p className="text-gray-700 font-medium">{item.desc}</p>
                    <p className="font-semibold text-gray-900">{item.price}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>$74.990</span></div>
                <div className="flex justify-between text-gray-400"><span>IVA 21%</span><span>$15.748</span></div>
                <div className="flex justify-between font-bold text-gray-900 text-base pt-1"><span>Total</span><span>$90.738</span></div>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex items-center gap-2 text-xs text-green-700">
                <BadgeCheck className="w-4 h-4 shrink-0 text-green-500" />
                CAE N° 74231890541236 · Vence 06/07/2026 · Emitido por AFIP
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials — light */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Lo que dicen nuestros clientes</h2>
            <p className="mt-3 text-gray-500">PyMEs reales con resultados reales</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-gray-50 border border-gray-100 rounded-2xl p-7 space-y-4 hover:shadow-sm transition-all">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-1">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: BRAND_BLUE }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6" style={{ background: "linear-gradient(150deg, #071e3d 0%, #1a4175 50%, #2467a2 100%)" }}>
        <div className="max-w-3xl mx-auto text-center space-y-6 text-white">
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-sm text-blue-100">
            <MessageCircle className="w-4 h-4" style={{ color: BRAND_GREEN }} />
            Sin código · Sin IT · Sin complicaciones
          </span>
          <h2 className="text-4xl font-extrabold tracking-tight">¿Listo para automatizar tu PyME?</h2>
          <p className="text-blue-100/80 text-lg">14 días gratis. Sin tarjeta de crédito. Operativo en una semana.</p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <button className="px-8 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all hover:brightness-105" style={{ background: BRAND_GREEN, color: "#fff" }}>
              Probar gratis <ArrowRight className="w-4 h-4" />
            </button>
            <button className="px-8 py-3.5 rounded-xl font-semibold text-sm border border-white/25 text-white hover:bg-white/10 transition-all">
              Hablar con un experto
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
