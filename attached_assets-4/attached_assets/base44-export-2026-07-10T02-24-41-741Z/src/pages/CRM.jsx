const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { MessageSquare, User, Clock, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ConversationDetail from '@/components/crm/ConversationDetail';

const statusColors = {
  activa: 'bg-blue-100 text-blue-700',
  derivada: 'bg-yellow-100 text-yellow-700',
  resuelta: 'bg-green-100 text-green-700',
  cerrada: 'bg-gray-100 text-gray-600',
};

const statusLabels = {
  activa: 'Activa',
  derivada: 'Derivada',
  resuelta: 'Resuelta',
  cerrada: 'Cerrada',
};

const typeLabels = {
  precios: '💰 Precios',
  horarios: '🕐 Horarios',
  sucursales: '📍 Sucursales',
  derivacion: '👤 Derivación',
  reclamo: '⚠️ Reclamo',
  otro: '❓ Otro',
};

export default function CRM() {
  const [statusFilter, setStatusFilter] = useState('activa');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const { data: conversations = [], isLoading, refetch } = useQuery({
    queryKey: ['crm-conversations'],
    queryFn: () => db.entities.WhatsAppConversation.list('-created_date'),
  });

  const { data: sellers = [] } = useQuery({
    queryKey: ['sellers'],
    queryFn: () => db.entities.Seller.list(),
  });

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
      {/* Header */}
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

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(counts).map(([status, count]) => (
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

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            statusFilter === 'all' ? 'bg-primary text-white shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Todas ({conversations.length})
        </button>
        {Object.entries(counts).map(([status, count]) => (
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

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i} className="h-24 animate-pulse bg-muted border-0" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
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
            <button
              key={conv.id}
              onClick={() => setSelected(conv)}
              className="w-full text-left"
            >
              <Card className={`border-0 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer ${
                selected?.id === conv.id ? 'ring-2 ring-primary' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>

                    {/* Info */}
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

                    {/* Time */}
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

      {/* Detail panel */}
      {selected && (
        <ConversationDetail
          conversation={selected}
          sellers={sellers}
          onClose={() => setSelected(null)}
          onUpdated={() => { refetch(); setSelected(null); }}
        />
      )}
    </div>
  );
}