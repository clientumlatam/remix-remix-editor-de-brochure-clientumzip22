import { useState } from "react";
import {
  useListDeals,
  useCreateDeal,
  useUpdateDeal,
  useDeleteDeal,
  useListContacts,
  getListDealsQueryKey,
  DealStage,
  DealUpdateStage,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Loader2, Trash2, Save, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ActivityTimeline } from "@/components/ActivityTimeline";
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

const STAGES: { id: DealUpdateStage; label: string; color: string; badge: string }[] = [
  { id: "discovery",   label: "Descubrimiento", color: "bg-slate-100",  badge: "text-slate-600 bg-slate-200"  },
  { id: "proposal",    label: "Propuesta",       color: "bg-blue-50",   badge: "text-blue-700 bg-blue-100"    },
  { id: "negotiation", label: "Negociación",     color: "bg-violet-50", badge: "text-violet-700 bg-violet-100"},
  { id: "contract",    label: "Contrato",        color: "bg-amber-50",  badge: "text-amber-700 bg-amber-100"  },
  { id: "closed_won",  label: "Ganado",          color: "bg-green-50",  badge: "text-green-700 bg-green-100"  },
  { id: "closed_lost", label: "Perdido",         color: "bg-red-50",    badge: "text-red-700 bg-red-100"      },
];

function formatARS(n: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
}

interface Deal {
  id: number;
  title: string;
  value: number;
  stage: string;
  probability?: number | null;
  contactId?: number | null;
  contactName?: string | null;
  companyName?: string | null;
  expectedCloseDate?: string | null;
  notes?: string | null;
}

function DealCard({
  deal,
  isDragging,
  onClick,
}: {
  deal: Deal;
  isDragging?: boolean;
  onClick?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: deal.id,
    data: { deal },
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
      <h4 className="font-medium text-gray-900 text-sm leading-snug">{deal.title}</h4>
      {deal.contactName && (
        <p className="text-xs text-gray-500 mt-1">{deal.contactName}</p>
      )}
      {deal.companyName && !deal.contactName && (
        <p className="text-xs text-gray-500 mt-1">{deal.companyName}</p>
      )}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-gray-800">{formatARS(deal.value)}</span>
        {deal.probability != null && (
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <TrendingUp className="w-3 h-3" />{deal.probability}%
          </span>
        )}
      </div>
      {deal.expectedCloseDate && (
        <p className="text-xs text-gray-400 mt-1">
          Cierre: {new Date(deal.expectedCloseDate).toLocaleDateString("es-AR")}
        </p>
      )}
    </div>
  );
}

function KanbanColumn({
  stage,
  deals,
  isOver,
  onCardClick,
}: {
  stage: (typeof STAGES)[number];
  deals: Deal[];
  isOver: boolean;
  onCardClick: (deal: Deal) => void;
}) {
  const { setNodeRef } = useDroppable({ id: stage.id });
  const total = deals.reduce((s, d) => s + d.value, 0);

  return (
    <div
      ref={setNodeRef}
      className={`w-72 flex-shrink-0 flex flex-col rounded-xl transition-colors ${
        isOver ? "ring-2 ring-blue-400 ring-offset-1" : ""
      } ${stage.color}`}
    >
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-gray-700 text-sm">{stage.label}</h3>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stage.badge}`}>
            {deals.length}
          </span>
        </div>
        {deals.length > 0 && (
          <p className="text-xs text-gray-400">{formatARS(total)}</p>
        )}
      </div>
      <div className="flex-1 space-y-2.5 overflow-y-auto px-4 pb-4 min-h-[120px]">
        {deals.map(deal => (
          <DealCard key={deal.id} deal={deal} onClick={() => onCardClick(deal)} />
        ))}
        {deals.length === 0 && (
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

/* ------------------------------------------------------------------ */
/* Edit Deal Sheet                                                       */
/* ------------------------------------------------------------------ */

function EditDealSheet({
  deal,
  open,
  onOpenChange,
}: {
  deal: Deal | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const updateDeal = useUpdateDeal();
  const deleteDeal = useDeleteDeal();
  const { data: contacts = [] } = useListContacts();
  const { toast } = useToast();

  const [title, setTitle]               = useState("");
  const [value, setValue]               = useState(0);
  const [probability, setProbability]   = useState(50);
  const [stage, setStage]               = useState<DealUpdateStage>("discovery");
  const [contactId, setContactId]       = useState<string>("");
  const [expectedCloseDate, setExpectedCloseDate] = useState("");
  const [notes, setNotes]               = useState("");

  function resetForm(d: Deal) {
    setTitle(d.title);
    setValue(d.value);
    setProbability(d.probability ?? 50);
    setStage(d.stage as DealUpdateStage);
    setContactId(d.contactId ? String(d.contactId) : "");
    setExpectedCloseDate(d.expectedCloseDate ?? "");
    setNotes(d.notes ?? "");
  }

  function handleOpenChange(v: boolean) {
    if (v && deal) resetForm(deal);
    onOpenChange(v);
  }

  function handleSave() {
    if (!deal) return;
    updateDeal.mutate(
      {
        id: deal.id,
        data: {
          title: title.trim() || undefined,
          value,
          probability,
          stage,
          contactId: contactId ? parseInt(contactId) : undefined,
          expectedCloseDate: expectedCloseDate || undefined,
          notes: notes.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListDealsQueryKey() });
          toast({ title: "Deal actualizado" });
          onOpenChange(false);
        },
        onError: () => toast({ title: "Error al guardar", variant: "destructive" }),
      }
    );
  }

  function handleDelete() {
    if (!deal || !confirm("¿Eliminar este deal?")) return;
    deleteDeal.mutate(
      { id: deal.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListDealsQueryKey() });
          toast({ title: "Deal eliminado" });
          onOpenChange(false);
        },
        onError: () => toast({ title: "Error al eliminar", variant: "destructive" }),
      }
    );
  }

  if (!deal) return null;
  const isSaving = updateDeal.isPending || deleteDeal.isPending;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="truncate">{deal.title}</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="details">
          <TabsList className="w-full mb-5">
            <TabsTrigger value="details" className="flex-1">Detalles</TabsTrigger>
            <TabsTrigger value="activity" className="flex-1">Actividad</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label>Título *</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Valor ($)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={value || ""}
                    onChange={e => setValue(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Probabilidad (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={probability || ""}
                    onChange={e => setProbability(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Etapa</Label>
                <Select value={stage} onValueChange={v => setStage(v as DealUpdateStage)}>
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
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Fecha estimada de cierre</Label>
                <Input
                  type="date"
                  value={expectedCloseDate}
                  onChange={e => setExpectedCloseDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Notas</Label>
                <Textarea
                  rows={4}
                  placeholder="Notas internas sobre este deal…"
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
          </TabsContent>

          <TabsContent value="activity">
            <ActivityTimeline
              params={{ dealId: deal.id }}
              newActivityDefaults={{ dealId: deal.id }}
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

export default function Deals() {
  const { data: deals = [], isLoading } = useListDeals();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const updateDeal = useUpdateDeal();
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const activeDeal = activeId !== null ? deals.find(d => d.id === activeId) ?? null : null;

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
    const dealId = active.id as number;
    const newStage = over.id as DealUpdateStage;
    const deal = deals.find(d => d.id === dealId);
    if (!deal || deal.stage === newStage) return;
    updateDeal.mutate(
      { id: dealId, data: { stage: newStage } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListDealsQueryKey() }) }
    );
  }

  function handleCardClick(deal: Deal) {
    if (activeId !== null) return;
    setEditingDeal(deal);
    setEditOpen(true);
  }

  const totalPipeline = deals
    .filter(d => d.stage !== "closed_lost")
    .reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Pipeline de Deals</h1>
          <p className="text-gray-500 text-sm">
            {deals.length > 0
              ? `${deals.length} deal${deals.length !== 1 ? "s" : ""} · Pipeline activo: ${formatARS(totalPipeline)}`
              : "Arrastrá para cambiar etapa · Hacé click para editar"}
          </p>
        </div>
        <CreateDealDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
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
                deals={deals.filter(d => d.stage === stage.id)}
                isOver={overId === stage.id}
                onCardClick={handleCardClick}
              />
            ))}
          </div>

          <DragOverlay>
            {activeDeal ? (
              <div className="w-72 rotate-1 scale-105">
                <DealCard deal={activeDeal} isDragging />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <EditDealSheet
        deal={editingDeal}
        open={editOpen}
        onOpenChange={v => {
          setEditOpen(v);
          if (!v) setEditingDeal(null);
        }}
      />
    </div>
  );
}

function CreateDealDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const queryClient = useQueryClient();
  const createDeal = useCreateDeal();
  const [formData, setFormData] = useState({ title: "", value: 0, probability: 50 });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDeal.mutate(
      { data: { ...formData, stage: DealStage.discovery } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListDealsQueryKey() });
          onOpenChange(false);
          setFormData({ title: "", value: 0, probability: 50 });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button><Plus className="w-4 h-4 mr-2" /> Nuevo deal</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar nuevo deal</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Nombre del deal</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="value">Valor ($)</Label>
              <Input
                id="value"
                type="number"
                min="0"
                required
                value={formData.value || ""}
                onChange={e => setFormData(p => ({ ...p, value: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="probability">Probabilidad (%)</Label>
              <Input
                id="probability"
                type="number"
                min="0"
                max="100"
                value={formData.probability || ""}
                onChange={e => setFormData(p => ({ ...p, probability: Number(e.target.value) }))}
              />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={createDeal.isPending}>
              {createDeal.isPending ? "Guardando..." : "Guardar deal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
