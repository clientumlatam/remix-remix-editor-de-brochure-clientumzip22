#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# build-for-wp.sh
#
# Compila la app React de Clientum AI Prospector como bundle listo para
# WordPress y lo copia a assets/js/ y assets/css/ del plugin.
#
# Requisitos:
#   - Node.js >= 18 instalado
#   - Correr desde la raíz del proyecto React (donde está package.json)
#
# Uso:
#   bash clientum-wp-theme/clientum-ai-prospector/build-for-wp.sh
#
# O agregarlo como npm script:
#   npm run build:wp
# ─────────────────────────────────────────────────────────────────────────────
set -e

PLUGIN_DIR="clientum-wp-theme/clientum-ai-prospector"
DIST_DIR="$PLUGIN_DIR/dist-wp"
ASSETS_JS="$PLUGIN_DIR/assets/js"
ASSETS_CSS="$PLUGIN_DIR/assets/css"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║      Clientum AI Prospector — Build para WordPress           ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# 1. Verificar que estamos en la raíz correcta
if [ ! -f "package.json" ]; then
  echo "❌ Error: corré este script desde la raíz del proyecto (donde está package.json)"
  exit 1
fi

# 2. Instalar dependencias si hace falta
if [ ! -d "node_modules" ]; then
  echo "📦 Instalando dependencias..."
  npm install
fi

# 3. Compilar con Vite usando el config de WP
echo "🔨 Compilando con Vite..."
npx vite build --config "$PLUGIN_DIR/vite.wp.config.ts"

# 4. Crear carpetas de destino
mkdir -p "$ASSETS_JS"
mkdir -p "$ASSETS_CSS"

# 5. Copiar los archivos compilados
echo "📁 Copiando assets al plugin..."

JS_FILE=$(ls "$DIST_DIR"/*.js 2>/dev/null | head -1)
CSS_FILE=$(ls "$DIST_DIR"/*.css 2>/dev/null | head -1)

if [ -n "$JS_FILE" ]; then
  cp "$JS_FILE" "$ASSETS_JS/clientum-prospector.js"
  echo "   ✅ JS  → $ASSETS_JS/clientum-prospector.js ($(du -sh "$ASSETS_JS/clientum-prospector.js" | cut -f1))"
else
  echo "   ❌ No se encontró archivo JS en $DIST_DIR"
  exit 1
fi

if [ -n "$CSS_FILE" ]; then
  cp "$CSS_FILE" "$ASSETS_CSS/clientum-prospector.css"
  echo "   ✅ CSS → $ASSETS_CSS/clientum-prospector.css ($(du -sh "$ASSETS_CSS/clientum-prospector.css" | cut -f1))"
fi

# 6. Generar ZIP instalable del plugin
echo ""
echo "📦 Generando ZIP instalable..."
cd clientum-wp-theme
ZIP_NAME="clientum-ai-prospector.zip"
rm -f "$ZIP_NAME"
zip -r "$ZIP_NAME" clientum-ai-prospector/ \
  --exclude "*/dist-wp/*" \
  --exclude "*/.DS_Store" \
  --exclude "*/node_modules/*" \
  --exclude "*/src-wp/*.map" \
  2>/dev/null

ZIP_SIZE=$(du -sh "$ZIP_NAME" | cut -f1)
cd ..

echo "   ✅ ZIP → clientum-wp-theme/$ZIP_NAME ($ZIP_SIZE)"
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✅ Build completado                                         ║"
echo "║                                                              ║"
echo "║  Para instalar en WordPress:                                 ║"
echo "║  Plugins → Añadir nuevo → Subir plugin                      ║"
echo "║  → clientum-wp-theme/clientum-ai-prospector.zip             ║"
echo "║                                                              ║"
echo "║  O copiá la carpeta clientum-ai-prospector/ directamente     ║"
echo "║  a wp-content/plugins/ de tu instalación.                    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
