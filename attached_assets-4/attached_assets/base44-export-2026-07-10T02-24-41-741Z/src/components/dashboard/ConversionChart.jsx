const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-border rounded-xl shadow-lg p-3 text-sm">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        <p className="text-muted-foreground">Derivadas: <span className="font-medium text-foreground">{payload[0]?.payload.total}</span></p>
        <p className="text-green-600">Con presupuesto: <span className="font-medium">{payload[0]?.payload.budgets}</span></p>
        <p className="text-primary font-semibold">Conversión: {payload[0]?.value}%</p>
      </div>
    );
  }
  return null;
};

export default function ConversionChart() {
  const [sellerData, setSellerData] = useState([]);
  const [branchData, setBranchData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('seller'); // 'seller' | 'branch'

  useEffect(() => {
    db.entities.WhatsAppConversation.filter({ status: 'derivada' }).then((conversations) => {
      if (!conversations?.length) { setLoading(false); return; }

      // By seller
      const sellerMap = {};
      conversations.forEach(c => {
        const key = c.assigned_seller || 'Sin asignar';
        if (!sellerMap[key]) sellerMap[key] = { total: 0, budgets: 0 };
        sellerMap[key].total++;
        if (c.budget_generated) sellerMap[key].budgets++;
      });

      setSellerData(
        Object.entries(sellerMap)
          .map(([name, d]) => ({
            name: name.length > 12 ? name.slice(0, 12) + '…' : name,
            fullName: name,
            total: d.total,
            budgets: d.budgets,
            rate: d.total > 0 ? Math.round((d.budgets / d.total) * 100) : 0,
          }))
          .sort((a, b) => b.rate - a.rate)
          .slice(0, 8)
      );

      // By branch
      const branchMap = {};
      conversations.forEach(c => {
        const key = c.assigned_branch || 'Sin sucursal';
        if (!branchMap[key]) branchMap[key] = { total: 0, budgets: 0 };
        branchMap[key].total++;
        if (c.budget_generated) branchMap[key].budgets++;
      });

      setBranchData(
        Object.entries(branchMap)
          .map(([name, d]) => ({
            name: name.length > 14 ? name.slice(0, 14) + '…' : name,
            fullName: name,
            total: d.total,
            budgets: d.budgets,
            rate: d.total > 0 ? Math.round((d.budgets / d.total) * 100) : 0,
          }))
          .sort((a, b) => b.rate - a.rate)
      );

      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const data = view === 'seller' ? sellerData : branchData;
  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

  const isEmpty = !loading && data.length === 0;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Tasa de Conversión
          </CardTitle>
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setView('seller')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                view === 'seller' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Por Vendedor
            </button>
            <button
              onClick={() => setView('branch')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                view === 'branch' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Por Sucursal
            </button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Conversaciones derivadas que generaron un presupuesto
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : isEmpty ? (
          <div className="h-48 flex flex-col items-center justify-center text-center gap-2">
            <TrendingUp className="w-8 h-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Sin datos de conversión aún</p>
            <p className="text-xs text-muted-foreground/70">
              Los datos aparecerán cuando se registren conversaciones derivadas con presupuestos
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                unit="%"
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', radius: 4 }} />
              <Bar dataKey="rate" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {data.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}