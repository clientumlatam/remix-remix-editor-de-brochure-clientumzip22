import React, { useState } from 'react';
import { User, Phone, Mail, MapPin, Plus, Pencil, Check, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Seller } from './crmTypes';

const specialties = [
  { value: 'crm', label: '💼 CRM & Ventas' },
  { value: 'chatbot', label: '🤖 Chatbot & IA' },
  { value: 'ecommerce', label: '🛒 E-Commerce' },
  { value: 'marketing', label: '📣 Marketing Digital' },
  { value: 'cloud', label: '☁️ Cloud & Infraestructura' },
  { value: 'capacitacion', label: '🎓 Capacitación' },
  { value: 'general', label: '📋 General' },
];

const specialtyColors: Record<string, string> = {
  crm: 'bg-blue-100 text-blue-700',
  chatbot: 'bg-violet-100 text-violet-700',
  ecommerce: 'bg-orange-100 text-orange-700',
  marketing: 'bg-pink-100 text-pink-700',
  cloud: 'bg-sky-100 text-sky-700',
  capacitacion: 'bg-green-100 text-green-700',
  general: 'bg-gray-100 text-gray-600',
};

interface SellerCardProps { seller: Seller; onEdit: (s: Seller) => void }
const SellerCard = ({ seller, onEdit }: SellerCardProps) => {
  const sp = specialties.find(s => s.value === seller.specialty);
  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-primary">{seller.name?.charAt(0)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-foreground truncate">{seller.name}</h3>
              <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${specialtyColors[seller.specialty] || specialtyColors.general}`}>
                {sp?.label || seller.specialty}
              </span>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-3.5 h-3.5" />
                <a href={`https://wa.me/${seller.phone?.replace(/\D/g, '')}`} className="hover:text-primary text-xs truncate">{seller.phone}</a>
              </div>
              {seller.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="text-xs truncate">{seller.email}</span>
                </div>
              )}
              {seller.branch && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="text-xs truncate">{seller.branch}</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t">
              <span className={`text-xs font-medium ${seller.active ? 'text-green-600' : 'text-red-500'}`}>
                {seller.active ? '● Activo' : '● Inactivo'}
              </span>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onEdit(seller)}>
                <Pencil className="w-3 h-3 mr-1" /> Editar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface SellerFormProps { seller: Seller | null; onSave: (data: Seller) => void; onCancel: () => void }
const SellerForm = ({ seller, onSave, onCancel }: SellerFormProps) => {
  const [form, setForm] = useState<Seller>(seller || { id: '', name: '', phone: '', email: '', specialty: 'general', branch: '', active: true });
  const set = (k: keyof Seller, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-base">{seller ? 'Editar vendedor' : 'Nuevo vendedor'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Nombre completo</label>
            <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Juan García" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Especialidad</label>
            <Select value={form.specialty} onValueChange={v => set('specialty', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {specialties.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">WhatsApp</label>
            <Input value={form.phone || ''} onChange={e => set('phone', e.target.value)} placeholder="+54 299 XXX-XXXX" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
            <Input value={form.email || ''} onChange={e => set('email', e.target.value)} placeholder="vendedor@gaman.com" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Sucursal</label>
            <Input value={form.branch || ''} onChange={e => set('branch', e.target.value)} placeholder="Casa Central" />
          </div>
        </div>
        <div className="flex gap-2 pt-1">
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

interface Props { sellers: Seller[]; onSave: (s: Seller) => void }
export default function CrmFullSellers({ sellers, onSave }: Props) {
  const [editing, setEditing] = useState<Seller | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filterSpec, setFilterSpec] = useState('all');

  const filtered = filterSpec === 'all' ? sellers : sellers.filter(s => s.specialty === filterSpec);

  const handleSave = (data: Seller) => {
    const toSave: Seller = editing?.id
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
          <h1 className="text-3xl font-bold text-foreground mb-1">Vendedores</h1>
          <p className="text-muted-foreground">Equipo de ventas · {sellers.length} vendedores</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" /> Nuevo Vendedor
        </Button>
      </div>

      {showForm && (
        <SellerForm
          seller={editing}
          onSave={handleSave}
          onCancel={() => { setEditing(null); setShowForm(false); }}
        />
      )}

      <div className="flex flex-wrap gap-2">
        <Button variant={filterSpec === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilterSpec('all')}>
          Todos ({sellers.length})
        </Button>
        {specialties.map(s => {
          const count = sellers.filter(v => v.specialty === s.value).length;
          if (!count) return null;
          return (
            <Button key={s.value} variant={filterSpec === s.value ? 'default' : 'outline'} size="sm" onClick={() => setFilterSpec(s.value)}>
              {s.label} ({count})
            </Button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(s => (
          <SellerCard key={s.id} seller={s} onEdit={(seller) => { setEditing(seller); setShowForm(true); }} />
        ))}
      </div>
    </div>
  );
}
