import React, { useEffect, useState } from 'react';
import { UserPlus, Phone, Mail, Building2, Clock, RefreshCw, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ChatbotLead {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  company?: string;
  notes?: string;
  conversation?: string;
  status: 'nuevo' | 'contactado' | 'calificado' | 'descartado';
  created_at: string;
}

const statusColors: Record<string, string> = {
  nuevo: 'bg-blue-100 text-blue-700',
  contactado: 'bg-yellow-100 text-yellow-700',
  calificado: 'bg-green-100 text-green-700',
  descartado: 'bg-gray-100 text-gray-600',
};

const STATUSES: ChatbotLead['status'][] = ['nuevo', 'contactado', 'calificado', 'descartado'];

export default function CrmFullLeads() {
  const [leads, setLeads] = useState<ChatbotLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const loadLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/chatbot-leads');
      if (!res.ok) throw new Error('No se pudieron cargar los leads.');
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los leads.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleStatusChange = async (id: string, status: ChatbotLead['status']) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    try {
      const res = await fetch(`/api/chatbot-leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
    } catch {
      // revert on failure by reloading from server
      loadLeads();
    }
  };

  const filtered = statusFilter === 'all' ? leads : leads.filter((l) => l.status === statusFilter);
  const counts = STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = leads.filter((l) => l.status === s).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-primary" />
            Leads
          </h1>
          <p className="text-muted-foreground">
            Contactos reales capturados desde el Asesor Comercial IA · {leads.length} total
          </p>
        </div>
        <button
          onClick={loadLeads}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-muted hover:bg-muted/80 rounded-xl px-3 py-2 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${statusFilter === 'all' ? 'bg-primary text-white shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
        >
          Todos ({leads.length})
        </button>
        {STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${statusFilter === status ? 'bg-primary text-white shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            {status} ({counts[status] || 0})
          </button>
        ))}
      </div>

      {error && (
        <Card className="border-0 shadow-sm border-l-4 border-l-red-400">
          <CardContent className="py-4 text-sm text-red-600">{error}</CardContent>
        </Card>
      )}

      {!loading && filtered.length === 0 && !error ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center">
            <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-muted-foreground">
              No hay leads {statusFilter !== 'all' ? `con estado "${statusFilter}"` : 'capturados aún'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Usá el botón "Capturar Lead" del Asesor Comercial IA para sumar contactos reales acá.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((lead) => (
            <Card key={lead.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <UserPlus className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground">{lead.name}</p>
                        <Badge className={`${statusColors[lead.status]} border-0 text-xs capitalize`}>
                          {lead.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-2">
                        {lead.phone && (
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {lead.phone}</span>
                        )}
                        {lead.email && (
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {lead.email}</span>
                        )}
                        {lead.company && (
                          <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {lead.company}</span>
                        )}
                      </div>
                      {lead.conversation && (
                        <button
                          onClick={() => setExpanded((e) => ({ ...e, [lead.id]: !e[lead.id] }))}
                          className="flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <MessageSquare className="w-3 h-3" />
                          {expanded[lead.id] ? 'Ocultar conversación' : 'Ver conversación'}
                          {expanded[lead.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      )}
                      {expanded[lead.id] && lead.conversation && (
                        <pre className="mt-2 text-xs text-slate-600 whitespace-pre-wrap bg-muted/50 rounded-lg p-3 max-h-64 overflow-y-auto font-sans">
                          {lead.conversation}
                        </pre>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {lead.created_at ? format(new Date(lead.created_at), 'd MMM HH:mm', { locale: es }) : '-'}
                    </div>
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value as ChatbotLead['status'])}
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white capitalize"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
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
