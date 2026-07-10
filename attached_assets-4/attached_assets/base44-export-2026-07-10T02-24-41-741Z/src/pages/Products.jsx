const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';

import { Search, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';

export default function Products() {
  const [search, setSearch] = useState('');

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => db.entities.Product.list(),
  });

  const filtered = products.filter(p =>
    (p.name?.toLowerCase().includes(search.toLowerCase()) ||
     p.code?.toLowerCase().includes(search.toLowerCase())) &&
    p.active !== false
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Productos</h1>
        <p className="text-muted-foreground">Catálogo completo · {products.length} productos cargados</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por código o nombre de producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11"
        />
      </div>

      {search && (
        <p className="text-sm text-muted-foreground">
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} para "<strong>{search}</strong>"
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          Array(8).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse border-0 shadow-sm">
              <CardContent className="p-5 space-y-3">
                <div className="h-3 bg-muted rounded w-1/3" />
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-6 bg-muted rounded w-1/2 mt-4" />
              </CardContent>
            </Card>
          ))
        ) : filtered.length > 0 ? (
          filtered.slice(0, 200).map((product) => (
            <Card key={product.id} className="border-0 shadow-sm hover:shadow-md transition-shadow group">
              <CardContent className="p-5">
                <div className="space-y-3">
                  <div className="inline-block bg-primary/10 text-primary text-xs font-mono font-semibold px-2 py-1 rounded">
                    {product.code}
                  </div>
                  <p className="text-sm text-foreground font-medium leading-snug line-clamp-2 min-h-[2.5rem]">
                    {product.name}
                  </p>
                  {product.price != null && (
                    <div className="pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-0.5">Precio c/IVA</p>
                      <p className="text-xl font-bold text-primary">
                        ${product.price.toLocaleString('es-AR')}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-16">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-muted-foreground">No se encontraron productos para "<strong>{search}</strong>"</p>
          </div>
        )}
      </div>

      {filtered.length > 200 && (
        <p className="text-sm text-center text-muted-foreground">
          Mostrando los primeros 200 resultados. Refiná la búsqueda para ver más.
        </p>
      )}
    </div>
  );
}