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
  ChevronRight,
} from "lucide-react";

const BRAND_BLUE = "#2467a2";
const BRAND_GREEN = "#25d366";
const DARK_BG = "#060f1e";
const DARK_CARD = "#0d1f35";
const DARK_BORDER = "#1e3452";

const STATS = [
  { value: "24/7", label: "Atención automática", sub: "sin pausas ni fines de semana" },
  { value: "1 semana", label: "Tiempo de implementación", sub: "de contratado a operativo" },
  { value: "+60%", label: "Más consultas respondidas", sub: "sin intervención humana" },
];

const FEATURES = [
  { icon: <MessageCircle className="w-5 h-5" />, color: BRAND_GREEN, title: "Chatbot WhatsApp 24/7", desc: "Tu negocio responde solo. El chatbot atiende consultas, agenda citas y califica leads sin que toques nada." },
  { icon: <Users className="w-5 h-5" />, color: "#60a5fa", title: "CRM Inteligente", desc: "Todos tus contactos, leads y deals en un solo lugar. Pipeline visual para nunca perder una venta." },
  { icon: <Bot className="w-5 h-5" />, color: "#a78bfa", title: "Asistente IA", desc: "Preguntale al asistente sobre tu pipeline, leads de la semana o rendimiento. Responde al instante." },
  { icon: <BarChart3 className="w-5 h-5" />, color: "#fb923c", title: "Reportes Automáticos", desc: "Reportes de ventas, actividad y conversión generados automáticamente. Datos reales, no intuición." },
  { icon: <Zap className="w-5 h-5" />, color: "#fbbf24", title: "Automatización", desc: "Flujos automáticos para seguimientos, recordatorios de pago y notificaciones. Más con menos esfuerzo." },
  { icon: <Globe className="w-5 h-5" />, color: "#22d3ee", title: "Portal del Cliente", desc: "Tus clientes ven sus facturas, deals y estado de servicio desde un portal propio. Más profesionalismo." },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Conectás tu WhatsApp", desc: "En minutos conectamos tu línea de WhatsApp Business. Sin configuraciones técnicas complicadas." },
  { step: "02", title: "Configuramos tu IA", desc: "Definimos las respuestas, el tono de tu negocio y los flujos. Te ayudamos nosotros, sin código." },
  { step: "03", title: "Empezás a vender solo", desc: "Tu chatbot atiende, el CRM registra y vos revisás el dashboard. Operativo en menos de una semana." },
];

const TESTIMONIALS = [
  { name: "Martín R.", company: "Distribuidora del Sur", text: "Antes perdíamos clientes por no responder a tiempo. Ahora el chatbot responde solo y el equipo se enfoca en cerrar ventas." },
  { name: "Laura G.", company: "Estética Lumière", text: "El bot agenda turnos solo. Pasamos de 20 consultas de WhatsApp por día a más de 80, sin contratar personal." },
  { name: "Diego P.", company: "Tech Retail BA", text: "El CRM integrado con WhatsApp y la facturación nos cambió la vida. En una semana ya estábamos funcionando." },
];

const LOGOS = ["Distribuidora del Sur", "Lumière Estética", "Tech Retail BA", "Agro San Luis", "Taller Norte", "Moda PyME"];

export function VariantB() {
  return (
    <div className="min-h-screen font-sans" style={{ background: DARK_BG, color: "#e2eaf5" }}>
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b" style={{ background: `${DARK_BG}ee`, borderColor: DARK_BORDER, backdropFilter: "blur(12px)" }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: BRAND_BLUE }}>
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg">Clientum</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: "#94b3d1" }}>
            <a href="#" className="hover:text-white transition-colors">Inicio</a>
            <a href="#" className="hover:text-white transition-colors">Funciones</a>
            <a href="#" className="hover:text-white transition-colors">Precios</a>
            <a href="#" className="hover:text-white transition-colors">Blog</a>
          </nav>
          <div className="flex items-center gap-3">
            <button className="hidden md:block text-sm font-medium px-3 py-2 transition-colors hover:text-white" style={{ color: "#94b3d1" }}>Iniciar sesión</button>
            <button className="text-sm font-bold px-4 py-2 rounded-lg text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}>
              Probar gratis
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: DARK_BG }}>
        {/* Glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-[0.12] blur-[120px]" style={{ background: BRAND_BLUE }} />
        <div className="absolute top-20 right-0 w-[400px] h-[400px] rounded-full opacity-[0.07] blur-[80px]" style={{ background: BRAND_GREEN }} />

        <div className="relative max-w-7xl mx-auto px-6 py-32 lg:py-36 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm w-fit border" style={{ background: `${BRAND_GREEN}14`, borderColor: `${BRAND_GREEN}30`, color: BRAND_GREEN }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              IA para PyMEs argentinas
            </div>
            <h1 className="text-5xl xl:text-[3.75rem] font-extrabold leading-[1.06] tracking-tight text-white">
              Atención al cliente{" "}
              <span style={{ color: BRAND_GREEN }}>24/7</span>
              {" "}sin contratar personal
            </h1>
            <p className="text-lg leading-relaxed max-w-lg" style={{ color: "#7fa8c9" }}>
              Clientum automatiza tu PyME con IA: chatbot para WhatsApp, CRM inteligente y reportes automáticos. Sin código, sin IT. Operativo en una semana.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                className="px-7 py-3.5 rounded-xl font-bold text-sm text-white flex items-center gap-2 hover:brightness-110 transition-all"
                style={{ background: BRAND_GREEN, boxShadow: `0 0 32px ${BRAND_GREEN}44` }}
              >
                Probar 14 días gratis <ArrowRight className="w-4 h-4" />
              </button>
              <button
                className="px-7 py-3.5 rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-white/5 transition-all border"
                style={{ borderColor: DARK_BORDER, color: "#94b3d1" }}
              >
                Ver demo <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-6">
              {[
                { icon: <ShieldCheck className="w-4 h-4" />, text: "Sin tarjeta de crédito" },
                { icon: <Clock className="w-4 h-4" />, text: "Operativo en 1 semana" },
                { icon: <CheckCircle2 className="w-4 h-4" />, text: "Sin código ni IT" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 text-sm" style={{ color: "#5a87ad" }}>
                  <span style={{ color: "#2563eb" }}>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          {/* Chat mockup */}
          <div className="relative">
            <div
              className="rounded-2xl p-5 space-y-3 border"
              style={{ background: DARK_CARD, borderColor: DARK_BORDER, boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}
            >
              <div className="flex items-center gap-3 pb-3 border-b" style={{ borderColor: DARK_BORDER }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: BRAND_GREEN }}>
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">Bot de Distribuidora del Sur</p>
                  <p className="text-xs flex items-center gap-1.5" style={{ color: BRAND_GREEN }}>
                    <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: BRAND_GREEN }} />
                    En línea · Responde al instante
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
                    className="max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                    style={
                      msg.from === "client"
                        ? { background: "#1e3a5f", color: "#c8dcf0", borderRadius: "16px 4px 16px 16px" }
                        : { background: `${BRAND_GREEN}1a`, border: `1px solid ${BRAND_GREEN}33`, color: "#c8f0d8", borderRadius: "4px 16px 16px 16px" }
                    }
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <p className="text-center text-xs pt-1" style={{ color: "#3d6080" }}>Este bot trabaja 24/7 sin que nadie lo atienda</p>
            </div>
            {/* Floating notification */}
            <div className="absolute -bottom-5 -right-5 rounded-xl px-4 py-2.5 shadow-2xl flex items-center gap-2.5 border" style={{ background: DARK_CARD, borderColor: DARK_BORDER }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${BRAND_GREEN}20` }}>
                <CheckCircle2 className="w-4 h-4" style={{ color: BRAND_GREEN }} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Nuevo lead calificado</p>
                <p className="text-xs" style={{ color: "#4a7fa0" }}>Ferrería San Martín · ahora</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logo bar */}
      <div className="border-y py-5 px-6" style={{ borderColor: DARK_BORDER }}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-8">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#3d6080" }}>Usado por PyMEs de:</span>
          {LOGOS.map((l) => <span key={l} className="text-sm font-semibold" style={{ color: "#4a7fa0" }}>{l}</span>)}
        </div>
      </div>

      {/* Stats */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">Resultados reales para PyMEs</h2>
            <p className="mt-3" style={{ color: "#5a87ad" }}>Lo que lograron nuestros clientes en el primer mes.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {STATS.map((s, i) => (
              <div key={s.value} className="rounded-2xl p-8 text-center border" style={{ background: DARK_CARD, borderColor: DARK_BORDER }}>
                <div className="text-5xl font-black mb-1" style={{ color: i === 0 ? BRAND_GREEN : i === 1 ? "#60a5fa" : "#a78bfa" }}>{s.value}</div>
                <p className="text-white font-semibold text-sm mb-1">{s.label}</p>
                <p className="text-xs" style={{ color: "#4a7fa0" }}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6" style={{ background: `${DARK_CARD}88` }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Todo lo que tu PyME necesita</h2>
            <p className="mt-3 max-w-2xl mx-auto" style={{ color: "#5a87ad" }}>Una plataforma unificada para automatizar la atención, gestionar ventas y tomar decisiones con datos.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl p-6 border hover:border-opacity-60 transition-all group" style={{ background: DARK_CARD, borderColor: DARK_BORDER }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${f.color}20`, color: f.color }}>
                  {f.icon}
                </div>
                <h3 className="text-sm font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#5a87ad" }}>{f.desc}</p>
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
            <h2 className="text-3xl md:text-4xl font-bold text-white">De cero a automatizado en una semana</h2>
            <p className="mt-3" style={{ color: "#5a87ad" }}>Sin IT, sin desarrolladores, sin complicaciones.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-7 left-[20%] right-[20%] h-px" style={{ background: `linear-gradient(to right, transparent, ${BRAND_BLUE}66, transparent)` }} />
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto text-xl font-black text-white relative z-10 border" style={{ background: "#0e2d52", borderColor: BRAND_BLUE, color: "#60a5fa" }}>
                  {step.step}
                </div>
                <h3 className="text-sm font-bold text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#5a87ad" }}>{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-14">
            <button
              className="px-8 py-3.5 rounded-xl font-bold text-sm text-white flex items-center gap-2 mx-auto hover:opacity-90 transition-all"
              style={{ background: BRAND_BLUE, boxShadow: `0 0 24px ${BRAND_BLUE}55` }}
            >
              Empezar ahora <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* AFIP */}
      <section className="py-24 px-6" style={{ background: `${DARK_CARD}88` }}>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold border" style={{ background: "#0d2a4a", borderColor: "#1e4a7a", color: "#60a5fa" }}>
              <BadgeCheck className="w-4 h-4" /> Integrado con AFIP
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Facturación electrónica sin salir del CRM</h2>
            <p className="leading-relaxed" style={{ color: "#5a87ad" }}>Emitís facturas A, B y C directamente desde Clientum, conectado en tiempo real con los servicios de AFIP. Sin doble carga, sin errores, sin papeles.</p>
            <ul className="space-y-2.5">
              {[
                { icon: <FileText className="w-4 h-4" />, text: "Facturas A, B y C con CAE al instante" },
                { icon: <Receipt className="w-4 h-4" />, text: "Notas de crédito y débito automáticas" },
                { icon: <RefreshCw className="w-4 h-4" />, text: "Sincronización directa con AFIP" },
                { icon: <BadgeCheck className="w-4 h-4" />, text: "Envío automático al cliente por email" },
                { icon: <BarChart3 className="w-4 h-4" />, text: "Reportes de IVA listos para contador" },
                { icon: <CheckCircle2 className="w-4 h-4" />, text: "Compatible con monotributistas e inscriptos" },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-3 text-sm" style={{ color: "#94b3d1" }}>
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#0d2a4a", color: "#60a5fa" }}>{item.icon}</span>
                  {item.text}
                </li>
              ))}
            </ul>
            <button className="px-6 py-3 rounded-xl font-semibold text-sm text-white flex items-center gap-2 hover:opacity-90 transition-all" style={{ background: BRAND_BLUE }}>
              Ver planes con AFIP <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="rounded-2xl border overflow-hidden" style={{ background: DARK_CARD, borderColor: DARK_BORDER }}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ background: "#0a1d33", borderBottom: `1px solid ${DARK_BORDER}` }}>
              <div>
                <p className="text-xs uppercase tracking-wide font-medium mb-1" style={{ color: "#4a7fa0" }}>Factura B</p>
                <p className="text-xl font-bold text-white">N° 0001-00004821</p>
              </div>
              <span className="text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1" style={{ background: `${BRAND_GREEN}20`, color: BRAND_GREEN, border: `1px solid ${BRAND_GREEN}33` }}>
                <BadgeCheck className="w-3.5 h-3.5" /> CAE emitido
              </span>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide mb-1" style={{ color: "#3d6080" }}>Cliente</p>
                  <p className="font-semibold text-white">Ferrería San Martín</p>
                  <p className="text-xs" style={{ color: "#4a7fa0" }}>CUIT: 20-12345678-9</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide mb-1" style={{ color: "#3d6080" }}>Fecha</p>
                  <p className="font-semibold text-white">26/06/2026</p>
                  <p className="text-xs" style={{ color: "#4a7fa0" }}>Vence: 26/07/2026</p>
                </div>
              </div>
              <div className="pt-4 space-y-2" style={{ borderTop: `1px solid ${DARK_BORDER}` }}>
                {[
                  { desc: "Servicio Clientum Pro — junio 2026", price: "$59.990" },
                  { desc: "Chatbot WhatsApp adicional (2da línea)", price: "$15.000" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <p style={{ color: "#94b3d1" }}>{item.desc}</p>
                    <p className="font-semibold text-white">{item.price}</p>
                  </div>
                ))}
              </div>
              <div className="pt-3 space-y-1.5 text-sm" style={{ borderTop: `1px solid ${DARK_BORDER}` }}>
                <div className="flex justify-between" style={{ color: "#4a7fa0" }}><span>Subtotal</span><span>$74.990</span></div>
                <div className="flex justify-between" style={{ color: "#4a7fa0" }}><span>IVA 21%</span><span>$15.748</span></div>
                <div className="flex justify-between font-bold text-white text-base pt-1"><span>Total</span><span>$90.738</span></div>
              </div>
              <div className="rounded-xl p-3 flex items-center gap-2 text-xs border" style={{ background: `${BRAND_GREEN}10`, borderColor: `${BRAND_GREEN}25`, color: BRAND_GREEN }}>
                <BadgeCheck className="w-4 h-4 shrink-0" />
                CAE N° 74231890541236 · Vence 06/07/2026 · Emitido por AFIP
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">Lo que dicen nuestros clientes</h2>
            <p className="mt-3" style={{ color: "#5a87ad" }}>PyMEs reales con resultados reales</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-2xl p-6 space-y-4 border hover:border-blue-800/50 transition-all" style={{ background: DARK_CARD, borderColor: DARK_BORDER }}>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "#94b3d1" }}>"{t.text}"</p>
                <div className="flex items-center gap-3 pt-1">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: BRAND_BLUE }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{t.name}</p>
                    <p className="text-xs" style={{ color: "#4a7fa0" }}>{t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 relative overflow-hidden" style={{ background: "#051628" }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20 blur-[80px]" style={{ background: BRAND_BLUE }} />
        <div className="relative max-w-3xl mx-auto text-center space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm border" style={{ background: `${BRAND_GREEN}12`, borderColor: `${BRAND_GREEN}25`, color: BRAND_GREEN }}>
            <MessageCircle className="w-4 h-4" /> Sin código · Sin IT · Sin complicaciones
          </span>
          <h2 className="text-4xl font-extrabold text-white tracking-tight">¿Listo para automatizar tu PyME?</h2>
          <p className="text-lg" style={{ color: "#5a87ad" }}>14 días gratis. Sin tarjeta de crédito. Operativo en una semana.</p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <button
              className="px-8 py-3.5 rounded-xl font-bold text-sm text-white flex items-center gap-2 hover:brightness-110 transition-all"
              style={{ background: BRAND_GREEN, boxShadow: `0 0 40px ${BRAND_GREEN}44` }}
            >
              Probar gratis <ArrowRight className="w-4 h-4" />
            </button>
            <button
              className="px-8 py-3.5 rounded-xl font-semibold text-sm border hover:bg-white/5 transition-all"
              style={{ borderColor: DARK_BORDER, color: "#94b3d1" }}
            >
              Hablar con un experto
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
