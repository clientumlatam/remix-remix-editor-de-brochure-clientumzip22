#!/bin/bash
# setup-hermes.sh — configura Hermes para consumir la API local de AI Prospector
# Completá las 3 variables de abajo y corré: bash setup-hermes.sh

set -e

BASE_URL="http://localhost:PUERTO/api"     # <-- reemplazar PUERTO por el que mostró pm2 logs
API_KEY="TU_SANTI_API_KEY_ACA"             # <-- la key que quedó en el .env / Secrets de Replit

echo "== 1. Guardando credenciales en Hermes =="
hermes secrets set AI_PROSPECTOR_BASE_URL "$BASE_URL"
hermes secrets set SANTI_API_KEY "$API_KEY"

echo "== 2. Probando el endpoint de leads =="
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$BASE_URL/leads?status=pendiente&limit=3" \
  -H "x-api-key: $API_KEY")

STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo "$BODY"
echo ""

if [ "$STATUS" == "200" ]; then
  echo "✅ Conexión OK. La API está devolviendo leads."
elif [ "$STATUS" == "401" ]; then
  echo "❌ 401 — la API_KEY no coincide. Revisá el .env del proyecto vs lo que pusiste acá arriba."
  exit 1
elif [ "$STATUS" == "404" ]; then
  echo "❌ 404 — la ruta no existe en ese path. Confirmá con el código/Replit el path exacto que quedó montado."
  exit 1
else
  echo "❌ Status $STATUS inesperado — revisar logs de la app (pm2 logs ai-prospector)."
  exit 1
fi

echo ""
echo "== 3. Próximo paso manual =="
echo "Abrí 'hermes' y pegá esto para que Santi use la API real:"
echo ""
echo '  Actualizá la skill santi-sdr: los endpoints de leads, brochure, status y notes'
echo '  ahora están en AI_PROSPECTOR_BASE_URL, autenticados con header x-api-key usando'
echo '  SANTI_API_KEY. Dejá de usar prospects.csv como fuente de datos.'
echo ""
echo "Después corré el test manual de 5 leads antes de activar el cron (ver GO-LIVE.md paso 5)."
