import { useState } from "react";
import {
  useListLeads,
  useCreateLead,
  useUpdateLead,
  useDeleteLead,
  useListContacts,
  getListLeadsQueryKey,
  LeadStage,
  LeadUpdateStage,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, Trash2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

const STAGES: { id: LeadUpdateStage; label: string; color: string }[] = [
  { id: "new",         label: "Nuevo",       color: "bg-slate-100"  },
  { id: "contacted",   label: "Contactado",  color: "bg-blue-50"    },
  { id: "qualified",   label: "Calificado",  color: "bg-indigo-50"  },
  { id: "proposal",    label: "Propuesta",   color: "bg-violet-50"  },
  { id: "negotiation", label: "Negociación", color: "bg-amber-50"   },
  { id: "won",         label: "Ganado",      color: "bg-green-50"   },
  { id: "lost",        label: "Perdido",     color: "bg-red-50"     },
];

const STAGE_BADGE: Record<string, string> = {
  new:         "text-slate-600 bg-slate-100",
  contacted:   "text-blue-600 bg-blue-100",
  qualified:   "text-indigo-600 bg-indigo-100",
  proposal:    "text-violet-600 bg-violet-100",
  negotiation: "text-amber-600 bg-amber-100",
  won:         "text-green-700 bg-green-100",
  lost:        "text-red-600 bg-red-100",
};

interface Lead {
  id: number;
  title: string;
  value: number;
  stage: string;
  contactId?: number | null;
  contactName?: string | null;
  source?: string | null;
  notes?: string | null;
}

function LeadCard({
  lead,
  isDragging,
  onClick,
}: {
  lead: Lead;
  isDragging?: boolean;
  onClick?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: lead.id,
    data: { lead },
  });

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`bg-white p-4 rounded-lg border select-none cursor-grab active:cursor-grabbing transition-shadow ${
        isDragging
          ? "opacity-50 shadow-lg border-blue-300"
          : "border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200"
      }`}
    >
      <h4 className="font-medium text-gray-900 text-sm leading-snug">{lead.title}</h4>
      {lead.contactName && (
        <p className="text-xs text-gray-500 mt-1">{lead.contactName}</p>
      )}
      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
        <span className="text-sm font-semibold text-gray-800">
          ${lead.value.toLocaleString("es-AR")}
        </span>
        {lead.source && (
          <span className="text-xs text-gray-400 truncate max-w-[80px]">{lead.source}</span>
        )}
      </div>
    </div>
  );
}

function KanbanColumn({
  stage,
  leads,
  isOver,
  onCardClick,
}: {
  stage: (typeof STAGES)[number];
  leads: Lead[];
  isOver: boolean;
  onCardClick: (lead: Lead) => void;
}) {
  const { setNodeRef } = useDroppable({ id: stage.id });

  return (
    <div
      ref={setNodeRef}
      className={`w-72 flex-shrink-0 flex flex-col rounded-xl transition-colors ${
        isOver ? "ring-2 ring-blue-400 ring-offset-1" : ""
      } ${stage.color}`}
    >
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <h3 className="font-semibold text-gray-700 text-sm">{stage.label}</h3>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STAGE_BADGE[stage.id]}`}>
          {leads.length}
        </span>
      </div>
      <div className="flex-1 space-y-2.5 overflow-y-auto px-4 pb-4 min-h-[120px]">
        {leads.map(lead => (
          <LeadCard key={lead.id} lead={lead} onClick={() => onCardClick(lead)} />
        ))}
        {leads.length === 0 && (
          <div
            className={`h-20 border-2 border-dashed rounded-lg flex items-center justify-center transition-colors ${
              isOver ? "border-blue-300 bg-blue-50" : "border-gray-200"
            }`}
          >
            <span className="text-xs text-gray-400">Soltar aquí</span>
          </div>
        )}
      </div>
    </div>
  );
}

function EditLeadSheet({
  lead,
  open,
  onOpenChange,
}: {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const { data: contacts = [] } = useListContacts();
  const { toast } = useToast();

  const [title, setTitle]     = useState("");
  const [value, setValue]     = useState(0);
  const [stage, setStage]     = useState<LeadUpdateStage>("new");
  const [contactId, setContactId] = useState<string>("");
  const [source, setSource]   = useState("");
  const [notes, setNotes]     = useState("");

  function resetForm(l: Lead) {
    setTitle(l.title);
    setValue(l.value);
    setStage(l.stage as LeadUpdateStage);
    setContactId(l.contactId ? String(l.contactId) : "");
    setSource(l.source ?? "");
    setNotes(l.notes ?? "");
  }

  function handleOpenChange(v: boolean) {
    if (v && lead) resetForm(lead);
    onOpenChange(v);
  }

  function handleSave() {
    if (!lead) return;
    updateLead.mutate(
      {
        id: lead.id,
        data: {
          title: title.trim() || undefined,
          value,
          stage,
          contactId: contactId ? parseInt(contactId) : undefined,
          source: source.trim() || undefined,
          notes: notes.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListLeadsQueryKey() });
          toast({ title: "Lead actualizado" });
          onOpenChange(false);
        },
        onError: () => toast({ title: "Error al guardar", variant: "destructive" }),
      }
    );
  }

  function handleDelete() {
    if (!lead || !confirm("¿Eliminar este lead?")) return;
    deleteLead.mutate(
      { id: lead.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListLeadsQueryKey() });
          toast({ title: "Lead eliminado" });
          onOpenChange(false);
        },
        onError: () => toast({ title: "Error al eliminar", variant: "destructive" }),
      }
    );
  }

  if (!lead) return null;

  const isSaving = updateLead.isPending || deleteLead.isPending;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Editar lead</SheetTitle>
        </SheetHeader>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label>Título *</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Valor estimado ($)</Label>
            <Input
              type="number"
              min="0"
              value={value || ""}
              onChange={e => setValue(Number(e.target.value))}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Etapa</Label>
            <Select value={stage} onValueChange={v => setStage(v as LeadUpdateStage)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STAGES.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Contacto</Label>
            <Select
              value={contactId || "none"}
              onValueChange={v => setContactId(v === "none" ? "" : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sin contacto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin contacto</SelectItem>
                {contacts.map(c => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Fuente</Label>
            <Input
              placeholder="ej: Web, Referido, LinkedIn…"
              value={source}
              onChange={e => setSource(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Notas</Label>
            <Textarea
              rows={4}
              placeholder="Notas internas sobre este lead…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button className="flex-1 gap-2" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
              onClick={handleDelete}
              disabled={isSaving}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function Leads() {
  const { data: leads = [], isLoading } = useListLeads();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const updateLead = useUpdateLead();
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const activeLead = activeId !== null ? leads.find(l => l.id === activeId) ?? null : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as number);
  }

  function handleDragOver(event: { over: { id: string } | null }) {
    setOverId(event.over?.id ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);
    if (!over) return;
    const leadId = active.id as number;
    const newStage = over.id as LeadUpdateStage;
    const lead = leads.find(l => l.id === leadId);
    if (!lead || lead.stage === newStage) return;
    updateLead.mutate(
      { id: leadId, data: { stage: newStage } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListLeadsQueryKey() }) }
    );
  }

  function handleCardClick(lead: Lead) {
    if (activeId !== null) return;
    setEditingLead(lead);
    setEditOpen(true);
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Pipeline de Leads</h1>
          <p className="text-gray-500 text-sm">
            Arrastrá para cambiar etapa · Hacé click para editar
          </p>
        </div>
        <CreateLeadDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      </div>

      {isLoading ? (
        <div className="flex w-full items-center justify-center flex-1">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver as never}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
            {STAGES.map(stage => (
              <KanbanColumn
                key={stage.id}
                stage={stage}
                leads={leads.filter(l => l.stage === stage.id)}
                isOver={overId === stage.id}
                onCardClick={handleCardClick}
              />
            ))}
          </div>

          <DragOverlay>
            {activeLead ? (
              <div className="w-72 rotate-1 scale-105">
                <LeadCard lead={activeLead} isDragging />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <EditLeadSheet
        lead={editingLead}
        open={editOpen}
        onOpenChange={v => {
          setEditOpen(v);
          if (!v) setEditingLead(null);
        }}
      />
    </div>
  );
}

function CreateLeadDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const queryClient = useQueryClient();
  const createLead = useCreateLead();
  const [formData, setFormData] = useState({ title: "", value: 0 });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createLead.mutate(
      { data: { ...formData, stage: LeadStage.new } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListLeadsQueryKey() });
          onOpenChange(false);
          setFormData({ title: "", value: 0 });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button><Plus className="w-4 h-4 mr-2" /> Nuevo lead</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar nuevo lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="value">Valor estimado ($)</Label>
            <Input
              id="value"
              type="number"
              min="0"
              required
              value={formData.value || ""}
              onChange={e => setFormData(p => ({ ...p, value: Number(e.target.value) }))}
            />
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={createLead.isPending}>
              {createLead.isPending ? "Guardando..." : "Guardar lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
