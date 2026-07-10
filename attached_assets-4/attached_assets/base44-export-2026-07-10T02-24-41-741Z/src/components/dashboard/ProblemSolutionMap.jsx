import React, { useState } from 'react';

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

export default function ProblemSolutionMap() {
  const [active, setActive] = useState(null);

  return (
    <section className="pt-10 border-t border-slate-200">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Mapeo del Problema a la Solución</h2>
        <p className="text-slate-600">
          <strong>Haz clic en cualquier problema</strong> de la columna izquierda para descubrir qué herramienta específica de la suite de Clientum debes posicionar como la solución ideal.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-6">
            <span className="w-6 h-px bg-slate-300"></span> El Problema
          </h3>
          {problems.map((p) => (
            <button
              key={p.id}
              onClick={() => setActive(p.id)}
              className={`w-full text-left bg-white p-5 rounded-xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                active === p.id ? 'border-slate-400 bg-slate-100' : 'border-slate-200'
              }`}
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
            <span className="w-6 h-px bg-sky-300"></span> Soluciones Clientum
          </h3>
          {solutions.map((s) => {
            const isActive = active === s.id;
            return (
              <div
                key={s.id}
                className={`bg-white p-5 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                  isActive ? 'border-sky-500 bg-sky-50 shadow-[0_0_0_1px_#0ea5e9]' : 'border-slate-200 opacity-50'
                }`}
              >
                <div className={`absolute top-0 left-0 w-1 h-full bg-sky-500 ${isActive ? '' : 'hidden'}`}></div>
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
  );
}