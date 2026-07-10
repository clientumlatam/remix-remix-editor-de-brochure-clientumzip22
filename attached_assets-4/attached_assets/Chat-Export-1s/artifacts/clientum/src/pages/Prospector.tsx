import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, MapPin, Phone, Globe, Star, Loader2, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface PlaceResult {
  id: string;
  name: string;
  address: string;
  phone: string;
  website: string;
  rating: number;
  reviews: number;
  status: string;
  source?: string;
}

export default function Prospector() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [query, setQuery] = useState("ferretería");
  const [location, setLocation] = useState("Buenos Aires");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [source, setSource] = useState<string | null>(null);

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const searchMutation = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/prospector/search", {
        method: "POST", headers,
        body: JSON.stringify({ query, location, maxResults: 30 }),
      });
      return r.json() as Promise<{ results: PlaceResult[]; source: string; total: number; warning?: string }>;
    },
    onSuccess: (data) => {
      setResults(data.results);
      setSource(data.source);
      setSelected(new Set());
      if (data.warning) toast({ title: "Aviso", description: data.warning });
      else toast({ title: `${data.total} resultados encontrados` });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === results.length) setSelected(new Set());
    else setSelected(new Set(results.map(r => r.id)));
  };

  const exportCSV = () => {
    const sel = results.filter(r => selected.has(r.id));
    const csv = ["Nombre,Dirección,Teléfono,Sitio Web,Rating,Reseñas"].concat(
      sel.map(r => [r.name, r.address, r.phone, r.website, r.rating, r.reviews].map(v => `"${v}"`).join(","))
    ).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "prospectos.csv"; a.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Prospector</h1>
        <p className="text-muted-foreground">Encontrá negocios y potenciales clientes en tu zona</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Tipo de negocio (ej: ferretería, restaurante...)" value={query} onChange={e => setQuery(e.target.value)} />
            </div>
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Ciudad o barrio" value={location} onChange={e => setLocation(e.target.value)} />
            </div>
            <Button onClick={() => searchMutation.mutate()} disabled={searchMutation.isPending || !query || !location} className="shrink-0">
              {searchMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={toggleAll} className="text-xs">
                {selected.size === results.length ? "Ninguno" : "Todos"}
              </Button>
              <span className="text-sm text-muted-foreground">{selected.size} seleccionados</span>
              {source && <Badge variant="outline" className="text-xs">{source === "openstreetmap" ? "OpenStreetMap" : "Google Maps"}</Badge>}
            </div>
            {selected.size > 0 && (
              <Button size="sm" variant="outline" onClick={exportCSV}>
                <Download className="w-4 h-4 mr-2" />Exportar CSV
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {results.map(place => (
              <Card key={place.id} className={`transition-colors ${selected.has(place.id) ? "border-primary/50 bg-primary/5" : ""}`}>
                <CardContent className="py-3 flex items-start gap-3">
                  <Checkbox className="mt-1" checked={selected.has(place.id)} onCheckedChange={() => toggle(place.id)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <p className="font-medium">{place.name}</p>
                      {place.rating > 0 && (
                        <span className="flex items-center gap-1 text-xs text-amber-600 flex-shrink-0">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />{place.rating.toFixed(1)} ({place.reviews})
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                      {place.address && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{place.address}</span>}
                      {place.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{place.phone}</span>}
                      {place.website && <a href={place.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary"><Globe className="w-3 h-3" />{place.website.replace(/^https?:\/\//, "").slice(0, 30)}</a>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {!searchMutation.isPending && results.length === 0 && searchMutation.isIdle && (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Buscá negocios por rubro y ubicación</p>
        </div>
      )}
    </div>
  );
}
