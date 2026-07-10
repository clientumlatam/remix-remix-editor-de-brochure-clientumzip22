import React from 'react';
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

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg">
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color || p.payload?.color }} />
          {p.name}: {p.value}{p.name?.includes('hs') || p.value <= 9 ? '' : '%'}
        </div>
      ))}
    </div>
  );
};

export default function ImpactMetrics() {
  return (
    <section className="pt-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Impacto Cuantitativo y Adopción</h2>
        <p className="text-slate-600">
          Visualiza los resultados reales que experimentan las <strong className="text-slate-900">+500 PyMEs</strong> que ya confían en Clientum.
          Datos clave para establecer autoridad instantánea en reuniones.
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
                <YAxis max={9} tickLine={false} axisLine={false} />
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
  );
}