/**
 * Build script for Clientum Copilot Chrome extension.
 * Bundles TypeScript sources into dist/ using esbuild.
 * Run: node build.mjs
 * Load unpacked from dist/ in chrome://extensions with Developer Mode on.
 */
import { build } from "esbuild";
import { rm, mkdir, copyFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(dir, "dist");

async function main() {
  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });

  // Bundle all extension scripts
  await build({
    entryPoints: {
      content: path.resolve(dir, "src/content.ts"),
      background: path.resolve(dir, "src/background.ts"),
      popup: path.resolve(dir, "src/popup.ts"),
    },
    bundle: true,
    format: "iife",
    platform: "browser",
    target: ["chrome120"],
    outdir: dist,
    logLevel: "info",
    sourcemap: process.env.NODE_ENV !== "production" ? "inline" : false,
  });

  // Copy static files
  await copyFile(path.resolve(dir, "manifest.json"), path.resolve(dist, "manifest.json"));
  await copyFile(path.resolve(dir, "popup.html"), path.resolve(dist, "popup.html"));

  console.log("\n✅ Clientum Copilot built successfully → dist/");
  console.log("   Load unpacked in chrome://extensions (Developer Mode)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
