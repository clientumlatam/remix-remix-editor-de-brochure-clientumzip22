#!/bin/bash
# setup-local.sh — baja AI Prospector desde git y lo deja corriendo persistente con pm2
# Uso: ajustar REPO_URL y PROJECT_DIR, después: bash setup-local.sh

set -e

REPO_URL="https://github.com/[tu-usuario]/[tu-repo-ai-prospector].git"
PROJECT_DIR="$HOME/ai-prospector"
PM2_NAME="ai-prospector"

echo "== 1. Clonando/actualizando repo =="
if [ -d "$PROJECT_DIR" ]; then
  cd "$PROJECT_DIR" && git pull
else
  git clone "$REPO_URL" "$PROJECT_DIR"
  cd "$PROJECT_DIR"
fi

echo "== 2. Instalando dependencias =="
if [ -f pnpm-lock.yaml ]; then
  pnpm install
elif [ -f yarn.lock ]; then
  yarn install
else
  npm install
fi

echo "== 3. Verificando .env =="
if [ ! -f .env ]; then
  echo "⚠️  No hay .env en $PROJECT_DIR — copialo manualmente desde Replit (Secrets) antes de seguir."
  echo "    Necesita al menos: DATABASE_URL, SANTI_API_KEY, y las keys de IA que use el generador de brochures."
  exit 1
fi

echo "== 4. Instalando pm2 si no está =="
if ! command -v pm2 &> /dev/null; then
  npm install -g pm2
fi

echo "== 5. Levantando la app con pm2 =="
pm2 delete "$PM2_NAME" 2>/dev/null || true
pm2 start "npm run start" --name "$PM2_NAME"
pm2 save

echo "== 6. Dejando pm2 arrancando solo al bootear =="
pm2 startup | tail -n 1

echo ""
echo "✅ Listo. Verificá el puerto en el log de pm2:"
echo "   pm2 logs $PM2_NAME --lines 20"
echo ""
echo "Después probá:"
echo '   curl -s "http://localhost:PUERTO/api/leads?status=pendiente&limit=3" -H "x-api-key: TU_KEY"'
