import { useState } from "react";
import {
  useListActivities,
  useCreateActivity,
  useDeleteActivity,
  useUpdateActivity,
  getListActivitiesQueryKey,
  ActivityInputType,
  type Activity,
  type ListActivitiesParams,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Loader2,
  Phone,
  Mail,
  Users,
  CheckSquare,
  FileText,
  Check,
  X,
  ListChecks,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

/* ------------------------------------------------------------------ */
/* Activity type config                                                  */
/* ------------------------------------------------------------------ */

const ACTIVITY_TYPES: {
  id: ActivityInputType;
  label: string;
  Icon: React.ElementType;
  color: string;
}[] = [
  { id: "call",    label: "Llamada",  Icon: Phone,       color: "bg-blue-100 text-blue-600"     },
  { id: "email",   label: "Email",    Icon: Mail,        color: "bg-violet-100 text-violet-600" },
  { id: "meeting", label: "Reunión",  Icon: Users,       color: "bg-amber-100 text-amber-600"   },
  { id: "task",    label: "Tarea",    Icon: CheckSquare, color: "bg-green-100 text-green-600"   },
  { id: "note",    label: "Nota",     Icon: FileText,    color: "bg-gray-100 text-gray-600"     },
];

function activityConfig(type: string) {
  return ACTIVITY_TYPES.find((t) => t.id === type) ?? ACTIVITY_TYPES[4];
}

/* ------------------------------------------------------------------ */
/* Component                                                             */
/* ------------------------------------------------------------------ */

interface ActivityTimelineProps {
  params: ListActivitiesParams;
  newActivityDefaults?: Partial<{ contactId: number; dealId: number }>;
}

export function ActivityTimeline({ params, newActivityDefaults = {} }: ActivityTimelineProps) {
  const queryClient = useQueryClient();
  const { data: activities = [], isLoading } = useListActivities(params);
  const createActivity = useCreateActivity();
  const deleteActivity = useDeleteActivity();
  const updateActivity = useUpdateActivity();
  const { toast } = useToast();

  const [type, setType]         = useState<ActivityInputType>("call");
  const [title, setTitle]       = useState("");
  const [date, setDate]         = useState(() => new Date().toISOString().slice(0, 16));
  const [actNotes, setActNotes] = useState("");
  const [adding, setAdding]     = useState(false);

  const sorted = [...activities].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: getListActivitiesQueryKey(params) });
  }

  function handleAdd() {
    if (!title.trim()) return;
    createActivity.mutate(
      {
        data: {
          type,
          title: title.trim(),
          date,
          notes: actNotes.trim() || undefined,
          ...newActivityDefaults,
        },
      },
      {
        onSuccess: () => {
          invalidate();
          setTitle("");
          setActNotes("");
          setDate(new Date().toISOString().slice(0, 16));
          setAdding(false);
          toast({ title: "Actividad registrada" });
        },
        onError: () => toast({ title: "Error al guardar", variant: "destructive" }),
      }
    );
  }

  function handleToggle(activity: Activity) {
    updateActivity.mutate(
      { id: activity.id, data: { completed: !activity.completed } },
      { onSuccess: invalidate }
    );
  }

  function handleDelete(id: number) {
    deleteActivity.mutate(
      { id },
      {
        onSuccess: () => {
          invalidate();
          toast({ title: "Actividad eliminada" });
        },
        onError: () => toast({ title: "Error al eliminar", variant: "destructive" }),
      }
    );
  }

  return (
    <div className="space-y-4">
      {adding ? (
        <div className="bg-gray-50 rounded-xl border p-4 space-y-3">
          <div className="flex gap-2 flex-wrap">
            {ACTIVITY_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  type === t.id
                    ? t.color + " border-transparent"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <t.Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            ))}
          </div>
          <Input
            placeholder="Título de la actividad…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-sm"
            autoFocus
          />
          <Input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="text-sm"
          />
          <Textarea
            placeholder="Notas opcionales…"
            value={actNotes}
            onChange={(e) => setActNotes(e.target.value)}
            rows={2}
            className="text-sm resize-none"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!title.trim() || createActivity.isPending}
              className="gap-1.5"
            >
              {createActivity.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              Guardar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setAdding(false)}
              className="gap-1.5"
            >
              <X className="w-3.5 h-3.5" /> Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAdding(true)}
          className="w-full gap-2"
        >
          <Plus className="w-4 h-4" /> Registrar actividad
        </Button>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <ListChecks className="w-8 h-8 text-gray-200" />
          <p className="text-sm text-gray-400">Sin actividades todavía</p>
          <p className="text-xs text-gray-300">Registrá llamadas, reuniones, emails…</p>
        </div>
      ) : (
        <div className="relative space-y-1">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-100" />

          {sorted.map((activity) => {
            const cfg = activityConfig(activity.type);
            return (
              <div key={activity.id} className="relative flex gap-3 pl-10">
                <div
                  className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.color}`}
                >
                  <cfg.Icon className="w-3.5 h-3.5" />
                </div>

                <div
                  className={`flex-1 bg-white border rounded-lg p-3 mb-2 transition-opacity ${
                    activity.completed ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium leading-snug ${
                          activity.completed
                            ? "line-through text-gray-400"
                            : "text-gray-900"
                        }`}
                      >
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {format(new Date(activity.date), "d MMM yyyy, HH:mm", {
                          locale: es,
                        })}
                      </p>
                      {activity.notes && (
                        <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                          {activity.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleToggle(activity)}
                        title={activity.completed ? "Marcar pendiente" : "Marcar completo"}
                        className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                          activity.completed
                            ? "bg-green-100 text-green-600 hover:bg-green-200"
                            : "bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(activity.id)}
                        className="w-6 h-6 rounded-md flex items-center justify-center bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-500 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
