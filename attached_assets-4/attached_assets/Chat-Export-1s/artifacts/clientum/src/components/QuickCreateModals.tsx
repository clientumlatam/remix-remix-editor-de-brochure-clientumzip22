import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateContact,
  useCreateLead,
  useCreateActivity,
  useCreateDeal,
  useListContacts,
  getListContactsQueryKey,
  getListLeadsQueryKey,
  getListActivitiesQueryKey,
  getListDealsQueryKey,
  ActivityInputType,
} from "@workspace/api-client-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";

/* ─── Success banner ────────────────────────────────────────────── */

function SuccessBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm font-medium">
      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
      {message}
    </div>
  );
}

/* ─── Quick Create Contact ──────────────────────────────────────── */

export function QuickCreateContactDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const createContact = useCreateContact();
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "" });

  function reset() {
    setForm({ name: "", email: "", phone: "", company: "" });
    setDone(false);
  }

  function handleOpenChange(o: boolean) {
    if (!o) reset();
    onOpenChange(o);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    createContact.mutate(
      { data: { name: form.name, email: form.email, phone: form.phone || undefined, company: form.company || undefined, status: "prospect" } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListContactsQueryKey() });
          setDone(true);
          setTimeout(() => handleOpenChange(false), 1200);
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Nuevo contacto</DialogTitle>
        </DialogHeader>
        {done ? (
          <div className="py-4">
            <SuccessBanner message="Contacto creado exitosamente" />
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Nombre completo *</Label>
              <Input required autoFocus placeholder="ej: María González" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Email *</Label>
                <Input required type="email" placeholder="email@empresa.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Teléfono</Label>
                <Input type="tel" placeholder="+54 9 11..." value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Empresa</Label>
              <Input placeholder="Nombre de la empresa" value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={createContact.isPending}>
                {createContact.isPending ? "Guardando…" : "Crear contacto"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ─── Quick Create Lead ─────────────────────────────────────────── */

export function QuickCreateLeadDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const createLead = useCreateLead();
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ title: "", value: "", source: "" });

  function reset() {
    setForm({ title: "", value: "", source: "" });
    setDone(false);
  }

  function handleOpenChange(o: boolean) {
    if (!o) reset();
    onOpenChange(o);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    createLead.mutate(
      { data: { title: form.title, value: Number(form.value) || 0, source: form.source || undefined, stage: "new" } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListLeadsQueryKey() });
          setDone(true);
          setTimeout(() => handleOpenChange(false), 1200);
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Nuevo lead</DialogTitle>
        </DialogHeader>
        {done ? (
          <div className="py-4">
            <SuccessBanner message="Lead creado exitosamente" />
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Título *</Label>
              <Input required autoFocus placeholder="ej: Interés en plan Pro" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Valor estimado ($)</Label>
                <Input type="number" min="0" placeholder="0" value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Fuente</Label>
                <Select value={form.source || "none"} onValueChange={v => setForm(p => ({ ...p, source: v === "none" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin especificar</SelectItem>
                    <SelectItem value="website">Sitio web</SelectItem>
                    <SelectItem value="referral">Referido</SelectItem>
                    <SelectItem value="social">Redes sociales</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="cold_call">Llamada en frío</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={createLead.isPending}>
                {createLead.isPending ? "Guardando…" : "Crear lead"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ─── Quick Create Activity ─────────────────────────────────────── */

const ACTIVITY_TYPES: { value: ActivityInputType; label: string }[] = [
  { value: ActivityInputType.call,    label: "Llamada" },
  { value: ActivityInputType.email,   label: "Email" },
  { value: ActivityInputType.meeting, label: "Reunión" },
  { value: ActivityInputType.task,    label: "Tarea" },
  { value: ActivityInputType.note,    label: "Nota" },
];

export function QuickCreateActivityDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const createActivity = useCreateActivity();
  const { data: contacts = [] } = useListContacts();
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    title: "",
    type: ActivityInputType.call as ActivityInputType,
    contactId: "",
    notes: "",
  });

  function reset() {
    setForm({ title: "", type: ActivityInputType.call, contactId: "", notes: "" });
    setDone(false);
  }

  function handleOpenChange(o: boolean) {
    if (!o) reset();
    onOpenChange(o);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    createActivity.mutate(
      {
        data: {
          title: form.title,
          type: form.type,
          contactId: form.contactId ? parseInt(form.contactId) : undefined,
          notes: form.notes || undefined,
          date: new Date().toISOString(),
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListActivitiesQueryKey() });
          setDone(true);
          setTimeout(() => handleOpenChange(false), 1200);
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Nueva actividad</DialogTitle>
        </DialogHeader>
        {done ? (
          <div className="py-4">
            <SuccessBanner message="Actividad registrada exitosamente" />
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Título *</Label>
              <Input required autoFocus placeholder="ej: Llamada de seguimiento" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v as ActivityInputType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Contacto</Label>
                <Select value={form.contactId || "none"} onValueChange={v => setForm(p => ({ ...p, contactId: v === "none" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Sin contacto" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin contacto</SelectItem>
                    {contacts.map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Notas</Label>
              <Textarea rows={2} placeholder="Detalles opcionales…" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={createActivity.isPending}>
                {createActivity.isPending ? "Guardando…" : "Guardar"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ─── Quick Create Deal ─────────────────────────────────────────── */

export function QuickCreateDealDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const createDeal = useCreateDeal();
  const { data: contacts = [] } = useListContacts();
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ title: "", value: "", stage: "discovery", contactId: "" });

  function reset() {
    setForm({ title: "", value: "", stage: "discovery", contactId: "" });
    setDone(false);
  }

  function handleOpenChange(o: boolean) {
    if (!o) reset();
    onOpenChange(o);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    createDeal.mutate(
      {
        data: {
          title: form.title,
          value: Number(form.value) || 0,
          stage: form.stage as "discovery",
          contactId: form.contactId ? parseInt(form.contactId) : undefined,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListDealsQueryKey() });
          setDone(true);
          setTimeout(() => handleOpenChange(false), 1200);
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Nuevo deal</DialogTitle>
        </DialogHeader>
        {done ? (
          <div className="py-4">
            <SuccessBanner message="Deal creado exitosamente" />
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Título *</Label>
              <Input required autoFocus placeholder="ej: Propuesta Plan Anual" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Valor ($)</Label>
                <Input type="number" min="0" placeholder="0" value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Etapa</Label>
                <Select value={form.stage} onValueChange={v => setForm(p => ({ ...p, stage: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discovery">Descubrimiento</SelectItem>
                    <SelectItem value="proposal">Propuesta</SelectItem>
                    <SelectItem value="negotiation">Negociación</SelectItem>
                    <SelectItem value="contract">Contrato</SelectItem>
                    <SelectItem value="closed_won">Ganado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Contacto</Label>
              <Select value={form.contactId || "none"} onValueChange={v => setForm(p => ({ ...p, contactId: v === "none" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Sin contacto" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin contacto</SelectItem>
                  {contacts.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={createDeal.isPending}>
                {createDeal.isPending ? "Guardando…" : "Crear deal"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
