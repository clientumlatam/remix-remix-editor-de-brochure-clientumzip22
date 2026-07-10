import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsInRlbmFudElkIjoyLCJlbWFpbCI6ImltcG9ydEB2aWF3ZWIudGVzdCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjUwNjE1MSwiZXhwIjoxNzgzMTEwOTUxfQ.Mwk_PDprYAltRYFCEDHa3Gsra-Gvzsoald8hivFipPM";
const BASE_URL = "http://localhost:80/api";

interface ServiceRow {
  Categoria: string;
  Subcategoria: string;
  Plan: string;
  Servicio: string;
  Precio_Minimo: string;
  Precio_Maximo: string;
  Tiempo_Respuesta: string;
  Descripcion: string;
}

function parseCsv(content: string): ServiceRow[] {
  const lines = content.trim().split("\n");
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h.trim()] = (values[i] ?? "").trim();
    });
    return row as unknown as ServiceRow;
  });
}

function buildSku(categoria: string, subcategoria: string, plan: string): string {
  const cat = categoria
    .replace(/[^a-zA-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 10)
    .toUpperCase();
  const sub = subcategoria
    .replace(/[^a-zA-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 6)
    .toUpperCase();
  return `${cat}-${sub}-${plan.toUpperCase()}`;
}

async function importProducts(rows: ServiceRow[]) {
  let created = 0;
  let failed = 0;

  for (const row of rows) {
    const min = parseInt(row.Precio_Minimo, 10);
    const max = parseInt(row.Precio_Maximo, 10);
    const price = Math.round((min + max) / 2);

    const product = {
      name: row.Servicio,
      description: `${row.Descripcion} | Tiempo de respuesta: ${row.Tiempo_Respuesta} | Precio: $${min.toLocaleString("es-AR")} – $${max.toLocaleString("es-AR")} ARS`,
      price,
      stock: 0,
      sku: buildSku(row.Categoria, row.Subcategoria, row.Plan),
      category: row.Categoria,
    };

    const res = await fetch(`${BASE_URL}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify(product),
    });

    if (res.ok) {
      created++;
      const data = (await res.json()) as { id: number };
      console.log(`  ✓ [${data.id}] ${product.name}`);
    } else {
      failed++;
      const err = await res.text();
      console.error(`  ✗ ${product.name}: ${err}`);
    }
  }

  return { created, failed };
}

async function main() {
  const csvPath = join(__dirname, "../../attached_assets/viaweb_servicios_detallado_1782505938986.csv");
  const content = readFileSync(csvPath, "utf-8");
  const rows = parseCsv(content);

  console.log(`\nImporting ${rows.length} products from Viaweb service catalog...\n`);

  const { created, failed } = await importProducts(rows);

  console.log(`\n✅ Done: ${created} created, ${failed} failed.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
