import React, { useState } from 'react';
import { MessageSquare, User, Clock } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Conversation } from './crmTypes';

const statusColors: Record<string, string> = {
  activa: 'bg-blue-100 text-blue-700',
  derivada: 'bg-yellow-100 text-yellow-700',
  resuelta: 'bg-green-100 text-green-700',
  cerrada: 'bg-gray-100 text-gray-600',
};

const typeLabels: Record<string, string> = {
  precios: '💰 Precios',
  horarios: '🕐 Horarios',
  sucursales: '📍 Sucursales',
  derivacion: '👤 Derivación',
  reclamo: '⚠️ Reclamo',
  otro: '❓ Otro',
};

interface Props { conversations: Conversation[] }

export default function CrmFullConversations({ conversations }: Props) {
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = statusFilter === 'all'
    ? conversations
    : conversations.filter(c => c.status === statusFilter);

  const counts = {
    activa: conversations.filter(c => c.status === 'activa').length,
    derivada: conversations.filter(c => c.status === 'derivada').length,
    resuelta: conversations.filter(c => c.status === 'resuelta').length,
    cerrada: conversations.filter(c => c.status === 'cerrada').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Conversaciones</h1>
        <p className="text-muted-foreground">Historial de consultas via WhatsApp · {conversations.length} total</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${statusFilter === 'all' ? 'bg-primary text-white shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
        >
          Todas ({conversations.length})
        </button>
        {(Object.entries(counts) as [string, number][]).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${statusFilter === status ? 'bg-primary text-white shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            {status} ({count})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-muted-foreground">No hay conversaciones {statusFilter !== 'all' ? `con estado "${statusFilter}"` : 'registradas aún'}</p>
            <p className="text-sm text-muted-foreground mt-1">Las conversaciones del bot aparecerán aquí automáticamente</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((conv) => (
            <Card key={conv.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground">
                          {conv.customer_name || conv.customer_phone}
                        </p>
                        {conv.customer_name && (
                          <span className="text-xs text-muted-foreground">{conv.customer_phone}</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <Badge className={`${statusColors[conv.status]} border-0 text-xs`}>
                          {conv.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {typeLabels[conv.query_type] || conv.query_type}
                        </Badge>
                        {conv.channel === 'whatsapp' && (
                          <Badge className="bg-green-100 text-green-700 border-0 text-xs">WhatsApp</Badge>
                        )}
                      </div>
                      {conv.summary && (
                        <p className="text-sm text-muted-foreground truncate">{conv.summary}</p>
                      )}
                      {conv.assigned_seller && (
                        <p className="text-xs text-muted-foreground mt-1">
                          <span className="font-medium">Derivado a:</span> {conv.assigned_seller}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    {conv.created_date
                      ? format(new Date(conv.created_date), "d MMM HH:mm", { locale: es })
                      : '-'}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
