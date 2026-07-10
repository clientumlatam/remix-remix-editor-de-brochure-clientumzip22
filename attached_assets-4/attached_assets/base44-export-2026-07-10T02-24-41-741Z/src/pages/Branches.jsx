const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';

import { MapPin, Phone, Clock, Plus, Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const BranchCard = ({ branch, onEdit }) => (
  <Card className="overflow-hidden hover:shadow-md transition-shadow border-0 shadow-sm">
    <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent pb-4 pt-5">
      <div className="flex items-start justify-between">
        <CardTitle className="text-lg">{branch.name}</CardTitle>
        <div className="flex gap-1">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
            branch.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {branch.active ? '● Activa' : '● Inactiva'}
          </span>
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-4 pt-5">
      <div className="flex items-start gap-3">
        <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium">{branch.address}</p>
          {branch.city && <p className="text-xs text-muted-foreground">{branch.city}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Phone className="w-4 h-4 text-primary flex-shrink-0" />
        <a href={`tel:${branch.phone}`} className="text-sm text-primary hover:underline">{branch.phone}</a>
      </div>
      <div className="flex items-start gap-3">
        <Clock className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
        <div>
          {branch.schedule?.split('|').map((t, i) => (
            <p key={i} className="text-xs text-muted-foreground">{t.trim()}</p>
          ))}
        </div>
      </div>
      <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => onEdit(branch)}>
        <Pencil className="w-3 h-3 mr-2" /> Editar sucursal
      </Button>
    </CardContent>
  </Card>
);

const BranchForm = ({ branch, onSave, onCancel, isLoading }) => {
  const [form, setForm] = useState(branch || { name: '', address: '', phone: '', schedule: '', city: '', active: true });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Card className="border-primary/30 shadow-md border-0">
      <CardHeader>
        <CardTitle className="text-base">{branch ? 'Editar sucursal' : 'Nueva sucursal'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Nombre</label>
            <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Casa Central" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Ciudad</label>
            <Input value={form.city} onChange={e => set('city', e.target.value)} placeholder="Neuquén" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Dirección</label>
            <Input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Av. San Martín 1250" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Teléfono</label>
            <Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+54 299 XXX-XXXX" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Horarios (separar turnos con |)</label>
            <Input value={form.schedule} onChange={e => set('schedule', e.target.value)} placeholder="Lun-Vie 8:00-18:00 | Sáb 8:00-13:00" />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button size="sm" onClick={() => onSave(form)} disabled={isLoading}>
            <Check className="w-3 h-3 mr-1" /> Guardar
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>
            <X className="w-3 h-3 mr-1" /> Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Branches() {
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const qc = useQueryClient();

  const { data: branches = [], isLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: () => db.entities.Branch.list(),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editing?.id
      ? db.entities.Branch.update(editing.id, data)
      : db.entities.Branch.create(data),
    onSuccess: () => { qc.invalidateQueries(['branches']); setEditing(null); setShowForm(false); },
  });

  const handleEdit = (branch) => { setEditing(branch); setShowForm(true); };
  const handleNew = () => { setEditing(null); setShowForm(true); };
  const handleCancel = () => { setEditing(null); setShowForm(false); };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Sucursales</h1>
          <p className="text-muted-foreground">4 sucursales en Neuquén Capital</p>
        </div>
        <Button onClick={handleNew} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" /> Nueva Sucursal
        </Button>
      </div>

      {showForm && (
        <BranchForm
          branch={editing}
          onSave={(data) => saveMutation.mutate(data)}
          onCancel={handleCancel}
          isLoading={saveMutation.isPending}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <Card key={i} className="h-56 animate-pulse bg-muted border-0" />)
        ) : (
          branches.map((b) => <BranchCard key={b.id} branch={b} onEdit={handleEdit} />)
        )}
      </div>
    </div>
  );
}