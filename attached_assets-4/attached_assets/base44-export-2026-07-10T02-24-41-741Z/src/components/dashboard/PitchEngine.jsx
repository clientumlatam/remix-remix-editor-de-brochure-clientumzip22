import React, { useState } from 'react';
import { Quote } from 'lucide-react';

const pitches = {
  estandar: {
    text: 'Clientum ayuda a PyMEs a crecer con IA, ahorrando hasta 3 horas diarias y resolviendo el 80% de las consultas automáticamente. Con CRM inteligente, chatbot 24/7, reportes en tiempo real y ERP integrado, tu negocio escala sin sumar más carga operativa.',
    tip: 'Usa este mensaje para dar un resumen completo y estructurado de la plataforma en unos pocos segundos.',
    label: 'Presentación General',
  },
  elevator: {
    text: 'Clientum potencia tu PyME con IA, ahorrando horas de trabajo y resolviendo el 80% de las consultas automáticamente, para que escales sin esfuerzo.',
    tip: 'Ideal para cruces rápidos de pasillo, eventos de networking o intros de menos de 10 segundos.',
    label: 'Reunión Rápida (1 frase)',
  },
  comercial: {
    text: 'Hoy tu competencia ya está respondiendo en segundos y escalando con IA; con Clientum, tu PyME puede ahorrar horas, vender más y crecer sin sumar costos.',
    tip: 'Excelente para iniciar una llamada en frío o captar la atención en los primeros minutos de una demostración.',
    label: 'Apertura de Ventas (Gancho)',
  },
  aspiracional: {
    text: 'Imaginá tu PyME funcionando como una gran empresa: procesos automáticos, clientes atendidos al instante y decisiones basadas en datos. Con Clientum, la IA deja de ser un lujo y se convierte en tu ventaja competitiva.',
    tip: 'Perfecto para reuniones de planificación estratégica o presentación a posibles inversores y socios clave.',
    label: 'Visión a Inversores/Socios',
  },
  emocional: {
    text: 'Sabemos lo agotador que es responder clientes a toda hora y sentir que no alcanza el tiempo. La IA de Clientum libera a tu equipo de tareas repetitivas y te devuelve la tranquilidad de enfocarte en hacer crecer tu negocio.',
    tip: 'Úsalo cuando el prospecto exprese estrés operativo, cansancio o cuellos de botella en la atención al cliente.',
    label: 'Dueño de PyME Agotado',
  },
  motivacional: {
    text: 'Cada hora que antes se perdía en tareas manuales ahora es tiempo para innovar y vender más. La IA no reemplaza a tu equipo: lo potencia, lo libera y lo convierte en protagonista del futuro de la empresa.',
    tip: 'El mensaje ideal para calmar incertidumbres internas y fomentar la adopción de la herramienta en el equipo de la PyME.',
    label: 'Kick-off con Equipo Interno',
  },
  competitivo: {
    text: 'Mientras otros siguen atados a procesos manuales y respuestas lentas, tu PyME destaca con Clientum: IA que responde en segundos, centraliza datos y te da la ventaja para crecer más rápido que el resto.',
    tip: 'Útil en mercados saturados donde la velocidad de respuesta frente a un lead define quién cierra la venta.',
    label: 'Enfoque Anti-Competencia',
  },
};

export default function PitchEngine() {
  const [key, setKey] = useState('estandar');
  const pitch = pitches[key];

  return (
    <section className="pt-10 pb-16 border-t border-slate-200">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Motor de Comunicación y Ventas</h2>
        <p className="text-slate-600">
          Adapta tu discurso al instante. Selecciona el contexto de tu reunión para obtener el "pitch" exacto, optimizado con la propuesta de valor y tono correctos.
        </p>
      </div>
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden flex flex-col md:flex-row">
        <div className="bg-slate-50 p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-slate-200">
          <label htmlFor="pitch-selector" className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
            Selecciona el Contexto:
          </label>
          <select
            id="pitch-selector"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full p-3.5 bg-white border-2 border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 cursor-pointer transition-all"
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
  );
}