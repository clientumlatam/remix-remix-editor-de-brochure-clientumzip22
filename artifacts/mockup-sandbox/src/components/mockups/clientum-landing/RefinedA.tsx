import './_group.css';
import { useState } from 'react';
import {
  Sparkles, ArrowRight, Check, Bot, Briefcase, BarChart2,
  Zap, LayoutGrid, Code2, Star, ChevronRight, Menu, X,
  MessageSquare, Shield, Clock, Users
} from 'lucide-react';

const NAV_LINKS = ['Soluciones', 'Precios', 'Academia', 'Nosotros'];

const STATS = [
  { value: '+200', label: 'PyMEs implementadas' },
  { value: '5 días', label: 'Tiempo de implementación' },
  { value: '24/7', label: 'Soporte en español' },
  { value: '2.147+', label: 'Servicios en catálogo' },
];

const FEATURES = [
  { icon: Bot,        color: 'bg-green-50 text-green-600',    title: 'Chatbot WhatsApp IA',   desc: 'Atiende, agenda y califica leads automáticamente las 24 h sin intervención humana.' },
  { icon: Briefcase,  color: 'bg-blue-50 text-blue-600',      title: 'CRM con Pipeline',      desc: 'Drag & drop visual, seguimiento automático y facturación AFIP integrada.' },
  { icon: Sparkles,   color: 'bg-violet-50 text-violet-600',  title: 'Asistente IA',          desc: 'Preguntale sobre tus ventas, clientes o stock y obtené la respuesta al instante.' },
  { icon: BarChart2,  color: 'bg-orange-50 text-orange-600',  title: 'Reportes Automáticos',  desc: 'Dashboards en tiempo real para decisiones basadas en datos reales de tu empresa.' },
  { icon: Zap,        color: 'bg-amber-50 text-amber-600',    title: 'Automatización',        desc: 'Flujos que procesan pedidos, cobros y notificaciones sin intervención manual.' },
  { icon: Code2,      color: 'bg-slate-100 text-slate-700',   title: 'E-Commerce & Web',      desc: 'Tiendas online conectadas al CRM con stock en tiempo real y pasarela de pago.' },
];

const HOW = [
  { n: '01', title: 'Diagnóstico en 48 h',   desc: 'Auditamos tus procesos actuales e identificamos los cuellos de botella más costosos.' },
  { n: '02', title: 'Implementación en 5 días', desc: 'Configuramos tu CRM, chatbot y automatizaciones sin interrumpir tu operación.' },
  { n: '03', title: 'Crecés con datos reales', desc: 'Dashboards, alertas y el copiloto IA te ayudan a tomar mejores decisiones cada día.' },
];

const TESTIMONIALS = [
  { text: 'El bot de WhatsApp nos generó 40% más consultas en el primer mes sin contratar a nadie.', author: 'Martín R.', company: 'Distribuidora del Sur', stars: 5 },
  { text: 'En 5 días ya teníamos el CRM funcionando. Los reportes cambiaron cómo tomamos decisiones.', author: 'Laura G.', company: 'Estudio Contable MG', stars: 5 },
  { text: 'Integramos WhatsApp, AFIP y nuestro stock en un solo sistema. Increíble el soporte.', author: 'Diego F.', company: 'Ferretería Central', stars: 5 },
];

export function RefinedA() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', email: '', empresa: '', servicio: 'CRM + Chatbot' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="clientum-landing min-h-screen bg-white text-slate-900 antialiased">

      {/* ── STICKY NAV ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#1A3461] rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 180 180" fill="none">
                <rect width="180" height="180" rx="36" fill="#1A3461"/>
                <path d="M40 90 L90 40 L140 90 L90 140 Z" fill="#34d399" opacity="0.9"/>
                <circle cx="90" cy="90" r="22" fill="white"/>
              </svg>
            </div>
            <span className="font-display font-bold text-base text-[#1A3461] tracking-tight">Clientum</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(l => (
              <a key={l} href="#" className="text-sm font-medium text-slate-600 hover:text-[#1A3461] transition-colors">{l}</a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-slate-900">Ingresar</a>
            <a href="#demo" className="bg-[#1A3461] hover:bg-[#0d1f3c] text-white text-xs font-bold px-4 py-2 rounded-lg transition-all">
              Demo Gratuita
            </a>
          </div>

          <button className="md:hidden text-slate-600" onClick={() => setMobileOpen(v => !v)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 px-6 py-4 flex flex-col gap-4 bg-white">
            {NAV_LINKS.map(l => <a key={l} href="#" className="text-sm font-medium text-slate-600">{l}</a>)}
            <a href="#demo" className="bg-[#1A3461] text-white text-xs font-bold px-4 py-2.5 rounded-lg text-center mt-1">
              Demo Gratuita
            </a>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-[#0d1f3c] to-[#1A3461] text-white pt-24 pb-0 px-6">
        {/* grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
        {/* glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center flex flex-col items-center gap-6 z-10">
          <span className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full font-mono">
            <Sparkles className="w-3.5 h-3.5" /> Plataforma All-in-One para PyMEs
          </span>

          <h1 className="text-5xl md:text-6xl font-display font-black tracking-tight leading-[1.05]">
            Todo lo que tu empresa<br />
            necesita,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              en una sola plataforma.
            </span>
          </h1>

          <p className="text-slate-300 text-base max-w-2xl leading-relaxed">
            CRM, Chatbot WhatsApp con IA, E-Commerce, ERP y Business Intelligence — el ecosistema completo de Clientum para hacer crecer tu PyME.
          </p>

          <div className="flex flex-wrap gap-3 justify-center mt-2">
            <a href="#demo" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-900/30 flex items-center gap-2">
              Solicitar Demo Gratis <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#soluciones" className="bg-white/10 hover:bg-white/15 text-white font-bold text-sm px-8 py-3.5 rounded-xl border border-white/15 transition-all">
              Ver Soluciones
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-2">
            {['Sin tarjeta de crédito', 'Implementación en 5 días', 'Soporte en español'].map(t => (
              <span key={t} className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />{t}
              </span>
            ))}
          </div>

          {/* Product screenshot */}
          <div className="mt-10 relative w-full max-w-3xl">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-2xl blur-xl" />
            <div className="relative bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
              {/* Browser chrome */}
              <div className="flex items-center gap-1.5 px-4 py-3 bg-slate-800 border-b border-slate-700">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                <div className="flex-1 mx-4 bg-slate-700 rounded-md h-5 text-slate-400 text-[10px] flex items-center px-3 font-mono">
                  app.clientum.com.ar/pipeline
                </div>
              </div>
              <div className="flex h-72">
                {/* Sidebar */}
                <div className="w-44 bg-white border-r border-slate-200 overflow-hidden flex-shrink-0">
                  <img src="/sidebar-preview.png" alt="Clientum sidebar" className="w-full object-cover object-top" />
                </div>
                {/* Main content mockup */}
                <div className="flex-1 bg-slate-50 p-4 flex flex-col gap-3">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Pipeline Total', val: '$4.2M', c: 'text-[#1A3461]' },
                      { label: 'Clientes Activos', val: '142', c: 'text-emerald-600' },
                      { label: 'Tasa de Cierre', val: '68%', c: 'text-violet-600' },
                    ].map(m => (
                      <div key={m.label} className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                        <div className={`text-xl font-extrabold font-mono ${m.c}`}>{m.val}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{m.label}</div>
                      </div>
                    ))}
                  </div>
                  {/* Kanban strip */}
                  <div className="flex gap-2 flex-1">
                    {['Leads', 'Calificando', 'Propuesta', 'Cerrado'].map((col, ci) => (
                      <div key={col} className="flex-1 bg-white rounded-lg border border-slate-200 p-2">
                        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">{col}</div>
                        {[...Array(ci < 2 ? 2 : 1)].map((_, i) => (
                          <div key={i} className="bg-slate-50 border border-slate-100 rounded p-1.5 mb-1.5">
                            <div className="h-1.5 bg-slate-200 rounded w-3/4 mb-1" />
                            <div className="h-1.5 bg-slate-100 rounded w-1/2" />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="bg-[#1A3461] text-white py-10 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map(s => (
            <div key={s.label}>
              <div className="text-3xl font-extrabold font-mono text-emerald-400">{s.value}</div>
              <div className="text-xs text-blue-200 mt-1 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="soluciones" className="bg-white py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-emerald-600 font-mono text-[10px] uppercase font-bold tracking-widest">Plataforma Completa</span>
            <h2 className="text-3xl font-display font-black tracking-tight mt-2">Todo en un solo lugar</h2>
            <p className="text-slate-500 text-sm mt-2 max-w-xl mx-auto">Cada herramienta diseñada para conectarse entre sí y multiplicar el impacto en tu PyME.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className="group border border-slate-200 hover:border-slate-300 hover:shadow-md rounded-2xl p-6 transition-all bg-white">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${f.color} mb-4`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 mb-2">{f.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                <span className="mt-4 flex items-center gap-1 text-xs font-bold text-[#1A3461] group-hover:gap-2 transition-all">
                  Saber más <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-slate-50 py-24 px-6 border-y border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[#1A3461] font-mono text-[10px] uppercase font-bold tracking-widest">Proceso</span>
            <h2 className="text-3xl font-display font-black tracking-tight mt-2">Implementado en 5 días hábiles</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW.map((h, i) => (
              <div key={h.n} className="relative">
                {i < HOW.length - 1 && (
                  <div className="hidden md:block absolute top-5 left-full w-full h-px bg-slate-200 z-0" style={{ width: 'calc(100% - 2rem)', left: '100%' }} />
                )}
                <div className="relative z-10 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <div className="w-10 h-10 bg-[#1A3461] text-white rounded-xl flex items-center justify-center font-mono font-bold text-sm mb-4">{h.n}</div>
                  <h3 className="font-bold text-sm text-slate-900 mb-2">{h.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{h.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-emerald-600 font-mono text-[10px] uppercase font-bold tracking-widest">Casos Reales</span>
            <h2 className="text-3xl font-display font-black tracking-tight mt-2">PyMEs que ya crecen con Clientum</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex gap-0.5">
                  {[...Array(t.stars)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed flex-1">"{t.text}"</p>
                <div>
                  <div className="font-bold text-xs text-slate-900">{t.author}</div>
                  <div className="text-[11px] text-slate-500">{t.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="bg-slate-900 text-white py-24 px-6" id="precios">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-emerald-400 font-mono text-[10px] uppercase font-bold tracking-widest">Licencias</span>
            <h2 className="text-3xl font-display font-black tracking-tight mt-2">Elegí tu plan</h2>
            <p className="text-slate-400 text-sm mt-2">Sin costos de setup. Sin contratos largos.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Personal */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 flex flex-col">
              <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest font-mono">Uso Individual</span>
              <h3 className="text-xl font-bold mt-2">Licencia Personal</h3>
              <div className="flex items-baseline gap-1 mt-4">
                <span className="text-4xl font-extrabold font-mono">$69</span>
                <span className="text-slate-400 text-sm uppercase">USD</span>
              </div>
              <ul className="mt-6 flex flex-col gap-3 flex-1">
                {['Un sitio activo para tu cliente', 'Soporte por email 6 meses', 'Actualizaciones del core sin cargo', 'Garantía de devolución 30 días'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />{item}
                  </li>
                ))}
              </ul>
              <button className="mt-8 w-full bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs uppercase py-3 rounded-xl tracking-wider transition-all">
                Comprar Licencia
              </button>
            </div>
            {/* Extended */}
            <div className="bg-gradient-to-br from-[#1A3461] to-[#0d1f3c] border border-blue-800 rounded-2xl p-8 flex flex-col relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-amber-500 text-slate-950 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">Popular</div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-mono">Agencias & SaaS</span>
              <h3 className="text-xl font-bold mt-2">Licencia Extendida</h3>
              <div className="flex items-baseline gap-1 mt-4">
                <span className="text-4xl font-extrabold font-mono">$2,950</span>
                <span className="text-slate-400 text-sm uppercase">USD</span>
              </div>
              <ul className="mt-6 flex flex-col gap-3 flex-1">
                {['Clientes ilimitados', 'Soporte prioritario 24/7 × 12 meses', 'Repositorio privado GitHub', 'Contrato SLA e integraciones ad-hoc'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />{item}
                  </li>
                ))}
              </ul>
              <button className="mt-8 w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase py-3 rounded-xl tracking-wider transition-all">
                Adquirir Ilimitada
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── DEMO FORM ── */}
      <section id="demo" className="bg-white py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-emerald-600 font-mono text-[10px] uppercase font-bold tracking-widest">Empezá hoy</span>
            <h2 className="text-3xl font-display font-black tracking-tight mt-2">Solicitá tu Demo Gratuita</h2>
            <p className="text-slate-500 text-sm mt-2">Te respondemos en menos de 24 horas hábiles.</p>
          </div>
          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-10 text-center">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-1">¡Recibimos tu solicitud!</h3>
              <p className="text-sm text-slate-500">Un asesor de Clientum te contactará antes de las próximas 24 horas hábiles.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-2xl p-8 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Tu nombre *</label>
                  <input required value={formData.nombre} onChange={e => setFormData(p => ({...p, nombre: e.target.value}))}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1A3461] bg-white" placeholder="Martín Rodríguez" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Email *</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData(p => ({...p, email: e.target.value}))}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1A3461] bg-white" placeholder="martin@empresa.com" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Empresa</label>
                  <input value={formData.empresa} onChange={e => setFormData(p => ({...p, empresa: e.target.value}))}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1A3461] bg-white" placeholder="Distribuidora Sur" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Servicio de interés</label>
                  <select value={formData.servicio} onChange={e => setFormData(p => ({...p, servicio: e.target.value}))}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1A3461] bg-white">
                    <option>CRM + Chatbot</option>
                    <option>E-Commerce</option>
                    <option>ERP & Automatización</option>
                    <option>Ciberseguridad</option>
                    <option>Consultoría General</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="mt-2 w-full bg-[#1A3461] hover:bg-[#0d1f3c] text-white font-black text-xs uppercase py-3.5 rounded-xl tracking-wider transition-all flex items-center justify-center gap-2">
                Solicitar Demo Gratis <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-950 text-slate-400 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#1A3461] rounded-lg flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 180 180" fill="none">
                <rect width="180" height="180" rx="36" fill="#1A3461"/>
                <path d="M40 90 L90 40 L140 90 L90 140 Z" fill="#34d399" opacity="0.9"/>
                <circle cx="90" cy="90" r="22" fill="white"/>
              </svg>
            </div>
            <span className="font-display font-bold text-white text-sm">Clientum</span>
          </div>
          <p className="text-xs">© 2026 Clientum. General Roca, Río Negro, Argentina. info@clientum.com.ar</p>
          <div className="flex gap-4 text-xs">
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Términos</a>
            <a href="#" className="hover:text-white transition-colors">Soporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
