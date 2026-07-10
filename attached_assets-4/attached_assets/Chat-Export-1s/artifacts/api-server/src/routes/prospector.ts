import { Router, type Request, type Response } from "express";
import { requireAuth, type JwtPayload } from "../lib/auth";

const router = Router();
type AuthReq = Request & { user: JwtPayload };

interface PlaceResult {
  id: string;
  name: string;
  address: string;
  phone: string;
  website: string;
  rating: number;
  reviews: number;
  status: string;
  source?: "google" | "openstreetmap";
}

async function geocodeLocation(location: string): Promise<{ lat: string; lon: string } | null> {
  const q = encodeURIComponent(location);
  const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&countrycodes=ar&addressdetails=0`;
  try {
    const resp = await fetch(url, {
      headers: { "User-Agent": "Clientum-Prospector/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!resp.ok) return null;
    const data = (await resp.json()) as Array<{ lat: string; lon: string }>;
    return data[0] ?? null;
  } catch { return null; }
}

function mapQueryToOSMTags(query: string): string[] {
  const q = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const mapping: Array<[string[], string]> = [
    [["restaurante", "parrilla", "bodegon", "restaurant"], '["amenity"="restaurant"]'],
    [["bar", "pub", "cerveceria"], '["amenity"="bar"]'],
    [["cafe", "cafeteria", "confiteria"], '["amenity"="cafe"]'],
    [["farmacia"], '["amenity"="pharmacy"]'],
    [["supermercado", "almacen"], '["shop"~"supermarket|convenience"]'],
    [["banco", "bank"], '["amenity"="bank"]'],
    [["taller", "mecanico"], '["shop"="car_repair"]'],
    [["panaderia"], '["shop"="bakery"]'],
    [["ferreteria"], '["shop"="hardware"]'],
    [["peluqueria", "barberia"], '["shop"~"hairdresser|barber"]'],
    [["inmobiliaria"], '["shop"="estate_agent"]'],
    [["kiosco"], '["shop"="kiosk"]'],
    [["veterinaria"], '["amenity"="veterinary"]'],
    [["dentista", "odontologia"], '["amenity"="dentist"]'],
    [["clinica", "medico", "salud"], '["amenity"~"clinic|doctors|hospital"]'],
    [["gym", "gimnasio"], '["leisure"~"fitness_centre|gym"]'],
    [["libreria"], '["shop"~"books|stationery"]'],
    [["ropa", "indumentaria"], '["shop"~"clothes|fashion"]'],
    [["electronica"], '["shop"~"electronics|computers"]'],
    [["gasolinera", "nafta", "combustible", "ypf"], '["amenity"="fuel"]'],
  ];
  for (const [keys, tag] of mapping) {
    if (keys.some(k => q.includes(k))) return [tag];
  }
  const safe = query.replace(/['"]/g, "").trim();
  return [`["name"~"${safe}",i]`];
}

function buildAddress(tags: Record<string, string>): string {
  const parts: string[] = [];
  if (tags["addr:street"]) parts.push(tags["addr:street"] + (tags["addr:housenumber"] ? " " + tags["addr:housenumber"] : ""));
  if (tags["addr:city"]) parts.push(tags["addr:city"]);
  if (tags["addr:state"]) parts.push(tags["addr:state"]);
  return parts.join(", ") || tags["addr:full"] || "";
}

async function searchOpenStreetMap(query: string, location: string, maxResults: number): Promise<PlaceResult[]> {
  const geo = await geocodeLocation(location);
  if (!geo) throw new Error(`No se encontró la ubicación "${location}".`);

  const { lat, lon } = geo;
  const radius = 8000;
  const tags = mapQueryToOSMTags(query);
  const nodeLines = tags.map(t => `  node${t}(around:${radius},${lat},${lon});`).join("\n");
  const wayLines  = tags.map(t => `  way${t}(around:${radius},${lat},${lon});`).join("\n");
  const oql = `[out:json][timeout:30];\n(\n${nodeLines}\n${wayLines}\n);\nout body;`;

  const resp = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(oql)}`,
    signal: AbortSignal.timeout(35000),
  });

  if (!resp.ok) throw new Error(`Error del servidor de mapas (${resp.status}).`);

  const data = (await resp.json()) as { elements: Array<{ id: number; type: string; tags?: Record<string, string> }> };
  const seen = new Set<string>();
  const results: PlaceResult[] = [];

  for (const el of data.elements) {
    const t = el.tags ?? {};
    const name = t.name || t["name:es"] || "";
    if (!name) continue;
    const key = name.toLowerCase().trim();
    if (seen.has(key)) continue;
    seen.add(key);

    const phone = t.phone || t["contact:phone"] || t["phone:mobile"] || "";
    const rawWeb = t.website || t["contact:website"] || t["url"] || "";
    const website = rawWeb ? (rawWeb.startsWith("http") ? rawWeb : "https://" + rawWeb) : "";

    results.push({ id: `osm_${el.type}_${el.id}`, name, address: buildAddress(t), phone, website, rating: 0, reviews: 0, status: "OPERATIONAL", source: "openstreetmap" });
    if (results.length >= maxResults) break;
  }

  return results;
}

router.post("/prospector/search", requireAuth, async (req: Request, res: Response) => {
  const { query = "restaurante", location = "Buenos Aires", maxResults = 20 } = req.body as { query?: string; location?: string; maxResults?: number };

  try {
    const results = await searchOpenStreetMap(String(query), String(location), Number(maxResults));
    res.json({ results, source: "openstreetmap", total: results.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    res.json({ results: [], source: "none", total: 0, warning: message });
  }
});

export default router;
