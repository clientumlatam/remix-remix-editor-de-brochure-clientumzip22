# Paso final — conectar Hermes a la API local y activar Santi

Todo corre en la misma máquina Ubuntu: la app AI Prospector (adaptada en Replit, después
bajada a local) y Hermes. Simplifica todo: comunicación por localhost, sin túneles ni
Deployments de Replit.

## 0. Traer el código de Replit a tu Ubuntu local

Si ya corriste el prompt en Replit y quedó andando ahí, bajalo a tu máquina:

```bash
git clone https://github.com/[tu-usuario]/[tu-repo-ai-prospector].git
cd [tu-repo-ai-prospector]
# o si Replit no está en git todavía: usar el botón "Download as zip" del proyecto
```

Instalá dependencias y copiá tu `.env` real (DB, API keys) al local:

```bash
pnpm install   # o npm/yarn según cómo esté armado el proyecto
```

## 1. Mantener la app corriendo de forma persistente (no solo `npm run dev`)

Para que Santi pueda pegarle a la API en cualquier momento del día (no solo cuando tengas
la terminal abierta), corré la app con un process manager:

```bash
npm install -g pm2
pm2 start "npm run start" --name ai-prospector
pm2 save
pm2 startup   # deja el comando para que pm2 arranque solo al bootear el server
```

Confirmá el puerto en el que queda escuchando (ej. `http://localhost:3000`).

## 2. Guardar las credenciales del lado de Hermes

```bash
hermes secrets set AI_PROSPECTOR_BASE_URL "http://localhost:3000/api"
hermes secrets set SANTI_API_KEY "[la key que generó Replit / la que pusiste en .env]"
```

Como todo está en la misma máquina, no hace falta exponer nada a internet ni usar
Cloudflare Tunnel para esto — solo tráfico local entre procesos.

## 3. Decirle a Hermes que use la API real

```
hermes
> Actualizá la skill santi-sdr: los endpoints de leads, brochure, status y notes ahora
  están en AI_PROSPECTOR_BASE_URL (variable de entorno), autenticados con el header
  x-api-key usando SANTI_API_KEY. Dejá de usar prospects.csv como fuente de datos.
```

## 4. Probar un endpoint suelto antes del cron

```bash
curl -s "http://localhost:3000/api/leads?status=pendiente&limit=3" \
  -H "x-api-key: [la key]"
```

JSON con leads reales → listo. 401 → revisá la key. 404/500 → confirmá con Replit/tu código
el path exacto que quedó montado.

## 5. Test manual con 5 leads (antes del cron completo)

```
hermes
> Usá santi-sdr, traé los primeros 5 leads en estado pendiente desde la API, generá los
  mensajes de primer contacto usando el brochure de cada uno, y mostrámelos ANTES de
  enviar nada.
```

Revisá tono y precisión del gancho del brochure. Ajustá `SKILL.md` si hace falta.

## 6. Activar el cron diario

```
hermes
> Todos los días a las 10am, usá santi-sdr para: traer hasta 15 leads pendientes de la
  API, contactarlos por WhatsApp con mensaje personalizado por brochure, clasificar
  las respuestas del día anterior, actualizar status en la API vía PATCH, loguear
  resumen vía POST notes, y avisarme por WhatsApp de inmediato si hay algún lead
  caliente o que pidió agendar.
```

## Único riesgo real de este setup
Todo vive en una sola máquina: si el Ubuntu local se apaga, se reinicia sin `pm2 startup`
configurado, o se corta la luz/internet, Santi deja de poder contactar leads y de ver
respuestas hasta que la máquina vuelva. Si tu local no es 24/7 (notebook que cerrás, etc.),
esto es una limitación real a tener en cuenta — considerá migrar a clientum-latam (siempre
encendido) más adelante si esto empieza a andar bien y necesitás que corra sin depender de
que tu máquina esté prendida.

## Checklist para hoy
- [ ] Código de Replit bajado y corriendo local
- [ ] App persistente con pm2 (no `npm run dev` en una terminal que se puede cerrar)
- [ ] `AI_PROSPECTOR_BASE_URL=http://localhost:3000/api` y `SANTI_API_KEY` seteados en Hermes
- [ ] curl de prueba devuelve leads reales
- [ ] Test manual de 5 mensajes revisado y aprobado
- [ ] Cron activado con límite de 15/día
