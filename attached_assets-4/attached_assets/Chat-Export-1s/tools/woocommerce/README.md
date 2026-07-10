# Herramientas WooCommerce — Clientum

Scripts para completar la columna **Imágenes** de un export CSV de WooCommerce buscando cada producto por nombre en la API pública de MercadoLibre.

---

## ¿Cuándo usarlo?

Cuando exportás tu catálogo de WooCommerce y los productos no tienen imágenes (o sólo algunas). En lugar de subir fotos a mano, estos scripts buscan cada producto en ML y completan la URL automáticamente. Luego reimportás el CSV y WooCommerce actualiza sólo las imágenes (no duplica productos).

---

## Opción A — Python (recomendado)

### Requisitos
- Python 3.10+
- `pip install requests`

### Uso

```bash
python3 ml_fill_images.py productos-export.csv
```

### Archivos generados
| Archivo | Descripción |
|---|---|
| `productos-export.imagenes.csv` | CSV listo para reimportar en WooCommerce |
| `ml_fill_images.log` | Log detallado de qué se encontró y qué no |
| `ml_fill_images.checkpoint.json` | Punto de control — si el proceso se interrumpe, al re-ejecutar continúa desde donde quedó |

### Reimportar en WooCommerce
1. WordPress → **WooCommerce → Productos → Importar**
2. Subir el `.imagenes.csv` generado
3. WooCommerce actualiza por SKU, sin duplicar productos

---

## Opción B — PHP

### Requisitos
- PHP con extensión `curl` habilitada

```bash
php -m | grep curl   # debe aparecer "curl"
```

### Uso

```bash
php fill-images-from-ml.php productos-export.csv productos-con-imagenes.csv
```

### Archivos generados
| Archivo | Descripción |
|---|---|
| `productos-con-imagenes.csv` | CSV con imágenes completadas |
| `productos-con-imagenes-log.csv` | Log CSV con ID, Nombre y resultado por fila |

> Si el proceso se interrumpe, simplemente volvé a ejecutar el mismo comando: el script detecta el output.csv existente y retoma desde donde quedó.

---

## Configuración de país

Por defecto ambos scripts usan **MLA (Argentina)**. Para otros países cambiá la constante `SITE_ID` al inicio del archivo:

| País | Código |
|---|---|
| Argentina | `MLA` |
| México | `MLM` |
| Colombia | `MCO` |
| Chile | `MLC` |
| Uruguay | `MLU` |

---

## Notas

- Los scripts **nunca pisan** una imagen que ya existe en el CSV.
- La búsqueda intenta obtener la foto en alta resolución del item; si no la consigue, usa el thumbnail del resultado de búsqueda.
- Se agrega una pausa de ~350–600 ms entre requests para no sobrecargar la API de ML.
