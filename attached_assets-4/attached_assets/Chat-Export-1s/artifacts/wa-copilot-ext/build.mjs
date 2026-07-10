/**
 * Build script for Clientum Copilot Chrome Extension
 * Compiles TypeScript sources to dist/ using esbuild, then copies static assets.
 */
import { build } from "esbuild";
import { cp, mkdir, copyFile, writeFile } from "fs/promises";
import { existsSync } from "fs";

const outDir = "dist";

await mkdir(outDir, { recursive: true });

const shared = {
  bundle: true,
  platform: "browser",
  target: "chrome120",
  minify: false,
  sourcemap: false,
  logLevel: "info",
};

// Build all entry points in parallel
await Promise.all([
  // Background service worker — ES module (Chrome MV3 supports ESM SWs)
  build({
    ...shared,
    entryPoints: ["src/background.ts"],
    outfile: `${outDir}/background.js`,
    format: "esm",
  }),

  // Content script — IIFE (must be a classic script, not ESM)
  build({
    ...shared,
    entryPoints: ["src/content.ts"],
    outfile: `${outDir}/content.js`,
    format: "iife",
    globalName: "ClientumCopilot",
  }),

  // Popup script — IIFE
  build({
    ...shared,
    entryPoints: ["src/popup.ts"],
    outfile: `${outDir}/popup.js`,
    format: "iife",
  }),
]);

// Copy static assets
await Promise.all([
  copyFile("popup.html", `${outDir}/popup.html`),
  copyFile("public/manifest.json", `${outDir}/manifest.json`),
]);

console.log("\n✅ Clientum Copilot extension built successfully → dist/");
console.log("   Load it in Chrome: chrome://extensions → Developer mode → Load unpacked → select dist/\n");
