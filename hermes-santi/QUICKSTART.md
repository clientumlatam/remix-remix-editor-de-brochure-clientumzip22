# Santi SDR con Hermes Agent — Quickstart

## 1. Instalar Hermes en tu server (clientum-latam)

```bash
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
```

Si ya tenías algo armado en OpenClaw (el `openclaw.json` con los agentes Santi, Cami, Sofi):

```bash
hermes setup            # detecta ~/.openclaw automáticamente y ofrece migrar
# o manual:
hermes claw migrate --dry-run     # ver qué se importaría, sin tocar nada
hermes claw migrate               # migración real (settings, memoria, skills, API keys)
```

## 2. Configurar el modelo (OpenRouter/Groq, sin lock-in)

```bash
hermes model
# elegís el proveedor y modelo que ya usás en Clientum (OpenRouter o Groq)
```

## 3. Instalar la skill de Santi

Copiar la carpeta `hermes-santi/` a tu directorio de skills de Hermes:

```bash
cp -r hermes-santi ~/.hermes/skills/santi-sdr
```

Santi ya no depende de un CSV: lee leads, contactos y brochures directamente de tu app
AI Prospector vía API. Ver `INTEGRATION.md` para exponer los 4 endpoints necesarios
(`api-routes-scaffold.ts` incluido, listo para adaptar a tu schema de Drizzle).
`prospects.csv` queda solo como fallback/referencia si en algún momento necesitás
correr una campaña manual fuera del CRM.

## 4. Conectar WhatsApp

```bash
hermes gateway add whatsapp
# vas a escanear un QR, igual que hacés para conectar Evolution API
```

Usá el mismo número que ya tenés activo en Clientum (+54 298 451-0883) o uno dedicado a
outreach si preferís separar el número comercial del número de ventas.

## 5. Programar el trabajo diario (cron nativo de Hermes)

Le hablás a Hermes en lenguaje natural para que arme el cron, por ejemplo:

```
hermes
> Todos los días a las 10am, usá la skill santi-sdr para contactar hasta 15 prospectos
  nuevos de prospects.csv que estén en estado "pendiente". Clasificá las respuestas
  recibidas del día anterior. Si hay algún lead CALIENTE o AGENDAR, avisame por
  WhatsApp de inmediato con el resumen. Los TIBIO programalos para follow-up en 3 días.
```

Esto queda corriendo desacoplado — no necesitás tocarlo, solo revisar los avisos de leads calientes.

## 6. Primer test (antes de tirarlo contra las 167)

Corré manualmente contra 5-10 prospectos primero para revisar el tono de los mensajes:

```
hermes
> Usá santi-sdr y contactá solo los primeros 5 prospectos en estado "pendiente" de
  prospects.csv. Mostrame los mensajes antes de enviarlos.
```

Ajustá el `SKILL.md` si el tono no te cierra (ejemplos, casos mencionados, longitud) y después
sí soltalo en automático sobre el resto de la base.

## Límite de WhatsApp — importante
No mandes más de ~15-20 primeros contactos por día por número nuevo. WhatsApp banea números
que mandan volumen alto de mensajes no solicitados de golpe. Es mejor ir escalando en 10-12
días que perder el número el día 1.
