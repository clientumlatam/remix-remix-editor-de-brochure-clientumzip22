import React, { useMemo, useState } from 'react';
import { Search, Package, Plus, Pencil, Check, X, ChevronDown, ChevronRight, LayoutGrid, Table as TableIcon } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Product } from './crmTypes';

interface Props {
  products: Product[];
  onSave: (product: Omit<Product, 'id'> | Product) => void;
}

const UNCATEGORIZED = 'Sin categoría';

export default function CrmFullProducts({ products, onSave }: Props) {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Product>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (p.name?.toLowerCase().includes(search.toLowerCase()) ||
            p.code?.toLowerCase().includes(search.toLowerCase()) ||
            p.category?.toLowerCase().includes(search.toLowerCase()) ||
            p.subcategory?.toLowerCase().includes(search.toLowerCase())) &&
          p.active !== false
      ),
    [products, search]
  );

  // Agrupa Categoría > Subcategoría, ordenado alfabéticamente
  const grouped = useMemo(() => {
    const byCategory = new Map<string, Map<string, Product[]>>();
    for (const p of filtered) {
      const cat = p.category || UNCATEGORIZED;
      const sub = p.subcategory || 'General';
      if (!byCategory.has(cat)) byCategory.set(cat, new Map());
      const catMap = byCategory.get(cat)!;
      if (!catMap.has(sub)) catMap.set(sub, []);
      catMap.get(sub)!.push(p);
    }
    return Array.from(byCategory.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([category, subMap]) => ({
        category,
        subcategories: Array.from(subMap.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([subcategory, items]) => ({
            subcategory,
            items: items.sort((a, b) => a.code.localeCompare(b.code)),
          })),
        total: Array.from(subMap.values()).reduce((acc, arr) => acc + arr.length, 0),
      }));
  }, [filtered]);

  const toggleCategory = (cat: string) => setCollapsed((c) => ({ ...c, [cat]: !c[cat] }));

  const handleEdit = (p: Product) => {
    setEditing(p);
    setForm(p);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditing(null);
    setForm({ code: '', name: '', price: undefined, active: true, category: '', subcategory: '', unit: '' });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.code || !form.name) return;
    if (editing) {
      onSave({ ...editing, ...form } as Product);
    } else {
      onSave({
        id: Date.now().toString(),
        code: form.code!,
        name: form.name!,
        price: form.price,
        active: true,
        category: form.category || undefined,
        subcategory: form.subcategory || undefined,
        unit: form.unit || undefined,
      });
    }
    setShowForm(false);
    setEditing(null);
    setForm({});
  };

  const set = (k: keyof Product, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const totalCount = filtered.length;
  const categoryCount = grouped.length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
            <TableIcon className="w-6 h-6 text-primary" />
            Catálogo de Productos y Servicios
          </h1>
          <p className="text-muted-foreground">
            {totalCount} ítems · {categoryCount} categorías · Vista tipo planilla, agrupada y sub-categorizada
          </p>
        </div>
        <Button onClick={handleNew} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" /> Nuevo Ítem
        </Button>
      </div>

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-md p-4 space-y-3">
          <h3 className="text-base font-bold text-slate-800">{editing ? 'Editar ítem' : 'Nuevo ítem'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Código</label>
              <Input value={form.code || ''} onChange={(e) => set('code', e.target.value)} placeholder="PLO-CAN-001" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Nombre</label>
              <Input value={form.name || ''} onChange={(e) => set('name', e.target.value)} placeholder="Caño PP Roscado 1/2&quot;" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Categoría</label>
              <Input value={form.category || ''} onChange={(e) => set('category', e.target.value)} placeholder="Plomería" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Subcategoría</label>
              <Input value={form.subcategory || ''} onChange={(e) => set('subcategory', e.target.value)} placeholder="Caños y Conexiones" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Unidad</label>
              <Input value={form.unit || ''} onChange={(e) => set('unit', e.target.value)} placeholder="un / m² / bolsa" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Precio c/IVA</label>
              <Input
                type="number"
                value={form.price ?? ''}
                onChange={(e) => set('price', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="1850"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={handleSave}>
              <Check className="w-3 h-3 mr-1" /> Guardar
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>
              <X className="w-3 h-3 mr-1" /> Cancelar
            </Button>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por código, nombre, categoría o subcategoría..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11"
        />
      </div>

      {search && (
        <p className="text-sm text-muted-foreground">
          {totalCount} resultado{totalCount !== 1 ? 's' : ''} para "<strong>{search}</strong>"
        </p>
      )}

      {/* Vista tipo planilla (sheet): Categoría > Subcategoría > filas de ítems */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {grouped.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-muted-foreground">
              {search ? `No se encontraron ítems para "${search}"` : 'No hay ítems cargados aún.'}
            </p>
          </div>
        ) : (
          grouped.map((group) => (
            <div key={group.category} className="border-b border-slate-200 last:border-b-0">
              {/* Encabezado de Categoría */}
              <button
                onClick={() => toggleCategory(group.category)}
                className="w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-slate-800 text-white sticky top-0 z-10 cursor-pointer hover:bg-slate-700 transition-colors"
              >
                <span className="flex items-center gap-2 font-bold text-sm">
                  {collapsed[group.category] ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  <LayoutGrid className="w-3.5 h-3.5 text-emerald-400" />
                  {group.category}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 bg-slate-900/50 px-2 py-0.5 rounded-full">
                  {group.total} ítems
                </span>
              </button>

              {!collapsed[group.category] && (
                <div>
                  {group.subcategories.map((sub) => (
                    <div key={sub.subcategory}>
                      {/* Encabezado de Subcategoría */}
                      <div className="px-4 py-1.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                          {sub.subcategory}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{sub.items.length}</span>
                      </div>

                      {/* Filas tipo planilla */}
                      <table className="w-full text-sm border-collapse">
                        <thead className="sr-only">
                          <tr>
                            <th>Código</th>
                            <th>Nombre</th>
                            <th>Unidad</th>
                            <th>Precio</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {sub.items.map((item, idx) => (
                            <tr
                              key={item.id}
                              className={`group border-t border-slate-100 hover:bg-emerald-50/60 transition-colors ${
                                idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                              }`}
                            >
                              <td className="px-4 py-2 w-36 whitespace-nowrap">
                                <span className="inline-block bg-primary/10 text-primary text-[11px] font-mono font-semibold px-2 py-0.5 rounded">
                                  {item.code}
                                </span>
                              </td>
                              <td className="px-2 py-2 text-slate-700 font-medium">{item.name}</td>
                              <td className="px-2 py-2 w-20 text-[11px] text-slate-400 font-mono uppercase text-center">
                                {item.unit || '—'}
                              </td>
                              <td className="px-2 py-2 w-32 text-right font-bold text-slate-800 whitespace-nowrap">
                                {item.price != null ? (item.price === 0 ? 'A consultar' : `$${item.price.toLocaleString('es-AR')}`) : '—'}
                              </td>
                              <td className="px-3 py-2 w-10 text-right">
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
