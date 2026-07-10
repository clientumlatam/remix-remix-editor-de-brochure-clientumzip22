import './_group.css';
import { Sparkles, ArrowRight, ArrowUpRight, CheckCircle2, Compass, Users, Check } from 'lucide-react';

// Extracted baseline of the real "Inicio" tab from src/components/PublicWebsite.tsx.
// This is the exact structure/content currently live in the app — used as the
// reference point for refined variants, not a hand-approximation.
export function Current() {
  return (
    <div className="clientum-landing min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-slate-900 text-white py-24 px-6 md:px-12 flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#0d1f3c] via-slate-900 to-[#122442] opacity-90" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 z-0" />
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7 flex flex-col items-start gap-6">
            <span className="bg-[#1A3461]/80 text-blue-200 border border-blue-800/50 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-widest flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Plataforma de Crecimiento Comercial
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight leading-tight">
              Todo lo que tu empresa necesita, en una sola plataforma.
            </h1>
            <p className="text-slate-300 text-sm md:text-base max-w-xl leading-relaxed">
              CRM, Chatbot WhatsApp con IA, E-Commerce, ERP, Business Intelligence, Marketing Digital, Ciberseguridad, Cloud, Apps Móviles y Capacitación — el ecosistema completo de Clientum para hacer crecer tu PyME.
            </p>
            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
              <button className="bg-gradient-to-r from-[#1A3461] to-[#254f8f] text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-lg cursor-pointer transition-all shadow-md shadow-blue-900/30 flex items-center gap-2">
                Conoce Servicios
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </button>
              <button className="bg-slate-800/80 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-lg border border-slate-700 transition-all cursor-pointer">
                Solicitar Demo
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800 p-8 rounded-2xl shadow-2xl relative">
            <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3 bg-emerald-500 text-slate-950 text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-md shadow-md font-mono">
              En Vivo
            </div>
            <h3 className="font-display font-bold text-lg text-white mb-1">Solicitá un Presupuesto Gratuito</h3>
            <p className="text-slate-400 text-[11px] mb-6">Cargá tus datos y el equipo de Clientum te enviará una demo adaptada a tu escala.</p>
            <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Tu Nombre</label>
                <input type="text" placeholder="Ej. Martín Rodríguez" className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-2.5 text-xs focus:border-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Correo Electrónico</label>
                <input type="email" placeholder="Ej. martin@empresa.com" className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-2.5 text-xs focus:border-blue-600 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Empresa</label>
                  <input type="text" placeholder="Ej. Distribuidora Sur" className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-2.5 text-xs focus:border-blue-600 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Servicio de Interés</label>
                  <select className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-2.5 text-xs focus:border-blue-600 focus:outline-none">
                    <option>E-Commerce Web</option>
                    <option>ERP &amp; CRM Integrado</option>
                    <option>Consultoría General</option>
                    <option>Ciberseguridad</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="mt-2 w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-2.5 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer">
                Enviar Solicitud
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="max-w-7xl mx-auto w-full px-6 -mt-20 z-20 relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { t: 'CRM + Chatbot IA + Facturación (Plan Pro)', d: 'La base de la plataforma Clientum: chatbot de WhatsApp ilimitado, CRM con pipeline visual, asistente de IA y facturación AFIP integrada, todo en un solo abono.', bg: 'bg-emerald-50 text-emerald-800' },
            { t: 'Desarrollo Web & E-Commerce', d: 'Tiendas online y sitios de alto rendimiento con pasarela de pago, sincronización de stock y diseño UX/UI premium, integrados directamente al CRM.', bg: 'bg-rose-50 text-rose-600' },
            { t: 'Implementación de ERP y Automatización', d: 'Conectamos tu ERP, e-commerce y sistemas de stock en tiempo real, automatizando flujos repetitivos y liquidaciones sin intervención manual.', bg: 'bg-indigo-50 text-indigo-600' },
          ].map((s, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center font-bold text-xl mb-4 shadow-inner`}>0{idx + 1}</div>
                <h3 className="font-bold text-base text-slate-900 tracking-tight mb-2">{s.t}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.d}</p>
              </div>
              <button className="text-[#1A3461] hover:text-[#122442] text-xs font-bold flex items-center gap-1 mt-4 self-start cursor-pointer">Explorar {s.t} →</button>
            </div>
          ))}
        </div>
      </section>

      {/* Metrics */}
      <section className="bg-white border-y border-slate-200 mt-20 py-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl font-display font-black text-slate-900 tracking-tight">Nuestras Métricas Hablan por Nosotros</h2>
          <p className="text-slate-500 text-xs max-w-xl mx-auto mt-2">Confiamos en la excelencia técnica para generar un impacto directo y cuantificable en tu organización.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-12">
            {[
              { v: '+30%', c: 'text-[#1A3461]', t: 'Eficiencia Operativa', d: 'Aumento en velocidad de despacho e inventariado continuo.' },
              { v: '+40%', c: 'text-emerald-600', t: 'Satisfacción Cliente', d: 'Mejora en tiempos de respuesta de consultas comerciales.' },
              { v: '-25%', c: 'text-indigo-600', t: 'Costos Administrativos', d: 'Reducción de horas de carga manual de Excel gracias a automatizaciones.' },
            ].map((m, i) => (
              <div key={i} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center">
                <span className={`text-4xl font-extrabold font-mono tracking-tight ${m.c}`}>{m.v}</span>
                <h4 className="font-bold text-slate-900 text-xs mt-3 uppercase tracking-wider">{m.t}</h4>
                <p className="text-[11px] text-slate-500 mt-1">{m.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info blocks */}
      <section className="max-w-6xl mx-auto px-6 py-20 flex flex-col gap-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-emerald-600 font-mono text-[10px] uppercase font-bold tracking-widest">Enfoque de Negocios</span>
            <h2 className="text-2xl font-display font-black text-slate-900 tracking-tight mt-2 leading-snug">Enfócate en lo estratégico, nosotros automatizamos el resto</h2>
            <p className="text-xs text-slate-500 mt-4 leading-relaxed">Olvídate de perseguir cobros, actualizar stocks en tres planillas distintas y procesar pedidos manuales. Conectamos tus bases con sistemas automáticos para que tu equipo rinda al máximo.</p>
            <button className="mt-6 bg-slate-900 hover:bg-[#1A3461] text-white font-bold text-xs px-5 py-2.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer">
              Ver Herramientas E-commerce
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>
          <div className="bg-slate-200 rounded-2xl h-64 overflow-hidden relative border border-slate-300 shadow-md">
            <img src="https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=800&q=80" alt="Clientum workflow" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="md:order-2">
            <span className="text-emerald-600 font-mono text-[10px] uppercase font-bold tracking-widest">Medición &amp; BI</span>
            <h2 className="text-2xl font-display font-black text-slate-900 tracking-tight mt-2 leading-snug">Medir es conocer: Inteligencia de Negocios accionable</h2>
            <p className="text-xs text-slate-500 mt-4 leading-relaxed">Nuestras implementaciones ERP te brindan dashboards limpios en tiempo real. Visualizá qué productos te generan mejor margen de ganancia, cuál es el costo real de tus adquisiciones y dónde hay cuellos de botella.</p>
            <button className="mt-6 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold text-xs px-5 py-2.5 rounded-lg transition-all cursor-pointer">Ver Planes de Implementación</button>
          </div>
          <div className="md:order-1 bg-slate-200 rounded-2xl h-64 overflow-hidden relative border border-slate-300 shadow-md">
            <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80" alt="BI dashboards" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Culture */}
      <section className="bg-slate-900 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-display font-black tracking-tight">Nuestra Cultura Corporativa</h2>
            <p className="text-slate-400 text-xs mt-2">Los tres pilares esenciales bajo los cuales construimos código y forjamos relaciones duraderas.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { Icon: CheckCircle2, c: 'bg-blue-900/40 text-blue-400', t: 'Lealtad', d: 'Comprometidos a largo plazo con el éxito de nuestros clientes. Tu infraestructura tecnológica y tus secretos comerciales están seguros con nosotros.' },
              { Icon: Compass, c: 'bg-indigo-900/40 text-indigo-400', t: 'Versatilidad', d: 'Ofrecemos soluciones sumamente personalizables. Nos adaptamos a diferentes industrias, escalas de facturación y requerimientos reglamentarios AFIP.' },
              { Icon: Users, c: 'bg-emerald-900/40 text-emerald-400', t: 'Personalidad', d: 'No somos un robot empaquetador. Nos encanta sentarnos a tomar mate o coordinar videollamadas, prestando atención humana y detallista a cada lead.' },
            ].map((v, i) => (
              <div key={i} className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
                <div className={`w-10 h-10 ${v.c} rounded-full flex items-center justify-center mb-4`}>
                  <v.Icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm tracking-tight text-white mb-2">{v.t}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-slate-100 py-20 px-6 border-t border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-display font-black text-slate-900 tracking-tight">Licencias de Software</h2>
            <p className="text-slate-500 text-xs mt-1">Si buscás comprar el código base propietario para tu propio hosting e integraciones permanentes.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-md flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#1A3461] uppercase tracking-widest font-mono">Uso Individual</span>
                <h3 className="text-lg font-bold text-slate-950 mt-1">Licencia Personal</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-950 font-mono">$69</span>
                  <span className="text-xs text-slate-400 font-semibold uppercase">USD</span>
                </div>
                <ul className="mt-6 flex flex-col gap-2.5 text-xs text-slate-500">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Un solo sitio web activo para tu cliente</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Soporte amigable por 6 meses vía email</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Actualizaciones futuras del core sin cargo</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Garantía de devolución de 30 días</li>
                </ul>
              </div>
              <button className="mt-8 w-full bg-[#1A3461] hover:bg-[#0d1f3c] text-white font-bold text-xs uppercase py-2.5 rounded-lg tracking-wider transition-all">Comprar Licencia</button>
            </div>
            <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-8 shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 transform translate-x-8 translate-y-2 rotate-45 bg-amber-500 text-slate-950 text-[8px] font-bold uppercase tracking-widest py-1 px-8 text-center">Ilimitado</div>
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-mono">Agencias &amp; SaaS</span>
                <h3 className="text-lg font-bold text-white mt-1">Licencia Extendida</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white font-mono">$2,950</span>
                  <span className="text-xs text-slate-400 font-semibold uppercase">USD</span>
                </div>
                <ul className="mt-6 flex flex-col gap-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Múltiples sitios para ilimitados clientes</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Soporte prioritario 24/7 por 12 meses</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Acceso al repositorio privado de GitHub</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Contrato de SLA e integraciones ad-hoc</li>
                </ul>
              </div>
              <button className="mt-8 w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase py-2.5 rounded-lg tracking-wider transition-all">Adquirir Ilimitada</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
