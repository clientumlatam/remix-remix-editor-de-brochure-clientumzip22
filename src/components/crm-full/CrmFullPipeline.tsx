import React, { useState } from 'react';
import { MessageSquare, User, Clock, Search } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import CrmConversationDetail from './CrmConversationDetail';
import { Conversation, Seller } from './crmTypes';

const statusColors: Record<string, string> = {
  activa: 'bg-blue-100 text-blue-700',
  derivada: 'bg-yellow-100 text-yellow-700',
  resuelta: 'bg-green-100 text-green-700',
  cerrada: 'bg-gray-100 text-gray-600',
};

const statusLabels: Record<string, string> = {
  activa: 'Activa',
  derivada: 'Derivada',
  resuelta: 'Resuelta',
  cerrada: 'Cerrada',
};

const typeLabels: Record<string, string> = {
  precios: '💰 Precios',
  horarios: '🕐 Horarios',
  sucursales: '📍 Sucursales',
  derivacion: '👤 Derivación',
  reclamo: '⚠️ Reclamo',
  otro: '❓ Otro',
};

interface Props {
  conversations: Conversation[];
  sellers: Seller[];
  onUpdateConversation: (id: string, data: Partial<Conversation>) => void;
}

export default function CrmFullPipeline({ conversations, sellers, onUpdateConversation }: Props) {
  const [statusFilter, setStatusFilter] = useState('activa');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Conversation | null>(null);

  const filtered = conversations.filter(c => {
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchSearch = !search ||
      c.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.customer_phone?.includes(search);
    return matchStatus && matchSearch;
  });

  const counts = {
    activa: conversations.filter(c => c.status === 'activa').length,
    derivada: conversations.filter(c => c.status === 'derivada').length,
    resuelta: conversations.filter(c => c.status === 'resuelta').length,
    cerrada: conversations.filter(c => c.status === 'cerrada').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">CRM</h1>
          <p className="text-muted-foreground">Gestión de conversaciones · {conversations.length} registradas</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar cliente..."
              className="pl-9 pr-4 py-2 border border-input rounded-xl text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring w-52"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(Object.entries(counts) as [string, number][]).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status === statusFilter ? 'all' : status)}
            className={`text-left p-4 rounded-xl border transition-all ${
              statusFilter === status
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border bg-card hover:border-primary/40'
            }`}
          >
            <p className="text-2xl font-bold text-foreground">{count}</p>
            <p className="text-sm text-muted-foreground capitalize">{statusLabels[status]}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            statusFilter === 'all' ? 'bg-primary text-white shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Todas ({conversations.length})
        </button>
        {(Object.entries(counts) as [string, number][]).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
              statusFilter === status ? 'bg-primary text-white shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {statusLabels[status]} ({count})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-muted-foreground font-medium">Sin conversaciones</p>
            <p className="text-sm text-muted-foreground mt-1">
              {search ? 'No se encontraron resultados para tu búsqueda' : 'No hay conversaciones con este estado'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((conv) => (
            <button key={conv.id} onClick={() => setSelected(conv)} className="w-full text-left">
              <Card className={`border-0 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer ${selected?.id === conv.id ? 'ring-2 ring-primary' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-semibold text-foreground text-sm">
                          {conv.customer_name || conv.customer_phone}
                        </p>
                        {conv.customer_name && (
                          <span className="text-xs text-muted-foreground">{conv.customer_phone}</span>
                        )}
                        {conv.budget_generated && (
                          <span className="text-xs text-green-600 font-medium">✅ Presupuesto</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-1.5">
                        <Badge className={`${statusColors[conv.status]} border-0 text-xs`}>
                          {statusLabels[conv.status]}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {typeLabels[conv.query_type] || conv.query_type}
                        </Badge>
                      </div>
                      {conv.assigned_seller && (
                        <p className="text-xs text-muted-foreground">
                          Asignado a: <span className="font-medium text-foreground">{conv.assigned_seller}</span>
                          {conv.assigned_branch && ` · ${conv.assigned_branch}`}
                        </p>
                      )}
                      {conv.summary && !conv.assigned_seller && (
                        <p className="text-xs text-muted-foreground truncate">{conv.summary}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      {conv.created_date
                        ? format(new Date(conv.created_date), "d MMM · HH:mm", { locale: es })
                        : '-'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <CrmConversationDetail
          conversation={selected}
          sellers={sellers}
          onClose={() => setSelected(null)}
          onUpdated={(id, data) => {
            onUpdateConversation(id, data);
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}
