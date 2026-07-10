#!/usr/bin/env python3
"""
Completa la columna "Imágenes" de un CSV de exportación de WooCommerce
buscando cada producto por nombre en MercadoLibre.

Uso:
    pip install requests
    python3 ml_fill_images.py wc-product-export.csv

Genera:
    wc-product-export.imagenes.csv   -> listo para reimportar en WooCommerce
    ml_fill_images.log               -> log de qué se encontró y qué no
    ml_fill_images.checkpoint.json   -> progreso (permite cortar y reanudar)

Reimportación en WordPress:
    Productos -> Exportar/Importar -> Importar -> subir el CSV generado.
    WooCommerce actualiza por SKU automáticamente (no duplica productos),
    así que solo se va a tocar la columna Imágenes.
"""

import csv
import json
import re
import sys
import time
from pathlib import Path

import requests

SITE_ID = "MLA"  # Argentina. Cambiar a MLM/MCO/MLC/etc si hace falta.
DELAY_SECONDS = 0.6  # pausa entre requests para no pegarle fuerte a la API de ML
SEARCH_URL = "https://api.mercadolibre.com/sites/{site}/search"
ITEM_URL = "https://api.mercadolibre.com/items/{item_id}"

CHECKPOINT_FILE = "ml_fill_images.checkpoint.json"
LOG_FILE = "ml_fill_images.log"


def clean_name(name: str) -> str:
    """Saca códigos/prefijos típicos del nombre antes de buscar en ML."""
    name = re.sub(r"^\(?\w{2,10}\)?[\.\-]\s*", "", name)  # ej: "(51IN1) " o "106 "
    name = re.sub(r"\s+", " ", name).strip()
    return name


def search_ml_image(query: str) -> str | None:
    try:
        resp = requests.get(
            SEARCH_URL.format(site=SITE_ID),
            params={"q": query, "limit": 1},
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()
        results = data.get("results") or []
        if not results:
            return None
        item = results[0]

        # Pedimos el detalle del item para traer la imagen en mejor resolución
        item_id = item.get("id")
        if item_id:
            try:
                detail_resp = requests.get(ITEM_URL.format(item_id=item_id), timeout=15)
                detail_resp.raise_for_status()
                detail = detail_resp.json()
                pictures = detail.get("pictures") or []
                if pictures:
                    return pictures[0]["url"]
            except requests.RequestException:
                pass

        thumb = item.get("thumbnail")
        if thumb:
            return thumb.replace("-I.jpg", "-O.jpg")
    except requests.RequestException as e:
        log(f"  ! error de red buscando '{query}': {e}")
    return None


def log(msg: str):
    print(msg)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(msg + "\n")


def load_checkpoint() -> dict:
    if Path(CHECKPOINT_FILE).exists():
        return json.loads(Path(CHECKPOINT_FILE).read_text(encoding="utf-8"))
    return {}


def save_checkpoint(data: dict):
    Path(CHECKPOINT_FILE).write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")


def main():
    if len(sys.argv) < 2:
        print("Uso: python3 ml_fill_images.py archivo.csv")
        sys.exit(1)

    input_path = Path(sys.argv[1])
    output_path = input_path.with_suffix("")  # sin .csv
    output_path = Path(str(output_path) + ".imagenes.csv")

    with open(input_path, encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        rows = list(reader)

    if "Imágenes" not in fieldnames:
        print('El CSV no tiene columna "Imágenes". Revisá el export de WooCommerce.')
        sys.exit(1)

    checkpoint = load_checkpoint()  # { product_id: url_or_null }
    total = len(rows)
    found = 0
    skipped_existing = 0
    not_found = 0

    log(f"=== Iniciando: {total} productos en {input_path.name} ===")

    for idx, row in enumerate(rows, start=1):
        product_id = row.get("ID", "").strip()
        name = (row.get("Nombre") or "").strip()
        existing_image = (row.get("Imágenes") or "").strip()

        if existing_image:
            skipped_existing += 1
            continue

        if not name or name.lower() == "producto":
            # fila vacía / cabecera basura típica de algunos exports
            continue

        if product_id in checkpoint:
            cached = checkpoint[product_id]
            if cached:
                row["Imágenes"] = cached
                found += 1
            else:
                not_found += 1
            continue

        query = clean_name(name)
        print(f"[{idx}/{total}] Buscando: {query}")

        image_url = search_ml_image(query)

        if image_url:
            row["Imágenes"] = image_url
            found += 1
            log(f"[{idx}/{total}] OK  {name}  ->  {image_url}")
        else:
            not_found += 1
            log(f"[{idx}/{total}] SIN RESULTADO  {name}")

        checkpoint[product_id] = image_url
        save_checkpoint(checkpoint)

        # guardado incremental del CSV de salida cada 25 productos
        if idx % 25 == 0:
            write_csv(output_path, fieldnames, rows)

        time.sleep(DELAY_SECONDS)

    write_csv(output_path, fieldnames, rows)

    log("=== Resumen ===")
    log(f"Total productos: {total}")
    log(f"Ya tenían imagen (omitidos): {skipped_existing}")
    log(f"Imagen encontrada en ML: {found}")
    log(f"Sin resultado en ML: {not_found}")
    log(f"CSV de salida: {output_path}")


def write_csv(path: Path, fieldnames, rows):
    with open(path, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


if __name__ == "__main__":
    main()
