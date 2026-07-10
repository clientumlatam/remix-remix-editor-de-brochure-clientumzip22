import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calendar, Phone, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Appointment {
  id: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  serviceType: string;
  notes: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  completed: "Completado",
  cancelled: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function Appointments() {
  const { token } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [form, setForm] = useState({
    contactName: "", contactPhone: "", contactEmail: "",
    serviceType: "Consulta", notes: "", scheduledAt: "", durationMinutes: 60,
  });

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const { data, isLoading } = useQuery({
    queryKey: ["appointments", filterStatus],
    queryFn: async () => {
      const params = filterStatus !== "all" ? `?status=${filterStatus}` : "";
      const r = await fetch(`/api/appointments${params}`, { headers });
      return r.json() as Promise<{ appointments: Appointment[]; total: number }>;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["appointments-stats"],
    queryFn: async () => {
      const r = await fetch("/api/appointments/stats", { headers });
      return r.json() as Promise<{ stats: Record<string, number> }>;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (body: typeof form) => {
      const r = await fetch("/api/appointments", { method: "POST", headers, body: JSON.stringify(body) });
      if (!r.ok) throw new Error((await r.json()).error ?? "No se pudo crear el turno.");
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["appointments"] }); qc.invalidateQueries({ queryKey: ["appointments-stats"] }); setOpen(false); setForm({ contactName: "", contactPhone: "", contactEmail: "", serviceType: "Consulta", notes: "", scheduledAt: "", durationMinutes: 60 }); toast({ title: "Turno creado" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const r = await fetch(`/api/appointments/${id}`, { method: "PATCH", headers, body: JSON.stringify({ status }) });
      if (!r.ok) throw new Error((await r.json()).error ?? "No se pudo actualizar el turno.");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["appointments"] }); qc.invalidateQueries({ queryKey: ["appointments-stats"] }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const s = stats?.stats;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Turnos</h1>
          <p className="text-muted-foreground">Gestión de turnos y citas</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Nuevo turno</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nuevo turno</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Nombre del cliente *" value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))} />
              <Input placeholder="Teléfono *" value={form.contactPhone} onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))} />
              <Input placeholder="Email" value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))} />
              <Input placeholder="Tipo de servicio" value={form.serviceType} onChange={e => setForm(f => ({ ...f, serviceType: e.target.value }))} />
              <Input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))} />
              <Input placeholder="Notas" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              <Button className="w-full" onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending || !form.contactName || !form.contactPhone || !form.scheduledAt}>
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Crear turno
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {s && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Pendientes", val: s.pending, color: "text-yellow-600" },
            { label: "Confirmados", val: s.confirmed, color: "text-green-600" },
            { label: "Completados", val: s.completed, color: "text-blue-600" },
            { label: "Cancelados", val: s.cancelled, color: "text-red-600" },
          ].map(({ label, val, color }) => (
            <Card key={label}>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{val ?? 0}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="confirmed">Confirmados</SelectItem>
            <SelectItem value="completed">Completados</SelectItem>
            <SelectItem value="cancelled">Cancelados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {(data?.appointments ?? []).length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No hay turnos para mostrar</CardContent></Card>
          ) : (
            (data?.appointments ?? []).map(appt => (
              <Card key={appt.id}>
                <CardContent className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{appt.contactName}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{appt.contactPhone}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(appt.scheduledAt).toLocaleString("es-AR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{appt.durationMinutes} min</span>
                        <span>{appt.serviceType}</span>
                      </div>
                      {appt.notes && <p className="text-xs text-muted-foreground mt-1">{appt.notes}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge className={STATUS_COLORS[appt.status] ?? ""}>{STATUS_LABELS[appt.status] ?? appt.status}</Badge>
                    {appt.status === "pending" && (
                      <>
                        <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => updateStatus.mutate({ id: appt.id, status: "confirmed" })}>
                          <CheckCircle className="w-3 h-3 mr-1 text-green-600" />Confirmar
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => updateStatus.mutate({ id: appt.id, status: "cancelled" })}>
                          <XCircle className="w-3 h-3 mr-1 text-red-600" />Cancelar
                        </Button>
                      </>
                    )}
                    {appt.status === "confirmed" && (
                      <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => updateStatus.mutate({ id: appt.id, status: "completed" })}>
                        <CheckCircle className="w-3 h-3 mr-1 text-blue-600" />Completar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
