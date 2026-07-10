import './_group.css';
import { useState } from 'react';
import {
  Sparkles, ArrowRight, Check, Bot, Briefcase, BarChart2, Zap,
  Code2, Star, MessageSquare, Shield, Users, ChevronDown,
  Menu, X, ArrowUpRight, LayoutGrid, Target
} from 'lucide-react';

const SOLUTIONS = [
  { icon: Bot,        label: 'Chatbot WhatsApp',  color: 'from-green-400 to-emerald-600',  desc: 'Atención 24/7 con IA en castellano. Califica, agenda y cotiza solo.' },
  { icon: Briefcase,  label: 'CRM Pipeline',       color: 'from-blue-400 to-blue-600',      desc: 'Pipeline visual, seguimiento automático y facturación AFIP integrada.' },
  { icon: Sparkles,   label: 'Copiloto IA',        color: 'from-violet-400 to-purple-600',  desc: 'Analítica conversacional sobre ventas, clientes y stock en tiempo real.' },
  { icon: BarChart2,  label: 'Reportes & BI',      color: 'from-orange-400 to-amber-600',   desc: 'Dashboards ejecutivos actualizados al minuto para decisiones certeras.' },
  { icon: Zap,        label: 'Automatizaciones',   color: 'from-yellow-400 to-orange-500',  desc: 'Flujos que procesan pedidos, cobros y alertas sin intervención manual.' },
  { icon: Code2,      label: 'E-Commerce & Web',   color: 'from-slate-400 to-slate-600',    desc: 'Tiendas online sincronizadas con tu CRM y stock en tiempo real.' },
];

const METRICS = [
  { value: '+200', label: 'PyMEs activas' },
  { value: '40%', label: 'Más consultas vía bot' },
  { value: '5 días', label: 'Implementación' },
  { value: '24/7', label: 'Soporte' },
];

const STEPS = [
  { num: '1', label: 'Diagnóstico',       desc: 'Auditamos tus procesos e identificamos cuellos de botella en 48 h.' },
  { num: '2', label: 'Configuración',     desc: 'CRM, chatbot y automatizaciones listos sin interrumpir tu operación.' },
  { num: '3', label: 'Crecimiento',       desc: 'Dashboards y copiloto IA te guían con datos reales desde el día 1.' },
];

export function RefinedB() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', empresa: '', servicio: 'CRM + Chatbot' });

  return (
    <div className="clientum-landing min-h-screen bg-[#060c18] text-white antialiased">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-3 shadow-xl shadow-black/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 180 180" fill="none">
                <path d="M40 90 L90 40 L140 90 L90 140 Z" fill="white" opacity="0.95"/>
                <circle cx="90" cy="90" r="20" fill="#060c18"/>
              </svg>
            </div>
            <span className="font-display font-bold text-base tracking-tight">Clientum</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {['Soluciones', 'Precios', 'Academia', 'Nosotros'].map(l => (
              <a key={l} href="#" className="text-sm text-slate-300 hover:text-white transition-colors">{l}</a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a href="#" className="text-sm text-slate-400 hover:text-white">Ingresar</a>
            <a href="#contacto" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl transition-all">
              Demo Gratis
            </a>
          </div>

          <button className="md:hidden text-slate-300" onClick={() => setMenuOpen(v => !v)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="mt-2 mx-0 bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 flex flex-col gap-4">
            {['Soluciones', 'Precios', 'Academia', 'Nosotros'].map(l => (
              <a key={l} href="#" className="text-sm text-slate-300">{l}</a>
            ))}
            <a href="#contacto" className="bg-emerald-500 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl text-center">
              Demo Gratis
            </a>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden px-6 pt-32 pb-24">
        {/* BG glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(26,52,97,0.15)_0%,transparent_70%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          {/* Left */}
          <div className="flex flex-col gap-8">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full font-mono w-fit">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Plataforma All-in-One para PyMEs
            </div>

            <div className="flex flex-col gap-4">
              <h1 className="text-5xl md:text-6xl font-display font-black tracking-tight leading-[1.05]">
                Hacé crecer<br />
                tu PyME con<br />
                <span className="relative">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                    IA y datos reales.
                  </span>
                </span>
              </h1>
              <p className="text-slate-400 text-base leading-relaxed max-w-lg">
                CRM, Chatbot WhatsApp con IA, ERP, E-Commerce y Business Intelligence — un ecosistema conectado que automatiza tu operación desde el día 1.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a href="#contacto" className="group bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm px-8 py-4 rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/30">
                Solicitar Demo Gratis
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a href="#soluciones" className="bg-white/5 hover:bg-white/10 text-white font-bold text-sm px-8 py-4 rounded-2xl border border-white/10 transition-all flex items-center gap-2">
                Ver Soluciones <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {['Sin setup costs', '5 días de implementación', 'Soporte en castellano'].map(t => (
                <span key={t} className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right — product card */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-3xl blur-2xl" />
            <div className="relative bg-slate-900/80 border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl backdrop-blur">
              {/* Top bar */}
              <div className="flex items-center gap-1.5 px-5 py-4 border-b border-slate-800 bg-slate-900">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                <div className="ml-3 text-[11px] text-slate-500 font-mono">AI Client Prospector — v2.0 PRO</div>
                <div className="ml-auto bg-emerald-500/20 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full font-mono border border-emerald-500/30">LIVE</div>
              </div>
              <div className="flex h-80">
                {/* Sidebar screenshot */}
                <div className="w-44 bg-white border-r border-slate-700/30 overflow-hidden flex-shrink-0">
                  <img src="/sidebar-preview.png" alt="Clientum sidebar nav" className="w-full h-full object-cover object-top" />
                </div>
                {/* Content area */}
                <div className="flex-1 bg-[#0d1421] p-4 flex flex-col gap-3 overflow-hidden">
                  {/* Quick stats */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Pipeline', val: '$4.2M', delta: '+12%', c: 'text-emerald-400' },
                      { label: 'Leads Nuevos', val: '38', delta: '+8', c: 'text-blue-400' },
                    ].map(m => (
                      <div key={m.label} className="bg-slate-800/60 border border-slate-700/30 rounded-xl p-3">
                        <div className={`text-lg font-extrabold font-mono ${m.c}`}>{m.val}</div>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-[10px] text-slate-500">{m.label}</span>
                          <span className="text-[9px] text-emerald-400 font-bold">{m.delta}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Mini pipeline */}
                  <div className="flex-1 flex flex-col gap-2 min-h-0">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Pipeline activo</div>
                    {[
                      { co: 'Dist. Patagónica', stage: 'Propuesta', amount: '$480k', color: 'bg-violet-500' },
                      { co: 'Ferretería Norte', stage: 'Calificando', amount: '$260k', color: 'bg-blue-500' },
                      { co: 'Estudio Pérez', stage: 'Demo', amount: '$190k', color: 'bg-emerald-500' },
                    ].map(d => (
                      <div key={d.co} className="flex items-center gap-2 bg-slate-800/40 border border-slate-700/20 rounded-lg px-3 py-2">
                        <div className={`w-1.5 h-8 rounded-full ${d.color} shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-bold text-slate-200 truncate">{d.co}</div>
                          <div className="text-[10px] text-slate-500">{d.stage}</div>
                        </div>
                        <div className="text-[11px] font-mono font-bold text-slate-300 shrink-0">{d.amount}</div>
                      </div>
                    ))}
                  </div>
                  {/* AI hint */}
                  <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-violet-300 leading-relaxed">
                      Copiloto IA: <strong>Dist. Patagónica</strong> no respondió en 3 días. Recomiendo enviar el email de seguimiento ahora.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 bg-emerald-500 text-slate-950 text-[11px] font-black px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5" /> Bot activo 24/7
            </div>
            <div className="absolute -bottom-4 -left-4 bg-slate-800 border border-slate-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-orange-400" /> Reportes en tiempo real
            </div>
          </div>
        </div>
      </section>

      {/* ── METRICS ── */}
      <section className="border-y border-slate-800 bg-slate-900/40 py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {METRICS.map(m => (
            <div key={m.label}>
              <div className="text-3xl font-extrabold font-mono text-emerald-400">{m.value}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SOLUTIONS TABS ── */}
      <section id="soluciones" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-emerald-400 font-mono text-[10px] uppercase font-bold tracking-widest">Ecosistema</span>
            <h2 className="text-3xl font-display font-black tracking-tight mt-2">Cada herramienta, perfectamente conectada</h2>
          </div>
          {/* Tab buttons */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {SOLUTIONS.map((s, i) => (
              <button
                key={s.label}
                onClick={() => setActiveTab(i)}
                className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === i
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                }`}
              >
                <s.icon className="w-3.5 h-3.5" />{s.label}
              </button>
            ))}
          </div>
          {/* Tab content */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col md:flex-row gap-8 items-center">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${SOLUTIONS[activeTab].color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
              {(() => { const Icon = SOLUTIONS[activeTab].icon; return <Icon className="w-8 h-8 text-white" />; })()}
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3">{SOLUTIONS[activeTab].label}</h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-lg">{SOLUTIONS[activeTab].desc}</p>
              <a href="#contacto" className="mt-4 inline-flex items-center gap-1.5 text-emerald-400 text-sm font-bold hover:gap-2.5 transition-all">
                Saber más <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {SOLUTIONS.map((s, i) => (
              <button
                key={s.label}
                onClick={() => setActiveTab(i)}
                className={`group text-left border rounded-2xl p-5 transition-all cursor-pointer ${
                  activeTab === i
                    ? 'border-emerald-500/40 bg-emerald-500/5'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 shadow`}>
                  <s.icon className="w-4.5 h-4.5 text-white w-4 h-4" />
                </div>
                <div className="text-sm font-bold text-slate-200">{s.label}</div>
                <div className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="border-y border-slate-800 bg-slate-900/30 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#6ee7b7] font-mono text-[10px] uppercase font-bold tracking-widest">Proceso</span>
            <h2 className="text-3xl font-display font-black tracking-tight mt-2">En marcha en 5 días</h2>
          </div>
          <div className="flex flex-col md:flex-row gap-0 relative">
            {STEPS.map((s, i) => (
              <div key={s.num} className="flex-1 flex flex-col items-center text-center px-6 relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-1/2 w-full h-px bg-slate-800 z-0" />
                )}
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 font-black font-mono text-lg flex items-center justify-center relative z-10 mb-4 shadow-lg shadow-emerald-900/30">
                  {s.num}
                </div>
                <h3 className="font-bold text-sm text-white mb-2">{s.label}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-24 px-6" id="precios">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-emerald-400 font-mono text-[10px] uppercase font-bold tracking-widest">Licencias</span>
            <h2 className="text-3xl font-display font-black tracking-tight mt-2">Invertí en tu crecimiento</h2>
            <p className="text-slate-500 text-sm mt-2">Sin contratos. Sin costos ocultos.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-2">Individual</div>
              <h3 className="text-xl font-bold">Licencia Personal</h3>
              <div className="flex items-baseline gap-1.5 mt-4 mb-6">
                <span className="text-4xl font-extrabold font-mono">$69</span>
                <span className="text-slate-500 text-sm">USD · pago único</span>
              </div>
              <ul className="flex flex-col gap-3 flex-1">
                {['Un sitio activo', 'Soporte 6 meses', 'Actualizaciones incluidas', 'Garantía 30 días'].map(i => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />{i}
                  </li>
                ))}
              </ul>
              <button className="mt-8 w-full border border-slate-700 hover:border-slate-500 text-white font-bold text-xs uppercase py-3 rounded-xl tracking-wider transition-all">
                Comprar
              </button>
            </div>

            <div className="relative bg-gradient-to-br from-emerald-950/80 to-slate-900 border border-emerald-800/40 rounded-2xl p-8 flex flex-col overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute top-3 right-4 bg-emerald-500 text-slate-950 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">
                Más popular
              </div>
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono mb-2">Agencias & SaaS</div>
              <h3 className="text-xl font-bold">Licencia Extendida</h3>
              <div className="flex items-baseline gap-1.5 mt-4 mb-6">
                <span className="text-4xl font-extrabold font-mono">$2,950</span>
                <span className="text-slate-500 text-sm">USD · pago único</span>
              </div>
              <ul className="flex flex-col gap-3 flex-1">
                {['Clientes ilimitados', 'Soporte prioritario 24/7 × 12 meses', 'Repositorio privado GitHub', 'Integraciones ad-hoc + SLA'].map(i => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />{i}
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

      {/* ── CONTACT / CTA ── */}
      <section id="contacto" className="border-t border-slate-800 bg-slate-950 py-24 px-6">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <span className="text-emerald-400 font-mono text-[10px] uppercase font-bold tracking-widest">Empezá hoy</span>
          <h2 className="text-3xl font-display font-black tracking-tight mt-2">Pedí tu Demo Gratuita</h2>
          <p className="text-slate-500 text-sm mt-2">Te respondemos en menos de 24 horas hábiles.</p>
        </div>

        {submitted ? (
          <div className="max-w-md mx-auto bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-10 text-center">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-lg mb-1">¡Recibimos tu solicitud!</h3>
            <p className="text-sm text-slate-400">Un asesor de Clientum te contactará en las próximas 24 horas hábiles.</p>
          </div>
        ) : (
          <form onSubmit={e => { e.preventDefault(); setSubmitted(true); }} className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Tu nombre *</label>
                <input required value={form.nombre} onChange={e => setForm(p => ({...p, nombre: e.target.value}))}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="Martín Rodríguez" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Email *</label>
                <input required type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="martin@empresa.com" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Empresa</label>
                <input value={form.empresa} onChange={e => setForm(p => ({...p, empresa: e.target.value}))}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="Distribuidora Sur" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Servicio de interés</label>
                <select value={form.servicio} onChange={e => setForm(p => ({...p, servicio: e.target.value}))}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition-colors">
                  <option>CRM + Chatbot</option>
                  <option>E-Commerce</option>
                  <option>ERP & Automatización</option>
                  <option>Ciberseguridad</option>
                  <option>Consultoría General</option>
                </select>
              </div>
            </div>
            <button type="submit" className="mt-2 w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase py-4 rounded-xl tracking-wider transition-all flex items-center justify-center gap-2">
              Solicitar Demo Gratis <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-800 bg-[#030709] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 180 180" fill="none">
                <path d="M40 90 L90 40 L140 90 L90 140 Z" fill="white"/>
                <circle cx="90" cy="90" r="20" fill="#030709"/>
              </svg>
            </div>
            <span className="font-display font-bold text-sm text-white">Clientum</span>
          </div>
          <p className="text-xs text-slate-600">© 2026 Clientum · General Roca, Río Negro · info@clientum.com.ar</p>
          <div className="flex gap-4 text-xs text-slate-600">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacidad</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Términos</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Soporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
