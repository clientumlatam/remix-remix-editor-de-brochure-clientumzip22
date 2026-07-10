import React, { useState } from 'react';
import { MapPin, Phone, Clock, Plus, Pencil, Check, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Branch } from './crmTypes';

interface BranchCardProps { branch: Branch; onEdit: (b: Branch) => void }
const BranchCard = ({ branch, onEdit }: BranchCardProps) => (
  <Card className="overflow-hidden hover:shadow-md transition-shadow border-0 shadow-sm">
    <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent pb-4 pt-5">
      <div className="flex items-start justify-between">
        <CardTitle className="text-lg">{branch.name}</CardTitle>
        <div className="flex gap-1">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${branch.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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

interface BranchFormProps { branch: Branch | null; onSave: (b: Branch) => void; onCancel: () => void }
const BranchForm = ({ branch, onSave, onCancel }: BranchFormProps) => {
  const [form, setForm] = useState<Branch>(branch || { id: '', name: '', address: '', phone: '', schedule: '', city: '', active: true });
  const set = (k: keyof Branch, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Card className="border-0 shadow-md">
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
            <Input value={form.city || ''} onChange={e => set('city', e.target.value)} placeholder="Neuquén" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Dirección</label>
            <Input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Av. San Martín 1250" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Teléfono</label>
            <Input value={form.phone || ''} onChange={e => set('phone', e.target.value)} placeholder="+54 299 XXX-XXXX" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Horarios (separar turnos con |)</label>
            <Input value={form.schedule || ''} onChange={e => set('schedule', e.target.value)} placeholder="Lun-Vie 8:00-18:00 | Sáb 8:00-13:00" />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button size="sm" onClick={() => onSave(form)}>
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

interface Props { branches: Branch[]; onSave: (b: Branch) => void }
export default function CrmFullBranches({ branches, onSave }: Props) {
  const [editing, setEditing] = useState<Branch | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleEdit = (b: Branch) => { setEditing(b); setShowForm(true); };
  const handleNew = () => { setEditing(null); setShowForm(true); };
  const handleCancel = () => { setEditing(null); setShowForm(false); };

  const handleSave = (data: Branch) => {
    const toSave: Branch = editing?.id
      ? { ...data, id: editing.id }
      : { ...data, id: Date.now().toString() };
    onSave(toSave);
    setEditing(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Sucursales</h1>
          <p className="text-muted-foreground">{branches.length} sucursales registradas</p>
        </div>
        <Button onClick={handleNew} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" /> Nueva Sucursal
        </Button>
      </div>

      {showForm && (
        <BranchForm branch={editing} onSave={handleSave} onCancel={handleCancel} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {branches.map((b) => <BranchCard key={b.id} branch={b} onEdit={handleEdit} />)}
      </div>
    </div>
  );
}
