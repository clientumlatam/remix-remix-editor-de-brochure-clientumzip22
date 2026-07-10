import { useState } from "react";
import {
  useListActivities,
  useCreateActivity,
  useUpdateActivity,
  useDeleteActivity,
  useListContacts,
  useListDeals,
  getListActivitiesQueryKey,
  ActivityInputType,
  ActivityUpdateType,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Loader2, Phone, Mail, Calendar as CalIcon, CheckSquare, FileText, Trash2, Save, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const TYPE_META: Record<string, { icon: React.ReactNode; label: string; color: string; badge: string }> = {
  call:    { icon: <Phone className="w-4 h-4" />,       label: "Llamada",  color: "bg-blue-100 text-blue-600",   badge: "bg-blue-100 text-blue-700"   },
  email:   { icon: <Mail className="w-4 h-4" />,        label: "Email",    color: "bg-orange-100 text-orange-600", badge: "bg-orange-100 text-orange-700" },
  meeting: { icon: <CalIcon className="w-4 h-4" />,     label: "Reunión",  color: "bg-green-100 text-green-600", badge: "bg-green-100 text-green-700"  },
  task:    { icon: <CheckSquare className="w-4 h-4" />, label: "Tarea",    color: "bg-purple-100 text-purple-600", badge: "bg-purple-100 text-purple-700" },
  note:    { icon: <FileText className="w-4 h-4" />,    label: "Nota",     color: "bg-gray-100 text-gray-600",   badge: "bg-gray-100 text-gray-700"    },
};

interface Activity {
  id: number;
  type: string;
  title: string;
  contactId?: number | null;
  contactName?: string | null;
  dealId?: number | null;
  dealTitle?: string | null;
  date: string;
  completed: boolean;
  notes?: string | null;
}

function EditActivitySheet({
  activity,
  open,
  onOpenChange,
}: {
  activity: Activity | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const updateActivity = useUpdateActivity();
  const deleteActivity = useDeleteActivity();
  const { data: contacts = [] } = useListContacts();
  const { data: deals = [] } = useListDeals();
  const { toast } = useToast();

  const [title, setTitle]         = useState("");
  const [type, setType]           = useState<ActivityUpdateType>("call");
  const [date, setDate]           = useState("");
  const [completed, setCompleted] = useState(false);
  const [contactId, setContactId] = useState<string>("");
  const [dealId, setDealId]       = useState<string>("");
  const [notes, setNotes]         = useState("");

  function resetForm(a: Activity) {
    setTitle(a.title);
    setType(a.type as ActivityUpdateType);
    setDate(a.date ? a.date.slice(0, 16) : "");
    setCompleted(a.completed);
    setContactId(a.contactId ? String(a.contactId) : "");
    setDealId(a.dealId ? String(a.dealId) : "");
    setNotes(a.notes ?? "");
  }

  function handleOpenChange(v: boolean) {
    if (v && activity) resetForm(activity);
    onOpenChange(v);
  }

  function handleSave() {
    if (!activity) return;
    updateActivity.mutate(
      {
        id: activity.id,
        data: {
          title: title.trim() || undefined,
          type,
          date: date ? new Date(date).toISOString() : undefined,
          completed,
          contactId: contactId ? parseInt(contactId) : undefined,
          dealId: dealId ? parseInt(dealId) : undefined,
          notes: notes.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListActivitiesQueryKey() });
          toast({ title: "Actividad actualizada" });
          onOpenChange(false);
        },
        onError: () => toast({ title: "Error al guardar", variant: "destructive" }),
      }
    );
  }

  function handleDelete() {
    if (!activity || !confirm("¿Eliminar esta actividad?")) return;
    deleteActivity.mutate(
      { id: activity.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListActivitiesQueryKey() });
          toast({ title: "Actividad eliminada" });
          onOpenChange(false);
        },
        onError: () => toast({ title: "Error al eliminar", variant: "destructive" }),
      }
    );
  }

  if (!activity) return null;
  const isSaving = updateActivity.isPending || deleteActivity.isPending;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Editar actividad</SheetTitle>
        </SheetHeader>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label>Título *</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={v => setType(v as ActivityUpdateType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TYPE_META).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Fecha y hora</Label>
            <Input
              type="datetime-local"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between py-1">
            <Label>Completada</Label>
            <Switch checked={completed} onCheckedChange={setCompleted} />
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
            <Label>Deal relacionado</Label>
            <Select
              value={dealId || "none"}
              onValueChange={v => setDealId(v === "none" ? "" : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sin deal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin deal</SelectItem>
                {deals.map(d => (
                  <SelectItem key={d.id} value={String(d.id)}>{d.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Notas</Label>
            <Textarea
              rows={4}
              placeholder="Notas sobre esta actividad…"
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

export default function Activities() {
  const { data: activities = [], isLoading } = useListActivities();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Feed de Actividades</h1>
          <p className="text-gray-500 text-sm">Hacé click en cualquier actividad para editarla.</p>
        </div>
        <CreateActivityDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center text-gray-500 py-16">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="font-medium">Sin actividades registradas</p>
            <p className="text-sm text-gray-400 mt-1">Registrá tu primera actividad para empezar</p>
          </div>
        ) : (
          activities.map(activity => {
            const meta = TYPE_META[activity.type] ?? TYPE_META.note;
            return (
              <button
                key={activity.id}
                onClick={() => { setEditingActivity(activity); setEditOpen(true); }}
                className="w-full text-left flex gap-4 items-start px-6 py-5 hover:bg-gray-50 transition-colors group"
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${meta.color}`}>
                  {meta.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-semibold ${activity.completed ? "line-through text-gray-400" : "text-gray-900"}`}>
                        {activity.title}
                      </p>
                      <Badge className={`text-xs px-1.5 py-0 font-normal border-0 ${meta.badge}`}>
                        {meta.label}
                      </Badge>
                      {activity.completed && (
                        <Badge className="text-xs px-1.5 py-0 font-normal border-0 bg-green-100 text-green-700">
                          Completada
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-400">
                        {format(new Date(activity.date), "d MMM yyyy · HH:mm", { locale: es })}
                      </span>
                      <Pencil className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  {(activity.contactName || activity.dealTitle) && (
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.contactName && <span className="font-medium">{activity.contactName}</span>}
                      {activity.contactName && activity.dealTitle && <span className="mx-1">·</span>}
                      {activity.dealTitle && <span className="text-blue-600">{activity.dealTitle}</span>}
                    </p>
                  )}

                  {activity.notes && (
                    <p className="mt-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-md border border-gray-100 line-clamp-2">
                      {activity.notes}
                    </p>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      <EditActivitySheet
        activity={editingActivity}
        open={editOpen}
        onOpenChange={v => {
          setEditOpen(v);
          if (!v) setEditingActivity(null);
        }}
      />
    </div>
  );
}

function CreateActivityDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const queryClient = useQueryClient();
  const createActivity = useCreateActivity();
  const { data: contacts = [] } = useListContacts();
  const [formData, setFormData] = useState<{
    title: string;
    type: ActivityInputType;
    notes: string;
    contactId: string;
  }>({ title: "", type: ActivityInputType.call, notes: "", contactId: "" });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createActivity.mutate(
      {
        data: {
          title: formData.title,
          type: formData.type,
          notes: formData.notes || undefined,
          contactId: formData.contactId ? parseInt(formData.contactId) : undefined,
          date: new Date().toISOString(),
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListActivitiesQueryKey() });
          onOpenChange(false);
          setFormData({ title: "", type: ActivityInputType.call, notes: "", contactId: "" });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button><Plus className="w-4 h-4 mr-2" /> Registrar actividad</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar actividad</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input
              required
              value={formData.title}
              onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
              placeholder="ej: Llamada con Juan García"
            />
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select
              value={formData.type}
              onValueChange={v => setFormData(p => ({ ...p, type: v as ActivityInputType }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TYPE_META).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Contacto</Label>
            <Select
              value={formData.contactId || "none"}
              onValueChange={v => setFormData(p => ({ ...p, contactId: v === "none" ? "" : v }))}
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
          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea
              rows={3}
              value={formData.notes}
              onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
              placeholder="Notas opcionales…"
            />
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={createActivity.isPending}>
              {createActivity.isPending ? "Guardando…" : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
