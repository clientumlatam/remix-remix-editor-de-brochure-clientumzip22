import React, { useState } from 'react';
import { X, Clock, FileText, UserCheck, CheckCircle2, XCircle, CalendarPlus, CalendarCheck } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Conversation, Seller } from './crmTypes';

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

interface Props {
  conversation: Conversation;
  sellers: Seller[];
  onClose: () => void;
  onUpdated: (id: string, data: Partial<Conversation>) => void;
}

export default function CrmConversationDetail({ conversation, sellers, onClose, onUpdated }: Props) {
  const [selectedSeller, setSelectedSeller] = useState(conversation.assigned_seller || '');
  const [budgetGenerated, setBudgetGenerated] = useState(conversation.budget_generated || false);
  const [budgetApproved, setBudgetApproved] = useState(conversation.budget_approved || false);
  const [visitDate, setVisitDate] = useState(
    conversation.visit_date ? new Date(conversation.visit_date).toISOString().slice(0, 16) : ''
  );
  const [closeSummary, setCloseSummary] = useState(conversation.summary || '');
  const [showCloseForm, setShowCloseForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const doUpdate = (data: Partial<Conversation>) => {
    setSaving(true);
    setTimeout(() => {
      onUpdated(conversation.id, data);
      setSaving(false);
    }, 200);
  };

  const handleAssignSeller = () => {
    const seller = sellers.find(s => s.name === selectedSeller);
    doUpdate({ assigned_seller: selectedSeller, assigned_branch: seller?.branch || '', status: 'derivada' });
  };

  const handleToggleBudget = () => {
    const newVal = !budgetGenerated;
    setBudgetGenerated(newVal);
    doUpdate({ budget_generated: newVal });
  };

  const handleToggleBudgetApproved = () => {
    const newVal = !budgetApproved;
    setBudgetApproved(newVal);
    doUpdate({ budget_approved: newVal });
  };

  const handleScheduleVisit = () => {
    if (!visitDate) return;
    doUpdate({ visit_date: new Date(visitDate).toISOString(), visit_scheduled: true });
  };

  const handleClose = () => {
    doUpdate({ status: 'cerrada', summary: closeSummary });
    setShowCloseForm(false);
    onClose();
  };

  const isClosed = conversation.status === 'cerrada';

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-background shadow-2xl flex flex-col h-full overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-background z-10">
          <div>
            <h2 className="font-bold text-lg text-foreground">
              {conversation.customer_name || conversation.customer_phone}
            </h2>
            <p className="text-xs text-muted-foreground">{conversation.customer_phone}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-5 space-y-6 flex-1">
          <div className="flex flex-wrap gap-2">
            <Badge className={`${statusColors[conversation.status]} border-0`}>{conversation.status}</Badge>
            <Badge variant="outline">{typeLabels[conversation.query_type] || conversation.query_type}</Badge>
            {conversation.budget_generated && (
              <Badge className="bg-green-100 text-green-700 border-0">✅ Presupuesto generado</Badge>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
              <Clock className="w-3 h-3" />
              {conversation.created_date
                ? format(new Date(conversation.created_date), "d MMM yyyy · HH:mm", { locale: es })
                : '-'}
            </div>
          </div>

          {conversation.summary && (
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                <FileText className="w-3 h-3" /> RESUMEN
              </p>
              <p className="text-sm text-foreground">{conversation.summary}</p>
            </div>
          )}

          {!isClosed && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-primary" /> Asignar vendedor
              </p>
              <select
                value={selectedSeller}
                onChange={e => setSelectedSeller(e.target.value)}
                className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">— Seleccionar vendedor —</option>
                {sellers.filter(s => s.active).map(s => (
                  <option key={s.id} value={s.name}>
                    {s.name} · {s.specialty} ({s.branch})
                  </option>
                ))}
              </select>
              <Button onClick={handleAssignSeller} disabled={!selectedSeller || saving} size="sm" className="w-full">
                {saving ? 'Guardando...' : conversation.assigned_seller ? 'Reasignar vendedor' : 'Asignar y derivar'}
              </Button>
              {conversation.assigned_seller && (
                <p className="text-xs text-muted-foreground text-center">
                  Asignado actualmente: <span className="font-medium text-foreground">{conversation.assigned_seller}</span>
                  {conversation.assigned_branch && ` · ${conversation.assigned_branch}`}
                </p>
              )}
            </div>
          )}

          {!isClosed && (
            <div className="flex items-center justify-between p-4 rounded-xl border border-border">
              <div>
                <p className="text-sm font-semibold text-foreground">Presupuesto generado</p>
                <p className="text-xs text-muted-foreground">¿Se envió un presupuesto al cliente?</p>
              </div>
              <button
                onClick={handleToggleBudget}
                disabled={saving}
                className={`w-12 h-6 rounded-full transition-colors relative ${budgetGenerated ? 'bg-green-500' : 'bg-muted'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${budgetGenerated ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>
          )}

          {!isClosed && budgetGenerated && (
            <div className="flex items-center justify-between p-4 rounded-xl border border-border">
              <div>
                <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-500" /> Presupuesto aprobado
                </p>
                <p className="text-xs text-muted-foreground">¿El cliente aprobó el presupuesto?</p>
              </div>
              <button
                onClick={handleToggleBudgetApproved}
                disabled={saving}
                className={`w-12 h-6 rounded-full transition-colors relative ${budgetApproved ? 'bg-green-500' : 'bg-muted'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${budgetApproved ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>
          )}

          {!isClosed && budgetApproved && (
            <div className="space-y-3 p-4 rounded-xl border border-sky-200 bg-sky-50">
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                <CalendarPlus className="w-4 h-4 text-sky-600" /> Agendar visita técnica
              </p>
              {conversation.visit_scheduled && conversation.visit_date ? (
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-100 rounded-lg px-3 py-2">
                  <CalendarCheck className="w-4 h-4" />
                  Visita agendada: {format(new Date(conversation.visit_date), "d MMM yyyy · HH:mm", { locale: es })}
                </div>
              ) : (
                <>
                  <input
                    type="datetime-local"
                    value={visitDate}
                    onChange={e => setVisitDate(e.target.value)}
                    className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <Button onClick={handleScheduleVisit} disabled={!visitDate || saving} size="sm" className="w-full">
                    {saving ? 'Agendando...' : 'Confirmar visita'}
                  </Button>
                </>
              )}
            </div>
          )}

          {!isClosed && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                <XCircle className="w-4 h-4 text-destructive" /> Cerrar conversación
              </p>
              {!showCloseForm ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-destructive/30 text-destructive hover:bg-destructive/5"
                  onClick={() => setShowCloseForm(true)}
                >
                  Cerrar con resumen
                </Button>
              ) : (
                <div className="space-y-3">
                  <textarea
                    value={closeSummary}
                    onChange={e => setCloseSummary(e.target.value)}
                    placeholder="Escribí un resumen de la conversación..."
                    rows={3}
                    className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowCloseForm(false)}>
                      Cancelar
                    </Button>
                    <Button size="sm" className="flex-1 bg-destructive hover:bg-destructive/90" onClick={handleClose} disabled={saving}>
                      {saving ? 'Cerrando...' : 'Confirmar cierre'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {isClosed && (
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <CheckCircle2 className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground font-medium">Conversación cerrada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
