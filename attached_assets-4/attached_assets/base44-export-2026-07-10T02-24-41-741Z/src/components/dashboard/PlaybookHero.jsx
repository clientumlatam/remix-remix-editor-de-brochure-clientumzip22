import React from 'react';
import { Sparkles } from 'lucide-react';

export default function PlaybookHero() {
  return (
    <section className="bg-slate-900 rounded-[2rem] p-8 md:p-14 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-sky-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 pointer-events-none"></div>
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
  );
}