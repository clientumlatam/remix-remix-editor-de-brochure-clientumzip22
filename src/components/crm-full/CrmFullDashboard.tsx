import React, { useState } from 'react';
import { Sparkles, Quote } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Bot, Zap } from 'lucide-react';

const automationData = [
  { name: 'Resueltas por IA', value: 80, color: '#0ea5e9' },
  { name: 'Derivadas a Humanos', value: 20, color: '#cbd5e1' },
];

const timeData = [
  { label: 'Antes', carga: 8, liberadas: 0 },
  { label: 'Con Clientum', carga: 5, liberadas: 3 },
];

const problems = [
  { id: 'sol-crm', icon: '⏳', title: 'Tareas Repetitivas', desc: 'Presupuestos, seguimientos y respuestas manuales que consumen horas invaluables del equipo.' },
  { id: 'sol-chat', icon: '📱', title: 'Respuestas Lentas', desc: 'Mientras el equipo se demora, la competencia responde al instante y se lleva al cliente.' },
  { id: 'sol-bi', icon: '📊', title: 'Datos Dispersos', desc: 'Información vital perdida entre WhatsApp, Excel y correos sin un sistema central de control.' },
  { id: 'sol-erp', icon: '📉', title: 'Dificultad para Escalar', desc: 'Sin automatización, crecer significa inevitablemente contratar más gente para hacer lo mismo.' },
];

const solutions = [
  { id: 'sol-crm', icon: '📧', title: 'CRM + Automatización', items: ['Scoring automático de leads', 'Pipeline visual e intuitivo', 'Follow-up inteligente con IA'] },
  { id: 'sol-chat', icon: '🤖', title: 'Chatbot Inteligente 24/7', items: ['Atención ininterrumpida en WhatsApp', 'Aprende de las dinámicas del negocio', 'Deriva casos complejos al equipo'] },
  { id: 'sol-bi', icon: '📈', title: 'Reportes y Dashboards', items: ['Datos unificados en tiempo real', 'Alertas proactivas por WhatsApp', 'Predicciones de ventas con IA'] },
  { id: 'sol-erp', icon: '🏭', title: 'ERP Integrado con IA', desc: 'Plataforma unificada para la gestión empresarial que absorbe la carga operativa, permitiendo escalar ventas sin aumentar el equipo administrativo.' },
];

const pitches: Record<string, { text: string; tip: string; label: string }> = {
  estandar: { text: 'Clientum ayuda a PyMEs a crecer con IA, ahorrando hasta 3 horas diarias y resolviendo el 80% de las consultas automáticamente. Con CRM inteligente, chatbot 24/7, reportes en tiempo real y ERP integrado, tu negocio escala sin sumar más carga operativa.', tip: 'Usa este mensaje para dar un resumen completo y estructurado de la plataforma en unos pocos segundos.', label: 'Presentación General' },
  elevator: { text: 'Clientum potencia tu PyME con IA, ahorrando horas de trabajo y resolviendo el 80% de las consultas automáticamente, para que escales sin esfuerzo.', tip: 'Ideal para cruces rápidos de pasillo, eventos de networking o intros de menos de 10 segundos.', label: 'Reunión Rápida (1 frase)' },
  comercial: { text: 'Hoy tu competencia ya está respondiendo en segundos y escalando con IA; con Clientum, tu PyME puede ahorrar horas, vender más y crecer sin sumar costos.', tip: 'Excelente para iniciar una llamada en frío o captar la atención en los primeros minutos de una demostración.', label: 'Apertura de Ventas (Gancho)' },
  aspiracional: { text: 'Imaginá tu PyME funcionando como una gran empresa: procesos automáticos, clientes atendidos al instante y decisiones basadas en datos. Con Clientum, la IA deja de ser un lujo y se convierte en tu ventaja competitiva.', tip: 'Perfecto para reuniones de planificación estratégica o presentación a posibles inversores y socios clave.', label: 'Visión a Inversores/Socios' },
  emocional: { text: 'Sabemos lo agotador que es responder clientes a toda hora y sentir que no alcanza el tiempo. La IA de Clientum libera a tu equipo de tareas repetitivas y te devuelve la tranquilidad de enfocarte en hacer crecer tu negocio.', tip: 'Úsalo cuando el prospecto exprese estrés operativo, cansancio o cuellos de botella en la atención al cliente.', label: 'Dueño de PyME Agotado' },
  motivacional: { text: 'Cada hora que antes se perdía en tareas manuales ahora es tiempo para innovar y vender más. La IA no reemplaza a tu equipo: lo potencia, lo libera y lo convierte en protagonista del futuro de la empresa.', tip: 'El mensaje ideal para calmar incertidumbres internas y fomentar la adopción de la herramienta en el equipo de la PyME.', label: 'Kick-off con Equipo Interno' },
  competitivo: { text: 'Mientras otros siguen atados a procesos manuales y respuestas lentas, tu PyME destaca con Clientum: IA que responde en segundos, centraliza datos y te da la ventaja para crecer más rápido que el resto.', tip: 'Útil en mercados saturados donde la velocidad de respuesta frente a un lead define quién cierra la venta.', label: 'Enfoque Anti-Competencia' },
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg">
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color || p.payload?.color }} />
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

export default function CrmFullDashboard() {
  const [active, setActive] = useState<string | null>(null);
  const [pitchKey, setPitchKey] = useState('estandar');
  const pitch = pitches[pitchKey];

  return (
    <div className="space-y-12">
      {/* PlaybookHero */}
      <section className="bg-slate-900 rounded-[2rem] p-8 md:p-14 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-sky-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-sm font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            Playbook Interno de Ventas
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
            Tu PyME merece trabajar con IA. <br />
            <span className="text-sky-400">Dejá de hacerlo todo a mano</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl">
            Esta herramienta centraliza los datos de impacto, el mapeo de soluciones y los mensajes
            clave (pitches) para comunicar el valor de Clientum de forma efectiva a cualquier prospecto.
          </p>
        </div>
      </section>

      {/* ImpactMetrics */}
      <section className="pt-4">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Impacto Cuantitativo y Adopción</h2>
          <p className="text-slate-600">
            Visualiza los resultados reales que experimentan las <strong className="text-slate-900">+500 PyMEs</strong> que ya confían en Clientum.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-center w-12 h-12 bg-sky-100 text-sky-600 rounded-full mb-4 mx-auto">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1 text-center">Resolución Automática</h3>
            <p className="text-sm text-slate-500 text-center mb-6">Proporción de consultas gestionadas sin humanos</p>
            <div className="h-[280px] md:h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={automationData} dataKey="value" nameKey="name" innerRadius="60%" outerRadius="90%" paddingAngle={2}>
                    {automationData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-center w-12 h-12 bg-amber-100 text-amber-600 rounded-full mb-4 mx-auto">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1 text-center">Ahorro de Tiempo Diario</h3>
            <p className="text-sm text-slate-500 text-center mb-6">Impacto en la jornada laboral (Promedio: 3 hs)</p>
            <div className="h-[280px] md:h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} style={{ fontWeight: 'bold' }} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} />
                  <Bar dataKey="carga" name="Carga Operativa (hs)" fill="#cbd5e1" radius={[6, 6, 0, 0]} barSize={50} stackId="a" />
                  <Bar dataKey="liberadas" name="Horas Liberadas (hs)" fill="#0ea5e9" radius={[6, 6, 0, 0]} barSize={50} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* ProblemSolutionMap */}
      <section className="pt-10 border-t border-slate-200">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Mapeo del Problema a la Solución</h2>
          <p className="text-slate-600">
            <strong>Haz clic en cualquier problema</strong> de la columna izquierda para descubrir qué herramienta de Clientum posicionar como la solución ideal.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-6">
              <span className="w-6 h-px bg-slate-300" /> El Problema
            </h3>
            {problems.map((p) => (
              <button
                key={p.id}
                onClick={() => setActive(p.id)}
                className={`w-full text-left bg-white p-5 rounded-xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${active === p.id ? 'border-slate-400 bg-slate-100' : 'border-slate-200'}`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-2xl mt-1">{p.icon}</div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">{p.title}</h4>
                    <p className="text-sm text-slate-600 mt-1">{p.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-sky-600 uppercase tracking-wider flex items-center gap-2 mb-6">
              <span className="w-6 h-px bg-sky-300" /> Soluciones Clientum
            </h3>
            {solutions.map((s) => {
              const isActive = active === s.id;
              return (
                <div
                  key={s.id}
                  className={`bg-white p-5 rounded-xl border transition-all duration-300 relative overflow-hidden ${isActive ? 'border-sky-500 bg-sky-50 shadow-[0_0_0_1px_#0ea5e9]' : 'border-slate-200 opacity-50'}`}
                >
                  <div className={`absolute top-0 left-0 w-1 h-full bg-sky-500 ${isActive ? '' : 'hidden'}`} />
                  <div className="flex items-start gap-4">
                    <div className="text-2xl mt-1">{s.icon}</div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg">{s.title}</h4>
                      {s.items ? (
                        <ul className="text-sm text-slate-600 mt-2 space-y-1">
                          {s.items.map((it) => <li key={it}>✓ {it}</li>)}
                        </ul>
                      ) : (
                        <p className="text-sm text-slate-600 mt-2">{s.desc}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PitchEngine */}
      <section className="pt-10 pb-16 border-t border-slate-200">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Motor de Comunicación y Ventas</h2>
          <p className="text-slate-600">
            Adapta tu discurso al instante. Selecciona el contexto de tu reunión para obtener el pitch exacto.
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden flex flex-col md:flex-row">
          <div className="bg-slate-50 p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-slate-200">
            <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
              Selecciona el Contexto:
            </label>
            <select
              value={pitchKey}
              onChange={(e) => setPitchKey(e.target.value)}
              className="w-full p-3.5 bg-white border-2 border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              {Object.entries(pitches).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <div className="mt-8 p-5 bg-sky-50 rounded-xl border border-sky-100 relative">
              <div className="absolute -top-3 left-4 bg-sky-100 text-sky-700 text-xs font-bold px-2 py-1 rounded">
                Objetivo del Pitch
              </div>
              <p className="text-sm text-slate-700 mt-2 leading-relaxed">{pitch.tip}</p>
            </div>
          </div>
          <div className="p-8 md:p-10 md:w-2/3 flex flex-col justify-center min-h-[300px] relative bg-white">
            <Quote className="absolute top-6 left-6 w-12 h-12 text-slate-100" />
            <p className="text-xl md:text-2xl text-slate-800 font-medium relative z-10 leading-relaxed">
              {pitch.text}
            </p>
            <Quote className="absolute bottom-2 right-6 w-12 h-12 text-slate-100 rotate-180" />
          </div>
        </div>
      </section>
    </div>
  );
}
